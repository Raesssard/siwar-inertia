<?php

namespace App\Http\Controllers\Warga;

use App\Http\Controllers\Controller;
use App\Models\Kartu_keluarga;
use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LihatKKController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $nikUserLogin = $user->nik;

        $warga = Warga::where('nik', $nikUserLogin)->first();

        $kartuKeluarga = null;

        if ($warga) {
            $kartuKeluarga = Kartu_keluarga::with('warga', 'rukunTetangga', 'rw')
                ->where('no_kk', $warga->no_kk)
                ->first();
        }

        $title = 'Data Kartu Keluarga';

        return Inertia::render('Warga/KartuKeluarga', [
            'title' => $title,
            'kartuKeluarga' => $kartuKeluarga,
            'error' => $kartuKeluarga ? null : 'Data Kartu Keluarga Anda belum tersedia atau tidak ditemukan. Silakan hubungi RT/RW Anda.',
        ]);
    }
}
