<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rw', function (Blueprint $table) {
            $table->id();
            $table->char('no_kk', 16)->nullable(); 
            $table->char('nik', 16)->unique()->nullable();
            $table->string('nomor_rw');
            $table->string('nama_anggota_rw')->nullable();
            $table->date('mulai_menjabat')->nullable();
            $table->date('akhir_jabatan')->nullable();
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rw');
    }
};
