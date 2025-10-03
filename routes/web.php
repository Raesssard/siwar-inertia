<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\AdminRwController;
use App\Http\Controllers\Warga\PengaduanController;
use App\Http\Controllers\Warga\PengumumanWargaController;

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

    Route::prefix('warga')->as('warga.')->group(function () {
        Route::get('pengumuman', [PengumumanWargaController::class, 'index'])->name('pengumuman');
        Route::resource('pengaduan', PengaduanController::class);
        Route::post('/pengaduan/{id}/komentar', [PengaduanController::class, 'komen'])
            ->name('pengaduan.komentar.komen');
        Route::post('/pengumuman/{id}/komentar', [PengumumanWargaController::class, 'komen'])
            ->name('pengumuman.komentar.komen');
    });
});
