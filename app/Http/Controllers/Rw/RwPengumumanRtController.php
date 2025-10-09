<?php

namespace App\Http\Controllers\Rw;

use App\Http\Controllers\Controller;
use App\Models\Pengumuman;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class RwPengumumanRtController extends Controller
{
    /**
     * Display a listing of the resource.
     */
      private function indoToEnglishDay(string $day): string
    {
        $map = [
            'senin' => 'Monday', 'selasa' => 'Tuesday', 'rabu' => 'Wednesday',
            'kamis' => 'Thursday', 'jumat' => 'Friday', 'sabtu' => 'Saturday', 'minggu' => 'Sunday',
        ];
        return $map[strtolower($day)] ?? '';
    }

    public function index(Request $request)
    {
        $search = $request->input('search');
        $tahun = $request->input('tahun');
        $bulan = $request->input('bulan');
        $kategori = $request->input('kategori');

        $userRwId = Auth::check() ? Auth::user()->id_rw : null;

        if (!$userRwId) {
            // Jika user tidak login atau tidak punya id_rw, tidak ada pengumuman RT untuk RW ini yang bisa ditampilkan
            $pengumuman = collect();
            $total_pengumuman = 0;
            // Opsi: redirect atau berikan pesan error
        } else {
            // Filter utama: Pengumuman yang memiliki id_rw user yang login DAN id_rt-nya TIDAK NULL
            $query = Pengumuman::where('id_rw', $userRwId)->whereNotNull('id_rt');

            // Apply search filters
            $query->when($search, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('judul', 'like', '%' . $search . '%')
                      ->orWhere('isi', 'like', '%' . $search . '%');
                });
                $searchLower = strtolower($search);
                $hariList = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
                if (in_array($searchLower, $hariList)) {
                    $query->orWhereRaw("DAYNAME(tanggal) = ?", [$this->indoToEnglishDay($searchLower)]);
                }
                $bulanList = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];
                if (in_array($searchLower, $bulanList)) {
                    $bulanAngka = array_search($searchLower, $bulanList) + 1;
                    $query->orWhereMonth('tanggal', $bulanAngka);
                }
            });

            $pengumuman = $query->when($tahun, fn($q) => $q->whereYear('tanggal', $tahun))
                                ->when($bulan, fn($q) => $q->whereMonth('tanggal', $bulan))
                                ->when($kategori, fn($q) => $q->where('kategori', $kategori))
                                ->orderBy('created_at', 'desc')
                                ->paginate(5)
                                ->withQueryString();

            // Hitung total pengumuman RT berdasarkan filter yang sama
            $total_pengumuman = Pengumuman::where('id_rw', $userRwId)->whereNotNull('id_rt')->count();
        }

        $title = 'Pengumuman dari RT'; // Judul yang jelas untuk halaman pengumuman RT

        // Filter dropdown options (tahun, kategori) untuk hanya pengumuman RT dari RW ini
        $daftar_tahun_query = Pengumuman::query();
        $daftar_kategori_query = Pengumuman::query();
        if ($userRwId) {
            $daftar_tahun_query->where('id_rw', $userRwId)->whereNotNull('id_rt');
            $daftar_kategori_query->where('id_rw', $userRwId)->whereNotNull('id_rt');
        } else {
            $daftar_tahun_query->whereRaw('0 = 1'); // Return empty results
            $daftar_kategori_query->whereRaw('0 = 1'); // Return empty results
        }
        $daftar_tahun = $daftar_tahun_query->selectRaw('YEAR(tanggal) as tahun')->distinct()->orderByDesc('tahun')->pluck('tahun');
        $daftar_bulan = range(1, 12);
        $daftar_kategori = $daftar_kategori_query->select('kategori')->distinct()->pluck('kategori');

        return view('rw.pengumuman-rt.pengumuman-rt', compact(
            'pengumuman',
            'title',
            'daftar_tahun',
            'daftar_bulan',
            'daftar_kategori',
            'total_pengumuman'
        ));
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function export($id)
    {
        $pengumuman = Pengumuman::findOrFail($id);

        $pdf = Pdf::loadView('export.pengumuman', [
            'pengumuman' => $pengumuman,
            'jenis' => 'RT'
        ])->setPaper('A4', 'portrait');

        return $pdf->download("Pengumuman-RT-{$pengumuman->id}.pdf");
    }
}
