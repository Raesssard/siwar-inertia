<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Rt;
use App\Models\User;
use App\Models\Warga;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class RwRukunTetanggaController extends Controller
{
    public function index(Request $request)
    {
        $title = 'Rukun Tetangga';

        $userRwData = Auth::user()->rw;
        if (!$userRwData) {
            return redirect()->back()->with('error', 'Data RW Anda tidak ditemukan.');
        }

        $nomorRwUser = $userRwData->nomor_rw;

        $query = Rt::whereHas('rw', function ($q) use ($nomorRwUser) {
            $q->where('nomor_rw', $nomorRwUser);
        });

        if ($request->filled('keyword')) {
            $query->where(function ($q) use ($request) {
                $q->where('nik', 'like', '%' . $request->keyword . '%')
                    ->orWhere('nama_anggota_rt', 'like', '%' . $request->keyword . '%');
            });
        }

        if ($request->filled('nomor_rt')) {
            $query->where('nomor_rt', $request->nomor_rt);
        }

        $rukun_tetangga = $query->orderBy('nomor_rt')
            ->paginate(10)
            ->withQueryString();

        $rukun_tetangga_filter = Rt::whereHas('rw', function ($q) use ($nomorRwUser) {
            $q->where('nomor_rw', $nomorRwUser);
        })
            ->select('nomor_rt')
            ->distinct()
            ->orderBy('nomor_rt')
            ->get();

        $roles = Role::pluck('name')
            ->filter(fn($r) => !in_array(strtolower($r), ['admin', 'rw', 'rt', 'warga']))
            ->values();

        $roles = collect(['ketua'])->merge($roles)->values();

        return Inertia::render('Rw/Rt', [
            'rukun_tetangga' => $rukun_tetangga,
            'filters' => $request->only(['keyword', 'nomor_rt']),
            'rukun_tetangga_filter' => $rukun_tetangga_filter,
            'roles' => $roles,
            'title' => $title,
        ]);
    }

    public function store(Request $request)
    {
        $id_rw = Auth::user()->id_rw;

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

        $maxRT = Setting::where('key', 'max_rt_per_rw')->value('value') ?? 0;

        $currentKetuaRTCount = Rt::where('id_rw', $request->id_rw)
            ->where('status', 'aktif')
            ->whereDoesntHave('user.roles', function ($q) {
                $q->whereNotIn('name', ['rt', 'warga']);
            })
            ->distinct('nomor_rt')
            ->count('nomor_rt');

        if ($maxRT > 0 && $currentKetuaRTCount >= $maxRT) {
            return back()
                ->with(
                    'error',
                    "RW ini sudah memiliki {$maxRT} RT aktif (ketua RT). Tidak dapat menambah RT baru."
                )
                ->withInput();
        }

        $jabatan = $request->jabatan ?: 'ketua';
        $roleToCheck = $jabatan === 'ketua' ? null : $jabatan;

        $rtAktif = Rt::where('id_rw', $id_rw)
            ->where('nomor_rt', $request->nomor_rt)
            ->where('status', 'aktif')
            ->first();

        if ($rtAktif) {
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
                        "RT {$request->nomor_rt} sudah memiliki {$jabatan} aktif!"
                    )->withInput();
                }
            }
        }

        $rt = Rt::create([
            'nik' => $request->nik,
            'no_kk' => $request->filled('nik')
                ? optional(Warga::where('nik', $request->nik)->first())->no_kk
                : null,
            'nomor_rt' => $request->nomor_rt,
            'nama_anggota_rt' => $request->nama_anggota_rt,
            'mulai_menjabat' => $request->mulai_menjabat,
            'akhir_jabatan' => $request->akhir_jabatan,
            'id_rw' => $id_rw,
            'status' => $request->status ?? 'nonaktif',
        ]);

        if ($request->filled('nik') && $request->filled('nama_anggota_rt')) {
            $user = User::create([
                'nik' => $request->nik,
                'nama' => $request->nama_anggota_rt,
                'password' => Hash::make('password'),
                'id_rt' => $rt->id,
                'id_rw' => $id_rw,
            ]);

            $roles = ['rt'];

            if ($jabatan !== 'ketua' && Role::where('name', $jabatan)->exists()) {
                $roles[] = $jabatan;
            }

            $user->syncRoles($roles);
        }

        return back()->with('success', 'RT baru berhasil ditambahkan.');
    }

    public function update(Request $request, string $id)
    {
        $id_rw = Auth::user()->id_rw;
        $rt = Rt::where('id', $id)->where('id_rw', $id_rw)->firstOrFail();

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

        $jabatan = $request->jabatan ?: 'ketua';
        $roleToCheck = $jabatan === 'ketua' ? null : $jabatan;

        $rtAktif = Rt::where('id_rw', $id_rw)
            ->where('nomor_rt', $request->nomor_rt)
            ->where('id', '!=', $rt->id)
            ->where('status', 'aktif')
            ->first();

        if ($rtAktif) {
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
                        "RT {$request->nomor_rt} sudah memiliki {$jabatan} aktif!"
                    )->withInput();
                }
            }
        }

        $rt->update([
            'nik' => $request->nik,
            'no_kk' => $request->filled('nik')
                ? optional(Warga::where('nik', $request->nik)->first())->no_kk
                : null,
            'nomor_rt' => $request->nomor_rt,
            'nama_anggota_rt' => $request->nama_anggota_rt,
            'mulai_menjabat' => $request->mulai_menjabat,
            'akhir_jabatan' => $request->akhir_jabatan,
            'status' => $request->status ?? 'nonaktif',
        ]);

        $user = User::where('id_rt', $rt->id)->where('nik', $request->nik)->first();

        if ($request->filled('nik') && $request->filled('nama_anggota_rt')) {

            if ($user) {
                if ($user->nik != $request->nik) {
                    $nikDipakai = User::where('nik', $request->nik)
                        ->where('id', '!=', $user->id)
                        ->exists();

                    if ($nikDipakai) {
                        return back()
                            ->with('error', "NIK {$request->nik} sudah digunakan user lain!")
                            ->withInput();
                    }
                }

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
                    'id_rw'    => $id_rw,
                ]);
            }


            $existingRoles = $user->roles->pluck('name')->toArray();

            $hasWarga = in_array('warga', $existingRoles);

            $coreRoles = ['admin', 'rw', 'rt', 'warga'];

            $finalRoles = ['rt'];

            if ($request->filled('jabatan') && $request->jabatan !== 'ketua') {
                $jabatanBaru = $request->jabatan;

                if (Role::where('name', $jabatanBaru)->exists()) {

                    $finalRoles = array_filter(
                        $finalRoles,
                        fn($role) =>
                        in_array($role, $coreRoles)
                    );

                    $finalRoles[] = $jabatanBaru;
                }
            }

            if ($hasWarga) {
                $finalRoles[] = 'warga';
            }

            $user->syncRoles(array_unique($finalRoles));
        } else {
            if ($user) $user->delete();
        }

        return back()->with('success', 'Data RT berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        try {
            $id_rw = Auth::user()->id_rw;
            $rt = Rt::where('id', $id)->where('id_rw', $id_rw)->firstOrFail();

            if ($rt->status === 'aktif') {
                return back()->with('error', 'RT masih berstatus aktif dan tidak bisa dihapus.');
            }

            User::where('id_rt', $rt->id)->delete();
            $rt->delete();

            return back()->with('success', 'RT berhasil dihapus.');
        } catch (\Exception $e) {
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function toggleStatus($id)
    {
        $rt = Rt::findOrFail($id);

        $ignoredRoles = ['rt', 'warga'];

        $user = $rt->user()->first();

        $jabatanUser = $user?->roles()
            ->whereNotIn('name', $ignoredRoles)
            ->pluck('name')
            ->first() ?? 'ketua';

        if ($rt->status === 'aktif') {
            $rt->update(['status' => 'nonaktif']);
            return back()->with('success', "RT {$rt->nomor_rt} berhasil dinonaktifkan.");
        }

        $existingActive = Rt::where('id_rw', $rt->id_rw)
            ->where('nomor_rt', $rt->nomor_rt)
            ->where('status', 'aktif')
            ->where('id', '!=', $rt->id)
            ->first();

        if ($existingActive) {

            $existingUser = $existingActive->users()->first();

            $existingJabatan = $existingUser?->roles()
                ->whereNotIn('name', $ignoredRoles)
                ->pluck('name')
                ->first() ?? 'ketua';
            if ($existingJabatan === $jabatanUser) {
                return back()->with(
                    'error',
                    "RT {$rt->nomor_rt} sudah memiliki {$existingJabatan} aktif. Nonaktifkan yang lama dulu!"
                );
            }

            if ($existingActive->akhir_jabatan && $existingActive->akhir_jabatan < now()->toDateString()) {
                $existingActive->update(['status' => 'nonaktif']);
            }
        }

        $rt->update(['status' => 'aktif']);

        return back()->with(
            'success',
            "RT {$rt->nomor_rt} dengan jabatan {$jabatanUser} berhasil diaktifkan."
        );
    }
}
