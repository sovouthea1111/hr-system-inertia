<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Leave;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class EmployeeDashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        
        // Get employee record
        $employee = Employee::where('email', $user->email)->first();
        
        if (!$employee) {
            return Inertia::render('Employee/Dashboard', [
                'error' => 'Employee record not found'
            ]);
        }

        // Calculate leave statistics
        $currentYear = Carbon::now()->year;
        $totalLeaveDays = 25; // Or fetch from employee record/policy
        
        // Fix: Calculate used leave days by getting the leaves and summing the accessor
        $approvedLeaves = Leave::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->whereYear('start_date', $currentYear)
            ->get();
            
        $usedLeaveDays = Leave::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->whereYear('start_date', $currentYear)
            ->selectRaw('SUM(DATEDIFF(end_date, start_date) + 1) as total_days')
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

        // Recent leave requests
        $recentLeaves = Leave::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Upcoming approved leaves
        $upcomingLeaves = Leave::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->where('start_date', '>', Carbon::now())
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