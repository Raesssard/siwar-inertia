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
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class RwRukunTetanggaController extends Controller
{
    public function index(Request $request)
    {
        $id_rw = Auth::user()->id_rw;
        $title = 'Rukun Tetangga';

        // 🔹 Query utama
        $query = Rt::where('id_rw', $id_rw);

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

        // 🔸 Ambil data RT paginasi
        $rukun_tetangga = $query->orderBy('nomor_rt')->paginate(10)->withQueryString();

        // 🔸 Ambil daftar nomor RT unik (untuk dropdown filter)
        $rukun_tetangga_filter = Rt::where('id_rw', $id_rw)
            ->select('nomor_rt')
            ->distinct()
            ->orderBy('nomor_rt')
            ->get();

        // 🔸 Ambil role tambahan selain bawaan
        $roles = Role::pluck('name')
            ->filter(fn($r) => !in_array(strtolower($r), ['admin', 'rw', 'rt', 'warga']))
            ->values();

        $roles = collect(['ketua'])->merge($roles)->values();

        // 📦 Kirim data ke Inertia
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

        // 🚦 Batas RT per RW
        $maxRtPerRw = Setting::where('key', 'max_rt_per_rw')->value('value') ?? 6;
        $rtCount = Rt::where('id_rw', $id_rw)->count();
        if ($rtCount >= $maxRtPerRw) {
            return back()->with('error', "RW ini sudah memiliki {$maxRtPerRw} RT.")->withInput();
        }

        // 🚫 Cegah jabatan ganda aktif
        if ($request->filled('jabatan')) {
            $existing = User::whereHas('roles', fn($q) => $q->where('name', $request->jabatan))
                ->whereHas('rt', fn($q) => $q
                    ->where('nomor_rt', $request->nomor_rt)
                    ->where('id_rw', $id_rw))
                ->exists();

            if ($existing) {
                return back()->with('error', "RT {$request->nomor_rt} sudah memiliki {$request->jabatan} aktif!")->withInput();
            }
        }

        // 💾 Simpan RT
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

        // 👤 Buat user jika lengkap
        if ($request->filled('nik') && $request->filled('nama_anggota_rt')) {
            $user = User::create([
                'nik' => $request->nik,
                'nama' => $request->nama_anggota_rt,
                'password' => Hash::make('password'),
                'id_rt' => $rt->id,
                'id_rw' => $id_rw,
            ]);

            $roles = ['rt'];
            if ($request->filled('jabatan') && $request->jabatan !== 'ketua') {
                if (Role::where('name', $request->jabatan)->exists()) {
                    $roles[] = $request->jabatan;
                }
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
            'nik' => ['nullable', Rule::unique('rt')->ignore($id)],
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

        if ($request->filled('jabatan')) {
            $existing = User::whereHas('roles', fn($q) => $q->where('name', $request->jabatan))
                ->whereHas('rt', fn($q) => $q
                    ->where('nomor_rt', $request->nomor_rt)
                    ->where('id_rw', $id_rw)
                    ->where('id', '!=', $rt->id))
                ->exists();

            if ($existing) {
                return back()->with('error', "RT {$request->nomor_rt} sudah memiliki {$request->jabatan} aktif!")->withInput();
            }
        }

        // 🔄 Update RT
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
                    'id_rw' => $id_rw,
                ]);
            }

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
        $id_rw = Auth::user()->id_rw;
        $rt = Rt::where('id', $id)->where('id_rw', $id_rw)->firstOrFail();

        if ($rt->status === 'aktif') {
            $rt->update(['status' => 'nonaktif']);
            return back()->with('success', "RT {$rt->nomor_rt} berhasil dinonaktifkan.");
        }

        $existingActive = Rt::where('id_rw', $id_rw)
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
