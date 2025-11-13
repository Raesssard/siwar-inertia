<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AnalisisController,
    LoginController,
    DashboardController,
    SettingsController,
};
use App\Http\Controllers\Warga\{
    LihatKKController,
    PengaduanController,
    PengumumanWargaController,
    WargatagihanController,
    WargatransaksiController,
};
use App\Http\Controllers\Admin\{
    AdminRtController,
    AdminRwController,
    AdminKategoriGolonganController,
    AdminPermissionController,
    AdminRoleController,
    AdminWargaController,
    AdminKartuKeluargaController,
};
use App\Http\Controllers\Rt\{
    ExportController,
    Rt_kartu_keluargaController,
    Rt_PengaduanController,
    Rt_pengumumanController,
    Rt_tagihanController,
    Rt_transaksiController,
    Rt_wargaController,
    RtIuranController,
};
use App\Http\Controllers\Rw\{
    RwKartuKeluargaController,
    RwPengaduanController,
    RwPengumumanController,
    RwRukunTetanggaController,
    RwWargaController,
    RwIuranController,
    RwTagihanController,
    RwTransaksiController,
};
use Inertia\Inertia;
use App\Http\Middleware\CheckPermission;

Route::get('/', [LoginController::class, 'showLoginForm']);

// 🔹 Auth
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->name('login.post');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// 🔹 Protected routes
Route::middleware(['auth'])->group(function () {
    Route::get('/choose-role', [LoginController::class, 'chooseRole'])->name('choose-role');
    Route::post('/choose-role', [LoginController::class, 'setRole'])->name('choose.role');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::put('/settings/password', [SettingsController::class, 'updatePassword'])->name('settings.update-password');
    Route::put('/settings/update-system', [SettingsController::class, 'updateSystem'])->name('settings.update-system');

    /*
    |--------------------------------------------------------------------------
    | ADMIN
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')
            ->name('admin.')
            ->middleware(['auth']) // pastikan user login
            ->group(function () {

        // 📊 Analisis
        // Route::get('/analisis/warga', [AnalisisController::class, 'index'])
        //     ->middleware(CheckPermission::class . ':dashboard.admin')
        //     ->name('analisis.warga');

        // Route::get('/analisis/sistem', [AnalisisController::class, 'index'])
        //     ->middleware(CheckPermission::class . ':dashboard.admin')
        //     ->name('analisis.sistem');

        // 🏠 RW
        Route::resource('rw', AdminRwController::class)
            ->except(['create', 'edit', 'show'])
            ->middleware(CheckPermission::class . ':view.rw');

        Route::put('rw/{id}/toggle-status', [AdminRwController::class, 'toggleStatus'])
            ->middleware(CheckPermission::class . ':toggle.rw')
            ->name('rw.toggleStatus');

        // 👥 RT
        Route::resource('rt', AdminRtController::class)
            ->except(['create', 'edit', 'show'])
            ->middleware(CheckPermission::class . ':view.rt');

        Route::put('rt/{id}/toggle-status', [AdminRtController::class, 'toggleStatus'])
            ->middleware(CheckPermission::class . ':toggle.rt')
            ->name('rt.toggleStatus');

        // 🧾 Kartu Keluarga
        Route::resource('kartu_keluarga', AdminKartuKeluargaController::class)
            ->except(['create', 'edit', 'show'])
            ->middleware(CheckPermission::class . ':view.kartu_keluarga');

        Route::put('kartu_keluarga/{id}/upload-foto', [AdminKartuKeluargaController::class, 'uploadFoto'])
            ->middleware(CheckPermission::class . ':edit.kartu_keluarga')
            ->name('kartu_keluarga.upload_foto');

        Route::delete('kartu_keluarga/{id}/delete-foto', [AdminKartuKeluargaController::class, 'deleteFoto'])
            ->middleware(CheckPermission::class . ':edit.kartu_keluarga')
            ->name('kartu_keluarga.delete_foto');

        Route::get('kartu_keluarga/{id}/upload-form', [AdminKartuKeluargaController::class, 'uploadForm'])
            ->middleware(CheckPermission::class . ':edit.kartu_keluarga')
            ->name('kartu_keluarga.upload_form');

        // 👨‍👩‍👧‍👦 Warga
        Route::resource('warga', AdminWargaController::class)
            ->middleware(CheckPermission::class . ':view.warga');

        Route::get('warga/create', [AdminWargaController::class, 'create'])
            ->middleware(CheckPermission::class . ':create.warga')
            ->name('warga.create');

        Route::get('warga/{id}/edit', [AdminWargaController::class, 'edit'])
            ->middleware(CheckPermission::class . ':edit.warga')
            ->name('warga.edit');

        // ⚙️ Kategori Golongan
        Route::resource('kategori-golongan', AdminKategoriGolonganController::class)
            ->except(['create', 'edit', 'show'])
            ->middleware(CheckPermission::class . ':view.kategori_golongan');

        // 🧩 Roles
        Route::resource('roles', AdminRoleController::class)
            ->except(['create', 'edit', 'show'])
            ->middleware(CheckPermission::class . ':view.role');

        Route::get('roles/{id}/permissions', [AdminRoleController::class, 'editPermissions'])
            ->middleware(CheckPermission::class . ':assign.permissions.to.role')
            ->name('roles.permissions.edit');

        Route::put('roles/{id}/permissions', [AdminRoleController::class, 'updatePermissions'])
            ->middleware(CheckPermission::class . ':assign.permissions.to.role')
            ->name('roles.permissions.update');

        // 🔑 Permissions
        Route::resource('permissions', AdminPermissionController::class)
            ->except(['create', 'edit', 'show'])
            ->middleware(CheckPermission::class . ':view.permission');
    });

    /*
    |--------------------------------------------------------------------------
    | WARGA
    |--------------------------------------------------------------------------
    */
    Route::prefix('warga')->as('warga.')->group(function () {
        Route::get('pengumuman', [PengumumanWargaController::class, 'index'])->name('pengumuman');
        Route::resource('pengaduan', PengaduanController::class);
        Route::post('/pengaduan/{id}/komentar', [PengaduanController::class, 'komen'])->name('pengaduan.komentar.komen');
        Route::post('/pengumuman/{id}/komentar', [PengumumanWargaController::class, 'komen'])->name('pengumuman.komentar.komen');
        Route::get('kk', [LihatKKController::class, 'index'])->name('kk');
        Route::get('tagihan', [WargatagihanController::class, 'index'])->name('tagihan');
        Route::get('transaksi', [WargatransaksiController::class, 'index'])->name('transaksi');
    });

    /*
    |--------------------------------------------------------------------------
    | RW
    |--------------------------------------------------------------------------
    */
    Route::prefix('rw')->as('rw.')->group(function () {
        Route::get('/analisis/keuangan', [AnalisisController::class, 'index'])->name('analisis');
        Route::get('/analisis/warga', [AnalisisController::class, 'index'])->name('analisis');
        Route::resource('rt', RwRukunTetanggaController::class)->except(['create', 'edit', 'show']);
        Route::resource('warga', RwWargaController::class);
        Route::get('warga/create', [RwWargaController::class, 'create'])->name('warga.create');
        Route::get('warga/{id}/edit', [RwWargaController::class, 'edit'])->name('warga.edit');
        Route::get('warga/orangtua/{no_kk}', [RwWargaController::class, 'getOrangTua'])->name('warga.getOrangTua');

        Route::resource('kartu_keluarga', RwKartuKeluargaController::class);
        Route::post('kartu_keluarga/{no_kk}/upload-foto', [RwKartuKeluargaController::class, 'uploadFoto'])->name('kartu_keluarga.upload');
        Route::delete('kartu_keluarga/{no_kk}/delete-foto', [RwKartuKeluargaController::class, 'deleteFoto'])->name('kartu_keluarga.delete');

        Route::resource('pengumuman', RwPengumumanController::class);
        Route::get('/pengumuman/{id}/export-pdf', [RwPengumumanController::class, 'exportPDF'])->name('pengumuman.export.pdf');
        Route::post('/pengumuman/{id}/komentar', [RwPengumumanController::class, 'komen'])->name('pengumuman.komentar.komen');

        Route::resource('iuran', RwIuranController::class)->except('destroy');
        Route::delete('/iuran/{id}/{jenis}', [RwIuranController::class, 'destroy'])->name('iuran.destroy');
        Route::get('/export/iuran', [ExportController::class, 'exportIuran'])->name('iuran.export');

        Route::resource('tagihan', RwTagihanController::class);
        Route::get('/export/tagihan', [ExportController::class, 'exportTagihan'])->name('tagihan.export');

        Route::resource('transaksi', RwTransaksiController::class);
        Route::get('/export/transaksi', [ExportController::class, 'exportTransaksi'])->name('transaksi.export');

        Route::get('pengaduan', [RwPengaduanController::class, 'index'])->name('pengaduan.index');
        Route::put('pengaduan/{id}/status', [RwPengaduanController::class, 'updateStatus'])->name('pengaduan.updateStatus');
        Route::put('pengaduan/{id}/konfirmasi', [RwPengaduanController::class, 'updateKonfirmasi'])->name('pengaduan.updateKonfirmasi');
        Route::post('pengaduan/{id}/komentar', [RwPengaduanController::class, 'komen'])->name('pengaduan.komentar.komen');
        Route::post('pengaduan/{id}/baca', [RwPengaduanController::class, 'baca'])->name('pengaduan.baca');

        Route::put('rt/{id}/toggle-status', [RwRukunTetanggaController::class, 'toggleStatus'])->name('rt.toggleStatus');
    });

    /*
    |--------------------------------------------------------------------------
    | RT
    |--------------------------------------------------------------------------
    */
    Route::prefix('rt')->as('rt.')->group(function () {
        Route::get('/analisis/keuangan', [AnalisisController::class, 'index'])->name('analisis');
        Route::get('/analisis/warga', [AnalisisController::class, 'index'])->name('analisis');
        Route::resource('kartu_keluarga', Rt_kartu_keluargaController::class)->only('index');
        Route::resource('pengumuman', Rt_pengumumanController::class);
        Route::get('/pengumuman/{id}/export-pdf', [Rt_pengumumanController::class, 'exportPDF'])->name('pengumuman.export.pdf');
        Route::post('/pengumuman/{id}/komentar', [Rt_pengumumanController::class, 'komen'])->name('pengumuman.komentar.komen');

        Route::resource('iuran', RtIuranController::class)->except(['destroy', 'update']);
        Route::delete('/iuran/{id}/{jenis}', [RtIuranController::class, 'destroy'])->name('iuran.destroy');
        Route::put('/iuran/{id}/{jenis}', [RtIuranController::class, 'update'])->name('iuran.update');
        Route::get('/export/iuran', [ExportController::class, 'exportIuran'])->name('iuran.export');

        Route::resource('tagihan', Rt_tagihanController::class);
        Route::get('/export/tagihan', [ExportController::class, 'exportTagihan'])->name('tagihan.export');

        Route::resource('warga', Rt_wargaController::class)->only('index');

        Route::resource('transaksi', Rt_transaksiController::class);
        Route::get('/export/transaksi', [ExportController::class, 'exportTransaksi'])->name('transaksi.export');

        Route::resource('pengaduan', Rt_PengaduanController::class)->only('index');
        Route::post('/pengaduan/{id}/komentar', [Rt_PengaduanController::class, 'komen'])->name('pengaduan.komentar.komen');
        Route::put('/pengaduan/{id}/status', [Rt_PengaduanController::class, 'updateStatus'])->name('pengaduan.updateStatus');
        Route::put('/pengaduan/{id}/konfirmasi', [Rt_PengaduanController::class, 'updateKonfirmasi'])->name('pengaduan.updateKonfirmasi');
        Route::post('pengaduan/{id}/baca', [Rt_PengaduanController::class, 'baca'])->name('pengaduan.baca');

        Route::put('kartu_keluarga/{rt_kartu_keluarga}/upload-foto', [Rt_kartu_keluargaController::class, 'uploadFoto'])->name('kartu_keluarga.upload_foto');
        Route::delete('kartu_keluarga/{rt_kartu_keluarga}/delete-foto', [Rt_kartu_keluargaController::class, 'deleteFoto'])->name('kartu_keluarga.delete_foto');
        Route::get('kartu_keluarga/{rt_kartu_keluarga}/upload-form', [Rt_kartu_keluargaController::class, 'uploadForm'])->name('kartu_keluarga.upload_form');
    });
});
