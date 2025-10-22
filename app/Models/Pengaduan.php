<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Pengaduan extends Model
{
    use SoftDeletes;

    protected $table = 'pengaduan';

    protected $fillable = [
        'nik_warga',
        'judul',
        'isi',
        'file_path',
        'file_name',
        'foto_bukti',
        'status',
        'level',
        'konfirmasi_rw',
        'created_at',
        'updated_at',
    ];

    public function warga(): BelongsTo
    {
        return $this->belongsTo(Warga::class, 'nik_warga', 'nik');
    }

    public function komentar(): HasMany
    {
        return $this->hasMany(PengaduanKomentar::class, 'pengaduan_id', 'id');
    }

    public function getOriginalFileNameAttribute()
    {
        return $this->file_name ? Str::after($this->file_name, '_') : null;
    }
}
