<?php

namespace Database\Seeders;

use App\Models\Kartu_keluarga;
use App\Models\Kategori_golongan;
use App\Models\Rt;
use App\Models\Rw;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Warga;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    public function run(): void
    {

        $roles = ['admin', 'rw', 'rt', 'warga', 'sekretaris', 'bendahara'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        $admin = User::updateOrCreate(
            ['nik' => '0000000000000001'],
            [
                'nama' => 'Wahyu Admin',
                'password' => Hash::make('password'), // ganti sesuai kebutuhan
                'id_rw' => null,
            ]
        );

        $admin->syncRoles(['admin']);


        
    }
}
