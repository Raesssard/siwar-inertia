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
        'nominal',   
        'id_rt',     
        'id_rw',     
        'level',     
    ];

    public function tagihan(): HasMany
    {
        return $this->hasMany(Tagihan::class, 'id_iuran');
    }

    protected static function booted()
    {
        static::deleting(function ($iuran) {
            $iuran->tagihan()->delete();
        });
    }

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
