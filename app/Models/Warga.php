<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Warga extends Model
{
    use SoftDeletes;

    protected $table = 'warga';

    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'nik',
        'no_kk',
        'no_kk_lama',
        'nama',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'agama',
        'pendidikan',
        'pekerjaan',
        'status_perkawinan',
        'status_hubungan_dalam_keluarga',
        'golongan_darah',
        'kewarganegaraan',
        'nama_ayah',
        'nama_ibu',
        'status_warga',

        'no_paspor',
        'tgl_terbit_paspor',
        'tgl_berakhir_paspor',
        'no_kitas',
        'tgl_terbit_kitas',
        'tgl_berakhir_kitas',
        'no_kitap',
        'tgl_terbit_kitap',
        'tgl_berakhir_kitap',

        'alamat_asal',
        'alamat_domisili',
        'tanggal_mulai_tinggal',
        'tujuan_pindah',
    ];

    public function kartuKeluarga(): BelongsTo
    {
        return $this->belongsTo(Kartu_keluarga::class, 'no_kk', 'no_kk');
    }

    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'nik', 'nik');
    }

    public function historyWarga(): HasMany
    {
        return $this->hasMany(HistoryWarga::class, 'warga_nik', 'nik');
    }
}
