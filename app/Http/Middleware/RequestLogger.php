<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RequestLogger
{
    public function handle(Request $request, Closure $next)
    {
        Log::info("=== REQUEST START ===");
        Log::info("URL: " . $request->url());
        Log::info("Method: " . $request->method());
        Log::info("Has XSRF cookie? " . ($request->hasCookie('XSRF-TOKEN') ? 'YES' : 'NO'));
        Log::info("XSRF cookie value: " . $request->cookie('XSRF-TOKEN'));
        Log::info("Header X-XSRF-TOKEN: " . $request->header('X-XSRF-TOKEN'));
        Log::info("Session ID: " . session()->getId());
        Log::info("All cookies:", $request->cookies->all());

        return $next($request);
    }
}
