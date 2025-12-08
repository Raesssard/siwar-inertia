<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Iuran;
use App\Models\Tagihan;
use App\Models\Kartu_keluarga;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Database\Eloquent\Collection;

class RwTagihanController extends Controller
{
    public function index(Request $request)
    {
        $title = 'Tagihan RW';

        $userRwData = Auth::user()->rw;
        if (!$userRwData) {
            return back()->with('error', 'Data RW Anda tidak ditemukan.');
        }

        $nomorRwUser = $userRwData->nomor_rw;

        $search = $request->search;
        $no_kk_filter = $request->no_kk_filter;
        $status = $request->status;

        $kartuKeluargaForFilter = Kartu_keluarga::whereHas('rw', function ($q) use ($nomorRwUser) {
            $q->where('nomor_rw', $nomorRwUser);
        })
            ->select('no_kk')
            ->distinct()
            ->orderBy('no_kk')
            ->get();

        $baseQuery = Tagihan::with([
            'iuran',
            'kartuKeluarga.warga',
            'kartuKeluarga.kepalaKeluarga',
        ])
            ->whereHas('kartuKeluarga.rw', function ($q) use ($nomorRwUser) {
                $q->where('nomor_rw', $nomorRwUser);
            })
            });

        $tagihanManual = (clone $baseQuery)
            ->where('jenis', 'manual')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama', 'like', "%$search%")
                        ->orWhere('nominal', 'like', "%$search%")
                        ->orWhere('no_kk', 'like', "%$search%");
                });
            })
            ->when($no_kk_filter, fn($q) => $q->where('no_kk', $no_kk_filter));

        $filterStatus = function ($q) use ($status) {
            if (!$status) return;

            if ($status === 'sudah_lunas') {
                $q->whereColumn('nominal_bayar', '>=', 'nominal');
            } elseif ($status === 'belum_lunas') {
                $q->whereColumn('nominal_bayar', '<', 'nominal');
            } else {
                $q->where('status_bayar', $status);
            }
        };

        $tagihanManual = (clone $baseQuery)
            ->where('jenis', 'manual')
            ->where($filterStatus)
            ->orderBy('tgl_tagih', 'desc')
            ->paginate(10, ['*'], 'manual_page');

        $tagihanOtomatis = (clone $baseQuery)
            ->where('jenis', 'otomatis')
            ->where($filterStatus)
            ->orderBy('tgl_tagih', 'desc')
            ->paginate(10, ['*'], 'otomatis_page');

        $iuran_for_tagihan = Iuran::with(['iuran_golongan', 'iuran_golongan.golongan'])
            ->whereHas('rw', function ($q) use ($nomorRwUser) {
                $q->where('nomor_rw', $nomorRwUser);
            })
            ->where('level', 'rw')
            ->where('jenis', 'manual')
            ->get();

        return Inertia::render('Tagihan', [
            'title' => $title,
            'tagihanManual' => $tagihanManual,
            'tagihanOtomatis' => $tagihanOtomatis,
            'iuran_for_tagihan' => $iuran_for_tagihan,
            'kartuKeluargaForFilter' => $kartuKeluargaForFilter,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required',
            'nominal' => 'required|numeric|min:0|max:99999999',
            'tgl_tagih' => 'nullable|date',
            'no_kk' => 'nullable',
        ]);

        $iuran = Iuran::findOrFail($request->id_iuran);

        $kkQuery = Kartu_keluarga::where('id_rw', $iuran->id_rw);

        if ($request->no_kk && $request->no_kk !== 'semua') {
            $kkQuery->where('no_kk', $request->no_kk);
        }

        $kkList = $kkQuery->get();

        $tgl_tagih = Carbon::parse($request->tgl_tagih ?? $iuran->tgl_tagih);
        $tgl_tempo = $request->tgl_tagih
            ? $tgl_tagih->copy()->addDays(
                Carbon::parse($iuran->tgl_tagih)->diffInDays(Carbon::parse($iuran->tgl_tempo))
            )
            : Carbon::parse($iuran->tgl_tempo);

        $tagihanList = new Collection();

        foreach ($kkList as $kk) {
            $tagihan = Tagihan::create([
                'nama' => $request->nama ?? $iuran->nama,
                'nominal' => $request->nominal ?? $iuran->nominal,
                'tgl_tagih' => $tgl_tagih,
                'tgl_tempo' => $tgl_tempo,
                'jenis' => 'manual',
                'no_kk' => $kk->no_kk,
                'status_bayar' => 'belum_bayar',
                'id_iuran' => $iuran->id,
            ]);

            $tagihanList->push($tagihan);
        }

        $iuran->load(['iuran_golongan', 'iuran_golongan.golongan']);

        $tagihanList->load([
            'transaksi',
            'iuran',
            'kartuKeluarga.warga',
            'kartuKeluarga.kepalaKeluarga',
        ]);

        return response()->json([
            'success' => true,
            'message' => $request->no_kk === 'semua'
                ? 'Tagihan berhasil dibuat untuk semua KK di RW.'
                : 'Tagihan berhasil dibuat.',
            'tagihan' => $request->no_kk === 'semua' ? $tagihanList : $tagihanList->first(),
            'iuran' => $iuran,
        ], 201);
    }

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
                    'nama_transaksi' => 'Pembayaran ' . ($tagihan->nama ?? 'Iuran RW'),
                    'keterangan' => 'Pembayaran untuk tagihan RW ' . ($tagihan->nama ?? 'iuran'),
                ]);
            }

            if ($validated['status_bayar'] === 'belum_bayar') {
                if ($tagihan->transaksi) {
                    $tagihan->transaksi->delete();
                }

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
                'message' => 'Tagihan RW berhasil diperbarui.',
                'tagihan' => $tagihan->load(['transaksi', 'iuran', 'kartuKeluarga.kepalaKeluarga']),
                'iuran' => $iuran
            ]);
        } catch (Exception $e) {
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
