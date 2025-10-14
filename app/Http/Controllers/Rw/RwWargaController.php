<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RwWargaController extends Controller
{
    public function index(Request $request)
    {
        $title = 'Manajemen Warga';
        $search = $request->search;
        $jenis_kelamin = $request->jenis_kelamin;
        $rw_id = Auth::user()->rw->id; // ambil ID RW user login

        // Hitung total warga di semua RT di bawah RW ini
        $total_warga = Warga::whereHas('kartuKeluarga.rukunTetangga', function ($query) use ($rw_id) {
            $query->where('id_rw', $rw_id);
        })->count();

        // Ambil daftar warga (relasi lengkap)
        $warga = Warga::with(['kartuKeluarga', 'kartuKeluarga.rukunTetangga', 'kartuKeluarga.rw'])
            ->whereHas('kartuKeluarga.rukunTetangga', function ($query) use ($rw_id) {
                $query->where('id_rw', $rw_id);
            })
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%")
                      ->orWhere('nik', 'like', "%{$search}%")
                      ->orWhere('no_kk', 'like', "%{$search}%");
                });
            })
            ->when($jenis_kelamin, function ($query) use ($jenis_kelamin) {
                $query->where('jenis_kelamin', $jenis_kelamin);
            })
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('Rw/DataWarga', [
            'title' => $title,
            'warga' => $warga,
            'search' => $search,
            'total_warga' => $total_warga,
        ]);
    }
}
