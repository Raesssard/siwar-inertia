<?php

namespace Database\Seeders;

use App\Models\Kartu_keluarga;
use App\Models\Kategori_golongan;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\User;
use App\Models\Warga;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class WargaSeeder extends Seeder
{
    /**
     * UsersSeeder gk diketahui, mending buat WargaSeeder
     */
    public function run(): void
    {
                $roles = ['admin', 'rw', 'rt', 'warga', 'sekretaris', 'bendahara'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        $kampung = Kategori_golongan::where('jenis', 'kampung')->first();

        $rw = Rw::create([
            'nik' => '1234567890123452',
            'nomor_rw' => '01',
            'nama_ketua_rw' => 'Pak RW',
            'mulai_menjabat' => now(),
            'akhir_jabatan' => now()->addYears(3),
        ]);

        $kk_rt = Kartu_keluarga::create([
            'no_kk' => '1111111111111111',
            'no_registrasi' => '3404.0000001',
            'alamat' => 'Jalan Melati',
            'id_rw' => $rw->id,
            'kelurahan' => 'Kelurahan Mawar',
            'kecamatan' => 'Kecamatan Indah',
            'kabupaten' => 'Kabupaten Damai',
            'provinsi' => 'Provinsi Sejahtera',
            'kode_pos' => '12345',
            'tgl_terbit' => now(),
            'kategori_iuran' => $kampung->id ?? null,
            'instansi_penerbit' => 'Dinas Dukcapil',
            'kabupaten_kota_penerbit' => 'Kota Bandung',
            'nama_kepala_dukcapil' => 'Budi Santoso S.Kom',
            'nip_kepala_dukcapil' => '123456789012345678',
        ]);

        $rt = Rt::create([
            'no_kk' => $kk_rt->no_kk,
            'nik' => '0000000000000002',
            'nomor_rt' => '01',
            'nama_ketua_rt' => 'Andi Kurniawan',
            'mulai_menjabat' => now(),
            'akhir_jabatan' => now()->addYears(3),
            'id_rw' => $rw->id,
        ]);

        $kk_rt->update(['id_rt' => $rt->id]);

        Warga::create([
            'no_kk' => $kk_rt->no_kk,
            'nik' => '0000000000000002',
            'nama' => 'Andi Kurniawan',
            'jenis_kelamin' => 'laki-laki',
            'tempat_lahir' => 'Jakarta',
            'tanggal_lahir' => '2000-01-01',
            'agama' => 'Islam',
            'pendidikan' => 'S1',
            'pekerjaan' => 'PNS',
            'status_perkawinan' => 'menikah',
            'status_hubungan_dalam_keluarga' => 'kepala keluarga',
            'golongan_darah' => 'A',
            'kewarganegaraan' => 'WNI',
            'nama_ayah' => 'Budi Hartono',
            'nama_ibu' => 'Siti Kurniawan',
            'status_warga' => 'penduduk',
        ]);

        $rw = User::updateOrCreate(
            ['nik' => '1234567890123452'],
            [
                'nama' => 'Pak RW',
                'password' => Hash::make('password'),
                'id_rw' => $rw->id,
            ]
        );
        $rw->syncRoles(['rw']);

        // akun sementara, cuma buat tes
        $warga = User::updateOrCreate(
            ['nik' => '0000000000000002'],
            [
                'nama' => 'Andi Kurniawan',
                'password' => Hash::make('password'),
                'id_rw' => 1,
                'id_rt' => 1,
            ]
        );

        $warga->syncRoles(['warga', 'rt']);
    }
}
