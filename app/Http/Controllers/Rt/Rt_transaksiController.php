<?php

namespace App\Http\Controllers\Rt;

use App\Http\Controllers\Controller;
use App\Models\Kartu_keluarga;
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
        $title = "Transaksi";

        /** @var User $user */
        $noRt = Auth::user()->rukunTetangga->nomor_rt;
        $idRt = Auth::user()->rukunTetangga->id;

        $search = $request->input('search');
        $tahun = $request->input('tahun');
        $bulan = $request->input('bulan');

        $query = Transaksi::where('rt', $noRt)
            ->when($search, fn($q) => $q->where('nama_transaksi', 'like', '%' . $search . '%'))
            ->when($tahun, fn($q) => $q->whereYear('tanggal', $tahun))
            ->when($bulan, fn($q) => $q->whereMonth('tanggal', $bulan));

        $transaksi = $query
            ->orderBy('tanggal', 'desc')
            ->orderBy('created_at', 'desc');

        $allTransaksi = $transaksi->paginate(10);

        $transaksiWarga = (clone $transaksi)
            ->whereNotNull('no_kk')
            ->paginate(10, ['*'], 'warga_page');

        $transaksiUmum = (clone $transaksi)
            ->whereNull('no_kk')
            ->paginate(10, ['*'], 'umum_page');

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

        $list_kk = Kartu_keluarga::where('id_rt', $idRt)->get();

        return Inertia::render('RT/Transaksi', [
            'title' => $title,
            'transaksi' => $allTransaksi,
            'transaksiWarga' => $transaksiWarga,
            'transaksiUmum' => $transaksiUmum,
            'daftar_tahun' => $daftar_tahun,
            'daftar_bulan' => $daftar_bulan,
            'list_kk' => $list_kk,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $noRt = $user->rukunTetangga->nomor_rt;
        $request->validate([
            'tanggal' => 'required|date',
            'nama_transaksi' => 'required|string|max:255',
            'nominal' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);

        $isPerKk = $request->no_kk !== 'semua';

        $dataYangDimasukin = [
            'tagihan_id' => null,
            'no_kk' => $isPerKk ? $request->no_kk : null,
            'rt' => $noRt,
            'tanggal' => $request->tanggal,
            'nama_transaksi' => $request->nama_transaksi,
            'jenis' => 'pemasukan',
            'nominal' => $request->nominal,
            'keterangan' => $request->keterangan,
        ];

        $transaksi = Transaksi::create($dataYangDimasukin);

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil dibuat.',
            'transaksi' => $transaksi,
        ]);
    }

    public function update(Request $request, string $id)
    {
        Log::info("Data received for update tagihan ID {$id}:", $request->all());
        Log::info('VALIDATION DATA:', $request->all());
        $rt_transaksi = Transaksi::findOrFail($id);

        $validated = $request->validate([
            'tanggal' => 'required|date',
            'nama_transaksi' => 'required|string|max:255',
            'nominal' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);

        $rt_transaksi->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil diubah',
            'transaksi' => $rt_transaksi,
            'jenis' => $rt_transaksi->no_kk ? 'kk' : 'umum',
        ]);
    }

    public function destroy(string $id)
    {
        $rt_transaksi = Transaksi::findOrFail($id);
        $jenis = $rt_transaksi->no_kk ? 'kk' : 'umum';
        $rt_transaksi->delete();

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil dihapus.',
            'jenis' => $jenis,
        ]);
    }
}
