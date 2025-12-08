<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <style>
        .text-center {
            text-align: center;
        }

        .text-end {
            text-align: right;
        }

        table,
        th,
        td {
            border: 1px solid #000;
            border-collapse: collapse;
            width: 100%
        }

        th,
        td {
            padding: 6px;
        }
    </style>
</head>

<body>
    <h3 class="text-center">Laporan Pemasukan dan Pengeluaran
        {{ $role === 'rt' ? "RT {$nomor_rt}/RW {$nomor_rw}" : "RW {$nomor_rw}" }}</h3>
    <h4 class="text-center">Periode {{ $bulan }} {{ $tahun }}</h4>
    <table>
        <thead>
            <tr>
                <th class="text-center" style="width: 20%" scope="col">No.</th>
                <th class="text-center" scope="col">Tanggal</th>
                <th class="text-center" scope="col">Keterangan</th>
                <th class="text-center" scope="col">Pemasukan</th>
                <th class="text-center" scope="col">Pengeluaran</th>
            </tr>
        </thead>
        <tbody>
            @php $no = 1; @endphp

            @forelse($transaksi as $trx)
                <tr>
                    <td class="text-center" style="width: 20%">{{ $no++ }}</td>
                    <td class="text-center">{{ \Carbon\Carbon::parse($trx->tanggal)->format('d/m/Y') }}</td>
                    <td>{{ $trx->nama_transaksi }}</td>
                    <td class="text-end">
                        {{ $trx->jenis === 'pemasukan' ? 'Rp ' . number_format($trx->nominal, 2, ',', '.') : '-' }}
                    </td>
                    <td class="text-end">
                        {{ $trx->jenis === 'pengeluaran' ? 'Rp ' . number_format($trx->nominal, 2, ',', '.') : '-' }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center text-muted">Tidak ada data transaksi</td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr>
                <td colSpan="3" class="text-start" style="font-weight: 500">Total</td>
                <td class="text-end" style="font-weight: 500">
                    {{ $totalPemasukan ? 'Rp ' . number_format($totalPemasukan, 2, ',', '.') : '-' }}</td>
                <td class="text-end" style="font-weight: 500">
                    {{ $totalPengeluaran ? 'Rp ' . number_format($totalPengeluaran, 2, ',', '.') : '-' }}
                </td>
            </tr>
            <tr>
                <td colSpan="4" class="text-start" style="font-weight: 500">Saldo Akhir</td>
                <td class="text-end" style="font-weight: 500">
                    {{ $totalKeuangan ? 'Rp ' . number_format($totalKeuangan, 2, ',', '.') : '-' }}
                </td>
            </tr>
        </tfoot>
    </table>
</body>

</html>
