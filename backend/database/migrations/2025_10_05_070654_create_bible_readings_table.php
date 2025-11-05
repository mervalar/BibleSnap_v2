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
    Schema::create('bible_readings', function (Blueprint $table) {
        $table->id();
        $table->integer('day')->nullable();
        $table->string('title')->nullable();
        $table->json('books')->nullable();
        $table->text('explanation')->nullable();
        $table->text('challenge')->nullable();
        $table->string('next_title')->nullable();
        $table->string('theme')->nullable();
        $table->string('reading_time_estimate')->nullable();
        $table->json('verse_reference')->nullable();
        $table->json('tags')->nullable();
        $table->integer('section_id')->nullable();
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bible_readings');
    }
};
