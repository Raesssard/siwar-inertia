<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Kartu_keluarga;
use App\Models\Rukun_tetangga;
use App\Models\User;
use App\Models\Warga;
use App\Models\Jabatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class Rukun_tetanggaController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request)
    {
        $id_rw = Auth::user()->id_rw; // Dapatkan id_rw dari user yang sedang login

        // Ambil daftar RT untuk dropdown filter (hanya Ketua, unik, sesuai RW yang sama)
        $rukun_tetangga_filter = Rukun_tetangga::whereHas('jabatan', function ($q) {
                $q->where('nama_jabatan', 'ketua');
            })
            ->where('id_rw', $id_rw)
            ->select('rt')
            ->distinct()
            ->orderBy('rt')
            ->get();

        // Ambil daftar jabatan dari tabel jabatan (biar konsisten dengan DB)
        $jabatan_filter = Jabatan::all()->where('level', 'rt')->pluck('nama_jabatan', 'id');
        // Kalau mau statis: ['ketua' => 'Ketua', 'sekretaris' => 'Sekretaris', ...]

        $kartu_keluarga = Kartu_keluarga::all();

        $title = 'Rukun Tetangga';

        // Query dasar
        $query = Rukun_tetangga::with(['rw', 'jabatan'])->where('id_rw', $id_rw);

        // --- Filter ---

        // Filter RT
        if ($request->filled('rt')) {
            $query->where('rt', $request->rt);
        }

        // Filter jabatan (pakai jabatan_id)
        if ($request->filled('jabatan_id')) {
            $query->where('jabatan_id', $request->jabatan_id);
        }

        // Filter pencarian
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('no_kk', 'like', '%' . $searchTerm . '%')
                ->orWhere('nama', 'like', '%' . $searchTerm . '%');
            });
        }

        // --- Urutkan & Paginate ---
        $rukun_tetangga = $query
            ->orderBy('rt')
            ->orderBy(
                Jabatan::select('nama_jabatan')
                    ->whereColumn('jabatan.id', 'rukun_tetangga.jabatan_id')
            )
            ->paginate(10)
            ->withQueryString();

        $total_rt_di_rw = Rukun_tetangga::where('id_rw', $id_rw)->count();

        return view('rw.data-rt.rukun_tetangga', compact(
            'rukun_tetangga',
            'title',
            'total_rt_di_rw',
            'rukun_tetangga_filter',
            'kartu_keluarga',
            'jabatan_filter'
        ));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */

public function store(Request $request)
{
    try {
        $id_rw = Auth::user()->id_rw;
        if (!$id_rw) {
            return redirect()->back()
                ->with('error', 'ID RW tidak ditemukan di akun yang login. Mohon hubungi administrator.')
                ->withInput($request->input())
                ->with('showModal', 'rt_tambah')
                ->with('form_type', 'rt_tambah');
        }

        $request->validate([
            'no_kk' => ['required', 'string', 'digits:16', Rule::exists('kartu_keluarga', 'no_kk')],
            'nik' => [
                'required',
                'string',
                'digits:16',
                Rule::unique('rukun_tetangga', 'nik')->where(fn($q) => $q->where('id_rw', $id_rw)),
                function ($attribute, $value, $fail) use ($request) {
                    $warga = Warga::where('nik', $value)->where('no_kk', $request->no_kk)->first();
                    if (!$warga) {
                        $fail('NIK tidak ditemukan atau tidak terdaftar di KK.');
                    }
                },
            ],
            'rt' => ['required', 'string'],
            'nama' => [
                'required', 'string', 'max:255',
                function ($attribute, $value, $fail) use ($request) {
                    $warga = Warga::where('nik', $request->nik)->first();
                    if ($warga && $warga->nama !== $value) {
                        $fail('Nama tidak sesuai dengan NIK. Nama yang benar: ' . $warga->nama);
                    }
                },
            ],
            'mulai_menjabat' => 'required|date',
            'akhir_jabatan' => 'required|date|after:mulai_menjabat',
            'jabatan_id' => ['required', 'exists:jabatan,id'],
        ]);

        // ✅ Cek apakah jabatan inti (ketua, sekretaris, bendahara) sudah ada di RT yang sama
        $jabatan = Jabatan::find($request->jabatan_id);
        if (in_array(strtolower($jabatan->nama_jabatan), ['ketua', 'bendahara', 'sekretaris'])) {
            $exists = Rukun_tetangga::where('rt', $request->rt)
                        ->where('id_rw', $id_rw)
                        ->whereHas('jabatan', function ($q) use ($jabatan) {
                            $q->where('nama_jabatan', $jabatan->nama_jabatan);
                        })
                        ->exists();

            if ($exists) {
                return redirect()->back()
                    ->withErrors(['jabatan_id' => "RT {$request->rt} sudah punya {$jabatan->nama_jabatan}."])
                    ->withInput()
                    ->with('showModal', 'rt_tambah')
                    ->with('form_type', 'rt_tambah');
            }
        }

        $rt = Rukun_tetangga::create([
            'no_kk' => $request->no_kk,
            'nik' => $request->nik,
            'rt' => $request->rt,
            'nama' => $request->nama,
            'mulai_menjabat' => $request->mulai_menjabat,
            'akhir_jabatan' => $request->akhir_jabatan,
            'jabatan_id' => $request->jabatan_id,
            'id_rw' => $id_rw,
        ]);

        $user = User::where('nik', $request->nik)->first();
        if ($user) {
            $user->update([
                'id_rt' => $rt->id,
                'id_rw' => $id_rw,
                'password' => Hash::make('password'),
            ]);
            if (!$user->hasRole('rt')) {
                $user->assignRole('rt');
            }
        } else {
            $user = User::create([
                'nik' => $request->nik,
                'nama' => $request->nama,
                'password' => Hash::make('password'),
                'id_rt' => $rt->id,
                'id_rw' => $id_rw,
            ]);
            $user->assignRole('rt');
        }

        return redirect()->route('rw.rukun_tetangga.index')->with('success', 'Data RT berhasil ditambahkan.');
    } catch (\Illuminate\Validation\ValidationException $e) {
        return redirect()->back()
            ->withErrors($e->errors())
            ->withInput()
            ->with('showModal', 'rt_tambah')
            ->with('form_type', 'rt_tambah');
    } catch (\Exception $e) {
        return redirect()->back()
            ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
            ->withInput()
            ->with('showModal', 'rt_tambah')
            ->with('form_type', 'rt_tambah');
    }
}


/**
 * Display the specified resource.
 */
public function show(string $id)
{
    $rukun_tetangga = Rukun_tetangga::with('jabatan')->findOrFail($id);
    return view('rw.rukun_tetangga.show', compact('rukun_tetangga'));
}

/**
 * Show the form for editing the specified resource.
 */
public function edit(string $id)
{
    $rukun_tetangga = Rukun_tetangga::with('jabatan')->findOrFail($id);
    return view('rw.rukun_tetangga.edit', compact('rukun_tetangga'));
}

/**
 * Update the specified resource in storage.
 */
public function update(Request $request, string $id)
{
    $rukunTetangga = Rukun_tetangga::findOrFail($id);

    $userAuth = Auth::user();
    if (!$userAuth || !isset($userAuth->id_rw)) {
        return redirect()->back()->withErrors(['auth_error' => 'Anda tidak memiliki akses.'])->withInput();
    }
    $id_rw = $userAuth->id_rw;

    if ($rukunTetangga->id_rw !== $id_rw) {
        return redirect()->back()->withErrors(['authorization_error' => 'Anda tidak diizinkan.'])->withInput();
    }

    try {
        $request->validate([
            'no_kk' => ['required', 'string', 'digits:16', Rule::exists('kartu_keluarga', 'no_kk')],
            'nik' => [
                'required', 'string', 'digits:16',
                Rule::unique('rukun_tetangga', 'nik')
                    ->ignore($rukunTetangga->id)
                    ->where(fn($q) => $q->where('id_rw', $id_rw)),
            ],
            'rt' => ['required', 'string', 'max:10'],
            'nama' => ['required', 'string', 'max:255'],
            'mulai_menjabat' => 'required|date',
            'akhir_jabatan' => 'required|date|after_or_equal:mulai_menjabat',
            'jabatan_id' => ['required', 'exists:jabatan,id'],
        ]);

        // ✅ Cek apakah jabatan sudah ada di RT yang sama (kecuali record ini sendiri)
        // ✅ Cek apakah jabatan sudah ada di RT yang sama (kecuali record ini sendiri)
        $jabatan = Jabatan::find($request->jabatan_id);
        if (in_array(strtolower($jabatan->nama_jabatan), ['ketua', 'bendahara', 'sekretaris'])) {
            $exists = Rukun_tetangga::where('rt', $request->rt)
                        ->where('id_rw', $id_rw)
                        ->where('jabatan_id', $request->jabatan_id)
                        ->where('id', '!=', $rukunTetangga->id)
                        ->exists();
            if ($exists) {
                return redirect()->back()
                    ->withErrors(['jabatan_id' => "RT {$request->rt} sudah punya {$jabatan->nama_jabatan}."])
                    ->withInput()
                    ->with('showModal', 'rt_edit_' . $rukunTetangga->id);
            }
        }

        $rukunTetangga->update([
            'no_kk' => $request->no_kk,
            'nik' => $request->nik,
            'rt' => $request->rt,
            'nama' => $request->nama,
            'mulai_menjabat' => $request->mulai_menjabat,
            'akhir_jabatan' => $request->akhir_jabatan,
            'jabatan_id' => $request->jabatan_id,
        ]);

        $user = User::where('id_rt', $rukunTetangga->id)->first();
        if ($user) {
            $user->update([
                'nik' => $request->nik,
                'nama' => $request->nama,
            ]);
        }

        return redirect()->route('rw.rukun_tetangga.index')->with('success', 'Data RT berhasil diperbarui.');
    } catch (\Illuminate\Validation\ValidationException $e) {
        return redirect()->back()
            ->withErrors($e->errors())
            ->withInput()
            ->with('showModal', 'rt_edit_' . $rukunTetangga->id);
    } catch (\Exception $e) {
        return redirect()->back()
            ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
            ->withInput();
    }
}


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $rt = Rukun_tetangga::findOrFail($id);

            // Cari user terkait RT
            $user = User::where('id_rt', $rt->id)->first();

            if ($user) {
                // Jika user punya lebih dari 1 role, hapus role 'rt' saja
                if ($user->roles()->count() > 1) {
                    $user->removeRole('rt');
                    $user->id_rt = null; // reset id_rt
                    $user->save();
                } else {
                    // Jika hanya punya 1 role (yaitu 'rt'), hapus user
                    $user->delete();
                }
            }

            // Hapus data RT dari tabel rukun_tetangga
            $rt->delete();

            return redirect()->back()->with('success', 'RT berhasil dihapus.');
        } catch (\Illuminate\Database\QueryException $e) {
            return redirect()->back()->with('error', 'Tidak bisa menghapus RT karena masih digunakan.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
