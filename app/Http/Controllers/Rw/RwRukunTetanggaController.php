<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Kartu_keluarga;
use App\Models\Rt;
use App\Models\User;
use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class RwRukunTetanggaController extends Controller
{
    public function index(Request $request)
    {
        $id_rw = Auth::user()->id_rw;

        $title = 'Rukun Tetangga';
        $query = Rt::where('id_rw', $id_rw);

        // 🔍 Filter RT
        if ($request->filled('rt')) {
            $query->where('nomor_rt', $request->rt);
        }

        // 🔍 Filter pencarian nama / nik
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('nik', 'like', "%{$request->search}%")
                  ->orWhere('nama_ketua_rt', 'like', "%{$request->search}%");
            });
        }

        $rukun_tetangga = $query->orderBy('nomor_rt')->paginate(10)->withQueryString();

        // Ambil daftar RT unik
        $rukun_tetangga_filter = Rt::where('id_rw', $id_rw)
            ->select('nomor_rt')
            ->distinct()
            ->orderBy('nomor_rt')
            ->get();

        // Jabatan tetap statis
        $jabatan_filter = ['ketua', 'sekretaris', 'bendahara'];

        return inertia('Rw/Rt', [
            'rukun_tetangga' => $rukun_tetangga,
            'title' => $title,
            'filters' => $request->only(['rt', 'search']),
            'rukun_tetangga_filter' => $rukun_tetangga_filter,
            'jabatan_filter' => $jabatan_filter,
        ]);
    }

    public function store(Request $request)
    {
        $id_rw = Auth::user()->id_rw;

        $request->validate([
            'nik' => [
                'nullable', 'digits:16',
                Rule::exists('warga', 'nik'),
                Rule::unique('rt', 'nik')->where(fn($q) => $q->where('id_rw', $id_rw))
            ],
            'nomor_rt' => ['required', 'regex:/^[0-9]{2}$/'],
            'nama_ketua_rt' => 'nullable|string|max:255',
            'mulai_menjabat' => 'required|date',
            'akhir_jabatan' => 'required|date|after:mulai_menjabat',
            'jabatan' => ['required', Rule::in(['ketua', 'sekretaris', 'bendahara'])],
            'status' => ['required', Rule::in(['aktif', 'nonaktif'])],
        ]);

        $warga = Warga::where('nik', $request->nik)->first();
        if (!$warga) {
            return back()->withErrors(['nik' => 'NIK tidak ditemukan di data warga.'])->withInput();
        }

        if ($warga->nama !== $request->nama_ketua_rt) {
            return back()->withErrors(['nama_ketua_rt' => 'Nama tidak sesuai dengan NIK yang dipilih.'])->withInput();
        }

        // 🚫 Cegah jabatan aktif ganda di RT yang sama
        $exists = Rt::where('nomor_rt', $request->nomor_rt)
            ->where('id_rw', $id_rw)
            ->where('status', 'aktif')
            ->whereHas('user.roles', fn($q) => $q->where('name', $request->jabatan))
            ->exists();

        if ($exists) {
            return back()->with('error', "RT {$request->nomor_rt} sudah memiliki {$request->jabatan} aktif!")->withInput();
        }

        // ✅ Simpan RT
        $rt = Rt::create([
            'nik' => $request->nik,
            'no_kk' => $warga->no_kk,
            'nomor_rt' => $request->nomor_rt,
            'nama_ketua_rt' => $request->nama_ketua_rt,
            'mulai_menjabat' => $request->mulai_menjabat,
            'akhir_jabatan' => $request->akhir_jabatan,
            'id_rw' => Auth::user()->id_rw,
            'status' => $request->status,
        ]);

        // 🧩 Buat atau update user
        $user = User::firstOrNew(['nik' => $request->nik]);
        $user->fill([
            'nama' => $request->nama_ketua_rt,
            'id_rt' => $rt->id,
            'id_rw' => Auth::user()->id_rw,
        ]);
        if (!$user->exists) {
            $user->password = Hash::make('password');
        }
        $user->save();

        // 🧩 Assign role sesuai jabatan
        $roles = ['rt'];
        if ($request->jabatan === 'sekretaris') $roles[] = 'sekretaris';
        if ($request->jabatan === 'bendahara') $roles[] = 'bendahara';
        $user->syncRoles($roles);

        return back()->with('success', 'RT berhasil ditambahkan.');
    }

    public function update(Request $request, string $id)
    {
        $id_rw = Auth::user()->id_rw;

        $request->validate([
            'nik' => ['required', 'digits:16', Rule::exists('warga', 'nik')],
            'nomor_rt' => ['required', 'regex:/^[0-9]{2}$/'],
            'nama_ketua_rt' => 'required|string|max:255',
            'mulai_menjabat' => 'required|date',
            'akhir_jabatan' => 'required|date|after:mulai_menjabat',
            'jabatan' => ['required', Rule::in(['ketua', 'sekretaris', 'bendahara'])],
            'status' => ['required', Rule::in(['aktif', 'nonaktif'])],
        ]);

        $rt = Rt::findOrFail($id);
        if ($rt->id_rw !== $id_rw) {
            return back()->with('error', 'Tidak diizinkan memperbarui data RT lain.');
        }

        $rt->update([
            'nik' => $request->nik,
            'nomor_rt' => $request->nomor_rt,
            'nama_ketua_rt' => $request->nama_ketua_rt,
            'mulai_menjabat' => $request->mulai_menjabat,
            'akhir_jabatan' => $request->akhir_jabatan,
            'status' => $request->status,
        ]);

        $user = User::firstOrNew(['nik' => $request->nik]);
        $user->fill([
            'nama' => $request->nama_ketua_rt,
            'id_rt' => $rt->id,
            'id_rw' => Auth::user()->id_rw,
        ]);
        if (!$user->exists) $user->password = Hash::make('password');
        $user->save();

        // Assign ulang role
        $roles = ['rt'];
        if ($request->jabatan === 'sekretaris') $roles[] = 'sekretaris';
        if ($request->jabatan === 'bendahara') $roles[] = 'bendahara';
        $user->syncRoles($roles);

        return back()->with('success', 'Data RT berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        try {
            $rt = Rt::findOrFail($id);

            // Cegah hapus RT aktif
            if ($rt->status === 'aktif') {
                return back()->with('error', 'RT masih aktif dan tidak bisa dihapus.');
            }

            // Cari user yang terkait
            $user = User::where('id_rt', $rt->id)->first();

            if ($user) {
                $hasMultipleRoles = $user->roles()->count() > 1;

                if ($hasMultipleRoles) {
                    // 🔹 Hapus hanya role RT, jangan hapus user
                    if ($user->hasRole('rt')) {
                        $user->removeRole('rt');
                    }

                    // Kosongkan relasi id_rt
                    $user->update(['id_rt' => null]);
                } else {
                    // 🔹 Role cuma satu (RT doang) → hapus user
                    $user->delete();
                }
            }

            // Hapus RT
            $rt->delete();

            return back()->with('success', 'RT berhasil dihapus.');
        } catch (\Exception $e) {
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function toggleStatus($id)
    {
        $rt = Rt::findOrFail($id);

        // Jika aktif, ubah ke nonaktif
        if ($rt->status === 'aktif') {
            $rt->status = 'nonaktif';
            $message = "RT {$rt->nomor_rt} berhasil dinonaktifkan.";
        } else {
            // 🚫 Cegah lebih dari satu RT aktif dalam RW yang sama
            $existingActive = Rt::where('id_rw', $rt->id_rw)
                ->where('status', 'aktif')
                ->where('id', '!=', $id)
                ->exists();

            if ($existingActive) {
                return redirect()->back()->with('error', "Masih ada RT aktif di RW ini. Nonaktifkan yang lain dulu!");
            }

            $rt->status = 'aktif';
            $message = "RT {$rt->nomor_rt} berhasil diaktifkan.";
        }

        $rt->save();

        return redirect()->back()->with('success', $message);
    }
}
