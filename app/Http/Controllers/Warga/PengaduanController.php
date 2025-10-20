<?php

namespace App\Http\Controllers\Warga;

use App\Http\Controllers\Controller;
use App\Models\Pengaduan;
use App\Models\PengaduanKomentar;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PengaduanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        $title = 'Pengaduan';
        if (!$user || !$user->hasRole('warga') || !$user->warga) {
            Log::warning("Akses tidak sah ke halaman tagihan warga atau data warga tidak ditemukan.", ['user_id' => $user->id ?? 'guest']);
            return redirect('/')->with('error', 'Anda tidak memiliki akses ke halaman ini atau data profil Anda tidak lengkap.');
        }

        $nik_warga = $user->warga->nik;

        if (!$nik_warga) {
            Log::warning("Nomor Induk Kependudukan tidak ditemukan untuk warga yang login.", ['user_id' => $user->id, 'nik' => $user->nik]);
            return redirect('/')->with('error', 'Data Kartu Keluarga Anda tidak ditemukan. Silakan hubungi RT/RW Anda.');
        }

        $tahun = $request->input('tahun');
        $bulan = $request->input('bulan');

        $pengaduanSaya = Pengaduan::query()
            ->whereHas('warga.kartuKeluarga', function ($q) use ($user) {
                $q->where('id_rw', $user->id_rw);
            })->with([
                'warga',
                'komentar.user',
                'warga.kartuKeluarga.rukunTetangga',
                'warga.kartuKeluarga.rw'
            ])
            ->when($tahun, fn($q) => $q->whereYear('created_at', $tahun))
            ->when($bulan, fn($q) => $q->whereMonth('created_at', $bulan));

        if ($request->filled('search')) {
            $hasil = $request->input('search');
            $pengaduanSaya->where(function ($item) use ($hasil) {
                $item->where('judul', 'like', "%$hasil%");
            });
        }

        if ($request->filled('kategori')) {
            if ($request->kategori === 'saya') {
                $pengaduanSaya->where('nik_warga', $nik_warga);
            } else {
                $pengaduanSaya->where('level', $request->kategori);
            }
        }

        $pengaduan = $pengaduanSaya->orderBy('created_at', 'desc')->get();

        $total_pengaduan = Pengaduan::whereHas('warga.kartuKeluarga', function ($q) use ($user) {
            $q->where('id_rw', $user->id_rw);
        })->count();
        $total_pengaduan_filtered = $pengaduan->count();

        $list_bulan = [
            'januari',
            'februari',
            'maret',
            'april',
            'mei',
            'juni',
            'juli',
            'agustus',
            'september',
            'oktober',
            'november',
            'desember'
        ];

        $list_tahun = Pengaduan::query()
            ->selectRaw('YEAR(created_at) as tahun')
            ->groupBy('tahun')
            ->orderByDesc('tahun')
            ->pluck('tahun');

        $list_level = Pengaduan::query()
            ->select('level')
            ->whereNotNull('level')
            ->distinct()
            ->pluck('level');

        return Inertia::render('Pengaduan', [
            'pengaduan' => $pengaduan,
            'title' => $title,
            'total_pengaduan' => $total_pengaduan,
            'total_pengaduan_filtered' => $total_pengaduan_filtered,
            'list_bulan' => $list_bulan,
            'list_tahun' => $list_tahun,
            'list_level' => $list_level,
        ]);
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
        $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
            'file' => 'nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov,avi,mkv,doc,docx,pdf|max:20480',
            'level' => 'required|in:rt,rw',
        ]);

        try {
            $nik_user = Auth::user()->warga->nik;
            $filePath = null;
            $fileName = null;

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('file', $fileName, 'public');
            }

            $pengaduan = Pengaduan::create([
                'nik_warga'   => $nik_user,
                'judul'       => $request->judul,
                'isi'         => $request->isi,
                'file_path'   => $filePath,
                'file_name'   => $fileName,
                'status'      => 'belum',
                'level'       => $request->level,
                'konfirmasi_rw' => $request->level === 'rt' ? 'belum' : 'menunggu',
            ]);

            // load relasi biar React langsung dapat data lengkap
            $pengaduan->load(['warga', 'komentar.user', 'warga.kartuKeluarga.rukunTetangga', 'warga.kartuKeluarga.rw']);

            if ($request->wantsJson()) {
                return response()->json($pengaduan);
            }

            return back()->with('success', 'Pengaduan berhasil dibuat.');
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $nik_user = Auth::user()->warga->nik;

        $pengaduan = Pengaduan::where(function ($q) use ($nik_user) {
            $q->whereHas('warga', function ($q2) use ($nik_user) {
                $q2->where('nik', $nik_user);
            });
        })->findOrFail($id);

        $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
            'level' => 'required|in:rt,rw',
            'file' => 'nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov,avi,mkv,doc,docx,pdf|max:20480',
            'hapus_dokumen_lama' => 'nullable|boolean',
        ]);

        $dataYangDiUpdate = [
            'judul' => $request->judul,
            'isi' => $request->isi,
            'level' => $request->level,
        ];
        if ($request->hasFile('file')) {
            if ($pengaduan->file_path && Storage::disk('public')->exists($pengaduan->file_path)) {
                Storage::disk('public')->delete($pengaduan->file_path);
            }
            $file = $request->file('file');
            $namaFile = time() . '_' . $file->getClientOriginalName();
            $pathFile = $file->storeAs('file', $namaFile, 'public');
            $dataYangDiUpdate['file_path'] = $pathFile;
            $dataYangDiUpdate['file_name'] = $namaFile;
        } elseif ($request->boolean('hapus_dokumen_lama')) {
            if ($pengaduan->file_path && Storage::disk('public')->exists($pengaduan->file_path)) {
                Storage::disk('public')->delete($pengaduan->file_path);
            }
            $dataYangDiUpdate['file_path'] = null;
            $dataYangDiUpdate['file_name'] = null;
        }

        $pengaduan->update($dataYangDiUpdate);

        if ($request->wantsJson()) {
            return response()->json(
                $pengaduan->fresh([
                    'warga',
                    'komentar.user',
                    'warga.kartuKeluarga.rukunTetangga',
                    'warga.kartuKeluarga.rw'
                ])
            );
        }

        return redirect()->route('warga.pengaduan.index')
            ->with('success', 'Pengaduan berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        $nik_user = Auth::user()->warga->nik;

        $pengaduan = Pengaduan::where(function ($q) use ($nik_user) {
            $q->whereHas('warga', function ($q2) use ($nik_user) {
                $q2->where('nik', $nik_user);
            });
        })->findOrFail($id);

        if ($pengaduan->file_path && Storage::disk('public')->exists($pengaduan->file_path)) {
            Storage::disk('public')->delete($pengaduan->file_path);
        }

        $pengaduan->delete();

        return response()->json([
            'message' => 'Pengaduan berhasil dihapus',
            'id' => $id,
        ]);

        return redirect()->route('warga.pengaduan.index')
            ->with('success', 'Pengaduan berhasil dihapus.');
    }

    public function komen(Request $request, $id)
    {
        $request->validate([
            'isi_komentar' => 'required|string|max:255'
        ]);

        $pengaduan = Pengaduan::findOrFail($id);

        $komentar = $pengaduan->komentar()->create([
            'user_id' => Auth::id(),
            'isi_komentar' => $request->isi_komentar
        ]);

        $komentar->load('user');

        return response()->json($komentar);
    }
}
