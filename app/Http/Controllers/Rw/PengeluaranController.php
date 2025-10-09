<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Pengeluaran; // Import model Pengeluaran
use Illuminate\Http\Request;
use Carbon\Carbon; // Digunakan untuk manipulasi tanggal

class PengeluaranController extends Controller
{
    /**
     * Menampilkan daftar semua transaksi (pemasukan dan pengeluaran).
     */
    public function index(Request $request)
    {
        $title = 'Laporan Keuangan';

        // Mengambil semua tahun unik dari kolom 'tanggal'
        $daftar_tahun = Pengeluaran::selectRaw('YEAR(tanggal) as tahun')
                                 ->distinct()
                                 ->orderBy('tahun', 'desc')
                                 ->pluck('tahun');
        $daftar_bulan = range(1, 12); // Daftar bulan 1 sampai 12

        // Memulai query untuk mengambil data transaksi
        $queryTransaksi = Pengeluaran::query();

        // Filter berdasarkan pencarian (nama_transaksi atau keterangan)
        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $queryTransaksi->where(function ($q) use ($searchTerm) {
                $q->where('nama_transaksi', 'like', $searchTerm)
                  ->orWhere('keterangan', 'like', $searchTerm)
                  ->orWhere('rt', 'like', $searchTerm); // Tambahkan pencarian RT
            });
        }

        // Filter berdasarkan tahun
        if ($request->filled('tahun')) {
            $queryTransaksi->whereYear('tanggal', $request->tahun);
        }

        // Filter berdasarkan bulan
        if ($request->filled('bulan')) {
            $queryTransaksi->whereMonth('tanggal', $request->bulan);
        }

        // Filter berdasarkan RT
        if ($request->filled('rt')) {
            $queryTransaksi->where('rt', $request->rt);
        }

        // Ambil semua data transaksi yang sudah diurutkan berdasarkan tanggal
        $transaksi = $queryTransaksi->orderBy('tanggal', 'asc')->get();

        // Tambahkan perhitungan sisa uang secara kumulatif
        $sisa_uang_akumulatif = 0;
        $transaksi = $transaksi->map(function ($item) use (&$sisa_uang_akumulatif) {
            // Mengambil nilai pemasukan dan pengeluaran, mengonversinya ke float.
            // Jika kolom string kosong atau tidak valid, anggap 0.
            $pemasukan_value = (float) filter_var($item->pemasukan, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
            $pengeluaran_value = (float) filter_var($item->pengeluaran, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);

            // Jika kedua kolom pemasukan dan pengeluaran terisi, ini adalah ambiguitas data.
            // Untuk tujuan perhitungan sisa uang, kita akan mengutamakan pengeluaran jika ada,
            // atau Anda bisa menyesuaikan logika ini sesuai kebutuhan bisnis Anda.
            // Contoh: Jika ada pemasukan dan pengeluaran di baris yang sama,
            // kita bisa menganggapnya sebagai transaksi net.
            if ($pemasukan_value > 0 && $pengeluaran_value > 0) {
                // Ini adalah skenario data yang ambigu berdasarkan desain migrasi.
                // Anda mungkin perlu menentukan apakah ini berarti:
                // 1. Ini adalah net: $pemasukan_value - $pengeluaran_value
                // 2. Prioritas: Misalnya, jika ada pengeluaran, itu yang dihitung.
                // Untuk contoh ini, kita akan menganggapnya sebagai net effect pada sisa uang.
                $sisa_uang_akumulatif += ($pemasukan_value - $pengeluaran_value);
            } elseif ($pemasukan_value > 0) {
                $sisa_uang_akumulatif += $pemasukan_value;
            } elseif ($pengeluaran_value > 0) {
                $sisa_uang_akumulatif -= $pengeluaran_value;
            }

            $item->pemasukan_display = $pemasukan_value;
            $item->pengeluaran_display = $pengeluaran_value;
            $item->sisa_uang = $sisa_uang_akumulatif;
            return $item;
        });

        // Pagination manual karena kita memanipulasi koleksi setelah query
        $perPage = 10; // Jumlah item per halaman
        $page = $request->get('page', 1); // Halaman saat ini, default 1
        $offset = ($page - 1) * $perPage;

        $paginatedTransaksi = new \Illuminate\Pagination\LengthAwarePaginator(
            $transaksi->slice($offset, $perPage)->values(),
            $transaksi->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return view('rw.pengeluaran.index', compact(
            'title',
            'paginatedTransaksi',
            'daftar_tahun',
            'daftar_bulan'
            // 'rukun_tetangga' // Jika Anda memiliki daftar RT dari tabel lain, sertakan di sini
        ));
    }

    /**
     * Menampilkan form untuk membuat transaksi baru.
     * Karena tidak ada 'jenis_transaksi' sebagai pilihan di migrasi,
     * form ini akan memiliki input untuk 'pemasukan' dan 'pengeluaran' secara langsung.
     */
    public function create()
    {
        $title = 'Tambah Transaksi Baru';
        // Di sini Anda bisa menyiapkan data yang mungkin dibutuhkan form, misal daftar RT jika ada
        return view('rw.pengeluaran.create', compact('title'));
    }

    /**
     * Menyimpan transaksi baru ke database.
     */
    public function store(Request $request)
    {
        $request->validate([
            'rt'             => 'required|string|max:255',
            'tanggal'        => 'required|date',
            // Validasi: salah satu dari pemasukan atau pengeluaran harus diisi dan berupa numerik
            'pemasukan'      => 'nullable|numeric|min:0',
            'pengeluaran'    => 'nullable|numeric|min:0',
            'nama_transaksi' => 'required|string|max:255',
            'jumlah'         => 'required|numeric|min:0',
            'keterangan'     => 'nullable|string|max:255',
        ]);

        // Pastikan hanya satu dari pemasukan atau pengeluaran yang diisi, atau tangani keduanya
        // Jika keduanya diisi, tentukan prioritas atau gabungkan (misal: net effect)
        // Contoh: Jika pengguna mengisi keduanya, kita bisa menganggap salah satunya sebagai 0
        // Atau Anda bisa menambahkan validasi kustom di form request agar hanya satu yang boleh diisi
        if ($request->filled('pemasukan') && $request->filled('pengeluaran')) {
            // Ini adalah skenario ambigu: Pemasukan dan Pengeluaran diisi bersamaan.
            // Anda perlu memutuskan bagaimana menanganinya.
            // Opsi 1: Prioritaskan salah satu (misal: pengeluaran)
            // Opsi 2: Hitung net effect dan simpan ke kolom 'jumlah' (jika jumlah digunakan untuk net)
            // Opsi 3: Tampilkan error validasi kustom
            // Untuk saat ini, kita akan menyimpan keduanya seperti yang diinput,
            // dan logika perhitungan sisa uang di index akan menanganinya.
        }

        Pengeluaran::create([
            'rt'             => $request->rt,
            'tanggal'        => $request->tanggal,
            'pemasukan'      => $request->pemasukan, // Simpan sebagai string (atau null)
            'pengeluaran'    => $request->pengeluaran, // Simpan sebagai string (atau null)
            'nama_transaksi' => $request->nama_transaksi,
            'jumlah'         => $request->jumlah,
            'keterangan'     => $request->keterangan,
        ]);

        return redirect()->route('pengeluaran.index')->with('success', 'Data transaksi berhasil ditambahkan!');
    }

    /**
     * Menampilkan form untuk mengedit transaksi tertentu.
     */
    public function edit(string $id)
    {
        $transaksi = Pengeluaran::findOrFail($id);
        $title = 'Edit Transaksi';
        return view('rw.pengeluaran.edit', compact('title', 'transaksi'));
    }

    /**
     * Memperbarui transaksi tertentu di database.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'rt'             => 'required|string|max:255',
            'tanggal'        => 'required|date',
            'pemasukan'      => 'nullable|numeric|min:0',
            'pengeluaran'    => 'nullable|numeric|min:0',
            'nama_transaksi' => 'required|string|max:255',
            'jumlah'         => 'required|numeric|min:0',
            'keterangan'     => 'nullable|string|max:255',
        ]);

        $transaksi = Pengeluaran::findOrFail($id);
        $transaksi->update([
            'rt'             => $request->rt,
            'tanggal'        => $request->tanggal,
            'pemasukan'      => $request->pemasukan,
            'pengeluaran'    => $request->pengeluaran,
            'nama_transaksi' => $request->nama_transaksi,
            'jumlah'         => $request->jumlah,
            'keterangan'     => $request->keterangan,
        ]);

        return redirect()->route('pengeluaran.index')->with('success', 'Data transaksi berhasil diperbarui!');
    }

    /**
     * Menghapus transaksi tertentu dari database.
     */
    public function destroy(string $id)
    {
        $transaksi = Pengeluaran::findOrFail($id);
        $transaksi->delete();

        return redirect()->route('pengeluaran.index')->with('success', 'Data transaksi berhasil dihapus!');
    }

    // Metode ini mungkin tidak lagi diperlukan secara terpisah jika filter di index sudah cukup
    public function pengeluaranBulanan($bulan, $tahun)
    {
        return redirect()->route('pengeluaran.index', ['bulan' => $bulan, 'tahun' => $tahun]);
    }
}