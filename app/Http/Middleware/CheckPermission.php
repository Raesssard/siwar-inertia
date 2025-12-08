<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckPermission
{
    public function handle(Request $request, Closure $next, $permission)
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user) {
            abort(403, 'User tidak ditemukan.');
        }

        $effectiveRole = $user->effectiveRole();

        if (!$user->hasRole($effectiveRole)) {
            abort(403, 'Role tidak valid.');
        }

        if (!$user->can($permission)) {
            abort(403, 'Anda tidak punya izin untuk mengakses halaman ini.');
        }

        return $next($request);
    }
}
