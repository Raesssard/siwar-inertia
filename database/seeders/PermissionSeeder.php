<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 🔹 Definisi Role dan Permission-nya
        $rolesPermission = [
            'admin' => [
                'dashboard.admin',

                // RW management
                'view.rw', 'create.rw', 'edit.rw', 'delete.rw', 'toggle.rw',

                // RT management
                'view.rt', 'create.rt', 'edit.rt', 'delete.rt', 'toggle.rt',
                
                // Warga & KK
                'view.warga', 'create.warga', 'edit.warga', 'delete.warga',
                'view.kartu_keluarga', 'create.kartu_keluarga', 'edit.kartu_keluarga', 'delete.kartu_keluarga',

                // Kategori & Golongan
                'view.kategori_golongan', 'create.kategori_golongan', 'edit.kategori_golongan', 'delete.kategori_golongan',

                // Role management
                'view.role', 'create.role', 'edit.role', 'delete.role', 'assign.permissions.to.role',

                // Permission management
                'view.permission', 'create.permission', 'edit.permission', 'delete.permission',
            ],

            'rw' => [
                'dashboard.rw',

                // RT
                'view.rt', 'create.rt', 'edit.rt', 'delete.rt', 'toggle.rt',

                // Warga & KK
                'view.warga', 'create.warga', 'edit.warga', 'delete.warga',
                'view.kartu_keluarga', 'create.kartu_keluarga', 'edit.kartu_keluarga', 'delete.kartu_keluarga',

                // Pengumuman
                'view.pengumuman', 'create.rwpengumuman', 'edit.rwpengumuman', 'delete.rwpengumuman', 'export.pengumuman',

                // Pengaduan
                'view.pengaduan', 'respond.pengaduan', 'confirm.pengaduan',

                // Iuran
                'view.iuran', 'create.iuran', 'edit.iuran', 'delete.iuran', 'export.iuran',

                // Tagihan
                'view.tagihan', 'delete.tagihan', 'export.tagihan',

                // Transaksi
                'view.transaksi', 'create.transaksi', 'edit.transaksi', 'delete.transaksi', 'export.transaksi',
            ],

            'rt' => [
                'dashboard.rt',

                // Warga & KK
                'view.warga',
                'view.kartu_keluarga',

                // Pengumuman
                'view.pengumuman', 'create.pengumuman', 'edit.pengumuman', 'delete.pengumuman', 'export.pengumuman',

                // Pengaduan
                'view.pengaduan', 'respond.pengaduan',

                // Iuran
                'view.iuran', 'export.iuran',

                // Tagihan
                'view.tagihan', 'export.tagihan',

                // Transaksi
                'view.transaksi', 'export.transaksi',
            ],

            'warga' => [
                'dashboard.warga',

                // Pengumuman & Pengaduan
                'view.pengumuman',
                'view.pengaduan', 'create.pengaduan', 'edit.pengaduan', 'delete.pengaduan', 'comment.pengaduan',

                // KK, Tagihan, Transaksi
                'view.kartu_keluarga',
                'view.tagihan',
                'view.transaksi',
            ],

            'sekretaris' => [
                // RT management
                'view.rt', 'create.rt', 'edit.rt', 'delete.rt', 'toggle.rt',

                // Warga & KK
                'view.warga', 'create.warga', 'edit.warga', 'delete.warga',
                'view.kartu_keluarga', 'create.kartu_keluarga', 'edit.kartu_keluarga', 'delete.kartu_keluarga',

                // Pengumuman RW
                'view.pengumuman', 'create.rwpengumuman', 'edit.rwpengumuman', 'delete.rwpengumuman', 'export.pengumuman',

                // Pengaduan
                'view.pengaduan', 'respond.pengaduan', 'confirm.pengaduan',
            ],

            'bendahara' => [
                // Iuran
                'view.iuran', 'create.iuran', 'edit.iuran', 'delete.iuran', 'export.iuran',

                // Tagihan
                'view.tagihan', 'delete.tagihan', 'export.tagihan',

                // Transaksi
                'view.transaksi', 'create.transaksi', 'edit.transaksi', 'delete.transaksi', 'export.transaksi',
            ],
        ];

        // 🔹 Buat semua role & permission
        foreach ($rolesPermission as $roleName => $permissions) {
            $role = Role::firstOrCreate(['name' => $roleName]);

            foreach ($permissions as $permissionName) {
                $permission = Permission::firstOrCreate(['name' => $permissionName]);

                // 🔹 Assign permission ke role
                if (!$role->hasPermissionTo($permission)) {
                    $role->givePermissionTo($permission);
                }
            }
        }
    }
}
