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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('full_name')->index(); 
            $table->string('phone')->nullable(); 
            $table->string('department')->index(); 
            $table->string('position')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active')->index();
            $table->string('email')->unique()->index(); 
            $table->dateTime('joint_date')->index(); 
            $table->timestamps();
            $table->softDeletes();
            $table->index(['department', 'status']); 
            $table->index(['status', 'joint_date']); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};