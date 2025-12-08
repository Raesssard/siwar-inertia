<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HistoryWarga extends Model
{
    use SoftDeletes;

    protected $table = 'history_warga';

    protected $fillable = [
        'warga_nik',
        'nama',
        'jenis',
        'keterangan',
        'tanggal',
    ];

    public function warga()
    {
        return $this->belongsTo(Warga::class, 'warga_nik', 'nik');
    }
}
