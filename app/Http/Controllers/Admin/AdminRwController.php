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

        // 🔍 Pencarian berdasarkan NIK atau Nama Ketua RW
        if ($request->filled('keyword')) {
            $query->where(function ($q) use ($request) {
                $q->where('nik', 'like', '%' . $request->keyword . '%')
                    ->orWhere('nama_ketua_rw', 'like', '%' . $request->keyword . '%');
            });
        }

        // 🔽 Filter nomor RW
        if ($request->filled('nomor_rw')) {
            $query->where('nomor_rw', $request->nomor_rw);
        }

        $rw = $query->orderBy('nomor_rw')->paginate(10)->withQueryString();
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
        // 🧾 Validasi input (jabatan tidak disimpan, hanya untuk assign role)
        $validator = Validator::make($request->all(), [
            'nik' => 'required|unique:rw,nik',
            'nomor_rw' => 'required|string',
            'nama_ketua_rw' => 'required|string|max:255',
            'mulai_menjabat' => 'required|date',
            'akhir_jabatan' => 'required|date|after_or_equal:mulai_menjabat',
            'status' => ['required', Rule::in(['aktif', 'nonaktif'])],
            'jabatan' => ['required', Rule::in(['ketua', 'sekretaris', 'bendahara'])],
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // 🚫 Cegah jabatan ganda aktif di RW yang sama
        $existing = User::whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->jabatan);
            })
            ->whereHas('rw', function ($q) use ($request) {
                $q->where('nomor_rw', $request->nomor_rw);
            })
            ->exists();

        if ($existing) {
            return redirect()
                ->back()
                ->with('error', "RW {$request->nomor_rw} sudah memiliki {$request->jabatan} aktif!")
                ->withInput();
        }

        // 💾 Simpan RW (tanpa jabatan)
        $rw = Rw::create($request->only([
            'nik',
            'nomor_rw',
            'nama_ketua_rw',
            'mulai_menjabat',
            'akhir_jabatan',
            'status',
        ]));

        // 👤 Buat user untuk RW
        $user = User::create([
            'nik' => $request->nik,
            'nama' => $request->nama_ketua_rw,
            'password' => bcrypt('password'),
            'id_rw' => $rw->id,
        ]);

        // 🧩 Assign role sesuai jabatan
        if ($request->jabatan === 'ketua') {
            $user->syncRoles(['rw']);
        } elseif ($request->jabatan === 'sekretaris') {
            $user->syncRoles(['rw', 'sekretaris']);
        } elseif ($request->jabatan === 'bendahara') {
            $user->syncRoles(['rw', 'bendahara']);
        }

        return redirect()->route('admin.rw.index')->with('success', 'RW baru berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $rw = Rw::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nik' => ['required', Rule::unique('rw')->ignore($id)],
            'nomor_rw' => 'required|string',
            'nama_ketua_rw' => 'required|string|max:255',
            'mulai_menjabat' => 'required|date',
            'akhir_jabatan' => 'required|date|after_or_equal:mulai_menjabat',
            'jabatan' => ['required', Rule::in(['ketua', 'sekretaris', 'bendahara'])],
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // 🚫 Cegah jabatan ganda aktif di RW yang sama
        $existing = User::whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->jabatan);
            })
            ->whereHas('rw', function ($q) use ($request, $rw) {
                $q->where('nomor_rw', $request->nomor_rw)
                  ->where('id', '!=', $rw->id);
            })
            ->exists();

        if ($existing) {
            return redirect()
                ->back()
                ->with('error', "RW {$request->nomor_rw} sudah memiliki {$request->jabatan} aktif!")
                ->withInput();
        }

        // 🔄 Update data RW
        $rw->update($request->only([
            'nik',
            'nomor_rw',
            'nama_ketua_rw',
            'mulai_menjabat',
            'akhir_jabatan',
        ]));

        // 🔁 Update user & role
        $user = User::where('id_rw', $rw->id)->first();

        if ($user) {
            $user->update([
                'nik' => $request->nik,
                'nama' => $request->nama_ketua_rw,
            ]);

            if ($request->jabatan === 'ketua') {
                $user->syncRoles(['rw']);
            } elseif ($request->jabatan === 'sekretaris') {
                $user->syncRoles(['rw', 'sekretaris']);
            } elseif ($request->jabatan === 'bendahara') {
                $user->syncRoles(['rw', 'bendahara']);
            }
        }

        return redirect()->route('admin.rw.index')->with('success', 'Data RW berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */

    public function destroy(string $id)
    {
        try {
            $rw = Rw::findOrFail($id);

            // 🚫 Cegah hapus jika RW masih aktif
            if ($rw->status === 'aktif') {
                return redirect()->back()->with('error', 'RW masih berstatus aktif dan tidak bisa dihapus.');
            }

            User::where('id_rw', $rw->id)->delete();
            $rw->delete();

            return redirect()->route('admin.rw.index')->with('success', 'Data RW berhasil dihapus.');
        } catch (\Illuminate\Database\QueryException $e) {
            return redirect()->back()->with('error', 'Tidak bisa menghapus RW karena masih digunakan.');
        }
    }

    public function toggleStatus($id)
    {
        $rw = Rw::findOrFail($id);

        // Jika sedang aktif, ubah jadi nonaktif
        if ($rw->status === 'aktif') {
            $rw->update(['status' => 'nonaktif']);
            return redirect()->back()->with('success', "RW {$rw->nomor_rw} berhasil dinonaktifkan.");
        }

        // Jika ingin diaktifkan, pastikan tidak ada RW lain dengan nomor sama yang aktif
        $existingActive = Rw::where('nomor_rw', $rw->nomor_rw)
            ->where('status', 'aktif')
            ->where('id', '!=', $rw->id)
            ->exists();

        if ($existingActive) {
            return redirect()->back()->with('error', "RW {$rw->nomor_rw} lainnya sudah aktif. Nonaktifkan dulu sebelum mengaktifkan yang ini.");
        }

        $rw->update(['status' => 'aktif']);

        return redirect()->back()->with('success', "RW {$rw->nomor_rw} berhasil diaktifkan.");
    }

}
