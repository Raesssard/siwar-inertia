<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('iuran', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->integer('nominal')->nullable(); // hanya manual
            $table->date('tgl_tagih');
            $table->date('tgl_tempo');
            $table->enum('jenis', ['otomatis', 'manual']);

            // ⬇⬇ tambahan scope
            $table->enum('level', ['rt', 'rw']); 
            $table->unsignedBigInteger('id_rt')->nullable();
            $table->unsignedBigInteger('id_rw')->nullable();

            $table->foreign('id_rt')->references('id')->on('rt')->onDelete('cascade');
            $table->foreign('id_rw')->references('id')->on('rw')->onDelete('cascade');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('iuran');
    }
};
