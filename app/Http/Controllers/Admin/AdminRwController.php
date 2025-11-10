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

        return Inertia::render('Admin/Rw', [
            'rw' => $rw,
            'filters' => $request->only(['keyword', 'nomor_rw']),
            'nomorRwList' => $nomorRwList,
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

        // 🚫 Cegah jabatan ganda aktif
        if ($request->filled('jabatan')) {
            $existing = User::whereHas('roles', fn($q) => $q->where('name', $request->jabatan))
                ->whereHas('rw', fn($q) => $q->where('nomor_rw', $request->nomor_rw))
                ->exists();

            if ($existing) {
                return back()->with('error', "RW {$request->nomor_rw} sudah memiliki {$request->jabatan} aktif!")->withInput();
            }
        }

        // 💾 Simpan data RW
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

        // 👤 Buat user hanya jika dua-duanya diisi
        if ($request->filled('nik') && $request->filled('nama_anggota_rw')) {
            $user = User::create([
                'nik' => $request->nik,
                'nama' => $request->nama_anggota_rw,
                'password' => Hash::make('password'),
                'id_rw' => $rw->id,
            ]);

            // Default role selalu 'rw'
            $roles = ['rw'];

            // 💡 Jika jabatan selain ketua, dan role-nya ada di database
            if ($request->filled('jabatan') && $request->jabatan !== 'ketua') {
                if (Role::where('name', $request->jabatan)->exists()) {
                    $roles[] = $request->jabatan;
                }
            }

            // 🧠 Sinkronkan semua role (rw + tambahan)
            $user->syncRoles($roles);
        }

        return redirect()->route('admin.rw.index')->with('success', 'RW baru berhasil ditambahkan.');
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

        // 🚫 Cegah jabatan ganda aktif
        if ($request->filled('jabatan')) {
            $existing = User::whereHas('roles', fn($q) => $q->where('name', $request->jabatan))
                ->whereHas('rw', fn($q) => $q->where('nomor_rw', $request->nomor_rw)
                    ->where('id', '!=', $rw->id))
                ->exists();

            if ($existing) {
                return back()->with('error', "RW {$request->nomor_rw} sudah memiliki {$request->jabatan} aktif!")->withInput();
            }
        }

        // 🔄 Update RW
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

        // 👤 Update atau buat user
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
                    'password' => Hash::make('password'),
                    'id_rw' => $rw->id,
                ]);
            }

            // Default role selalu 'rw'
            $roles = ['rw'];

            // 💡 Jika jabatan selain ketua dan role-nya ada di database
            if ($request->filled('jabatan') && $request->jabatan !== 'ketua') {
                if (Role::where('name', $request->jabatan)->exists()) {
                    $roles[] = $request->jabatan;
                }
            }

            // 🧠 Sinkronkan role (rw + tambahan)
            $user->syncRoles($roles);
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

        if ($rw->status === 'aktif') {
            $rw->update(['status' => 'nonaktif']);
            return back()->with('success', "RW {$rw->nomor_rw} berhasil dinonaktifkan.");
        }

        $existingActive = Rw::where('nomor_rw', $rw->nomor_rw)
            ->where('status', 'aktif')
            ->where('id', '!=', $rw->id)
            ->exists();

        if ($existingActive) {
            return back()->with('error', "RW {$rw->nomor_rw} lainnya sudah aktif. Nonaktifkan dulu sebelum mengaktifkan yang ini.");
        }

        $rw->update(['status' => 'aktif']);
        return back()->with('success', "RW {$rw->nomor_rw} berhasil diaktifkan.");
    }
}
