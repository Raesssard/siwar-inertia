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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->char('nik', 16)->unique();
            $table->string('nama');
            $table->string('nomor_rw')->nullable();

            // Relasi ke RT
            $table->unsignedBigInteger('id_rt')->nullable();
            $table->foreign('id_rt')
                ->references('id')
                ->on('rt')
                ->onDelete('cascade');

            // Relasi ke RW
            $table->unsignedBigInteger('id_rw')->nullable();
            $table->foreign('id_rw')
                ->references('id')
                ->on('rw')
                ->onDelete('cascade');

            $table->string('password');
            $table->rememberToken(); // supaya login via Auth jalan
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
