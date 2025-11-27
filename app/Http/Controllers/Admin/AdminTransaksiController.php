<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kartu_keluarga;
use App\Models\Transaksi;
use App\Models\Rt;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminTransaksiController extends Controller
{
    /**
     * INDEX — Admin melihat SEMUA transaksi dari semua RW/RT.
     */
    public function index(Request $request)
    {
        $title = "Transaksi Admin";

        $search = $request->search;
        $tahun = $request->tahun;
        $bulan = $request->bulan;
        $rt = $request->rt;

        // Semua daftar RT (nomor_rt)
        $daftar_rt = Rt::orderBy('nomor_rt')
            ->pluck('nomor_rt')
            ->toArray();

        // Query transaksi tanpa batas RW/RT
        $query = Transaksi::with(['rukunTetangga.rw'])
            ->when($search, fn($q) => $q->where('nama_transaksi', 'like', "%{$search}%"))
            ->when($tahun, fn($q) => $q->whereYear('tanggal', $tahun))
            ->when($bulan, fn($q) => $q->whereMonth('tanggal', $bulan))
            ->when($rt, fn($q) => $q->whereHas('rukunTetangga', function ($qr) use ($rt) {
                $qr->where('nomor_rt', $rt);
            }));

        $transaksi = $query->orderBy('tanggal', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Daftar tahun (distinct)
        $daftar_tahun = Transaksi::selectRaw('YEAR(tanggal) as tahun')
            ->distinct()
            ->orderBy('tahun', 'desc')
            ->pluck('tahun');

        // Daftar bulan statis
        $daftar_bulan = [
            'januari','februari','maret','april','mei','juni',
            'juli','agustus','september','oktober','november','desember'
        ];

        // Semua KK (admin boleh lihat semua)
        $list_kk = Kartu_keluarga::with('rukunTetangga')
            ->orderBy('no_kk')
            ->get();

        return Inertia::render('Transaksi', [
            'title' => $title,
            'transaksi' => $transaksi,
            'daftar_tahun' => $daftar_tahun,
            'daftar_bulan' => $daftar_bulan,
            'daftar_rt' => $daftar_rt,
            'list_kk' => $list_kk,
            'filters' => [
                'search' => $search,
                'tahun' => $tahun,
                'bulan' => $bulan,
                'rt' => $rt,
            ],
        ]);
    }

    /**
     * Store transaksi (bebas, tidak terikat RW/RT)
     */
    public function store(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'nama_transaksi' => 'required|string|max:255',
            'jenis' => 'required|string|max:255',
            'nominal' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
            'rt' => 'required|numeric'
        ]);

        $isPerKk = $request->no_kk !== 'semua';

        $data = [
            'tagihan_id' => null,
            'no_kk' => $isPerKk ? $request->no_kk : null,
            'rt' => $request->rt,
            'tanggal' => $request->tanggal,
            'nama_transaksi' => $request->nama_transaksi,
            'jenis' => $request->jenis,
            'nominal' => $request->nominal,
            'keterangan' => $request->keterangan,
        ];

        $transaksi = Transaksi::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil dibuat.',
            'transaksi' => $transaksi
        ]);
    }

    /**
     * Update transaksi
     */
    public function update(Request $request, string $id)
    {
        $transaksi = Transaksi::findOrFail($id);

        $validated = $request->validate([
            'tanggal' => 'required|date',
            'nama_transaksi' => 'required|string|max:255',
            'nominal' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);

        $transaksi->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil diubah',
            'transaksi' => $transaksi
        ]);
    }

    /**
     * Delete transaksi
     */
    public function destroy(string $id)
    {
        $transaksi = Transaksi::findOrFail($id);
        $transaksi->delete();

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil dihapus.',
        ]);
    }
}

