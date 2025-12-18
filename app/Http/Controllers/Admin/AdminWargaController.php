<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Admin\AdminKartuKeluargaController;
use App\Models\Warga;
use App\Models\Kartu_keluarga;
use App\Models\HistoryWarga;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminWargaController extends Controller
{
    public function index(Request $request)
    {
        $title = 'Manajemen Warga';
        $search = $request->search;
        $jenis_kelamin = $request->jenis_kelamin;

        $total_warga = Warga::count();

        $warga = Warga::with(['kartuKeluarga', 'kartuKeluarga.rukunTetangga', 'kartuKeluarga.rw'])
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
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/DataWarga', [
            'title' => $title,
            'warga' => $warga,
            'search' => $search,
            'total_warga' => $total_warga,
        ]);
    }

    public function create(Request $request)
    {
        $title = 'Tambah Warga';
        $noKK = $request->query('no_kk'); 
        $wargaList = [];

        if ($noKK) {
            $wargaList = Warga::where('no_kk', $noKK)->get();
        }

        $daftarKK = Kartu_keluarga::select('no_kk', 'alamat')
            ->orderBy('no_kk')
            ->get();

        return Inertia::render('FormWarga', [
            'title' => $title,
            'role' => 'admin',
            'warga' => null,
            'noKK' => $noKK,
            'wargaList' => $wargaList,
            'daftarKK' => $daftarKK,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nik' => 'required|unique:warga,nik|digits:16',
            'no_kk' => 'required|exists:kartu_keluarga,no_kk',
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:laki-laki,perempuan',
            'tempat_lahir' => 'required|string',
            'tanggal_lahir' => 'required|date',
            'agama' => 'required|string',
            'pendidikan' => 'required|string',
            'pekerjaan' => 'required|string',
            'status_perkawinan' => 'required|in:belum menikah,menikah,cerai_hidup,cerai_mati',
            'status_hubungan_dalam_keluarga' => 'required|in:kepala keluarga,istri,anak',
            'golongan_darah' => 'nullable|in:A,B,AB,O',
            'kewarganegaraan' => 'required|in:WNI,WNA',
            // 'nama_ayah' => 'required|string',
            // 'nama_ibu' => 'required|string',
            'status_warga' => 'required|in:penduduk,pendatang',

            // 'no_paspor' => 'nullable|string|max:50',
            // 'tgl_terbit_paspor' => 'nullable|date',
            // 'tgl_berakhir_paspor' => 'nullable|date',
            // 'no_kitas' => 'nullable|string|max:50',
            // 'tgl_terbit_kitas' => 'nullable|date',
            // 'tgl_berakhir_kitas' => 'nullable|date',
            // 'no_kitap' => 'nullable|string|max:50',
            // 'tgl_terbit_kitap' => 'nullable|date',
            // 'tgl_berakhir_kitap' => 'nullable|date',

            'alamat_asal' => 'nullable|string',
            'alamat_domisili' => 'nullable|string',
            'tanggal_mulai_tinggal' => 'nullable|date',
            'tujuan_pindah' => 'nullable|string',
        ],
        [
            'nik.unique' => 'NIK tidak boleh sama / sudah terdaftar.',
            'nik.digits' => 'NIK harus terdiri dari 16 digit.',
            'nik.required' => 'NIK wajib diisi.',
        ]);

        if ($validated['status_hubungan_dalam_keluarga'] === 'kepala keluarga') {

            $cekKK = Warga::where('no_kk', $validated['no_kk'])
                ->where('status_hubungan_dalam_keluarga', 'kepala keluarga')
                ->first();

            if ($cekKK) {
                return back()->withErrors([
                    'status_hubungan_dalam_keluarga' =>
                        "Dalam KK {$validated['no_kk']} sudah ada Kepala Keluarga: {$cekKK->nama}"
                ])->withInput();
            }
        }

        $warga = Warga::create($validated);
        // Hitung umur berdasarkan tanggal lahir
        $usiaHari = Carbon::parse($warga->tanggal_lahir)->diffInDays(now());

        // Tentukan keterangan history
        $keterangan = $usiaHari < 365
            ? 'Bayi baru lahir'
            : 'Warga baru ditambahkan';

        HistoryWarga::create([
            'warga_nik' => $warga->nik,
            'nama' => $warga->nama,
            'jenis' => 'masuk',
            'keterangan' => $keterangan,
            'tanggal' => now()->toDateString(),
        ]);

        if ($warga->status_hubungan_dalam_keluarga === 'kepala keluarga') {

            if (!User::where('nik', $warga->nik)->exists()) {

                $kk = Kartu_keluarga::where('no_kk', $warga->no_kk)->first();

                $id_rt = $kk ? $kk->id_rt : null;
                $id_rw = $kk ? $kk->id_rw : null;

                User::create([
                    'nik'      => $warga->nik,
                    'nama'     => $warga->nama,
                    'password' => Hash::make('password'),
                    'id_rt'    => $id_rt,
                    'id_rw'    => $id_rw,
                ])->assignRole('warga'); 
            }
        }

            return redirect('admin.kartu_keluarga.index')->with('success', 'Warga berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $title = 'Edit Data Warga';
        $warga = Warga::findOrFail($id);
        $daftarKK = Kartu_keluarga::select('no_kk', 'alamat')->orderBy('no_kk')->get();

        return Inertia::render('FormWarga', [
            'title' => $title,
            'role' => 'admin',
            'warga' => $warga,
            'daftarKK' => $daftarKK,
        ]);
    }

    public function update(Request $request, $id)
    {

        $warga = Warga::findOrFail($id);
        $kk_lama = $warga->no_kk; 

        $validated = $request->validate([
            'nik' => 'required|digits:16|unique:warga,nik,' . $id,
            'no_kk' => 'required|exists:kartu_keluarga,no_kk',
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:laki-laki,perempuan',
            'tempat_lahir' => 'required|string',
            'tanggal_lahir' => 'required|date',
            'agama' => 'required|string',
            'pendidikan' => 'required|string',
            'pekerjaan' => 'required|string',
            'status_perkawinan' => 'required|in:belum menikah,menikah,cerai_hidup,cerai_mati',
            'status_hubungan_dalam_keluarga' => 'required|in:kepala keluarga,istri,anak',
            'golongan_darah' => 'nullable|in:A,B,AB,O',
            'kewarganegaraan' => 'required|in:WNI,WNA',
            // 'nama_ayah' => 'required|string',
            // 'nama_ibu' => 'required|string',
            'status_warga' => 'required|in:penduduk,pendatang',

            // 'no_paspor' => 'nullable|string|max:50',
            // 'tgl_terbit_paspor' => 'nullable|date',
            // 'tgl_berakhir_paspor' => 'nullable|date',
            // 'no_kitas' => 'nullable|string|max:50',
            // 'tgl_terbit_kitas' => 'nullable|date',
            // 'tgl_berakhir_kitas' => 'nullable|date',
            // 'no_kitap' => 'nullable|string|max:50',
            // 'tgl_terbit_kitap' => 'nullable|date',
            // 'tgl_berakhir_kitap' => 'nullable|date',

            'alamat_asal' => 'nullable|string',
            'alamat_domisili' => 'nullable|string',
            'tanggal_mulai_tinggal' => 'nullable|date',
            'tujuan_pindah' => 'nullable|string',
        ],
        [
            'nik.unique' => 'NIK tidak boleh sama / sudah terdaftar.',
            'nik.digits' => 'NIK harus terdiri dari 16 digit.',
            'nik.required' => 'NIK wajib diisi.',
        ]);


        $kk_baru = $validated['no_kk'];
        $status_baru = $validated['status_hubungan_dalam_keluarga'];
        $status_lama = $warga->status_hubungan_dalam_keluarga;

        if ($status_baru === 'kepala keluarga') {

            if ($kk_baru == $kk_lama) {

                $kepala = Warga::where('no_kk', $kk_baru)
                    ->where('status_hubungan_dalam_keluarga', 'kepala keluarga')
                    ->where('id', '!=', $warga->id)
                    ->first();

                if ($kepala) {
                    return back()->with('error', "KK $kk_baru sudah memiliki Kepala Keluarga!")
                        ->withInput();
                }

            } else {
                $kepala = Warga::where('no_kk', $kk_baru)
                    ->where('status_hubungan_dalam_keluarga', 'kepala keluarga')
                    ->first();

                if ($kepala) {
                    return back()->with('error', "KK $kk_baru sudah memiliki Kepala Keluarga!")
                        ->withInput();
                }
            }
        }

        if ($kk_baru !== $kk_lama) {
            $validated['no_kk_lama'] = $kk_lama;
        } else {
            unset($validated['no_kk_lama']);
        }

        $warga->update($validated);

        if ($status_baru === 'kepala keluarga' && $status_lama !== 'kepala keluarga') {

            $existingUser = User::where('nik', $warga->nik)->first();

            $kk = Kartu_keluarga::where('no_kk', $kk_baru)->first();

            if (!$existingUser) {
                $existingUser = User::create([
                    'nik'      => $warga->nik,
                    'nama'     => $warga->nama,
                    'password' => Hash::make('password'),
                    'id_rt'    => $kk->id_rt,
                    'id_rw'    => $kk->id_rw,
                ]);

                $existingUser->assignRole('warga');

            } else {

                $existingUser->update([
                    'id_rt' => $kk->id_rt,
                    'id_rw' => $kk->id_rw,
                ]);

                if (!$existingUser->hasRole('warga')) {
                    $existingUser->assignRole('warga');
                }
            }
        }


            return redirect('admin.kartu_keluarga.index')->with('success', 'Data warga berhasil diperbarui.');
    }

    public function destroy(Request $request, $id)
    {
        $warga = Warga::findOrFail($id);

        HistoryWarga::create([
            'warga_nik' => $warga->nik,
            'nama' => $warga->nama,
            'jenis' => 'keluar',
            'keterangan' => $request->keterangan,
            'tanggal' => now(),
        ]);

        $warga->delete();

        return back()->with('success', 'Warga berhasil dihapus dan dicatat ke history.');
    }
}
