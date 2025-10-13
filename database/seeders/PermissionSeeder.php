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
                'rw.view', 'create.rw', 'edit.rw', 'delete.rw', 'toggle.rw',

                // RT management
                'rt.view', 'create.rt', 'edit.rt', 'delete.rt', 'toggle.rt',

                // Kategori & Golongan
                'kategori_golongan.view', 'create.kategori_golongan', 'edit.kategori_golongan', 'delete.kategori_golongan',

                // Role management
                'role.view', 'create.role', 'edit.role', 'delete.role', 'assign.permissions.to.role',

                // Permission management
                'permission.view', 'create.permission', 'edit.permission', 'delete.permission',
            ],

            'rw' => [
                'dashboard.rw',

                // RT
                'rt.view', 'create.rt', 'edit.rt', 'delete.rt', 'toggle.rt',

                // Warga & KK
                'warga.view', 'create.warga', 'edit.warga', 'delete.warga',
                'kartu_keluarga.view', 'create.kartu_keluarga', 'edit.kartu_keluarga', 'delete.kartu_keluarga',

                // Pengumuman
                'pengumuman.view', 'create.rwpengumuman', 'edit.rwpengumuman', 'delete.rwpengumuman', 'export.pengumuman',

                // Pengaduan
                'pengaduan.view', 'respond.pengaduan', 'confirm.pengaduan',

                // Iuran
                'iuran.view', 'create.iuran', 'edit.iuran', 'delete.iuran', 'export.iuran',

                // Tagihan
                'tagihan.view', 'delete.tagihan', 'export.tagihan',

                // Transaksi
                'transaksi.view', 'create.transaksi', 'edit.transaksi', 'delete.transaksi', 'export.transaksi',
            ],

            'rt' => [
                'dashboard.rt',

                // Warga & KK
                'warga.view',
                'kartu_keluarga.view',

                // Pengumuman
                'pengumuman.view', 'create.pengumuman', 'edit.pengumuman', 'delete.pengumuman', 'export.pengumuman',

                // Pengaduan
                'pengaduan.view', 'respond.pengaduan',

                // Iuran
                'iuran.view', 'export.iuran',

                // Tagihan
                'tagihan.view', 'export.tagihan',

                // Transaksi
                'transaksi.view', 'export.transaksi',
            ],

            'warga' => [
                'dashboard.warga',

                // Pengumuman & Pengaduan
                'pengumuman.view',
                'pengaduan.view', 'create.pengaduan', 'edit.pengaduan', 'delete.pengaduan', 'comment.pengaduan',

                // KK, Tagihan, Transaksi
                'kartu_keluarga.view',
                'tagihan.view',
                'transaksi.view',
            ],

            'sekretaris' => [
                // RT management
                'rt.view', 'create.rt', 'edit.rt', 'delete.rt', 'toggle.rt',

                // Warga & KK
                'warga.view', 'create.warga', 'edit.warga', 'delete.warga',
                'kartu_keluarga.view', 'create.kartu_keluarga', 'edit.kartu_keluarga', 'delete.kartu_keluarga',

                // Pengumuman RW
                'pengumuman.view', 'create.rwpengumuman', 'edit.rwpengumuman', 'delete.rwpengumuman', 'export.pengumuman',

                // Pengaduan
                'pengaduan.view', 'respond.pengaduan', 'confirm.pengaduan',
            ],

            'bendahara' => [
                // Iuran
                'iuran.view', 'create.iuran', 'edit.iuran', 'delete.iuran', 'export.iuran',

                // Tagihan
                'tagihan.view', 'delete.tagihan', 'export.tagihan',

                // Transaksi
                'transaksi.view', 'create.transaksi', 'edit.transaksi', 'delete.transaksi', 'export.transaksi',
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
