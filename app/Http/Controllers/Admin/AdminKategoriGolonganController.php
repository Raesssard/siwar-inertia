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

        // 🔍 Filter by jenis dari database
        if ($request->filled('jenis')) {
            $query->where('jenis', $request->jenis);
        }

        $kategori = $query->paginate(5)->withQueryString();

        // 🔹 Ambil distinct jenis langsung dari tabel
        $jenisList = Kategori_golongan::select('jenis')->distinct()->pluck('jenis');

        return Inertia::render('Admin/KategoriGolongan', [
            'kategori' => $kategori,
            'filters'  => $request->only(['jenis']),
            'jenisList' => $jenisList,
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

    public function update(Request $request, string $id)
    {
        $request->validate([
            'jenis' => 'required|string|unique:kategori_golongan,jenis,' . $id,
        ]);

        $kategori = Kategori_golongan::findOrFail($id);
        $kategori->update([
            'jenis' => $request->jenis,
        ]);

        return redirect()->route('admin.kategori-golongan.index')
            ->with('success', 'Kategori golongan berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        try {
            $kategori = Kategori_golongan::findOrFail($id);
            $kategori->delete();

            return redirect()->back()->with('success', 'Kategori golongan berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
