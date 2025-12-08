<?php

namespace App\Http\Controllers\Rt;

use App\Http\Controllers\Controller;
use App\Models\Iuran;
use App\Models\IuranGolongan;
use App\Models\Kartu_keluarga;
use App\Models\Kategori_golongan;
use App\Models\Rukun_tetangga;
use App\Models\Tagihan;
use App\Models\Warga;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; 
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RtIuranController extends Controller
{
    public function index(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        $search = $request->input('search');

        $query = Iuran::with('iuran_golongan');

        if ($user->hasRole('rt')) {
            $query->where(function ($q) use ($user) {
                $q->where('level', 'rt')->where('id_rt', $user->id_rt)
                    ->orWhere(function ($q2) use ($user) {
                        $q2->where('level', 'rw')->where('id_rw', $user->id_rw);
                    });
            });
        } elseif ($user->hasRole('rw')) {
            $query->where('level', 'rw')->where('id_rw', $user->id_rw);
        }

        if ($search) {
            $query->where('nama', 'like', '%' . $search . '%');
        }

        if ($request->filled('rt')) {
            $query->where('id_rt', $request->input('rt'));
        }

        $golongan_list = Kategori_golongan::with('iuranGolongan')->get();
        $title = 'Iuran';

        $iuranOtomatis = (clone $query)->where('jenis', 'otomatis')->orderBy('tgl_tagih', 'desc')->paginate(10, ['*'], 'manual_page');
        $iuranManual = (clone $query)->where('jenis', 'manual')->orderBy('tgl_tagih', 'desc')->paginate(10, ['*'], 'otomatis_page');

        $nik_list = Warga::whereHas('kartuKeluarga', function ($q) use ($user) {
            if ($user->hasRole('rt')) {
                $q->where('id_rt', $user->id_rt);
            } elseif ($user->hasRole('rw')) {
                $q->where('id_rw', $user->id_rw);
            }
        })->select('nik')
            ->get();

        $no_kk_list = Warga::whereHas('kartuKeluarga', function ($q) use ($user) {
            if ($user->hasRole('rt')) {
                $q->where('id_rt', $user->id_rt);
            } elseif ($user->hasRole('rw')) {
                $q->where('id_rw', $user->id_rw);
            }
        })->select('no_kk')
            ->get();

        return Inertia::render('Iuran', [
            'iuranOtomatis' => $iuranOtomatis,
            'iuranManual' => $iuranManual,
            'golongan_list' => $golongan_list,
            'nik_list' => $nik_list,
            'no_kk_list' => $no_kk_list,
            'title' => $title,
        ]);
    }

    public function store(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $request->validate([
            'nik' => 'nullable',
            'no_kk' => 'nullable',
            'nama' => 'required|string|max:255',
            'tgl_tagih' => 'required|date',
            'tgl_tempo' => 'required|date',
            'jenis' => 'required|in:manual,otomatis',
            'nominal' => 'required_if:jenis,manual|nullable|numeric|min:0|max:99999999',
        ]);

        $data = [
            'nama' => $request->nama,
            'tgl_tagih' => $request->tgl_tagih,
            'tgl_tempo' => $request->tgl_tempo,
            'jenis' => $request->jenis,
            'nominal' => $request->jenis === 'manual' ? $request->nominal : null,
            'id_rt' => $user->hasRole('rt') ? $user->id_rt : null,
            'id_rw' => $user->id_rw,
            'level' => $user->hasRole('rt') ? 'rt' : 'rw',
        ];

        $iuran = Iuran::create($data);

        $kkList = $iuran->level === 'rt'
            ? Kartu_keluarga::where('id_rt', $iuran->id_rt)->get()
            : Kartu_keluarga::where('id_rw', $iuran->id_rw)->get();


        if ($request->jenis === 'otomatis') {
            $golonganList = Kategori_golongan::all();

            foreach ($golonganList as $golongan) {
                $nominal = $request->input("nominal_{$golongan->id}");
                $periode = $request->input("periode_{$golongan->id}", 1);
                if ($nominal !== null) {
                    IuranGolongan::create([
                        'id_iuran' => $iuran->id,
                        'id_golongan' => $golongan->id,
                        'nominal' => $nominal,
                        'periode' => $periode,
                    ]);
                }
            }

            $iuranNominals = IuranGolongan::where('id_iuran', $iuran->id)
                ->pluck('nominal', 'id_golongan');

            foreach ($kkList as $kk) {
                $nominalTagihan = $iuranNominals[$kk->kategori_iuran] ?? 0;

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
            'message' => 'Iuran berhasil dibuat beserta tagihannya.',
            'iuran' => $iuran
        ]);
    }

    public function update(Request $request, string $id, $jenis)
    {
        try {
            if ($jenis === 'otomatis') {
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
            } elseif ($jenis === 'manual') {
                $iuran = Iuran::findOrFail($id);

                $request->validate([
                    'nominal' => 'required|numeric|min:0|max:99999999',
                ]);

                $iuran->update([
                    'nominal' => $request->nominal,
                ]);
            }

            $iuran->load(['iuran_golongan', 'iuran_golongan.golongan']);

            return response()->json([
                'success' => true,
                'message' => 'Iuran berhasil diedit.',
                'iuran' => $iuran
            ]);
        } catch (\Exception $e) {
            Log::error("Gagal update iuran: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(string $id, $jenis)
    {
        Log::info("Hapus iuran - ID: {$id}, Jenis: {$jenis}");

        try {
            if ($jenis === 'otomatis') {
                $iuranGol = IuranGolongan::findOrFail($id);
                $id_iuran = $iuranGol->id_iuran;

                Log::info("Ditemukan iuran golongan: ", $iuranGol->toArray());

                $iuranGol->delete();

                $sisa = IuranGolongan::where('id_iuran', $id_iuran)->count();

                if ($sisa === 0) {
                    Iuran::where('id', $id_iuran)->delete();
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Iuran golongan berhasil dihapus.',
                    'id' => $id,
                    'jenis' => 'otomatis',
                ]);
            } else {
                $iuran = Iuran::findOrFail($id);
                Log::info("Ditemukan iuran utama: ", $iuran->toArray());

                $user = Auth::user();
                if ($iuran->level === 'rt' && $iuran->id_rt !== $user->id_rt) {
                    return back()->with('error', 'Anda tidak berhak menghapus iuran RT ini.');
                }
                if ($iuran->level === 'rw' && $iuran->id_rw !== $user->id_rw) {
                    return back()->with('error', 'Anda tidak berhak menghapus iuran RW ini.');
                }

                $iuran->delete();

                return response()->json([
                    'success' => true,
                    'message' => 'Iuran berhasil dihapus.',
                    'id' => $id,
                    'jenis' => 'manual',
                ]);
            }
        } catch (\Exception $e) {
            Log::error("Gagal hapus iuran: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function generateMonthlyTagihan()
    {
        $today = now();

        $iurans = Iuran::with('iuran_golongan')->where('jenis', 'otomatis')->get();

        foreach ($iurans as $iuran) {
            Log::info("Cek iuran: {$iuran->nama}, level = {$iuran->level}, golongan_count = " . $iuran->iuran_golongan->count());

            $kkList = $iuran->level === 'rt'
                ? Kartu_keluarga::where('id_rt', $iuran->id_rt)->get()
                : Kartu_keluarga::where('id_rw', $iuran->id_rw)->get();

            foreach ($iuran->iuran_golongan as $golongan) {
                $periode = $golongan->periode ?? 1;

                $tagihanTerakhir = Tagihan::where('id_iuran', $iuran->id)
                    ->orderByDesc('tgl_tagih')
                    ->first();

                $tglTerakhir = $tagihanTerakhir
                    ? \Carbon\Carbon::parse($tagihanTerakhir->tgl_tagih)
                    : \Carbon\Carbon::parse($iuran->tgl_tagih);

                $nextTagih = $tglTerakhir->copy()->addMonths($periode);

                if ($nextTagih->isSameMonth($today)) {
                    foreach ($kkList as $kk) {
                        if ($kk->kategori_iuran != $golongan->id_golongan) continue;

                        Tagihan::create([
                            'nama' => $iuran->nama,
                            'tgl_tagih' => $nextTagih->format('Y-m-d'),
                            'tgl_tempo' => $nextTagih->copy()->addDays(7)->format('Y-m-d'),
                            'jenis' => 'otomatis',
                            'nominal' => $golongan->nominal,
                            'no_kk' => $kk->no_kk,
                            'status_bayar' => 'belum_bayar',
                            'id_iuran' => $iuran->id,
                        ]);
                    }

                    Log::info("Tagihan otomatis dibuat untuk iuran {$iuran->nama} periode {$nextTagih->format('m-Y')}");
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Tagihan otomatis berhasil digenerate sesuai periode.',
        ]);
    }
}
