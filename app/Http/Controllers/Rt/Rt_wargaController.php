<?php

namespace App\Http\Controllers\Rt;

use App\Http\Controllers\Controller;
use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class Rt_wargaController extends Controller
{
    public function index(Request $request)
    {
        //
        $title = 'Manajemen Warga';
        $search = $request->search;
        $rt_id = Auth::user()->rukunTetangga->id;
        $jenis_kelamin = $request->jenis_kelamin;
        $total_warga = Warga::whereHas('kartuKeluarga', function ($query) use ($rt_id) {
            $query->where('id_rt', $rt_id);
        })->count();

        $warga = Warga::with(['kartuKeluarga', 'kartuKeluarga.rukunTetangga', 'kartuKeluarga.rw'])
            ->whereHas('kartuKeluarga', function ($query) {
                $query->where('id_rt', Auth::user()->id_rt);
            })
            ->when($search, function ($query) use ($search) {
                $query->where('nama', 'like', '%' . $search . '%')
                    ->orWhere('nik', 'like', '%' . $search . '%')
                    ->orWhere('no_kk', 'like', '%' . $search . '%');
            })
            ->when($jenis_kelamin, function ($kelamin) use ($jenis_kelamin) {
                $kelamin->where('jenis_kelamin', $jenis_kelamin);
            })
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('RT/DataWarga', [
            'title' => $title,
            'warga' => $warga,
            'search' => $search,
            'total_warga' => $total_warga
        ]);
    }
}
