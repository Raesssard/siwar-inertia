<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Kategori_golongan extends Model
{
    protected $table = 'kategori_golongan';
    protected $fillable = [
        'jenis',
    ];

    public function iuranGolongan()
    {
        return $this->hasMany(IuranGolongan::class, 'id_golongan');
    }

    public function keluarga()
    {
        return $this->hasMany(Kartu_keluarga::class, 'kategori_iuran', 'id');
    }

    public static function getEnumNama()
    {
        return ['kampung', 'kavling', 'kost', 'kantor', 'kontrakan', 'umkm'];
    }
}