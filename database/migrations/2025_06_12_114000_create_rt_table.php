<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Jalankan migrasi tabel RT.
     */
    public function up(): void
    {
        Schema::create('rt', function (Blueprint $table) {
            $table->id();
            $table->char('no_kk', 16);
            $table->char('nik', 16)->unique();
            $table->string('nomor_rt', 3);
            $table->string('nama_ketua_rt');
            $table->date('mulai_menjabat');
            $table->date('akhir_jabatan');
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif'); // 🔹 status RT
            $table->unsignedBigInteger('id_rw'); // 🔹 wilayah RW administratif
            $table->foreign('id_rw')->references('id')->on('rw')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Batalkan migrasi tabel RT.
     */
    public function down(): void
    {
        Schema::dropIfExists('rt');
    }
};
