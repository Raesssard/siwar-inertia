<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $table = 'users';

    protected $fillable = [
        'nik',
        'password',
        'nama',
        'nomor_rw',
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

    public function isKetuaRt(): bool
    {
        return $this->hasRole('rt') 
            && !$this->hasAnyRole(['sekretaris', 'bendahara']);
    }

    public function isKetuaRw(): bool
    {
        return $this->hasRole('rw') 
            && !$this->hasAnyRole(['sekretaris', 'bendahara']);
    }

    public function jabatan(): ?string
    {
        if ($this->hasRole('sekretaris')) return 'Sekretaris';
        if ($this->hasRole('bendahara')) return 'Bendahara';
        if ($this->isKetuaRt()) return 'Ketua RT';
        if ($this->isKetuaRw()) return 'Ketua RW';
        return null;
    }

}
