<?php

namespace App\Http\Controllers;

use App\Models\Pengaduan;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class Laporan extends Controller
{
    public function laporanKeuangan(Request $request)
    {
        $title = 'Informasi Keuangan';
        $currentRole = session('active_role');
        $idRw = Auth::user()->rw->id ?? null;
        $idRt = Auth::user()->rukunTetangga->id ?? null;

        $search = $request->input('search');
        $tahun = $request->input('tahun');
        $bulan = $request->input('bulan');
        $jenis = $request->input('jenis');

        if ($currentRole === 'admin') {
            $transaksi = Transaksi::query()
                ->when($search, fn($q) => $q->where('nama_transaksi', 'like', '%' . $search . '%'))
                ->when($tahun, fn($q) => $q->whereYear('tanggal', $tahun))
                ->when($bulan, fn($q) => $q->whereMonth('tanggal', $bulan))
                ->when($jenis, fn($q) => $q->where('jenis', $jenis));
        }

        if ($currentRole === 'rw') {
            $transaksi = Transaksi::where(function ($query) use ($idRw) {
                $query->where(function ($q) use ($idRw) {
                    $q->whereNotNull('tagihan_id')
                        ->whereHas('tagihan.iuran', function ($subQuery) use ($idRw) {
                            $subQuery->where('id_rw', $idRw);
                        });
                })
                    ->orWhere(function ($q) use ($idRw) {
                        $q->whereNull('tagihan_id')
                            ->whereHas('rukunTetangga', function ($subQuery) use ($idRw) {
                                $subQuery->where('id_rw', $idRw);
                            });
                    });
            })
                ->when($search, fn($q) => $q->where('nama_transaksi', 'like', '%' . $search . '%'))
                ->when($tahun, fn($q) => $q->whereYear('tanggal', $tahun))
                ->when($bulan, fn($q) => $q->whereMonth('tanggal', $bulan))
                ->when($jenis, fn($q) => $q->where('jenis', $jenis))
                ->orderBy('tanggal', 'desc');
        }

        if ($currentRole === 'rt') {
            $transaksi = Transaksi::where(function ($query) use ($idRt) {
                $query->where(function ($q) use ($idRt) {
                    $q->whereNotNull('tagihan_id')
                        ->whereHas('tagihan.iuran', function ($subQuery) use ($idRt) {
                            $subQuery->where('id_rt', $idRt);
                        });
                })
                    ->orWhere(function ($q) use ($idRt) {
                        $q->whereNull('tagihan_id')
                            ->whereHas('rukunTetangga', function ($subQuery) use ($idRt) {
                                $subQuery->where('id', $idRt);
                            });
                    });
            })
                ->when($search, fn($q) => $q->where('nama_transaksi', 'like', '%' . $search . '%'))
                ->when($tahun, fn($q) => $q->whereYear('tanggal', $tahun))
                ->when($bulan, fn($q) => $q->whereMonth('tanggal', $bulan))
                ->when($jenis, fn($q) => $q->where('jenis', $jenis))
                ->orderBy('tanggal', 'desc');
        }

        if (!$bulan) {
            $transaksi->whereMonth('tanggal', now()->month);
        }

        if (!$tahun) {
            $transaksi->whereYear('tanggal', now()->year);
        }

        $getBulan = $transaksi->clone()
            ->selectRaw('tanggal, MONTH(tanggal) as bulan, MONTHNAME(tanggal) as nama_bulan')
            ->distinct()
            ->orderBy('tanggal', 'desc')
            ->orderBy('bulan', 'asc')
            ->get();

        $getTahun = $transaksi->clone()
            ->selectRaw('tanggal, YEAR(tanggal) as tahun')
            ->distinct()
            ->orderBy('tanggal', 'desc')
            ->orderBy('tahun', 'asc')
            ->get();

        $allTransaksi = (clone $transaksi)->paginate(10, ['*'], 'transaksi_page');

        $pemasukan = (clone $transaksi)->where('jenis', 'pemasukan')->paginate(10, ['*'], 'pemasukan_page');
        $pengeluaran = (clone $transaksi)->where('jenis', 'pengeluaran')->paginate(10, ['*'], 'pengeluaran_page');

        $totalPemasukan = (clone $transaksi)->where('jenis', 'pemasukan')->sum('nominal');
        $totalPengeluaran = (clone $transaksi)->where('jenis', 'pengeluaran')->sum('nominal');
        $totalKeuangan = $totalPemasukan - $totalPengeluaran;

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


        return Inertia::render('LaporanKeuangan', [
            'title' => $title,
            'pemasukan' => $pemasukan,
            'pengeluaran' => $pengeluaran,
            'transaksi' => $allTransaksi,
            'daftar_tahun' => $daftar_tahun,
            'daftar_bulan' => $daftar_bulan,
            'totalPemasukan' => $totalPemasukan,
            'totalPengeluaran' => $totalPengeluaran,
            'totalKeuangan' => $totalKeuangan,
            'getBulan' => $getBulan,
            'getTahun' => $getTahun,
        ]);
    }

    public function laporanPengaduan(Request $request)
    {
        $title = 'Informasi Pengaduan';

        $currentRole = session('active_role');
        $idRw = Auth::user()->rw->id ?? null;
        $idRt = Auth::user()->rukunTetangga->id ?? null;

        $search = $request->input('search');
        $tahun = $request->input('tahun');
        $bulan = $request->input('bulan');
        $kategori = $request->input('kategori');
        $status = $request->input('status');

        if ($currentRole === 'admin') {
            $pengaduan = Pengaduan::query()->with(['warga'])
                ->when($search, fn($q) => $q->where('judul', 'like', '%' . $search . '%'))
                ->when($tahun, fn($q) => $q->whereYear('created_at', $tahun))
                ->when($bulan, fn($q) => $q->whereMonth('created_at', $bulan))
                ->when($kategori, fn($q) => $q->where('level', $kategori))
                ->when($status, fn($q) => $q->where('status', $status))
                ->orderBy('created_at', 'desc');
        }

        if ($currentRole === 'rw') {
            $pengaduan = Pengaduan::with(['warga'])->where(function ($query) use ($idRw) {
                $query->where(function ($q) use ($idRw) {
                    $q->where('level', 'rw')
                        ->whereHas('warga.kartuKeluarga.rw', function ($subQuery) use ($idRw) {
                            $subQuery->where('id', $idRw);
                        });
                })->orWhere(function ($q) use ($idRw) {
                    $q->where('level', 'rt')
                        ->whereHas('warga.kartuKeluarga.rukunTetangga.rw', function ($subQuery) use ($idRw) {
                            $subQuery->where('id', $idRw);
                        });
                });
            })->when($search, fn($q) => $q->where('judul', 'like', '%' . $search . '%'))
                ->when($tahun, fn($q) => $q->whereYear('created_at', $tahun))
                ->when($bulan, fn($q) => $q->whereMonth('created_at', $bulan))
                ->when($kategori, fn($q) => $q->where('level', $kategori))
                ->when($status, fn($q) => $q->where('status', $status))
                ->orderBy('created_at', 'desc');
        }

        if ($currentRole === 'rt') {
            $pengaduan = Pengaduan::with(['warga'])->where(function ($query) use ($idRt) {
                $query->where(function ($q) use ($idRt) {
                    $q->where('level', 'rt')
                        ->whereHas('warga.kartuKeluarga.rukunTetangga', function ($subQuery) use ($idRt) {
                            $subQuery->where('id', $idRt);
                        });
                });
            })->when($search, fn($q) => $q->where('judul', 'like', '%' . $search . '%'))
                ->when($tahun, fn($q) => $q->whereYear('created_at', $tahun))
                ->when($bulan, fn($q) => $q->whereMonth('created_at', $bulan))
                ->when($kategori, fn($q) => $q->where('level', $kategori))
                ->when($status, fn($q) => $q->where('status', $status))
                ->orderBy('created_at', 'desc');
        }

        $allPengaduan = (clone $pengaduan)->paginate(10, ['*'], 'pengaduan_page');

        $daftar_tahun = Pengaduan::selectRaw('YEAR(created_at) as tahun')
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
                $pengaduan->fresh()
            );
        }

        return Inertia::render('LaporanPengaduan', [
            'title' => $title,
            'pengaduan' => $allPengaduan,
            'daftar_tahun' => $daftar_tahun,
            'daftar_bulan' => $daftar_bulan,
        ]);
    }
}
