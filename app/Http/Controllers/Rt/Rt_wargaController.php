<?php

namespace App\Http\Controllers\Rt;

use App\Http\Controllers\Controller;
use App\Models\Kartu_keluarga;
use App\Models\Rukun_tetangga;
use App\Models\User;
use App\Models\Warga;
use App\Models\Iuran;
use App\Models\IuranGolongan;
use App\Models\Tagihan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;

class Rt_wargaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        //
        $title = 'Manajemen Warga';
        $search = $request->search;
        $rt_id = Auth::user()->rukunTetangga->id;
        $jenis_kelamin = $request->jenis_kelamin;
        $total_warga = Warga::whereHas('kartuKeluarga', function ($query) use ($rt_id) {

            $query->where('id_rt', $rt_id);
        })->count();
        $warga = Warga::with('kartuKeluarga')
            ->whereHas('kartuKeluarga', function ($query) {
                $query->where('id_rt', Auth::user()->id_rt);
            })
            ->when($search, function ($query) use ($search) {
                $query->where('nama', 'like', '%' . $search . '%')
                    ->orWhere('nik', 'like', '%' . $search . '%')
                    ->orWhere('no_kk', 'like', '%' . $search . '%');
            })
            ->when($jenis_kelamin, function ($kelamin) use ($jenis_kelamin) {
                $kelamin->where('jenis_kelamin', $jenis_kelamin);
            })
            ->paginate(5)
            ->withQueryString();


        return view('rt.warga.warga', compact('title', 'warga', 'search', 'total_warga'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nik' => 'required|unique:warga,nik|max:16',
            'no_kk' => 'required|exists:kartu_keluarga,no_kk|max:16',
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:laki-laki,perempuan',
            'tempat_lahir' => 'required|string|max:255',
            'tanggal_lahir' => 'required|date',
            'agama' => 'required|string|max:255',
            'pendidikan' => 'required|string|max:255',
            'pekerjaan' => 'required|string|max:255',
            'status_perkawinan' => 'required|string|max:255',
            'status_hubungan_dalam_keluarga' => 'required|in:kepala keluarga,istri,anak',
            'golongan_darah' => 'required|in:A,B,AB,O',
            'kewarganegaraan' => 'required',
            'nama_ayah' => 'required|string|max:255',
            'nama_ibu' => 'required|string|max:255',
            'status_warga' => 'required|in:penduduk,pendatang',
            'no_paspor' => 'nullable|string|unique:warga,no_paspor',
            'tgl_terbit_paspor' => 'nullable|date',
            'tgl_berakhir_paspor' => 'nullable|date',
            'no_kitas' => 'nullable|string|unique:warga,no_kitas',
            'tgl_terbit_kitas' => 'nullable|date',
            'tgl_berakhir_kitas' => 'nullable|date',
            'no_kitap' => 'nullable|string|unique:warga,no_kitap',
            'tgl_terbit_kitap' => 'nullable|date',
            'tgl_berakhir_kitap' => 'nullable|date',
        ], [
            'nik.unique' => 'NIK sudah terdaftar.',
            'no_kk.exists' => 'Nomor KK tidak ditemukan.',
            'no_paspor.unique' => 'Nomor Paspor sudah terdaftar.',
            'no_kitas.unique' => 'Nomor KITAS sudah terdaftar.',
            'no_kitap.unique' => 'Nomor KITAP sudah terdaftar.',
            'tgl_terbit_paspor.date' => 'Tanggal terbit paspor harus berupa tanggal yang valid.',
            'tgl_berakhir_paspor.date' => 'Tanggal berakhir paspor harus berupa tanggal yang valid.',
            'tgl_terbit_kitas.date' => 'Tanggal terbit KITAS harus berupa tanggal yang valid.',
            'tgl_berakhir_kitas.date' => 'Tanggal berakhir KITAS harus berupa tanggal yang valid.',
            'tgl_terbit_kitap.date' => 'Tanggal terbit KITAP harus berupa tanggal yang valid.',
            'tgl_berakhir_kitap.date' => 'Tanggal berakhir KITAP harus berupa tanggal yang valid.',
            'jenis_kelamin.in' => 'Jenis kelamin harus laki-laki atau perempuan.',
            'status_hubungan_dalam_keluarga.in' => 'Status hubungan dalam keluarga harus kepala keluarga, istri, atau anak.',
            'golongan_darah.in' => 'Golongan darah harus A, B, AB, atau O.',
            'kewarganegaraan.required' => 'Kewarganegaraan harus diisi.',
            'status_warga.in' => 'Status warga harus penduduk atau pendatang.',
            'nama_ayah.required' => 'Nama ayah harus diisi.',
            'nama_ibu.required' => 'Nama ibu harus diisi.',
            'nama.required' => 'Nama harus diisi.',
            'tempat_lahir.required' => 'Tempat lahir harus diisi.',
            'tanggal_lahir.required' => 'Tanggal lahir harus diisi.',
            'agama.required' => 'Agama harus diisi.',
            'pendidikan.required' => 'Pendidikan harus diisi.',
            'pekerjaan.required' => 'Pekerjaan harus diisi.',
            'status_perkawinan.required' => 'Status perkawinan harus diisi.',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput()
                ->with('showModal', 'tambah');
        }

        $kk = Kartu_keluarga::where('no_kk', $request->no_kk)->firstOrFail();

        // Cek apakah KK ini sudah memiliki kepala keluarga
        if ($request->status_hubungan_dalam_keluarga === 'kepala keluarga') {
            $existingKepala = Warga::where('no_kk', $request->no_kk)
                ->where('status_hubungan_dalam_keluarga', 'kepala keluarga')
                ->exists();

            if ($existingKepala) {
                return redirect()->back()
                    ->withErrors(['status_hubungan_dalam_keluarga' => 'Nomor KK ini sudah memiliki Kepala Keluarga.'])
                    ->withInput()
                    ->with('showModal', 'tambah');
            }
        }

        // Buat warga baru
        Warga::create([
            'nik' => $request->nik,
            'no_kk' => $request->no_kk,
            'nama' => $request->nama,
            'jenis_kelamin' => $request->jenis_kelamin,
            'tempat_lahir' => $request->tempat_lahir,
            'tanggal_lahir' => $request->tanggal_lahir,
            'agama' => $request->agama,
            'pendidikan' => $request->pendidikan,
            'pekerjaan' => $request->pekerjaan,
            'status_perkawinan' => $request->status_perkawinan,
            'status_hubungan_dalam_keluarga' => $request->status_hubungan_dalam_keluarga,
            'golongan_darah' => $request->golongan_darah,
            'kewarganegaraan' => $request->kewarganegaraan,
            'nama_ayah' => $request->nama_ayah,
            'nama_ibu' => $request->nama_ibu,
            'status_warga' => $request->status_warga,
            'no_paspor' => $request->no_paspor,
            'tgl_terbit_paspor' => $request->tgl_terbit_paspor,
            'tgl_berakhir_paspor' => $request->tgl_berakhir_paspor,
            'no_kitas' => $request->no_kitas,
            'tgl_terbit_kitas' => $request->tgl_terbit_kitas,
            'tgl_berakhir_kitas' => $request->tgl_berakhir_kitas,
            'no_kitap' => $request->no_kitap,
            'tgl_terbit_kitap' => $request->tgl_terbit_kitap,
            'tgl_berakhir_kitap' => $request->tgl_berakhir_kitap,
            'id_rt' => $kk->id_rt,
            'id_rw' => $kk->id_rw,
        ]);

        // Buat user hanya jika status kepala keluarga
        if ($request->status_hubungan_dalam_keluarga === 'kepala keluarga') {
            User::create([
                'nik' => $request->nik,
                'nama' => $request->nama,
                'password' => bcrypt('123456'),
                'id_rt' => $kk->id_rt,
                'id_rw' => $kk->id_rw,
                'role' => 'warga',
            ]);
        }

        return redirect()->to($request->redirect_to)->with('success', 'Data Warga Berhasil Ditambahkan');
    }


    public function edit(string $id)
    {
        $iuran = Iuran::with('iuran_golongan')->findOrFail($id);
        $golongan_list = Kartu_keluarga::select('golongan')->distinct()->pluck('golongan');

        return view('rt.iuran.edit', compact('iuran', 'golongan_list'));
    }

    public function update(Request $request, string $nik)
    {
        // 1. Validasi data
        $validator = Validator::make($request->all(), [
            'nik' => [
                'required',
                'digits:16',
                Rule::unique('warga', 'nik')->ignore($nik, 'nik'), // Abaikan nik yang sedang diedit
            ],
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:laki-laki,perempuan',
            'tempat_lahir' => 'required|string|max:255',
            'tanggal_lahir' => 'required|date',
            'agama' => 'required|string|max:50',
            'pendidikan' => 'required|string|max:100',
            'pekerjaan' => 'required|string|max:100',
            'status_perkawinan' => 'required|string|max:50',
            'status_hubungan_dalam_keluarga' => 'required|in:kepala keluarga,istri,anak',
            'golongan_darah' => 'required|in:A,B,AB,O',
            'kewarganegaraan' => 'required',
            'nama_ayah' => 'required|string|max:255',
            'nama_ibu' => 'required|string|max:255',
            'jenis' => 'required|in:penduduk,pendatang',
            'id_rt' => 'required|exists:rt,id',


        ], [
            'nik.required' => 'NIK harus diisi.',
            'nik.digits' => 'NIK harus terdiri dari 16 digit.',
            'nik.unique' => 'NIK sudah digunakan.',
            'nama.required' => 'Nama tidak boleh kosong.',
            'jenis_kelamin.required' => 'Jenis kelamin harus dipilih.',
            'tempat_lahir.required' => 'Tempat lahir harus diisi.',
            'tanggal_lahir.required' => 'Tanggal lahir harus diisi.',
            'agama.required' => 'Agama tidak boleh kosong.',
            'pendidikan.required' => 'Pendidikan terakhir harus diisi.',
            'pekerjaan.required' => 'Pekerjaan harus diisi.',
            'status_perkawinan.required' => 'Status perkawinan harus diisi.',
            'status_hubungan_dalam_keluarga.required' => 'Hubungan dengan KK harus dipilih.',
            'status_hubungan_dalam_keluarga.in' => 'Pilih hubungan yang sesuai.',
            'golongan_darah.required' => 'Golongan darah harus dipilih.',
            'golongan_darah.in' => 'Golongan darah harus A, B, AB, atau O.',
            'kewarganegaraan.required' => 'Kewarganegaraan harus dipilih.',
            'nama_ayah.required' => 'Nama ayah harus diisi.',
            'nama_ibu.required' => 'Nama ibu harus diisi.',
            'jenis.required' => 'Jenis harus dipilih.',
            'jenis.in' => 'Jenis harus penduduk atau pendatang.',
            'id_rt.required' => 'RT harus dipilih.',
            'id_rt.exists' => 'RT tidak valid.',
        ]);

        // 3. Cari dan update data
        $warga = Warga::findOrFail($nik);

        $warga->update([
            'nik' => $request->nik,
            'nama' => $request->nama,
            'jenis_kelamin' => $request->jenis_kelamin,
            'tempat_lahir' => $request->tempat_lahir,
            'tanggal_lahir' => $request->tanggal_lahir,
            'agama' => $request->agama,
            'pendidikan' => $request->pendidikan,
            'pekerjaan' => $request->pekerjaan,
            'status_perkawinan' => $request->status_perkawinan,
            'status_hubungan_dalam_keluarga' => $request->status_hubungan_dalam_keluarga,
            'golongan_darah' => $request->golongan_darah,
            'kewarganegaraan' => $request->kewarganegaraan,
            'nama_ayah' => $request->nama_ayah,
            'nama_ibu' => $request->nama_ibu,
            'jenis' => $request->jenis,
            'id_rt' => $request->id_rt,
        ]);

        User::where('nik', $nik)->update([
            'nik' => $request->nik,
            'nama' => $request->nama,
            'id_rt' => $request->id_rt
        ]);



        // 4. Redirect dengan pesan sukses
        return redirect()->to($request->redirect_to)->with('success', 'Data warga berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        $iuran = Iuran::findOrFail($id);
        IuranGolongan::where('id_iuran', $iuran->id)->delete();
        $iuran->delete();

        return redirect()->route('rt.iuran.index')->with('success', 'Iuran berhasil dihapus.');
    }

    public function generateMonthlyTagihan()
    {
        $today = now()->startOfDay();

        $iurans = Iuran::where('jenis', 'otomatis')
            ->whereDay('tgl_tagih', $today->day)
            ->get();

        foreach ($iurans as $iuran) {
            $iuranNominals = IuranGolongan::where('id_iuran', $iuran->id)
                ->pluck('nominal', 'golongan');

            $kkList = Kartu_keluarga::all();

            foreach ($kkList as $kk) {
                $nominalTagihan = $iuranNominals[$kk->golongan] ?? 0;

                $exists = Tagihan::where('id_iuran', $iuran->id)
                    ->where('no_kk', $kk->no_kk)
                    ->whereMonth('tgl_tagih', $today->month)
                    ->whereYear('tgl_tagih', $today->year)
                    ->exists();

                if (!$exists) {
                    Tagihan::create([
                        'nama' => $iuran->nama,
                        'tgl_tagih' => $today,
                        'tgl_tempo' => $iuran->tgl_tempo ?? $today->copy()->addDays(10),
                        'jenis' => 'otomatis',
                        'nominal' => $nominalTagihan,
                        'no_kk' => $kk->no_kk,
                        'status_bayar' => 'belum_bayar',
                        'tgl_bayar' => null,
                        'id_iuran' => $iuran->id,
                        'kategori_pembayaran' => null,
                        'bukti_transfer' => null,
                    ]);
                }
            }
        }

        return redirect()->route('rt.iuran.index')->with('success', 'Tagihan bulanan berhasil dibuat.');
    }
}
