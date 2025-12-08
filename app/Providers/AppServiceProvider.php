<?php

namespace App\Providers;

use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        
    }

    public function boot(): void
    {
        if (Auth::check()) {
            /** @var User $user */
            $user = Auth::user();

            if (!Session::has('active_role')) {
                if ($user->last_role && $user->hasRole($user->last_role)) {
                    Session::put('active_role', $user->last_role);
                } else {
                    $firstRole = $user->getRoleNames()->first();
                    Session::put('active_role', $firstRole);
                }
            }
        }
        Carbon::setLocale('id');
        Inertia::share([
            'flash' => function () {
                return [
                    'success' => session('success'),
                    'error'   => session('error'),
                    'info'    => session('info'),
                ];
            },
        ]);
    }
}
