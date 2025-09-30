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
    public function index()
    {
        $rw = Rw::paginate(10);

        return Inertia::render('Admin/Rw', [
            'rw' => $rw
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
            'mulai_menjabat'=> 'required|date',
            'akhir_jabatan' => 'required|date',
        ]);

        $rw = Rw::create($request->only([
            'nik','nomor_rw','nama_ketua_rw','mulai_menjabat','akhir_jabatan'
        ]));

        $user = User::create([
            'nik' => $request->nik,
            'nama' => $request->nama_ketua_rw,
            'password' => bcrypt('password'),
            'id_rw' => $rw->id,
        ]);

        $user->assignRole('rw');

        return redirect()->route('admin.rw.index')->with('success', 'Rukun Warga berhasil ditambahkan.');
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
            'nik','nomor_rw','nama_ketua_rw','mulai_menjabat','akhir_jabatan'
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

        return redirect()->route('admin.rw.index')->with('success', 'Rukun Warga berhasil diperbarui.');
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

            return redirect()->back()->with('success', 'RW berhasil dihapus.');
        } catch (\Illuminate\Database\QueryException $e) {
            return redirect()->back()->with('error', 'Tidak bisa menghapus RW karena masih digunakan.');
        }
    }
}
