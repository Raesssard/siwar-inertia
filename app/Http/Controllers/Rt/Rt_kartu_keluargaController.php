<?php

namespace App\Http\Controllers\Rt;

use App\Http\Controllers\Controller;
use App\Models\Kartu_keluarga;
use App\Models\Kategori_golongan;
use App\Models\Rt;
use App\Models\Rukun_tetangga;
use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Inertia\Inertia;

class Rt_kartu_keluargaController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->search;
        $title = 'Kartu Keluarga';

        $userRtData = Auth::user()->rukunTetangga;
        if (!$userRtData) {
            return redirect()->back()->with('error', 'Data Rukun Tetangga Anda tidak ditemukan. Mohon hubungi administrator.');
        }

        $nomorRtUser = $userRtData->nomor_rt;
        $idRwUser = $userRtData->id_rw;

        $rt_id_from_nomor = Rt::where('nomor_rt', $nomorRtUser)
            ->where('id_rw', $idRwUser)
            ->value('id');

        if (!$rt_id_from_nomor) {
            return redirect()->back()->with('error', 'Tidak dapat menemukan ID RT berdasarkan nomor RT Anda. Mohon hubungi administrator.');
        }
        $total_kk = Kartu_keluarga::where('id_rt', $rt_id_from_nomor)->count();

        $kartu_keluarga = Kartu_keluarga::with(['warga.kartuKeluarga.rukunTetangga', 'rukunTetangga', 'rw', 'warga.kartuKeluarga.rw', 'kategoriGolongan'])
            ->where('id_rt', $rt_id_from_nomor)
            ->when($search, function ($query) use ($search) {
                $query->where('alamat', 'like', '%' . $search . '%')
                    ->orWhere('no_kk', 'like', '%' . $search . '%')

                    ->orWhereHas('warga', function ($q) use ($search) {
                        $q->where('nama', 'like', '%' . $search . '%')
                            ->where('status_hubungan_dalam_keluarga', 'Kepala Keluarga');
                    });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(5)
            ->withQueryString();


        $kategori_iuran = Kategori_golongan::pluck('jenis', 'id');

        $warga = Warga::whereHas('kartuKeluarga', function ($q) use ($rt_id_from_nomor) {
            $q->where('id_rt', $rt_id_from_nomor);
        })
            ->get();

        return Inertia::render('RT/KartuKeluarga', [
            'kartu_keluarga' => $kartu_keluarga,
            'kategori_iuran' => $kategori_iuran,
            'warga' => $warga,
            'title' => $title,
            'total_kk' => $total_kk
        ]);
    }

    public function uploadFoto(Request $request, $no_kk)
    {
        try {
            $kartuKeluarga = Kartu_keluarga::where('no_kk', $no_kk)->firstOrFail();

            $request->validate([
                'kk_file' => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120',
            ]);

            $file = $request->file('kk_file');
            $originalExtension = $file->getClientOriginalExtension();
            $fileName = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $originalExtension;

            if ($kartuKeluarga->foto_kk) {
                Storage::disk('public')->delete($kartuKeluarga->foto_kk);
            }

            $path = $file->storeAs('kartu_keluarga', $fileName, 'public');

            $kartuKeluarga->foto_kk = $path;
            $kartuKeluarga->save();

            return response()->json([
                'message' => 'Dokumen Kartu Keluarga berhasil diunggah!',
                'path' => asset('storage/' . $path)
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Upload KK error: ' . $e->getMessage());
            return response()->json(['error' => 'Upload gagal', 'detail' => $e->getMessage()], 500);
        }
    }

    public function deleteFoto($no_kk)
    {
        $kartuKeluarga = Kartu_keluarga::where('no_kk', $no_kk)->firstOrFail();

        if ($kartuKeluarga->foto_kk) {
            Storage::disk('public')->delete($kartuKeluarga->foto_kk);
            $kartuKeluarga->foto_kk = null;
            $kartuKeluarga->save();
            return redirect()->back()->with('success', 'Dokumen Kartu Keluarga berhasil dihapus！');
        }
        return redirect()->back()->with('error', 'Tidak ada dokumen untuk dihapus.');
    }
}
