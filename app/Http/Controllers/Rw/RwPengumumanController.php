<?php

namespace App\Http\Controllers\Rw;
use App\Http\Controllers\Controller;

use App\Models\Pengumuman;
use App\Models\Rt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class RwPengumumanController extends Controller
{
    /**
     * Display a listing of the resource.
     */

private function indoToEnglishDay(string $day): string
    {
        $map = [
            'senin' => 'Monday', 'selasa' => 'Tuesday', 'rabu' => 'Wednesday',
            'kamis' => 'Thursday', 'jumat' => 'Friday', 'sabtu' => 'Saturday', 'minggu' => 'Sunday',
        ];
        return $map[strtolower($day)] ?? '';
    }

    public function index(Request $request)
    {
        $search = $request->input('search');
        $tahun = $request->input('tahun');
        $bulan = $request->input('bulan');
        $kategori = $request->input('kategori');

        $userRwId = Auth::check() ? Auth::user()->id_rw : null;

        if (!$userRwId) {
            // Jika user tidak login atau tidak punya id_rw, tidak ada pengumuman RW murni yang bisa ditampilkan
            $pengumuman = collect();
            $total_pengumuman = 0;
            // Opsi: redirect ke halaman login atau berikan pesan error/peringatan
        } else {
            // Filter utama: Pengumuman yang memiliki id_rw user yang login DAN id_rt-nya NULL
            $query = Pengumuman::where('id_rw', $userRwId)->whereNull('id_rt');

            $query->when($search, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('judul', 'like', '%' . $search . '%')
                      ->orWhere('isi', 'like', '%' . $search . '%');
                });
                $searchLower = strtolower($search);
                $hariList = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
                if (in_array($searchLower, $hariList)) {
                    $query->orWhereRaw("DAYNAME(tanggal) = ?", [$this->indoToEnglishDay($searchLower)]);
                }
                $bulanList = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];
                if (in_array($searchLower, $bulanList)) {
                    $bulanAngka = array_search($searchLower, $bulanList) + 1;
                    $query->orWhereMonth('tanggal', $bulanAngka);
                }
            });

            $pengumuman = $query->when($tahun, fn($q) => $q->whereYear('tanggal', $tahun))
                                ->when($bulan, fn($q) => $q->whereMonth('tanggal', $bulan))
                                ->when($kategori, fn($q) => $q->where('kategori', $kategori))
                                ->orderBy('created_at', 'desc')
                                ->paginate(5)
                                ->withQueryString();

            $total_pengumuman = Pengumuman::where('id_rw', $userRwId)->whereNull('id_rt')->count();
        }

        $title = 'Pengumuman RW';

        // Filter daftar_tahun dan daftar_kategori berdasarkan pengumuman RW murni
        $daftar_tahun_query = Pengumuman::query();
        $daftar_kategori_query = Pengumuman::query();
        if ($userRwId) {
            $daftar_tahun_query->where('id_rw', $userRwId)->whereNull('id_rt');
            $daftar_kategori_query->where('id_rw', $userRwId)->whereNull('id_rt');
        } else {
            $daftar_tahun_query->whereRaw('0 = 1'); // Return empty results
            $daftar_kategori_query->whereRaw('0 = 1'); // Return empty results
        }
        $daftar_tahun = $daftar_tahun_query->selectRaw('YEAR(tanggal) as tahun')->distinct()->orderByDesc('tahun')->pluck('tahun');
        $daftar_bulan = range(1, 12);
        $daftar_kategori = $daftar_kategori_query->select('kategori')->distinct()->pluck('kategori');

        return view('rw.pengumuman.pengumuman', compact(
            'pengumuman',
            'title',
            'daftar_tahun',
            'daftar_bulan',
            'daftar_kategori',
            'total_pengumuman'
        ));
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
     public function store(Request $request)
{
    $request->validate([
        'judul' => 'required|string|max:255',
        'isi' => 'required|string',
        'kategori' => 'required|string|max:255',
        'tanggal' => 'required|date',
        // Validasi mimes dan max Anda di sini
        'dokumen' => 'nullable|file|mimes:doc,docx,pdf|max:2048',
    ]);

    $dokumenPath = null;
    $dokumenName = null;

    if ($request->hasFile('dokumen')) {
        $file = $request->file('dokumen');
        $dokumenName = time() . '_' . $file->getClientOriginalName();

        // Pastikan Anda menyimpan ke disk 'public'
        // 'documents/pengumuman' adalah folder di dalam 'storage/app/public'
        $dokumenPath = $file->storeAs('documents/pengumuman', $dokumenName, 'public');
                                                              // ^^^^^^ Ini yang penting!
    }
    $id_rw = Auth::check() ? Auth::user()->id_rw : null;

    // Buat data pengumuman
    Pengumuman::create([
        'judul' => $request->judul,
        'isi' => $request->isi,
        'kategori' => $request->kategori,
        'tanggal' => $request->tanggal,
        'dokumen_path' => $dokumenPath, // Akan menjadi 'documents/pengumuman/namafile.docx'
        'dokumen_name' => $dokumenName,
        'id_rw' => $id_rw, // Pastikan id_rw diisi dari user yang sedang login
    ]);

    // ... redirect atau response lainnya
    return redirect()->route('rw.pengumuman.index')->with('success', 'Pengumuman berhasil ditambahkan!');
}

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
        $pengumuman = Pengumuman::findOrFail($id);
        return view('rw.pengumuman.show', compact('pengumuman'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
        $pengumuman = Pengumuman::findOrFail($id);
        return view('rw.pengumuman.edit', compact('pengumuman'));
    }

    /**
     * Update the specified resource in storage.
     */
      public function update(Request $request, string $id)
    {
        // Temukan pengumuman berdasarkan ID
        $pengumuman = Pengumuman::findOrFail($id);

        // 1. Validasi Input, termasuk dokumen
        $request->validate([
            'judul' => 'required|string|max:255',
            'kategori' => 'nullable|string|max:255',
            'isi' => 'required|string',
            'tanggal' => 'required|date',
            'dokumen' => 'nullable|file|mimes:doc,docx,pdf|max:2048',
            'hapus_dokumen_lama' => 'nullable|boolean', // Untuk checkbox hapus dokumen
        ], [
            'judul.required' => 'Judul pengumuman harus diisi.',
            'isi.required' => 'Isi pengumuman harus diisi.',
            'tanggal.required' => 'Tanggal pengumuman harus diisi.',
            'kategori.string' => 'Kategori harus berupa teks.',
            'dokumen.file' => 'Input dokumen harus berupa file.',
            'dokumen.mimes' => 'Format dokumen harus .doc, .docx, atau .pdf.',
            'dokumen.max' => 'Ukuran dokumen tidak boleh melebihi 2MB.',
        ]);

        $dataToUpdate = [
            'judul' => $request->judul,
            'kategori' => $request->kategori,
            'isi' => $request->isi,
            'tanggal' => $request->tanggal,
        ];

        // 2. Tangani Unggahan Dokumen Baru atau Penghapusan Dokumen Lama
        if ($request->hasFile('dokumen')) {
            // Jika ada dokumen baru diunggah:
            // a. Hapus dokumen lama jika ada dan valid
            if ($pengumuman->dokumen_path && Storage::disk('public')->exists($pengumuman->dokumen_path)) {
                Storage::disk('public')->delete($pengumuman->dokumen_path);
            }

            // b. Simpan dokumen baru ke disk 'public'
            $file = $request->file('dokumen');
            $dokumenName = time() . '_' . $file->getClientOriginalName();
            $dokumenPath = $file->storeAs('documents/pengumuman', $dokumenName, 'public'); // Simpan ke disk 'public'

            // c. Perbarui path dan nama dokumen di data yang akan diupdate
            $dataToUpdate['dokumen_path'] = $dokumenPath;
            $dataToUpdate['dokumen_name'] = $dokumenName;
        } elseif ($request->boolean('hapus_dokumen_lama')) {
            // Jika tidak ada file baru diunggah TAPI checkbox "hapus_dokumen_lama" dicentang:
            // a. Hapus dokumen lama dari storage jika ada dan valid
            if ($pengumuman->dokumen_path && Storage::disk('public')->exists($pengumuman->dokumen_path)) {
                Storage::disk('public')->delete($pengumuman->dokumen_path);
            }
            // b. Setel path dan nama dokumen di database menjadi null
            $dataToUpdate['dokumen_path'] = null;
            $dataToUpdate['dokumen_name'] = null;
        }
        // Jika tidak ada file baru dan checkbox hapus tidak dicentang,
        // maka dokumen_path dan dokumen_name tidak akan berubah,
        // yang berarti dokumen lama akan dipertahankan.

        // 3. Perbarui Entri Pengumuman di Database
        $pengumuman->update($dataToUpdate);

        return redirect()->route('rw.pengumuman.index')->with('success', 'Pengumuman berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
        $pengumuman = Pengumuman::findOrFail($id);
        $pengumuman->delete();
        return redirect()->route('rw.pengumuman.index')->with('success', 'Pengumuman berhasil dihapus.');
    }

    public function export($id)
    {
        $pengumuman = Pengumuman::findOrFail($id);

        // Tentukan jenis (RT / RW)
        $jenis = $pengumuman->id_rt ? 'RT' : 'RW';

        $pdf = Pdf::loadView('export.pengumuman', [
            'pengumuman' => $pengumuman,
            'jenis' => $jenis
        ])->setPaper('A4', 'portrait');

        return $pdf->download("Pengumuman-{$jenis}-{$pengumuman->id}.pdf");
    }
}
