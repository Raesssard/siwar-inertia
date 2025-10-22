<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PengumumanKomentar extends Model
{
    use SoftDeletes;

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
