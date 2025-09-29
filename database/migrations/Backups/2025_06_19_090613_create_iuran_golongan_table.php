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
        Schema::create('iuran_golongan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_iuran')->constrained('iuran')->onDelete('cascade');
            $table->foreignId('id_golongan')->constrained('kategori_golongan')->onDelete('cascade');
            $table->integer('nominal');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iuran_golongan');
    }
};
