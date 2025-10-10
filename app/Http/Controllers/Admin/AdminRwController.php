<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rw;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminRwController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $title = 'Rukun Warga';
        $query = Rw::query();

        // Search NIK atau Nama Ketua RW
        if ($request->filled('keyword')) {
            $query->where(function ($q) use ($request) {
                $q->where('nik', 'like', '%' . $request->keyword . '%')
                    ->orWhere('nama_ketua_rw', 'like', '%' . $request->keyword . '%');
            });
        }

        // Filter berdasarkan Nomor RW
        if ($request->filled('nomor_rw')) {
            $query->where('nomor_rw', $request->nomor_rw);
        }

        $rw = $query->paginate(10)->withQueryString();

        // Ambil semua nomor RW unik buat dropdown
        $nomorRwList = Rw::select('nomor_rw')->distinct()->orderBy('nomor_rw')->get();

        return Inertia::render('Admin/Rw', [
            'rw' => $rw,
            'filters' => $request->only(['keyword', 'nomor_rw']),
            'nomorRwList' => $nomorRwList,
            'title' => $title
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nik' => 'required|unique:rw,nik',
            'nomor_rw' => 'required|string',
            'nama_ketua_rw' => 'required|string|max:255',
            'mulai_menjabat' => 'required|date',
            'akhir_jabatan' => 'required|date',
        ]);

        $rw = Rw::create($request->only([
            'nik',
            'nomor_rw',
            'nama_ketua_rw',
            'mulai_menjabat',
            'akhir_jabatan'
        ]));

        $user = User::create([
            'nik' => $request->nik,
            'nama' => $request->nama_ketua_rw,
            'password' => bcrypt('password'),
            'id_rw' => $rw->id,
        ]);

        $user->assignRole('rw');

        // 🔥 Inertia redirect
        return Inertia::location(route('admin.rw.index'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'nik' => [
                'required',
                Rule::unique('rw')->ignore($id),
            ],
            'nomor_rw' => 'required|string',
            'nama_ketua_rw' => 'required|string|max:255',
            'mulai_menjabat' => 'required|date',
            'akhir_jabatan' => 'required|date',
        ]);

        if ($validator->fails()) {
            return redirect()
                ->back()
                ->withErrors($validator)
                ->withInput()
                ->with('edit_id', $id);
        }

        $rw = Rw::findOrFail($id);
        $oldNik = $rw->nik;

        $rw->update($request->only([
            'nik',
            'nomor_rw',
            'nama_ketua_rw',
            'mulai_menjabat',
            'akhir_jabatan'
        ]));

        $user = User::where('id_rw', $rw->id)->first();
        if ($user) {
            $user->update([
                'nik'  => $request->nik,
                'nama' => $request->nama_ketua_rw,
            ]);
        } else {
            User::where('nik', $oldNik)->update([
                'nik'  => $request->nik,
                'nama' => $request->nama_ketua_rw,
            ]);
        }

        // 🔥 Inertia redirect
        return Inertia::location(route('admin.rw.index'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $rw = Rw::findOrFail($id);

            User::where('id_rw', $rw->id)->delete();
            $rw->delete();

            // 🔥 Inertia redirect
            return Inertia::location(route('admin.rw.index'));
        } catch (\Illuminate\Database\QueryException $e) {
            return redirect()->back()->with('error', 'Tidak bisa menghapus RW karena masih digunakan.');
        }
    }
}
