<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\Kategori_golongan; // sesuaikan nama model jika beda
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Http\Controllers\Controller;
use App\Models\Pengaduan;
use App\Models\Pengumuman;
use App\Models\Tagihan;
use App\Models\Transaksi;

class DashboardController extends Controller
{
    public function index()
    {
        /** @var User $user */
        $user = Auth::user();
        $role = session('active_role') ?? $user->getRoleNames()->first();

        // kalo render dashboardnya di satu controller, 
        // berarti role lain gk usah buat controller dashboardnya masing masing. 
        // cukup lempar datanya dari sini 🗿

        $data = [
            'title' => 'Dashboard',
            'role' => $role,
        ];

        if ($role === 'admin') {
            $data = array_merge(
                $data,
                [
                    'jumlah_rt' => Rt::count(),
                    'jumlah_rw' => Rw::count(),
                    'jumlah_golongan' => Kategori_golongan::count(),
                    'jumlah_roles' => Role::count(),
                    'jumlah_permissions' => Permission::count(),
                ]
            );
        }

        if ($role === 'warga') {
            $userRtId = $user->warga?->kartuKeluarga?->rukunTetangga?->id ?? 1;
            $userRwId = $user->warga?->kartuKeluarga?->rw?->id ?? 1;

            $baseQuery = Pengumuman::query();

            $baseQuery->where(function ($query) use ($userRtId, $userRwId) {
                if ($userRtId) {
                    $query->where('id_rt', $userRtId);
                }

                if ($userRwId) {
                    $query->orWhere(function ($subQuery) use ($userRwId) {
                        $subQuery->where('id_rw', $userRwId)
                            ->whereNull('id_rt'); // Penting: Hanya pengumuman tingkat RW
                    });
                }
            });

            $nik = $user->nik;
            $jumlah_pengumuman = (clone $baseQuery)->count();
            $jumlah_tagihan = Tagihan::where('status_bayar', 'belum_bayar')
                ->whereIn('no_kk', function ($kk) use ($nik) {
                    $kk->select('no_kk')
                        ->from('warga')
                        ->where('nik', $nik);
                })->count();

            $total_tagihan = Tagihan::where('status_bayar', 'belum_bayar')
                ->whereIn('no_kk', function ($kk) use ($nik) {
                    $kk->select('no_kk')
                        ->from('warga')
                        ->where('nik', $nik);
                })
                ->sum('nominal');

            $transaksi = Transaksi::where('rt', $user->warga->kartuKeluarga->rukunTetangga->rt);
            $pemasukan = (clone $transaksi)->where('jenis', 'pemasukan')->sum('nominal');
            $pengeluaran = (clone $transaksi)->where('jenis', 'pengeluaran')->sum('nominal');
            $jumlah_transaksi = (clone $transaksi)->count();
            $total_transaksi = $pemasukan - $pengeluaran;

            $total_pemasukan_iuran = Tagihan::where('status_bayar', 'sudah_bayar')
                ->sum('nominal');

            $total_pemasukan_transaksi = Transaksi::where('jenis', 'pemasukan')->sum('nominal');
            $total_pengeluaran = Transaksi::where('jenis', 'pengeluaran')->sum('nominal');

            $total_pemasukan = $total_pemasukan_iuran + $total_pemasukan_transaksi;

            $total_saldo_akhir = $total_pemasukan - $total_pengeluaran;

            $data = array_merge(
                $data,
                [
                    'jumlah_pengumuman' => $jumlah_pengumuman,
                    'total_tagihan' => $total_tagihan,
                    'total_transaksi' => $total_transaksi,
                    'jumlah_tagihan' => $jumlah_tagihan,
                    'jumlah_transaksi' => $jumlah_transaksi,
                    'total_saldo_akhir' => $total_saldo_akhir,
                    'pengaduan' => Pengaduan::where('nik_warga', $nik)->count(),
                ]
            );
        }
        return Inertia::render('Dashboard', $data);
    }
}
