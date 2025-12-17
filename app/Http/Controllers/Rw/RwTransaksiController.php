<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Kartu_keluarga;
use App\Models\Transaksi;
use App\Models\Rt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RwTransaksiController extends Controller
{
    public function index(Request $request)
    {
        $title = "Transaksi";

        $user = $request->user();
        $userRwData = $user?->rw;

        if (!$userRwData) {
            return redirect()->back()->with('error', 'Data RW Anda tidak ditemukan.');
        }

        $idRw = $userRwData->id;
        $nomorRwUser = $userRwData->nomor_rw;

        $search = $request->search;
        $tahun = $request->tahun;
        $bulan = $request->bulan;
        $rt = $request->rt;

        $allowedMainRoles = ['admin', 'rw', 'rt', 'warga'];

        $daftar_rt = Rt::with('rw')->whereHas('user', function ($q) use ($allowedMainRoles) {
            $q->whereHas('roles', fn($qrt) => $qrt->where('name', 'rt'))
                ->whereDoesntHave(
                    'roles',
                    fn($qx) =>
                    $qx->whereNotIn('name', $allowedMainRoles)
                );
        })
            ->select('id', 'id_rw', 'nomor_rt', 'nama_anggota_rt')
            ->get();

        $query = Transaksi::whereHas('rukunTetangga.rw', function ($q) use ($nomorRwUser) {
            $q->where('nomor_rw', $nomorRwUser);
        })
            ->when($search, fn($q) => $q->where('nama_transaksi', 'like', "%{$search}%"))
            ->when($tahun, fn($q) => $q->whereYear('tanggal', $tahun))
            ->when($bulan, fn($q) => $q->whereMonth('tanggal', $bulan))
            ->when($rt, fn($q) => $q->whereHas('rukunTetangga', function ($qr) use ($rt, $idRw) {
                $qr->where('nomor_rt', $rt)
                    ->where('id_rw', $idRw);
            }));

        $transaksi = $query->orderBy('tanggal', 'desc')
            ->paginate(10)
            ->withQueryString();

        $daftar_tahun = Transaksi::whereHas('rukunTetangga.rw', function ($q) use ($nomorRwUser) {
            $q->where('nomor_rw', $nomorRwUser);
        })
            ->selectRaw('YEAR(tanggal) as tahun')
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
            ->where('id_rw', $idRw)
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
            'message' => 'Transaksi RW berhasil dibuat.',
            'transaksi' => $transaksi
        ]);
    }

    public function update(Request $request, string $id)
    {
        $rw_transaksi = Transaksi::findOrFail($id);

        $validated = $request->validate([
            'tanggal' => 'required|date',
            'nama_transaksi' => 'required|string|max:255',
            'nominal' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);

        $rw_transaksi->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Transaksi RW berhasil diubah',
            'transaksi' => $rw_transaksi
        ]);
    }

    public function destroy(string $id)
    {
        $rw_transaksi = Transaksi::findOrFail($id);
        $rw_transaksi->delete();

        return response()->json([
            'success' => true,
            'message' => 'Transaksi RW berhasil dihapus.',
        ]);
    }
}
