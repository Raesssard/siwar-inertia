<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rw extends Model
{
    protected $table = 'rw';

    protected $fillable = [
        'nik',
        'nomor_rw',
        'nama_ketua_rw',
        'status', // ✅ tambahkan ini
        'mulai_menjabat',
        'akhir_jabatan',
    ];

    // Relasi ke Kartu Keluarga
    public function kartuKeluarga(): HasMany
    {
        return $this->hasMany(Kartu_keluarga::class, 'id_rw');
    }

    // Relasi ke User
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'id_rw', 'id');
    }

    // Relasi ke Pengumuman
    public function pengumuman(): HasMany
    {
        return $this->hasMany(Pengumuman::class, 'id_rw', 'id');
    }

    // Relasi ke RT
    public function rukunTetangga(): HasMany
    {
        return $this->hasMany(Rt::class, 'id_rw', 'id');
    }

    // ✅ Accessor untuk menampilkan status dengan label
    public function getStatusLabelAttribute(): string
    {
        return $this->status === 'aktif' ? 'Aktif' : 'Nonaktif';
    }
}
