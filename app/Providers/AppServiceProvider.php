<?php

namespace App\Providers;

use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Carbon::setLocale('id');

        // Share auth info ke semua Inertia page
        Inertia::share([
            'auth' => function () {
                /** @var User $user */
                $user = Auth::user();
                return $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'roles' => $user->getRoleNames()->toArray(), // array role user
                ] : null;
            },
        ]);
    }
}
