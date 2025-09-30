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
        'mulai_menjabat',
        'akhir_jabatan',
    ];

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

}

