<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PengumumanKomentar extends Model
{
    protected $table = 'pengumuman_komentar';
    protected $fillable = [
        'pengumuman_id',
        'user_id',
        'isi_komentar',
        'file_path',
        'file_name',
    ];

    public function pengaduan(): BelongsTo
    {
        return $this->belongsTo(Pengumuman::class, 'pengumuman_id', 'id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
