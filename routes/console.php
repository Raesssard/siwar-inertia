<?php

use App\Http\Controllers\Rt\RtIuranController;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


Schedule::call(function () {
    Log::info('Scheduler Laravel 12: ' . now());
})->everyMinute();

Schedule::command('iuran:generate-tagihan')->everyMinute();
