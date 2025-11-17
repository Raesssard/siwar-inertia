<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPermission
{
    public function handle(Request $request, Closure $next, $permission)
    {
        $user = $request->user();

        if (!$user || !$user->can($permission)) {
            abort(403, 'Anda tidak punya izin untuk mengakses halaman ini.');
        }

        return $next($request);
    }
}
