<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Leave extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'start_date',
        'end_date',
        'leave_type',
        'reason',
        'status',
        'approved_by',
        'image',
        'hr_notification_read',
        'employee_notification_read'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'hr_notification_read' => 'boolean',
        'employee_notification_read' => 'boolean'
    ];

    // Add scopes for unread notifications
    public function scopeHrUnreadNotifications($query)
    {
        return $query->where('status', 'pending')
                     ->where('hr_notification_read', false);
    }

    public function scopeEmployeeUnreadNotifications($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId)
                     ->whereIn('status', ['approved', 'rejected'])
                     ->where('employee_notification_read', false);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeByLeaveType($query, $leaveType)
    {
        return $query->where('leave_type', $leaveType);
    }

    public function scopeByEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate]);
    }

    // Accessors
    public function getFormattedStartDateAttribute()
    {
        return $this->start_date->format('Y-m-d');
    }

    public function getFormattedEndDateAttribute()
    {
        return $this->end_date->format('Y-m-d');
    }

    public function getDaysRequestedAttribute()
    {
        if (!$this->start_date || !$this->end_date) {
            return 0;
        }
        return $this->start_date->diff($this->end_date)->days + 1;
    }

    public function getStatusBadgeAttribute()
    {
        return [
            'pending' => 'warning',
            'approved' => 'success',
            'rejected' => 'danger',
        ][$this->status] ?? 'secondary';
    }

    public function getLeaveTypeFormattedAttribute()
    {
        return ucfirst(str_replace('_', ' ', $this->leave_type));
    }

    /**
     * Get upcoming leaves
     */
    public static function getUpcomingLeaves($days = 7)
    {
        return static::with('employee')
            ->where('status', 'approved')
            ->where('start_date', '>=', now())
            ->where('start_date', '<=', now()->addDays($days))
            ->orderBy('start_date')
            ->get();
    }

    /**
     * Get employee's leave balance with detailed breakdown
     */
    public static function getEmployeeLeaveBalance($employeeId, $year = null)
    {
        $year = $year ?? now()->year;
        
        // Get approved leaves with more efficient query
        $approvedLeaves = static::where('employee_id', $employeeId)
            ->where('status', 'approved')
            ->whereYear('start_date', $year)
            ->selectRaw('leave_type, SUM(DATEDIFF(end_date, start_date) + 1) as total_days')
            ->groupBy('leave_type')
            ->pluck('total_days', 'leave_type');

        // Define default leave entitlements (consider moving to config)
        $leaveEntitlements = [
            'annual' => 7,
            'sick' => 4,
            'unpaid' => null,
            'maternity' => 90,
            'other' => null,
        ];

        // Calculate balance for each leave type
        $leaveBalance = collect($leaveEntitlements)->map(function ($entitlement, $leaveType) use ($approvedLeaves) {
            $used = $approvedLeaves->get($leaveType, 0);
            return [
                'entitlement' => $entitlement,
                'used' => $used,
                'remaining' => max(0, $entitlement - $used),
                'percentage_used' => $entitlement > 0 ? round(($used / $entitlement) * 100, 2) : 0
            ];
        });

        return $leaveBalance;
    }

    /**
     * Get simple used leave days by type (for backward compatibility)
     */
    public static function getUsedLeaveDays($employeeId, $year = null)
    {
        $year = $year ?? now()->year;
        
        return static::where('employee_id', $employeeId)
            ->where('status', 'approved')
            ->whereYear('start_date', $year)
            ->selectRaw('leave_type, SUM(DATEDIFF(end_date, start_date) + 1) as total_days')
            ->groupBy('leave_type')
            ->pluck('total_days', 'leave_type');
    }

    /**
     * Check if employee has overlapping leaves
     */
    public static function hasOverlappingLeaves($employeeId, $startDate, $endDate, $excludeId = null)
    {
        $query = static::where('employee_id', $employeeId)
            ->where('status', '!=', 'rejected')
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('start_date', [$startDate, $endDate])
                  ->orWhereBetween('end_date', [$startDate, $endDate])
                  ->orWhere(function ($q2) use ($startDate, $endDate) {
                      $q2->where('start_date', '<=', $startDate)
                         ->where('end_date', '>=', $endDate);
                  });
            });
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query->exists();
    }

    /**
     * Apply filters to the leave query
     */
    public function scopeFilter($query, array $filters)
    {
        return $query->when($filters['employee_name'] ?? null, function ($query, $employeeName) {
                $query->whereHas('employee', function ($q) use ($employeeName) {
                    $q->where('full_name', 'like', '%' . $employeeName . '%');
                });
            })
            ->when($filters['leave_type'] ?? null, function ($query, $leaveType) {
                $query->where('leave_type', $leaveType);
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($filters['start_date'] ?? null, function ($query, $startDate) {
                $query->where('start_date', '>=', $startDate);
            })
            ->when($filters['end_date'] ?? null, function ($query, $endDate) {
                $query->where('end_date', '<=', $endDate);
            })
            ->when($filters['employee_id'] ?? null, function ($query, $employeeId) {
                $query->where('employee_id', $employeeId);
            })
            ->when($filters['date_range'] ?? null, function ($query, $dateRange) {
                if (isset($dateRange['start']) && isset($dateRange['end'])) {
                    $query->whereBetween('start_date', [$dateRange['start'], $dateRange['end']])
                          ->orWhereBetween('end_date', [$dateRange['start'], $dateRange['end']]);
                }
            });
    }

    /**
     * Get leaves with advanced filtering
     */
    public static function getFilteredLeaves(array $filters = [], int $perPage = 10)
    {
        return static::with('employee')
            ->filter($filters)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get leave statistics
     */
    public static function getLeaveStats(array $filters = [])
    {
        $query = static::filter($filters);
        
        return [
            'total' => $query->count(),
            'pending' => (clone $query)->where('status', 'pending')->count(),
            'approved' => (clone $query)->where('status', 'approved')->count(),
            'rejected' => (clone $query)->where('status', 'rejected')->count(),
            'by_type' => (clone $query)->groupBy('leave_type')
                                      ->selectRaw('leave_type, count(*) as count')
                                      ->pluck('count', 'leave_type')
                                      ->toArray()
        ];
    }

    /**
     * Relationship to user who approved the leave
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get remaining leave balance for a specific leave type
     */
    public static function getRemainingBalance($employeeId, $leaveType, $year = null)
    {
        $balance = static::getEmployeeLeaveBalance($employeeId, $year);
        return $balance->get($leaveType, ['remaining' => 0])['remaining'];
    }

    /**
     * Check if employee can take leave (has sufficient balance)
     */
    public static function canTakeLeave($employeeId, $leaveType, $daysRequested, $year = null)
    {
        $remaining = static::getRemainingBalance($employeeId, $leaveType, $year);
        return $remaining >= $daysRequested;
    }
}