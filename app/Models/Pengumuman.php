<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pengumuman extends Model
{
    //
    protected $table = 'pengumuman';
    protected $fillable = [
        'judul',
        'kategori',
        'isi',
        'tanggal',
        'id_rt',
        'id_rw',
        'dokumen_path', // Tambahkan ini
        'dokumen_name', // Tambahkan ini
    ];

    public function rukunTetangga()
    {
        return $this->belongsTo(Rt::class, 'id_rt');
    }

    public function rw(): BelongsTo
    {
        return $this->belongsTo(Rw::class, 'id_rw', 'id');
    }
}
