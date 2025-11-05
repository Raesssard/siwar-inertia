<?php

namespace Database\Seeders;

use App\Models\Kartu_keluarga;
use App\Models\Kategori_golongan;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\User;
use App\Models\Warga;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class WargaSeeder extends Seeder
{
    public function run(): void
    {
        // === 1. Pastikan role tersedia ===
        $roles = ['admin', 'rw', 'rt', 'warga', 'sekretaris', 'bendahara'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        // === 2. Ambil kategori kampung untuk iuran (optional) ===
        $kampung = Kategori_golongan::where('jenis', 'kampung')->first();

        // === 3. Buat RW ===
        $rw = Rw::create([
            'nik' => '1234567890123452',
            'no_kk' => '1234567890123451',
            'nomor_rw' => '01',
            'nama_anggota_rw' => 'Pak RW',
            'status' => 'aktif',
            'mulai_menjabat' => now(),
            'akhir_jabatan' => now()->addYears(3),
        ]);

        // === 4. Buat RT di bawah RW ===
        $rt = Rt::create([
            'no_kk' => '1111111111111111',
            'nik' => '0000000000000002',
            'nomor_rt' => '01',
            'nama_anggota_rt' => 'Andi Kurniawan',
            'status' => 'aktif',
            'mulai_menjabat' => now(),
            'akhir_jabatan' => now()->addYears(3),
            'id_rw' => $rw->id,
        ]);

        // === 5. Buat KK RW ===
        $kk_rw = Kartu_keluarga::create([
            'no_kk' => '1234567890123451',
            'no_registrasi' => '3404.0000000',
            'alamat' => 'Jalan Melati',
            'id_rw' => $rw->id,
            'id_rt' => $rt->id,
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

        // === 6. Buat KK RT ===
        $kk_rt = Kartu_keluarga::create([
            'no_kk' => '1111111111111111',
            'no_registrasi' => '3404.0000001',
            'alamat' => 'Jalan Melati',
            'id_rw' => $rw->id,
            'id_rt' => $rt->id,
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

        // === 7. Buat Warga RW ===
        Warga::create([
            'no_kk' => $kk_rw->no_kk,
            'nik' => $rw->nik,
            'nama' => $rw->nama_anggota_rw,
            'jenis_kelamin' => 'laki-laki',
            'tempat_lahir' => 'Bandung',
            'tanggal_lahir' => '1980-01-01',
            'agama' => 'Islam',
            'pendidikan' => 'S1',
            'pekerjaan' => 'Wiraswasta',
            'status_perkawinan' => 'menikah',
            'status_hubungan_dalam_keluarga' => 'kepala keluarga',
            'golongan_darah' => 'O',
            'kewarganegaraan' => 'WNI',
            'nama_ayah' => 'Slamet Riyadi',
            'nama_ibu' => 'Dewi Sartika',
            'status_warga' => 'penduduk',
        ]);

        // === 8. Buat Warga RT ===
        Warga::create([
            'no_kk' => $kk_rt->no_kk,
            'nik' => $rt->nik,
            'nama' => $rt->nama_anggota_rt,
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

        // === 9. Buat akun RW ===
        $userRw = User::updateOrCreate(
            ['nik' => $rw->nik],
            [
                'nama' => $rw->nama_anggota_rw,
                'password' => Hash::make('password'),
                'id_rw' => $rw->id,
            ]
        );
        $userRw->syncRoles(['rw']);

        // === 10. Buat akun RT ===
        $userRt = User::updateOrCreate(
            ['nik' => $rt->nik],
            [
                'nama' => $rt->nama_anggota_rt,
                'password' => Hash::make('password'),
                'id_rw' => $rw->id,
                'id_rt' => $rt->id,
            ]
        );
        $userRt->syncRoles(['rt', 'warga']);
    }
}
