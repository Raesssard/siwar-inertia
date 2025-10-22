<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Iuran extends Model
{
    use SoftDeletes;

    protected $table = 'iuran';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'nama',
        'tgl_tagih',
        'tgl_tempo',
        'jenis',
        'nominal',   // hanya untuk iuran manual
        'id_rt',     // nullable → kalau null berarti iuran RW
        'id_rw',     // wajib → RW induk
        'level',     // enum: ['rt','rw']
    ];

    /**
     * Relasi ke Tagihan
     */
    public function tagihan(): HasMany
    {
        return $this->hasMany(Tagihan::class, 'id_iuran');
    }

    /**
     * Cascade delete ke tagihan
     */
    protected static function booted()
    {
        static::deleting(function ($iuran) {
            $iuran->tagihan()->delete();
        });
    }

    /**
     * Relasi ke IuranGolongan (saat jenis = otomatis)
     */
    public function iuran_golongan(): HasMany
    {
        return $this->hasMany(IuranGolongan::class, 'id_iuran');
    }

    public function rt()
    {
        return $this->belongsTo(Rt::class, 'id_rt');
    }

    public function rw()
    {
        return $this->belongsTo(Rw::class, 'id_rw');
    }
}
