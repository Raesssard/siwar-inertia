<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Pengaduan;
use App\Models\PengaduanKomentar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class RwPengaduanController extends Controller
{
    public function index(Request $request)
    {
        $title = ' Daftar Pengaduan Warga';
        $user = Auth::user();

        $pengaduan_rw = $user->rw->nomor_rw;

        $pengaduan_rw_saya = Pengaduan::WhereHas('warga.kartuKeluarga.rw', function ($aduan) use ($pengaduan_rw) {
            $aduan->where('konfirmasi_rw', '!=', 'belum')->where('nomor_rw', $pengaduan_rw);
        });

        if ($request->filled('search')) {
            $hasil = $request->input('search');
            $pengaduan_rw_saya->where(function ($item) use ($hasil) {
                $item->where('judul', 'like', "%$hasil%");
            });
        }

        $rw_pengaduan = $pengaduan_rw_saya->orderBy('created_at', 'desc')
            ->paginate(10);

        $total_pengaduan_rw = $rw_pengaduan->count();

        return view('rw.pengaduan.pengaduan', compact('title', 'rw_pengaduan', 'total_pengaduan_rw'));
    }

    // cek dulu ada gk rute updatenya di php artisan route:list,
    // klo belum tambah dulu di web.php
    public function update(Request $request, $id)
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

    public function baca(Request $request, $id)
    {

        $rw_user = Auth::user()->rw->nomor_rw;

        $pengaduan_rw_saya = Pengaduan::whereHas('warga.kartuKeluarga.rw', function ($aduan) use ($rw_user) {
            $aduan->where('nomor_rw', $rw_user);
        })->findOrFail($id);

        if (
            $pengaduan_rw_saya->status === 'belum' &&
            $pengaduan_rw_saya->status !== 'diproses' &&
            $pengaduan_rw_saya->status !== 'selesai'
        ) {
            $pengaduan_rw_saya->update([
                'status' => 'diproses',
                'konfirmasi_rw' => 'sudah'
            ]);

            PengaduanKomentar::create([
                'pengaduan_id' => $pengaduan_rw_saya->id,
                'user_id' => Auth::id(),
                'isi_komentar' => 'Terimakasih, akan kami tindaklanjuti pengaduan tentang ' . $pengaduan_rw_saya->judul,
            ]);
        }

        if ($request->boolean('selesai')) {
            $request->validate([
                'file' => 'nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov,avi,mkv,doc,docx,pdf|max:20480',
                'komentar' => 'required',
            ]);

            $filePath = null;
            $fileName = null;

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('bukti_selesai', $fileName, 'public');
            }

            $dataUpdate = [
                'status' => 'selesai',
                'foto_bukti' => $filePath,
            ];

            PengaduanKomentar::create([
                'pengaduan_id' => $pengaduan_rw_saya->id,
                'user_id' => Auth::id(),
                'isi_komentar' => $request->input('komentar'),
            ]);

            $pengaduan_rw_saya->update($dataUpdate);

            return back()->with('success', 'Pengaduan telah selesai.');
        }
    }

    public function confirm($id)
    {
        $rw_user = Auth::user()->rw->nomor_rw;

        $pengaduan_rw_saya = Pengaduan::whereHas('warga.kartuKeluarga.rw', function ($aduan) use ($rw_user) {
            $aduan->where('nomor_rw', $rw_user);
        })->findOrFail($id);

        $pengaduan_rw_saya->update([
            'konfirmasi_rw' => 'sudah'
        ]);

        return back()->with('success', 'Pengaduan telah dikonfirmasi.');
    }
}
