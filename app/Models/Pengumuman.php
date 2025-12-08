<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pengumuman extends Model
{
    use SoftDeletes;

    protected $table = 'pengumuman';
    protected $fillable = [
        'judul',
        'kategori',
        'isi',
        'tanggal',
        'tempat',
        'id_rt',
        'id_rw',
        'dokumen_path', 
        'dokumen_name', 
    ];

    public function rukunTetangga()
    {
        return $this->belongsTo(Rt::class, 'id_rt');
    }

    public function rw(): BelongsTo
    {
        return $this->belongsTo(Rw::class, 'id_rw', 'id');
    }

    public function komen(): HasMany
    {
        return $this->hasMany(PengumumanKomentar::class, 'pengumuman_id', 'id');
    }
}
