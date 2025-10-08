<?php

namespace App\Http\Controllers\Rt;

use App\Http\Controllers\Controller;
use App\Models\Pengumuman;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Rukun_tetangga;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\Storage; // <-- Tambahkan baris ini!
use Illuminate\Support\Facades\View;

class Rt_pengumumanController extends Controller
{
    /**
     * Tampilkan daftar pengumuman milik RT yang login (berdasarkan nomor RT).
     */
    public function index(Request $request)
    {
        $title = 'Pengumuman RT'; // Judul yang lebih spesifik

        $search = $request->input('search');
        $tahun = $request->input('tahun');
        $bulan = $request->input('bulan');
        $kategori = $request->input('kategori');

        // Pastikan user RT memiliki data di tabel rukun_tetangga
        $userRtData = Auth::user()->rukunTetangga; // Mengambil data rukun_tetangga terkait user
        if (!$userRtData) {
            // Handle jika user tidak terhubung dengan data RT
            // Ini bisa terjadi jika id_rt di tabel users tidak valid
            return redirect()->back()->with('error', 'Data Rukun Tetangga Anda tidak ditemukan. Mohon hubungi administrator.');
        }

        // --- Ambil NOMOR RT dan ID RW dari data user RT yang login ---
        // Ini adalah kunci perbaikan
        $nomorRtUser = $userRtData->rt; // Nomor RT (misal: '01')
        $idRwUser = $userRtData->id_rw; // ID RW yang terkait dengan RT ini

        // Query dasar untuk pengumuman:
        // 1. Pengumuman yang dibuat oleh RT dengan nomor yang sama (dari RW yang sama)
        // 2. ATAU Pengumuman yang dibuat oleh RW dari RT ini (yang tidak memiliki id_rt)
        $query = Pengumuman::where(function ($q) use ($nomorRtUser, $idRwUser) {
            // Pengumuman yang dibuat oleh RT dengan nomor yang sama (dari RW yang sama)
            // Kita perlu join ke tabel rukun_tetangga untuk memfilter berdasarkan 'rt'
            $q->whereHas('rukunTetangga', function ($q2) use ($nomorRtUser, $idRwUser) {
                $q2->where('rt', $nomorRtUser)
                    ->where('id_rw', $idRwUser);
            })
                // ATAU Pengumuman yang dibuat oleh RW dari RT ini (yang tidak memiliki id_rt)
                ->orWhere(function ($q2) use ($idRwUser) {
                    $q2->whereNull('id_rt')
                        ->where('id_rw', $idRwUser);
                });
        });

        // Hitung total pengumuman berdasarkan logika di atas
        $total_pengumuman = (clone $query)->count();

        // Data list: daftar tahun & kategori unik berdasarkan filter yang sama
        // Pastikan dropdown juga memfilter berdasarkan NOMOR RT dan ID RW
        $daftar_tahun = Pengumuman::whereHas('rukunTetangga', function ($q) use ($nomorRtUser, $idRwUser) {
            $q->where('rt', $nomorRtUser)
                ->where('id_rw', $idRwUser);
        })
            ->orWhere(function ($q) use ($idRwUser) {
                $q->whereNull('id_rt')
                    ->where('id_rw', $idRwUser);
            })
            ->selectRaw('YEAR(tanggal) as tahun')
            ->distinct()
            ->orderByDesc('tahun')
            ->pluck('tahun');

        $daftar_kategori = Pengumuman::whereHas('rukunTetangga', function ($q) use ($nomorRtUser, $idRwUser) {
            $q->where('rt', $nomorRtUser)
                ->where('id_rw', $idRwUser);
        })
            ->orWhere(function ($q) use ($idRwUser) {
                $q->whereNull('id_rt')
                    ->where('id_rw', $idRwUser);
            })
            ->select('kategori')
            ->distinct()
            ->pluck('kategori');

        $daftar_bulan = range(1, 12);

        // Apply search and other filters
        $pengumuman = $query->when($search, function ($q) use ($search) {
            $q->where(function ($q2) use ($search) {
                $q2->where('judul', 'like', "%$search%")
                    ->orWhere('isi', 'like', "%$search%");
            });
        })
            ->when($tahun, fn($q) => $q->whereYear('tanggal', $tahun))
            ->when($bulan, fn($q) => $q->whereMonth('tanggal', $bulan))
            ->when($kategori, fn($q) => $q->where('kategori', $kategori))
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        $daftar_penngumuman = Pengumuman::whereHas('rukunTetangga');

        return view('rt.pengumuman.pengumuman', compact(
            'pengumuman',
            'title',
            'daftar_tahun',
            'daftar_bulan',
            'daftar_kategori',
            'tahun',
            'bulan',
            'kategori',
            'search',
            'total_pengumuman'
        ));
    }

    // ... di dalam public function store(Request $request)
    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required',
            'isi' => 'required',
            'kategori' => 'required',
            'tanggal' => 'required|date',
            'dokumen' => 'nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov,avi,mkv,doc,docx,pdf|max:20480', // <-- Tambahkan validasi ini
        ]);

        $dokumenPath = null;
        $dokumenName = null;

        if ($request->hasFile('dokumen')) {
            $file = $request->file('dokumen');
            $dokumenName = time() . '_' . $file->getClientOriginalName();
            // Simpan ke folder 'documents/pengumuman-rt' di disk 'public'
            $dokumenPath = $file->storeAs('documents/pengumuman-rt', $dokumenName, 'public');
        }

        $id_rt_user = Auth::user()->id_rt;
        $id_rw_user = Auth::user()->rukunTetangga->id_rw;

        Pengumuman::create([
            'judul' => $request->judul,
            'isi' => $request->isi,
            'kategori' => $request->kategori,
            'tanggal' => $request->tanggal,
            'id_rt' => $id_rt_user,
            'id_rw' => $id_rw_user,
            'dokumen_path' => $dokumenPath, // <-- Tambahkan ini
            'dokumen_name' => $dokumenName, // <-- Tambahkan ini
        ]);

        return back()->with('success', 'Pengumuman RT berhasil dibuat.');
    }

    /**
     * Tampilkan detail pengumuman.
     */
    public function show($id)
    {
        // Pastikan hanya pengumuman yang relevan dengan RT ini yang bisa dilihat
        $userRtData = Auth::user()->rukunTetangga;
        if (!$userRtData) {
            return redirect()->back()->with('error', 'Data Rukun Tetangga Anda tidak ditemukan.');
        }
        $nomorRtUser = $userRtData->rt;
        $idRwUser = $userRtData->id_rw;

        $pengumuman = Pengumuman::where(function ($q) use ($nomorRtUser, $idRwUser) {
            $q->whereHas('rukunTetangga', function ($q2) use ($nomorRtUser, $idRwUser) {
                $q2->where('rt', $nomorRtUser)
                    ->where('id_rw', $idRwUser);
            })
                ->orWhere(function ($q2) use ($idRwUser) {
                    $q2->whereNull('id_rt')
                        ->where('id_rw', $idRwUser);
                });
        })->findOrFail($id);

        return view('rt.pengumuman.show', compact('pengumuman'));
    }

    /**
     * Tampilkan form edit.
     */
    public function edit($id)
    {
        // Pastikan hanya pengumuman yang relevan dengan RT ini yang bisa diedit
        $userRtData = Auth::user()->rukunTetangga;
        if (!$userRtData) {
            return redirect()->back()->with('error', 'Data Rukun Tetangga Anda tidak ditemukan.');
        }
        $nomorRtUser = $userRtData->rt;
        $idRwUser = $userRtData->id_rw;

        $pengumuman = Pengumuman::where(function ($q) use ($nomorRtUser, $idRwUser) {
            $q->whereHas('rukunTetangga', function ($q2) use ($nomorRtUser, $idRwUser) {
                $q2->where('rt', $nomorRtUser)
                    ->where('id_rw', $idRwUser);
            })
                ->orWhere(function ($q2) use ($idRwUser) {
                    $q2->whereNull('id_rt')
                        ->where('id_rw', $idRwUser);
                });
        })->findOrFail($id);

        return view('rt.pengumuman.edit', compact('pengumuman'));
    }

    /**
     * Update pengumuman.
     */


    // ... di dalam public function update(Request $request, $id)
    public function update(Request $request, $id)
    {
        // ... (kode otorisasi dan findOrFail) ...
        // Pastikan hanya pengumuman yang relevan dengan RT ini yang bisa diupdate
        $userRtData = Auth::user()->rukunTetangga;
        if (!$userRtData) {
            return redirect()->back()->with('error', 'Data Rukun Tetangga Anda tidak ditemukan.');
        }
        $nomorRtUser = $userRtData->rt;
        $idRwUser = $userRtData->id_rw;

        $pengumuman = Pengumuman::where(function ($q) use ($nomorRtUser, $idRwUser) {
            $q->whereHas('rukunTetangga', function ($q2) use ($nomorRtUser, $idRwUser) {
                $q2->where('rt', $nomorRtUser)
                    ->where('id_rw', $idRwUser);
            })
                ->orWhere(function ($q2) use ($idRwUser) {
                    $q2->whereNull('id_rt')
                        ->where('id_rw', $idRwUser);
                });
        })->findOrFail($id);

        $request->validate([
            'judul' => 'required|string|max:255',
            'kategori' => 'required|string|max:255',
            'isi' => 'required|string',
            'tanggal' => 'required|date',
            'dokumen' => 'nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov,avi,mkv,doc,docx,pdf|max:20480', // <-- Tambahkan validasi ini
            'hapus_dokumen_lama' => 'nullable|boolean', // <-- Tambahkan validasi ini untuk checkbox hapus
        ]);

        $dataToUpdate = [
            'judul' => $request->judul,
            'kategori' => $request->kategori,
            'isi' => $request->isi,
            'tanggal' => $request->tanggal,
        ];

        if ($request->hasFile('dokumen')) {
            // Hapus dokumen lama jika ada
            if ($pengumuman->dokumen_path && Storage::disk('public')->exists($pengumuman->dokumen_path)) {
                Storage::disk('public')->delete($pengumuman->dokumen_path);
            }
            // Simpan dokumen baru
            $file = $request->file('dokumen');
            $dokumenName = time() . '_' . $file->getClientOriginalName();
            $dokumenPath = $file->storeAs('documents/pengumuman-rt', $dokumenName, 'public');
            $dataToUpdate['dokumen_path'] = $dokumenPath;
            $dataToUpdate['dokumen_name'] = $dokumenName;
        } elseif ($request->boolean('hapus_dokumen_lama')) {
            // Jika checkbox hapus dicentang dan tidak ada file baru
            if ($pengumuman->dokumen_path && Storage::disk('public')->exists($pengumuman->dokumen_path)) {
                Storage::disk('public')->delete($pengumuman->dokumen_path);
            }
            $dataToUpdate['dokumen_path'] = null;
            $dataToUpdate['dokumen_name'] = null;
        }

        $pengumuman->update($dataToUpdate);

        return redirect()->route('rt.pengumuman.index')
            ->with('success', 'Pengumuman berhasil diperbarui.');
    }

    /**
     * Hapus pengumuman.
     */
    public function destroy($id)
    {
        // Pastikan hanya pengumuman yang relevan dengan RT ini yang bisa dihapus
        $userRtData = Auth::user()->rukunTetangga;
        if (!$userRtData) {
            return redirect()->back()->with('error', 'Data Rukun Tetangga Anda tidak ditemukan.');
        }
        $nomorRtUser = $userRtData->rt;
        $idRwUser = $userRtData->id_rw;

        $pengumuman = Pengumuman::where(function ($q) use ($nomorRtUser, $idRwUser) {
            $q->whereHas('rukunTetangga', function ($q2) use ($nomorRtUser, $idRwUser) {
                $q2->where('rt', $nomorRtUser)
                    ->where('id_rw', $idRwUser);
            })
                ->orWhere(function ($q2) use ($idRwUser) {
                    $q2->whereNull('id_rt')
                        ->where('id_rw', $idRwUser);
                });
        })->findOrFail($id);

        // ... di dalam public function destroy($id)(kode otorisasi dan findOrFail) ...

        // Hapus file dokumen terkait jika ada
        if ($pengumuman->dokumen_path && Storage::disk('public')->exists($pengumuman->dokumen_path)) {
            Storage::disk('public')->delete($pengumuman->dokumen_path);
        }

        $pengumuman->delete();

        return redirect()->route('rt.pengumuman.index')
            ->with('success', 'Pengumuman berhasil dihapus.');
    }

    public function exportPDF($id)
    {
        $pengumuman = Pengumuman::findOrFail($id);

        // Render blade ke HTML
        $html = View::make('rt.pengumuman.komponen.export_pengumuman', compact('pengumuman'))->render();

        // Konfigurasi dompdf
        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', true);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        // Nama file sesuai judul pengumuman
        $filename = 'Pengumuman ' . $pengumuman->judul . '.pdf';

        return response($dompdf->output(), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }
}
