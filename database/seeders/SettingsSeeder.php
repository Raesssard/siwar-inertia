<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        // Tambah setting maksimal RT
        DB::table('settings')->insert([
            'key' => 'max_rt_per_rw',
            'value' => '6',
            'description' => 'Jumlah maksimal RT yang dapat dibuat dalam satu RW',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Tambah RW default
        $rwId = DB::table('rw')->insertGetId([
            'nomor_rw' => '01',
            'status' => 'nonaktif',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Ambil jumlah maksimal RT dari setting
        $maxRT = DB::table('settings')->where('key', 'max_rt_per_rw')->value('value');

        // Insert RT sesuai jumlah maksimal
        for ($i = 1; $i <= (int)$maxRT; $i++) {
            DB::table('rt')->insert([
                'nomor_rt' => str_pad($i, 2, '0', STR_PAD_LEFT), // format 01, 02, 03, ...
                'id_rw' => $rwId,
                'status' => 'nonaktif',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
