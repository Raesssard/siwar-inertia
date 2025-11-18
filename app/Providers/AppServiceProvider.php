<?php

namespace App\Providers;

use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
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
        if (Auth::check()) {
            /** @var User $user */
            $user = Auth::user();

            // Jika belum ada active_role → ambil role pertama ❌
            //                              ambil role yg terakhir dipake ✅
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
