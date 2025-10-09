<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Iuran;
use App\Models\Rukun_tetangga;
use App\Models\IuranGolongan;
use App\Models\Kartu_keluarga;
use App\Models\Kategori_golongan;
use App\Models\Tagihan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Exports\IuranExport;
use Maatwebsite\Excel\Facades\Excel;

class IuranController extends Controller
{
    public function index(Request $request)
    {
        $query = Iuran::with(['iuran_golongan', 'rt', 'rw']);

        // 🔍 filter search
        if ($request->filled('search')) {
            $query->where('nama', 'like', '%' . $request->search . '%');
        }

        // 🔍 filter RT
        if ($request->filled('rt')) {
            $query->whereHas('rt', function ($q) use ($request) {
                $q->where('nomor_rt', $request->rt);
            });
        }

        // paginate
        $iuran = $query->paginate(10);

        // ✅ pakai kolom `jenis` dari tabel kategori_golongan
        $golongan_list = Kategori_golongan::pluck('jenis', 'id');

        // ambil daftar RT untuk filter dropdown
        $rt = Rukun_tetangga::all();

        return view('rw.iuran.iuran', [
            'iuran' => $iuran,
            'rt' => $rt,
            'golongan_list' => $golongan_list,
            'title' => 'Data Iuran',
        ]);
    }

    public function store(Request $request)
    {
        // dd($request->all()); // cek semua input yang terkirim

        $user = Auth::user();

        $rules = [
            'nama'      => 'required|string|max:255',
            'tgl_tagih' => 'required|date',
            'tgl_tempo' => 'required|date',
            'jenis'     => 'required|in:manual,otomatis',
        ];

        if ($request->jenis === 'manual') {
            $rules['nominal'] = 'required|numeric|min:0';
        }

        $request->validate($rules);


        $iuran = Iuran::create([
            'nama'      => $request->nama,
            'tgl_tagih' => $request->tgl_tagih,
            'tgl_tempo' => $request->tgl_tempo,
            'jenis'     => $request->jenis,
            'nominal'   => $request->jenis === 'manual' ? $request->nominal : null,
            'id_rw'     => $user->id_rw,
            'level'     => 'rw',
        ]);

        // Ambil semua KK di RW ini
        $kkList = Kartu_keluarga::where('id_rw', $user->id_rw)->get();

        // manual
        if ($request->jenis === 'manual') {
            foreach ($kkList as $kk) {
                Tagihan::create([
                    'nama'         => $iuran->nama,
                    'tgl_tagih'    => $iuran->tgl_tagih,
                    'tgl_tempo'    => $iuran->tgl_tempo,
                    'jenis'        => 'manual',
                    'nominal'      => $iuran->nominal,
                    'no_kk'        => $kk->no_kk,
                    'status_bayar' => 'belum_bayar',
                    'id_iuran'     => $iuran->id,
                ]);
            }
        }

        // otomatis
// otomatis
if ($request->jenis === 'otomatis') {
    $golonganList = Kategori_golongan::all();

    foreach ($golonganList as $golongan) {
        $nominal = $request->input("nominal_{$golongan->id}");

        if (!is_null($nominal)) {
            IuranGolongan::create([
                'id_iuran'    => $iuran->id,
                'id_golongan' => $golongan->id,
                'nominal'     => $nominal,
            ]);
        }
    }

    // Ambil kembali daftar nominal per golongan
    $iuranNominals = IuranGolongan::where('id_iuran', $iuran->id)
        ->pluck('nominal', 'id_golongan');

    foreach ($kkList as $kk) {
        // pastikan kolom yang dipakai konsisten dengan KK
        $golonganId = $kk->kategori_iuran ?? $kk->id_golongan;

        $nominalTagihan = $iuranNominals[$golonganId] ?? 0;

        Tagihan::create([
            'nama'         => $iuran->nama,
            'tgl_tagih'    => $iuran->tgl_tagih,
            'tgl_tempo'    => $iuran->tgl_tempo,
            'jenis'        => 'otomatis',
            'nominal'      => $nominalTagihan,
            'no_kk'        => $kk->no_kk,
            'status_bayar' => 'belum_bayar',
            'id_iuran'     => $iuran->id,
        ]);
    }
}


        return redirect()->route('rw.iuran.index')->with('success', 'Iuran berhasil dibuat beserta tagihannya.');
    }

    public function edit(string $id)
    {
        $iuran = Iuran::with('iuran_golongan')->findOrFail($id);
        $golongan_list = Kategori_golongan::pluck('nama', 'id');

        return view('rw.iuran.edit', compact('iuran', 'golongan_list'));
    }

    public function update(Request $request, string $id)
    {
        $iuran = Iuran::findOrFail($id);

        $request->validate([
            'nama'      => 'required|string|max:255',
            'tgl_tagih' => 'required|date',
            'tgl_tempo' => 'required|date',
            'jenis'     => 'required|in:manual,otomatis',
        ]);

        $iuran->update([
            'nama'      => $request->nama,
            'tgl_tagih' => $request->tgl_tagih,
            'tgl_tempo' => $request->tgl_tempo,
            'jenis'     => $request->jenis,
            'nominal'   => $request->jenis === 'manual' ? $request->nominal : null,
        ]);

        // hapus iuran_golongan lama
        IuranGolongan::where('id_iuran', $iuran->id)->delete();

        if ($request->jenis === 'otomatis') {
            foreach ($request->input('nominal', []) as $id_golongan => $nominal) {
                if ($nominal !== null) {
                    IuranGolongan::create([
                        'id_iuran'    => $iuran->id,
                        'id_golongan' => $id_golongan,
                        'nominal'     => $nominal,
                    ]);
                }
            }

            $kkList = Kartu_keluarga::where('id_rw', $iuran->id_rw)->get();
            $iuranNominals = IuranGolongan::where('id_iuran', $iuran->id)
                ->pluck('nominal', 'id_golongan');

            foreach ($kkList as $kk) {
                $nominalTagihan = $iuranNominals[$kk->kategori_iuran] ?? 0;

                Tagihan::where('id_iuran', $iuran->id)
                    ->where('no_kk', $kk->no_kk)
                    ->update(['nominal' => $nominalTagihan]);
            }
        }

        return redirect()->route('rw.iuran.index')->with('success', 'Iuran berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        $iuran = Iuran::findOrFail($id);
        $user = Auth::user();

        if ($iuran->id_rw !== $user->id_rw || $iuran->level !== 'rw') {
            return back()->with('error', 'Anda tidak berhak menghapus iuran RW ini.');
        }

        $iuran->delete();
        return redirect()->route('rw.iuran.index')->with('success', 'Iuran berhasil dihapus.');
    }

    public function generateMonthlyTagihan()
    {
        $today = now()->startOfDay();

        $iurans = Iuran::where('jenis', 'otomatis')
            ->where('level', 'rw')
            ->whereDay('tgl_tagih', $today->day)
            ->get();

        foreach ($iurans as $iuran) {
            $iuranNominals = IuranGolongan::where('id_iuran', $iuran->id)
                ->pluck('nominal', 'id_golongan');

            $kkList = Kartu_keluarga::where('id_rw', $iuran->id_rw)->get();

            foreach ($kkList as $kk) {
                $nominalTagihan = $iuranNominals[$kk->kategori_iuran] ?? 0;

                $exists = Tagihan::where('id_iuran', $iuran->id)
                    ->where('no_kk', $kk->no_kk)
                    ->whereMonth('tgl_tagih', $today->month)
                    ->whereYear('tgl_tagih', $today->year)
                    ->exists();

                if (!$exists) {
                    Tagihan::create([
                        'nama'         => $iuran->nama,
                        'tgl_tagih'    => $today,
                        'tgl_tempo'    => $iuran->tgl_tempo ?? $today->copy()->addDays(10),
                        'jenis'        => 'otomatis',
                        'nominal'      => $nominalTagihan,
                        'no_kk'        => $kk->no_kk,
                        'status_bayar' => 'belum_bayar',
                        'id_iuran'     => $iuran->id,
                    ]);
                }
            }
        }

        return redirect()->route('rw.iuran.index')->with('success', 'Tagihan bulanan berhasil dibuat.');
    }

    public function export($jenis = 'semua')
    {
        // samakan dengan constructor (pakai 'all' bukan 'semua')
        $jenis = $jenis === 'semua' ? 'all' : $jenis;

        return Excel::download(new IuranExport($jenis), "iuran-{$jenis}.xlsx");
    }
    public function updateOtomatis(Request $request, $id)
{
    $request->validate([
        'nominal' => 'required|numeric|min:0',
        'tgl_tagih' => 'required|date',
        'tgl_tempo' => 'required|date|after_or_equal:tgl_tagih',
    ]);

    // cari detail iuran_golongan
    $detail = IuranGolongan::findOrFail($id);

    // update data detail (nominal)
    $detail->update([
        'nominal' => $request->nominal,
    ]);

    // update juga tgl_tagih & tgl_tempo di tabel iuran induknya
    $detail->iuran()->update([
        'tgl_tagih' => $request->tgl_tagih,
        'tgl_tempo' => $request->tgl_tempo,
    ]);

    return back()->with('success', 'Iuran otomatis berhasil diperbarui.');
}
}