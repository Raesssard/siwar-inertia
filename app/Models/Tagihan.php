<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tagihan extends Model
{
    use HasFactory;

    protected $table = 'tagihan';

    protected $fillable = [
        'nama',
        'tgl_tagih',
        'tgl_tempo',
        'jenis',
        'nominal',
        'no_kk',
        'status_bayar',
        'tgl_bayar',
        'id_iuran',
        'kategori_pembayaran',
        'bukti_transfer',
        'tercatat_transaksi', // <<< Tambahkan ini
    ];

    // Jika Anda ingin Laravel secara otomatis mengkonversi nilai boolean
    protected $casts = [
        'tercatat_transaksi' => 'boolean',
    ];

    /**
     * Relasi ke KartuKeluarga
     */
    public function kartuKeluarga()
    {
        return $this->belongsTo(Kartu_keluarga::class, 'no_kk', 'no_kk');
    }

    public function iuran()
    {
        return $this->belongsTo(Iuran::class, 'id_iuran', 'id');
    }

}
