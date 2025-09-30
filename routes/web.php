<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\AdminRwController;
use Inertia\Inertia;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->name('login.post');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

Route::middleware(['auth'])->group(function () {
    Route::get('/choose-role', [LoginController::class, 'chooseRole'])->name('choose-role');
    Route::post('/choose-role', [LoginController::class, 'setRole'])->name('choose.role');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // 🔹 Route Admin RW CRUD
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('rw', AdminRwController::class);
    });
});
