<?php

namespace App\Http\Controllers\Rt;

use App\Http\Controllers\Controller;
use App\Models\Iuran;
use App\Models\Kategori_golongan;
use App\Models\Tagihan;
use App\Models\Transaksi;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ExportController extends Controller
{
    // Export Iuran
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
        $iurans = Iuran::where('id_rt', $id_rt)->where('jenis', 'manual')->get();
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
                        'borderStyle' => Border::BORDER_THIN, // bisa THICK, DASHED, dll.
                        'color' => ['argb' => 'FF000000'], // hitam
                    ],
                ],
            ]);

            $rowStart = 3;

            $sheet->getStyle("B2:F2")->applyFromArray([
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => '40bf40'], // kuning
                ],
            ]);

            for ($r = $rowStart; $r <= $rowEnd; $r++) {
                $isEven = $r % 2 == 0; // baris genap
                $color = $isEven ? '79d279' : 'b3e6b3';

                $sheet->getStyle("B{$r}:F{$r}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => $color],
                    ],
                ]);
            }
        }

        $row_otomatis = 3;
        $iuran_otomatis = Iuran::where('id_rt', $id_rt)->where('jenis', 'otomatis')->get();
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

                $colIndex = 11; // kolom K = 11
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
                        'borderStyle' => Border::BORDER_THIN, // bisa THICK, DASHED, dll.
                        'color' => ['argb' => 'FF000000'], // hitam
                    ],
                ],
            ]);

            $rowStart = 3;

            $sheet->getStyle("I2:R2")->applyFromArray([
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => '3366ff'], // kuning
                ],
            ]);

            for ($r = $rowStart; $r <= $rowEnds; $r++) {
                $isEven = $r % 2 == 0; // baris genap
                $color = $isEven ? '809fff' : 'b3c6ff';

                $sheet->getStyle("I{$r}:R{$r}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => $color],
                    ],
                ]);
            }
        }

        $writer = new Xlsx($spreadsheet);
        $filename = "iuran_rt_{$id_rt}.xlsx";

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment; filename=\"$filename\"");
        $writer->save("php://output");
        exit;
    }

    // Export Tagihan
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

        $belum = Tagihan::where('status_bayar', 'belum_bayar')->get();
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
                $sheet->setCellValue("D{$row}", $tagihan->no_kk);
                $sheet->setCellValue("E{$row}", 'Rp ' . number_format($tagihan->nominal, 2, ',', '.'));
                $sheet->setCellValue("F{$row}", $tagihan->jenis);
                $sheet->setCellValue("G{$row}", $tagihan->tgl_tagih);
                $sheet->setCellValue("H{$row}", $tagihan->tgl_tempo);
                $row++;
                $no++;
            }

            $rowEnd = $row - 1;

            $sheet->getStyle("B2:H2")->applyFromArray([
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'ffcc00'], // kuning
                ],
            ]);

            for ($r = $rowStart; $r <= $rowEnd; $r++) {
                $isEven = $r % 2 == 0; // baris genap
                $color = $isEven ? 'ffd633' : 'ffe066';

                $sheet->getStyle("B{$r}:H{$r}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => $color],
                    ],
                ]);
            }

            $sheet->getStyle("B2:H{$rowEnd}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN, // bisa THICK, DASHED, dll.
                        'color' => ['argb' => 'FF000000'], // hitam
                    ],
                ],
            ]);
        }

        $sudah = Tagihan::where('status_bayar', 'sudah_bayar')->get();
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
                $sheet->setCellValue("M{$row2}", $tagihan->no_kk);
                $sheet->setCellValue("N{$row2}", 'Rp ' . number_format($tagihan->nominal, 2, ',', '.'));
                $sheet->setCellValue("O{$row2}", $tagihan->jenis);
                $sheet->setCellValue("P{$row2}", $tagihan->tgl_tagih);
                $sheet->setCellValue("Q{$row2}", $tagihan->tgl_tempo);
                $sheet->setCellValue("R{$row2}", $tagihan->tgl_bayar);
                $row2++;
                $no2++;
            }

            $rowEnd2 = $row2 - 1;

            $sheet->getStyle("K2:R2")->applyFromArray([
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => '009933'], // kuning
                ],
            ]);

            for ($r = $rowStart; $r <= $rowEnd2; $r++) {
                $isEven = $r % 2 == 0; // baris genap
                $color = $isEven ? '00cc44' : '00ff55';

                $sheet->getStyle("K{$r}:R{$r}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => $color],
                    ],
                ]);
            }

            $sheet->getStyle("K2:R{$rowEnd2}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN, // bisa THICK, DASHED, dll.
                        'color' => ['argb' => 'FF000000'], // hitam
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

    // Export Transaksi
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
        $pemasukan = Transaksi::where('jenis', 'pemasukan')->get();

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
                $sheet->setCellValue("D{$row}", $trx->tanggal);
                $sheet->setCellValue("E{$row}", 'Rp ' . number_format($trx->nominal, 2, ',', '.'));
                $sheet->setCellValue("F{$row}", $trx->nama_transaksi);
                $sheet->setCellValue("G{$row}", $trx->keterangan);
                $row++;
                $no++;
            }

            $sheet->getStyle("B2:G2")->applyFromArray([
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => '47d147'], // kuning
                ],
            ]);

            $rowEnd = $row - 1;

            for ($r = $rowStart; $r <= $rowEnd; $r++) {
                $isEven = $r % 2 == 0; // baris genap
                $color = $isEven ? '70db70' : '99e699';

                $sheet->getStyle("B{$r}:G{$r}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => $color],
                    ],
                ]);
            }

            $sheet->getStyle("B2:G{$rowEnd}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN, // bisa THICK, DASHED, dll.
                        'color' => ['argb' => 'FF000000'], // hitam
                    ],
                ],
            ]);
        }

        $no2 = 1;
        $row2 = 3;
        $pengeluaran = Transaksi::where('jenis', 'pengeluaran')->get();

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
                $sheet->setCellValue("L{$row2}", $trx->tanggal);
                $sheet->setCellValue("M{$row2}", 'Rp ' . number_format($trx->nominal, 2, ',', '.'));
                $sheet->setCellValue("N{$row2}", $trx->nama_transaksi);
                $sheet->setCellValue("O{$row2}", $trx->keterangan);
                $row2++;
                $no2++;
            }

            $sheet->getStyle("J2:O2")->applyFromArray([
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'ff1a1a'], // kuning
                ],
            ]);

            $rowEnd = $row2 - 1;

            for ($r = $rowStart; $r <= $rowEnd; $r++) {
                $isEven = $r % 2 == 0; // baris genap
                $color = $isEven ? 'ff4d4d' : 'ff8080';

                $sheet->getStyle("J{$r}:O{$r}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => $color],
                    ],
                ]);
            }

            $sheet->getStyle("J2:O{$rowEnd}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN, // bisa THICK, DASHED, dll.
                        'color' => ['argb' => 'FF000000'], // hitam
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
}
