<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
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
        if (!Auth::check() && $request->hasCookie('custom_auth_token')) {
            try {
                $token = $request->cookie('custom_auth_token'); // plain
            } catch (\Exception $e) {
                Log::error("Cookie decrypt error: " . $e->getMessage());
                return $next($request);
            }
            $user = User::where('remember_custom_token', $token)->first();

            Log::info("token dari cookie:", [$token]);
            Log::info("remember me checked");
            if ($user) {
                Log::info("user valid", [$user]);
                Auth::login($user);
                $role = $user->last_role ?: $user->roles->pluck('name')->first();
                Log::info("user role", [$role]);

                session(['active_role' => $role]);

                if ($request->is('login') || $request->is('/')) {
                    Log::info("redirect to dashboard");
                    return redirect()->route('dashboard');
                }
            }
        }

        return $next($request);
    }
}
