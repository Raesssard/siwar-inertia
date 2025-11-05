<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Rw;
use App\Models\Rt;
use App\Models\Kartu_keluarga;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            KategoriGolonganSeeder::class,
            AdminSeeder::class,
            PermissionSeeder::class,
            SettingsSeeder::class,
        ]);
    }
}
