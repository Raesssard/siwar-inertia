<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AnalisisController,
    LoginController,
    DashboardController,
    InformasiKeuangan,
    Laporan,
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
    AdminPengaduanController,
    AdminPengumumanController,
    AdminTagihanController,
    AdminTransaksiController,
    AdminIuranController,
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
    Route::post('/request-cookie', [LoginController::class, 'requestCookie'])->name('request-cookie');
    Route::post('/reject-cookie', [LoginController::class, 'rejectCookie'])->name('reject-cookie');
    Route::get('/laporan-keuangan', [Laporan::class, 'laporanKeuangan'])->name('laporan-keuangan');
    Route::get('/laporan-pengaduan', [Laporan::class, 'laporanPengaduan'])->name('laporan-pengaduan');
    Route::get('/profile', [SettingsController::class, 'profile'])->name('profile');
    Route::post('/profil/update-photo', [SettingsController::class, 'updatePhoto'])->name('profile.updatePhoto');
    Route::delete('/profile/delete-photo', [SettingsController::class, 'deletePhoto'])->name('profile.deletePhoto');

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

            // 🧾 Kartu Keluarga (ADMIN)
            Route::resource('kartu_keluarga', AdminKartuKeluargaController::class)
                ->except(['create', 'edit', 'show'])
                ->middleware(CheckPermission::class . ':view.kartu_keluarga');

            // CREATE
            Route::get('kartu_keluarga/create', [AdminKartuKeluargaController::class, 'create'])
                ->middleware(CheckPermission::class . ':create.kartu_keluarga')
                ->name('kartu_keluarga.create');

            // EDIT
            Route::get('kartu_keluarga/{id}/edit', [AdminKartuKeluargaController::class, 'edit'])
                ->middleware(CheckPermission::class . ':edit.kartu_keluarga')
                ->name('kartu_keluarga.edit');

            // Upload Foto
            Route::put('kartu_keluarga/{id}/upload-foto', [AdminKartuKeluargaController::class, 'uploadFoto'])
                ->middleware(CheckPermission::class . ':edit.kartu_keluarga')
                ->name('kartu_keluarga.upload_foto');

            // Delete Foto
            Route::delete('kartu_keluarga/{id}/delete-foto', [AdminKartuKeluargaController::class, 'deleteFoto'])
                ->middleware(CheckPermission::class . ':edit.kartu_keluarga')
                ->name('kartu_keluarga.delete_foto');

            // Upload Form (PDF)
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

            // 📢 Pengumuman (ADMIN)
            Route::resource('pengumuman', AdminPengumumanController::class)
                ->except(['create', 'edit', 'show'])
                ->middleware(CheckPermission::class . ':view.pengumuman');

            Route::get('pengumuman/create', [AdminPengumumanController::class, 'create'])
                ->middleware(CheckPermission::class . ':create.pengumuman')
                ->name('pengumuman.create');

            Route::get('pengumuman/{id}/edit', [AdminPengumumanController::class, 'edit'])
                ->middleware(CheckPermission::class . ':edit.pengumuman')
                ->name('pengumuman.edit');

            Route::get('pengumuman/{id}/export-pdf', [AdminPengumumanController::class, 'exportPDF'])
                ->middleware(CheckPermission::class . ':export.pengumuman')
                ->name('pengumuman.export.pdf');

            Route::post('pengumuman/{id}/komentar', [AdminPengumumanController::class, 'komen'])
                ->middleware(CheckPermission::class . ':view.pengumuman')
                ->name('pengumuman.komentar.komen');

                // 📮 Pengaduan (ADMIN)
            Route::get('pengaduan', [AdminPengaduanController::class, 'index'])
                ->middleware(CheckPermission::class . ':view.pengaduan')
                ->name('pengaduan.index');

            Route::put('pengaduan/{id}/status', [AdminPengaduanController::class, 'updateStatus'])
                ->middleware(CheckPermission::class . ':respond.pengaduan')
                ->name('pengaduan.updateStatus');

            Route::put('pengaduan/{id}/konfirmasi', [AdminPengaduanController::class, 'updateKonfirmasi'])
                ->middleware(CheckPermission::class . ':confirm.pengaduan')
                ->name('pengaduan.updateKonfirmasi');

            Route::post('pengaduan/{id}/komentar', [AdminPengaduanController::class, 'komen'])
                ->middleware(CheckPermission::class . ':view.pengaduan')
                ->name('pengaduan.komentar.komen');

            Route::post('pengaduan/{id}/baca', [AdminPengaduanController::class, 'baca'])
                ->middleware(CheckPermission::class . ':view.pengaduan')
                ->name('pengaduan.baca');

            Route::resource('tagihan', AdminTagihanController::class)
                ->except(['create', 'edit', 'show'])
                ->middleware(CheckPermission::class . ':view.tagihan');

            Route::get('export/tagihan', [ExportController::class, 'exportTagihan'])
                ->middleware(CheckPermission::class . ':export.tagihan')
                ->name('tagihan.export');

            Route::resource('transaksi', AdminTransaksiController::class)
                ->except(['create', 'edit', 'show'])
                ->middleware(CheckPermission::class . ':view.transaksi');

            Route::get('export/transaksi', [ExportController::class, 'exportTransaksi'])
                ->middleware(CheckPermission::class . ':export.transaksi')
                ->name('transaksi.export');

            Route::resource('iuran', AdminIuranController::class)
                ->except(['destroy'])
                ->middleware(CheckPermission::class . ':view.iuran');

            Route::delete('iuran/{id}/{jenis}', [AdminIuranController::class, 'destroy'])
                ->middleware(CheckPermission::class . ':delete.iuran')
                ->name('iuran.destroy');

            Route::get('export/iuran', [ExportController::class, 'exportIuran'])
                ->middleware(CheckPermission::class . ':export.iuran')
                ->name('iuran.export');

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
    Route::prefix('warga')
        ->name('warga.')
        ->middleware(['auth'])
        ->group(function () {

            // 📢 Pengumuman (warga hanya bisa melihat)
            Route::get('pengumuman', [PengumumanWargaController::class, 'index'])
                ->middleware(CheckPermission::class . ':view.pengumuman')
                ->name('pengumuman');

            Route::post('pengumuman/{id}/komentar', [PengumumanWargaController::class, 'komen'])
                ->middleware(CheckPermission::class . ':view.pengumuman')
                ->name('pengumuman.komentar.komen');


            // 📮 Pengaduan (CRUD + komentar)
            Route::resource('pengaduan', PengaduanController::class)
                ->except(['create', 'edit', 'show'])
                ->middleware(CheckPermission::class . ':view.pengaduan');

            Route::get('pengaduan/create', [PengaduanController::class, 'create'])
                ->middleware(CheckPermission::class . ':create.pengaduan')
                ->name('pengaduan.create');

            Route::get('pengaduan/{id}/edit', [PengaduanController::class, 'edit'])
                ->middleware(CheckPermission::class . ':edit.pengaduan')
                ->name('pengaduan.edit');

            Route::post('pengaduan/{id}/komentar', [PengaduanController::class, 'komen'])
                ->middleware(CheckPermission::class . ':comment.pengaduan')
                ->name('pengaduan.komentar.komen');


            // 👨‍👩‍👧‍👦 Lihat Kartu Keluarga
            Route::get('kk', [LihatKKController::class, 'index'])
                ->middleware(CheckPermission::class . ':view.kartu_keluarga')
                ->name('kk');


            // 🧾 Tagihan
            Route::get('tagihan', [WargatagihanController::class, 'index'])
                ->middleware(CheckPermission::class . ':view.tagihan')
                ->name('tagihan');


            // 💳 Transaksi
            Route::get('transaksi', [WargatransaksiController::class, 'index'])
                ->middleware(CheckPermission::class . ':view.transaksi')
                ->name('transaksi');
        });

    /*
    |--------------------------------------------------------------------------
    | RW
    |--------------------------------------------------------------------------
    */
    Route::prefix('rw')
        ->name('rw.')
        ->middleware(['auth'])
        ->group(function () {

            // 📊 Analisis
            // Route::get('/analisis/warga', [AnalisisController::class, 'index'])
            //     ->middleware(CheckPermission::class . ':dashboard.rw')
            //     ->name('analisis.warga');

            // Route::get('/analisis/keuangan', [AnalisisController::class, 'index'])
            //     ->middleware(CheckPermission::class . ':dashboard.rw')
            //     ->name('analisis.keuangan');

            // 👥 RT
            Route::resource('rt', RwRukunTetanggaController::class)
                ->except(['create', 'edit', 'show'])
                ->middleware(CheckPermission::class . ':view.rt');

            Route::get('rt/create', [RwRukunTetanggaController::class, 'create'])
                ->middleware(CheckPermission::class . ':create.rt')
                ->name('rt.create');

            Route::get('rt/{id}/edit', [RwRukunTetanggaController::class, 'edit'])
                ->middleware(CheckPermission::class . ':edit.rt')
                ->name('rt.edit');

            Route::put('rt/{id}/toggle-status', [RwRukunTetanggaController::class, 'toggleStatus'])
                ->middleware(CheckPermission::class . ':toggle.rt')
                ->name('rt.toggleStatus');

            // 👨‍👩‍👧‍👦 Warga
            Route::resource('warga', RwWargaController::class)
                ->except(['create', 'edit', 'show'])
                ->middleware(CheckPermission::class . ':view.warga');

            Route::get('warga/create', [RwWargaController::class, 'create'])
                ->middleware(CheckPermission::class . ':create.warga')
                ->name('warga.create');

            Route::get('warga/{id}/edit', [RwWargaController::class, 'edit'])
                ->middleware(CheckPermission::class . ':edit.warga')
                ->name('warga.edit');

            Route::get('warga/orangtua/{no_kk}', [RwWargaController::class, 'getOrangTua'])
                ->middleware(CheckPermission::class . ':view.warga')
                ->name('warga.getOrangTua');

            // 🧾 Kartu Keluarga
            // 🧾 Kartu Keluarga (RW)
            Route::resource('kartu_keluarga', RwKartuKeluargaController::class)
                ->except(['create', 'edit', 'show'])
                ->middleware(CheckPermission::class . ':view.kartu_keluarga');

            // CREATE
            Route::get('kartu_keluarga/create', [RwKartuKeluargaController::class, 'create'])
                ->middleware(CheckPermission::class . ':create.kartu_keluarga')
                ->name('kartu_keluarga.create');

            // EDIT
            Route::get('kartu_keluarga/{id}/edit', [RwKartuKeluargaController::class, 'edit'])
                ->middleware(CheckPermission::class . ':edit.kartu_keluarga')
                ->name('kartu_keluarga.edit');

            // Upload Foto
            Route::put('kartu_keluarga/{id}/upload-foto', [RwKartuKeluargaController::class, 'uploadFoto'])
                ->middleware(CheckPermission::class . ':edit.kartu_keluarga')
                ->name('kartu_keluarga.upload_foto');

            // Delete Foto
            Route::delete('kartu_keluarga/{id}/delete-foto', [RwKartuKeluargaController::class, 'deleteFoto'])
                ->middleware(CheckPermission::class . ':edit.kartu_keluarga')
                ->name('kartu_keluarga.delete_foto');

            // Upload Form (PDF)
            Route::get('kartu_keluarga/{id}/upload-form', [RwKartuKeluargaController::class, 'uploadForm'])
                ->middleware(CheckPermission::class . ':edit.kartu_keluarga')
                ->name('kartu_keluarga.upload_form');

            // 💰 Iuran
            Route::resource('iuran', RwIuranController::class)
                ->except(['destroy'])
                ->middleware(CheckPermission::class . ':view.iuran');

            Route::delete('iuran/{id}/{jenis}', [RwIuranController::class, 'destroy'])
                ->middleware(CheckPermission::class . ':delete.iuran')
                ->name('iuran.destroy');

            Route::get('export/iuran', [ExportController::class, 'exportIuran'])
                ->middleware(CheckPermission::class . ':export.iuran')
                ->name('iuran.export');

            // 🧾 Tagihan
            Route::resource('tagihan', RwTagihanController::class)
                ->except(['create', 'edit', 'show'])
                ->middleware(CheckPermission::class . ':view.tagihan');

            Route::get('export/tagihan', [ExportController::class, 'exportTagihan'])
                ->middleware(CheckPermission::class . ':export.tagihan')
                ->name('tagihan.export');

            // 💳 Transaksi
            Route::resource('transaksi', RwTransaksiController::class)
                ->except(['create', 'edit', 'show'])
                ->middleware(CheckPermission::class . ':view.transaksi');

            Route::get('export/transaksi', [ExportController::class, 'exportTransaksi'])
                ->middleware(CheckPermission::class . ':export.transaksi')
                ->name('transaksi.export');

            // 📢 Pengumuman
            Route::resource('pengumuman', RwPengumumanController::class)
                ->except(['create', 'edit', 'show'])
                ->middleware(CheckPermission::class . ':view.pengumuman');

            Route::get('pengumuman/create', [RwPengumumanController::class, 'create'])
                ->middleware(CheckPermission::class . ':create.pengumuman')
                ->name('pengumuman.create');

            Route::get('pengumuman/{id}/edit', [RwPengumumanController::class, 'edit'])
                ->middleware(CheckPermission::class . ':edit.pengumuman')
                ->name('pengumuman.edit');

            Route::get('pengumuman/{id}/export-pdf', [RwPengumumanController::class, 'exportPDF'])
                ->middleware(CheckPermission::class . ':export.pengumuman')
                ->name('pengumuman.export.pdf');

            Route::post('pengumuman/{id}/komentar', [RwPengumumanController::class, 'komen'])
                ->middleware(CheckPermission::class . ':view.pengumuman')
                ->name('pengumuman.komentar.komen');

            // 📮 Pengaduan
            Route::get('pengaduan', [RwPengaduanController::class, 'index'])
                ->middleware(CheckPermission::class . ':view.pengaduan')
                ->name('pengaduan.index');

            Route::put('pengaduan/{id}/status', [RwPengaduanController::class, 'updateStatus'])
                ->middleware(CheckPermission::class . ':respond.pengaduan')
                ->name('pengaduan.updateStatus');

            Route::put('pengaduan/{id}/konfirmasi', [RwPengaduanController::class, 'updateKonfirmasi'])
                ->middleware(CheckPermission::class . ':confirm.pengaduan')
                ->name('pengaduan.updateKonfirmasi');

            Route::post('pengaduan/{id}/komentar', [RwPengaduanController::class, 'komen'])
                ->middleware(CheckPermission::class . ':view.pengaduan')
                ->name('pengaduan.komentar.komen');

            Route::post('pengaduan/{id}/baca', [RwPengaduanController::class, 'baca'])
                ->middleware(CheckPermission::class . ':view.pengaduan')
                ->name('pengaduan.baca');
        });

    /*
    |--------------------------------------------------------------------------
    | RT
    |--------------------------------------------------------------------------
    */
    Route::prefix('rt')
        ->name('rt.')
        ->middleware(['auth'])
        ->group(function () {

            // 📊 Analisis
            // Route::get('/analisis/keuangan', [AnalisisController::class, 'index'])
            //     ->middleware(CheckPermission::class . ':dashboard.rt')
            //     ->name('analisis.keuangan');
            // 
            // Route::get('/analisis/warga', [AnalisisController::class, 'index'])
            //     ->middleware(CheckPermission::class . ':dashboard.rt')
            //     ->name('analisis.warga');
            // 
            // 🧾 Kartu Keluarga (hanya index)
            Route::resource('kartu_keluarga', Rt_kartu_keluargaController::class)
                ->only(['index'])
                ->middleware(CheckPermission::class . ':view.kartu_keluarga');

            Route::put('kartu_keluarga/{rt_kartu_keluarga}/upload-foto', [Rt_kartu_keluargaController::class, 'uploadFoto'])
                ->middleware(CheckPermission::class . ':view.kartu_keluarga')
                ->name('kartu_keluarga.upload_foto');

            Route::delete('kartu_keluarga/{rt_kartu_keluarga}/delete-foto', [Rt_kartu_keluargaController::class, 'deleteFoto'])
                ->middleware(CheckPermission::class . ':view.kartu_keluarga')
                ->name('kartu_keluarga.delete_foto');

            Route::get('kartu_keluarga/{rt_kartu_keluarga}/upload-form', [Rt_kartu_keluargaController::class, 'uploadForm'])
                ->middleware(CheckPermission::class . ':view.kartu_keluarga')
                ->name('kartu_keluarga.upload_form');

            Route::get('/export/kartu_keluarga', [ExportController::class, 'exportDataKK'])
                // ->middleware(CheckPermission::class . ':export.kartu_keluarga')
                ->name('kartu_keluarga.export');

            // 📢 Pengumuman
            Route::resource('pengumuman', Rt_pengumumanController::class)
                ->middleware(CheckPermission::class . ':view.pengumuman');

            // kan pake modal, gk pake halaman lain
            // Route::get('pengumuman/create', [Rt_pengumumanController::class, 'create'])
            //     ->middleware(CheckPermission::class . ':create.pengumuman')
            //     ->name('pengumuman.create');

            // Route::get('pengumuman/{id}/edit', [Rt_pengumumanController::class, 'edit'])
            //     ->middleware(CheckPermission::class . ':edit.pengumuman')
            //     ->name('pengumuman.edit');

            // Route::delete('pengumuman/{id}', [Rt_pengumumanController::class, 'destroy'])
            //     ->middleware(CheckPermission::class . ':delete.pengumuman')
            //     ->name('pengumuman.destroy');

            Route::get('pengumuman/{id}/export-pdf', [Rt_pengumumanController::class, 'exportPDF'])
                ->middleware(CheckPermission::class . ':export.pengumuman')
                ->name('pengumuman.export.pdf');

            Route::post('pengumuman/{id}/komentar', [Rt_pengumumanController::class, 'komen'])
                ->middleware(CheckPermission::class . ':view.pengumuman')
                ->name('pengumuman.komentar.komen');


            // 💰 Iuran
            Route::resource('iuran', RtIuranController::class)
                ->except(['destroy', 'update'])
                ->middleware(CheckPermission::class . ':view.iuran');

            Route::delete('iuran/{id}/{jenis}', [RtIuranController::class, 'destroy'])
                ->middleware(CheckPermission::class . ':view.iuran')
                ->name('iuran.destroy');

            Route::put('iuran/{id}/{jenis}', [RtIuranController::class, 'update'])
                ->middleware(CheckPermission::class . ':view.iuran')
                ->name('iuran.update');

            Route::get('export/iuran', [ExportController::class, 'exportIuran'])
                ->middleware(CheckPermission::class . ':export.iuran')
                ->name('iuran.export');


            // 🧾 Tagihan
            Route::resource('tagihan', Rt_tagihanController::class)
                ->middleware(CheckPermission::class . ':view.tagihan');

            Route::get('export/tagihan', [ExportController::class, 'exportTagihan'])
                ->middleware(CheckPermission::class . ':export.tagihan')
                ->name('tagihan.export');


            // 👥 Warga (hanya index)
            Route::resource('warga', Rt_wargaController::class)
                ->only(['index'])
                ->middleware(CheckPermission::class . ':view.warga');

            Route::get('/export/warga', [ExportController::class, 'exportDataWarga'])
                // ->middleware(CheckPermission::class . ':export.warga')
                ->name('warga.export');

            // 💳 Transaksi
            Route::resource('transaksi', Rt_transaksiController::class)
                ->middleware(CheckPermission::class . ':view.transaksi');

            Route::get('export/transaksi', [ExportController::class, 'exportTransaksi'])
                ->middleware(CheckPermission::class . ':export.transaksi')
                ->name('transaksi.export');


            // 📮 Pengaduan
            Route::resource('pengaduan', Rt_PengaduanController::class)
                ->only(['index'])
                ->middleware(CheckPermission::class . ':view.pengaduan');

            Route::post('pengaduan/{id}/komentar', [Rt_PengaduanController::class, 'komen'])
                ->middleware(CheckPermission::class . ':respond.pengaduan')
                ->name('pengaduan.komentar.komen');

            Route::put('pengaduan/{id}/status', [Rt_PengaduanController::class, 'updateStatus'])
                ->middleware(CheckPermission::class . ':respond.pengaduan')
                ->name('pengaduan.updateStatus');

            Route::put('pengaduan/{id}/konfirmasi', [Rt_PengaduanController::class, 'updateKonfirmasi'])
                ->middleware(CheckPermission::class . ':respond.pengaduan')
                ->name('pengaduan.updateKonfirmasi');

            Route::post('pengaduan/{id}/baca', [Rt_PengaduanController::class, 'baca'])
                ->middleware(CheckPermission::class . ':view.pengaduan')
                ->name('pengaduan.baca');
        });
});
