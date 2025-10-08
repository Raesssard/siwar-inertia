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

class Rt_kartu_keluargaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->search;
        $title = 'Kartu Keluarga';

        // Pastikan user RT memiliki data di tabel rukun_tetangga
        $userRtData = Auth::user()->rukunTetangga;
        if (!$userRtData) {
            return redirect()->back()->with('error', 'Data Rukun Tetangga Anda tidak ditemukan. Mohon hubungi administrator.');
        }

        // Ambil NOMOR RT dan ID RW dari data user RT yang login
        $nomorRtUser = $userRtData->rt; // Nomor RT (misal: '001')
        $idRwUser = $userRtData->id_rw; // ID RW yang terkait dengan RT ini

        // Dapatkan ID RT dari tabel rukun_tetangga berdasarkan nomor RT dan ID RW user yang login
        // Ini memastikan kita mendapatkan ID yang benar untuk RT tersebut
        $rt_id_from_nomor = Rt::where('rt', $nomorRtUser)
            ->where('id_rw', $idRwUser)
            ->value('id');

        if (!$rt_id_from_nomor) {
            return redirect()->back()->with('error', 'Tidak dapat menemukan ID RT berdasarkan nomor RT Anda. Mohon hubungi administrator.');
        }

        // Total KK di RT yang sesuai dengan nomor RT user yang login
        $total_kk = Kartu_keluarga::where('id_rt', $rt_id_from_nomor)->count();

        // Query untuk Kartu Keluarga: Hanya tampilkan KK yang id_rt-nya sesuai dengan RT pengguna
        $kartu_keluarga = Kartu_keluarga::with(['warga', 'rukunTetangga'])
            ->where('id_rt', $rt_id_from_nomor) // Filter berdasarkan ID RT yang ditemukan dari nomor RT
            ->when($search, function ($query) use ($search) {
                $query->where('alamat', 'like', '%' . $search . '%')
                    ->orWhere('no_kk', 'like', '%' . $search . '%')
                    // Tambahkan pencarian berdasarkan nama kepala keluarga
                    ->orWhereHas('warga', function ($q) use ($search) {
                        $q->where('nama', 'like', '%' . $search . '%')
                            ->where('status_hubungan_dalam_keluarga', 'Kepala Keluarga');
                    });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(5)
            ->withQueryString();

        // Kategori golongan
        $kategori_iuran = Kategori_golongan::pluck('jenis', 'id');

        // Query untuk Warga: Hanya tampilkan warga yang kartu keluarganya ada di RT yang sesuai
        $warga = Warga::whereHas('kartuKeluarga', function ($q) use ($rt_id_from_nomor) {
            $q->where('id_rt', $rt_id_from_nomor);
        })
            ->get();

        return view('rt.kartu-keluarga.kartu_keluarga', compact(
            'kartu_keluarga',
            'kategori_iuran',
            'warga',
            'title',
            'total_kk'
        ));
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $kategori_iuran = Kategori_golongan::pluck('jenis', 'id');
        $title = 'Tambah Kartu Keluarga';
        return view('rt.kartu_keluarga.create', compact('kategori_golongan', 'title'));
    }

    /**
     * Store a newly created resource in storage.
     */
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
                'kategori_iuran' => ['required', Rule::in(Kategori_golongan::getEnumNama())],
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
                'id_rt' => Auth::user()->id_rt,
                'id_rw' => Auth::user()->rukunTetangga->id_rw,
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
                'foto_kk_path' => null, // Pastikan ini null saat pertama kali dibuat
            ]);

            return redirect()->route('rt.kartu_keluarga.index')
                ->with('success', 'Data Kartu Keluarga berhasil disimpan. Sekarang, silakan unggah foto Kartu Keluarga.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput($request->input())
                ->with('showModal', 'kk_tambah')
                ->with('form_type', 'kk_tambah');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $kartu_keluarga = Kartu_keluarga::findOrFail($id);
        $this->authorizeRt($kartu_keluarga);

        return view('rt.kartu_keluarga.show', compact('kartu_keluarga'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $kartu_keluarga = Kartu_keluarga::findOrFail($id);
        $this->authorizeRt($kartu_keluarga);

        $kategori_iuran = Kategori_golongan::pluck('jenis', 'id');
        $title = 'Edit Kartu Keluarga';

        return view('rt.kartu_keluarga.edit', compact('kartu_keluarga', 'kategori_golongan', 'title'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $no_kk)
    {
        try {
            // 1. Validasi input dari request
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
                    Rule::unique('kartu_keluarga', 'no_registrasi')->ignore($no_kk, 'no_kk'), // Abaikan no_registrasi yang saat ini diupdate
                ],
                'alamat' => 'required|string|max:255',
                'id_rt' => 'nullable|exists:rukun_tetangga,id',
                'kelurahan' => 'required|string|max:100',
                'kecamatan' => 'required|string|max:100',
                'kabupaten' => 'required|string|max:100',
                'provinsi' => 'required|string|max:100',
                'kode_pos' => 'required|string|max:10',
                'tgl_terbit' => 'required|date',
                'kategori_iuran' => ['required', Rule::in(Kategori_golongan::pluck('id')->toArray())],
                'instansi_penerbit' => 'required|string|max:100',
                'kabupaten_kota_penerbit' => 'required|string|max:100',
                'nama_kepala_dukcapil' => 'required|string|max:100',
                'nip_kepala_dukcapil' => 'required|string|max:20',
                // HAPUS VALIDASI 'foto_kk' DI SINI JIKA DIEDIT TERPISAH
            ], [
                // Pesan error validasi (sudah ada)
            ]);

            $kartu_keluarga = Kartu_keluarga::where('no_kk', $no_kk)->firstOrFail();

            $kartu_keluarga->update([
                'no_kk' => $request->no_kk,
                'alamat' => $request->alamat,
                'id_rt' => Auth::user()->id_rt,
                'id_rw' => Auth::user()->rukunTetangga->id_rw,
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
                // 'foto_kk_path' tidak diubah di sini
            ]);

            return redirect()->route('rt.kartu_keluarga.index')
                ->with('success', 'Data kartu keluarga berhasil diperbarui.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput($request->input());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $kartu_keluarga = Kartu_keluarga::with('warga')->findOrFail($id);

        // Hapus semua warga yang terkait dengan KK ini
        foreach ($kartu_keluarga->warga as $warga) {
            $warga->delete();
        }

        // Hapus file KK dari storage jika ada
        if ($kartu_keluarga->foto_kk) {
            Storage::delete('public/kartu_keluarga/' . $kartu_keluarga->foto_kk);
        }

        // Hapus data KK
        $kartu_keluarga->delete();

        return redirect()->back()->with('success', 'KK dan semua anggota keluarganya berhasil dihapus.');
    }

    public function uploadFoto(Request $request, $no_kk)
    {
        $kartuKeluarga = Kartu_keluarga::where('no_kk', $no_kk)->firstOrFail();
        $request->validate([
            'kk_file' => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120', // Validasi file: gambar atau PDF, maks 5MB
        ]);

        $file = $request->file('kk_file'); // Gunakan 'kk_file' sesuai nama input
        $originalExtension = $file->getClientOriginalExtension();
        $fileName = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $originalExtension;

        // Hapus dokumen lama jika ada
        if ($kartuKeluarga->foto_kk) {
            // Pastikan path yang dihapus sesuai dengan yang disimpan di DB
            Storage::disk('public')->delete($kartuKeluarga->foto_kk);
        }

        // Simpan di disk 'public' di dalam folder 'kartu_keluarga'
        $path = $file->storeAs('kartu_keluarga', $fileName, 'public');

        // Simpan path relatif ke database (contoh: 'kartu_keluarga/nama_file_anda.ext')
        $kartuKeluarga->foto_kk = $path;
        $kartuKeluarga->save();

        return redirect()->back()->with('success', 'Dokumen Kartu Keluarga berhasil diunggah!');
    }

    public function deleteFoto($no_kk)
    {
        $kartuKeluarga = Kartu_keluarga::where('no_kk', $no_kk)->firstOrFail();

        if ($kartuKeluarga->foto_kk) {
            Storage::disk('public')->delete($kartuKeluarga->foto_kk);
            $kartuKeluarga->foto_kk = null;
            $kartuKeluarga->save();
            return redirect()->back()->with('success', 'Dokumen Kartu Keluarga berhasil dihapus!');
        }
        return redirect()->back()->with('error', 'Tidak ada dokumen untuk dihapus.');
    }

    /**
     * Pastikan user RT hanya bisa mengelola KK di RT-nya.
     */
    private function authorizeRt(Kartu_keluarga $kartu_keluarga)
    {
        if ($kartu_keluarga->id_rt != Auth::user()->id_rt) {
            abort(403, 'Anda tidak berhak mengakses data ini.');
        }
    }
}
