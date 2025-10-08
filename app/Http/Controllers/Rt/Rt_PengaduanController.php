<?php

namespace App\Http\Controllers\Rt;

use App\Http\Controllers\Controller;
use App\Models\Pengaduan;
use App\Models\PengaduanKomentar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class Rt_PengaduanController extends Controller
{
    public function index(Request $request)
    {
        $title = ' Daftar Pengaduan Warga';
        $user = Auth::user();

        $pengaduan_rt = $user->rukunTetangga->rt;

        $pengaduan_rt_saya = Pengaduan::WhereHas('warga.kartuKeluarga.rukunTetangga', function ($aduan) use ($pengaduan_rt) {
            $aduan->where('level', 'rt')->where('rt', $pengaduan_rt);
        });

        if ($request->filled('search')) {
            $hasil = $request->input('search');
            $pengaduan_rt_saya->where(function ($item) use ($hasil) {
                $item->where('judul', 'like', "%$hasil%");
            });
        }

        $rt_pengaduan = $pengaduan_rt_saya->orderBy('created_at', 'desc')
            ->paginate(10);

        $total_pengaduan_rt = $rt_pengaduan->count();

        return view('rt.pengaduan.pengaduan', compact('title', 'rt_pengaduan', 'total_pengaduan_rt'));
    }


    public function show(Request $request, $id)
    {
        $rt_user = Auth::user()->rukunTetangga->rt;

        $pengaduan_rt_saya = Pengaduan::whereHas('warga.kartuKeluarga.rukunTetangga', function ($aduan) use ($rt_user) {
            $aduan->where('level', 'rt')->where('rt', $rt_user);
        })->findOrFail($id);

        if (
            $pengaduan_rt_saya->status === 'belum' &&
            $pengaduan_rt_saya->status !== 'diproses' &&
            $pengaduan_rt_saya->status !== 'selesai'
        ) {
            $pengaduan_rt_saya->update([
                'status' => 'diproses',
                'konfirmasi_rw' => 'menunggu'
            ]);

            PengaduanKomentar::create([
                'pengaduan_id' => $pengaduan_rt_saya->id,
                'user_id' => Auth::id(),
                'isi_komentar' => 'Sudah diteruskan ke RW untuk ditindaklanjuti',
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
                'pengaduan_id' => $pengaduan_rt_saya->id,
                'user_id' => Auth::id(),
                'isi_komentar' => $request->input('komentar'),
            ]);

            $pengaduan_rt_saya->update($dataUpdate);
        }

        return back()->with('success', 'Pengaduan telah selesai.');

        // NOTE:
        // gk perlu return detail_pengaduannya soalnya pake modal
        // function baca/show cuma buat ngubah status 
        // doang bukan buat buka detail, kan detail itu modal 
        // jadi bakal ngabuka sesuai id si modalnya, gk perlu function dari controller.
        // kan di elementnya itu ada data-bs-toggle sama data-bs-target, 
        // nah data-bs-target itu id si modal, modalnnya juga 
        // udah dimasukkin di @include('rt.pengaduan.komponen.detail_pengaduan'), 
        // jadi gk usah di return lagi di functionnya. 👍👍👍


        // $title = 'Detail Pengaduan';
        // $pengaduan = Pengaduan::with('warga')->findOrFail($id);


        // return view('rt.pengaduan.komponen.detail_pengaduan', compact('title', 'pengaduan'));
    }
}
