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
        Schema::create('tagihan', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->decimal('nominal', 10, 2);
            $table->date('tgl_tagih');
            $table->date('tgl_tempo');
            $table->enum('jenis', ['otomatis', 'manual'])->default('manual');

            $table->char('no_kk', 16);
            $table->foreign('no_kk')->references('no_kk')->on('kartu_keluarga')->onDelete('cascade');

            $table->enum('status_bayar', ['sudah_bayar', 'belum_bayar'])->default('belum_bayar');
            $table->date('tgl_bayar')->nullable(); // dari dateTime diubah jadi date, biar bisa diambil sama si input date 👍👍👍
            $table->foreignId('id_iuran')->constrained('iuran')->onDelete('cascade');
            $table->enum('kategori_pembayaran',['transfer', 'tunai'])->nullable();
            $table->string('bukti_transfer')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tagihan');
    }
};
