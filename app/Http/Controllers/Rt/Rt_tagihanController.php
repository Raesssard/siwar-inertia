<?php

namespace App\Http\Controllers\Rt;

use App\Http\Controllers\Controller;
use App\Models\Iuran;
use App\Models\Kartu_keluarga;
use App\Models\Tagihan;
use App\Models\RukunTetangga;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class Rt_tagihanController extends Controller
{
    /**
     * Menampilkan daftar tagihan manual dengan filter dan total nominal.
     */
    public function index(Request $request)
    {
        $title = 'Data Tagihan';

        /** @var User $user */
        $user = Auth::user();
        $idRt = $user->id_rt;
        $idRw = $user->id_rw;

        // Ambil daftar KK sesuai RT (buat filter dropdown)
        $kartuKeluargaForFilter = Kartu_keluarga::where('id_rt', $idRt)
            ->select('no_kk')
            ->distinct()
            ->orderBy('no_kk')
            ->get();

        // Base query (untuk dipakai manual & otomatis)
        $baseQuery = Tagihan::with([
            'iuran',
            'kartuKeluarga',
            'kartuKeluarga.warga',
        ])
            ->whereHas('kartuKeluarga', function ($q) use ($idRt, $idRw, $user) {
                if ($user->hasRole('rt')) {
                    $q->where('id_rt', $idRt);
                }
                if ($user->hasRole('rw')) {
                    $q->where('id_rw', $idRw);
                }
            });

        // Filter pencarian
        if ($request->filled('search')) {
            $search = $request->input('search');
            $baseQuery->where(function ($q) use ($search) {
                $q->where('nama', 'like', '%' . $search . '%')
                    ->orWhere('nominal', 'like', '%' . $search . '%');
            });
        }

        // Filter berdasarkan no KK
        if ($request->filled('no_kk_filter')) {
            $baseQuery->where('no_kk', $request->input('no_kk_filter'));
        }

        $tagihanManual = (clone $baseQuery)
            ->where('jenis', 'manual')
            ->orderBy('tgl_tagih', 'desc')
            ->paginate(10, ['*'], 'manual_page');

        $tagihanOtomatis = (clone $baseQuery)
            ->where('jenis', 'otomatis')
            ->orderBy('tgl_tagih', 'desc')
            ->paginate(10, ['*'], 'otomatis_page');


        return Inertia::render('RT/Tagihan', [
            'title' => $title,
            'tagihanManual' => $tagihanManual,
            'tagihanOtomatis' => $tagihanOtomatis,
            'kartuKeluargaForFilter' => $kartuKeluargaForFilter
        ]);
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

            return redirect()->route('rt.iuran.index')->with('success', 'Tagihan manual berhasil ditambahkan.');
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
        ]);

        try {
            $tagihan->update([
                'status_bayar' => $validated['status_bayar'],
                'tgl_bayar' => $validated['tgl_bayar'] ?? null,
                'id_iuran' => $validated['id_iuran'] ?? null,
                'kategori_pembayaran' => $validated['kategori_pembayaran'] ?? null,
                'bukti_transfer' => $validated['bukti_transfer'] ?? null,
            ]);

            if ($validated['status_bayar'] === 'sudah_bayar') {
                Transaksi::create([
                    'rt' => $tagihan->iuran->rt->rt,
                    'tanggal' => $tagihan->tgl_bayar,
                    'jenis' => 'pemasukan',
                    'nominal' => $tagihan->nominal,
                    'nama_transaksi' => $tagihan->nama,
                    'keterangan' => 'Pembayaran ' . $tagihan->nama
                ]);
            }

            return redirect()->route('rt_tagihan.index')->with('success', 'Tagihan manual berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Error updating tagihan manual:', ['message' => $e->getMessage()]);
            return redirect()->back()->withInput()->with('error', 'Gagal memperbarui tagihan manual. Error: ' . $e->getMessage());
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

            return redirect()->route('rt.iuran.index')->with('success', 'Tagihan manual berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Error deleting tagihan manual:', ['message' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Gagal menghapus tagihan manual. Error: ' . $e->getMessage());
        }
    }
}
