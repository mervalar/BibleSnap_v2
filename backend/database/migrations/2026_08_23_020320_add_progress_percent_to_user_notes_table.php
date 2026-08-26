<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_notes', function (Blueprint $table) {
            $table->unsignedTinyInteger('progress_percent')->default(0)->nullable()->after('status');
        });

        DB::table('user_notes')->where('status', 'not_started')->update(['progress_percent' => 0]);
        DB::table('user_notes')->where('status', 'in_progress')->update(['progress_percent' => 50]);
        DB::table('user_notes')->where('status', 'completed')->update(['progress_percent' => 100]);
    }

    public function down(): void
    {
        Schema::table('user_notes', function (Blueprint $table) {
            $table->dropColumn('progress_percent');
        });
    }
};
