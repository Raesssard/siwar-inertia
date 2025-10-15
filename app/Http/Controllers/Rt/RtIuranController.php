<?php

namespace App\Http\Controllers\Rt;

use App\Http\Controllers\Controller;
use App\Models\Iuran;
use App\Models\IuranGolongan;
use App\Models\Kartu_keluarga;
use App\Models\Kategori_golongan;
use App\Models\Rukun_tetangga;
use App\Models\Tagihan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Tetap diperlukan jika ada filter iuran per RT
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

        $iuranOtomatis = (clone $query)->where('jenis', 'otomatis')->orderBy('tgl_tagih', 'desc')->paginate(10);
        $iuranManual = (clone $query)->where('jenis', 'manual')->orderBy('tgl_tagih', 'desc')->paginate(10);

        return Inertia::render('RT/Iuran', [
            'iuranOtomatis' => $iuranOtomatis,
            'iuranManual' => $iuranManual,
            'golongan_list' => $golongan_list,
            'title' => $title,
        ]);
    }

    public function store(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $request->validate([
            'nama' => 'required|string|max:255',
            'tgl_tagih' => 'required|date',
            'tgl_tempo' => 'required|date',
            'jenis' => 'required|in:manual,otomatis',
            'nominal' => 'nullable|required_if:jenis,manual|numeric|min:0|max:99999999',
        ]);

        // 🔹 Tentukan scope RT atau RW
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

        // 🔹 Ambil KK sesuai scope
        $kkList = $iuran->level === 'rt'
            ? Kartu_keluarga::where('id_rt', $iuran->id_rt)->get()
            : Kartu_keluarga::where('id_rw', $iuran->id_rw)->get();


        // Manual
        if ($request->jenis === 'manual') {
            foreach ($kkList as $kk) {
                Tagihan::create([
                    'nama' => $iuran->nama,
                    'nominal' => $iuran->nominal,
                    'tgl_tagih' => $iuran->tgl_tagih,
                    'tgl_tempo' => $iuran->tgl_tempo,
                    'jenis' => 'manual',
                    'no_kk' => $kk->no_kk,
                    'status_bayar' => 'belum_bayar',
                    'id_iuran' => $iuran->id,
                ]);
            }
        }

        // Otomatis
        if ($request->jenis === 'otomatis') {
            // Simpan nominal per golongan
            $golonganList = Kategori_golongan::all(); // ambil semua golongan

            foreach ($golonganList as $golongan) {
                $nominal = $request->input("nominal_{$golongan->id}");
                if ($nominal !== null) {
                    IuranGolongan::create([
                        'id_iuran' => $iuran->id,
                        'id_golongan' => $golongan->id, // pakai id_golongan
                        'nominal' => $nominal,
                    ]);
                }
            }

            // Buat tagihan untuk semua KK sesuai RT/RW
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

    public function edit(string $id)
    {
        $iuran = Iuran::with('iuran_golongan')->findOrFail($id);
        $golongan_list = Kartu_keluarga::select('golongan')->distinct()->pluck('golongan');

        return view('rt.iuran.edit', compact('iuran', 'golongan_list'));
    }

    public function update(Request $request, string $id)
    {
        $iuranGol = IuranGolongan::findOrFail($id);

        $request->validate([
            'nominal' => 'nullable|required_if:jenis,manual|numeric|min:0|max:99999999',
        ]);

        $iuranGol->update([
            'nominal' => $request->nominal,
        ]);

        $iuran = Iuran::findOrFail($iuranGol->id_iuran);

        $kkList = $iuran->level === 'rt'
            ? Kartu_keluarga::where('id_rt', $iuran->id_rt)->get()
            : Kartu_keluarga::where('id_rw', $iuran->id_rw)->get();

        $iuranNominals = IuranGolongan::where('id_iuran', $iuran->id)
            ->pluck('nominal', 'id_golongan');

        foreach ($kkList as $kk) {
            $nominalTagihan = $iuranNominals[$kk->kategori_iuran] ?? 0;

            Tagihan::where('id_iuran', $iuran->id)
                ->where('no_kk', $kk->no_kk)
                ->update(['nominal' => $nominalTagihan]);
        }

        $iuran->load(['iuran_golongan', 'iuran_golongan.golongan']);

        return response()->json([
            'success' => true,
            'message' => 'Iuran berhasil dibuat beserta tagihannya.',
            'iuran' => $iuran
        ]);
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
        $today = now()->startOfDay();

        $iurans = Iuran::where('jenis', 'otomatis')
            ->whereDay('tgl_tagih', $today->day)
            ->get();

        foreach ($iurans as $iuran) {
            $iuranNominals = IuranGolongan::where('id_iuran', $iuran->id)
                ->pluck('nominal', 'id_golongan');

            $kkList = $iuran->level === 'rt'
                ? Kartu_keluarga::where('id_rt', $iuran->id_rt)->get()
                : Kartu_keluarga::where('id_rw', $iuran->id_rw)->get();

            foreach ($kkList as $kk) {
                $nominalTagihan = $iuranNominals[$kk->kategori_iuran] ?? 0;

                $exists = Tagihan::where('id_iuran', $iuran->id)
                    ->where('no_kk', $kk->no_kk)
                    ->whereMonth('tgl_tagih', $today->month)
                    ->whereYear('tgl_tagih', $today->year)
                    ->exists();

                if (!$exists) {
                    Tagihan::create([
                        'nama' => $iuran->nama,
                        'tgl_tagih' => $today,
                        'tgl_tempo' => $iuran->tgl_tempo ?? $today->copy()->addDays(10),
                        'jenis' => 'otomatis',
                        'nominal' => $nominalTagihan,
                        'no_kk' => $kk->no_kk,
                        'status_bayar' => 'belum_bayar',
                        'id_iuran' => $iuran->id,
                    ]);
                }
            }
        }

        return redirect()->route('rt.iuran.index')->with('success', 'Tagihan bulanan berhasil dibuat.');
    }
}
