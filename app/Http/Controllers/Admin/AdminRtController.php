<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\User;
use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminRtController extends Controller
{
    public function index(Request $request)
    {
        $title = 'Rukun Tetangga';
        $query = Rt::query();

        if ($request->filled('keyword')) {
            $query->where(function ($q) use ($request) {
                $q->where('nik', 'like', "%{$request->keyword}%")
                    ->orWhere('nama_anggota_rt', 'like', "%{$request->keyword}%");
            });
        }

        if ($request->filled('nomor_rt')) {
            $query->where('nomor_rt', $request->nomor_rt);
        }

        $rukun_tetangga = $query->with('rw')->paginate(5)->withQueryString();
        $nomorRtList = Rt::select('nomor_rt')->distinct()->orderBy('nomor_rt')->pluck('nomor_rt');
        $rwList = Rw::select('id', 'nomor_rw', 'nama_anggota_rw')->get();

        return Inertia::render('Admin/Rt', [
            'rukun_tetangga' => $rukun_tetangga,
            'filters' => $request->only(['keyword', 'nomor_rt']),
            'nomorRtList' => $nomorRtList,
            'rwList' => $rwList,
            'title' => $title,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nik' => ['nullable', 'unique:rt,nik'],
            'id_rw' => ['nullable', 'exists:rw,id'],
            'nomor_rt' => ['required', 'regex:/^[0-9]{2}$/'],
            'nama_anggota_rt' => 'nullable|string|max:255',
            'mulai_menjabat' => 'nullable|date',
            'akhir_jabatan' => 'nullable|date|after_or_equal:mulai_menjabat',
            'status' => ['nullable', Rule::in(['aktif', 'nonaktif'])],
            'jabatan' => ['nullable', Rule::in(['ketua', 'sekretaris', 'bendahara'])],
        ]);

        // 🔍 Cek NIK valid di data warga
        if ($request->filled('nik')) {
            $warga = Warga::where('nik', $request->nik)->first();
            if (!$warga) {
                return back()->withErrors(['nik' => 'NIK tidak ditemukan di data warga.'])->withInput();
            }
        }

        // 🚦 Batasi jumlah RT per RW
        $maxRtSetting = \App\Models\Setting::where('key', 'max_rt_per_rw')->first();
        $maxRtPerRw = $maxRtSetting ? (int)$maxRtSetting->value : 6;

        if ($request->filled('id_rw')) {
            $rtCount = Rt::where('id_rw', $request->id_rw)->count();
            if ($rtCount >= $maxRtPerRw) {
                return back()->with('error', "RW ini sudah memiliki {$maxRtPerRw} RT. Tidak bisa menambah lagi.")->withInput();
            }
        }

        // 🚫 Cegah jabatan ganda aktif
        if ($request->filled('jabatan')) {
            $existing = Rt::where('nomor_rt', $request->nomor_rt)
                ->where('id_rw', $request->id_rw)
                ->where('status', 'aktif')
                ->whereHas('user.roles', fn($q) => $q->where('name', $request->jabatan))
                ->exists();

            if ($existing) {
                return back()->with('error', "RT {$request->nomor_rt} sudah memiliki {$request->jabatan} aktif!")->withInput();
            }
        }

        // 💾 Simpan data RT
        $rt = Rt::create([
            'nik' => $request->nik,
            'no_kk' => $request->filled('nik') ? optional(Warga::where('nik', $request->nik)->first())->no_kk : null,
            'nomor_rt' => $request->nomor_rt,
            'nama_anggota_rt' => $request->nama_anggota_rt,
            'mulai_menjabat' => $request->mulai_menjabat,
            'akhir_jabatan' => $request->akhir_jabatan,
            'id_rw' => $request->id_rw,
            'status' => $request->status ?? 'nonaktif',
        ]);

        // 👤 Buat user hanya jika dua-duanya (nik & nama) diisi
        if ($request->filled('nik') && $request->filled('nama_anggota_rt')) {
            $user = User::create([
                'nik' => $request->nik,
                'nama' => $request->nama_anggota_rt,
                'password' => Hash::make('password'),
                'id_rt' => $rt->id,
                'id_rw' => $request->id_rw,
            ]);

            $roles = ['rt'];
            if ($request->filled('jabatan') && $request->jabatan !== 'ketua') {
                $roles[] = $request->jabatan;
            }
            $user->syncRoles($roles);
        }

        return redirect()->route('admin.rt.index')->with('success', 'RT berhasil ditambahkan.');
    }

    public function update(Request $request, string $id)
    {
        $rw = Rw::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nik' => ['nullable', Rule::unique('rw')->ignore($id)],
            'nomor_rw' => 'required|string|max:3',
            'nama_anggota_rw' => 'nullable|string|max:255',
            'mulai_menjabat' => 'nullable|date',
            'akhir_jabatan' => 'nullable|date|after_or_equal:mulai_menjabat',
            'status' => ['nullable', Rule::in(['aktif', 'nonaktif'])],
            'jabatan' => ['nullable', Rule::in(['ketua', 'sekretaris', 'bendahara'])],
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // ✅ Pastikan NIK ada di data warga
        if ($request->filled('nik')) {
            $warga = Warga::where('nik', $request->nik)->first();
            if (!$warga) {
                return back()->withErrors(['nik' => 'NIK tidak ditemukan di data warga.'])->withInput();
            }
        }

        // 🚫 Cegah jabatan ganda aktif
        if ($request->filled('jabatan')) {
            $existing = Rw::where('nomor_rw', $request->nomor_rw)
                ->where('status', 'aktif')
                ->where('id', '!=', $rw->id)
                ->whereHas('user.roles', fn($q) => $q->where('name', $request->jabatan))
                ->exists();

            if ($existing) {
                return back()->with('error', "RW {$request->nomor_rw} sudah memiliki {$request->jabatan} aktif!")->withInput();
            }
        }

        // 🔄 Update data RW
        $rw->update([
            'nik' => $request->nik,
            'no_kk' => $request->filled('nik') ? optional(Warga::where('nik', $request->nik)->first())->no_kk : null,
            'nomor_rw' => $request->nomor_rw,
            'nama_anggota_rw' => $request->nama_anggota_rw,
            'mulai_menjabat' => $request->mulai_menjabat,
            'akhir_jabatan' => $request->akhir_jabatan,
            'status' => $request->status ?? 'nonaktif',
        ]);

        // 👤 Buat atau update user
        $user = User::where('id_rw', $rw->id)->first();

        if ($request->filled('nik') && $request->filled('nama_anggota_rw')) {
            if ($user) {
                $user->update([
                    'nik' => $request->nik,
                    'nama' => $request->nama_anggota_rw,
                ]);
            } else {
                $user = User::create([
                    'nik' => $request->nik,
                    'nama' => $request->nama_anggota_rw,
                    'password' => \Illuminate\Support\Facades\Hash::make('password'),
                    'id_rw' => $rw->id,
                ]);
            }

            $roles = ['rw'];
            if ($request->filled('jabatan') && $request->jabatan !== 'ketua') {
                $roles[] = $request->jabatan;
            }
            $user->syncRoles($roles);
        } else {
            if ($user) $user->delete();
        }

        return redirect()->route('admin.rw.index')->with('success', 'Data RW berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        try {
            $rt = Rt::findOrFail($id);

            if ($rt->status === 'aktif') {
                return back()->with('error', 'RT masih berstatus aktif dan tidak bisa dihapus.');
            }

            User::where('id_rt', $rt->id)->delete();
            $rt->delete();

            return back()->with('success', 'RT berhasil dihapus.');
        } catch (\Illuminate\Database\QueryException $e) {
            return back()->with('error', 'Tidak bisa menghapus RT karena masih digunakan.');
        }
    }

    public function toggleStatus($id)
    {
        $rt = Rt::findOrFail($id);

        if ($rt->status === 'aktif') {
            $rt->update(['status' => 'nonaktif']);
            return back()->with('success', "RT {$rt->nomor_rt} berhasil dinonaktifkan.");
        }

        $existingActive = Rt::where('id_rw', $rt->id_rw)
            ->where('status', 'aktif')
            ->where('id', '!=', $rt->id)
            ->exists();

        if ($existingActive) {
            return back()->with('error', "Masih ada RT aktif di RW ini. Nonaktifkan yang lain dulu!");
        }

        $rt->update(['status' => 'aktif']);
        return back()->with('success', "RT {$rt->nomor_rt} berhasil diaktifkan.");
    }
}
