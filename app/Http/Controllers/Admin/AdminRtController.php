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

        /**
         * =========================================================================
         * 🚫 VALIDASI BATAS MAKSIMAL RT DALAM SATU RW
         * =========================================================================
         */
        $maxRT = Setting::where('key', 'max_rt_per_rw')->value('value') ?? 0;

        $currentRTCount = Rt::where('id_rw', $request->id_rw)->count();

        if ($maxRT > 0 && $currentRTCount >= $maxRT) {
            return back()
                ->with('error', "RW ini sudah memiliki jumlah RT maksimal ({$maxRT}). Tidak dapat menambah RT baru.")
                ->withInput();
        }

        /**
         * =========================================================================
         * 🚫 VALIDASI: CEGAH JABATAN GANDA AKTIF PADA RT & RW YANG SAMA
         * =========================================================================
         * - Role RT boleh sama jika beda RW → selalu diperbolehkan.
         * - Role RT tidak boleh sama pada RW yang sama jika RT lain masih AKTIF.
         * - Role 'warga' diabaikan.
         * =========================================================================
         */

        $jabatan = $request->jabatan ?: 'ketua'; // default ketua

        if ($jabatan === 'ketua') {
            $roleToCheck = null; // karena ketua = tanpa role tambahan
        } else {
            $roleToCheck = $jabatan;
        }

        if ($jabatan) {

            // Cari RT lain dengan RW & nomor RT sama
            $rtAktif = Rt::where('id_rw', $request->id_rw)
                ->where('nomor_rt', $request->nomor_rt)
                ->where('status', 'aktif')
                ->first();

            if ($rtAktif) {
                // Ambil user-nya
                $existingUser = User::where('id_rt', $rtAktif->id)->first();

                if ($existingUser) {
                    $existingExtraRole = $existingUser->roles()
                        ->whereNotIn('name', ['rt', 'warga'])
                        ->pluck('name')
                        ->first();

                    $existingJabatan = $existingExtraRole ?: 'ketua';

                    if ($existingJabatan === $jabatan) {
                        return back()->with(
                            'error',
                            "RT {$request->nomor_rt} pada RW ini sudah memiliki {$jabatan} aktif!"
                        )->withInput();
                    }
                }
            }
        }

        /**
         * =========================================================================
         * 💾 SIMPAN DATA RT
         * =========================================================================
         */
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

        /**
         * =========================================================================
         * 👤 BUAT USER RT
         * =========================================================================
         */

        if ($request->filled('nik') && $request->filled('nama_anggota_rt')) {

            $user = User::create([
                'nik' => $request->nik,
                'nama' => $request->nama_anggota_rt,
                'password' => Hash::make('password'),
                'id_rt' => $rt->id,
                'id_rw' => $request->id_rw,
            ]);

            $roles = ['rt']; // default

            // Tambah role khusus jika bukan ketua
            if ($jabatan !== 'ketua' && Role::where('name', $jabatan)->exists()) {
                $roles[] = $jabatan;
            }

            $user->syncRoles($roles);
        }

        return redirect()->route('admin.rt.index')
            ->with('success', 'RT baru berhasil ditambahkan.');
    }

    public function update(Request $request, string $id)
    {
        $rt = Rt::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nik' => [
                'nullable',
                Rule::unique('rt')->ignore($id),
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

        /**
         * =========================================================================
         * 🚫 VALIDASI: CEGAH JABATAN GANDA AKTIF (SAMA EXACT DENGAN STORE)
         * =========================================================================
         * - Role RT boleh sama jika beda RW → diperbolehkan.
         * - Tidak boleh role sama pada RW & nomor RT yang sama jika RT lain masih aktif.
         * - Ketua = user tanpa role tambahan (hanya role 'rt')
         * =========================================================================
         */

        $jabatan = $request->jabatan ?: 'ketua';

        // ketua = tanpa role khusus
        if ($jabatan === 'ketua') {
            $roleToCheck = null;
        } else {
            $roleToCheck = $jabatan;
        }

        // Cari RT lain yang masih aktif dengan nomor_RT & RW sama
        $rtAktif = Rt::where('id_rw', $request->id_rw)
            ->where('nomor_rt', $request->nomor_rt)
            ->where('id', '!=', $rt->id)
            ->where('status', 'aktif')
            ->first();

        if ($rtAktif) {
            $existingUser = User::where('id_rt', $rtAktif->id)->first();

            if ($existingUser) {
                // role selain rt + warga
                $existingExtraRole = $existingUser->roles()
                    ->whereNotIn('name', ['rt', 'warga'])
                    ->pluck('name')
                    ->first();

                $existingJabatan = $existingExtraRole ?: 'ketua';

                if ($existingJabatan === $jabatan) {
                    return back()->with(
                        'error',
                        "RT {$request->nomor_rt} pada RW ini sudah memiliki {$jabatan} aktif!"
                    )->withInput();
                }
            }
        }

        /**
         * =========================================================================
         * 🔄 UPDATE DATA RT
         * =========================================================================
         */

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

        /**
         * =========================================================================
         * 👤 UPDATE / CREATE USER RT
         * =========================================================================
         */

        $user = User::where('id_rt', $rt->id)->first();

        if ($request->filled('nik') && $request->filled('nama_anggota_rt')) {

            if ($user) {
                $user->update([
                    'nik' => $request->nik,
                    'nama' => $request->nama_anggota_rt,
                ]);
            } else {
                $user = User::create([
                    'nik'      => $request->nik,
                    'nama'     => $request->nama_anggota_rt,
                    'password' => Hash::make('password'),
                    'id_rt'    => $rt->id,
                    'id_rw'    => $request->id_rw,
                ]);
            }

            $roles = ['rt']; // default

            if ($jabatan !== 'ketua' && Role::where('name', $jabatan)->exists()) {
                $roles[] = $jabatan;
            }

            $user->syncRoles($roles);

        } else {
            // Jika user dihapus
            if ($user) $user->delete();
        }

        return redirect()->route('admin.rt.index')
            ->with('success', 'Data RT berhasil diperbarui.');
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

        // Role yang tidak dianggap jabatan
        $ignoredRoles = ['rt', 'warga'];

        // Ambil user pemegang jabatan
        $user = $rt->user()->first();

        // Ambil jabatan user selain role inti → default ke ketua
        $jabatanUser = $user?->roles()
            ->whereNotIn('name', $ignoredRoles)
            ->pluck('name')
            ->first() ?? 'ketua';

        // Jika sedang aktif → nonaktifkan
        if ($rt->status === 'aktif') {
            $rt->update(['status' => 'nonaktif']);
            return back()->with('success', "RT {$rt->nomor_rt} berhasil dinonaktifkan.");
        }

        // ✔ Cari RT aktif lain dengan RW & nomor RT yang sama
        $existingActive = Rt::where('id_rw', $rt->id_rw)
            ->where('nomor_rt', $rt->nomor_rt)
            ->where('status', 'aktif')
            ->where('id', '!=', $rt->id)
            ->first();

        if ($existingActive) {

            $existingUser = $existingActive->users()->first();

            // Ambil jabatan RT aktif sekarang
            $existingJabatan = $existingUser?->roles()
                ->whereNotIn('name', $ignoredRoles)
                ->pluck('name')
                ->first() ?? 'ketua';

            // Jika jabatannya sama → tolak
            if ($existingJabatan === $jabatanUser) {
                return back()->with('error',
                    "RT {$rt->nomor_rt} sudah memiliki {$existingJabatan} aktif. Nonaktifkan yang lama dulu!"
                );
            }

            // Jika masa jabatan lama sudah berakhir → nonaktifkan otomatis
            if ($existingActive->akhir_jabatan && $existingActive->akhir_jabatan < now()->toDateString()) {
                $existingActive->update(['status' => 'nonaktif']);
            }
        }

        // Aktifkan RT baru
        $rt->update(['status' => 'aktif']);

        return back()->with('success',
            "RT {$rt->nomor_rt} dengan jabatan {$jabatanUser} berhasil diaktifkan."
        );
    }
}
