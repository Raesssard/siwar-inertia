<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;
use Spatie\Permission\Models\Role;

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
        $user = Auth::user();

        if (!$user) {
            return parent::share($request);
        }

        if (!session()->has('active_role')) {
            if ($user->last_role && $user->hasRole($user->last_role)) {
                session()->put('active_role', $user->last_role);
            } else {
                $firstRole = $user->getRoleNames()->first();
                session()->put('active_role', $firstRole);
            }
        }

        $validRoles = ['admin', 'rw', 'rt', 'warga'];
        $currentRole = session('active_role');
        
        $sideRoles = $user->roles()
            ->whereNotIn('name', $validRoles)
            ->pluck('name')
            ->toArray();
        
        $roleName = !empty($sideRoles) ? $sideRoles[0] : $currentRole;
        
        $role = Role::findByName($roleName);
        
        $permissions = $role->permissions->pluck('name');

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user->load(['warga', 'rukunTetangga', 'rw']),
                'rolesAccount' => $user
                    ? $user->getRoleNames()->filter(fn($r) => in_array($r, $validRoles))->values()
                    : [],
                'roles' => $user->getRoleNames(),
                'permissions' => $permissions,
                'currentRole' => $currentRole,
                'sideRoles' => $sideRoles,
            ],
            'cookie_prompt' => [
                'need' => session('need_cookie_confirmation', false),
            ],
            'errors' => function () use ($request) {
                return $request->session()->get('errors')
                    ? $request->session()->get('errors')->getBag('default')->getMessages()
                    : (object) [];
            },
        ]);
    }
}
