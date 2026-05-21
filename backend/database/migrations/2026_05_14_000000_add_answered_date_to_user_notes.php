<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_notes', function (Blueprint $table) {
            $table->date('answered_date')->nullable()->after('answer_reason');
        });
    }

    public function down(): void
    {
        Schema::table('user_notes', function (Blueprint $table) {
            $table->dropColumn('answered_date');
        });
    }
};
