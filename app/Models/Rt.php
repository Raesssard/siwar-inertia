<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rt extends Model
{
    use SoftDeletes;

    protected $table = 'rt';

    protected $fillable = [
        'nik',
        'no_kk',
        'nomor_rt',
        'nama_anggota_rt',
        'mulai_menjabat',
        'akhir_jabatan',
        'id_rw',
        'status',
    ];
    protected $attributes = [
        'status' => 'aktif',
    ];
    
    public function getMulaiMenjabatAttribute($value)
    {
        return $value
            ? Carbon::parse($value)->format('d/m/y')
            : null;
    }

    public function getAkhirJabatanAttribute($value)
    {
        return $value
            ? Carbon::parse($value)->format('d/m/y')
            : null;
    }

    public function warga()
    {
        return $this->hasManyThrough(
            Warga::class,
            Kartu_keluarga::class,
            'id_rt',    
            'no_kk',    
            'id',       
            'no_kk'      
        );
    }

    public function pengumuman(): HasMany
    {
        return $this->hasMany(Pengumuman::class, 'id_rt');
    }

    public function kartuKeluarga(): HasMany
    {
        return $this->hasMany(Kartu_keluarga::class, 'id_rt');
    }

    public function rw(): BelongsTo
    {
        return $this->belongsTo(Rw::class, 'id_rw');
    }

    public function user(): HasMany
    {
        return $this->hasMany(User::class, 'id_rt', 'id');
    }

    public function getStatusLabelAttribute(): string
    {
        return $this->status === 'aktif' ? 'Aktif' : 'Nonaktif';
    }
}
