<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Pengaduan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RwPengaduanController extends Controller
{
    public function index(Request $request)
    {
        $title = 'Pengaduan';
        $user = Auth::user();
        $rw = $user->rw;

        $tahun = $request->input('tahun');
        $bulan = $request->input('bulan');
        $search = $request->input('search');
        $kategori = $request->input('kategori');

        // 🔹 Ambil SEMUA pengaduan di wilayah RW ini (baik RT maupun RW)
        $pengaduan = Pengaduan::query()
            ->where('konfirmasi_rw', 'menunggu')
            ->orWhere('konfirmasi_rw', 'sudah')
            ->whereHas('warga.kartuKeluarga.rw', fn($q) => $q->where('id', $rw->id))
            ->with([
                'warga',
                'komentar.user',
                'warga.kartuKeluarga.rukunTetangga',
                'warga.kartuKeluarga.rw'
            ])
            ->when($tahun, fn($q) => $q->whereYear('created_at', $tahun))
            ->when($bulan, fn($q) => $q->whereMonth('created_at', $bulan))
            ->when($search, fn($q) => $q->where('judul', 'like', "%$search%"))
            ->when($kategori, fn($q) => $q->where('level', $kategori))
            ->orderByDesc('created_at')
            ->get();

        $total_pengaduan = Pengaduan::whereHas('warga.kartuKeluarga.rw', fn($q) => $q->where('id', $rw->id))->count();

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

        $total_pengaduan_filtered = $pengaduan->count();

        return Inertia::render('Pengaduan', [
            'title' => $title,
            'pengaduan' => $pengaduan,
            'total_pengaduan' => $total_pengaduan,
            'total_pengaduan_filtered' => $total_pengaduan_filtered,
            'list_bulan' => $list_bulan,
            'list_tahun' => $list_tahun,
            'list_level' => $list_level,
        ]);
    }

    /**
     * 🔹 Update status (diproses / selesai)
     * Hanya RW yang bisa ubah langsung.
     * RT tidak bisa ubah ke selesai sebelum konfirmasi disetujui.
     */
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

    /**
     * 🔹 Update konfirmasi RW
     * - RT memanggil: dari `belum` ke `menunggu`
     * - RW memanggil: dari `menunggu` ke `sudah`
     * - RW (jika level RW): langsung set `sudah`
     */
    public function updateKonfirmasi(Request $request, $id)
    {
        $pengaduan = Pengaduan::findOrFail($id);
        $user = Auth::user();
        $role = $user->roles->pluck('name')->first(); // 'rt' atau 'rw'

        if ($pengaduan->level === 'rw') {
            // Langsung disetujui otomatis
            $pengaduan->update(['konfirmasi_rw' => 'sudah']);
        } else {
            // level = 'rt'
            if ($role === 'rt' && $pengaduan->konfirmasi_rw === 'belum') {
                $pengaduan->update(['konfirmasi_rw' => 'menunggu']);
            } elseif ($role === 'rw' && $pengaduan->konfirmasi_rw === 'menunggu') {
                $pengaduan->update(['konfirmasi_rw' => 'sudah']);
            }
        }

        $isi_komentar = $request->input('isi_komentar');

        $komentar = $pengaduan->komentar()->create([
            'user_id' => Auth::id(),
            'isi_komentar' => $isi_komentar
        ]);

        $komentar->load('user');

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
