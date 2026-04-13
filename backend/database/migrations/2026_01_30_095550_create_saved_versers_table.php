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
        Schema::create('saved_verses', function (Blueprint $table) {
            $table->id();
        
            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();
        
            // Verse identification (from API)
            $table->string('book');           // Genesis
            $table->unsignedSmallInteger('chapter'); // 1
            $table->unsignedSmallInteger('verse');   // 1
            $table->string('translation');    // NIV, KJV, ESV
        
            // User data
            $table->string('highlight_color')->nullable();
            $table->text('note')->nullable();
            $table->boolean('is_favorite')->default(false);
        
            $table->timestamps();
        
            // Prevent duplicates
            $table->unique([
                'user_id',
                'book',
                'chapter',
                'verse',
                'translation'
            ]);
        
            $table->index(['user_id', 'highlight_color']);
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saved_versers');
    }
};
