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
        Schema::table('pengaduan_komentar', function (Blueprint $table) {
            $table->string('role_snapshot')->nullable()->after('user_id');
        });
        Schema::table('pengumuman_komentar', function (Blueprint $table) {
            $table->string('role_snapshot')->nullable()->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

    }
};
