<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use function Laravel\Prompts\text;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pengumuman', function (Blueprint $table) {
            $table->id();
            $table->string('judul');
            $table->string('kategori');
            $table->text('isi');
            $table->dateTime('tanggal');
            $table->string('dokumen_path')->nullable(); // Path dokumen
            $table->string('dokumen_name')->nullable(); // Nama asli dokumen (opsional)
            $table->foreignId('id_rw')->nullable()->constrained('rw')->onDelete('cascade');
            $table->foreignId('id_rt')->nullable()->constrained('rukun_tetangga')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengumuman');
    }
};
