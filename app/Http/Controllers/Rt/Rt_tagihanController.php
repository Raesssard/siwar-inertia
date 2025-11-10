<?php

namespace App\Http\Controllers\Rt;

use App\Http\Controllers\Controller;
use App\Models\Kartu_keluarga;
use App\Models\Tagihan;
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
        $title = 'Tagihan';

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
            'kartuKeluarga.warga',
            'kartuKeluarga.kepalaKeluarga',
            'warga'
        ])
            ->where(function ($query) use ($idRt, $idRw, $user) {
                $query->whereHas('kartuKeluarga', function ($q) use ($idRt, $idRw, $user) {
                    if ($user->hasRole('rt')) {
                        $q->where('id_rt', $idRt);
                    }
                    if ($user->hasRole('rw')) {
                        $q->where('id_rw', $idRw);
                    }
                })
                    ->orWhereHas('warga.kartuKeluarga', function ($q) use ($idRt, $idRw, $user) {
                        if ($user->hasRole('rt')) {
                            $q->where('id_rt', $idRt);
                        }
                        if ($user->hasRole('rw')) {
                            $q->where('id_rw', $idRw);
                        }
                    });
            });

        $tagihanManual = (clone $baseQuery)
            ->where('jenis', 'manual')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama', 'like', "%$search%")
                        ->orWhere('nik', 'like', "%$search%")
                        ->orWhere('no_kk', 'like', "%$search%");
                });
            })
            ->when($no_kk_filter, function ($kk) use ($no_kk_filter) {
                $kk->where('no_kk', $no_kk_filter);
            })
            ->orderBy('tgl_tagih', 'desc')
            ->paginate(10, ['*'], 'manual_page');

        $tagihanOtomatis = (clone $baseQuery)
            ->where('jenis', 'otomatis')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama', 'like', "%$search%")
                        ->orWhere('nik', 'like', "%$search%")
                        ->orWhere('no_kk', 'like', "%$search%");
                });
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
     * Memperbarui tagihan manual.
     */
    public function update(Request $request, $id)
    {
        $tagihan = Tagihan::findOrFail($id);
        $iuran = $tagihan->iuran;

        $validated = $request->validate([
            'status_bayar' => 'required|in:sudah_bayar,belum_bayar',
            'tgl_bayar' => 'nullable|date',
            'nominal_bayar' => 'nullable|numeric|min:0',
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
                'nominal_bayar' => $validated['nominal_bayar'] ?? 0,
                'kategori_pembayaran' => $validated['kategori_pembayaran'] ?? null,
                'bukti_transfer' => $buktiPath,
            ]);

            if ($validated['status_bayar'] === 'sudah_bayar' && !$tagihan->transaksi) {
                $tagihan->transaksi()->create([
                    'tagihan_id' => $tagihan->id,
                    'no_kk' => $tagihan->no_kk,
                    'rt' => $iuran->rt->nomor_rt ?? '-',
                    'tanggal' => $validated['tgl_bayar'] ?? now(),
                    'jenis' => 'pemasukan',
                    'nominal' => $tagihan->nominal_bayar,
                    'nama_transaksi' => 'Pembayaran ' . ($tagihan->nama ?? 'Iuran'),
                    'keterangan' => 'Pembayaran untuk tagihan ' . ($tagihan->nama ?? 'iuran'),
                ]);
            }

            if ($validated['status_bayar'] === 'belum_bayar') {
                $tagihan->update([
                    'bukti_transfer' => null,
                    'tgl_bayar' => null,
                ]);
                if ($tagihan->transaksi) {
                    $tagihan->transaksi->delete();
                }
            }

            $iuran->load(['iuran_golongan', 'iuran_golongan.golongan']);

            return response()->json([
                'success' => true,
                'message' => 'Tagihan sudah diperbarui.',
                'tagihan' => $tagihan->load([
                    'transaksi',
                    'iuran',
                    'kartuKeluarga.kepalaKeluarga',
                    'warga'
                ]),
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
