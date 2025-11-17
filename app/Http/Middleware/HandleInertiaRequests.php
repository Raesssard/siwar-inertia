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
        // Role aktif dari session
        $currentRole = session('active_role');

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user()?->load(['warga', 'rukunTetangga', 'rw']),
                'rolesAccount' => $user
                    ? $user->getRoleNames()->filter(fn($r) => in_array($r, $validRoles))->values()
                    : [],
                'roles' => $request->user()?->getRoleNames(),
                'permissions' => $request->user()?->getAllPermissions()->pluck('name'),
                'currentRole' => session('active_role'),
            ],
            'errors' => function () use ($request) {
                return $request->session()->get('errors')
                    ? $request->session()->get('errors')->getBag('default')->getMessages()
                    : (object) [];
            },
        ]);
    }
}
