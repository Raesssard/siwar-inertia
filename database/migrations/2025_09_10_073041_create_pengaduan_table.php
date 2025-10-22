<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pengaduan', function (Blueprint $table) {
            $table->id();
            $table->char('nik_warga', 16);
            $table->string('judul');
            $table->string('isi');
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->enum('status', ['belum', 'diproses', 'selesai']);
            $table->enum('level', ['rt', 'rw']);
            $table->enum('konfirmasi_rw', ['belum', 'menunggu', 'sudah']);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('nik_warga')->references('nik')->on('warga')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengaduan');
    }
};
