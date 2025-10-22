<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kartu_keluarga;
use App\Models\Kategori_golongan;
use App\Models\Rt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminKartuKeluargaController extends Controller
{
    public function index(Request $request)
    {
        $title = 'Manajemen Kartu Keluarga (Admin)';
        $search = $request->search;

        $total_kk = Kartu_keluarga::count();

        $kartu_keluarga = Kartu_keluarga::with(['warga', 'rukunTetangga.rw', 'rw', 'kategoriGolongan'])
            ->when($search, function ($query) use ($search) {
                $query->where('alamat', 'like', "%{$search}%")
                    ->orWhere('no_kk', 'like', "%{$search}%")
                    ->orWhereHas('warga', function ($q) use ($search) {
                        $q->where('nama', 'like', "%{$search}%")
                            ->where('status_hubungan_dalam_keluarga', 'kepala keluarga');
                    });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $kategori_iuran = Kategori_golongan::select('id', 'jenis')->get();
        $daftar_rt = Rt::select('id', 'nomor_rt', 'id_rw')->with('rw')->get();

        return Inertia::render('Admin/KartuKeluargaWarga', [
            'kartu_keluarga' => $kartu_keluarga,
            'kategori_iuran' => $kategori_iuran,
            'daftar_rt' => $daftar_rt,
            'title' => $title,
            'total_kk' => $total_kk
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'no_kk' => 'required|digits:16|unique:kartu_keluarga,no_kk',
                'no_registrasi' => 'required|string|max:255',
                'alamat' => 'required|string',
                'id_rt' => 'nullable|exists:rt,id',
                'kelurahan' => 'required|string|max:255',
                'kecamatan' => 'required|string|max:255',
                'kabupaten' => 'required|string|max:255',
                'provinsi' => 'required|string|max:255',
                'kode_pos' => 'required|string|max:10',
                'tgl_terbit' => 'required|date',
                'kategori_iuran' => 'required|exists:kategori_golongan,id',
                'instansi_penerbit' => 'nullable|string|max:255',
                'kabupaten_kota_penerbit' => 'nullable|string|max:255',
                'nama_kepala_dukcapil' => 'nullable|string|max:255',
                'nip_kepala_dukcapil' => 'nullable|string|max:255',
            ]);

            // id_rw dan id_rt NULL di admin
            $validated['id_rw'] = null;

            Kartu_keluarga::create($validated);

            return back()->with('success', 'Kartu Keluarga berhasil ditambahkan!');
        } catch (\Exception $e) {
            Log::error('Admin gagal menambahkan KK: ' . $e->getMessage());
            return back()->with('error', 'Gagal menambahkan data KK.');
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $kk = Kartu_keluarga::findOrFail($id);

            $validated = $request->validate([
                'no_kk' => 'required|digits:16|unique:kartu_keluarga,no_kk,' . $kk->id,
                'no_registrasi' => 'required|string|max:255',
                'alamat' => 'required|string',
                'id_rt' => 'nullable|exists:rt,id',
                'kelurahan' => 'required|string|max:255',
                'kecamatan' => 'required|string|max:255',
                'kabupaten' => 'required|string|max:255',
                'provinsi' => 'required|string|max:255',
                'kode_pos' => 'required|string|max:10',
                'tgl_terbit' => 'required|date',
                'kategori_iuran' => 'required|exists:kategori_golongan,id',
            ]);

            $validated['id_rw'] = null;

            $kk->update($validated);
            return back()->with('success', 'Kartu Keluarga berhasil diperbarui!');
        } catch (\Exception $e) {
            Log::error('Admin gagal update KK: ' . $e->getMessage());
            return back()->with('error', 'Gagal memperbarui data KK.');
        }
    }

    public function destroy($id)
    {
        try {
            $kk = Kartu_keluarga::findOrFail($id);

            if ($kk->foto_kk) {
                Storage::disk('public')->delete($kk->foto_kk);
            }

            $kk->delete();
            return back()->with('success', 'Kartu Keluarga berhasil dihapus!');
        } catch (\Exception $e) {
            Log::error('Admin gagal hapus KK: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus data KK.');
        }
    }
}
