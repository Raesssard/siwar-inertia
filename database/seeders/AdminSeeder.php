<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
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
                'nama' => 'Admin',
                'password' => Hash::make('password'), // ganti sesuai kebutuhan
                'id_rw' => null,
            ]
        );

        $admin->syncRoles(['admin']);
    }
}
