<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use App\Traits\HasEmployee;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class EmployeeDashboardController extends Controller
{
    use HasEmployee;

    public function index(): Response
    {
        $employee = $this->getCurrentEmployee();
        
        if (!$employee) {
            return Inertia::render('Employee/Dashboard', [
                'error' => 'Employee record not found'
            ]);
        }

        $currentYear = now()->year;
        $totalLeaveDays = 25;
        
        $sql = 'SUM(DATEDIFF(end_date, start_date) + 1)';

        $usedLeaveDays = Leave::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->whereYear('start_date', $currentYear)
            ->selectRaw($sql . ' as total_days')
            ->value('total_days') ?? 0;
            
        $pendingRequests = Leave::where('employee_id', $employee->id)
            ->where('status', 'pending')
            ->count();

        $leaveStats = [
            'total_leave_days' => $totalLeaveDays,
            'used_leave_days' => $usedLeaveDays,
            'remaining_leave_days' => $totalLeaveDays - $usedLeaveDays,
            'pending_requests' => $pendingRequests,
        ];

        $recentLeaves = Leave::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $upcomingLeaves = Leave::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->where('start_date', '>', now())
            ->orderBy('start_date', 'asc')
            ->take(3)
            ->get();

        return Inertia::render('Employee/Dashboard', [
            'employee' => $employee,
            'leaveStats' => $leaveStats,
            'recentLeaves' => $recentLeaves,
            'upcomingLeaves' => $upcomingLeaves,
        ]);
    }
}
