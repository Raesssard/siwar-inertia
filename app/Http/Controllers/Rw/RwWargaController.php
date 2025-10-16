<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Warga;
use App\Models\HistoryWarga;
use Carbon\Carbon;
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
        $rw_id = Auth::user()->rw->id;

        $total_warga = Warga::whereHas('kartuKeluarga.rukunTetangga', function ($query) use ($rw_id) {
            $query->where('id_rw', $rw_id);
        })->count();

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

    public function create()
    {
        $title = 'Tambah Warga';
        return Inertia::render('Rw/FormWarga', [
            'title' => $title,
            'warga' => null,
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
            'keterangan' => 'Warga baru ditambahkan',
            'tanggal' => Carbon::now()->toDateString(),
        ]);

        return redirect()->route('rw.warga.index')->with('success', 'Warga berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $title = 'Edit Data Warga';
        $warga = Warga::findOrFail($id);
        return Inertia::render('Rw/FormWarga', [
            'title' => $title,
            'warga' => $warga,
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
            'alamat_asal' => 'nullable|string',
            'alamat_domisili' => 'nullable|string',
            'tanggal_mulai_tinggal' => 'nullable|date',
            'tujuan_pindah' => 'nullable|string',
        ]);

        $warga->update($validated);

        return redirect()->route('rw.warga.index')->with('success', 'Data warga berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $warga = Warga::findOrFail($id);

        HistoryWarga::create([
            'warga_nik' => $warga->nik,
            'nama' => $warga->nama,
            'jenis' => 'keluar',
            'keterangan' => 'Data warga dihapus',
            'tanggal' => now()->toDateString(),
        ]);

        $warga->delete();

        return redirect()->route('rw.warga.index')->with('success', 'Warga berhasil dihapus dan dicatat ke history.');
    }
}
