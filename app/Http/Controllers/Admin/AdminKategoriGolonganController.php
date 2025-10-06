<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kategori_golongan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminKategoriGolonganController extends Controller
{
    public function index(Request $request)
    {
        $query = Kategori_golongan::query();

        // 🔍 Pencarian teks (LIKE)
        if ($request->filled('jenis')) {
            $query->where('jenis', 'like', '%' . $request->jenis . '%');
        }

        $kategori = $query->orderBy('id', 'desc')->paginate(5)->withQueryString();

        return Inertia::render('Admin/KategoriGolongan', [
            'kategori' => $kategori,
            'filters'  => $request->only(['jenis']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'jenis' => 'required|string|unique:kategori_golongan,jenis',
        ]);

        Kategori_golongan::create([
            'jenis' => $request->jenis,
        ]);

        return redirect()->route('admin.kategori-golongan.index')
            ->with('success', 'Kategori golongan berhasil ditambahkan.');
    }

    public function update(Request $request, Kategori_golongan $kategori_golongan)
    {
        $request->validate([
            'jenis' => 'required|string|unique:kategori_golongan,jenis,' . $kategori_golongan->id,
        ]);

        $kategori_golongan->update([
            'jenis' => $request->jenis,
        ]);

        return redirect()->route('admin.kategori-golongan.index')
            ->with('success', 'Kategori golongan berhasil diperbarui.');
    }

    public function destroy(Kategori_golongan $kategori_golongan)
    {
        $kategori_golongan->delete();

        return redirect()->back()->with('success', 'Kategori golongan berhasil dihapus.');
    }
}
