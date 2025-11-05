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
use App\Models\Kartu_keluarga;
use App\Models\Pengaduan;
use App\Models\Pengumuman;
use App\Models\Tagihan;
use App\Models\Transaksi;
use App\Models\Warga;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class AnalisisController extends Controller
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
            $jumlah_warga = Warga::count();
            $jumlah_kk = Kartu_keluarga::count();
            $jumlah_rt = Rt::count();
            $jumlah_rw = Rw::count();
            $jumlah_pengumuman = Pengumuman::count();
            $jumlah_pengaduan = Pengaduan::count();
            $jumlah_golongan = Kategori_golongan::count();
            $jumlah_roles = Role::count();
            $jumlah_permissions = Permission::count();

            $data = array_merge(
                $data,
                [
                    'jumlah_warga' => $jumlah_warga,
                    'jumlah_warga_penduduk' => Warga::where('status_warga', 'penduduk')->count(),
                    'jumlah_warga_pendatang' => Warga::where('status_warga', 'pendatang')->count(),
                    'jumlah_kk' => $jumlah_kk,
                    'jumlah_rt' => $jumlah_rt,
                    'jumlah_rw' => $jumlah_rw,
                    'jumlah_pengumuman' => $jumlah_pengumuman,
                    'jumlah_pengaduan' => $jumlah_pengaduan,
                    'jumlah_golongan' => $jumlah_golongan,
                    'jumlah_roles' => $jumlah_roles,
                    'jumlah_permissions' => $jumlah_permissions,
                ]
            );
        }

        if ($role === 'rt') {
            $rt_user_login_id = Auth::user()->rukunTetangga->id;
            $rwId = Auth::user()->rukunTetangga->id_rw;

            $kk_nomor_list = Kartu_keluarga::where('id_rt', $rt_user_login_id)->pluck('no_kk');

            $jumlah_warga = Warga::whereIn('no_kk', $kk_nomor_list)->count();

            $jumlah_kk = Kartu_keluarga::where('id_rt', $rt_user_login_id)->count();


            $jumlah_pengumuman = Pengumuman::where(function ($q) use ($rt_user_login_id, $rwId) {
                $q->where('id_rt', $rt_user_login_id)
                    ->orWhere(function ($q2) use ($rwId) {
                        $q2->whereNull('id_rt')
                            ->where('id_rw', $rwId);
                    });
            })->count();

            $user = Auth::user();

            $pengaduan_rt = $user->rukunTetangga->nomor_rt;

            $pengaduan_rt_saya = Pengaduan::WhereHas('warga.kartuKeluarga.rukunTetangga', function ($aduan) use ($pengaduan_rt) {
                $aduan->where('level', 'rt')->where('nomor_rt', $pengaduan_rt);
            })->count();

            $jumlah_warga_penduduk = Warga::where('status_warga', 'penduduk')
                ->whereIn('no_kk', $kk_nomor_list)
                ->count();

            $jumlah_warga_pendatang = Warga::where('status_warga', 'pendatang')
                ->whereIn('no_kk', $kk_nomor_list)
                ->count();
            $rt = Transaksi::where('rt', Auth::user()->rukunTetangga->nomor_rt);
            $total_pemasukan = (clone $rt)->where('jenis', 'pemasukan')->sum('nominal');
            $pengeluaran = (clone $rt)->where('jenis', 'pengeluaran')->sum('nominal');
            $total_saldo_akhir = $total_pemasukan - $pengeluaran;

            $data = array_merge(
                $data,
                [
                    'jumlah_warga' => $jumlah_warga,
                    'jumlah_warga_penduduk' => $jumlah_warga_penduduk,
                    'jumlah_warga_pendatang' => $jumlah_warga_pendatang,
                    'jumlah_kk' => $jumlah_kk,
                    'jumlah_pengumuman' => $jumlah_pengumuman,
                    'pengaduan_rt_saya' => $pengaduan_rt_saya,
                    'total_pemasukan' => $total_pemasukan,
                    'pengeluaran' => $pengeluaran,
                    'total_saldo_akhir' => $total_saldo_akhir,
                ]
            );
        }

        if ($role === 'rw') {
            $id_rw = Auth::user()->id_rw;
            $id_rt = Auth::user()->id_rt;
            $user = Auth::user();

            $pengaduan_rw = $user->rw->nomor_rw;

            $pengaduan_rw_saya = Pengaduan::WhereHas('warga.kartuKeluarga.rw', function ($aduan) use ($pengaduan_rw) {
                $aduan->where('konfirmasi_rw', '!=', 'belum')->where('nomor_rw', $pengaduan_rw);
            })->count();

            $jumlah_warga = Warga::count();
            $jumlah_kk = Kartu_keluarga::count();

            $pengumuman_rw = Pengumuman::where('id_rw', $id_rw)
                ->whereNull('id_rt')
                ->count();

            $pengumuman_rt = Pengumuman::where('id_rw', $id_rw)
                ->where('id_rt', $id_rt)
                ->count();

            $jumlah_rt = Rt::count();

            // Total pemasukan dari iuran yang sudah dibayar
            $total_pemasukan_iuran = Tagihan::where('status_bayar', 'sudah_bayar')
                ->sum('nominal');

            // Total pemasukan & pengeluaran dari tabel transaksi
            $total_pemasukan_transaksi = Transaksi::where('jenis', 'pemasukan')->sum('nominal');
            $total_pengeluaran = Transaksi::where('jenis', 'pengeluaran')->sum('nominal');

            // Total pemasukan keseluruhan
            $total_pemasukan = $total_pemasukan_iuran + $total_pemasukan_transaksi;

            // Saldo akhir
            $total_saldo_akhir = $total_pemasukan - $total_pengeluaran;

            // Total iuran masuk bulan ini
            $total_iuran_bulan_ini = Tagihan::where('status_bayar', 'sudah_bayar')
                ->whereMonth('updated_at', Carbon::now()->month)
                ->whereYear('updated_at', Carbon::now()->year)
                ->sum('nominal');

            $jumlah_warga_penduduk = Warga::where('status_warga', 'penduduk')->count();
            $jumlah_warga_pendatang = Warga::where('status_warga', 'pendatang')->count();

            $pengaduan = $pengaduan_rw_saya;

            $data = array_merge(
                $data,
                [
                    'jumlah_warga' => $jumlah_warga,
                    'jumlah_kk' => $jumlah_kk,
                    'pengumuman_rw' => $pengumuman_rw,
                    'pengumuman_rt' => $pengumuman_rt,
                    'jumlah_warga_penduduk' => $jumlah_warga_penduduk,
                    'jumlah_warga_pendatang' => $jumlah_warga_pendatang,
                    'jumlah_rt' => $jumlah_rt,
                    'total_pemasukan' => $total_pemasukan,
                    'total_pengeluaran' => $total_pengeluaran,
                    'total_saldo_akhir' => $total_saldo_akhir,
                    'total_iuran_bulan_ini' => $total_iuran_bulan_ini,
                    'pengaduan' => $pengaduan,
                ]
            );
        }

        return Inertia::render('Analisis', $data);
    }
}
