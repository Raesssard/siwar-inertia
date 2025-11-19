<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Pengumuman;
use App\Models\Rw;
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

        // Ambil data RW user
        $userRwData = Auth::user()->rw;
        if (!$userRwData) {
            return redirect()->back()->with('error', 'Data RW Anda tidak ditemukan.');
        }

        // Ambil nomor RW user
        $nomorRwUser = $userRwData->nomor_rw;

        $search = $request->input('search');
        $tahun = $request->input('tahun');
        $bulan = $request->input('bulan');
        $kategori = $request->input('kategori');
        $level = $request->input('level');

        // ✔ Query hanya yang berada di RW ini (pakai nomor_rw)
        $baseQuery = Pengumuman::with([
                'rukunTetangga',
                'rw',
                'komen',
                'komen.user',
            ])
            ->whereHas('rw', function ($q) use ($nomorRwUser) {
                $q->where('nomor_rw', $nomorRwUser);
            });

        // Hitung total
        $total_pengumuman = (clone $baseQuery)->count();

        // Setelah filter
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

        // Tahun dan kategori
        $daftar_tahun = Pengumuman::selectRaw('YEAR(tanggal) as tahun')
            ->distinct()
            ->orderByDesc('tahun')
            ->pluck('tahun');

        $daftar_kategori = Pengumuman::select('kategori')
            ->distinct()
            ->pluck('kategori');

        // Nama bulan
        $list_bulan = [
            'januari','februari','maret','april','mei','juni',
            'juli','agustus','september','oktober','november','desember'
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
