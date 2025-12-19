<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Kartu_keluarga;
use App\Models\Kategori_golongan;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class RwKartuKeluargaController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->search;
        $title = 'Kartu Keluarga';

        $userRwData = Auth::user()->rw;
        if (!$userRwData) {
            return redirect()->back()->with('error', 'Data RW Anda tidak ditemukan.');
        }

        $nomorRwUser = $userRwData->nomor_rw;

        $total_kk = Kartu_keluarga::whereHas('rw', function ($q) use ($nomorRwUser) {
            $q->where('nomor_rw', $nomorRwUser);
        })->count();

        $kartu_keluarga = Kartu_keluarga::with([
            'warga.kartuKeluarga.rukunTetangga',
            'rukunTetangga.rw',
            'rw',
            'warga.kartuKeluarga.rw',
            'kategoriGolongan',
            'kepalaKeluarga'
        ])
            ->whereHas('rw', function ($q) use ($nomorRwUser) {
                $q->where('nomor_rw', $nomorRwUser);
            })
            ->when($search, function ($query) use ($search) {
                $query->where('alamat', 'like', "%{$search}%")
                    ->orWhere('no_kk', 'like', "%{$search}%")
                    ->orWhereHas('warga', function ($q) use ($search) {
                        $q->where('nama', 'like', "%{$search}%")
                            ->where('status_hubungan_dalam_keluarga', 'Kepala Keluarga');
                    });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(5)
            ->withQueryString();

        $kategori_iuran = Kategori_golongan::select('id', 'jenis')->get();

        $daftar_rt = Rt::whereHas('rw', function ($q) use ($nomorRwUser) {
            $q->where('nomor_rw', $nomorRwUser);
        })
            ->select('id', 'nomor_rt', 'id_rw')
            ->with(['rw', 'user.roles'])
            ->whereHas('user', function ($q) {
                $q->whereHas('roles', fn($r) => $r->where('name', 'rt'))
                    ->whereDoesntHave('roles', fn($r) => $r->whereIn('name', ['sekretaris', 'bendahara', 'seksi']));
            })
            ->get();

        return Inertia::render('Rw/KartuKeluarga', [
            'kartu_keluarga' => $kartu_keluarga,
            'kategori_iuran' => $kategori_iuran,
            'daftar_rt' => $daftar_rt,
            'title' => $title,
            'total_kk' => $total_kk
        ]);
    }

    public function create()
    {
        $title = 'Tambah Kartu Keluarga';

        $userRw = Auth::user()->rw;

        $kategori_iuran = Kategori_golongan::select('id', 'jenis')->get();

        $daftar_rt = Rt::select('id', 'nomor_rt', 'id_rw')
            ->with([
                'rw',
                'user' => function ($q) {
                    $q->whereHas('roles', function ($r) {
                        $r->where('name', 'rt');
                    })
                        ->whereDoesntHave('roles', function ($r) {
                            $r->whereIn('name', ['sekretaris', 'bendahara', 'seksi']);
                        });
                },
                'user.roles'
            ])
            ->where('id_rw', $userRw->id)
            ->get();

        return Inertia::render('FormKK', [
            'title' => $title,
            'kategori_iuran' => $kategori_iuran,
            'daftar_rt' => $daftar_rt,
            'mode' => 'create',
            'kk' => null
        ]);
    }

    public function store(Request $request)
    {

        $userRw = Auth::user()->rw;
        if (!$userRw) {
            return back()->with('error', 'Data RW Anda tidak ditemukan.');
        }

        $validated = $request->validate(
            [
                'no_kk' => 'required|digits:16|unique:kartu_keluarga,no_kk',
                'no_registrasi' => 'required|string|max:255',
                'alamat' => 'required|string',
                'id_rt' => 'nullable|exists:rt,id',
                'kelurahan' => 'required|string|max:255',
                'kecamatan' => 'required|string|max:255',
                'kabupaten' => 'required|string|max:255',
                'provinsi' => 'required|string|max:255',
                'kode_pos' => 'required|string|max:10',
                'tgl_terbit' => 'required|date',
                'kategori_iuran' => 'required|exists:kategori_golongan,id',
                'instansi_penerbit' => 'nullable|string|max:255',
                'kabupaten_kota_penerbit' => 'nullable|string|max:255',
                'nama_kepala_dukcapil' => 'nullable|string|max:255',
                'nip_kepala_dukcapil' => 'nullable|string|max:255',
            ],
            [
                'no_kk.unique' => 'No. KK sudah terdaftar.',
                'no_kk.digits' => 'No. KK harus terdiri dari 16 digit.',
            ]
        );

        $validated['id_rw'] = $userRw->id;
        Log::info('Data KK diterima:', $request->all());
        Kartu_keluarga::create($validated);

        return back()->with('success', 'Kartu Keluarga berhasil ditambahkan!');
    }

    public function edit($id)
    {
        $title = 'Edit Kartu Keluarga';

        $userRw = Auth::user()->rw;

        $kk = Kartu_keluarga::with(['rukunTetangga', 'rw', 'kategoriGolongan', 'kepalaKeluarga'])
            ->where('id_rw', $userRw->id)
            ->findOrFail($id);

        $kategori_iuran = Kategori_golongan::select('id', 'jenis')->get();
        $daftar_rt = Rt::select('id', 'nomor_rt', 'id_rw')
            ->with([
                'rw',
                'user' => function ($q) {
                    $q->whereHas('roles', function ($r) {
                        $r->where('name', 'rt');
                    })
                        ->whereDoesntHave('roles', function ($r) {
                            $r->whereIn('name', ['sekretaris', 'bendahara', 'seksi']);
                        });
                },
                'user.roles'
            ])
            ->where('id_rw', $userRw->id)
            ->get();

        return Inertia::render('FormKK', [
            'title' => $title,
            'kategori_iuran' => $kategori_iuran,
            'daftar_rt' => $daftar_rt,
            'mode' => 'edit',
            'kk' => $kk
        ]);
    }

    public function update(Request $request, $id)
    {

        $kk = Kartu_keluarga::findOrFail($id);

        $validated = $request->validate(
            [
                'no_kk' => 'required|digits:16|unique:kartu_keluarga,no_kk,' . $kk->id,
                'no_registrasi' => 'required|string|max:255',
                'alamat' => 'required|string',
                'id_rt' => 'nullable|exists:rt,id',
                'kelurahan' => 'required|string|max:255',
                'kecamatan' => 'required|string|max:255',
                'kabupaten' => 'required|string|max:255',
                'provinsi' => 'required|string|max:255',
                'kode_pos' => 'required|string|max:10',
                'tgl_terbit' => 'required|date',
                'kategori_iuran' => 'required|exists:kategori_golongan,id',
                'instansi_penerbit' => 'nullable|string|max:255',
                'kabupaten_kota_penerbit' => 'nullable|string|max:255',
                'nama_kepala_dukcapil' => 'nullable|string|max:255',
                'nip_kepala_dukcapil' => 'nullable|string|max:255',
            ],
            [
                'no_kk.unique' => 'No. KK sudah terdaftar.',
                'no_kk.digits' => 'No. KK harus terdiri dari 16 digit.',
            ]
        );

        $kk->update($validated);
        return back()->with('success', 'Kartu Keluarga berhasil diperbarui!');
    }

    public function destroy($id)
    {
        try {
            $kk = Kartu_keluarga::findOrFail($id);

            if ($kk->foto_kk) {
                Storage::disk('public')->delete($kk->foto_kk);
            }

            $kk->delete();
            return back()->with('success', 'Kartu Keluarga berhasil dihapus!');
        } catch (\Exception $e) {
            Log::error('Gagal hapus KK: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus data KK.');
        }
    }

    public function uploadFoto(Request $request, $no_kk)
    {
        try {
            $kartuKeluarga = Kartu_keluarga::where('no_kk', $no_kk)->firstOrFail();

            $request->validate([
                'kk_file' => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120',
            ]);

            $file = $request->file('kk_file');
            $fileName = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();

            if ($kartuKeluarga->foto_kk) {
                Storage::disk('public')->delete($kartuKeluarga->foto_kk);
            }

            $path = $file->storeAs('kartu_keluarga', $fileName, 'public');
            $kartuKeluarga->update(['foto_kk' => $path]);

            return response()->json([
                'message' => 'Dokumen berhasil diunggah!',
                'path' => asset("storage/{$path}"),
                'kartuKeluarga' => $kartuKeluarga->load([
                    'warga.kartuKeluarga.rukunTetangga',
                    'rukunTetangga',
                    'rw',
                    'warga.kartuKeluarga.rw',
                    'kategoriGolongan',
                    'kepalaKeluarga'
                ])
            ]);
        } catch (\Exception $e) {
            Log::error('Upload KK RW error: ' . $e->getMessage());
            return response()->json(['error' => 'Upload gagal'], 500);
        }
    }

    public function deleteFoto($no_kk)
    {
        try {
            $kartuKeluarga = Kartu_keluarga::where('no_kk', $no_kk)->firstOrFail();

            if ($kartuKeluarga->foto_kk) {
                Storage::disk('public')->delete($kartuKeluarga->foto_kk);
                $kartuKeluarga->update(['foto_kk' => null]);
                return response()->json([
                    'message' => 'Dokumen Kartu Keluarga berhasil dihapus!',
                    'kartuKeluarga' => $kartuKeluarga->load([
                        'warga.kartuKeluarga.rukunTetangga',
                        'rukunTetangga',
                        'rw',
                        'warga.kartuKeluarga.rw',
                        'kategoriGolongan',
                        'kepalaKeluarga'
                    ])
                ]);
            }

            return back()->with('error', 'Tidak ada dokumen untuk dihapus.');
        } catch (\Exception $e) {
            Log::error('Hapus foto KK gagal: ' . $e->getMessage());
            return response()->json(['error' => 'Hapus gagal'], 500);
        }
    }
}
