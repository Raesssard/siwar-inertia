<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\AdminRwController;
use App\Http\Controllers\Admin\AdminRtController;
use App\Http\Controllers\Admin\AdminKategoriGolonganController;
use Inertia\Inertia;

Route::get('/', function () {
    return view('welcome');
});

// 🔹 Auth
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->name('login.post');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// 🔹 Protected routes
Route::middleware(['auth'])->group(function () {
    Route::get('/choose-role', [LoginController::class, 'chooseRole'])->name('choose-role');
    Route::post('/choose-role', [LoginController::class, 'setRole'])->name('choose.role');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // 🔹 Admin routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('rw', AdminRwController::class)->except(['create', 'edit', 'show']);
        Route::resource('rt', AdminRtController::class)->except(['create', 'edit', 'show']);
        Route::resource('kategori-golongan', AdminKategoriGolonganController::class)->except(['create', 'edit', 'show']);
    });
});
