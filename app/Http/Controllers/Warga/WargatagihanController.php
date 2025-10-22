<?php

namespace App\Http\Controllers\Warga;

use App\Http\Controllers\Controller;
use App\Models\Tagihan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WargatagihanController extends Controller
{

    /**
     * Menampilkan daftar tagihan untuk warga yang sedang login.
     */
    public function index(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $title = 'Tagihan';
        if (!$user || !$user->hasRole('warga') || !$user->warga) {
            Log::warning("Akses tidak sah ke halaman tagihan warga atau data warga tidak ditemukan.", ['user_id' => $user->id ?? 'guest']);
            return redirect('/')->with('error', 'Anda tidak memiliki akses ke halaman ini atau data profil Anda tidak lengkap.');
        }

        $no_kk_warga = $user->warga->no_kk;

        if (!$no_kk_warga) {
            Log::warning("Nomor Kartu Keluarga tidak ditemukan untuk warga yang login.", ['user_id' => $user->id, 'nik' => $user->nik]);
            return redirect('/')->with('error', 'Data Kartu Keluarga Anda tidak ditemukan. Silakan hubungi RT/RW Anda.');
        }

        $tagihanSudahDibayar = Tagihan::where('no_kk', $no_kk_warga)
            ->where('status_bayar', 'sudah_bayar')
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($sub) use ($search) {
                    $sub->where('nama', 'like', "%$search%")
                        ->orWhere('nominal', 'like', "%$search%");
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'sudah_page');

        $tagihanBelumDibayar = Tagihan::where('no_kk', $no_kk_warga)
            ->where('status_bayar', 'belum_bayar')
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($sub) use ($search) {
                    $sub->where('nama', 'like', "%$search%")
                        ->orWhere('nominal', 'like', "%$search%");
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'belum_page');

        return Inertia::render('Warga/Tagihan', [
            'title' => $title,
            'tagihanSudahDibayar' => $tagihanSudahDibayar,
            'tagihanBelumDibayar' => $tagihanBelumDibayar
        ]);
    }
}
