<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengaduan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminPengaduanController extends Controller
{
    public function index(Request $request)
    {
        $title = 'Pengaduan';

        $tahun = $request->input('tahun');
        $bulan = $request->input('bulan');
        $search = $request->input('search');
        $kategori = $request->input('kategori');

        $pengaduan = Pengaduan::query()
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

        $total_pengaduan = Pengaduan::count();

        $list_bulan = [
            'januari','februari','maret','april','mei','juni',
            'juli','agustus','september','oktober','november','desember'
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

        $pengaduan->update(['status' => $status]);

        return response()->json([
            'pengaduan' => $pengaduan->fresh(['warga', 'komentar.user'])
        ]);
    }

    public function updateKonfirmasi(Request $request, $id)
    {
        $pengaduan = Pengaduan::findOrFail($id);

        $pengaduan->update([
            'konfirmasi_rw' => 'sudah',
        ]);

        if ($request->filled('isi_komentar') || $request->hasFile('file')) {
            $isi = $request->input('isi_komentar');
            $filePath = null;
            $fileName = null;

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('file_pengaduan', $fileName, 'public');
            }

            $komentar = $pengaduan->komentar()->create([
                'user_id' => Auth::id(),
                'isi_komentar' => $isi,
                'file_path' => $filePath,
                'file_name' => $fileName,
            ]);

            $komentar->load('user');
        } else {
            $komentar = null;
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
        $request->validate([
            'isi_komentar' => 'required_without:file|string|nullable|max:255',
            'file' => 'required_without:isi_komentar|nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov,avi,mkv,doc,docx,pdf|max:20480',
        ]);

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
        ]);

        $komentar->load('user');

        return response()->json($komentar);
    }
}
