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

        // --- Query Manual
        $tagihanManual = Tagihan::where('no_kk', $no_kk_warga)
            ->where('jenis', 'manual')
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($sub) use ($search) {
                    $sub->where('nama', 'like', "%$search%")
                        ->orWhere('nominal', 'like', "%$search%");
                });
            })
            ->orderBy('tgl_tagih', 'desc')
            ->paginate(10, ['*'], 'manual_page');

        // --- Query Otomatis
        $tagihanOtomatis = Tagihan::where('no_kk', $no_kk_warga)
            ->where('jenis', 'otomatis')
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($sub) use ($search) {
                    $sub->where('nama', 'like', "%$search%")
                        ->orWhere('nominal', 'like', "%$search%");
                });
            })
            ->orderBy('tgl_tagih', 'desc')
            ->paginate(10, ['*'], 'otomatis_page');

        return Inertia::render('Warga/Tagihan', [
            'title' => $title,
            'tagihanManual' => $tagihanManual,
            'tagihanOtomatis' => $tagihanOtomatis
        ]);
    }
}
