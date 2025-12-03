<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $rolesPermission = [
            'admin' => [
                // tetep kamu kasih manual, nanti ditambah auto semua permission lain
                'dashboard.admin',

                'view.rw', 'create.rw', 'edit.rw', 'delete.rw', 'toggle.rw',
                'view.rt', 'create.rt', 'edit.rt', 'delete.rt', 'toggle.rt',

                'view.warga', 'create.warga', 'edit.warga', 'delete.warga',
                'view.kartu_keluarga', 'create.kartu_keluarga', 'edit.kartu_keluarga', 'delete.kartu_keluarga',

                'view.kategori_golongan', 'create.kategori_golongan', 'edit.kategori_golongan', 'delete.kategori_golongan',

                'view.role', 'create.role', 'edit.role', 'delete.role', 'assign.permissions.to.role',

                'view.permission', 'create.permission', 'edit.permission', 'delete.permission',
            ],

            'rw' => [
                'dashboard.rw',
                'view.rt', 'create.rt', 'edit.rt', 'delete.rt', 'toggle.rt',
                'view.warga', 'create.warga', 'edit.warga', 'delete.warga',
                'view.kartu_keluarga', 'create.kartu_keluarga', 'edit.kartu_keluarga', 'delete.kartu_keluarga',
                'view.pengumuman', 'create.pengumuman', 'edit.pengumuman', 'delete.pengumuman', 'export.pengumuman',
                'view.pengaduan', 'respond.pengaduan', 'confirm.pengaduan',
                'view.iuran', 'create.iuran', 'edit.iuran', 'delete.iuran', 'export.iuran',
                'view.tagihan', 'delete.tagihan', 'export.tagihan',
                'view.transaksi', 'create.transaksi', 'edit.transaksi', 'delete.transaksi', 'export.transaksi',
            ],

            'rt' => [
                'dashboard.rt',
                'view.warga',
                'view.kartu_keluarga',
                'view.pengumuman', 'create.pengumuman', 'edit.pengumuman', 'delete.pengumuman', 'export.pengumuman',
                'view.pengaduan', 'respond.pengaduan',
                'view.iuran', 'export.iuran',
                'view.tagihan', 'export.tagihan',
                'view.transaksi', 'export.transaksi',
            ],

            'warga' => [
                'dashboard.warga',
                'view.pengumuman',
                'view.pengaduan', 'create.pengaduan', 'edit.pengaduan', 'delete.pengaduan', 'comment.pengaduan',
                'view.kartu_keluarga',
                'view.tagihan',
                'view.transaksi',
            ],

            'sekretaris' => [
                'view.rt', 'create.rt', 'edit.rt', 'delete.rt', 'toggle.rt',
                'view.warga', 'create.warga', 'edit.warga', 'delete.warga',
                'view.kartu_keluarga', 'create.kartu_keluarga', 'edit.kartu_keluarga', 'delete.kartu_keluarga',
                'view.pengumuman', 'create.rwpengumuman', 'edit.rwpengumuman', 'delete.rwpengumuman', 'export.pengumuman',
                'view.pengaduan', 'respond.pengaduan', 'confirm.pengaduan',
            ],

            'bendahara' => [
                'view.iuran', 'create.iuran', 'edit.iuran', 'delete.iuran', 'export.iuran',
                'view.tagihan', 'delete.tagihan', 'export.tagihan',
                'view.transaksi', 'create.transaksi', 'edit.transaksi', 'delete.transaksi', 'export.transaksi',
            ],
        ];

        // 🔹 Kumpulkan semua permission dalam array
        $allPermissions = [];

        foreach ($rolesPermission as $permissions) {
            foreach ($permissions as $p) {
                $allPermissions[$p] = true; // biar unik
            }
        }

        // 🔹 Buat semua role & permission sesuai daftar
        foreach ($rolesPermission as $roleName => $permissions) {
            $role = Role::firstOrCreate(['name' => $roleName]);

            foreach ($permissions as $permissionName) {
                $permission = Permission::firstOrCreate(['name' => $permissionName]);
                $role->givePermissionTo($permission);
            }
        }

        // 🔥 ADMIN DAPAT SEMUA PERMISSION
        $adminRole = Role::where('name', 'admin')->first();

        foreach (array_keys($allPermissions) as $permissionName) {
            $permission = Permission::firstOrCreate(['name' => $permissionName]);
            if (!$adminRole->hasPermissionTo($permission)) {
                $adminRole->givePermissionTo($permission);
            }
        }
    }
}
