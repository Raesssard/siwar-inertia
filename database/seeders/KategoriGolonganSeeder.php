<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kategori_golongan;

class KategoriGolonganSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['jenis' => 'kampung'],
            ['jenis' => 'kavling'],
            ['jenis' => 'kost'],
            ['jenis' => 'kantor'],
            ['jenis' => 'kontrakan'],
            ['jenis' => 'umkm'],
        ];

        foreach ($data as $item) {
            \App\Models\Kategori_golongan::firstOrCreate($item);
        }
    }
}

