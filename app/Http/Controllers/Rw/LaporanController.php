<?php

namespace App\Http\Controllers\Rw;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\Pengeluaran;
use App\Models\Rukun_tetangga;
use Illuminate\Support\Carbon;

class LaporanController extends Controller
{
    public function pengeluaran_bulanan($bulan, $tahun)
    {
        $title = 'Laporan Pengeluaran Bulanan';
        $bulanMap = [
            'januari' => 1,
            'februari' => 2,
            'maret' => 3,
            'april' => 4,
            'mei' => 5,
            'juni' => 6,
            'juli' => 7,
            'agustus' => 8,
            'september' => 9,
            'oktober' => 10,
            'november' => 11,
            'desember' => 12,
        ];

        $bulan_input = strtolower($bulan);

        $bulan = $bulanMap[strtolower($bulan_input)] ?? null;

        if (!$bulan) {
            abort(404, 'Bulan tidak dikenali');
        }

        // Ambil data pengeluaran sesuai bulan dan tahun
        $pengeluaran = Pengeluaran::with('rukunTetangga')
            ->whereMonth('tanggal', $bulan)
            ->whereYear('tanggal', $tahun)
            ->get();

            // hitung total
        $total = $pengeluaran->sum('jumlah');




        return view('rw.iuran.laporan_pengeluaran_bulanan', compact('pengeluaran', 'total', 'bulan', 'tahun', 'title'));
    }
}
