<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Rt;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Exports\TransaksiExport;
use Maatwebsite\Excel\Facades\Excel;

class RwTransaksiController extends Controller
{
    /**
     * Menampilkan daftar transaksi dengan filter.
     */
    public function index(Request $request)
    {
        $title = 'Data Transaksi Keuangan';

        $query = Transaksi::query();

        // Filter pencarian
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nama_transaksi', 'like', '%' . $search . '%')
                  ->orWhere('rt', 'like', '%' . $search . '%')
                  ->orWhere('keterangan', 'like', '%' . $search . '%');
            });
        }

        if ($request->filled('tahun')) {
            $query->whereYear('tanggal', $request->input('tahun'));
        }

        if ($request->filled('bulan')) {
            $query->whereMonth('tanggal', $request->input('bulan'));
        }

        if ($request->filled('rt')) {
            $query->where('rt', $request->input('rt'));
        }

        $transaksi = (clone $query)->orderBy('tanggal', 'desc')->get();
        $paginatedTransaksi = $query->orderBy('tanggal', 'desc')->paginate(10);

        $daftar_tahun = Transaksi::selectRaw('YEAR(tanggal) as tahun')
                                ->distinct()
                                ->orderBy('tahun', 'desc')
                                ->pluck('tahun');
        $daftar_bulan = range(1, 12);

        $rukun_tetangga = Rt::orderBy('rt', 'asc')->pluck('rt', 'rt');

        return view('rw.iuran.transaksi', compact(
            'title',
            'paginatedTransaksi',
            'transaksi',
            'daftar_tahun',
            'daftar_bulan',
            'rukun_tetangga'
        ));
    }

    /**
     * Tambah transaksi baru.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'rt'             => 'required|string|max:10|exists:rukun_tetangga,rt',
            'tanggal'        => 'required|date',
            'nama_transaksi' => 'required|string|max:255',
            'jenis'          => 'required|in:pemasukan,pengeluaran',
            'nominal'        => 'required|numeric|min:0',
            'keterangan'     => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                        ->withErrors($validator)
                        ->withInput()
                        ->with('modal_type', 'add');
        }

        try {
            Transaksi::create($validator->validated());

            return redirect()->route('rw.transaksi.index')->with('success', 'Transaksi berhasil ditambahkan.');
        } catch (\Exception $e) {
            Log::error('Gagal menambahkan transaksi:', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
            return redirect()->back()->withInput()->with('error', 'Terjadi kesalahan.');
        }
    }

    /**
     * Update transaksi.
     */
    public function update(Request $request, $id)
    {
        $transaksi = Transaksi::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'rt'             => 'required|string|max:10|exists:rukun_tetangga,rt',
            'tanggal'        => 'required|date',
            'nama_transaksi' => 'required|string|max:255',
            'jenis'          => 'required|in:pemasukan,pengeluaran',
            'nominal'        => 'required|numeric|min:0',
            'keterangan'     => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                        ->withErrors($validator)
                        ->withInput()
                        ->with('modal_type', 'edit')
                        ->with('edit_item_id', $id);
        }

        try {
            $transaksi->update($validator->validated());

            return redirect()->route('rw.transaksi.index')->with('success', 'Transaksi berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Gagal update transaksi:', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
            return redirect()->back()->withInput()->with('error', 'Terjadi kesalahan.');
        }
    }

    /**
     * Hapus transaksi.
     */
    public function destroy($id)
    {
        try {
            $transaksi = Transaksi::findOrFail($id);
            $transaksi->delete();

            return redirect()->route('rw.transaksi.index')->with('success', 'Transaksi berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Gagal hapus transaksi:', ['message' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Terjadi kesalahan.');
        }
    }
}
