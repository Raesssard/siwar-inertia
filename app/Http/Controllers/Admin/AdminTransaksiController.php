<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kartu_keluarga;
use App\Models\Transaksi;
use App\Models\Rt;
use App\Models\Rw;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminTransaksiController extends Controller
{
    public function index(Request $request)
    {
        $title = "Transaksi";

        $search = $request->search;
        $tahun = $request->tahun;
        $bulan = $request->bulan;
        $rw = $request->rw;
        $rt = $request->rt;

        $daftar_rw = Rw::orderBy('nomor_rw')
            ->where('status', 'aktif')
            ->pluck('nomor_rw')
            ->toArray();
        $daftar_rt = Rt::orderBy('nomor_rt')
            ->where('status', 'aktif')
            ->pluck('nomor_rt')
            ->toArray();

        $query = Transaksi::with(['rukunTetangga.rw'])
            ->when($search, fn($q) => $q->where('nama_transaksi', 'like', "%{$search}%"))
            ->when($tahun, fn($q) => $q->whereYear('tanggal', $tahun))
            ->when($bulan, fn($q) => $q->whereMonth('tanggal', $bulan))
            ->when($rw, fn($q) => $q->whereHas('rukunTetangga.rw', function ($kueri) use ($rw) {
                $kueri->where('nomor_rw', $rw);
            }))
            ->when($rt, fn($q) => $q->whereHas('rukunTetangga', function ($qr) use ($rt) {
                $qr->where('nomor_rt', $rt);
            }));

        $transaksi = $query->orderBy('tanggal', 'desc')
            ->paginate(10)
            ->withQueryString();

        $daftar_tahun = Transaksi::selectRaw('YEAR(tanggal) as tahun')
            ->distinct()
            ->orderBy('tahun', 'desc')
            ->pluck('tahun');

        $daftar_bulan = [
            'januari',
            'februari',
            'maret',
            'april',
            'mei',
            'juni',
            'juli',
            'agustus',
            'september',
            'oktober',
            'november',
            'desember'
        ];

        $list_kk = Kartu_keluarga::with('rukunTetangga')
            ->orderBy('no_kk')
            ->get();

        return Inertia::render('Transaksi', [
            'title' => $title,
            'transaksi' => $transaksi,
            'daftar_tahun' => $daftar_tahun,
            'daftar_bulan' => $daftar_bulan,
            'daftar_rt' => $daftar_rt,
            'daftar_rw' => $daftar_rw,
            'list_kk' => $list_kk,
            'filters' => [
                'search' => $search,
                'tahun' => $tahun,
                'bulan' => $bulan,
                'rt' => $rt,
            ],
        ]);
    }

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
