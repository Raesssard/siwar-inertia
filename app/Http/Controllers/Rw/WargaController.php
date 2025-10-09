<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Kartu_keluarga;
use App\Models\Rukun_tetangga;
use App\Models\User;
use App\Models\Warga;
use App\Models\HistoryWarga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class WargaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
     public function index(Request $request)
    {
        $title = 'Manajemen Warga';
        $search = $request->input('search');
        $filterJenisKelamin = $request->jenis_kelamin;
        $filterRT = $request->rt; // Ambil filter RT dari request

        $id_rw = Auth::user()->id_rw; // Dapatkan id_rw dari user yang sedang login

        // Dapatkan daftar RT yang relevan untuk dropdown filter
        $rukun_tetangga_filter = Rukun_tetangga::whereHas('jabatan', function ($q) {
                $q->where('nama_jabatan', 'ketua');
            })
            ->where('id_rw', $id_rw)
            ->select('rt')
            ->distinct()
            ->orderBy('rt')
            ->get();

        // Query utama untuk data warga
        $warga = Warga::with(['kartuKeluarga.rukunTetangga']) // Eager load nested relasi
            ->when($search, function ($query, $search) {
                $query->where('warga.nama', 'like', '%' . $search . '%')
                    ->orWhere('warga.nik', 'like', '%' . $search . '%')
                    ->orWhere('warga.no_kk', 'like', '%' . $search . '%');
            })
            ->when($filterJenisKelamin, function ($query) use ($filterJenisKelamin) {
                $query->where('warga.jenis_kelamin', $filterJenisKelamin);
            })
            // Tambahkan filter berdasarkan RT jika ada
            ->when($filterRT, function ($query) use ($filterRT) {
                $query->whereHas('kartuKeluarga.rukunTetangga', function ($q) use ($filterRT) {
                    $q->where('rt', $filterRT);
                });
            })
            // Filter warga berdasarkan id_rw dari user yang login (melalui KK dan RT)
            ->whereHas('kartuKeluarga.rukunTetangga', function ($query) use ($id_rw) {
                $query->where('id_rw', $id_rw);
            })
            ->orderBy('warga.no_kk')
            ->orderBy('warga.nama')
            ->paginate(10)
            ->withQueryString(); // Memastikan parameter query tetap ada saat paginasi

        $total_warga = Warga::whereHas('kartuKeluarga.rukunTetangga', function ($query) use ($id_rw) {
            $query->where('id_rw', $id_rw);
        })->count();

        // Variabel-variabel ini mungkin tidak perlu di-pass ke view jika hanya digunakan untuk dropdown filter atau tujuan lain yang sudah dicakup.
        // Namun, jika view memang membutuhkannya, biarkan saja. Saya akan biarkan untuk menjaga kompatibilitas.
        $rukun_tetangga = Rukun_tetangga::all(); // Ini mungkin digunakan untuk dropdown RT keseluruhan
        $kartu_keluarga = Kartu_keluarga::all(); // Ini mungkin digunakan untuk dropdown No KK keseluruhan

        return view('rw.warga.warga', compact(
            'warga',
            'title',
            'kartu_keluarga',
            'rukun_tetangga',
            'total_warga',
            'search',
            'filterJenisKelamin',
            'rukun_tetangga_filter',
            'filterRT' // Sertakan filterRT agar bisa dipertahankan di form filter
        ));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nik' => 'required|unique:warga,nik|max:16',
            'no_kk' => 'required|exists:kartu_keluarga,no_kk|max:16',
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:laki-laki,perempuan',
            'tempat_lahir' => 'required|string|max:255',
            'tanggal_lahir' => 'required|date',
            'agama' => 'required|string|max:255',
            'pendidikan' => 'required|string|max:255',
            'pekerjaan' => 'required|string|max:255',
            'status_perkawinan' => 'required|string|max:255',
            'status_hubungan_dalam_keluarga' => 'required|in:kepala keluarga,istri,anak',
            'golongan_darah' => 'required|in:A,B,AB,O',
            'kewarganegaraan' => 'required',
            'nama_ayah' => 'required|string|max:255',
            'nama_ibu' => 'required|string|max:255',
            'status_warga' => 'required|in:penduduk,pendatang',
            'no_paspor' => 'nullable|string|unique:warga,no_paspor',
            'tgl_terbit_paspor' => 'nullable|date',
            'tgl_berakhir_paspor' => 'nullable|date',
            'no_kitas' => 'nullable|string|unique:warga,no_kitas',
            'tgl_terbit_kitas' => 'nullable|date',
            'tgl_berakhir_kitas' => 'nullable|date',
            'no_kitap' => 'nullable|string|unique:warga,no_kitap',
            'tgl_terbit_kitap' => 'nullable|date',
            'tgl_berakhir_kitap' => 'nullable|date',
            // Tambahan khusus pendatang
            'alamat_asal' => 'nullable|string|max:255',
            'alamat_domisili' => 'nullable|string|max:255',
            'tanggal_mulai_tinggal' => 'nullable|date',
            'tujuan_pindah' => 'nullable|string|max:255',
        ], [
            'nik.unique' => 'NIK sudah terdaftar.',
            'no_kk.exists' => 'Nomor KK tidak ditemukan.',
            'no_paspor.unique' => 'Nomor Paspor sudah terdaftar.',
            'no_kitas.unique' => 'Nomor KITAS sudah terdaftar.',
            'no_kitap.unique' => 'Nomor KITAP sudah terdaftar.',
            'tgl_terbit_paspor.date' => 'Tanggal terbit paspor harus berupa tanggal yang valid.',
            'tgl_berakhir_paspor.date' => 'Tanggal berakhir paspor harus berupa tanggal yang valid.',
            'tgl_terbit_kitas.date' => 'Tanggal terbit KITAS harus berupa tanggal yang valid.',
            'tgl_berakhir_kitas.date' => 'Tanggal berakhir KITAS harus berupa tanggal yang valid.',
            'tgl_terbit_kitap.date' => 'Tanggal terbit KITAP harus berupa tanggal yang valid.',
            'tgl_berakhir_kitap.date' => 'Tanggal berakhir KITAP harus berupa tanggal yang valid.',
            'jenis_kelamin.in' => 'Jenis kelamin harus laki-laki atau perempuan.',
            'status_hubungan_dalam_keluarga.in' => 'Status hubungan dalam keluarga harus kepala keluarga, istri, atau anak.',
            'golongan_darah.in' => 'Golongan darah harus A, B, AB, atau O.',
            'kewarganegaraan.required' => 'Kewarganegaraan harus diisi.',
            'status_warga.in' => 'Status warga harus penduduk atau pendatang.',
            'nama_ayah.required' => 'Nama ayah harus diisi.',
            'nama_ibu.required' => 'Nama ibu harus diisi.',
            'nama.required' => 'Nama harus diisi.',
            'tempat_lahir.required' => 'Tempat lahir harus diisi.',
            'tanggal_lahir.required' => 'Tanggal lahir harus diisi.',
            'agama.required' => 'Agama harus diisi.',
            'pendidikan.required' => 'Pendidikan harus diisi.',
            'pekerjaan.required' => 'Pekerjaan harus diisi.',
            'status_perkawinan.required' => 'Status perkawinan harus diisi.',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput()
                ->with('showModal', 'tambah');
        }

        $kk = Kartu_keluarga::where('no_kk', $request->no_kk)->firstOrFail();

        // Cek apakah KK ini sudah memiliki kepala keluarga
        if ($request->status_hubungan_dalam_keluarga === 'kepala keluarga') {
            $existingKepala = Warga::where('no_kk', $request->no_kk)
                ->where('status_hubungan_dalam_keluarga', 'kepala keluarga')
                ->exists();

            if ($existingKepala) {
                return redirect()->back()
                    ->withErrors(['status_hubungan_dalam_keluarga' => 'Nomor KK ini sudah memiliki Kepala Keluarga.'])
                    ->withInput()
                    ->with('showModal', 'tambah');
            }
        }

        // Buat warga baru
        $warga = Warga::create([
            'nik' => $request->nik,
            'no_kk' => $request->no_kk,
            'nama' => $request->nama,
            'jenis_kelamin' => $request->jenis_kelamin,
            'tempat_lahir' => $request->tempat_lahir,
            'tanggal_lahir' => $request->tanggal_lahir,
            'agama' => $request->agama,
            'pendidikan' => $request->pendidikan,
            'pekerjaan' => $request->pekerjaan,
            'status_perkawinan' => $request->status_perkawinan,
            'status_hubungan_dalam_keluarga' => $request->status_hubungan_dalam_keluarga,
            'golongan_darah' => $request->golongan_darah,
            'kewarganegaraan' => $request->kewarganegaraan,
            'nama_ayah' => $request->nama_ayah,
            'nama_ibu' => $request->nama_ibu,
            'status_warga' => $request->status_warga,
            'no_paspor' => $request->no_paspor,
            'tgl_terbit_paspor' => $request->tgl_terbit_paspor,
            'tgl_berakhir_paspor' => $request->tgl_berakhir_paspor,
            'no_kitas' => $request->no_kitas,
            'tgl_terbit_kitas' => $request->tgl_terbit_kitas,
            'tgl_berakhir_kitas' => $request->tgl_berakhir_kitas,
            'no_kitap' => $request->no_kitap,
            'tgl_terbit_kitap' => $request->tgl_terbit_kitap,
            'tgl_berakhir_kitap' => $request->tgl_berakhir_kitap,
            'alamat_asal' => $request->alamat_asal,
            'alamat_domisili' => $request->alamat_domisili,
            'tanggal_mulai_tinggal' => $request->tanggal_mulai_tinggal,
            'tujuan_pindah' => $request->tujuan_pindah,
        ]);

        HistoryWarga::create([
            'warga_nik' => $warga->nik,
            'jenis' => 'masuk',
            'keterangan' => 'Warga baru ditambahkan dengan NIK ' . $warga->nik,
            'tanggal' => now(),
        ]);

        // Buat user hanya jika status kepala keluarga
        if ($request->status_hubungan_dalam_keluarga === 'kepala keluarga') {
            $user = User::create([
                'nik' => $request->nik,
                'nama' => $request->nama,
                'password' => Hash::make('password'),
                'id_rt' => $kk->id_rt,
                'id_rw' => $kk->id_rw,
            ]);

            $user->assignRole('warga');
        }

        return redirect()->to($request->redirect_to)->with('success', 'Data Warga Berhasil Ditambahkan');
    }

    /**
     * Show the specified resource.
     */
    public function show(string $id)
    {
        $warga = Warga::findOrFail($id);
        return view('rw.warga.show', compact('warga'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $warga = Warga::findOrFail($id);
        return view('rw.warga.edit', compact('warga'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $nik)
    {
        $validator = Validator::make($request->all(), [
            'nik' => [
                'required',
                'digits:16',
                Rule::unique('warga', 'nik')->ignore($nik, 'nik'),
            ],
            'no_kk' => 'required|exists:kartu_keluarga,no_kk|max:16',
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:laki-laki,perempuan',
            'tempat_lahir' => 'required|string|max:255',
            'tanggal_lahir' => 'required|date',
            'agama' => 'required|string|max:255',
            'pendidikan' => 'required|string|max:255',
            'pekerjaan' => 'required|string|max:255',
            'status_perkawinan' => 'required|string|max:255',
            'status_hubungan_dalam_keluarga' => 'required|in:kepala keluarga,istri,anak',
            'golongan_darah' => 'required|in:A,B,AB,O',
            'kewarganegaraan' => 'required',
            'nama_ayah' => 'required|string|max:255',
            'nama_ibu' => 'required|string|max:255',
            'status_warga' => 'required|in:penduduk,pendatang',
            'no_paspor' => [
                'nullable',
                'string',
                Rule::unique('warga', 'no_paspor')->ignore($nik, 'nik'),
            ],
            'no_kitas' => [
                'nullable',
                'string',
                Rule::unique('warga', 'no_kitas')->ignore($nik, 'nik'),
            ],
            'no_kitap' => [
                'nullable',
                'string',
                Rule::unique('warga', 'no_kitap')->ignore($nik, 'nik'),
            ],
            'tgl_terbit_paspor' => 'nullable|date',
            'tgl_berakhir_paspor' => 'nullable|date',
            'tgl_terbit_kitas' => 'nullable|date',
            'tgl_berakhir_kitas' => 'nullable|date',
            'tgl_terbit_kitap' => 'nullable|date',
            'tgl_berakhir_kitap' => 'nullable|date',

            // Tambahan khusus pendatang
            'alamat_asal' => 'nullable|string|max:255',
            'alamat_domisili' => 'nullable|string|max:255',
            'tanggal_mulai_tinggal' => 'nullable|date',
            'tujuan_pindah' => 'nullable|string|max:255',
        ], [
            'nik.unique' => 'NIK sudah terdaftar.',
            'no_kk.exists' => 'Nomor KK tidak ditemukan.',
            'no_paspor.unique' => 'Nomor Paspor sudah terdaftar.',
            'no_kitas.unique' => 'Nomor KITAS sudah terdaftar.',
            'no_kitap.unique' => 'Nomor KITAP sudah terdaftar.',
            'tgl_terbit_paspor.date' => 'Tanggal terbit paspor harus berupa tanggal yang valid.',
            'tgl_berakhir_paspor.date' => 'Tanggal berakhir paspor harus berupa tanggal yang valid.',
            'tgl_terbit_kitas.date' => 'Tanggal terbit KITAS harus berupa tanggal yang valid.',
            'tgl_berakhir_kitas.date' => 'Tanggal berakhir KITAS harus berupa tanggal yang valid.',
            'tgl_terbit_kitap.date' => 'Tanggal terbit KITAP harus berupa tanggal yang valid.',
            'tgl_berakhir_kitap.date' => 'Tanggal berakhir KITAP harus berupa tanggal yang valid.',
            'jenis_kelamin.in' => 'Jenis kelamin harus laki-laki atau perempuan.',
            'status_hubungan_dalam_keluarga.in' => 'Status hubungan dalam keluarga harus kepala keluarga, istri, atau anak.',
            'golongan_darah.in' => 'Golongan darah harus A, B, AB, atau O.',
            'kewarganegaraan.required' => 'Kewarganegaraan harus diisi.',
            'status_warga.in' => 'Status warga harus penduduk atau pendatang.',
            'nama_ayah.required' => 'Nama ayah harus diisi.',
            'nama_ibu.required' => 'Nama ibu harus diisi.',
            'nama.required' => 'Nama harus diisi.',
            'tempat_lahir.required' => 'Tempat lahir harus diisi.',
            'tanggal_lahir.required' => 'Tanggal lahir harus diisi.',
            'agama.required' => 'Agama harus diisi.',
            'pendidikan.required' => 'Pendidikan harus diisi.',
            'pekerjaan.required' => 'Pekerjaan harus diisi.',
            'status_perkawinan.required' => 'Status perkawinan harus diisi.',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput()
                ->with('open_edit_modal', $nik);
        }

        $warga = Warga::where('nik', $nik)->firstOrFail();
        $kk = Kartu_keluarga::where('no_kk', $request->no_kk)->firstOrFail();

        // ===== Cek logika kepala keluarga =====
        if ($request->status_hubungan_dalam_keluarga === 'kepala keluarga') {
            $existingKepala = Warga::where('no_kk', $request->no_kk)
                ->where('status_hubungan_dalam_keluarga', 'kepala keluarga')
                ->where('nik', '!=', $nik) // abaikan dirinya sendiri
                ->exists();

            if ($existingKepala) {
                return redirect()->back()
                    ->withErrors(['status_hubungan_dalam_keluarga' => 'Nomor KK ini sudah memiliki Kepala Keluarga.'])
                    ->withInput()
                    ->with('open_edit_modal', $nik);
            }
        }

        $warga->update([
            'nik' => $request->nik,
            'no_kk' => $request->no_kk,
            'nama' => $request->nama,
            'jenis_kelamin' => $request->jenis_kelamin,
            'tempat_lahir' => $request->tempat_lahir,
            'tanggal_lahir' => $request->tanggal_lahir,
            'agama' => $request->agama,
            'pendidikan' => $request->pendidikan,
            'pekerjaan' => $request->pekerjaan,
            'status_perkawinan' => $request->status_perkawinan,
            'status_hubungan_dalam_keluarga' => $request->status_hubungan_dalam_keluarga,
            'golongan_darah' => $request->golongan_darah,
            'kewarganegaraan' => $request->kewarganegaraan,
            'nama_ayah' => $request->nama_ayah,
            'nama_ibu' => $request->nama_ibu,
            'status_warga' => $request->status_warga,
            'no_paspor' => $request->no_paspor,
            'tgl_terbit_paspor' => $request->tgl_terbit_paspor,
            'tgl_berakhir_paspor' => $request->tgl_berakhir_paspor,
            'no_kitas' => $request->no_kitas,
            'tgl_terbit_kitas' => $request->tgl_terbit_kitas,
            'tgl_berakhir_kitas' => $request->tgl_berakhir_kitas,
            'no_kitap' => $request->no_kitap,
            'tgl_terbit_kitap' => $request->tgl_terbit_kitap,
            'tgl_berakhir_kitap' => $request->tgl_berakhir_kitap,
            'alamat_asal' => $request->alamat_asal,
            'alamat_domisili' => $request->alamat_domisili,
            'tanggal_mulai_tinggal' => $request->tanggal_mulai_tinggal,
            'tujuan_pindah' => $request->tujuan_pindah,
        ]);

    if ($request->status_hubungan_dalam_keluarga === 'kepala keluarga') {
        // kalau belum ada user, buat
        $user = User::firstOrNew(['nik' => $request->nik]);
        $user->nama = $request->nama;
        $user->id_rt = $kk->id_rt;
        $user->id_rw = $kk->id_rw;
        if (!$user->exists) {
            $user->password = Hash::make('password');
        }
        $user->save();
        $user->assignRole('warga');
    } else {
        // kalau sebelumnya kepala keluarga, hapus user
        if ($warga->user) {
            $warga->user->delete();
        }
    }

    return redirect()->to($request->redirect_to)->with('success', 'Data Warga Berhasil Diperbarui');
}

    /**
     * Remove the specified resource from storage.
     */
public function destroy(Request $request, string $nik)
{
    try {
        // Cari data warga
        $warga = Warga::where('nik', $nik)->firstOrFail();

        HistoryWarga::create([
            'warga_nik'  => $warga->nik,
            'nama'       => $warga->nama,
            'jenis'      => 'keluar',
            'keterangan' => $request->keterangan ?? 'Tidak ada keterangan',
            'tanggal'    => now(),
        ]);

        // Cari user berdasarkan NIK
        $user = User::where('nik', $nik)->first();
        if ($user) {
            // Cek jumlah role
            if ($user->roles()->count() > 1) {
                // Hapus hanya role 'warga'
                $user->removeRole('warga');
            } else {
                // Kalau hanya punya role 'warga', hapus user
                $user->delete();
            }
        }

        // Hapus data warga
        $warga->delete();

        return redirect()
            ->back()
            ->with('success', "Warga {$warga->nama} berhasil dihapus dan dicatat ke history.");
    } catch (\Exception $e) {
        return redirect()
            ->back()
            ->with('error', 'Gagal menghapus warga: ' . $e->getMessage());
    }
}
}
