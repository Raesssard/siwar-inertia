<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warga', function (Blueprint $table) {
            $table->id(); // id sebagai primary key baru

            $table->char('nik', 16)->unique(); // tetap ada & unique
            $table->char('no_kk', 16); // tetap ada

            $table->foreign('no_kk')
                ->references('no_kk')
                ->on('kartu_keluarga')
                ->onUpdate('cascade')
                ->onDelete('restrict');

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

            $table->string('no_paspor')->nullable()->unique();
            $table->date('tgl_terbit_paspor')->nullable();
            $table->date('tgl_berakhir_paspor')->nullable();

            $table->string('no_kitas')->nullable()->unique();
            $table->date('tgl_terbit_kitas')->nullable();
            $table->date('tgl_berakhir_kitas')->nullable();

            $table->string('no_kitap')->nullable()->unique();
            $table->date('tgl_terbit_kitap')->nullable();
            $table->date('tgl_berakhir_kitap')->nullable();

            $table->string('nama_ayah');
            $table->string('nama_ibu');
            $table->enum('status_warga', ['penduduk', 'pendatang']);

            $table->string('alamat_asal')->nullable();
            $table->string('alamat_domisili')->nullable();
            $table->date('tanggal_mulai_tinggal')->nullable();
            $table->string('tujuan_pindah')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warga');
    }
};
