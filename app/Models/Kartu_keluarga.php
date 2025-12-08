<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Kartu_keluarga extends Model
{
    use SoftDeletes;

    protected $table = 'kartu_keluarga';

    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'no_kk',
        'no_registrasi',
        'alamat',
        'id_rt',
        'id_rw',
        'kelurahan',
        'kecamatan',
        'kabupaten',
        'provinsi',
        'kode_pos',
        'tgl_terbit',
        'kategori_iuran',
        'instansi_penerbit',
        'kabupaten_kota_penerbit',
        'nama_kepala_dukcapil',
        'nip_kepala_dukcapil',
        'foto_kk',
    ];

    public function rukunTetangga(): BelongsTo
    {
        return $this->belongsTo(Rt::class, 'id_rt', 'id');
    }
    
    public function rt(): BelongsTo
    {
        return $this->belongsTo(Rt::class, 'id_rt', 'id');
    }

    public function rw(): BelongsTo
    {
        return $this->belongsTo(Rw::class, 'id_rw', 'id');
    }

    public function tagihan(): HasMany
    {
        return $this->hasMany(Tagihan::class, 'no_kk', 'no_kk');
    }

    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class, 'no_kk', 'no_kk');
    }

    public function warga(): HasMany
    {
        return $this->hasMany(Warga::class, 'no_kk', 'no_kk');
    }

    public function kategoriGolongan(): BelongsTo
    {
        return $this->belongsTo(Kategori_golongan::class, 'kategori_iuran', 'id');
    }

    public function kepalaKeluarga()
    {
        return $this->hasOne(Warga::class, 'no_kk', 'no_kk')
                    ->where('status_hubungan_dalam_keluarga', 'kepala keluarga');
    }
}
