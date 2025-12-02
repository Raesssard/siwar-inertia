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
    <h3 class="text-center">Laporan Pengaduan
        {{ $role === 'rt' ? "RT {$nomor_rt}/RW {$nomor_rw}" : "RW {$nomor_rw}" }}</h3>
    <h4 class="text-center">{{ $bulan }} {{ $tahun }}</h4>
    <table>
        <thead>
            <tr>
                <th class="text-center" style="width: 20%" scope="col">No.</th>
                <th class="text-center" scope="col">Tanggal</th>
                <th class="text-center" scope="col">NIK</th>
                <th class="text-center" scope="col">Nama Pelapor</th>
                <th class="text-center" scope="col">Aduan</th>
                <th class="text-center" scope="col">Status</th>
            </tr>
        </thead>
        <tbody>
            @php $no = 1; @endphp

            @forelse($pengaduan as $aduan)
                <tr>
                    <td class="text-center" style="width: 20%">{{ $no++ }}</td>
                    <td class="text-center">{{ \Carbon\Carbon::parse($aduan->created_at)->format('d/m/Y') }}</td>
                    <td class="text-center">{{ $aduan->nik_warga }}</td>
                    <td class="text-center">{{ $aduan->warga->nama ?? '-' }}</td>
                    <td class="text-center">{{ $aduan->judul ?? '-' }}</td>
                    <td class="text-center">{{ $aduan->status ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="text-center text-muted">Tidak ada data transaksi</td>
                </tr>
            @endforelse
        </tbody>
    </table>
    @php
        $selesai = $pengaduan->where('status', 'selesai')->count();
        $diproses = $pengaduan->where('status', 'diproses')->count();
        $belum = $pengaduan->where('status', 'belum')->count();
    @endphp
    <div style="margin-top: 2rem">
        <h4>
            <strong>Keterangan:</strong>
        </h4>
        <p style="font-size: 0.85rem">Selesai: {{ $selesai ?? '-' }}</p>
        <p style="font-size: 0.85rem">Diproses: {{ $diproses ?? '-' }}</p>
        <p style="font-size: 0.85rem">Belum: {{ $belum ?? '-' }}</p>
    </div>
</body>

</html>
