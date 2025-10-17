<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IuranGolongan extends Model
{
    protected $table = 'iuran_golongan';
    protected $fillable = [
        'id_iuran',
        'id_golongan',
        'nominal',
        'periode',
    ];

    public function iuran(): BelongsTo
    {
        return $this->belongsTo(Iuran::class, 'id_iuran');
    }

    public function golongan(): BelongsTo
    {
        return $this->belongsTo(Kategori_golongan::class, 'id_golongan');
    }
}


