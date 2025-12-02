<?php

namespace App\Http\Controllers\Rt;

use App\Http\Controllers\Controller;
use App\Models\Pengaduan;
use App\Models\PengaduanKomentar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class Rt_PengaduanController extends Controller
{
    public function index(Request $request)
    {
        $title = ' Pengaduan';
        $user = Auth::user();
        $tahun = $request->input('tahun');
        $bulan = $request->input('bulan');
        $pengaduan_rt = $user->rukunTetangga->nomor_rt;

        $pengaduan_rt_saya = Pengaduan::query()
            ->WhereHas('warga.kartuKeluarga.rukunTetangga', function ($aduan) use ($pengaduan_rt) {
                $aduan->where('level', 'rt')->where('nomor_rt', $pengaduan_rt);
            })->with([
                'warga',
                'komentar.user',
                'warga.kartuKeluarga.rukunTetangga',
                'warga.kartuKeluarga.rw'
            ])
            ->when($tahun, fn($q) => $q->whereYear('created_at', $tahun))
            ->when($bulan, fn($q) => $q->whereMonth('created_at', $bulan));;

        if ($request->filled('search')) {
            $hasil = $request->input('search');
            $pengaduan_rt_saya->where(function ($item) use ($hasil) {
                $item->where('judul', 'like', "%$hasil%");
            });
        }

        if ($request->filled('kategori')) {
            $pengaduan_rt_saya->where('level', $request->kategori);
        }

        $pengaduan = $pengaduan_rt_saya->orderBy('created_at', 'desc')->get();

        $total_pengaduan = Pengaduan::whereHas(
            'warga.kartuKeluarga.rukunTetangga',
            function ($aduan) use ($pengaduan_rt) {
                $aduan->where('level', 'rt')
                    ->where('nomor_rt', $pengaduan_rt);
            }
        )->count();

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
            'title' => $title,
            'pengaduan' => $pengaduan,
            'total_pengaduan' => $total_pengaduan,
            'total_pengaduan_filtered' => $total_pengaduan_filtered,
            'list_bulan' => $list_bulan,
            'list_tahun' => $list_tahun,
            'list_level' => $list_level,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $status = $request->input('status');

        $pengaduan = Pengaduan::findOrFail($id);

        $dataYangDiUpdate = [
            'status' => $status,
        ];

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

        return redirect()->route('rt.pengaduan.index')
            ->with('success', 'Pengaduan berhasil diperbarui.');
    }

    public function updateKonfirmasi(Request $request, $id)
    {
        /** @var User $user */
        $user = Auth::user();
        $konfirmasi_rw = $request->input('konfirmasi_rw');
        $isi_komentar = $request->input('isi_komentar');

        $pengaduan = Pengaduan::findOrFail($id);

        $pengaduan->update([
            'status' => 'diproses',
            'konfirmasi_rw' => $konfirmasi_rw,
        ]);

        $komentar = $pengaduan->komentar()->create([
            'user_id' => Auth::id(),
            'isi_komentar' => $isi_komentar,
            'role_snapshot' => session('active_role') ?? $user->getRoleNames()->first()
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

        return redirect()->route('rt.pengaduan.index')
            ->with('success', 'Pengaduan berhasil diperbarui.');
    }

    public function baca(Request $request, $id)
    {
        $pengaduan = Pengaduan::findOrFail($id);

        $pengaduan->update([
            'status' => 'diproses',
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
            'role_snapshot' => session('active_role') ?? $user->getRoleNames()->first()
        ]);

        $komentar->load('user');

        return response()->json($komentar);
    }
}
