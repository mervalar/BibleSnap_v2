<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
        {
            Schema::table('user_notes', function (Blueprint $table) {
                $table->foreignId('stark_id')->nullable()->change();
            });
        }

        public function down()
        {
            Schema::table('user_notes', function (Blueprint $table) {
                $table->foreignId('stark_id')->nullable(false)->change();
            });
        }
};
