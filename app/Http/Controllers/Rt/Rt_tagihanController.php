<?php

namespace App\Http\Controllers\Rt;

use App\Http\Controllers\Controller;
use App\Models\Iuran;
use App\Models\Kartu_keluarga;
use App\Models\Tagihan;
use App\Models\RukunTetangga;
use App\Models\Transaksi;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

use function Laravel\Prompts\search;

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
        $search = $request->search;
        $no_kk_filter = $request->no_kk_filter;

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

        $tagihanManual = (clone $baseQuery)
            ->where('jenis', 'manual')
            ->when($search, function ($query) use ($search) {
                $query->where('nama', 'like', '%' . $search . '%')
                    ->orWhere('nominal', 'like', '%' . $search . '%')
                    ->orWhere('no_kk', 'like', '%' . $search . '%');
            })
            ->when($no_kk_filter, function ($kk) use ($no_kk_filter) {
                $kk->where('no_kk', $no_kk_filter);
            })
            ->orderBy('tgl_tagih', 'desc')
            ->paginate(10, ['*'], 'manual_page');

        $tagihanOtomatis = (clone $baseQuery)
            ->where('jenis', 'otomatis')
            ->when($search, function ($query) use ($search) {
                $query->where('nama', 'like', '%' . $search . '%')
                    ->orWhere('nominal', 'like', '%' . $search . '%')
                    ->orWhere('no_kk', 'like', '%' . $search . '%');
            })
            ->when($no_kk_filter, function ($kk) use ($no_kk_filter) {
                $kk->where('no_kk', $no_kk_filter);
            })
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
        Log::info('FILES:', $request->allFiles());
        Log::info('VALIDATION DATA:', $request->all());

        $tagihan = Tagihan::findOrFail($id);
        $iuran = $tagihan->iuran;

        $validated = $request->validate([
            'status_bayar' => 'required|in:sudah_bayar,belum_bayar',
            'tgl_bayar' => 'nullable|date',
            'kategori_pembayaran' => 'nullable|in:transfer,tunai',
            'bukti_transfer' => 'nullable|file|mimes:jpg,jpeg,png|max:20480',
        ]);

        try {
            $buktiPath = $tagihan->bukti_transfer;

            if ($request->hasFile('bukti_transfer')) {
                if ($buktiPath && Storage::exists('public/' . $buktiPath)) {
                    Storage::delete('public/' . $buktiPath);
                }

                $buktiPath = $request->file('bukti_transfer')->store('bukti_transfer', 'public');
            }

            $tagihan->update([
                'status_bayar' => $validated['status_bayar'],
                'tgl_bayar' => $validated['tgl_bayar'] ?? null,
                'kategori_pembayaran' => $validated['kategori_pembayaran'] ?? null,
                'bukti_transfer' => $buktiPath,
            ]);

            if ($validated['status_bayar'] === 'sudah_bayar' && !$tagihan->transaksi) {
                $tagihan->transaksi()->create([
                    'tagihan_id' => $tagihan->id,
                    'rt' => $iuran->rt->nomor_rt ?? '-',
                    'tanggal' => $validated['tgl_bayar'] ?? now(),
                    'jenis' => 'pemasukan',
                    'nominal' => $tagihan->nominal,
                    'nama_transaksi' => 'Pembayaran ' . ($tagihan->nama ?? 'Iuran'),
                    'keterangan' => 'Pembayaran untuk tagihan ' . ($tagihan->nama ?? 'iuran'),
                ]);
            }

            if ($validated['status_bayar'] === 'belum_bayar' && $tagihan->transaksi) {
                $tagihan->update([
                    'tgl_bayar' => null,
                ]);

                $tagihan->transaksi->delete();
            }

            $iuran->load(['iuran_golongan', 'iuran_golongan.golongan']);

            return response()->json([
                'success' => true,
                'message' => 'Tagihan sudah diperbarui.',
                'tagihan' => $tagihan->load(['transaksi', 'kartuKeluarga.warga']),
                'iuran' => $iuran
            ]);
        } catch (Exception $e) {
            Log::error("Gagal update tagihan ID {$id}: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Menghapus tagihan manual.
     */
    public function destroy($id)
    {
        try {
            $tagihan = Tagihan::findOrFail($id);

            $jenis = $tagihan->jenis;

            $tagihan->delete();

            return response()->json([
                'success' => true,
                'message' => 'Tagihan berhasil dihapus.',
                'jenis' => $jenis,
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting tagihan manual:', ['message' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus tagihan manual: ' . $e->getMessage(),
            ], 500);
        }
    }
}
