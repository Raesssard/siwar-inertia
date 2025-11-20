<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\User;
use App\Models\Warga;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class AdminRtController extends Controller
{
    public function index(Request $request)
    {
        $title = 'Rukun Tetangga';
        $query = Rt::with('rw');

        // 🔍 Filter pencarian
        if ($request->filled('keyword')) {
            $query->where(function ($q) use ($request) {
                $q->where('nik', 'like', '%' . $request->keyword . '%')
                ->orWhere('nama_anggota_rt', 'like', '%' . $request->keyword . '%');
            });
        }

        if ($request->filled('nomor_rt')) {
            $query->where('nomor_rt', $request->nomor_rt);
        }

        $rukun_tetangga = $query->orderBy('nomor_rt')->paginate(10)->withQueryString();
        $nomorRtList = Rt::select('nomor_rt')->distinct()->orderBy('nomor_rt')->pluck('nomor_rt');

        // ⭐ FILTER RW berdasarkan role user ⭐
        $rwList = Rw::with('users.roles')
            ->get()
            ->filter(function ($rw) {

                // Pastikan RW punya user
                if ($rw->users->isEmpty()) return false;

                // Ambil user yang punya role "rw"
                $userRw = $rw->users->first(function ($user) {
                    return $user->roles->pluck('name')->contains('rw');
                });

                if (!$userRw) return false;

                // Ambil semua role dari user RW itu
                $roles = $userRw->roles->pluck('name')->toArray();

                // Role yang diperbolehkan
                $allowed = ['rw', 'warga'];

                // Jika ada role lain, tolak
                foreach ($roles as $r) {
                    if (!in_array($r, $allowed)) return false;
                }

                return true;
            })
            ->values()
            ->map(fn($rw) => [
                'id' => $rw->id,
                'nomor_rw' => $rw->nomor_rw,
                'nama_anggota_rw' => $rw->nama_anggota_rw,
            ]);

        // 🔹 Ambil role dari database kecuali role utama
        $roles = Role::pluck('name')
            ->filter(fn($r) => !in_array(strtolower($r), ['admin', 'rw', 'rt', 'warga']))
            ->values();

        // Tambahkan manual “Ketua RT”
        $roles = collect(['ketua'])->merge($roles)->values();

        return Inertia::render('Admin/Rt', [
            'rukun_tetangga' => $rukun_tetangga,
            'filters' => $request->only(['keyword', 'nomor_rt']),
            'nomorRtList' => $nomorRtList,
            'rwList' => $rwList,
            'roles' => $roles,
            'title' => $title,
        ]);
    }


    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nik' => [
                'nullable',
                'string',
                'unique:rt,nik',
                function ($attribute, $value, $fail) {
                    if ($value && !Warga::where('nik', $value)->exists()) {
                        $fail("NIK $value tidak ditemukan di data warga manapun.");
                    }
                },
            ],
            'id_rw' => ['required', 'exists:rw,id'],
            'nomor_rt' => ['required', 'regex:/^[0-9]{2}$/'],
            'nama_anggota_rt' => 'nullable|string|max:255',
            'mulai_menjabat' => 'nullable|date',
            'akhir_jabatan' => 'nullable|date|after_or_equal:mulai_menjabat',
            'status' => ['nullable', Rule::in(['aktif', 'nonaktif'])],
            'jabatan' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // 🚦 Batas RT per RW
        $maxRtPerRw = Setting::where('key', 'max_rt_per_rw')->value('value') ?? 6;
        $rtCount = Rt::where('id_rw', $request->id_rw)->count();
        if ($rtCount >= $maxRtPerRw) {
            return back()->with('error', "RW ini sudah memiliki {$maxRtPerRw} RT.")->withInput();
        }

        // 🚫 Cegah jabatan ganda aktif
        if ($request->filled('jabatan')) {
            $existing = User::whereHas('roles', fn($q) => $q->where('name', $request->jabatan))
                ->whereHas('rukunTetangga', fn($q) => $q
                    ->where('nomor_rt', $request->nomor_rt)
                    ->where('id_rw', $request->id_rw))
                ->exists();

            if ($existing) {
                return back()->with('error', "RT {$request->nomor_rt} sudah memiliki {$request->jabatan} aktif!")->withInput();
            }
        }

        // 💾 Simpan data RT
        $rt = Rt::create([
            'nik' => $request->nik,
            'no_kk' => $request->filled('nik')
                ? optional(Warga::where('nik', $request->nik)->first())->no_kk
                : null,
            'nomor_rt' => $request->nomor_rt,
            'nama_anggota_rt' => $request->nama_anggota_rt,
            'mulai_menjabat' => $request->mulai_menjabat,
            'akhir_jabatan' => $request->akhir_jabatan,
            'id_rw' => $request->id_rw,
            'status' => $request->status ?? 'nonaktif',
        ]);

        // 👤 Buat user hanya jika ada nama & nik
        if ($request->filled('nik') && $request->filled('nama_anggota_rt')) {
            $user = User::create([
                'nik' => $request->nik,
                'nama' => $request->nama_anggota_rt,
                'password' => Hash::make('password'),
                'id_rt' => $rt->id,
                'id_rw' => $request->id_rw,
            ]);

            // Default role: 'rt'
            $roles = ['rt'];

            // Tambahkan jabatan jika ada dan bukan ketua
            if ($request->filled('jabatan') && $request->jabatan !== 'ketua') {
                if (Role::where('name', $request->jabatan)->exists()) {
                    $roles[] = $request->jabatan;
                }
            }

            $user->syncRoles($roles);
        }

        return redirect()->route('admin.rt.index')->with('success', 'RT baru berhasil ditambahkan.');
    }

    public function update(Request $request, string $id)
    {
        $rt = Rt::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nik' => ['nullable', Rule::unique('rt')->ignore($id)],
            'id_rw' => ['required', 'exists:rw,id'],
            'nomor_rt' => ['required', 'regex:/^[0-9]{2}$/'],
            'nama_anggota_rt' => 'nullable|string|max:255',
            'mulai_menjabat' => 'nullable|date',
            'akhir_jabatan' => 'nullable|date|after_or_equal:mulai_menjabat',
            'status' => ['nullable', Rule::in(['aktif', 'nonaktif'])],
            'jabatan' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // 🚫 Cegah jabatan ganda aktif
        if ($request->filled('jabatan')) {
            $existing = User::whereHas('roles', fn($q) => $q->where('name', $request->jabatan))
                ->whereHas('rukunTetangga', fn($q) => $q
                    ->where('nomor_rt', $request->nomor_rt)
                    ->where('id_rw', $request->id_rw)
                    ->where('id', '!=', $rt->id))
                ->exists();

            if ($existing) {
                return back()->with('error', "RT {$request->nomor_rt} sudah memiliki {$request->jabatan} aktif!")->withInput();
            }
        }

        // 🔄 Update data RT
        $rt->update([
            'nik' => $request->nik,
            'no_kk' => $request->filled('nik')
                ? optional(Warga::where('nik', $request->nik)->first())->no_kk
                : null,
            'nomor_rt' => $request->nomor_rt,
            'nama_anggota_rt' => $request->nama_anggota_rt,
            'mulai_menjabat' => $request->mulai_menjabat,
            'akhir_jabatan' => $request->akhir_jabatan,
            'id_rw' => $request->id_rw,
            'status' => $request->status ?? 'nonaktif',
        ]);

        // 👤 Update atau buat user
        $user = User::where('id_rt', $rt->id)->first();

        if ($request->filled('nik') && $request->filled('nama_anggota_rt')) {
            if ($user) {
                $user->update([
                    'nik' => $request->nik,
                    'nama' => $request->nama_anggota_rt,
                ]);
            } else {
                $user = User::create([
                    'nik' => $request->nik,
                    'nama' => $request->nama_anggota_rt,
                    'password' => Hash::make('password'),
                    'id_rt' => $rt->id,
                    'id_rw' => $request->id_rw,
                ]);
            }

            // Default role
            $roles = ['rt'];
            if ($request->filled('jabatan') && $request->jabatan !== 'ketua') {
                if (Role::where('name', $request->jabatan)->exists()) {
                    $roles[] = $request->jabatan;
                }
            }
            $user->syncRoles($roles);
        } else {
            if ($user) $user->delete();
        }

        return redirect()->route('admin.rt.index')->with('success', 'Data RT berhasil diperbarui.');
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

        // Jika sedang aktif, maka nonaktifkan
        if ($rt->status === 'aktif') {
            $rt->update(['status' => 'nonaktif']);
            return back()->with('success', "RT {$rt->nomor_rt} berhasil dinonaktifkan.");
        }

        // Ambil semua RT aktif lain di RW & nomor RT yang sama
        $existingActive = Rt::where('id_rw', $rt->id_rw)
            ->where('nomor_rt', $rt->nomor_rt)
            ->where('status', 'aktif')
            ->where('id', '!=', $rt->id)
            ->first();

        // Jika ada RT aktif lain dengan nomor sama
        if ($existingActive) {
            // Cek masa jabatan RT yang lama
            if ($existingActive->akhir_jabatan >= now()->toDateString()) {
                // Kalau RT lama masih dalam masa jabatan dan jabatan sama (ketua)
                if ($existingActive->jabatan === $rt->jabatan) {
                    return back()->with('error', "RT {$rt->nomor_rt} dengan jabatan {$rt->jabatan} masih aktif. Nonaktifkan yang lama dulu!");
                }
            } else {
                // Jika RT lama sudah habis masa jabatan, otomatis nonaktifkan
                $existingActive->update(['status' => 'nonaktif']);
            }
        }

        // Jika role/jabatan berbeda (misal sekretaris/bendahara/seksi), tetap boleh diaktifkan
        $rt->update(['status' => 'aktif']);
        return back()->with('success', "RT {$rt->nomor_rt} dengan jabatan {$rt->jabatan} berhasil diaktifkan.");
    }
}
