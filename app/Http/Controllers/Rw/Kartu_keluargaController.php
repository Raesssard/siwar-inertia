<?php

namespace App\Http\Controllers\Rw;

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

class Kartu_keluargaController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->search;
        $filterRtNomor = $request->rt;

        $userRwId = Auth::user()->id_rw;

        $kartu_keluarga_query = Kartu_keluarga::with('rukunTetangga', 'warga')
            ->whereHas('rukunTetangga', function ($q) use ($userRwId) {
                $q->where('id_rw', $userRwId);
            })
            ->when($search, function ($query) use ($search) {
                $query->where('no_kk', 'like', '%' . $search . '%')
                      ->orWhere('alamat', 'like', '%' . $search . '%')
                      ->orWhereHas('warga', function($q) use ($search) {
                          $q->where('nama', 'like', '%' . $search . '%')
                            ->where('status_hubungan_dalam_keluarga', 'Kepala Keluarga');
                      });
            })
            ->when($filterRtNomor, function ($query) use ($filterRtNomor, $userRwId) {
                $query->whereHas('rukunTetangga', function ($q) use ($filterRtNomor, $userRwId) {
                    $q->where('rt', $filterRtNomor)
                      ->where('id_rw', $userRwId);
                });
            });

        $total_kk = (clone $kartu_keluarga_query)->count();

        $kartu_keluarga = $kartu_keluarga_query->paginate(5)->withQueryString();

        $rukun_tetangga = Rt::where('id_rw', $userRwId)
            ->select('rt')
            ->distinct()
            ->orderBy('rt')
            ->get();

        $all_rukun_tetangga = Rt::where('id_rw', $userRwId)
            ->orderBy('rt')
            ->get(['id', 'rt']);

        $kategori_iuran = Kategori_golongan::all(); // Mengambil semua record
        $warga = Warga::all();
        $title = 'Kartu Keluarga';

        return view('rw.kartu-keluarga.kartu_keluarga', compact(
            'kartu_keluarga',
            'all_rukun_tetangga',
            'rukun_tetangga',
            'kategori_iuran',
            'title',
            'total_kk',
            'warga',
            'filterRtNomor'
        ));
    }

    public function create()
    {
        // Tidak digunakan karena form ada di modal pada index
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'no_registrasi' => 'nullable|unique:kartu_keluarga,no_registrasi|max:50',
                'no_kk' => 'required|unique:kartu_keluarga,no_kk|size:16',
                'alamat' => 'required|string|max:255',
                'id_rt' => 'nullable|exists:rukun_tetangga,id',
                'kelurahan' => 'required|string|max:100',
                'kecamatan' => 'required|string|max:100',
                'kabupaten' => 'required|string|max:100',
                'provinsi' => 'required|string|max:100',
                'kode_pos' => 'required|string|max:10',
                'tgl_terbit' => 'required|date',
                'kategori_iuran' => 'required|exists:kategori_golongan,id',
                'instansi_penerbit' => 'required|string|max:100',
                'kabupaten_kota_penerbit' => 'required|string|max:100',
                'nama_kepala_dukcapil' => 'required|string|max:100',
                'nip_kepala_dukcapil' => 'required|string|max:20',
            ], [
                'no_kk.unique' => 'Nomor Kartu Keluarga sudah terdaftar.',
                'no_kk.size' => 'Nomor Kartu Keluarga tidak valid.',
                'no_registrasi.unique' => 'Nomor Registrasi sudah terdaftar.',
                'no_registrasi.max' => 'Nomor Registrasi tidak boleh lebih dari 50 karakter.',
                'alamat.required' => 'Alamat harus diisi.',
                'alamat.max' => 'Alamat tidak boleh lebih dari 255 karakter.',
                'id_rt.exists' => 'RT yang dipilih tidak valid.',
                'kelurahan.required' => 'Kelurahan harus diisi.',
                'kelurahan.max' => 'Kelurahan tidak boleh lebih dari 100 karakter.',
                'kecamatan.required' => 'Kecamatan harus diisi.',
                'kecamatan.max' => 'Kecamatan tidak boleh lebih dari 100 karakter.',
                'kabupaten.required' => 'Kabupaten harus diisi.',
                'kabupaten.max' => 'Kabupaten tidak boleh lebih dari 100 karakter.',
                'provinsi.required' => 'Provinsi harus diisi.',
                'provinsi.max' => 'Provinsi tidak boleh lebih dari 100 karakter.',
                'kode_pos.required' => 'Kode Pos harus diisi.',
                'kode_pos.max' => 'Kode Pos tidak boleh lebih dari 10 karakter.',
                'tgl_terbit.required' => 'Tanggal Terbit harus diisi.',
                'tgl_terbit.date' => 'Tanggal Terbit tidak valid.',
                'kategori_iuran.required' => 'Kategori Iuran harus dipilih.',
                'kategori_iuran.exists' => 'Kategori Iuran tidak valid.',
                'instansi_penerbit.required' => 'Instansi Penerbit harus diisi.',
                'instansi_penerbit.max' => 'Instansi Penerbit tidak boleh lebih dari 100 karakter.',
                'kabupaten_kota_penerbit.required' => 'Kabupaten Kota Penerbit harus diisi.',
                'kabupaten_kota_penerbit.max' => 'Kabupaten Kota Penerbit tidak boleh lebih dari 100 karakter.',
                'nama_kepala_dukcapil.required' => 'Nama Kepala Dukcapil harus diisi.',
                'nama_kepala_dukcapil.max' => 'Nama Kepala Dukcapil tidak boleh lebih dari 100 karakter.',
                'nip_kepala_dukcapil.required' => 'NIP Kepala Dukcapil harus diisi.',
                'nip_kepala_dukcapil.max' => 'NIP Kepala Dukcapil tidak boleh lebih dari 20 karakter.',
            ]);

            $kartu_keluarga = Kartu_keluarga::create([
                'no_kk' => $request->no_kk,
                'alamat' => $request->alamat,
                'id_rt' => $request->id_rt,
                'id_rw' => Auth::user()->id_rw,
                'kelurahan' => $request->kelurahan,
                'kecamatan' => $request->kecamatan,
                'kabupaten' => $request->kabupaten,
                'provinsi' => $request->provinsi,
                'kode_pos' => $request->kode_pos,
                'tgl_terbit' => $request->tgl_terbit,
                'kategori_iuran' => $request->kategori_iuran,
                'instansi_penerbit' => $request->instansi_penerbit,
                'kabupaten_kota_penerbit' => $request->kabupaten_kota_penerbit,
                'nama_kepala_dukcapil' => $request->nama_kepala_dukcapil,
                'nip_kepala_dukcapil' => $request->nip_kepala_dukcapil,
                'no_registrasi' => $request->no_registrasi,
                'foto_kk' => null,
            ]);

            return redirect()->route('rw.kartu_keluarga.index')
                ->with('success', 'Data Kartu Keluarga berhasil disimpan. Sekarang, silakan unggah foto Kartu Keluarga.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput($request->input())
                ->with('showModal', 'kk_tambah')
                ->with('form_type', 'kk_tambah');
        }
    }

    public function show(string $id)
    {
        $kartu_keluarga = Kartu_keluarga::with('rukunTetangga', 'rw')->findOrFail($id);
        return view('rw.kartu-keluarga.show', compact('kartu_keluarga'));
    }

public function edit(string $id)
{
    $kartu_keluarga = Kartu_keluarga::findOrFail($id);
    $rukun_tetangga = Rt::where('id_rw', Auth::user()->id_rw)
        ->select('id', 'rt')
        ->orderBy('rt')
        ->get();
    $kategori_iuran = Kategori_golongan::all();

    // Debugging
    dd([
        'no_kk' => $id,
        'id_rt' => $kartu_keluarga->id_rt,
        'rukun_tetangga_count' => $rukun_tetangga->count(),
        'rukun_tetangga' => $rukun_tetangga->toArray(),
    ]);

    return view('rw.kartu-keluarga.edit', compact('kartu_keluarga', 'rukun_tetangga', 'kategori_iuran'));
}

   public function update(Request $request, string $no_kk)
{
    try {

        $request->validate([
            'no_kk' => [
                'required',
                'digits:16',
                Rule::unique('kartu_keluarga', 'no_kk')->ignore($no_kk, 'no_kk'),
            ],
            'no_registrasi' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('kartu_keluarga', 'no_registrasi')->ignore($no_kk, 'no_kk'),
            ],
            'alamat' => 'required|string|max:255',
            'id_rt' => 'nullable|exists:rukun_tetangga,id', // Tetap nullable untuk tes
            'kelurahan' => 'required|string|max:100',
            'kecamatan' => 'required|string|max:100',
            'kabupaten' => 'required|string|max:100',
            'provinsi' => 'required|string|max:100',
            'kode_pos' => 'required|string|max:10',
            'tgl_terbit' => 'required|date',
            'kategori_iuran' => 'required|exists:kategori_golongan,id',
            'instansi_penerbit' => 'required|string|max:100',
            'kabupaten_kota_penerbit' => 'required|string|max:100',
            'nama_kepala_dukcapil' => 'required|string|max:100',
            'nip_kepala_dukcapil' => 'required|string|max:20',
        ], [
            'no_kk.unique' => 'Nomor Kartu Keluarga sudah terdaftar.',
            'no_kk.digits' => 'Nomor Kartu Keluarga harus 16 digit.',
            'no_registrasi.unique' => 'Nomor Registrasi sudah terdaftar.',
            'no_registrasi.max' => 'Nomor Registrasi tidak boleh lebih dari 50 karakter.',
            'alamat.required' => 'Alamat harus diisi.',
            'alamat.max' => 'Alamat tidak boleh lebih dari 255 karakter.',
            'id_rt.exists' => 'RT yang dipilih tidak valid.', // Ubah pesan error
            'kelurahan.required' => 'Kelurahan harus diisi.',
            // ... pesan error lainnya ...
        ]);

        $kartu_keluarga = Kartu_keluarga::where('no_kk', $no_kk)->firstOrFail();

        // Jika id_rt null, gunakan nilai lama
        $id_rt = $request->id_rt ?? $kartu_keluarga->id_rt;

        $kartu_keluarga->update([
            'no_kk' => $request->no_kk,
            'alamat' => $request->alamat,
            'id_rt' => $id_rt,
            'id_rw' => Auth::user()->id_rw,
            'kelurahan' => $request->kelurahan,
            'kecamatan' => $request->kecamatan,
            'kabupaten' => $request->kabupaten,
            'provinsi' => $request->provinsi,
            'kode_pos' => $request->kode_pos,
            'tgl_terbit' => $request->tgl_terbit,
            'kategori_iuran' => $request->kategori_iuran,
            'instansi_penerbit' => $request->instansi_penerbit,
            'kabupaten_kota_penerbit' => $request->kabupaten_kota_penerbit,
            'nama_kepala_dukcapil' => $request->nama_kepala_dukcapil,
            'nip_kepala_dukcapil' => $request->nip_kepala_dukcapil,
            'no_registrasi' => $request->no_registrasi,
        ]);

        return redirect()->route('rw.kartu_keluarga.index')
            ->with('success', 'Data kartu keluarga berhasil diperbarui.');
    } catch (\Illuminate\Validation\ValidationException $e) {
        return redirect()->back()
            ->withErrors($e->errors())
            ->withInput($request->input());
    }
}

    public function destroy(string $id)
    {
        $kartu_keluarga = Kartu_keluarga::with('warga')->findOrFail($id);

        // Cek apakah masih ada warga
        if ($kartu_keluarga->warga()->exists()) {
            return redirect()->back()
                ->with('error', 'Tidak bisa menghapus KK karena masih ada data warga.');
        }

        // Hapus foto KK jika ada
        if ($kartu_keluarga->foto_kk) {
            Storage::delete('public/kartu_keluarga/' . $kartu_keluarga->foto_kk);
        }

        // Hapus KK → tagihan akan ikut terhapus otomatis karena ON DELETE CASCADE
        $kartu_keluarga->delete();

        return redirect()->back()->with('success', 'Kartu Keluarga berhasil dihapus.');
    }

    public function uploadFoto(Request $request, Kartu_keluarga $kartuKeluarga)
    {
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

        return redirect()->back()->with('success', 'Dokumen Kartu Keluarga berhasil diunggah!');
    }

    public function deleteFoto(Kartu_keluarga $kartuKeluarga)
    {
        if ($kartuKeluarga->foto_kk) {
            Storage::disk('public')->delete($kartuKeluarga->foto_kk);
            $kartuKeluarga->foto_kk = null;
            $kartuKeluarga->save();
            return redirect()->back()->with('success', 'Dokumen Kartu Keluarga berhasil dihapus!');
        }
        return redirect()->back()->with('error', 'Tidak ada dokumen untuk dihapus.');
    }
}