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
    Log::info('Scheduler test jalan di Laravel 12: ' . now());
})->everyMinute();

Schedule::command('iuran:generate-tagihan')->everyMinute();

// Schedule::command('iuran:generate-tagihan')
//     ->dailyAt('00:10') // misal tiap jam 00:10 pagi
//     ->runInBackground()
//     ->withoutOverlapping()
//     ->onOneServer();