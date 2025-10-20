<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Tagihan;
use App\Models\Kartu_keluarga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Exception;

class RwTagihanController extends Controller
{
    public function index(Request $request)
    {
        $title = 'Tagihan RW';

        $user = Auth::user();
        $idRw = $user->id_rw;
        $search = $request->search;
        $no_kk_filter = $request->no_kk_filter;

        // KK dalam wilayah RW
        $kartuKeluargaForFilter = Kartu_keluarga::where('id_rw', $idRw)
            ->select('no_kk')
            ->distinct()
            ->orderBy('no_kk')
            ->get();

        $baseQuery = Tagihan::with(['iuran', 'kartuKeluarga', 'kartuKeluarga.warga'])
            ->whereHas('kartuKeluarga', function ($q) use ($idRw) {
                $q->where('id_rw', $idRw);
            });

        $tagihanManual = (clone $baseQuery)
            ->where('jenis', 'manual')
            ->when($search, fn($q) => $q->where('nama', 'like', "%$search%")
                ->orWhere('no_kk', 'like', "%$search%"))
            ->when($no_kk_filter, fn($q) => $q->where('no_kk', $no_kk_filter))
            ->orderBy('tgl_tagih', 'desc')
            ->paginate(10, ['*'], 'manual_page');

        $tagihanOtomatis = (clone $baseQuery)
            ->where('jenis', 'otomatis')
            ->when($search, fn($q) => $q->where('nama', 'like', "%$search%")
                ->orWhere('no_kk', 'like', "%$search%"))
            ->when($no_kk_filter, fn($q) => $q->where('no_kk', $no_kk_filter))
            ->orderBy('tgl_tagih', 'desc')
            ->paginate(10, ['*'], 'otomatis_page');

        return Inertia::render('Rw/Tagihan', [
            'title' => $title,
            'tagihanManual' => $tagihanManual,
            'tagihanOtomatis' => $tagihanOtomatis,
            'kartuKeluargaForFilter' => $kartuKeluargaForFilter
        ]);
    }

    public function update(Request $request, $id)
    {
        $tagihan = \App\Models\Tagihan::findOrFail($id);
        $iuran = $tagihan->iuran;

        $validated = $request->validate([
            'status_bayar' => 'required|in:sudah_bayar,belum_bayar',
            'tgl_bayar' => 'nullable|date',
            'kategori_pembayaran' => 'nullable|in:transfer,tunai',
            'bukti_transfer' => 'nullable|file|mimes:jpg,jpeg,png|max:20480',
        ]);

        try {
            $buktiPath = $tagihan->bukti_transfer;

            // ✅ Upload / Ganti bukti transfer jika ada
            if ($request->hasFile('bukti_transfer')) {
                if ($buktiPath && Storage::exists('public/' . $buktiPath)) {
                    Storage::delete('public/' . $buktiPath);
                }
                $buktiPath = $request->file('bukti_transfer')->store('bukti_transfer', 'public');
            }

            // ✅ Update data tagihan
            $tagihan->update([
                'status_bayar' => $validated['status_bayar'],
                'tgl_bayar' => $validated['tgl_bayar'] ?? null,
                'kategori_pembayaran' => $validated['kategori_pembayaran'] ?? null,
                'bukti_transfer' => $buktiPath,
            ]);

            // ✅ Kelola transaksi berdasarkan status
            if ($validated['status_bayar'] === 'sudah_bayar') {
                // Jika belum ada transaksi, buat baru
                if (!$tagihan->transaksi) {
                    $tagihan->transaksi()->create([
                        'tagihan_id' => $tagihan->id,
                        'rt' => $iuran->rt->nomor_rt ?? '-',
                        'tanggal' => $validated['tgl_bayar'] ?? now(),
                        'jenis' => 'pemasukan',
                        'nominal' => $tagihan->nominal,
                        'nama_transaksi' => 'Pembayaran Iuran RW: ' . ($tagihan->nama ?? 'Iuran'),
                        'keterangan' => 'Pembayaran untuk tagihan RW ' . ($tagihan->nama ?? 'iuran'),
                    ]);
                }
            } else {
                // Jika status diubah ke belum_bayar
                if ($tagihan->transaksi) {
                    $tagihan->transaksi->delete();
                }

                // Hapus bukti & tanggal bayar agar bersih
                if ($tagihan->bukti_transfer && Storage::exists('public/' . $tagihan->bukti_transfer)) {
                    Storage::delete('public/' . $tagihan->bukti_transfer);
                }

                $tagihan->update([
                    'bukti_transfer' => null,
                    'tgl_bayar' => null,
                ]);
            }

            $iuran->load(['iuran_golongan', 'iuran_golongan.golongan']);

            return response()->json([
                'success' => true,
                'message' => 'Tagihan diperbarui.',
                'tagihan' => $tagihan->load(['kartuKeluarga.warga', 'transaksi']),
                'iuran' => $iuran
            ]);
        } catch (\Exception $e) {
            Log::error("RW gagal update tagihan ID {$id}: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Kesalahan server: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $tagihan = Tagihan::findOrFail($id);
            $jenis = $tagihan->jenis;
            $tagihan->delete();

            return response()->json([
                'success' => true,
                'message' => 'Tagihan RW berhasil dihapus.',
                'jenis' => $jenis,
            ]);
        } catch (Exception $e) {
            Log::error('RW gagal hapus tagihan: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal hapus tagihan: ' . $e->getMessage(),
            ], 500);
        }
    }
}
