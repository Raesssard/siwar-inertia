<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

/**
 * @method bool hasRole(string $role)
 * @method bool can(string $permission)
 * @property \Illuminate\Support\Collection $roles
 */

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, SoftDeletes;

    protected $table = 'users';

    protected $fillable = [
        'nik',
        'password',
        'nama',
        'id_rw',
        'id_rt',
    ];

    public function warga()
    {
        return $this->hasOne(Warga::class, 'nik', 'nik');
    }

    public function rukunTetangga()
    {
        return $this->belongsTo(Rt::class, 'id_rt', 'id');
    }

    public function rw(): BelongsTo
    {
        return $this->belongsTo(Rw::class, 'id_rw', 'id');
    }

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Mendapatkan role efektif user.
     *
     * @return string
     */

    public function effectiveRole()
    {
        $roles = $this->roles->pluck('name')->toArray();

        // Jika hanya punya 1 role, itu role utamanya
        if (count($roles) === 1) {
            return $roles[0];
        }

        // Jika ada role RT dan role lain → pakai role lain
        if (in_array('rt', $roles)) {
            return collect($roles)->first(fn ($r) => $r !== 'rt');
        }

        // Jika ada role RW dan role lain → pakai role lain
        if (in_array('rw', $roles)) {
            return collect($roles)->first(fn ($r) => $r !== 'rw');
        }

        // Default kalau tidak ada RT/RW
        return $roles[0];
    }
}
