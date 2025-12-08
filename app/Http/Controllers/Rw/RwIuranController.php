<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Iuran;
use App\Models\IuranGolongan;
use App\Models\Kartu_keluarga;
use App\Models\Kategori_golongan;
use App\Models\Tagihan;
use App\Models\Rt;
use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RwIuranController extends Controller
{
    public function index(Request $request)
    {

        $user = Auth::user();

        $userRwData = $user->rw;
        if (!$userRwData) {
            return back()->with('error', 'Data RW Anda tidak ditemukan.');
        }

        $nomorRwUser = $userRwData->nomor_rw;

        $search = $request->input('search');

        $query = Iuran::with('iuran_golongan')
            ->where('level', 'rw')
            ->whereHas('rw', function ($q) use ($nomorRwUser) {
                $q->where('nomor_rw', $nomorRwUser);
            });

        if ($search) {
            $query->where('nama', 'like', "%{$search}%");
        }

        $golongan_list = Kategori_golongan::with('iuranGolongan')->get();
        $title = 'Iuran RW';

        $iuranOtomatis = (clone $query)
            ->where('jenis', 'otomatis')
            ->orderBy('tgl_tagih', 'desc')
            ->paginate(10);

        $iuranManual = (clone $query)
            ->where('jenis', 'manual')
            ->orderBy('tgl_tagih', 'desc')
            ->paginate(10);

        $rt_list = Rt::whereHas('rw', function ($q) use ($nomorRwUser) {
                $q->where('nomor_rw', $nomorRwUser);
            })
            ->get(['id', 'nomor_rt']);

        $nik_list = Warga::whereHas('kartuKeluarga.rw', function ($q) use ($nomorRwUser) {
                $q->where('nomor_rw', $nomorRwUser);
            })
            ->select('nik')
            ->get();

        $no_kk_list = Kartu_keluarga::whereHas('rw', function ($q) use ($nomorRwUser) {
            $q->where('nomor_rw', $nomorRwUser);
        })
        ->select('no_kk')
        ->orderBy('no_kk')
        ->get();

        return Inertia::render('Iuran', [
            'iuranOtomatis' => $iuranOtomatis,
            'iuranManual' => $iuranManual,
            'golongan_list' => $golongan_list,
            'rt_list' => $rt_list,
            'nik_list' => $nik_list,
            'no_kk_list' => $no_kk_list,
            'title' => $title,
        ]);
    }

    public function store(Request $request)
    {
        try {
            Log::info('🟩 [RW IURAN STORE] Request masuk:', $request->all());

            $user = Auth::user();

            $request->validate([
                'nama' => 'required|string|max:255',
                'tgl_tagih' => 'required|date',
                'tgl_tempo' => 'required|date',
                'jenis' => 'required|in:manual,otomatis',
                'nominal' => 'required_if:jenis,manual|nullable|numeric|min:0|max:99999999',
                'id_rt' => 'nullable|exists:rt,id', 
            ]);

            $iuran = Iuran::create([
                'id_rt' => $request->id_rt, 
                'nama' => $request->nama,
                'tgl_tagih' => $request->tgl_tagih,
                'tgl_tempo' => $request->tgl_tempo,
                'jenis' => $request->jenis,
                'nominal' => $request->jenis === 'manual' ? $request->nominal : null,
                'id_rw' => $user->id_rw,
                'level' => 'rw',
            ]);

            Log::info('✅ Iuran RW dibuat:', ['id' => $iuran->id]);

            $kkList = Kartu_keluarga::where('id_rw', $iuran->id_rw)->get();

            if ($request->jenis === 'otomatis') {
                Log::info('🟨 Iuran otomatis, simpan data golongan...');
                $golonganList = Kategori_golongan::all();

                foreach ($golonganList as $golongan) {
                    $nominal = $request->input("nominal_{$golongan->id}");
                    $periode = $request->input("periode_{$golongan->id}", 1);

                    if ($nominal !== null && $nominal !== '') {
                        IuranGolongan::create([
                            'id_iuran' => $iuran->id,
                            'id_golongan' => $golongan->id,
                            'nominal' => $nominal,
                            'periode' => $periode,
                        ]);
                    }
                }

                $iuranNominals = IuranGolongan::where('id_iuran', $iuran->id)
                    ->pluck('nominal', 'id_golongan')
                    ->toArray();

                Log::info('🔸 Data nominal per golongan:', $iuranNominals);

                foreach ($kkList as $kk) {
                    $kategoriId = $kk->kategori_iuran ?? null;
                    $nominalTagihan = ($kategoriId && isset($iuranNominals[$kategoriId]))
                        ? $iuranNominals[$kategoriId]
                        : 0;

                    Tagihan::create([
                        'nama' => $iuran->nama,
                        'tgl_tagih' => $iuran->tgl_tagih,
                        'tgl_tempo' => $iuran->tgl_tempo,
                        'jenis' => 'otomatis',
                        'nominal' => $nominalTagihan,
                        'no_kk' => $kk->no_kk,
                        'status_bayar' => 'belum_bayar',
                        'id_iuran' => $iuran->id,
                    ]);
                }
            }

            $iuran->load(['iuran_golongan', 'iuran_golongan.golongan']);

            Log::info('✅ Iuran RW selesai dibuat', ['iuran_id' => $iuran->id]);

            return response()->json([
                'success' => true,
                'message' => 'Iuran RW berhasil dibuat.',
                'iuran' => $iuran,
            ]);
        } catch (\Throwable $e) {
            Log::error('❌ Gagal membuat iuran RW:', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan internal server.',
                'error_detail' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, string $id)
    {
        $iuranGol = IuranGolongan::findOrFail($id);

        $request->validate([
            'nominal' => 'required|numeric|min:0|max:99999999',
            'periode' => 'required|numeric|min:0|max:12',
        ]);

        $iuranGol->update([
            'nominal' => $request->nominal,
            'periode' => $request->periode,
        ]);

        $iuran = Iuran::findOrFail($iuranGol->id_iuran);
        $iuran->load(['iuran_golongan', 'iuran_golongan.golongan']);

        return response()->json([
            'success' => true,
            'message' => 'Iuran RW berhasil diperbarui.',
            'iuran' => $iuran,
        ]);
    }

    public function destroy(string $id, $jenis)
    {
        try {
            if ($jenis === 'otomatis') {
                $iuranGol = IuranGolongan::findOrFail($id);
                $id_iuran = $iuranGol->id_iuran;
                $iuranGol->delete();

                if (IuranGolongan::where('id_iuran', $id_iuran)->count() === 0) {
                    Iuran::where('id', $id_iuran)->delete();
                }

                return response()->json(['success' => true, 'message' => 'Iuran otomatis RW dihapus.']);
            } else {
                $iuran = Iuran::findOrFail($id);
                $iuran->delete();

                return response()->json(['success' => true, 'message' => 'Iuran manual RW dihapus.']);
            }
        } catch (\Exception $e) {
            Log::error("Gagal hapus iuran RW: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan.'], 500);
        }
    }
}
