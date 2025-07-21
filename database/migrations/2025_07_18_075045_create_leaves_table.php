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
        Schema::create('leaves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->dateTime('start_date')->index();
            $table->dateTime('end_date')->index();
            $table->enum('leave_type', ['annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency'])->index();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->index();
            $table->longText('reason');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['employee_id', 'status']);
            $table->index(['start_date', 'end_date']);
            $table->index(['leave_type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leaves');
    }
};