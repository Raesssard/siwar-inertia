<?php

namespace App\Http\Controllers\Rt;

use App\Http\Controllers\Controller;
use App\Models\Pengeluaran;
use App\Models\Transaksi;
use App\Models\Rukun_tetangga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class Rt_transaksiController extends Controller
{

    public function index(Request $request)
    {
        $title = "Data Transaksi RT";

        /** @var User $user */
        $user = Auth::user();
        $idRt = $user->rukunTetangga->rt;

        // filter hanya transaksi untuk RT user login
        $query = Transaksi::where('rt', $idRt);

        if ($request->filled('search')) {
            $query->where('nama_transaksi', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('tahun')) {
            $query->whereYear('tanggal', $request->tahun);
        }

        if ($request->filled('bulan')) {
            $query->whereMonth('tanggal', $request->bulan);
        }

        $transaksi = (clone $query)->orderBy('tanggal', 'desc')->get();
        $paginatedTransaksi = $query->orderBy('tanggal', 'desc')->paginate(10);

        $daftar_tahun = Transaksi::selectRaw('YEAR(tanggal) as tahun')
            ->distinct()
            ->orderBy('tahun', 'desc')
            ->pluck('tahun');

        // RT user login saja
        $rukun_tetangga = $user->rukunTetangga ? [$user->rukunTetangga->id => $user->rukunTetangga->rt] : [];

        $pengeluaran = $request->pengeluaran ?? 0;

        $totalPemasukanBelumTercatat = 0;

        $jumlah = $totalPemasukanBelumTercatat - $pengeluaran;

        return view('rt.iuran.transaksi', compact(
            'title',
            'transaksi',
            'paginatedTransaksi',
            'daftar_tahun',
            'rukun_tetangga',
            'totalPemasukanBelumTercatat',
            'pengeluaran',
            'jumlah',
            'user',
        ));
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $noRt = $user->rukunTetangga->rt;
        $request->validate([
            'tanggal' => 'required|date',
            'nama_transaksi' => 'required|string|max:255',
            'jenis' => 'required|in:pemasukan,pengeluaran',
            'nominal' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);

        $dataYangDimasukin = [
            'rt' => $noRt,
            'tanggal' => $request->tanggal,
            'nama_transaksi' => $request->nama_transaksi,
            'jenis' => $request->jenis,
            'nominal' => $request->nominal,
            'keterangan' => $request->keterangan,
        ];

        Transaksi::create($dataYangDimasukin);

        return redirect()->route('rt.transaksi.index')->with('success', 'Transaksi berhasil ditambahkan!');
    }

    public function update(Request $request, Transaksi $rt_transaksi)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'nama_transaksi' => 'required|string|max:255',
            'jenis' => 'required|in:pemasukan,pengeluaran',
            'nominal' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);

        $rt_transaksi->update($validated);

        return redirect()->route('rt.transaksi.index')->with('success', 'Transaksi berhasil diperbarui!');
    }

    public function destroy(Transaksi $rt_transaksi)
    {
        $rt_transaksi->delete();

        return redirect()->route('rt.transaksi.index')->with('success', 'Transaksi berhasil dihapus.');
    }
}
