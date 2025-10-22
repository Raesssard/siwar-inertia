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
        Schema::create('kartu_keluarga', function (Blueprint $table) {
            $table->id(); // id sebagai primary key baru

            $table->char('no_kk', 16)->unique(); // tetap ada & unique
            $table->string('no_registrasi')->unique(); 
            $table->text('alamat');
            $table->unsignedBigInteger('id_rt')->nullable(); 
            $table->unsignedBigInteger('id_rw')->nullable(); 

            $table->foreign('id_rt')->references('id')->on('rt')->onDelete('set null');
            $table->foreign('id_rw')->references('id')->on('rw')->onDelete('set null');

            $table->string('kelurahan');
            $table->string('kecamatan');
            $table->string('kabupaten');
            $table->string('provinsi');
            $table->string('kode_pos');
            $table->date('tgl_terbit');

            $table->foreignId('kategori_iuran')
                ->constrained('kategori_golongan')
                ->cascadeOnDelete();

            $table->string('instansi_penerbit')->nullable();
            $table->string('kabupaten_kota_penerbit')->nullable();
            $table->string('nama_kepala_dukcapil')->nullable();
            $table->string('nip_kepala_dukcapil')->nullable();
            $table->string('foto_kk')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kartu_keluarga');
    }
};
