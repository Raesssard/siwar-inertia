<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengumuman;
use App\Models\Rt;
use App\Models\Rw;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\View;
use Barryvdh\DomPDF\Facade\Pdf;

class AdminPengumumanController extends Controller
{
    public function index(Request $request)
    {
        $title = 'Pengumuman';

        $search = $request->input('search');
        $tahun = $request->input('tahun');
        $bulan = $request->input('bulan');
        $kategori = $request->input('kategori');
        $level = $request->input('level');
        $allowedMainRoles = ['admin', 'rw', 'rt', 'warga'];

        $baseQuery = Pengumuman::with([
            'rukunTetangga',
            'rw',
            'komen',
            'komen.user',
        ]);

        $total_pengumuman = (clone $baseQuery)->count();

        $pengumuman = (clone $baseQuery)
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('judul', 'like', "%$search%")
                        ->orWhere('isi', 'like', "%$search%");
                });
            })
            ->when($tahun, fn($q) => $q->whereYear('tanggal', $tahun))
            ->when($bulan, fn($q) => $q->whereMonth('tanggal', $bulan))
            ->when($kategori, fn($q) => $q->where('kategori', $kategori))
            ->when($level, function ($q) use ($level) {
                if ($level === 'rt') {
                    $q->whereNotNull('id_rt');
                } elseif ($level === 'rw') {
                    $q->whereNull('id_rt');
                }
            })
            ->orderByDesc('tanggal')
            ->get();

        $daftar_tahun = Pengumuman::selectRaw('YEAR(tanggal) as tahun')
            ->distinct()
            ->orderByDesc('tahun')
            ->pluck('tahun');

        $daftar_kategori = Pengumuman::select('kategori')
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

        $rwList = Rw::whereHas('users', function ($q) use ($allowedMainRoles) {
            $q->whereHas('roles', fn($qrw) => $qrw->where('name', 'rw'))
                ->whereDoesntHave(
                    'roles',
                    fn($qx) =>
                    $qx->whereNotIn('name', $allowedMainRoles)
                );
        })
            ->select('id', 'nomor_rw', 'nama_anggota_rw')
            ->get();

        $rtList = Rt::whereHas('user', function ($q) use ($allowedMainRoles) {
            $q->whereHas('roles', fn($qrt) => $qrt->where('name', 'rt'))
                ->whereDoesntHave(
                    'roles',
                    fn($qx) =>
                    $qx->whereNotIn('name', $allowedMainRoles)
                );
        })
            ->select('id', 'id_rw', 'nomor_rt', 'nama_anggota_rt')
            ->get();

        return Inertia::render('Pengumuman', [
            'pengumuman' => $pengumuman,
            'title' => $title,
            'daftar_tahun' => $daftar_tahun,
            'daftar_kategori' => $daftar_kategori,
            'total_pengumuman' => $total_pengumuman,
            'total_pengumuman_filtered' => $pengumuman->count(),
            'list_bulan' => $list_bulan,
            'rwList' => $rwList,
            'rtList' => $rtList,
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
            'id_rw' => 'required|exists:rw,id',
            'id_rt' => 'nullable|exists:rt,id',
            'dokumen' => 'nullable|file|mimes:doc,docx,xls,xlsx,pdf,jpg,jpeg,png,gif,mp4,mkv|max:20480',
        ]);

        $path = null;
        $name = null;

        if ($request->hasFile('dokumen')) {
            $file = $request->file('dokumen');
            $name = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('documents/pengumuman-admin', $name, 'public');
        }

        $pengumuman = Pengumuman::create([
            'judul' => $request->judul,
            'isi' => $request->isi,
            'kategori' => $request->kategori,
            'tanggal' => Carbon::parse($request->tanggal)->format('Y-m-d H:i:s'),
            'tempat' => $request->tempat ?? '-',
            'id_rw' => $request->id_rw,
            'id_rt' => $request->id_rt,
            'dokumen_path' => $path,
            'dokumen_name' => $name,
        ]);

        return response()->json($pengumuman->load(['rw', 'rukunTetangga']));
    }

    public function update(Request $request, $id)
    {
        $pengumuman = Pengumuman::findOrFail($id);

        $request->validate([
            'judul' => 'required|string|max:255',
            'kategori' => 'required|string|max:255',
            'isi' => 'required|string',
            'id_rw' => 'required|exists:rw,id',
            'id_rt' => 'nullable|exists:rukun_tetangga,id',
            'dokumen' => 'nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov,avi,mkv,doc,docx,pdf|max:20480',
            'hapus_dokumen_lama' => 'nullable|boolean',
        ]);

        $updateData = [
            'judul' => $request->judul,
            'kategori' => $request->kategori,
            'isi' => $request->isi,
            'tanggal' => now(),
            'id_rw' => $request->id_rw,
            'id_rt' => $request->id_rt,
        ];

        if ($request->hasFile('dokumen')) {
            if ($pengumuman->dokumen_path && Storage::disk('public')->exists($pengumuman->dokumen_path)) {
                Storage::disk('public')->delete($pengumuman->dokumen_path);
            }
            $file = $request->file('dokumen');
            $name = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('documents/pengumuman-admin', $name, 'public');

            $updateData['dokumen_path'] = $path;
            $updateData['dokumen_name'] = $name;
        } elseif ($request->boolean('hapus_dokumen_lama')) {
            if ($pengumuman->dokumen_path && Storage::disk('public')->exists($pengumuman->dokumen_path)) {
                Storage::disk('public')->delete($pengumuman->dokumen_path);
            }
            $updateData['dokumen_path'] = null;
            $updateData['dokumen_name'] = null;
        }

        $pengumuman->update($updateData);

        return response()->json($pengumuman->fresh(['rw', 'rukunTetangga']));
    }

    public function destroy($id)
    {
        $pengumuman = Pengumuman::findOrFail($id);

        if ($pengumuman->dokumen_path && Storage::disk('public')->exists($pengumuman->dokumen_path)) {
            Storage::disk('public')->delete($pengumuman->dokumen_path);
        }

        $pengumuman->delete();

        return response()->json(['message' => 'Pengumuman berhasil dihapus', 'id' => $id]);
    }

    public function exportPDF($id)
    {
        $data = Pengumuman::with(['rukunTetangga.kartuKeluarga', 'rw.kartuKeluarga'])->findOrFail($id);

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

        // $kk = $data->rw->kartuKeluarga->where('no_kk', $role === 'rw' ? $rw->no_kk : $rt->no_kk)->first();
        $kkRt = $data->rukunTetangga?->kartuKeluarga
            ?->where('no_kk', $rt?->no_kk)
            ?->first();

        $kkRw = $data->rw?->kartuKeluarga
            ?->where('no_kk', $rw?->no_kk)
            ?->first();

        $wilayah = $role === 'rt' ? $kkRt : $kkRw;

        $pdf = Pdf::loadView('rt.export-pengumuman', [
            'rt' => $data->rukunTetangga?->nomor_rt,
            'rw' => $data->rw->nomor_rw,
            'nama_desa' => 'Nama Desa',
            'kelurahan' => $wilayah?->kelurahan,
            'kecamatan' => $wilayah?->kecamatan,
            'kabupaten' => $wilayah?->kabupaten,
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

    public function komen(Request $request, $id)
    {
        $request->validate([
            'isi_komentar' => 'required_without:file|string|nullable|max:255',
            'file' => 'required_without:isi_komentar|nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov,avi,mkv,doc,docx,pdf|max:20480',
        ]);

        $pengumuman = Pengumuman::findOrFail($id);

        $filePath = null;
        $fileName = null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('file_pengumuman', $fileName, 'public');
        }

        $komentar = $pengumuman->komen()->create([
            'user_id' => Auth::id(),
            'isi_komentar' => $request->isi_komentar,
            'file_path' => $filePath,
            'file_name' => $fileName,
        ]);

        return response()->json($komentar->load('user'));
    }
}
