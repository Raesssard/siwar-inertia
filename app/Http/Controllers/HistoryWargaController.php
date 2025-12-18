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
        $idRw = Auth::user()->rw->id ?? null;
        $idRt = Auth::user()->rukunTetangga->id ?? null;

        $search = $request->input('search');
        $jenis = $request->input('jenis');

        // ======================
        // ADMIN → semua data
        // ======================
        if ($currentRole === 'admin') {
            $history = HistoryWarga::with('warga')
                ->when($search, fn ($q) =>
                    $q->where('nama', 'like', "%$search%")
                      ->orWhere('warga_nik', 'like', "%$search%")
                )
                ->when($jenis, fn ($q) =>
                    $q->where('jenis', $jenis)
                )
                ->orderBy('tanggal', 'desc');
        }

        // ======================
        // RW → semua warga di RW itu
        // ======================
        if ($currentRole === 'rw') {
            $history = HistoryWarga::with('warga')
                ->whereHas('warga.kartuKeluarga.rukunTetangga.rw', function ($q) use ($idRw) {
                    $q->where('id', $idRw);
                })
                ->when($search, fn ($q) =>
                    $q->where('nama', 'like', "%$search%")
                      ->orWhere('warga_nik', 'like', "%$search%")
                )
                ->when($jenis, fn ($q) =>
                    $q->where('jenis', $jenis)
                )
                ->orderBy('tanggal', 'desc');
        }

        // ======================
        // RT → hanya warga di RT itu
        // ======================
        if ($currentRole === 'rt') {
            $history = HistoryWarga::with('warga')
                ->whereHas('warga.kartuKeluarga.rukunTetangga', function ($q) use ($idRt) {
                    $q->where('id', $idRt);
                })
                ->when($search, fn ($q) =>
                    $q->where('nama', 'like', "%$search%")
                      ->orWhere('warga_nik', 'like', "%$search%")
                )
                ->when($jenis, fn ($q) =>
                    $q->where('jenis', $jenis)
                )
                ->orderBy('tanggal', 'desc');
        }

        $historyWarga = $history->paginate(10)->withQueryString();

        if ($request->wantsJson()) {
            return response()->json($historyWarga);
        }

        return Inertia::render('HistoryWarga', [
            'title' => $title,
            'historyWarga' => $historyWarga,
            'filters' => [
                'search' => $search,
                'jenis' => $jenis,
            ],
        ]);
    }
}
