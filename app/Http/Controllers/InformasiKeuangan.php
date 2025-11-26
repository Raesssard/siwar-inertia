<?php

namespace App\Http\Controllers;

use App\Models\Tagihan;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InformasiKeuangan extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $title = 'Informasi Keuangan';
        $currentRole = session('active_role');
        $idRw = Auth::user()->rw->id ?? null;
        $idRt = Auth::user()->rukunTetangga->id ?? null;

        if ($currentRole === 'rw') {
            // $tagihan = Tagihan::whereHas('iuran', function ($query) use ($idRw) {
            //     $query->where('id_rw', $idRw);
            // })->get();

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
            });

            $pemasukan = (clone $transaksi)->where('jenis', 'pemasukan')->paginate(10, ['*'], 'pemasukan_page');
            $pengeluaran = (clone $transaksi)->where('jenis', 'pengeluaran')->paginate(10, ['*'], 'pengeluaran_page');
        }

        if ($currentRole === 'rt') {
            // $tagihan = Tagihan::whereHas('iuran', function ($query) use ($idRt) {
            //     $query->where('id_rt', $idRt);
            // })->get();

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
            });

            $pemasukan = (clone $transaksi)->where('jenis', 'pemasukan')->paginate(10, ['*'], 'pemasukan_page');
            $pengeluaran = (clone $transaksi)->where('jenis', 'pengeluaran')->paginate(10, ['*'], 'pengeluaran_page');
        }

        return Inertia::render('InformasiKeuangan', [
            'title' => $title,
            'pemasukan' => $pemasukan,
            'pengeluaran' => $pengeluaran,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
