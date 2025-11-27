<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Iuran;
use App\Models\IuranGolongan;
use App\Models\Kartu_keluarga;
use App\Models\Kategori_golongan;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\Tagihan;
use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminIuranController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        // Query Iuran untuk ADMIN → ambil semua RW & RT
        $query = Iuran::with(['iuran_golongan', 'rw', 'rt'])
            ->where('level', 'rw') // Level RW saja (sesuai yg kamu pakai)
            ->orderBy('tgl_tagih', 'desc');

        if ($search) {
            $query->where('nama', 'like', "%{$search}%");
        }

        // Pagination
        $iuranOtomatis = (clone $query)
            ->where('jenis', 'otomatis')
            ->paginate(10)
            ->withQueryString();

        $iuranManual = (clone $query)
            ->where('jenis', 'manual')
            ->paginate(10)
            ->withQueryString();

        // Semua golongan
        $golongan_list = Kategori_golongan::with('iuranGolongan')->get();

        // Semua RT
        $rt_list = Rt::select('id', 'nomor_rt', 'id_rw')->get();

        // Semua RW
        $rw_list = Rw::select('id', 'nomor_rw')->get();

        // Semua warga (NIK)
        $nik_list = Warga::select('nik')->get();

        // Semua KK
        $no_kk_list = Kartu_keluarga::select('no_kk')->orderBy('no_kk')->get();

        return Inertia::render('Iuran', [
            'iuranOtomatis' => $iuranOtomatis,
            'iuranManual'   => $iuranManual,
            'golongan_list' => $golongan_list,
            'rt_list'       => $rt_list,
            'rw_list'       => $rw_list,
            'nik_list'      => $nik_list,
            'no_kk_list'    => $no_kk_list,
            'title'         => "Iuran RW (Admin)",
        ]);
    }

    public function store(Request $request)
    {
        try {
            Log::info('[ADMIN IURAN STORE] Request:', $request->all());

            // Validasi
            $request->validate([
                'nama' => 'required|string|max:255',
                'tgl_tagih' => 'required|date',
                'tgl_tempo' => 'required|date',
                'jenis' => 'required|in:manual,otomatis',
                'nominal' => 'required_if:jenis,manual|nullable|numeric|min:0|max:99999999',
                'id_rw' => 'required|exists:rw,id',
                'id_rt' => 'nullable|exists:rt,id',
            ]);

            // Buat iuran
            $iuran = Iuran::create([
                'id_rw' => $request->id_rw,
                'id_rt' => $request->id_rt,
                'nama' => $request->nama,
                'tgl_tagih' => $request->tgl_tagih,
                'tgl_tempo' => $request->tgl_tempo,
                'jenis' => $request->jenis,
                'nominal' => $request->jenis === 'manual' ? $request->nominal : null,
                'level' => 'rw',
            ]);

            Log::info('Iuran RW dibuat:', ['id' => $iuran->id]);

            // Ambil semua KK berdasarkan RW
            $kkList = Kartu_keluarga::where('id_rw', $iuran->id_rw)->get();

            /**
             * === OTOMATIS ===
             */
            if ($request->jenis === 'otomatis') {

                // Simpan golongan nominal
                foreach (Kategori_golongan::all() as $golongan) {
                    $nominal = $request->input("nominal_{$golongan->id}");
                    $periode = $request->input("periode_{$golongan->id}", 1);

                    if (!is_null($nominal)) {
                        IuranGolongan::create([
                            'id_iuran' => $iuran->id,
                            'id_golongan' => $golongan->id,
                            'nominal' => $nominal,
                            'periode' => $periode,
                        ]);
                    }
                }

                // Mapping nominal golongan
                $iuranNominals = IuranGolongan::where('id_iuran', $iuran->id)
                    ->pluck('nominal', 'id_golongan')
                    ->toArray();

                // Generate Tagihan
                foreach ($kkList as $kk) {
                    $kategoriId = $kk->kategori_iuran ?? null;

                    $nominalTagihan = $kategoriId && isset($iuranNominals[$kategoriId])
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

            return response()->json([
                'success' => true,
                'message' => 'Iuran RW berhasil dibuat.',
                'iuran' => $iuran,
            ]);

        } catch (\Throwable $e) {

            Log::error('Gagal membuat iuran RW:', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan server.',
                'detail' => $e->getMessage(),
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
            }

            // manual
            Iuran::findOrFail($id)->delete();

            return response()->json(['success' => true, 'message' => 'Iuran manual RW dihapus.']);

        } catch (\Throwable $e) {
            Log::error('Gagal hapus iuran RW: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan.'], 500);
        }
    }
}
