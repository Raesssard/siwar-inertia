<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $validRoles = ['admin', 'rw', 'rt', 'warga'];
        $user = $request->user();

        // Role aktif dari session
        $currentRole = session('active_role');

        // Ambil role model utk role aktif saja
        $roleModel = $user
            ? $user->roles()->where('name', $currentRole)->first()
            : null;

        // Permission efektif (HANYA dari role aktif)
        $effectivePermissions = $roleModel
            ? $roleModel->permissions->pluck('name')
            : collect();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user?->load(['warga', 'rukunTetangga', 'rw']),

                // Role yang valid (admin/rw/rt/warga)
                'rolesAccount' => $user
                    ? $user->getRoleNames()->filter(fn($r) => in_array($r, $validRoles))->values()
                    : [],

                // Semua role user (tanpa filter)
                'roles' => $user?->getRoleNames(),

                // Permission efektif berdasarkan role aktif
                'permissions' => $effectivePermissions,

                // Role yang sedang dipakai
                'currentRole' => $currentRole,
            ],

            'errors' => function () use ($request) {
                return $request->session()->get('errors')
                    ? $request->session()->get('errors')->getBag('default')->getMessages()
                    : (object) [];
            },
        ]);
    }
}
