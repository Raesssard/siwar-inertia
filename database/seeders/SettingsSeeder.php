<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('settings')->insert([
            'key' => 'max_rt_per_rw',
            'value' => '6',
            'description' => 'Jumlah maksimal RT yang dapat dibuat dalam satu RW',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
