<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PengaduanKomentar extends Model
{
    use SoftDeletes;

    protected $table = 'pengaduan_komentar';
    protected $fillable = [
        'pengaduan_id',
        'user_id',
        'isi_komentar',
        'file_path',
        'file_name',
    ];

    public function pengaduan(): BelongsTo
    {
        return $this->belongsTo(Pengaduan::class, 'pengaduan_id', 'id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
