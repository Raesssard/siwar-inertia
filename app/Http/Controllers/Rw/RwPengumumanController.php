<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Pengumuman;
use App\Models\Rw;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\View;
use Dompdf\Dompdf;
use Dompdf\Options;

class RwPengumumanController extends Controller
{
    public function index(Request $request)
    {
        $title = 'Pengumuman';

        $userRwData = Auth::user()->rw;
        if (!$userRwData) {
            return redirect()->back()->with('error', 'Data RW Anda tidak ditemukan.');
        }

        $nomorRwUser = $userRwData->nomor_rw;

        $search = $request->input('search');
        $tahun = $request->input('tahun');
        $bulan = $request->input('bulan');
        $kategori = $request->input('kategori');
        $level = $request->input('level');

        $baseQuery = Pengumuman::with([
            'rukunTetangga',
            'rw',
            'komen',
            'komen.user',
        ])
            ->whereHas('rw', function ($q) use ($nomorRwUser) {
                $q->where('nomor_rw', $nomorRwUser);
            });

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

        return Inertia::render('Pengumuman', [
            'pengumuman' => $pengumuman,
            'title' => $title,
            'daftar_tahun' => $daftar_tahun,
            'daftar_kategori' => $daftar_kategori,
            'total_pengumuman' => $total_pengumuman,
            'total_pengumuman_filtered' => $pengumuman->count(),
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

        $path = null;
        $name = null;

        if ($request->hasFile('dokumen')) {
            $file = $request->file('dokumen');
            $name = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('documents/pengumuman-rw', $name, 'public');
        }

        $pengumuman = Pengumuman::create([
            'judul' => $request->judul,
            'isi' => $request->isi,
            'kategori' => $request->kategori,
            'tanggal' => Carbon::parse($request->tanggal)->format('Y-m-d H:i:s'),
            'tempat' => $request->tempat ? $request->tempat : Auth::user()->warga->kartuKeluarga->alamat,
            'id_rw' => Auth::user()->id_rw,
            'dokumen_path' => $path,
            'dokumen_name' => $name,
        ]);

        $pengumuman->load(['rw', 'komen.user']);

        return response()->json($pengumuman);
    }

    public function update(Request $request, $id)
    {
        $rwUser = Auth::user()->warga->kartuKeluarga->rw ?? null;
        $rwId = $rwUser->id ?? null;

        $pengumuman = Pengumuman::where('id_rw', $rwId)
            ->whereNull('id_rt')
            ->findOrFail($id);

        $request->validate([
            'judul' => 'required|string|max:255',
            'kategori' => 'required|string|max:255',
            'isi' => 'required|string',
            'dokumen' => 'nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov,avi,mkv,doc,docx,pdf|max:20480',
            'hapus_dokumen_lama' => 'nullable|boolean',
        ]);

        $updateData = [
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
            $name = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('documents/pengumuman-rw', $name, 'public');
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

        return response()->json($pengumuman->fresh(['rw', 'komen.user']));
    }

    public function destroy($id)
    {
        $rwUser = Auth::user()->warga->kartuKeluarga->rw ?? null;
        $rwId = $rwUser->id ?? null;

        $pengumuman = Pengumuman::findOrFail($id);

        if ($pengumuman->dokumen_path && Storage::disk('public')->exists($pengumuman->dokumen_path)) {
            Storage::disk('public')->delete($pengumuman->dokumen_path);
        }

        $pengumuman->delete();

        return response()->json(['message' => 'Pengumuman berhasil dihapus', 'id' => $id]);
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

        $kk = $data->rw->kartuKeluarga->where('no_kk', $role === 'rw' ? $rw->no_kk : $rt->no_kk)->first();

        $pdf = Pdf::loadView('rt.export-pengumuman', [
            'rt' => $data->rukunTetangga->nomor_rt ?? null,
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
        /** @var User $user */
        $user = Auth::user();
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

        $validRoles = ['admin', 'rw', 'rt', 'warga'];
        $sideRoles = $user->roles()
            ->whereNotIn('name', $validRoles)
            ->pluck('name')
            ->first();

        $komentar = $pengaduan->komen()->create([
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
