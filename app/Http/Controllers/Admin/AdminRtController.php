<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rt;
use App\Models\User;
use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AdminRtController extends Controller
{
    public function index(Request $request)
    {
        $query = Rt::query();

        // Filter keyword
        if ($request->filled('keyword')) {
            $query->where(function ($q) use ($request) {
                $q->where('nik', 'like', "%{$request->keyword}%")
                  ->orWhere('nama_ketua_rt', 'like', "%{$request->keyword}%");
            });
        }

        // Filter nomor_rt
        if ($request->filled('nomor_rt')) {
            $query->where('nomor_rt', $request->nomor_rt);
        }

        $rukun_tetangga = $query->paginate(5)->withQueryString();

        // Ambil semua nomor_rt unik
        $nomorRtList = Rt::select('nomor_rt')
            ->distinct()
            ->orderBy('nomor_rt')
            ->pluck('nomor_rt');

        return Inertia::render('Admin/Rt', [
            'rukun_tetangga' => $rukun_tetangga,
            'filters'        => $request->only(['keyword', 'nomor_rt']),
            'nomorRtList'    => $nomorRtList,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nik'             => 'required|unique:rt,nik',
            'nomor_rt'        => ['required', 'regex:/^[0-9]{2}$/'],
            'nama_ketua_rt'   => 'required|string|max:255',
            'mulai_menjabat'  => 'required|date',
            'akhir_jabatan'   => 'required|date|after:mulai_menjabat',
        ]);

        $warga = Warga::where('nik', $request->nik)->first();
        if (!$warga) {
            return back()->withErrors(['nik' => 'NIK tidak ditemukan di data warga.'])->withInput();
        }

        if ($warga->nama !== $request->nama_ketua_rt) {
            return back()->withErrors(['nama_ketua_rt' => 'Nama tidak sesuai dengan NIK yang dipilih.'])->withInput();
        }

        $rt = Rt::create([
            'nik'            => $request->nik,
            'no_kk'          => $warga->no_kk,
            'nomor_rt'       => $request->nomor_rt,
            'nama_ketua_rt'  => $request->nama_ketua_rt,
            'mulai_menjabat' => $request->mulai_menjabat,
            'akhir_jabatan'  => $request->akhir_jabatan,
            'id_rw'          => 1, // default sementara
        ]);

        $user = User::firstOrNew(['nik' => $request->nik]);
        $user->fill([
            'nama'     => $request->nama_ketua_rt,
            'id_rt'    => $rt->id,
            'id_rw'    => 1,
        ]);
        if (!$user->exists) {
            $user->password = Hash::make('password');
        }
        $user->save();

        if (!$user->hasRole('rt')) {
            $user->assignRole('rt');
        }

        return redirect()->route('admin.rt.index')
                         ->with('success', 'RT berhasil ditambahkan.');
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'nik'             => 'required|exists:warga,nik',
            'nomor_rt'        => ['required', 'regex:/^[0-9]{2}$/'],
            'nama_ketua_rt'   => 'required|string|max:255',
            'mulai_menjabat'  => 'required|date',
            'akhir_jabatan'   => 'required|date|after:mulai_menjabat',
        ]);

        $warga = Warga::where('nik', $request->nik)->first();
        if (!$warga) {
            return back()->withErrors(['nik' => 'NIK tidak ditemukan di data warga.'])->withInput();
        }

        if ($warga->nama !== $request->nama_ketua_rt) {
            return back()->withErrors(['nama_ketua_rt' => 'Nama tidak sesuai dengan NIK yang dipilih.'])->withInput();
        }

        $rt = Rt::findOrFail($id);
        $rt->update([
            'nik'            => $request->nik,
            'no_kk'          => $warga->no_kk,
            'nomor_rt'       => $request->nomor_rt,
            'nama_ketua_rt'  => $request->nama_ketua_rt,
            'mulai_menjabat' => $request->mulai_menjabat,
            'akhir_jabatan'  => $request->akhir_jabatan,
        ]);

        $user = User::firstOrNew(['nik' => $request->nik]);
        $user->fill([
            'nama'     => $request->nama_ketua_rt,
            'id_rt'    => $rt->id,
            'id_rw'    => 1,
        ]);
        if (!$user->exists) {
            $user->password = Hash::make('password');
        }
        $user->save();

        if (!$user->hasRole('rt')) {
            $user->assignRole('rt');
        }

        return redirect()->route('admin.rt.index')
                         ->with('success', 'RT berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        try {
            $rt = Rt::findOrFail($id);
            $user = User::where('id_rt', $rt->id)->first();

            if ($user) {
                if ($user->roles()->count() > 1) {
                    if ($user->hasRole('rt')) {
                        $user->removeRole('rt');
                    }
                    $user->update(['id_rt' => null]);
                } else {
                    $user->delete();
                }
            }

            $rt->delete();

            return redirect()->back()->with('success', 'RT berhasil dihapus.');
        } catch (\Illuminate\Database\QueryException $e) {
            return redirect()->back()->with('error', 'Tidak bisa menghapus RT karena masih digunakan.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
