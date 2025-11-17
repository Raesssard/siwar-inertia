<?php

namespace App\Providers;

use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
Log::info("AppServiceProvider booted!");

        if (Auth::check()) {
            $user = Auth::user();

            // Jika belum ada active_role → ambil role pertama
            if (!Session::has('active_role')) {
                $role = $user->roles->first()->name ?? null;
                Session::put('active_role', $role);
            }
        }
        Carbon::setLocale('id');

        // Share global data ke semua halaman Inertia
        Inertia::share([
            // 🔹 Data user login
            'auth' => function () {
                /** @var User $user */
                $user = Auth::user();
                return $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'roles' => $user->getRoleNames()->toArray(),
                ] : null;
            },

            // 🔹 Flash message (success, error, info)
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
