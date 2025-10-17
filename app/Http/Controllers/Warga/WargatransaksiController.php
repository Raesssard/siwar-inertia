<?php

namespace App\Http\Controllers\Warga;

use App\Http\Controllers\Controller;
use App\Models\Transaksi;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WargatransaksiController extends Controller
{
    public function index(Request $request)
    {
        $title = 'Transaksi';
        /** @var User $user */
        $user = Auth::user();
        $search = $request->input('search');
        $tahun = $request->input('tahun');
        $bulan = $request->input('bulan');

        // Cek akses dan data warga serta kartu keluarga
        if (!$user || !$user->hasRole('warga') || !$user->warga || !$user->warga->kartuKeluarga || !$user->warga->kartuKeluarga->rukunTetangga) {
            Log::warning("Akses tidak sah ke halaman transaksi warga atau data RT/KK tidak ditemukan.", ['user_id' => $user->id ?? 'guest']);
            return redirect('/')->with('error', 'Anda tidak memiliki akses ke halaman ini atau data RT/KK Anda tidak lengkap.');
        }

        // Ambil id_rt dari kartu_keluarga yang terkait dengan user
        $idRt = $user->warga->kartuKeluarga->rukunTetangga->id;

        if (!$idRt) {
            Log::warning("ID RT tidak ditemukan untuk user login saat melihat transaksi.", ['user_id' => $user->id, 'id_rt' => $idRt]);
            return redirect('/')->with('error', 'Data RT Anda tidak ditemukan. Silakan hubungi RT/RW Anda.');
        }

        $query = Transaksi::where('rt', $idRt)
            ->when($search, fn($q) => $q->where('nama_transaksi', 'like', '%' . $search . '%'))
            ->when($tahun, fn($q) => $q->whereYear('tanggal', $tahun))
            ->when($bulan, fn($q) => $q->whereMonth('tanggal', $bulan));

        $transaksi = $query->orderBy('tanggal', 'desc')->orderBy('id', 'desc')->paginate(10);


        $daftar_tahun = Transaksi::selectRaw('YEAR(tanggal) as tahun')
            ->distinct()
            ->orderBy('tahun', 'desc')
            ->pluck('tahun');

        $daftar_bulan = [
            'januari',
            'februari',
            'maret',
            'april',
            'mei',
            'juni',
            'juli',
            'agustus',
            'september',
            'oktober',
            'november',
            'desember'
        ];

        return Inertia::render('Warga/Transaksi', [
            'title' => $title,
            'transaksi' => $transaksi,
            'daftar_tahun' => $daftar_tahun,
            'daftar_bulan' => $daftar_bulan,
        ]);
    }
}
