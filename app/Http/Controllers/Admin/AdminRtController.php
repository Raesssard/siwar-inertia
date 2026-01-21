<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\User;
use App\Models\Warga;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class AdminRtController extends Controller
{
    public function index(Request $request)
    {
        $title = 'Rukun Tetangga';
        $query = Rt::with([
            'user' => function ($q) {
                $q->whereHas('roles', function ($q) {
                    $q->where('name', 'rt');
                });
            },
            'user.roles',
            'user.rukunTetangga',
        ]);

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

        $rwList = Rw::with('users.roles')
            ->get()
            ->filter(function ($rw) {

                // 1. Jika RW belum punya NIK → tampilkan
                if (!$rw->nik) {
                    return true;
                }

                // 2. Cari user dengan nik yang sama dengan RW
                $userRw = $rw->users->firstWhere('nik', $rw->nik);

                // 3. Kalau user belum ada → tampilkan
                if (!$userRw) {
                    return true;
                }

                // 4. Ambil roles user tsb
                $roles = $userRw->roles->pluck('name')->map('strtolower')->toArray();

                // 5. Role yang diperbolehkan
                $allowed = ['rw', 'warga'];

                // 6. Kalau ada role di luar allowed → tolak
                foreach ($roles as $role) {
                    if (!in_array($role, $allowed)) {
                        return false;
                    }
                }

                return true;
            })
            ->values()
            ->map(fn ($rw) => [
                'id' => $rw->id,
                'nomor_rw' => $rw->nomor_rw,
                'nama_anggota_rw' => $rw->nama_anggota_rw,
            ]);

        $roles = Role::pluck('name')
            ->filter(fn($r) => !in_array(strtolower($r), ['admin', 'rw', 'rt', 'warga']))
            ->values();

        $roles = collect(['ketua'])->merge($roles)->values();

        $warga = Warga::with('kartuKeluarga.rukunTetangga')->whereDoesntHave('user.roles', function ($q) {
            $q->where('name', 'rw');
        })->get();

        return Inertia::render('Admin/Rt', [
            'rukun_tetangga' => $rukun_tetangga,
            'filters' => $request->only(['keyword', 'nomor_rt']),
            'nomorRtList' => $nomorRtList,
            'rwList' => $rwList,
            'roles' => $roles,
            'title' => $title,
            'warga' => $warga,
        ]);
    }


    public function store(Request $request)
    {
        try {
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

            $jabatan = $request->jabatan ?: 'ketua'; // default ketua

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

            if ($jabatan) {

                $rtAktif = Rt::where('id_rw', $request->id_rw)
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
                                "RT {$request->nomor_rt} pada RW ini sudah memiliki {$jabatan} aktif!"
                            )->withInput();
                        }
                    }
                }
            }
            $mulaiMenjabat = Carbon::parse($request->mulai_menjabat);

            $rt = Rt::create([
                'nik' => $request->nik,
                'no_kk' => $request->filled('nik')
                    ? optional(Warga::where('nik', $request->nik)->first())->no_kk
                    : null,
                'nomor_rt' => $request->nomor_rt,
                'nama_anggota_rt' => $request->nama_anggota_rt,
                'mulai_menjabat' => $mulaiMenjabat->toDateString(),
                'akhir_jabatan' => $mulaiMenjabat->copy()->addYears(5)->toDateString(),
                'id_rw' => $request->id_rw,
                'status' => $request->status ?? 'nonaktif',
            ]);

            if ($request->filled('nik') && $request->filled('nama_anggota_rt')) {

                $user = User::updateOrCreate(
                    ['nik' => $request->nik],
                    [
                        'nama' => $request->nama_anggota_rt,
                        'password' => Hash::make('password'),
                        'id_rt' => $rt->id ?? $rtAktif->id,
                        'id_rw' => $request->id_rw,
                    ]
                );

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
            }

            return redirect()->route('admin.rt.index')
                ->with('success', 'RT baru berhasil ditambahkan.');
        } catch (\Exception $e) {
            Log::error('Admin gagal menambahkan RT: ' . $e->getMessage());
            return back()->with('error', 'Gagal menambahkan data RT. Lihat log untuk lebih lanjut');
        }
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

        $jabatan = $request->jabatan ?: 'ketua';

        $rtAktif = Rt::where('id_rw', $request->id_rw)
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
                        "RT {$request->nomor_rt} pada RW ini sudah memiliki {$jabatan} aktif!"
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
            'id_rw' => $request->id_rw,
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
                    'id_rw'    => $request->id_rw,
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
                return back()->with(
                    'error',
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

        return back()->with(
            'success',
            "RT {$rt->nomor_rt} dengan jabatan {$jabatanUser} berhasil diaktifkan."
        );
    }
}
