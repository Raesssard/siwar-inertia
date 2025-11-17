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

        // Ambil role efektif
        $effectiveRole = $user->effectiveRole();

        // Ambil role model
        $roleModel = $user->roles()->where('name', $effectiveRole)->first();

        if (!$roleModel) {
            abort(403, 'Role tidak valid.');
        }

        // Ambil permission dari role efektif saja
        $allowedPermissions = $roleModel->permissions->pluck('name')->toArray();

        if (!in_array($permission, $allowedPermissions)) {
            abort(403, 'Anda tidak punya izin untuk mengakses halaman ini.');
        }

        return $next($request);
    }
}
