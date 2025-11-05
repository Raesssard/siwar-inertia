<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Setting extends Model
{
    use SoftDeletes;
    // Nama tabel (opsional kalau sesuai konvensi)
    protected $table = 'settings';

    // Kolom yang bisa diisi secara mass-assignment
    protected $fillable = [
        'key',
        'value',
        'description',
    ];

    // Biar value bisa langsung dipanggil sebagai string/number (opsional)
    protected $casts = [
        'value' => 'string',
    ];

    /**
     * Static helper untuk ambil setting by key.
     * Contoh: Setting::getValue('max_rt_per_rw');
     */
    public static function getValue(string $key, $default = null)
    {
        return static::where('key', $key)->value('value') ?? $default;
    }

    /**
     * Static helper untuk update atau buat baru setting by key.
     * Contoh: Setting::setValue('max_rt_per_rw', 6);
     */
    public static function setValue(string $key, $value, $description = null)
    {
        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'description' => $description]
        );
    }
}
