<?php

namespace App\Http\Controllers\Rt;

use App\Http\Controllers\Controller;
use App\Models\Pengumuman;
use App\Models\Rt;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Dompdf\Dompdf;
use Dompdf\Options;
use PhpOffice\PhpWord\IOFactory as WordIO;
use PhpOffice\PhpSpreadsheet\IOFactory as ExcelIO;
use Intervention\Image\Facades\Image;
use setasign\Fpdi\Fpdi;
use Illuminate\Support\Facades\Log;
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
        Log::info("Data yg masuk: ", $request->all());
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
            ->when($tahun, fn($q) => $q->whereYear('created_at', $tahun))
            ->when($bulan, fn($q) => $q->whereMonth('created_at', $bulan))
            ->when($kategori, fn($q) => $q->where('kategori', $kategori))
            ->when($level, function ($q) use ($request) {
                if ($request->level === 'rt') {
                    $q->whereNotNull('id_rt');
                } else {
                    $q->whereNull('id_rt');
                }
            })
            ->orderByDesc('created_at')
            ->get();

        $daftar_tahun = (clone $baseQuery)
            ->selectRaw('YEAR(created_at) as tahun')
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

        $title = 'Pengumuman';
        $total_pengumuman = Pengumuman::where('id_rw', $userRwId)->count();
        $total_pengumuman_filtered = $pengumuman->count();

        return Inertia::render('Pengumuman', [
            'pengumuman' => $pengumuman,
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
            'tanggal' => 'nullable|date',
            'tempat' => 'nullable',
            'dokumen' => 'nullable|file|mimes:doc,docx,xls,xlsx,pdf|max:20480',
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
            'tanggal' => Carbon::parse($request->tanggal)->format('Y-m-d H:i:s'),
            'tempat' => $request->tempat ? $request->tempat : Auth::user()->warga->kartuKeluarga->alamat,
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
            'tanggal' => 'nullable|date',
            'tempat' => 'nullable',
            'dokumen' => 'nullable|file|mimes:doc,docx,xls,xlsx,pdf|max:20480',
            'hapus_dokumen_lama' => 'nullable|boolean',
        ]);

        $dataToUpdate = [
            'judul' => $request->judul,
            'kategori' => $request->kategori,
            'isi' => $request->isi,
            'tanggal' => $request->tanggal,
            'tempat' => $request->tempat,
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
        $data = Pengumuman::with(['rukunTetangga', 'rw.kartuKeluarga'])->findOrFail($id);

        /** @var User $user */
        $user = Auth::user();
        $role = session('active_role') ?? $user->getRoleNames()->first();
        $rt = $data->rukunTetangga;
        $rw = $data->rw;

        $rtNumber = $rt ? str_pad($rt->nomor_rt, 2, '0', STR_PAD_LEFT) : null;
        $rwNumber = $rw ? str_pad($rw->nomor_rw, 2, '0', STR_PAD_LEFT) : null;

        $bulanRomawi = [1 => "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
        $bulan = $bulanRomawi[now()->format('n')];
        $tahun = now()->year;

        $urut = str_pad($data->id, 3, '0', STR_PAD_LEFT);

        $no_surat = $rt
            ? "$urut/RT$rtNumber/$bulan/$tahun"
            : "$urut/RW$rwNumber/$bulan/$tahun";

        $hari   = Carbon::parse($data->tanggal)->translatedFormat('l');
        $tanggal = Carbon::parse($data->tanggal)->translatedFormat('d F Y');
        $waktu  = Carbon::parse($data->tanggal)->format('H:i');
        $judul = $data->judul;

        $kk = $data->rw->kartuKeluarga->where('no_kk', $rt->no_kk)->first();

        $pdf = Pdf::loadView('rt.export-pengumuman', [
            'rt' => $data->rukunTetangga->nomor_rt || null,
            'rw' => $data->rw->nomor_rw,
            'nama_desa' => 'Nama Desa',
            'kelurahan' => $kk->kelurahan,
            'kecamatan' => $kk->kecamatan,
            'kabupaten' => $kk->kabupaten,
            'nomor_surat' => $no_surat,
            'hari' => $hari,
            'tanggal' => $tanggal,
            'waktu' => $waktu,
            'tempat' => $data->tempat,
            'isi_pengumuman' => $data->isi,
            'tanggal_surat' => now()->format('d F Y'),
            'nama_penanggung_jawab' => $user->nama,
            'penanggung_jawab' => ucfirst($role),
            'judul' => $judul,
        ]);
        return $pdf->download("Surat_Pengumuman_$judul.pdf");
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
