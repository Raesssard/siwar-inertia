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
        Schema::create('rt', function (Blueprint $table) {
            $table->id();
            $table->char('no_kk', 16);
            $table->char('nik', 16)->unique();
            $table->string('rt');
            $table->string('nama');
            $table->date('mulai_menjabat');
            $table->date('akhir_jabatan');
            $table->unsignedBigInteger('id_rw');
            $table->foreign('id_rw')->references('id')->on('rw')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rukun_tetangga');
    }
};
