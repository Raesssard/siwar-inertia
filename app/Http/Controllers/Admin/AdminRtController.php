<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\User;
use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminRtController extends Controller
{
    public function index(Request $request)
    {
        $title = 'Rukun Tetangga';
        $query = Rt::query();

        // 🔍 Filter keyword (nama atau NIK)
        if ($request->filled('keyword')) {
            $query->where(function ($q) use ($request) {
                $q->where('nik', 'like', "%{$request->keyword}%")
                    ->orWhere('nama_ketua_rt', 'like', "%{$request->keyword}%");
            });
        }

        // 🔢 Filter nomor RT
        if ($request->filled('nomor_rt')) {
            $query->where('nomor_rt', $request->nomor_rt);
        }

        $rukun_tetangga = $query->with('rw')->paginate(5)->withQueryString();

        // Ambil semua nomor RT unik
        $nomorRtList = Rt::select('nomor_rt')
            ->distinct()
            ->orderBy('nomor_rt')
            ->pluck('nomor_rt');

        // Ambil semua RW untuk dropdown
        $rwList = Rw::select('id', 'nomor_rw', 'nama_ketua_rw')->get();

        return Inertia::render('Admin/Rt', [
            'rukun_tetangga' => $rukun_tetangga,
            'filters'        => $request->only(['keyword', 'nomor_rt']),
            'nomorRtList'    => $nomorRtList,
            'rwList'         => $rwList,
            'title'    => $title,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nik'             => 'required|unique:rt,nik',
            'id_rw'           => 'required|exists:rw,id',
            'nomor_rt'        => ['required', 'regex:/^[0-9]{2}$/'],
            'nama_ketua_rt'   => 'required|string|max:255',
            'mulai_menjabat'  => 'required|date',
            'akhir_jabatan'   => 'required|date|after:mulai_menjabat',
            'status'          => ['required', Rule::in(['aktif', 'nonaktif'])],
            'jabatan'         => ['required', Rule::in(['ketua', 'sekretaris', 'bendahara'])],
        ]);

        $warga = Warga::where('nik', $request->nik)->first();
        if (!$warga) {
            return back()->withErrors(['nik' => 'NIK tidak ditemukan di data warga.'])->withInput();
        }

        if ($warga->nama !== $request->nama_ketua_rt) {
            return back()->withErrors(['nama_ketua_rt' => 'Nama tidak sesuai dengan NIK yang dipilih.'])->withInput();
        }

        // 🚫 Cegah jabatan ganda aktif di RT yang sama dalam RW
        $existing = Rt::where('nomor_rt', $request->nomor_rt)
            ->where('id_rw', $request->id_rw)
            ->where('status', 'aktif')
            ->whereHas('user.roles', function ($q) use ($request) {
                $q->where('name', $request->jabatan);
            })
            ->exists();

        if ($existing) {
            return redirect()
                ->back()
                ->with('error', "RT {$request->nomor_rt} di RW ini sudah memiliki {$request->jabatan} aktif!")
                ->withInput();
        }

        // ✅ Simpan data RT
        $rt = Rt::create([
            'nik'            => $request->nik,
            'no_kk'          => $warga->no_kk,
            'nomor_rt'       => $request->nomor_rt,
            'nama_ketua_rt'  => $request->nama_ketua_rt,
            'mulai_menjabat' => $request->mulai_menjabat,
            'akhir_jabatan'  => $request->akhir_jabatan,
            'id_rw'          => $request->id_rw,
            'status'         => $request->status,
        ]);

        // 🧩 Buat atau update user
        $user = User::firstOrNew(['nik' => $request->nik]);
        $user->fill([
            'nama'   => $request->nama_ketua_rt,
            'id_rt'  => $rt->id,
            'id_rw'  => $request->id_rw,
        ]);
        if (!$user->exists) {
            $user->password = Hash::make('password');
        }
        $user->save();

        // 🧩 Assign role sesuai jabatan
        if ($request->jabatan === 'ketua') {
            $user->syncRoles(['rt']);
        } elseif ($request->jabatan === 'sekretaris') {
            $user->syncRoles(['rt', 'sekretaris']);
        } elseif ($request->jabatan === 'bendahara') {
            $user->syncRoles(['rt', 'bendahara']);
        }

        return redirect()->route('admin.rt.index')
            ->with('success', 'RT berhasil ditambahkan.');
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'nik'             => 'required|exists:warga,nik',
            'id_rw'           => 'required|exists:rw,id',
            'nomor_rt'        => ['required', 'regex:/^[0-9]{2}$/'],
            'nama_ketua_rt'   => 'required|string|max:255',
            'mulai_menjabat'  => 'required|date',
            'akhir_jabatan'   => 'required|date|after:mulai_menjabat',
            'status'          => ['required', Rule::in(['aktif', 'nonaktif'])],
            'jabatan'         => ['required', Rule::in(['ketua', 'sekretaris', 'bendahara'])],
        ]);

        $warga = Warga::where('nik', $request->nik)->first();
        if (!$warga) {
            return back()->withErrors(['nik' => 'NIK tidak ditemukan di data warga.'])->withInput();
        }

        if ($warga->nama !== $request->nama_ketua_rt) {
            return back()->withErrors(['nama_ketua_rt' => 'Nama tidak sesuai dengan NIK yang dipilih.'])->withInput();
        }

        // 🚫 Cegah jabatan ganda aktif di RT yang sama (kecuali dirinya sendiri)
        $existing = Rt::where('nomor_rt', $request->nomor_rt)
            ->where('id_rw', $request->id_rw)
            ->where('status', 'aktif')
            ->where('id', '!=', $id)
            ->whereHas('user.roles', function ($q) use ($request) {
                $q->where('name', $request->jabatan);
            })
            ->exists();

        if ($existing) {
            return redirect()
                ->back()
                ->with('error', "RT {$request->nomor_rt} di RW ini sudah memiliki {$request->jabatan} aktif!")
                ->withInput();
        }

        $rt = Rt::findOrFail($id);
        $rt->update([
            'nik'            => $request->nik,
            'no_kk'          => $warga->no_kk,
            'nomor_rt'       => $request->nomor_rt,
            'nama_ketua_rt'  => $request->nama_ketua_rt,
            'mulai_menjabat' => $request->mulai_menjabat,
            'akhir_jabatan'  => $request->akhir_jabatan,
            'id_rw'          => $request->id_rw,
            'status'         => $request->status,
        ]);

        $user = User::firstOrNew(['nik' => $request->nik]);
        $user->fill([
            'nama'   => $request->nama_ketua_rt,
            'id_rt'  => $rt->id,
            'id_rw'  => $request->id_rw,
        ]);
        if (!$user->exists) {
            $user->password = Hash::make('password');
        }
        $user->save();

        // 🧩 Assign role sesuai jabatan
        if ($request->jabatan === 'ketua') {
            $user->syncRoles(['rt']);
        } elseif ($request->jabatan === 'sekretaris') {
            $user->syncRoles(['rt', 'sekretaris']);
        } elseif ($request->jabatan === 'bendahara') {
            $user->syncRoles(['rt', 'bendahara']);
        }

        return redirect()->route('admin.rt.index')
            ->with('success', 'RT berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        try {
            $rt = Rt::findOrFail($id);

            // 🚫 Cegah hapus jika RT masih aktif
            if ($rt->status === 'aktif') {
                return redirect()->back()->with('error', 'RT masih berstatus aktif dan tidak bisa dihapus.');
            }

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
