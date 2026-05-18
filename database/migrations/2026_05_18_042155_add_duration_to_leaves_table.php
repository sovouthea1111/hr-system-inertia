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
        Schema::table('leaves', function (Blueprint $table) {
            $table->string('duration_type')->default('full_day')->after('end_date');
            $table->enum('half_day_period', ['am', 'pm'])->nullable()->after('duration_type');
            $table->boolean('is_last_day_half')->default(false)->after('half_day_period');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leaves', function (Blueprint $table) {
            $table->dropColumn(['duration_type', 'half_day_period', 'is_last_day_half']);
        });
    }
};
