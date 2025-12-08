<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rw extends Model
{
    use SoftDeletes;

    protected $table = 'rw';

    protected $fillable = [
        'nik',
        'no_kk',
        'nomor_rw',
        'nama_anggota_rw',
        'status', 
        'mulai_menjabat',
        'akhir_jabatan',
    ];

    public function warga()
    {
        return $this->hasManyThrough(
            Warga::class,
            Kartu_keluarga::class,
            'id_rw',     
            'no_kk',     
            'id',        
            'no_kk'      
        );
    }

    public function kartuKeluarga(): HasMany
    {
        return $this->hasMany(Kartu_keluarga::class, 'id_rw');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'id_rw', 'id');
    }

    public function pengumuman(): HasMany
    {
        return $this->hasMany(Pengumuman::class, 'id_rw', 'id');
    }

    public function rukunTetangga(): HasMany
    {
        return $this->hasMany(Rt::class, 'id_rw', 'id');
    }

    public function getStatusLabelAttribute(): string
    {
        return $this->status === 'aktif' ? 'Aktif' : 'Nonaktif';
    }
}
