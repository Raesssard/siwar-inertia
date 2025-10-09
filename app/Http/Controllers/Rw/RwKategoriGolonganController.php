<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Kategori_golongan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RwKategoriGolonganController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $kategori_golongan = Kategori_golongan::when($search, function ($query, $search) {
            $query->where('nama', 'like', '%' . $search . '%')
                  ->orWhere('keterangan', 'like', '%' . $search . '%');
        })->orderBy('nama', 'asc')->paginate(5)->withQueryString();

        $title = 'Kategori Golongan';

        return view('rw.golongan.kategori_golongan', compact('kategori_golongan', 'title'));
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
        $request->validate([
            'jenis' => 'required|string|max:255',
            'keterangan' => 'nullable|string|max:500',
        ], [
            'jenis.required' => 'jenis kategori golongan harus diisi.',
            'jenis.string' => 'jenis kategori golongan harus berupa teks.',
            'jenis.max' => 'jenis kategori golongan tidak boleh lebih dari 255 karakter.',
            'keterangan.string' => 'Keterangan harus berupa teks.',
            'keterangan.max' => 'Keterangan tidak boleh lebih dari 500 karakter.',
        ]);

        Kategori_golongan::create([
            'jenis' => $request->jenis,
            'keterangan' => $request->keterangan,
        ]);

        return redirect()->route('kategori_golongan.index')->with('success', 'Kategori golongan berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $kategori_golongan = Kategori_golongan::findOrFail($id);
        return view('kategori_golongan.show', compact('kategori_golongan'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $kategori_golongan = Kategori_golongan::findOrFail($id);
        return view('kategori_golongan.edit', compact('kategori_golongan'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'keterangan' => 'nullable|string|max:500',
        ], [
            'nama.required' => 'Nama kategori golongan harus diisi.',
            'nama.string' => 'Nama kategori golongan harus berupa teks.',
            'nama.max' => 'Nama kategori golongan tidak boleh lebih dari 255 karakter.',
            'keterangan.string' => 'Keterangan harus berupa teks.',
            'keterangan.max' => 'Keterangan tidak boleh lebih dari 500 karakter.',
        ]);

        $kategori_golongan = Kategori_golongan::findOrFail($id);
        $kategori_golongan->update([
            'nama' => $request->nama,
            'keterangan' => $request->keterangan,
        ]);

        return redirect()->route('kategori_golongan.index')->with('success', 'Kategori golongan berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $kategori_golongan = Kategori_golongan::findOrFail($id);
        $kategori_golongan->delete();
        return redirect()->route('kategori_golongan.index')->with('success', 'Kategori golongan berhasil dihapus.');
    }
}
