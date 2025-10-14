<?php

namespace App\Http\Controllers\Rt;

use App\Http\Controllers\Controller;
use App\Models\Pengumuman;
use App\Models\Rt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Rukun_tetangga;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\View;
use Inertia\Inertia;

class Rt_pengumumanController extends Controller
{
    /**
     * Tampilkan daftar pengumuman milik RT yang login (berdasarkan nomor RT).
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $tahun = $request->input('tahun');
        $bulan = $request->input('bulan');
        $kategori = $request->input('kategori');
        $level = $request->input('level');

        $userRtId = Auth::user()->warga->kartuKeluarga->rukunTetangga->id ?? null;
        $userRwId = Auth::user()->warga->kartuKeluarga->rw->id ?? null;

        $baseQuery = Pengumuman::query()->with([
            'rukunTetangga',
            'rw',
            'komen',
            'komen.user',
        ]);

        $baseQuery->where(function ($query) use ($userRtId, $userRwId) {
            if ($userRtId) {
                $query->where('id_rt', $userRtId);
            }
            if ($userRwId) {
                $query->orWhere(function ($subQuery) use ($userRwId) {
                    $subQuery->where('id_rw', $userRwId)
                        ->whereNull('id_rt');
                });
            }
            $query->orWhere(function ($subQuery) {
                $subQuery->whereNull('id_rt')
                    ->whereNull('id_rw');
            });
        });

        $total_pengumuman = Pengumuman::where('id_rw', $userRwId)->count();
        $total_pengumuman_filtered = (clone $baseQuery)->count();

        $pengumuman = (clone $baseQuery)
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('judul', 'like', "%$search%")
                        ->orWhere('isi', 'like', "%$search%");
                    $searchLower = strtolower($search);
                    $hariList = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
                    if (in_array($searchLower, $hariList)) {
                        $q->orWhereRaw("DAYNAME(tanggal) = ?", [$this->indoToEnglishDay($searchLower)]);
                    }
                    $bulanList = [
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
                    if (in_array($searchLower, $bulanList)) {
                        $bulanAngka = array_search($searchLower, $bulanList) + 1;
                        $q->orWhereMonth('tanggal', $bulanAngka);
                    }
                });
            })
            ->when($tahun, fn($q) => $q->whereYear('tanggal', $tahun))
            ->when($bulan, fn($q) => $q->whereMonth('tanggal', $bulan))
            ->when($kategori, fn($q) => $q->where('kategori', $kategori))
            ->when($level, function ($q) use ($request) {
                if ($request->level === 'rt') {
                    $q->whereNotNull('id_rt');
                } else {
                    $q->whereNull('id_rt');
                }
            })
            ->orderByDesc('tanggal')
            ->get();

        $daftar_tahun = (clone $baseQuery)
            ->selectRaw('YEAR(tanggal) as tahun')
            ->distinct()
            ->orderByDesc('tahun')
            ->pluck('tahun');

        $daftar_kategori = (clone $baseQuery)
            ->select('kategori')
            ->distinct()
            ->pluck('kategori');

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

        $rukun_tetangga = $userRtId ? Rt::find($userRtId) : null;
        $title = 'Pengumuman';

        return Inertia::render('RT/Pengumuman', [
            'pengumuman' => $pengumuman,
            'rukun_tetangga' => $rukun_tetangga,
            'title' => $title,
            'daftar_tahun' => $daftar_tahun,
            'daftar_kategori' => $daftar_kategori,
            'total_pengumuman' => $total_pengumuman,
            'total_pengumuman_filtered' => $total_pengumuman_filtered,
            'list_bulan' => $list_bulan,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required',
            'isi' => 'required',
            'kategori' => 'required',
            'dokumen' => 'nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov,avi,mkv,doc,docx,pdf|max:20480',
        ]);

        $dokumenPath = null;
        $dokumenName = null;

        if ($request->hasFile('dokumen')) {
            $file = $request->file('dokumen');
            $dokumenName = time() . '_' . $file->getClientOriginalName();

            $dokumenPath = $file->storeAs('documents/pengumuman-rt', $dokumenName, 'public');
        }

        $id_rt_user = Auth::user()->id_rt;
        $id_rw_user = Auth::user()->rukunTetangga->id_rw;

        $pengumuman = Pengumuman::create([
            'judul' => $request->judul,
            'isi' => $request->isi,
            'kategori' => $request->kategori,
            'tanggal' => now(),
            'id_rt' => $id_rt_user,
            'id_rw' => $id_rw_user,
            'dokumen_path' => $dokumenPath,
            'dokumen_name' => $dokumenName,
        ]);

        $pengumuman->load([
            'rukunTetangga',
            'rw',
            'komen',
            'komen.user',
        ]);

        if ($request->wantsJson()) {
            return response()->json($pengumuman);
        }

        return back()->with('success', 'Pengaduan berhasil dibuat.');
    }

    public function update(Request $request, $id)
    {
        $userRtData = Auth::user()->rukunTetangga;

        if (!$userRtData) {
            return redirect()->back()->with('error', 'Data Rukun Tetangga Anda tidak ditemukan.');
        }

        $nomorRtUser = $userRtData->nomor_rt;
        $idRwUser = $userRtData->id_rw;

        $pengumuman = Pengumuman::where(function ($q) use ($nomorRtUser, $idRwUser) {
            $q->whereHas('rukunTetangga', function ($q2) use ($nomorRtUser, $idRwUser) {
                $q2->where('nomor_rt', $nomorRtUser)
                    ->where('id_rw', $idRwUser);
            })
                ->orWhere(function ($q2) use ($idRwUser) {
                    $q2->whereNull('id_rt')
                        ->where('id_rw', $idRwUser);
                });
        })->findOrFail($id);

        $request->validate([
            'judul' => 'required|string|max:255',
            'kategori' => 'required|string|max:255',
            'isi' => 'required|string',
            'dokumen' => 'nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov,avi,mkv,doc,docx,pdf|max:20480',
            'hapus_dokumen_lama' => 'nullable|boolean',
        ]);

        $dataToUpdate = [
            'judul' => $request->judul,
            'kategori' => $request->kategori,
            'isi' => $request->isi,
            'tanggal' => now(),
        ];

        if ($request->hasFile('dokumen')) {

            if ($pengumuman->dokumen_path && Storage::disk('public')->exists($pengumuman->dokumen_path)) {
                Storage::disk('public')->delete($pengumuman->dokumen_path);
            }

            $file = $request->file('dokumen');
            $dokumenName = time() . '_' . $file->getClientOriginalName();
            $dokumenPath = $file->storeAs('documents/pengumuman-rt', $dokumenName, 'public');
            $dataToUpdate['dokumen_path'] = $dokumenPath;
            $dataToUpdate['dokumen_name'] = $dokumenName;
        } elseif ($request->boolean('hapus_dokumen_lama')) {

            if ($pengumuman->dokumen_path && Storage::disk('public')->exists($pengumuman->dokumen_path)) {
                Storage::disk('public')->delete($pengumuman->dokumen_path);
            }
            $dataToUpdate['dokumen_path'] = null;
            $dataToUpdate['dokumen_name'] = null;
        }

        $pengumuman->update($dataToUpdate);

        if ($request->wantsJson()) {
            return response()->json(
                $pengumuman->fresh([
                    'rukunTetangga',
                    'rw',
                    'komen',
                    'komen.user',
                ])
            );
        }

        return redirect()->route('rt.pengumuman.index')
            ->with('success', 'Pengumuman berhasil diperbarui.');
    }

    /**
     * Hapus pengumuman.
     */
    public function destroy($id)
    {

        $userRtData = Auth::user()->rukunTetangga;
        if (!$userRtData) {
            return redirect()->back()->with('error', 'Data Rukun Tetangga Anda tidak ditemukan.');
        }
        $nomorRtUser = $userRtData->nomor_rt;
        $idRwUser = $userRtData->id_rw;

        $pengumuman = Pengumuman::where(function ($q) use ($nomorRtUser, $idRwUser) {
            $q->whereHas('rukunTetangga', function ($q2) use ($nomorRtUser, $idRwUser) {
                $q2->where('nomor_rt', $nomorRtUser)
                    ->where('id_rw', $idRwUser);
            })
                ->orWhere(function ($q2) use ($idRwUser) {
                    $q2->whereNull('id_rt')
                        ->where('id_rw', $idRwUser);
                });
        })->findOrFail($id);

        if ($pengumuman->dokumen_path && Storage::disk('public')->exists($pengumuman->dokumen_path)) {
            Storage::disk('public')->delete($pengumuman->dokumen_path);
        }

        $pengumuman->delete();

        return response()->json([
            'message' => 'Pengumuman berhasil dihapus',
            'id' => $id,
        ]);

        return redirect()->route('rt.pengumuman.index')
            ->with('success', 'Pengumuman berhasil dihapus.');
    }

    public function exportPDF($id)
    {
        $pengumuman = Pengumuman::findOrFail($id);


        $html = View::make('rt.pengumuman.komponen.export_pengumuman', compact('pengumuman'))->render();


        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', true);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();


        $filename = 'Pengumuman ' . $pengumuman->judul . '.pdf';

        return response($dompdf->output(), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    protected function indoToEnglishDay(string $indoDay): ?string
    {
        $map = [
            'senin' => 'Monday',
            'selasa' => 'Tuesday',
            'rabu' => 'Wednesday',
            'kamis' => 'Thursday',
            'jumat' => 'Friday',
            'sabtu' => 'Saturday',
            'minggu' => 'Sunday',
        ];
        return $map[strtolower($indoDay)] ?? null;
    }

    public function komen(Request $request, $id)
    {
        $request->validate([
            'isi_komentar' => 'required_without:file|string|nullable|max:255',
            'file' => 'required_without:isi_komentar|nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov,avi,mkv,doc,docx,pdf|max:20480',
        ]);

        $pengaduan = Pengumuman::findOrFail($id);

        $filePath = null;
        $fileName = null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('file_pengumuman', $fileName, 'public');
        }

        $komentar = $pengaduan->komen()->create([
            'user_id' => Auth::id(),
            'isi_komentar' => $request->isi_komentar,
            'file_path' => $filePath,
            'file_name' => $fileName,
        ]);

        $komentar->load('user');

        return response()->json($komentar);
    }
}
