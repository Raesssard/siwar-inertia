<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Admin\AdminKartuKeluargaController;
use App\Models\Warga;
use App\Models\Kartu_keluarga;
use App\Models\HistoryWarga;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminWargaController extends Controller
{
    // public function index(Request $request)
    // {
    //     $title = 'Manajemen Warga';
    //     $search = $request->search;
    //     $jenis_kelamin = $request->jenis_kelamin;

    //     $total_warga = Warga::count();

    //     $warga = Warga::with(['kartuKeluarga', 'kartuKeluarga.rukunTetangga', 'kartuKeluarga.rw'])
    //         ->when($search, function ($query) use ($search) {
    //             $query->where(function ($q) use ($search) {
    //                 $q->where('nama', 'like', "%{$search}%")
    //                   ->orWhere('nik', 'like', "%{$search}%")
    //                   ->orWhere('no_kk', 'like', "%{$search}%");
    //             });
    //         })
    //         ->when($jenis_kelamin, function ($query) use ($jenis_kelamin) {
    //             $query->where('jenis_kelamin', $jenis_kelamin);
    //         })
    //         ->paginate(10)
    //         ->withQueryString();

    //     return Inertia::render('Admin/DataWarga', [
    //         'title' => $title,
    //         'warga' => $warga,
    //         'search' => $search,
    //         'total_warga' => $total_warga,
    //     ]);
    // }

    public function create(Request $request)
    {
        $title = 'Tambah Warga';
        $noKK = $request->query('no_kk'); // dari URL
        $wargaList = [];

        if ($noKK) {
            // Ambil semua warga dengan nomor KK (autofill ayah & ibu)
            $wargaList = Warga::where('no_kk', $noKK)->get();
        }

        // Ambil daftar KK untuk dropdown (semua karena admin)
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
            'nama_ayah' => 'required|string',
            'nama_ibu' => 'required|string',
            'status_warga' => 'required|in:penduduk,pendatang',

            // Tambahan WNA
            'no_paspor' => 'nullable|string|max:50',
            'tgl_terbit_paspor' => 'nullable|date',
            'tgl_berakhir_paspor' => 'nullable|date',
            'no_kitas' => 'nullable|string|max:50',
            'tgl_terbit_kitas' => 'nullable|date',
            'tgl_berakhir_kitas' => 'nullable|date',
            'no_kitap' => 'nullable|string|max:50',
            'tgl_terbit_kitap' => 'nullable|date',
            'tgl_berakhir_kitap' => 'nullable|date',

            // Tambahan Pendatang
            'alamat_asal' => 'nullable|string',
            'alamat_domisili' => 'nullable|string',
            'tanggal_mulai_tinggal' => 'nullable|date',
            'tujuan_pindah' => 'nullable|string',
        ]);

        $warga = Warga::create($validated);

        HistoryWarga::create([
            'warga_nik' => $warga->nik,
            'nama' => $warga->nama,
            'jenis' => 'masuk',
            'keterangan' => 'Warga baru ditambahkan oleh admin',
            'tanggal' => Carbon::now()->toDateString(),
        ]);


        return response()->json([
                'success' => true,
                'message' => 'Tagihan sudah diperbarui.',
                'warga'=> $warga
        ]);

        return redirect()->route('admin.Kartu_keluarga.index')->with('success', 'Warga berhasil ditambahkan.');
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
            'nama_ayah' => 'required|string',
            'nama_ibu' => 'required|string',
            'status_warga' => 'required|in:penduduk,pendatang',

            // Tambahan WNA
            'no_paspor' => 'nullable|string|max:50',
            'tgl_terbit_paspor' => 'nullable|date',
            'tgl_berakhir_paspor' => 'nullable|date',
            'no_kitas' => 'nullable|string|max:50',
            'tgl_terbit_kitas' => 'nullable|date',
            'tgl_berakhir_kitas' => 'nullable|date',
            'no_kitap' => 'nullable|string|max:50',
            'tgl_terbit_kitap' => 'nullable|date',
            'tgl_berakhir_kitap' => 'nullable|date',

            // Tambahan Pendatang
            'alamat_asal' => 'nullable|string',
            'alamat_domisili' => 'nullable|string',
            'tanggal_mulai_tinggal' => 'nullable|date',
            'tujuan_pindah' => 'nullable|string',
        ]);

        $kkExists = Kartu_keluarga::where('no_kk', $validated['no_kk'])->exists();
        if (!$kkExists) {
            return back()->with('error', 'Nomor KK tujuan belum terdaftar di sistem.');
        }

        // 🔄 Jika no_kk berubah, simpan no_kk lama
        if ($warga->no_kk !== $validated['no_kk']) {
            $validated['no_kk_lama'] = $warga->no_kk;
        }
        
        $warga->update($validated);

        return redirect()->route('admin.kartu_keluarga.index')->with('success', 'Data warga berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $warga = Warga::findOrFail($id);

        HistoryWarga::create([
            'warga_nik' => $warga->nik,
            'nama' => $warga->nama,
            'jenis' => 'keluar',
            'keterangan' => 'Data warga dihapus oleh admin',
            'tanggal' => now()->toDateString(),
        ]);

        $warga->delete();

        return redirect()->route('admin.kartu_keluarga.index')->with('success', 'Warga berhasil dihapus dan dicatat ke history.');
    }
}
