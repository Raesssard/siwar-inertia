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
        //
        Schema::table('warga', function (Blueprint $table) {
        $table->dropForeign(['no_kk']);
        $table->foreign('no_kk')
              ->references('no_kk')->on('kartu_keluarga')
              ->onUpdate('CASCADE')
              ->onDelete('RESTRICT');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
