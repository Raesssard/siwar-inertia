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
            $table->char('nik', 16)->unique();
            $table->string('nomor_rw');
            $table->string('nama_ketua_rw');
            $table->date('mulai_menjabat');
            $table->date('akhir_jabatan');
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rw');
    }
};
