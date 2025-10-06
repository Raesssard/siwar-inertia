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

        $query = Transaksi::where('rt', $idRt); // Filter transaksi berdasarkan id_rt dari KK

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nama_transaksi', 'like', '%' . $search . '%')
                    ->orWhere('keterangan', 'like', '%' . $search . '%');
            });
        }

        $transaksi = $query->orderBy('tanggal', 'desc')->orderBy('id', 'desc')->paginate(10);

        return Inertia::render('Warga/Transaksi', [
            'title' => $title,
            'transaksi' => $transaksi
        ]);
    }
}
