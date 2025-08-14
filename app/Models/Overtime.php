<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Overtime extends Model
{
    protected $fillable = [
        'employee_id',
        'approved_by',
        'overtime_date',
        'start_time',
        'end_time',
        'hours_worked',
        'hourly_rate',
        'total_amount',
        'overtime_type',
        'status',
        'reason',
        'rejection_reason',
        'hr_notification_read',
        'employee_notification_read',
    ];
    
    protected $casts = [
        'overtime_date' => 'date:Y-m-d',
        'start_time' => 'string',
        'end_time' => 'string',
        'hours_worked' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'hr_notification_read' => 'boolean',
        'employee_notification_read' => 'boolean',
    ];

    // Relationships
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // Accessors
    public function getFormattedOvertimeDateAttribute()
    {
        return $this->overtime_date->format('Y-m-d');
    }

    public function getStatusBadgeAttribute()
    {
        return [
            'pending' => 'warning',
            'approved' => 'success',
            'rejected' => 'danger',
        ][$this->status] ?? 'secondary';
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeByEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('overtime_date', [$startDate, $endDate]);
    }

    // Calculate total amount automatically
    protected static function boot()
    {
        parent::boot();
        
        static::saving(function ($overtime) {
            $overtime->total_amount = $overtime->hours_worked * $overtime->hourly_rate;
        });
    }
}