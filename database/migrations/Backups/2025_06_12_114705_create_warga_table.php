<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warga', function (Blueprint $table) {
            $table->char('nik', 16)->primary(); 
            $table->char('no_kk', 16);

            $table->foreign('no_kk')
                ->references('no_kk')
                ->on('kartu_keluarga')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->string('nama');
            $table->enum('jenis_kelamin', ['laki-laki', 'perempuan']);
            $table->string('tempat_lahir');
            $table->date('tanggal_lahir');
            $table->string('agama');
            $table->string('pendidikan');
            $table->string('pekerjaan');
            $table->enum('status_perkawinan', ['belum menikah', 'menikah', 'cerai_hidup', 'cerai_mati']);
            $table->enum('status_hubungan_dalam_keluarga', ['kepala keluarga', 'istri', 'anak']);

            $table->enum('golongan_darah', ['A', 'B', 'AB', 'O'])->nullable();
            $table->enum('kewarganegaraan', ['WNI', 'WNA']);

            // --- Penambahan Kolom untuk WNA ---
            $table->string('no_paspor')->nullable()->unique();
            $table->date('tgl_terbit_paspor')->nullable();
            $table->date('tgl_berakhir_paspor')->nullable();

            $table->string('no_kitas')->nullable()->unique();
            $table->date('tgl_terbit_kitas')->nullable();
            $table->date('tgl_berakhir_kitas')->nullable();

            $table->string('no_kitap')->nullable()->unique();
            $table->date('tgl_terbit_kitap')->nullable();
            $table->date('tgl_berakhir_kitap')->nullable();
            // --- Akhir Penambahan ---

            $table->string('nama_ayah');
            $table->string('nama_ibu');
            $table->enum('status_warga', ['penduduk', 'pendatang']);

            // --- Tambahan khusus untuk pendatang ---
            $table->string('alamat_asal')->nullable(); // alamat sebelum pindah
            $table->string('alamat_domisili')->nullable(); // alamat tempat tinggal di sini
            $table->date('tanggal_mulai_tinggal')->nullable(); // sejak kapan tinggal di wilayah ini
            $table->string('tujuan_pindah')->nullable(); // alasan datang (kerja, sekolah, dll.)
            // --- Akhir tambahan ---

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warga');
    }
};
