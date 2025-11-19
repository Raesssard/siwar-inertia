<?php

namespace App\Http\Middleware;

use Illuminate\Cookie\Middleware\EncryptCookies as Middleware;

class CustomEncryptCookies extends Middleware
{
    protected $except = [
        'custom_auth_token',
    ];
}
