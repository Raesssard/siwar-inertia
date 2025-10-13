<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\AdminRwController;
use App\Http\Controllers\Warga\LihatKKController;
use App\Http\Controllers\Warga\PengaduanController;
use App\Http\Controllers\Warga\PengumumanWargaController;
use App\Http\Controllers\Warga\WargatagihanController;
use App\Http\Controllers\Warga\WargatransaksiController;
use App\Http\Controllers\Admin\AdminRtController;
use App\Http\Controllers\Admin\AdminKategoriGolonganController;
use App\Http\Controllers\Admin\AdminPermissionController;
use App\Http\Controllers\Admin\AdminRoleController;
use App\Http\Controllers\Rt\ExportController;
use App\Http\Controllers\Rt\Rt_kartu_keluargaController;
use App\Http\Controllers\Rt\Rt_PengaduanController;
use App\Http\Controllers\Rt\Rt_pengumumanController;
use App\Http\Controllers\Rt\Rt_tagihanController;
use App\Http\Controllers\Rt\Rt_transaksiController;
use App\Http\Controllers\Rt\Rt_wargaController;
use App\Http\Controllers\Rt\RtIuranController;
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
        Route::resource('roles', AdminRoleController::class)->except(['create', 'edit', 'show']);
        Route::put('roles/{id}/permissions', [AdminRoleController::class, 'updatePermissions'])->name('roles.permissions.update');
        Route::resource('permissions', AdminPermissionController::class)->except(['create', 'edit', 'show']);
    });

    Route::prefix('warga')->as('warga.')->group(function () {
        Route::get('pengumuman', [PengumumanWargaController::class, 'index'])->name('pengumuman');
        Route::resource('pengaduan', PengaduanController::class);
        Route::post('/pengaduan/{id}/komentar', [PengaduanController::class, 'komen'])
            ->name('pengaduan.komentar.komen');
        Route::post('/pengumuman/{id}/komentar', [PengumumanWargaController::class, 'komen'])
            ->name('pengumuman.komentar.komen');
        Route::get('kk', [LihatKKController::class, 'index'])->name('kk');
        Route::get('tagihan', [WargatagihanController::class, 'index'])->name('tagihan');
        Route::get('transaksi', [WargatransaksiController::class, 'index'])->name('transaksi');
    });

    Route::prefix('rt')->as('rt.')->group(function () {
        Route::resource('warga', Rt_wargaController::class);
        Route::resource('kartu_keluarga', Rt_kartu_keluargaController::class)->only('index');
        Route::resource('pengumuman', Rt_pengumumanController::class);
        Route::get('/pengumuman/{id}/export-pdf', [Rt_pengumumanController::class, 'exportPDF'])
            ->name('pengumuman.export.pdf');
        Route::post('/pengumuman/{id}/komentar', [Rt_pengumumanController::class, 'komen'])
            ->name('pengumuman.komentar.komen');
        Route::resource('iuran', RtIuranController::class);
        Route::get('/export/iuran', [ExportController::class, 'exportIuran'])
            ->name('iuran.export');
        Route::resource('tagihan', Rt_tagihanController::class);
        Route::get('/export/tagihan', [ExportController::class, 'exportTagihan'])
            ->name('tagihan.export');
        Route::resource('transaksi', Rt_transaksiController::class);
        Route::get('/export/transaksi', [ExportController::class, 'exportTransaksi'])
            ->name('transaksi.export');
        Route::resource('pengaduan', Rt_PengaduanController::class)
            ->only('index');
        Route::patch('pengaduan/{id}/baca', [Rt_PengaduanController::class, 'show'])
            ->name('pengaduan.baca');
        Route::post('/pengaduan/{id}/komentar', [Rt_PengaduanController::class, 'komen'])
            ->name('pengaduan.komentar.komen');
        Route::put('/pengaduan/{id}/status', [Rt_PengaduanController::class, 'updateStatus']);
        Route::put('/pengaduan/{id}/konfirmasi', [Rt_PengaduanController::class, 'updateKonfirmasi']);
        Route::put('kartu_keluarga/{rt_kartu_keluarga}/upload-foto', [Rt_kartu_keluargaController::class, 'uploadFoto'])
            ->name('kartu_keluarga.upload_foto');
        Route::delete('kartu_keluarga/{rt_kartu_keluarga}/delete-foto', [Rt_kartu_keluargaController::class, 'deleteFoto'])
            ->name('kartu_keluarga.delete_foto');
        Route::get('kartu_keluarga/{rt_kartu_keluarga}/upload-form', [Rt_kartu_keluargaController::class, 'uploadForm'])
            ->name('kartu_keluarga.upload_form');
    });
});
