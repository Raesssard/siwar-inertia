<?php

namespace App\Http\Controllers;

use App\Models\HistoryWarga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HistoryWargaController extends Controller
{
    public function index(Request $request)
    {
        $title = 'History Warga';

        $currentRole = session('active_role');

        // ambil nomor RW / RT dari user login
        $nomorRw = Auth::user()->rw->nomor_rw ?? null;
        $nomorRt = Auth::user()->rukunTetangga->nomor_rt ?? null;

        $search = $request->input('search');
        $jenis  = $request->input('jenis');

        // ======================
        // BASE QUERY
        // ======================
        $history = HistoryWarga::query();

        // ======================
        // FILTER ROLE
        // ======================
        if ($currentRole === 'rw') {
            $history->where('nomor_rw', $nomorRw);
        }

        if ($currentRole === 'rt') {
            $history->where('nomor_rw', $nomorRw)
                    ->where('nomor_rt', $nomorRt);
        }

        // ======================
        // FILTER SEARCH
        // ======================
        $history->when($search, function ($q) use ($search) {
            $q->where(function ($qq) use ($search) {
                $qq->where('nama', 'like', "%{$search}%")
                   ->orWhere('warga_nik', 'like', "%{$search}%");
            });
        });

        // ======================
        // FILTER JENIS
        // ======================
        $history->when($jenis, fn ($q) =>
            $q->where('jenis', $jenis)
        );

        // ======================
        // FINAL RESULT
        // ======================
        $historyWarga = $history
            ->orderBy('tanggal', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('HistoryWarga', [
            'title' => $title,
            'historyWarga' => $historyWarga,
            'filters' => [
                'search' => $search,
                'jenis'  => $jenis,
            ],
        ]);
    }
}
