<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Surat Pengumuman</title>
    <style>
        body {
            font-family: "Times New Roman", serif;
            font-size: 14px;
        }

        .center {
            text-align: center;
        }

        .kop img {
            width: 80px;
            float: left;
            margin-right: 10px
        }

        .kop h2,
        .kop h3,
        .kop p {
            margin: 0;
            padding: 0;
        }

        .line {
            border: 1px solid #000;
            margin-top: 5px;
        }

        .ttd {
            float: right;
            text-align: center;
            margin-top: 60px
        }

        .clear {
            clear: both;
        }
    </style>
</head>

<body>
    <div class="kop center">
        {{-- sementara pake logo app dlu 🙏 --}}
        <img src="{{ public_path('img/logo.png') }}">
        <h2>PEMERINTAH {{ strtoupper($kabupaten) }}</h2>
        <h3>KECAMATAN {{ strtoupper($kecamatan) }}</h3>
        <h3>KELURAHAN {{ strtoupper($kelurahan) }}</h3>
        <p>RT {{ $rt }} / RW {{ $rw }}</p>
    </div>
    <div class="line"></div>
    <br>
    <div class="center">
        <strong><u>{{ $judul }}</u></strong><br>
        Nomor: {{ $nomor_surat }}
    </div>
    <br>
    <p>
        Dengan hormat,<br>
        Sehubungan dengan {{ $isi_pengumuman }},
        maka dimohon kepada seluruh warga untuk dapat hadir pada:
    </p>
    <table>
        <tr>
            <td>Hari / Tanggal</td>
            <td>:</td>
            <td>{{ $hari }}, {{ $tanggal }}</td>
        </tr>
        <tr>
            <td>Pukul</td>
            <td>:</td>
            <td>{{ $waktu }}</td>
        </tr>
        <tr>
            <td>Tempat</td>
            <td>:</td>
            <td>{{ $tempat }}</td>
        </tr>
    </table>
    <br>
    <p>Demikian pengumuman ini kami sampaikan. Terima kasih.</p>
    <div class="ttd">
        {{ $kabupaten }}, {{ $tanggal_surat }}<br>
        @if ($rt)
            {{ $penanggung_jawab }} RT {{ $rt }}/RW {{ $rw }}<br><br>
        @else
            {{ $penanggung_jawab }} RW {{ $rw }}<br><br>
        @endif
        <br><br><br>
        <u>{{ $nama_penanggung_jawab }}</u><br>
    </div>
    <div class="clear"></div>
</body>

</html>
