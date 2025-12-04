<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rw;
use App\Models\User;
use App\Models\Kartu_keluarga;
use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class AdminRwController extends Controller
{
    public function index(Request $request)
    {
        $title = 'Rukun Warga';
        $query = Rw::query();

        if ($request->filled('keyword')) {
            $query->where(function ($q) use ($request) {
                $q->where('nik', 'like', '%' . $request->keyword . '%')
                    ->orWhere('nama_anggota_rw', 'like', '%' . $request->keyword . '%');
            });
        }

        if ($request->filled('nomor_rw')) {
            $query->where('nomor_rw', $request->nomor_rw);
        }

        $rw = $query->orderBy('nomor_rw')->paginate(10)->withQueryString();
        $nomorRwList = Rw::select('nomor_rw')->distinct()->orderBy('nomor_rw')->get();

        // 🔹 Ambil role dari database, kecuali role utama
        $roles = Role::pluck('name')
            ->filter(fn($r) => !in_array(strtolower($r), ['admin', 'rw', 'rt', 'warga']))
            ->values();

        // 🔹 Tambahkan manual “Ketua RW” di paling atas
        $roles = collect(['ketua'])->merge($roles)->values();

        // warga yg termasuk anggota rt gk bisa jadi anggota rw, dan juga sebaliknya 🔥🔥🥀🥀🗿🤣🤔🤔
        // kepencet emot 🤔🤔🤣🤣
        $warga = Warga::whereDoesntHave('user.roles', function ($q) {
            $q->where('name', 'rt');
        })->get();

        return Inertia::render('Admin/Rw', [
            'rw' => $rw,
            'filters' => $request->only(['keyword', 'nomor_rw']),
            'nomorRwList' => $nomorRwList,
            'roles' => $roles,
            'title' => $title,
            'warga' => $warga,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nik' => [
                'nullable',
                'string',
                'unique:rw,nik',
                function ($attribute, $value, $fail) {
                    if ($value && !Kartu_keluarga::where('no_kk', $value)
                        ->orWhereHas('warga', fn($q) => $q->where('nik', $value))
                        ->exists()) {
                        $fail("NIK $value tidak ditemukan pada data Kartu Keluarga manapun.");
                    }
                },
            ],
            'nomor_rw' => 'required|string|max:3',
            'nama_anggota_rw' => 'nullable|string|max:255',
            'mulai_menjabat' => 'nullable|date',
            'akhir_jabatan' => 'nullable|date|after_or_equal:mulai_menjabat',
            'status' => ['nullable', Rule::in(['aktif', 'nonaktif'])],
            'jabatan' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        /*
        |----------------------------------------------------------------------
        | 🚫 VALIDASI ROLE — SAMA DENGAN UPDATE()
        |----------------------------------------------------------------------
        | Ketentuan:
        | - Ketua = user yang TIDAK punya role lain selain "rw" (abaikan "warga")
        | - Jika jabatan kosong → dianggap ketua
        | - Tidak boleh ada jabatan yang sama di RW yang sama jika masih aktif
        |----------------------------------------------------------------------
        */

        $targetRole = $request->jabatan ?: 'ketua';

        // cari semua RW dengan nomor yang sama & status aktif
        $rwAktif = Rw::where('nomor_rw', $request->nomor_rw)
            ->where('status', 'aktif')
            ->get();

        foreach ($rwAktif as $r) {

            $u = $r->users()->first();
            if (!$u) continue;

            // ambil role selain rw & warga
            $extraRole = $u->roles()
                ->whereNotIn('name', ['warga', 'rw'])
                ->pluck('name')
                ->first();

            $existingRole = $extraRole ?: 'ketua';

            // jika jabatan sama → tolak
            if ($existingRole === $targetRole) {
                return back()->with(
                    'error',
                    "RW {$request->nomor_rw} sudah memiliki {$existingRole} aktif!"
                )->withInput();
            }
        }

        /*
        |----------------------------------------------------------------------
        | 💾 SIMPAN DATA RW
        |----------------------------------------------------------------------
        */
        $rw = Rw::create([
            'nik' => $request->nik,
            'no_kk' => $request->filled('nik')
                ? optional(Warga::where('nik', $request->nik)->first())->no_kk
                : null,
            'nomor_rw' => $request->nomor_rw,
            'nama_anggota_rw' => $request->nama_anggota_rw,
            'mulai_menjabat' => $request->mulai_menjabat,
            'akhir_jabatan' => $request->akhir_jabatan,
            'status' => $request->status,
        ]);

        /*
        |----------------------------------------------------------------------
        | 👤 BUAT USER JIKA DIISI
        |----------------------------------------------------------------------
        */
        if ($request->filled('nik') && $request->filled('nama_anggota_rw')) {

            $warga = Warga::where('nik', $request->nik)->first();

            $user = User::create([
                'nik'      => $request->nik,
                'nama'     => $request->nama_anggota_rw,
                'password' => Hash::make('password'),
                'id_rw'    => $rw->id,
                'id_rt'    => $warga?->kartuKeluarga?->id_rt // ← otomatis isi dari data warga
            ]);

            /*
            |----------------------------------------------------------------------
            | 🔐 SET ROLE USER
            | - Default = rw
            | - Jika jabatan != ketua → tambahkan role jabatan
            |----------------------------------------------------------------------
            */
            $roles = ['rw'];

            if ($request->filled('jabatan') && $request->jabatan !== 'ketua') {
                if (Role::where('name', $request->jabatan)->exists()) {
                    $roles[] = $request->jabatan;
                }
            }

            $user->syncRoles($roles);
        }

        return redirect()->route('admin.rw.index')
            ->with('success', 'RW baru berhasil ditambahkan.');
    }

    public function update(Request $request, string $id)
    {
        $rw = Rw::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nik' => [
                'nullable',
                Rule::unique('rw')->ignore($id),
                function ($attribute, $value, $fail) {
                    if ($value && !Kartu_keluarga::where('no_kk', $value)
                        ->orWhereHas('warga', fn($q) => $q->where('nik', $value))
                        ->exists()) {
                        $fail("NIK $value tidak ditemukan pada data Kartu Keluarga manapun.");
                    }
                },
            ],
            'nomor_rw' => 'required|string|max:3',
            'nama_anggota_rw' => 'nullable|string|max:255',
            'mulai_menjabat' => 'nullable|date',
            'akhir_jabatan' => 'nullable|date|after_or_equal:mulai_menjabat',
            'status' => ['nullable', Rule::in(['aktif', 'nonaktif'])],
            'jabatan' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        /*
        |--------------------------------------------------------------------------
        | 🚫 CEGAH ROLE GANDA DALAM RW YANG SAMA
        |--------------------------------------------------------------------------
        | Ketentuan:
        | - "ketua" = user yang hanya punya role "rw" saja (abaikan role warga)
        | - Selain itu role = sekretaris, bendahara, dll
        | - Tidak boleh ada role yang sama pada nomor_rw & RW lain yang masih aktif
        |--------------------------------------------------------------------------
        */

        $targetRole = $request->jabatan ?: 'ketua'; // jika kosong → ketua

        // Ambil rw lain dengan nomor_rw yg sama
        $rwLain = Rw::where('nomor_rw', $request->nomor_rw)
            ->where('id', '!=', $rw->id)
            ->where('status', 'aktif')
            ->get();

        foreach ($rwLain as $rwl) {
            $u = $rwl->users()->first();

            if (!$u) continue;

            // Ambil role selain warga & rw
            $extraRole = $u->roles()
                ->whereNotIn('name', ['warga', 'rw'])
                ->pluck('name')
                ->first();

            // Tentukan jabatan user RW tersebut
            $jabatanExisting = $extraRole ?: 'ketua';

            if ($jabatanExisting === $targetRole) {
                return back()->with(
                    'error',
                    "RW {$request->nomor_rw} sudah memiliki {$jabatanExisting} aktif!"
                )->withInput();
            }
        }

        /*
        |--------------------------------------------------------------------------
        | 🔄 UPDATE RW
        |--------------------------------------------------------------------------
        */
        $rw->update([
            'nik' => $request->nik,
            'no_kk' => $request->filled('nik')
                ? optional(Warga::where('nik', $request->nik)->first())->no_kk
                : null,
            'nomor_rw' => $request->nomor_rw,
            'nama_anggota_rw' => $request->nama_anggota_rw,
            'mulai_menjabat' => $request->mulai_menjabat,
            'akhir_jabatan' => $request->akhir_jabatan,
            'status' => $request->status,
        ]);

        /*
        |--------------------------------------------------------------------------
        | 👤 UPDATE / CREATE USER
        |--------------------------------------------------------------------------
        */

        $user = User::where('id_rw', $rw->id)->first();
        $warga = Warga::where('nik', $request->nik)->first();

        if ($request->filled('nik') && $request->filled('nama_anggota_rw')) {

            // Update atau create user
            if ($user) {
                $user->update([
                    'nik' => $request->nik,
                    'nama' => $request->nama_anggota_rw,
                ]);
            } else {
                $user = User::create([
                    'nik' => $request->nik,
                    'nama' => $request->nama_anggota_rw,
                    'password' => Hash::make('password'),
                    'id_rw' => $rw->id,
                    'id_rt' => $warga?->kartuKeluarga?->id_rt
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | 🔐 ATUR ROLE USER
            |--------------------------------------------------------------------------
            | - default = 'rw'
            | - jika jabatan tambahan → tambahkan role tsb
            | - jabatan 'ketua' berarti hanya role 'rw'
            |--------------------------------------------------------------------------
            */

            // 🟢 Ambil role lama user
            $existingRoles = $user->roles->pluck('name')->toArray();

            // 🟢 Role wajib untuk RW
            $newRoles = ['rw'];

            // 🟢 Tambahkan role tambahan jika bukan ketua
            if ($request->filled('jabatan') && $request->jabatan !== 'ketua') {
                if (Role::where('name', $request->jabatan)->exists()) {
                    $newRoles[] = $request->jabatan;
                }
            }

            // 🟢 Gabungkan role lama + role RW + role tambahan
            $mergedRoles = array_unique(array_merge($existingRoles, $newRoles));

            // 🟢 Terapkan tanpa menghilangkan role warga
            $user->syncRoles($mergedRoles);
        } else {
            if ($user) $user->delete();
        }

        return redirect()->route('admin.rw.index')->with('success', 'Data RW berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        try {
            $rw = Rw::findOrFail($id);

            if ($rw->status === 'aktif') {
                return back()->with('error', 'RW masih berstatus aktif dan tidak bisa dihapus.');
            }

            User::where('id_rw', $rw->id)->delete();
            $rw->delete();

            return redirect()->route('admin.rw.index')->with('success', 'Data RW berhasil dihapus.');
        } catch (\Illuminate\Database\QueryException $e) {
            return back()->with('error', 'Tidak bisa menghapus RW karena masih digunakan.');
        }
    }

    public function toggleStatus($id)
    {
        $rw = Rw::findOrFail($id);

        // 🎯 Role yang harus diabaikan (tidak dianggap jabatan)
        $ignoredRoles = ['rw', 'warga'];

        // 🔎 Ambil user RW
        $user = $rw->user()->first();

        // Ambil role selain ignoredRoles, jika tidak ada → ketua
        $jabatanUser = $user?->roles()
            ->whereNotIn('name', $ignoredRoles)
            ->pluck('name')
            ->first() ?? 'ketua';

        // Jika sedang aktif → nonaktifkan
        if ($rw->status === 'aktif') {
            $rw->update(['status' => 'nonaktif']);
            return back()->with('success', "RW {$rw->nomor_rw} berhasil dinonaktifkan.");
        }

        // 🔍 Cek RW lain aktif dengan nomor RW sama
        $existingActive = Rw::where('nomor_rw', $rw->nomor_rw)
            ->where('status', 'aktif')
            ->where('id', '!=', $rw->id)
            ->first();

        if ($existingActive) {

            // 🎯 Ambil jabatan existing RW
            $existingUser = $existingActive->users()->first();

            $existingJabatan = $existingUser?->roles()
                ->whereNotIn('name', $ignoredRoles)
                ->pluck('name')
                ->first() ?? 'ketua';

            // Jika jabatannya sama → tolak
            if ($existingJabatan === $jabatanUser) {
                return back()->with(
                    'error',
                    "RW {$rw->nomor_rw} sudah memiliki {$existingJabatan} aktif. Nonaktifkan yang lama dulu!"
                );
            }
        }

        // ✔ Aktifkan RW baru
        $rw->update(['status' => 'aktif']);

        return back()->with(
            'success',
            "RW {$rw->nomor_rw} dengan jabatan {$jabatanUser} berhasil diaktifkan."
        );
    }
}
