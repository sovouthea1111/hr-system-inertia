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
            
            // Foreign key relationships
            $table->foreignId('employee_id')
                  ->constrained('employees')
                  ->onDelete('cascade');
                  
            $table->foreignId('approved_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
            
            // Leave details
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->enum('leave_type', [
                'annual', 
                'sick', 
                'personal', 
                'maternity', 
                'paternity', 
                'emergency'
            ]);
            $table->enum('status', ['pending', 'approved', 'rejected'])
                  ->default('pending');
            $table->longText('reason');
            
            // Notification tracking
            $table->boolean('hr_notification_read')
                  ->default(false);                  
            $table->boolean('employee_notification_read')
                  ->default(false);            
            $table->timestamps();
            
            // Indexes for performance optimization
            $table->index('start_date');
            $table->index('end_date');
            $table->index('leave_type');
            $table->index('status');
            $table->index(['status', 'hr_notification_read'], 'idx_status_hr_notification');
            $table->index(['employee_id', 'employee_notification_read'], 'idx_employee_notification');
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