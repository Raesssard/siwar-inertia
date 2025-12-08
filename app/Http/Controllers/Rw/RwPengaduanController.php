<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Pengaduan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RwPengaduanController extends Controller
{
    public function index(Request $request)
    {
        $title = 'Pengaduan';

        $userRwData = Auth::user()->rw;

        if (!$userRwData) {
            return back()->with('error', 'Data RW Anda tidak ditemukan.');
        }

        $nomorRwUser = $userRwData->nomor_rw;

        $tahun = $request->input('tahun');
        $bulan = $request->input('bulan');
        $search = $request->input('search');
        $kategori = $request->input('kategori');

        $pengaduan = Pengaduan::query()
            ->whereHas('warga.kartuKeluarga.rw', function ($q) use ($nomorRwUser) {
                $q->where('nomor_rw', $nomorRwUser);
            })
            ->where(function ($q) {
                $q->where('konfirmasi_rw', 'menunggu')
                    ->orWhere('konfirmasi_rw', 'sudah');
            })
            ->with([
                'warga',
                'komentar.user',
                'warga.kartuKeluarga.rukunTetangga',
                'warga.kartuKeluarga.rw'
            ])
            ->when($tahun, fn($q) => $q->whereYear('created_at', $tahun))
            ->when($bulan, fn($q) => $q->whereMonth('created_at', $bulan))
            ->when($search, fn($q) => $q->where('judul', 'like', "%{$search}%"))
            ->when($kategori, fn($q) => $q->where('level', $kategori))
            ->orderByDesc('created_at')
            ->get();

        $total_pengaduan = Pengaduan::whereHas('warga.kartuKeluarga.rw', function ($q) use ($nomorRwUser) {
            $q->where('nomor_rw', $nomorRwUser);
        })->count();

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

        $list_tahun = Pengaduan::selectRaw('YEAR(created_at) as tahun')
            ->groupBy('tahun')
            ->orderByDesc('tahun')
            ->pluck('tahun');

        $list_level = Pengaduan::select('level')->distinct()->pluck('level');

        return Inertia::render('Pengaduan', [
            'title' => $title,
            'pengaduan' => $pengaduan,
            'total_pengaduan' => $total_pengaduan,
            'total_pengaduan_filtered' => $pengaduan->count(),
            'list_bulan' => $list_bulan,
            'list_tahun' => $list_tahun,
            'list_level' => $list_level,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $pengaduan = Pengaduan::findOrFail($id);
        $status = $request->input('status');

        if ($pengaduan->level === 'rt' && $pengaduan->konfirmasi_rw !== 'sudah' && $status === 'selesai') {
            return response()->json([
                'error' => 'Belum dapat diselesaikan karena belum dikonfirmasi oleh RW.',
            ], 403);
        }

        $pengaduan->update(['status' => $status]);

        return response()->json([
            'pengaduan' => $pengaduan->fresh(['warga', 'komentar.user']),
        ]);
    }

    public function updateKonfirmasi(Request $request, $id)
    {
        $pengaduan = Pengaduan::findOrFail($id);
        $user = Auth::user();
        $role = $user->roles->pluck('name')->first();

        if ($pengaduan->level === 'rw') {
            $pengaduan->update(['konfirmasi_rw' => 'sudah']);
        } else {
            if ($role === 'rt' && $pengaduan->konfirmasi_rw === 'belum' && $pengaduan->level === 'rt') {
                $pengaduan->update(['konfirmasi_rw' => 'menunggu']);
            } elseif ($role === 'rw' && $pengaduan->konfirmasi_rw === 'menunggu' && $pengaduan->level === 'rt') {
                $pengaduan->update(['konfirmasi_rw' => 'sudah']);
            }
        }

        $komentar = null;

        if ($role === 'rt') {
            $isi_komentar = $request->input('isi_komentar');

            $komentar = $pengaduan->komentar()->create([
                'user_id' => Auth::id(),
                'isi_komentar' => $isi_komentar
            ]);

            $komentar->load('user');
        }


        return response()->json([
            'pengaduan' => $pengaduan->fresh([
                'warga',
                'komentar.user',
                'warga.kartuKeluarga.rukunTetangga',
                'warga.kartuKeluarga.rw'
            ]),
            'komentar' => $komentar
        ]);
    }

    public function baca(Request $request, $id)
    {
        $pengaduan = Pengaduan::findOrFail($id);

        $pengaduan->update([
            'status' => 'diproses',
            'konfirmasi_rw' => 'sudah',
        ]);
    }

    public function komen(Request $request, $id)
    {
        /** @var User $user */
        $user = Auth::user();
        $request->validate([
            'isi_komentar' => 'required_without:file|string|nullable|max:255',
            'file' => 'required_without:isi_komentar|nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov,avi,mkv,doc,docx,pdf|max:20480',
        ]);

        $validRoles = ['admin', 'rw', 'rt', 'warga'];
        $sideRoles = $user->roles()
            ->whereNotIn('name', $validRoles)
            ->pluck('name')
            ->first();

        $pengaduan = Pengaduan::findOrFail($id);

        $filePath = null;
        $fileName = null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('file_pengaduan', $fileName, 'public');
        }

        $komentar = $pengaduan->komentar()->create([
            'user_id' => Auth::id(),
            'isi_komentar' => $request->isi_komentar,
            'file_path' => $filePath,
            'file_name' => $fileName,
            'role_snapshot' => $sideRoles ? $sideRoles : session('active_role') ?? $user->getRoleNames()->first()
        ]);

        $komentar->load('user');

        return response()->json($komentar);
    }
}
