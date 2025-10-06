<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kategori_golongan extends Model
{
    // Nama tabel
    protected $table = 'kategori_golongan';

    // Kolom yang dapat diisi (mass assignable)
    protected $fillable = ['jenis'];

    /**
     * Relasi ke tabel iuran_golongan
     * Satu kategori bisa memiliki banyak iuran golongan
     */
    public function iuranGolongan()
    {
        return $this->hasMany(IuranGolongan::class, 'id_golongan');
    }

    /**
     * Relasi ke tabel kartu_keluarga
     * Satu kategori bisa memiliki banyak keluarga
     */
    public function keluarga()
    {
        return $this->hasMany(Kartu_keluarga::class, 'kategori_iuran', 'id');
    }
}
