<?php

namespace App\Http\Controllers\Rt;

use App\Http\Controllers\Controller;
use App\Models\Pengeluaran;
use App\Models\Transaksi;
use App\Models\Rukun_tetangga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class Rt_transaksiController extends Controller
{

    public function index(Request $request)
    {
        Log::info('Data Filter Transaksi:', $request->all());

        $title = "Transaksi";

        /** @var User $user */
        $idRt = Auth::user()->rukunTetangga->nomor_rt;

        $search = $request->input('search');
        $tahun = $request->input('tahun');
        $bulan = $request->input('bulan');

        $query = Transaksi::where('rt', $idRt)
            ->when($search, fn($q) => $q->where('nama_transaksi', 'like', '%' . $search . '%'))
            ->when($tahun, fn($q) => $q->whereYear('tanggal', $tahun))
            ->when($bulan, fn($q) => $q->whereMonth('tanggal', $bulan));

        $transaksi = $query->orderBy('tanggal', 'desc')->paginate(10);

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

        if ($request->wantsJson()) {
            return response()->json(
                $transaksi->fresh()
            );
        }

        return Inertia::render('RT/Transaksi', [
            'title' => $title,
            'transaksi' => $transaksi,
            'daftar_tahun' => $daftar_tahun,
            'daftar_bulan' => $daftar_bulan,
        ]);
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

    public function destroy(string $id)
    {
        $rt_transaksi = Transaksi::findOrFail($id);

        $rt_transaksi->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tagihan berhasil dihapus.',
        ]);
    }
}
