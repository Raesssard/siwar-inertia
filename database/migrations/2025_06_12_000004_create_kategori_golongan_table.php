<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kategori_golongan', function (Blueprint $table) {
            $table->id();
            $table->enum('jenis', ['kampung','kavling','kost','kantor','kontrakan','umkm']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kategori_golongan');
    }
};
