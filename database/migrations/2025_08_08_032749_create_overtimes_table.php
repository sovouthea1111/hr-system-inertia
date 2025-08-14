<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('overtimes', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('employee_id')
                  ->constrained('employees')
                  ->onDelete('cascade');
                  
            $table->foreignId('approved_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
            
            $table->date('overtime_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->float('hours_worked');
            $table->decimal('hourly_rate', 8, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->enum('overtime_type', [
                'regular', 
                'weekend',
            ])->default('regular');
            $table->enum('status', ['pending', 'approved', 'rejected'])
                  ->default('pending');
            $table->longText('reason');
            $table->longText('rejection_reason')->nullable();
            
            $table->boolean('hr_notification_read')
                  ->default(false);                  
            $table->boolean('employee_notification_read')
                  ->default(false);            
            $table->timestamps();
            
            $table->index('overtime_date');
            $table->index('overtime_type');
            $table->index('status');
            $table->index(['status', 'hr_notification_read'], 'idx_status_hr_notification');
            $table->index(['employee_id', 'employee_notification_read'], 'idx_employee_notification');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('overtimes');
    }
};