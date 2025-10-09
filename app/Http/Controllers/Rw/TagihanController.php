<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Kartu_keluarga;
use App\Models\Tagihan;
use App\Models\Iuran;
use App\Models\Transaksi;
use App\Models\Rukun_tetangga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Exports\TagihanExport;
use Maatwebsite\Excel\Facades\Excel;

class TagihanController extends Controller
{
    /**
     * Menampilkan daftar tagihan manual dengan filter dan total nominal.
     */
    public function index(Request $request)
    {
        $title = 'Data Tagihan';

        $kartuKeluargaForFilter = Kartu_keluarga::select('no_kk')->distinct()->orderBy('no_kk')->get();
        $iurans = Iuran::select('id', 'nama', 'nominal')->get();

        // Query manual
        $manual = Tagihan::where('jenis', 'manual');
        // Query otomatis
        $otomatis = Tagihan::where('jenis', 'otomatis');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $manual->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%$search%")->orWhere('nominal', 'like', "%$search%");
            });
            $otomatis->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%$search%")->orWhere('nominal', 'like', "%$search%");
            });
        }

        if ($request->filled('no_kk_filter')) {
            $kk = $request->input('no_kk_filter');
            $manual->where('no_kk', $kk);
            $otomatis->where('no_kk', $kk);
        }

        $tagihanManual = $manual->orderBy('tgl_tagih', 'desc')->paginate(10, ['*'], 'manual_page');
        $tagihanOtomatis = $otomatis->orderBy('tgl_tagih', 'desc')->paginate(10, ['*'], 'otomatis_page');

        return view('rw.iuran.tagihan', compact('title', 'tagihanManual', 'tagihanOtomatis', 'kartuKeluargaForFilter', 'iurans'));
    }

    /**
     * Menyimpan data tagihan manual baru.
     */
    public function store(Request $request)
    {
        Log::info('Data received for store tagihan:', $request->all());

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'tgl_tagih' => 'required|date',
            'tgl_tempo' => 'required|date',
            'jenis' => 'required|in:otomatis,manual',
            'nominal_manual' => 'required_if:jenis,manual|numeric|min:0',
            'no_kk' => 'required|string|max:255|exists:kartu_keluarga,no_kk',
            'status_bayar' => 'required|in:sudah_bayar,belum_bayar',
            'tgl_bayar' => 'nullable|date',
            'id_iuran' => 'nullable|exists:iuran,id',
            'kategori_pembayaran' => 'nullable|in:transfer,tunai',
            'bukti_transfer' => 'nullable|string|max:255',
        ]);

        if ($validated['jenis'] !== 'manual') {
            return redirect()->back()->with('error', 'Hanya tagihan manual yang dapat ditambahkan melalui form ini.');
        }

        try {
            $dataToStore = [
                'nama' => $validated['nama'],
                'tgl_tagih' => $validated['tgl_tagih'],
                'tgl_tempo' => $validated['tgl_tempo'],
                'jenis' => 'manual',
                'nominal' => $validated['nominal_manual'],
                'no_kk' => $validated['no_kk'],
                'status_bayar' => $validated['status_bayar'],
                'tgl_bayar' => $validated['tgl_bayar'] ?? null,
                'id_iuran' => $validated['id_iuran'] ?? null,
                'kategori_pembayaran' => $validated['kategori_pembayaran'] ?? null,
                'bukti_transfer' => $validated['bukti_transfer'] ?? null,
            ];

            Tagihan::create($dataToStore);

            return redirect()->route('rw.iuran.index')->with('success', 'Tagihan manual berhasil ditambahkan.');

        } catch (\Exception $e) {
            Log::error('Error creating tagihan manual:', ['message' => $e->getMessage()]);
            return redirect()->back()->withInput()->with('error', 'Gagal menambahkan tagihan manual. Error: ' . $e->getMessage());
        }
    }

    /**
     * Memperbarui tagihan manual.
     */
        public function update(Request $request, $id)
    {
        Log::info("Data received for update tagihan ID {$id}:", $request->all());

        $tagihan = Tagihan::findOrFail($id);

        $validated = $request->validate([
            'status_bayar' => 'required|in:sudah_bayar,belum_bayar',
            'tgl_bayar' => 'nullable|date',
            'id_iuran' => 'nullable|exists:iuran,id',
            'kategori_pembayaran' => 'nullable|in:transfer,tunai',
            'bukti_transfer' => 'nullable|string|max:255',
            'nominal' => 'nullable|numeric|min:0',
        ]);

        try {
            $statusLama = $tagihan->status_bayar;

            $dataToUpdate = [
                'status_bayar' => $validated['status_bayar'],
                'tgl_bayar' => $validated['tgl_bayar'] ?? ($validated['status_bayar'] === 'sudah_bayar' ? now() : null),
                'kategori_pembayaran' => $validated['kategori_pembayaran'] ?? $tagihan->kategori_pembayaran,
                'bukti_transfer' => $validated['bukti_transfer'] ?? $tagihan->bukti_transfer,
            ];

            if (!empty($validated['nominal'])) {
                $dataToUpdate['nominal'] = $validated['nominal'];
            }

            if (!empty($validated['id_iuran'])) {
                $dataToUpdate['id_iuran'] = $validated['id_iuran'];
            }

            $tagihan->update($dataToUpdate);

            // === buat transaksi jika status berubah dari belum_bayar -> sudah_bayar ===
            if ($statusLama === 'belum_bayar' && $validated['status_bayar'] === 'sudah_bayar') {
                $kk = Kartu_keluarga::where('no_kk', $tagihan->no_kk)->first();

                if ($kk) {
                    $rt = Rukun_tetangga::where('id', $kk->id_rt)->value('rt');

                    if ($rt) {
                        Transaksi::create([
                            'rt' => $rt,
                            'tanggal' => $dataToUpdate['tgl_bayar'] ?? now(),
                            'jenis' => 'pemasukan',
                            'nominal' => $dataToUpdate['nominal'] ?? $tagihan->nominal,
                            'nama_transaksi' => 'Iuran ' . $tagihan->nama,
                            'keterangan' => 'Pembayaran iuran oleh KK ' . $kk->no_kk,
                        ]);
                    } else {
                        Log::warning("RT tidak ditemukan untuk KK {$kk->no_kk} (id_rt: {$kk->id_rt})");
                    }
                }
            }

            // === hapus transaksi jika status berubah dari sudah_bayar -> belum_bayar ===
            if ($statusLama === 'sudah_bayar' && $validated['status_bayar'] === 'belum_bayar') {
                $kk = Kartu_keluarga::where('no_kk', $tagihan->no_kk)->first();

                if ($kk) {
                    Transaksi::where('nama_transaksi', 'Iuran ' . $tagihan->nama)
                        ->where('keterangan', 'Pembayaran iuran oleh KK ' . $kk->no_kk)
                        ->delete();
                }
            }
            return redirect()->route('rw.tagihan.index')->with('success', 'Tagihan berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Error updating tagihan:', ['message' => $e->getMessage()]);
            return redirect()->back()->withInput()->with('error', 'Gagal memperbarui tagihan. Error: ' . $e->getMessage());
        }
    }


    /**
     * Menghapus tagihan manual.
     */
    public function destroy($id)
    {
        try {
            $tagihan = Tagihan::findOrFail($id);

            if ($tagihan->jenis !== 'manual') {
                return redirect()->back()->with('error', 'Anda tidak dapat menghapus tagihan non-manual.');
            }

            $tagihan->delete();

            return redirect()->route('rw.tagihan.index')->with('success', 'Tagihan manual berhasil dihapus.');

        } catch (\Exception $e) {
            Log::error('Error deleting tagihan manual:', ['message' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Gagal menghapus tagihan manual. Error: ' . $e->getMessage());
        }
    }
    
    public function exportManual()
    {
        return Excel::download(new TagihanExport('manual'), 'Tagihan-Manual.xlsx');
    }

    public function exportOtomatis()
    {
        return Excel::download(new TagihanExport('otomatis'), 'Tagihan-Otomatis.xlsx');
    }

    public function exportSemua()
    {
        return Excel::download(new TagihanExport('all'), 'Tagihan-Semua.xlsx');
    }
}
