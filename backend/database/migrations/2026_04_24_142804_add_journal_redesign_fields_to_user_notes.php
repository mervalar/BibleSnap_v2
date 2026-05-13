<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_notes', function (Blueprint $table) {
            $table->text('soap_scripture')->nullable()->after('content');
            $table->text('soap_observation')->nullable()->after('soap_scripture');
            $table->text('soap_application')->nullable()->after('soap_observation');
            $table->text('soap_prayer')->nullable()->after('soap_application');
            $table->string('status', 20)->nullable()->after('soap_prayer');
            $table->boolean('is_answered')->default(false)->after('status');
            $table->text('answer_reason')->nullable()->after('is_answered');
        });
    }

    public function down(): void
    {
        Schema::table('user_notes', function (Blueprint $table) {
            $table->dropColumn([
                'soap_scripture', 'soap_observation', 'soap_application', 'soap_prayer',
                'status', 'is_answered', 'answer_reason',
            ]);
        });
    }
};
