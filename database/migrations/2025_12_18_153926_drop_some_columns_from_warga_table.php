<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('warga', function (Blueprint $table) {

            // === DOKUMEN WNA ===
            $table->dropUnique(['no_paspor']);
            $table->dropColumn([
                'no_paspor',
                'tgl_terbit_paspor',
                'tgl_berakhir_paspor',
            ]);

            $table->dropUnique(['no_kitas']);
            $table->dropColumn([
                'no_kitas',
                'tgl_terbit_kitas',
                'tgl_berakhir_kitas',
            ]);

            $table->dropUnique(['no_kitap']);
            $table->dropColumn([
                'no_kitap',
                'tgl_terbit_kitap',
                'tgl_berakhir_kitap',
            ]);

            // === DATA ORANG TUA ===
            $table->dropColumn([
                'nama_ayah',
                'nama_ibu',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('warga', function (Blueprint $table) {

            // === DOKUMEN WNA ===
            $table->string('no_paspor')->nullable()->unique();
            $table->date('tgl_terbit_paspor')->nullable();
            $table->date('tgl_berakhir_paspor')->nullable();

            $table->string('no_kitas')->nullable()->unique();
            $table->date('tgl_terbit_kitas')->nullable();
            $table->date('tgl_berakhir_kitas')->nullable();

            $table->string('no_kitap')->nullable()->unique();
            $table->date('tgl_terbit_kitap')->nullable();
            $table->date('tgl_berakhir_kitap')->nullable();

            // === DATA ORANG TUA ===
            $table->string('nama_ayah');
            $table->string('nama_ibu');
        });
    }
};
