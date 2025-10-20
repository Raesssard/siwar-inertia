<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Pengumuman</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            line-height: 1.5;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .judul {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .tanggal {
            font-size: 12px;
            color: #555;
            margin-bottom: 20px;
        }

        .isi {
            font-size: 14px;
            text-align: justify;
            margin-bottom: 20px;
        }

        .lampiran {
            margin-top: 30px;
        }

        .lampiran h4 {
            font-size: 16px;
            margin-bottom: 10px;
        }

        .lampiran img {
            max-width: 100%;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            padding: 5px;
        }

        .link {
            font-size: 12px;
            color: blue;
        }
    </style>
</head>

<body>
    <div class="header">
        <div class="judul">{{ $pengumuman->judul }}</div>
        <div class="tanggal">Diterbitkan:
            {{ \Carbon\Carbon::parse($pengumuman->tanggal)->translatedFormat('d F Y') }}
        </div>
        <div class="tanggal">Oleh:
            {{
                $pengumuman->id_rw && $pengumuman->id_rt
                    ? 'RW ' . $pengumuman->rw->nomor_rw . '/RT ' . $pengumuman->rukunTetangga->nomor_rt
                    : 'RW ' . $pengumuman->rw->nomor_rw
            }}
        </div>
    </div>

    <div class="isi">
        {!! nl2br(e($pengumuman->isi)) !!}
    </div>
</body>

</html>
