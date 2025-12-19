<?php

namespace App\Http\Controllers;

use App\Models\Iuran;
use App\Models\Kartu_keluarga;
use App\Models\Kategori_golongan;
use App\Models\Pengaduan;
use App\Models\Tagihan;
use App\Models\Transaksi;
use App\Models\Warga;
use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class ExportController extends Controller
{
    public function exportIuran()
    {
        $id_rt = Auth::user()->id_rt;

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Iuran');
        $sheet->getStyle("A1:Z2")->getFont()->setBold(true);
        foreach (range('A', 'Z') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $row = 3;
        $iurans = Iuran::where('id_rt', $id_rt)->where('jenis', 'manual')
            ->orderBy('tgl_tagih', 'desc')
            ->get();
        $no_urut = 1;

        if ($iurans->isNotEmpty()) {
            $sheet->setCellValue('B1', 'Iuran Manual');
            $sheet->mergeCells('B1:F1');
            $sheet->setCellValue('B2', 'No.');
            $sheet->setCellValue('C2', 'Nama');
            $sheet->setCellValue('D2', 'Nominal');
            $sheet->setCellValue('E2', 'Tanggal Tagih');
            $sheet->setCellValue('F2', 'Tanggal Tempo');

            foreach ($iurans as $iuran) {
                $sheet->setCellValue("B{$row}", $no_urut);
                $sheet->setCellValue("C{$row}", $iuran->nama);
                $sheet->setCellValue("D{$row}", $iuran->nominal);
                $sheet->setCellValue("E{$row}", $iuran->tgl_tagih);
                $sheet->setCellValue("F{$row}", $iuran->tgl_tempo);
                $row++;
                $no_urut++;
            }

            $rowEnd = $row - 1;

            $sheet->getStyle("B2:F{$rowEnd}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => 'FF000000'],
                    ],
                ],
            ]);
        }

        $row_otomatis = 3;
        $iuran_otomatis = Iuran::where('id_rt', $id_rt)->where('jenis', 'otomatis')
            ->orderBy('tgl_tagih', 'desc')
            ->get();
        $starCol = Kategori_golongan::all();
        $no = 1;

        if ($iuran_otomatis->isNotEmpty()) {
            $sheet->setCellValue('I1', 'Iuran Otomatis');
            $sheet->mergeCells('I1:R1');
            $sheet->setCellValue('I2', 'No.');
            $sheet->setCellValue('J2', 'Nama');
            $sheet->setCellValue('K2', 'Kampung');
            $sheet->setCellValue('L2', 'Kavling');
            $sheet->setCellValue('M2', 'Kost');
            $sheet->setCellValue('N2', 'Kantor');
            $sheet->setCellValue('O2', 'Kontrakan');
            $sheet->setCellValue('P2', 'UMKM');
            $sheet->setCellValue('Q2', 'Tanggal Tagih');
            $sheet->setCellValue('R2', 'Tanggal Tempo');

            foreach ($iuran_otomatis as $iuran) {
                $sheet->setCellValue("I{$row_otomatis}", $no);
                $sheet->setCellValue("J{$row_otomatis}", $iuran->nama);

                $colIndex = 11; 
                foreach ($starCol as $golongan) {
                    $col = Coordinate::stringFromColumnIndex($colIndex);
                    $nominal = $iuran->iuran_golongan->firstWhere('id_golongan', $golongan->id)->nominal ?? 0;
                    $sheet->setCellValue("{$col}{$row_otomatis}", $nominal);
                    $colIndex++;
                }

                $sheet->setCellValue("Q{$row_otomatis}", $iuran->tgl_tagih);
                $sheet->setCellValue("R{$row_otomatis}", $iuran->tgl_tempo);

                $row_otomatis++;
                $no++;
            }

            $rowEnds = $row_otomatis - 1;

            $sheet->getStyle("I2:R{$rowEnds}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => 'FF000000'],
                    ],
                ],
            ]);
        }

        $writer = new Xlsx($spreadsheet);
        $filename = "iuran_rt_{$id_rt}.xlsx";

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment; filename=\"$filename\"");
        $writer->save("php://output");
        exit;
    }

    public function exportTagihan()
    {
        $id_rt = Auth::user()->id_rt;

        $rowStart = 3;
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Tagihan');
        $sheet->getStyle("A1:T2")->getFont()->setBold(true);
        foreach (range('A', 'Z') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $belum = Tagihan::where('status_bayar', 'belum_bayar')
            ->orderBy('tgl_tagih', 'desc')
            ->get();
        $row = 3;
        $no = 1;

        if ($belum->isNotEmpty()) {
            $sheet->setCellValue('B1', 'Belum Bayar');
            $sheet->mergeCells('B1:H1');
            $sheet->setCellValue('B2', 'No.');
            $sheet->setCellValue('C2', 'Tagihan');
            $sheet->setCellValue('D2', 'No KK');
            $sheet->setCellValue('E2', 'Nominal');
            $sheet->setCellValue('F2', 'Jenis');
            $sheet->setCellValue('G2', 'Tanggal Tagih');
            $sheet->setCellValue('H2', 'Tanggal Tempo');

            foreach ($belum as $tagihan) {
                $sheet->setCellValue("B{$row}", $no);
                $sheet->setCellValue("C{$row}", $tagihan->nama);
                $sheet->setCellValueExplicit("D{$row}", $tagihan->no_kk, DataType::TYPE_STRING);
                $sheet->setCellValue("E{$row}", 'Rp ' . number_format($tagihan->nominal, 2, ',', '.'));
                $sheet->setCellValue("F{$row}", $tagihan->jenis);
                $sheet->setCellValue("G{$row}", $tagihan->tgl_tagih);
                $sheet->setCellValue("H{$row}", $tagihan->tgl_tempo);
                $row++;
                $no++;
            }

            $rowEnd = $row - 1;

            $sheet->getStyle("B2:H{$rowEnd}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => 'FF000000'],
                    ],
                ],
            ]);
        }

        $sudah = Tagihan::where('status_bayar', 'sudah_bayar')
            ->orderBy('tgl_tagih', 'desc')
            ->get();
        $row2 = 3;
        $no2 = 1;

        if ($sudah->isNotEmpty()) {
            $sheet->setCellValue('K1', 'Sudah Bayar');
            $sheet->mergeCells('K1:R1');
            $sheet->setCellValue('K2', 'No.');
            $sheet->setCellValue('L2', 'Tagihan');
            $sheet->setCellValue('M2', 'No KK');
            $sheet->setCellValue('N2', 'Nominal');
            $sheet->setCellValue('O2', 'Jenis');
            $sheet->setCellValue('P2', 'Tanggal Tagih');
            $sheet->setCellValue('Q2', 'Tanggal Tempo');
            $sheet->setCellValue('R2', 'Tanggal Bayar');

            foreach ($sudah as $tagihan) {
                $sheet->setCellValue("K{$row2}", $no2);
                $sheet->setCellValue("L{$row2}", $tagihan->nama);
                $sheet->setCellValueExplicit("M{$row2}", $tagihan->no_kk, DataType::TYPE_STRING);
                $sheet->setCellValue("N{$row2}", 'Rp ' . number_format($tagihan->nominal, 2, ',', '.'));
                $sheet->setCellValue("O{$row2}", $tagihan->jenis);
                $sheet->setCellValue("P{$row2}", $tagihan->tgl_tagih);
                $sheet->setCellValue("Q{$row2}", $tagihan->tgl_tempo);
                $sheet->setCellValue("R{$row2}", $tagihan->tgl_bayar);
                $row2++;
                $no2++;
            }

            $rowEnd2 = $row2 - 1;

            $sheet->getStyle("K2:R{$rowEnd2}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => 'FF000000'],
                    ],
                ],
            ]);
        }


        $writer = new Xlsx($spreadsheet);
        $filename = "tagihan_rt_{$id_rt}.xlsx";

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment; filename=\"$filename\"");
        $writer->save("php://output");
        exit;
    }

    public function exportTransaksi()
    {
        $id_rt = Auth::user()->id_rt;

        $rowStart = 3;
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Transaksi');
        $sheet->getStyle("A1:Z2")->getFont()->setBold(true);
        foreach (range('A', 'Z') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $no = 1;
        $row = 3;
        $pemasukan = Transaksi::where('jenis', 'pemasukan')
            ->orderBy('tanggal', 'desc')
            ->get();

        if ($pemasukan->isNotEmpty()) {
            $sheet->setCellValue('B1', 'Pemasukkan');
            $sheet->mergeCells('B1:G1');
            $sheet->setCellValue('B2', 'No.');
            $sheet->setCellValue('C2', 'No. RT');
            $sheet->setCellValue('D2', 'Tanggal');
            $sheet->setCellValue('E2', 'Nominal');
            $sheet->setCellValue('F2', 'Transaksi');
            $sheet->setCellValue('G2', 'Keterangan');

            foreach ($pemasukan as $trx) {
                $sheet->setCellValue("B{$row}", $no);
                $sheet->setCellValue("C{$row}", $trx->rt);
                $sheet->setCellValue("D{$row}", date('d/m/Y', strtotime($trx->tanggal)));
                $sheet->setCellValue("E{$row}", 'Rp ' . number_format($trx->nominal, 2, ',', '.'));
                $sheet->setCellValue("F{$row}", $trx->nama_transaksi);
                $sheet->setCellValue("G{$row}", $trx->keterangan);
                $row++;
                $no++;
            }

            $rowEnd = $row - 1;

            $sheet->getStyle("B2:G{$rowEnd}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => 'FF000000'],
                    ],
                ],
            ]);
        }

        $no2 = 1;
        $row2 = 3;
        $pengeluaran = Transaksi::where('jenis', 'pengeluaran')
            ->orderBy('tanggal', 'desc')
            ->get();

        if ($pengeluaran->isNotEmpty()) {
            $sheet->setCellValue('J1', 'Pengeluaran');
            $sheet->mergeCells('J1:O1');
            $sheet->setCellValue('J2', 'No.');
            $sheet->setCellValue('K2', 'No. RT');
            $sheet->setCellValue('L2', 'Tanggal');
            $sheet->setCellValue('M2', 'Nominal');
            $sheet->setCellValue('N2', 'Transaksi');
            $sheet->setCellValue('O2', 'Keterangan');

            foreach ($pengeluaran as $trx) {
                $sheet->setCellValue("J{$row2}", $no2);
                $sheet->setCellValue("K{$row2}", $trx->rt);
                $sheet->setCellValue("L{$row2}", date('d/m/Y', strtotime($trx->tanggal)));
                $sheet->setCellValue("M{$row2}", 'Rp ' . number_format($trx->nominal, 2, ',', '.'));
                $sheet->setCellValue("N{$row2}", $trx->nama_transaksi);
                $sheet->setCellValue("O{$row2}", $trx->keterangan);
                $row2++;
                $no2++;
            }

            $rowEnd = $row2 - 1;

            $sheet->getStyle("J2:O{$rowEnd}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => 'FF000000'],
                    ],
                ],
            ]);
        }

        $writer = new Xlsx($spreadsheet);
        $filename = "transaksi_rt_{$id_rt}.xlsx";

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment; filename=\"$filename\"");
        $writer->save("php://output");
        exit;
    }

    public function exportDataWarga()
    {
        $id_rt = Auth::user()->id_rt;

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Warga');

        $sheet->getStyle("A2:AZ3")->getFont()->setBold(true);

        $sheet->getStyle('A2:AZ3')->getAlignment()->applyFromArray([
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical'   => Alignment::VERTICAL_CENTER,
            'wrapText'   => true,
        ]);

        $maxCol = Coordinate::columnIndexFromString('AZ');
        for ($i = 1; $i <= $maxCol; $i++) {
            $colLetter = Coordinate::stringFromColumnIndex($i);
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }

        $row = 4;
        $dataWarga = Warga::whereHas('kartuKeluarga', function ($warga) use ($id_rt) {
            $warga->where('id_rt', $id_rt);
        })->get();
        $no_urut = 1;

        if ($dataWarga->isNotEmpty()) {
            $merges = [
                'B1:R1',
                'I2:J2',
                'B2:B3',
                'C2:C3',
                'D2:D3',
                'E2:E3',
                'F2:F3',
                'G2:G3',
                'H2:H3',
                'K2:K3',
                'L2:L3',
                'M2:M3',
                'N2:N3',
                'O2:O3',
                'P2:P3',
                'Q2:Q3',
                'R2:R3',
            ];

            foreach ($merges as $range) {
                $sheet->mergeCells($range);
            }

            $sheet->setCellValue('B1', 'Data Warga');

            $sheet->setCellValue('B2', 'No.');
            $sheet->setCellValue('C2', 'No. KK');
            $sheet->setCellValue('D2', 'NIK');
            $sheet->setCellValue('E2', 'Nama Lengkap');
            $sheet->setCellValue('F2', 'Jenis Kelamin');
            $sheet->setCellValue('G2', 'Tempat Lahir');
            $sheet->setCellValue('H2', 'Tanggal Lahir');
            $sheet->setCellValue('I2', 'Alamat');
            $sheet->setCellValue('K2', 'Agama');
            $sheet->setCellValue('L2', 'Pendidikan');
            $sheet->setCellValue('M2', 'Pekerjaan');
            $sheet->setCellValue('N2', 'Status Perkawinan');
            $sheet->setCellValue('O2', 'Status Hubungan Dalam Keluarga');
            $sheet->setCellValue('P2', 'Kewarganegaraan');
            $sheet->setCellValue('Q2', 'Golongan Darah');
            $sheet->setCellValue('R2', 'Status Warga');

            $sheet->setCellValue('I3', 'Domisili');
            $sheet->setCellValue('J3', 'Asal');

            foreach ($dataWarga as $warga) {
                $sheet->setCellValue("B{$row}", $no_urut . '.');
                $sheet->setCellValueExplicit("C{$row}", $warga->no_kk, DataType::TYPE_STRING);
                $sheet->setCellValueExplicit("D{$row}", $warga->nik, DataType::TYPE_STRING);
                $sheet->setCellValue("E{$row}", $warga->nama);
                $sheet->setCellValue("F{$row}", $warga->jenis_kelamin);
                $sheet->setCellValue("G{$row}", $warga->tempat_lahir);
                $sheet->setCellValue("H{$row}", $warga->tanggal_lahir);
                $sheet->setCellValue("I{$row}", $warga->alamat_domisili ?? $warga->kartuKeluarga->alamat);
                $sheet->setCellValue("J{$row}", $warga->alamat_asal ?? '-');
                $sheet->setCellValue("K{$row}", $warga->agama);
                $sheet->setCellValue("L{$row}", $warga->pendidikan);
                $sheet->setCellValue("M{$row}", $warga->pekerjaan);
                $sheet->setCellValue("N{$row}", $warga->status_perkawinan);
                $sheet->setCellValue("O{$row}", $warga->status_hubungan_dalam_keluarga);
                $sheet->setCellValue("P{$row}", $warga->kewarganegaraan);
                $sheet->setCellValue("Q{$row}", $warga->golongan_darah);
                $sheet->setCellValue("R{$row}", $warga->status_warga);
                $row++;
                $no_urut++;
            }

            $sheet->mergeCells("B{$row}:R{$row}");
            $sheet->setCellValue("B{$row}", 'Total Warga: ' . ($no_urut - 1));

            $rowEnd = $row;

            $sheet->getStyle("B2:R{$rowEnd}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => 'FF000000'],
                    ],
                ],
            ]);
        }

        $writer = new Xlsx($spreadsheet);
        $filename = "warga_rt_{$id_rt}.xlsx";

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment; filename=\"$filename\"");
        $writer->save("php://output");
        exit;
    }

    public function exportDataKK()
    {
        $id_rt = Auth::user()->id_rt;

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Kartu Keluarga');

        $sheet->getStyle("A2:AZ2")->getFont()->setBold(true);

        $sheet->getStyle('A2:AZ2')->getAlignment()->applyFromArray([
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical'   => Alignment::VERTICAL_CENTER,
            'wrapText'   => true,
        ]);

        $maxCol = Coordinate::columnIndexFromString('AZ');
        for ($i = 1; $i <= $maxCol; $i++) {
            $colLetter = Coordinate::stringFromColumnIndex($i);
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }

        $row = 3;
        $dataKK = Kartu_keluarga::where('id_rt', $id_rt)->get();
        $no_urut = 1;

        if ($dataKK->isNotEmpty()) {
            $sheet->mergeCells('B1:P1');

            $sheet->setCellValue('B1', 'Data Kartu Keluarga');

            $sheet->setCellValue('B2', 'No.');
            $sheet->setCellValue('C2', 'No. KK');
            $sheet->setCellValue('D2', 'No. Registrasi');
            $sheet->setCellValue('E2', 'Alamat');
            $sheet->setCellValue('F2', 'No. RT');
            $sheet->setCellValue('G2', 'No. RW');
            $sheet->setCellValue('H2', 'Kelurahan');
            $sheet->setCellValue('I2', 'Kecamatan');
            $sheet->setCellValue('J2', 'Kabupaten');
            $sheet->setCellValue('K2', 'Provinsi');
            $sheet->setCellValue('L2', 'Kode Pos');
            $sheet->setCellValue('M2', 'Tanggal Terbit');
            $sheet->setCellValue('N2', 'Golongan');
            $sheet->setCellValue('O2', 'Instansi Penerbit');
            $sheet->setCellValue('P2', 'Kabupaten/Kota Penerbit');

            foreach ($dataKK as $kk) {
                $sheet->setCellValue("B{$row}", $no_urut . '.');
                $sheet->setCellValueExplicit("C{$row}", $kk->no_kk, DataType::TYPE_STRING);
                $sheet->setCellValueExplicit("D{$row}", $kk->no_registrasi, DataType::TYPE_STRING);
                $sheet->setCellValue("E{$row}", $kk->alamat ?? '-');
                $sheet->setCellValue("F{$row}", $kk->rukunTetangga->nomor_rt ?? '-');
                $sheet->setCellValue("G{$row}", $kk->rw->nomor_rw ?? '-');
                $sheet->setCellValue("H{$row}", $kk->kelurahan ?? '-');
                $sheet->setCellValue("I{$row}", $kk->kecamatan ?? '-');
                $sheet->setCellValue("J{$row}", $kk->kabupaten ?? '-');
                $sheet->setCellValue("K{$row}", $kk->provinsi ?? '-');
                $sheet->setCellValue("L{$row}", $kk->kode_pos ?? '-');
                $sheet->setCellValue("M{$row}", $kk->tgl_terbit ?? '-');
                $sheet->setCellValue("N{$row}", $kk->kategori_iuran ?? '-');
                $sheet->setCellValue("O{$row}", $kk->instansi_penerbit ?? '-');
                $sheet->setCellValue("P{$row}", $kk->kabupaten_kota_penerbit ?? '-');
                $row++;
                $no_urut++;
            }

            $sheet->mergeCells("B{$row}:P{$row}");
            $sheet->setCellValue("B{$row}", 'Total Kartu Keluarga: ' . ($no_urut - 1));

            $rowEnd = $row;

            $sheet->getStyle("B2:P{$rowEnd}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => 'FF000000'],
                    ],
                ],
            ]);
        }

        $writer = new Xlsx($spreadsheet);
        $filename = "kartu_keluarga_rt_{$id_rt}.xlsx";

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment; filename=\"$filename\"");
        $writer->save("php://output");
        exit;
    }

    public function exportLaporanKeuangan($bulan, $tahun)
    {
        $currentRole = session('active_role');
        $idRw = Auth::user()->rw->id ?? null;
        $idRt = Auth::user()->rukunTetangga->id ?? null;
        Log::info('bulan sama tahun yg masuk', [$bulan, $tahun]);

        $daftar_bulan = [
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

        $namaBulan = ucfirst($daftar_bulan[$bulan - 1]);

        Log::info('nama bulan yg didapet', [$namaBulan]);

        $nomor_rt = Auth::user()->rukunTetangga->nomor_rt ?? null;
        $nomor_rw = Auth::user()->rw->nomor_rw ?? null;

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Transaksi');
        $sheet->getStyle("A1:Z3")->getFont()->setBold(true);
        $sheet->getStyle('A1:AZ3')->getAlignment()->applyFromArray([
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical'   => Alignment::VERTICAL_CENTER,
            'wrapText'   => true,
        ]);

        $maxCol = Coordinate::columnIndexFromString('AZ');
        for ($i = 1; $i <= $maxCol; $i++) {
            $colLetter = Coordinate::stringFromColumnIndex($i);
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }

        $no = 1;
        $row = 4;

        if ($currentRole === 'admin') {
            $transaksi = Transaksi::query()
                ->when($tahun, fn($q) => $q->whereYear('tanggal', $tahun))
                ->when($bulan, fn($q) => $q->whereMonth('tanggal', $bulan))
                ->orderBy('tanggal', 'desc');
        }

        if ($currentRole === 'rw') {
            $transaksi = Transaksi::where(function ($query) use ($idRw) {
                $query->where(function ($q) use ($idRw) {
                    $q->whereNotNull('tagihan_id')
                        ->whereHas('tagihan.iuran', function ($subQuery) use ($idRw) {
                            $subQuery->where('id_rw', $idRw);
                        });
                })
                    ->orWhere(function ($q) use ($idRw) {
                        $q->whereNull('tagihan_id')
                            ->whereHas('rukunTetangga', function ($subQuery) use ($idRw) {
                                $subQuery->where('id_rw', $idRw);
                            });
                    });
            })
                ->when($tahun, fn($q) => $q->whereYear('tanggal', $tahun))
                ->when($bulan, fn($q) => $q->whereMonth('tanggal', $bulan))
                ->orderBy('tanggal', 'desc');
        }

        if ($currentRole === 'rt') {
            $transaksi = Transaksi::where(function ($query) use ($idRt) {
                $query->where(function ($q) use ($idRt) {
                    $q->whereNotNull('tagihan_id')
                        ->whereHas('tagihan.iuran', function ($subQuery) use ($idRt) {
                            $subQuery->where('id_rt', $idRt);
                        });
                })
                    ->orWhere(function ($q) use ($idRt) {
                        $q->whereNull('tagihan_id')
                            ->whereHas('rukunTetangga', function ($subQuery) use ($idRt) {
                                $subQuery->where('id', $idRt);
                            });
                    });
            })
                ->when($tahun, fn($q) => $q->whereYear('tanggal', $tahun))
                ->when($bulan, fn($q) => $q->whereMonth('tanggal', $bulan))
                ->orderBy('tanggal', 'desc');
        }

        if (!$bulan) {
            $transaksi->whereMonth('tanggal', now()->month);
        }

        if (!$tahun) {
            $transaksi->whereYear('tanggal', now()->year);
        }

        $totalPemasukan = (clone $transaksi)->where('jenis', 'pemasukan')->sum('nominal');
        $totalPengeluaran = (clone $transaksi)->where('jenis', 'pengeluaran')->sum('nominal');
        $totalKeuangan = $totalPemasukan - $totalPengeluaran;

        $allTransaksi = (clone $transaksi)->get();

        $judul = match ($currentRole) {
            'admin' => 'Laporan Pemasukan dan Pengeluaran (Semua RW)',
            'rt'    => "Laporan Pemasukan dan Pengeluaran RT {$nomor_rt}/RW {$nomor_rw}",
            'rw'    => "Laporan Pemasukan dan Pengeluaran RW {$nomor_rw}",
        };

        $sheet->setCellValue('B1', $judul);
        $sheet->mergeCells('B1:F1');
        $sheet->setCellValue('B2', "Periode {$namaBulan} {$tahun}");
        $sheet->mergeCells('B2:F2');

        $sheet->setCellValue('B3', 'No.');
        $sheet->setCellValue('C3', 'Tanggal');
        $sheet->setCellValue('D3', 'Keterangan');
        $sheet->setCellValue('E3', 'Pemasukan');
        $sheet->setCellValue('F3', 'Pengeluaran');
        $sheet->getStyle('B3:F3')->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getStyle('B3:F3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        foreach ($allTransaksi as $trx) {
            $pemasukan = $trx->jenis === 'pemasukan';
            $pengeluaran = $trx->jenis === 'pengeluaran';

            $sheet->setCellValue("B{$row}", $no);
            $sheet->setCellValue("C{$row}", date('d/m/Y', strtotime($trx->tanggal)) ?? '-');
            $sheet->setCellValue("D{$row}", $trx->nama_transaksi ?? '-');
            $sheet->setCellValue("E{$row}", $pemasukan ? $trx->nominal : null);
            $sheet->setCellValue("F{$row}", $pengeluaran ? $trx->nominal : null);
            $row++;
            $no++;
        }

        $rowEnd = $row + 1;
        $rowDataEnd = $row - 1;

        $sheet->setCellValue("B{$row}", 'Total');
        $sheet->mergeCells("B{$row}:D{$row}");
        $sheet->setCellValue("E{$row}", $totalPemasukan ? $totalPemasukan : null);
        $sheet->setCellValue("F{$row}", $totalPengeluaran ? $totalPengeluaran : null);
        $sheet->setCellValue("B{$rowEnd}", 'Saldo Akhir');
        $sheet->mergeCells("B{$rowEnd}:E{$rowEnd}");
        $sheet->setCellValue("F{$rowEnd}", $totalKeuangan ? $totalKeuangan : null);

        $sheet->getStyle("B{$row}:F{$rowEnd}")->getFont()->setBold(true);
        $sheet->getStyle("B4:C{$rowDataEnd}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("D4:D{$rowDataEnd}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        $sheet->getStyle("E4:F{$rowEnd}")->getNumberFormat()->setFormatCode('"Rp"#,##0.00_-');
        $sheet->getStyle("E4:F{$rowEnd}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);


        $sheet->getStyle("B1:F{$rowEnd}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => 'FF000000'],
                ],
            ],
        ]);

        $formatBulan = strtolower($namaBulan);

        $writer = new Xlsx($spreadsheet);
        $filename = match ($currentRole) {
            'admin' => "laporan-keuangan-semua-rw-{$formatBulan}-{$tahun}.xlsx",
            'rt'    => "laporan-keuangan-rt{$nomor_rt}-rw{$nomor_rw}-{$formatBulan}-{$tahun}.xlsx",
            'rw'    => "laporan-keuangan-rw{$nomor_rw}-{$formatBulan}-{$tahun}.xlsx",
        };

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment; filename=\"$filename\"");
        $writer->save("php://output");
        exit;
    }

    public function exportLaporanKeuanganPdf($bulan, $tahun)
    {
        $currentRole = session('active_role');
        $idRw = Auth::user()->rw->id ?? null;
        $idRt = Auth::user()->rukunTetangga->id ?? null;
        Log::info('bulan sama tahun yg masuk', [$bulan, $tahun]);

        $daftar_bulan = [
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

        $namaBulan = ucfirst($daftar_bulan[$bulan - 1]);

        Log::info('nama bulan yg didapet', [$namaBulan]);

        $nomor_rt = Auth::user()->rukunTetangga->nomor_rt ?? null;
        $nomor_rw = Auth::user()->rw->nomor_rw ?? null;

        if ($currentRole === 'admin') {
            $transaksi = Transaksi::query()
                ->when($tahun, fn($q) => $q->whereYear('tanggal', $tahun))
                ->when($bulan, fn($q) => $q->whereMonth('tanggal', $bulan))
                ->orderBy('tanggal', 'desc');
        }

        if ($currentRole === 'rw') {
            $transaksi = Transaksi::where(function ($query) use ($idRw) {
                $query->where(function ($q) use ($idRw) {
                    $q->whereNotNull('tagihan_id')
                        ->whereHas('tagihan.iuran', function ($subQuery) use ($idRw) {
                            $subQuery->where('id_rw', $idRw);
                        });
                })
                    ->orWhere(function ($q) use ($idRw) {
                        $q->whereNull('tagihan_id')
                            ->whereHas('rukunTetangga', function ($subQuery) use ($idRw) {
                                $subQuery->where('id_rw', $idRw);
                            });
                    });
            })
                ->when($tahun, fn($q) => $q->whereYear('tanggal', $tahun))
                ->when($bulan, fn($q) => $q->whereMonth('tanggal', $bulan))
                ->orderBy('tanggal', 'desc');
        }

        if ($currentRole === 'rt') {
            $transaksi = Transaksi::where(function ($query) use ($idRt) {
                $query->where(function ($q) use ($idRt) {
                    $q->whereNotNull('tagihan_id')
                        ->whereHas('tagihan.iuran', function ($subQuery) use ($idRt) {
                            $subQuery->where('id_rt', $idRt);
                        });
                })
                    ->orWhere(function ($q) use ($idRt) {
                        $q->whereNull('tagihan_id')
                            ->whereHas('rukunTetangga', function ($subQuery) use ($idRt) {
                                $subQuery->where('id', $idRt);
                            });
                    });
            })
                ->when($tahun, fn($q) => $q->whereYear('tanggal', $tahun))
                ->when($bulan, fn($q) => $q->whereMonth('tanggal', $bulan))
                ->orderBy('tanggal', 'desc');
        }

        if (!$bulan) {
            $transaksi->whereMonth('tanggal', now()->month);
        }

        if (!$tahun) {
            $transaksi->whereYear('tanggal', now()->year);
        }

        $totalPemasukan = (clone $transaksi)->where('jenis', 'pemasukan')->sum('nominal');
        $totalPengeluaran = (clone $transaksi)->where('jenis', 'pengeluaran')->sum('nominal');
        $totalKeuangan = $totalPemasukan - $totalPengeluaran;

        $allTransaksi = (clone $transaksi)->get();

        $formatBulan = strtolower($namaBulan);

        $pdf = Pdf::loadView('laporan-keuangan-pdf', [
            'transaksi' => $allTransaksi,
            'bulan' => $namaBulan,
            'tahun' => $tahun,
            'totalPemasukan' => $totalPemasukan,
            'totalPengeluaran' => $totalPengeluaran,
            'totalKeuangan' => $totalKeuangan,
            'role' => $currentRole,
            'nomor_rt' => $nomor_rt,
            'nomor_rw' => $nomor_rw,
        ]);

        Log::info('ini yg pdf');

        return $pdf->download("laporan-keuangan-"
            . ($currentRole === 'rt'
                ? "rt{$nomor_rt}-rw{$nomor_rw}"
                : "rw{$nomor_rw}")
            . "-{$formatBulan}-{$tahun}.pdf");
    }

    public function exportlaporanPengaduan(Request $request)
    {
        $currentRole = session('active_role');
        $idRw = Auth::user()->rw->id ?? null;
        $idRt = Auth::user()->rukunTetangga->id ?? null;

        $search = $request->input('search');
        $tahun = $request->input('tahun') ?? now()->year;
        $bulan = $request->input('bulan');
        $kategori = $request->input('kategori');
        $status = $request->input('status');

        Log::info('request yg masuk', [$request->all()]);

        $daftar_bulan = [
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

        $namaBulan = ucfirst($daftar_bulan[$bulan - 1 < 0 ? now()->month - 1 : $bulan - 1]) ?? null;

        Log::info('nama bulan yg didapet', [$namaBulan]);

$nomor_rt = null;
$nomor_rw = null;

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Transaksi');
        $sheet->getStyle("A1:Z3")->getFont()->setBold(true);
        $sheet->getStyle('A1:AZ3')->getAlignment()->applyFromArray([
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical'   => Alignment::VERTICAL_CENTER,
            'wrapText'   => true,
        ]);

        $maxCol = Coordinate::columnIndexFromString('AZ');
        for ($i = 1; $i <= $maxCol; $i++) {
            $colLetter = Coordinate::stringFromColumnIndex($i);
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }

        $no = 1;
        $row = 4;

        if ($currentRole === 'admin') {
            $pengaduan = Pengaduan::with(['warga'])
                ->when($search, fn($q) => $q->where('judul', 'like', "%$search%"))
                ->when($tahun, fn($q) => $q->whereYear('created_at', $tahun))
                ->when($bulan, fn($q) => $q->whereMonth('created_at', $bulan))
                ->when($kategori, fn($q) => $q->where('level', $kategori))
                ->when($status, fn($q) => $q->where('status', $status))
                ->orderBy('created_at', 'desc');
        }

        if ($currentRole === 'rw') {
            $nomor_rw = Auth::user()->rw->nomor_rw;
            $pengaduan = Pengaduan::with(['warga'])->where(function ($query) use ($idRw) {
                $query->where(function ($q) use ($idRw) {
                    $q->where('level', 'rw')
                        ->whereHas('warga.kartuKeluarga.rw', function ($subQuery) use ($idRw) {
                            $subQuery->where('id', $idRw);
                        });
                })->orWhere(function ($q) use ($idRw) {
                    $q->where('level', 'rt')
                        ->whereHas('warga.kartuKeluarga.rukunTetangga.rw', function ($subQuery) use ($idRw) {
                            $subQuery->where('id', $idRw);
                        });
                });
            })->when($search, fn($q) => $q->where('nama_transaksi', 'like', '%' . $search . '%'))
                ->when($tahun, fn($q) => $q->whereYear('created_at', $tahun))
                ->when($bulan, fn($q) => $q->whereMonth('created_at', $bulan))
                ->when($kategori, fn($q) => $q->where('level', $kategori))
                ->when($status, fn($q) => $q->where('status', $status))
                ->orderBy('created_at', 'desc');
        }

        if ($currentRole === 'rt') {
            $nomor_rt = Auth::user()->rukunTetangga->nomor_rt;
            $nomor_rw = Auth::user()->rukunTetangga->rw->nomor_rw;
            $pengaduan = Pengaduan::with(['warga'])->where(function ($query) use ($idRt) {
                $query->where(function ($q) use ($idRt) {
                    $q->where('level', 'rt')
                        ->whereHas('warga.kartuKeluarga.rukunTetangga', function ($subQuery) use ($idRt) {
                            $subQuery->where('id', $idRt);
                        });
                });
            })->when($search, fn($q) => $q->where('nama_transaksi', 'like', '%' . $search . '%'))
                ->when($tahun, fn($q) => $q->whereYear('created_at', $tahun))
                ->when($bulan, fn($q) => $q->whereMonth('created_at', $bulan))
                ->when($kategori, fn($q) => $q->where('level', $kategori))
                ->when($status, fn($q) => $q->where('status', $status))
                ->orderBy('created_at', 'desc');
        }

        $allPengaduan = (clone $pengaduan)->get();

        $judul = match ($currentRole) {
            'admin' => 'Laporan Pengaduan (Semua RW)',
            'rt'    => "Laporan Pengaduan RT {$nomor_rt}/RW {$nomor_rw}",
            'rw'    => "Laporan Pengaduan RW {$nomor_rw}",
        };

        $sheet->setCellValue('B1', $judul);

        $sheet->mergeCells('B1:G1');
        $sheet->setCellValue('B2', "{$namaBulan} {$tahun}");
        $sheet->mergeCells('B2:G2');

        $sheet->setCellValue('B3', 'No.');
        $sheet->setCellValue('C3', 'Tanggal');
        $sheet->setCellValue('D3', 'NIK');
        $sheet->setCellValue('E3', 'Nama Pelapor');
        $sheet->setCellValue('F3', 'Aduan');
        $sheet->setCellValue('G3', 'Status');

        foreach ($allPengaduan as $pengaduan) {
            $sheet->setCellValue("B{$row}", $no);
            $sheet->setCellValue("C{$row}", date('d/m/Y', strtotime($pengaduan->created_at)) ?? '-');
            $sheet->setCellValue("D{$row}", $pengaduan->nik_warga ?? '-');
            $sheet->setCellValue("E{$row}", $pengaduan->warga->nama ?? '-');
            $sheet->setCellValue("F{$row}", $pengaduan->judul ?? '-');
            $sheet->setCellValue("G{$row}", $pengaduan->status ?? '-');
            $row++;
            $no++;
        }

        $selesai = $allPengaduan->where('status', 'selesai')->count();
        $diproses = $allPengaduan->where('status', 'diproses')->count();
        $belum = $allPengaduan->where('status', 'belum')->count();

        $sheet->setCellValue("B" . $row + 1, 'Keterangan: ');
        $sheet->setCellValue("B" . $row + 2, 'Selesai: ' . $selesai);
        $sheet->setCellValue("B" . $row + 3, 'Diproses: ' . $diproses);
        $sheet->setCellValue("B" . $row + 4, 'Belum: ' . $belum);
        $sheet->mergeCells("B" . $row + 1 . ":C" . $row + 1);
        $sheet->mergeCells("B" . $row + 2 . ":C" . $row + 2);
        $sheet->mergeCells("B" . $row + 3 . ":C" . $row + 3);
        $sheet->mergeCells("B" . $row + 4 . ":C" . $row + 4);
        $sheet->getStyle("B" . $row + 1)->getFont()->setBold(true);

        $rowDataEnd = $row - 1;
        $sheet->getStyle("B4:G{$rowDataEnd}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->getStyle("B1:G{$rowDataEnd}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => 'FF000000'],
                ],
            ],
        ]);

        $formatBulan = strtolower($namaBulan);

        $writer = new Xlsx($spreadsheet);
        $filename = match ($currentRole) {
            'admin' => "laporan-pengaduan-semua-rw-{$formatBulan}-{$tahun}.xlsx",
            'rt'    => "laporan-pengaduan-rt{$nomor_rt}-rw{$nomor_rw}-{$formatBulan}-{$tahun}.xlsx",
            'rw'    => "laporan-pengaduan-rw{$nomor_rw}-{$formatBulan}-{$tahun}.xlsx",
        };

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment; filename=\"$filename\"");
        $writer->save("php://output");
        exit;
    }

    public function exportLaporanPengaduanPdf(Request $request)
    {
        $currentRole = session('active_role');
        $idRw = Auth::user()->rw->id ?? null;
        $idRt = Auth::user()->rukunTetangga->id ?? null;

        $search = $request->input('search');
        $tahun = $request->input('tahun') ?? now()->year;
        $bulan = $request->input('bulan');
        $kategori = $request->input('kategori');
        $status = $request->input('status');

        Log::info('bulan sama tahun yg masuk', [$bulan, $tahun]);

        $daftar_bulan = [
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

        $namaBulan = ucfirst($daftar_bulan[$bulan - 1 < 0 ? now()->month - 1 : $bulan - 1]) ?? null;

        Log::info('nama bulan yg didapet', [$namaBulan]);

$nomor_rt = null;
$nomor_rw = null;

        if ($currentRole === 'admin') {
            $pengaduan = Pengaduan::with(['warga'])
                ->when($search, fn($q) => $q->where('judul', 'like', "%$search%"))
                ->when($tahun, fn($q) => $q->whereYear('created_at', $tahun))
                ->when($bulan, fn($q) => $q->whereMonth('created_at', $bulan))
                ->when($kategori, fn($q) => $q->where('level', $kategori))
                ->when($status, fn($q) => $q->where('status', $status))
                ->orderBy('created_at', 'desc');
        }

        if ($currentRole === 'rw') {
            $nomor_rw = Auth::user()->rw->nomor_rw;
            $pengaduan = Pengaduan::with(['warga'])->where(function ($query) use ($idRw) {
                $query->where(function ($q) use ($idRw) {
                    $q->where('level', 'rw')
                        ->whereHas('warga.kartuKeluarga.rw', function ($subQuery) use ($idRw) {
                            $subQuery->where('id', $idRw);
                        });
                })->orWhere(function ($q) use ($idRw) {
                    $q->where('level', 'rt')
                        ->whereHas('warga.kartuKeluarga.rukunTetangga.rw', function ($subQuery) use ($idRw) {
                            $subQuery->where('id', $idRw);
                        });
                });
            })->when($search, fn($q) => $q->where('nama_transaksi', 'like', '%' . $search . '%'))
                ->when($tahun, fn($q) => $q->whereYear('created_at', $tahun))
                ->when($bulan, fn($q) => $q->whereMonth('created_at', $bulan))
                ->when($kategori, fn($q) => $q->where('level', $kategori))
                ->when($status, fn($q) => $q->where('status', $status))
                ->orderBy('created_at', 'desc');
        }

        if ($currentRole === 'rt') {
            $nomor_rt = Auth::user()->rukunTetangga->nomor_rt;
            $nomor_rw = Auth::user()->rukunTetangga->rw->nomor_rw;
            $pengaduan = Pengaduan::with(['warga'])->where(function ($query) use ($idRt) {
                $query->where(function ($q) use ($idRt) {
                    $q->where('level', 'rt')
                        ->whereHas('warga.kartuKeluarga.rukunTetangga', function ($subQuery) use ($idRt) {
                            $subQuery->where('id', $idRt);
                        });
                });
            })->when($search, fn($q) => $q->where('nama_transaksi', 'like', '%' . $search . '%'))
                ->when($tahun, fn($q) => $q->whereYear('created_at', $tahun))
                ->when($bulan, fn($q) => $q->whereMonth('created_at', $bulan))
                ->when($kategori, fn($q) => $q->where('level', $kategori))
                ->when($status, fn($q) => $q->where('status', $status))
                ->orderBy('created_at', 'desc');
        }

        $allPengaduan = (clone $pengaduan)->get();

        $formatBulan = strtolower($namaBulan);

        $pdf = Pdf::loadView('laporan-pengaduan-pdf', [
            'pengaduan' => $allPengaduan,
            'bulan' => $namaBulan,
            'tahun' => $tahun,
            'role' => $currentRole,
            'nomor_rt' => $nomor_rt,
            'nomor_rw' => $nomor_rw,
        ]);

        Log::info('ini yg pdf');

        return $pdf->download("laporan-pengaduan-"
            . ($currentRole === 'rt'
                ? "rt{$nomor_rt}-rw{$nomor_rw}"
                : "rw{$nomor_rw}")
            . "-{$formatBulan}-{$tahun}.pdf");
    }
}
