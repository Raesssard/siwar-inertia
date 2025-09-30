<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rt extends Model
{
    protected $table = 'rt';

    protected $fillable = [
        'nik',
        'no_kk',
        'rt',
        'nama',
        'mulai_menjabat',
        'akhir_jabatan',
        'id_rw',
    ];

    protected $attributes = [
        'id_rw' => 1,
    ];

    public function warga(): HasMany
    {
        return $this->hasMany(Warga::class, 'id_rt');
    }

    public function pengumuman(): HasMany
    {
        return $this->hasMany(Pengumuman::class, 'id_rt');
    }

    public function kartuKeluarga(): HasMany
    {
        return $this->hasMany(Kartu_keluarga::class, 'id_rt');
    }

    public function rw()
    {
        return $this->belongsTo(Rw::class, 'id_rw');
    }

    public function user()
    {
        return $this->hasOne(User::class, 'id_rt', 'id');
    }

}

