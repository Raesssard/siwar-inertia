<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CheckRememberCookie
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
Log::info("check remember me");
        if (!Auth::check() && $request->hasCookie('remember_web')) {
            $token = $request->cookie('remember_web');
            $user = User::where('remember_token', $token)->first();

Log::info("remember me checked");
            if ($user) {
                Auth::login($user);
                $role = $user->last_role ?: $user->roles->pluck('name')->first();

                session(['active_role' => $role]);
            }
        }

        return $next($request);
    }
}
