<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    
    public function up(): void
    {
        Schema::create('history_warga', function (Blueprint $table) {
            $table->id();
            $table->char('warga_nik', 16);
            $table->string('nama');
            $table->enum('jenis', ['masuk', 'keluar']);
            $table->text('keterangan')->nullable();
            $table->date('tanggal')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('history_warga');
    }
};
