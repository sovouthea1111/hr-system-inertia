<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Leave;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        
        // Route based on user role
        switch ($user->user_role) {
            case 'Employee':
                return $this->employeeDashboard();
            case 'HR':
            case 'SuperAdmin':
            default:
                return $this->hrDashboard();
        }
    }
    
    private function hrDashboard(): Response
    {
        $currentUser = Auth::user();
        $currentEmployee = Employee::where('email', $currentUser->email)->first();
        
        $pendingLeavesQuery = Leave::where('status', 'pending');
        $approvedLeavesQuery = Leave::where('status', 'approved');
        
        if ($currentEmployee) {
            $pendingLeavesQuery->where('employee_id', '!=', $currentEmployee->id);
            $approvedLeavesQuery->where('employee_id', '!=', $currentEmployee->id);
        }
        
        $stats = [
            'total_employees' => Employee::count(),
            'active_employees' => Employee::where('status', 'active')->count(),
            'pending_leaves' => $pendingLeavesQuery->count(),
            'approved_leaves' => $approvedLeavesQuery->count(),
            'total_users' => User::count(),
        ];
    
        $recentLeaveRequestsQuery = Leave::with('employee')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc');
        
        if ($currentEmployee) {
            $recentLeaveRequestsQuery->where('employee_id', '!=', $currentEmployee->id);
        }
        
        $recentLeaveRequests = $recentLeaveRequestsQuery
            ->take(5)
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => $leave->id,
                    'name' => $leave->employee ? $leave->employee->full_name : 'Unknown Employee',
                    'leaveType' => $leave->leave_type,
                    'duration' => $leave->days_requested . ' days',
                    'start_date' => $leave->start_date->format('Y-m-d'),
                    'reason' => $leave->reason,
                ];
            });
            
        $departmentStats = Employee::selectRaw('department, COUNT(*) as total, SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END) as active')
            ->groupBy('department')
            ->get()
            ->map(function ($dept) {
                $onLeaveCount = Leave::whereHas('employee', function ($query) use ($dept) {
                    $query->where('department', $dept->department);
                })
                ->where('status', 'approved')
                ->where('start_date', '<=', Carbon::now())
                ->where('end_date', '>=', Carbon::now())
                ->count();
                
                return [
                    'name' => $dept->department,
                    'total' => $dept->total,
                    'active' => $dept->active,
                    'on_leave' => $onLeaveCount,
                ];
            });
    
        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentLeaveRequests' => $recentLeaveRequests,
            'departmentStats' => $departmentStats,
        ]);
    }
    
    private function employeeDashboard(): Response
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
        $totalLeaveDays = 7;
        
        // Fix: Use raw SQL calculation instead of sum('days_requested')
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
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => $leave->id,
                    'leave_type' => ucfirst($leave->leave_type),
                    'start_date' => $leave->start_date->format('Y-m-d'),
                    'end_date' => $leave->end_date->format('Y-m-d'),
                    'days_requested' => $leave->days_requested,
                    'status' => $leave->status,
                    'reason' => $leave->reason,
                ];
            });

        // Upcoming approved leaves
        $upcomingLeaves = Leave::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->where('start_date', '>', Carbon::now())
            ->orderBy('start_date', 'asc')
            ->take(3)
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => $leave->id,
                    'leave_type' => ucfirst($leave->leave_type),
                    'start_date' => $leave->start_date->format('Y-m-d'),
                    'end_date' => $leave->end_date->format('Y-m-d'),
                    'days_requested' => $leave->days_requested,
                ];
            });

        return Inertia::render('Employee/Dashboard', [
            'employee' => $employee,
            'employeeData' => Employee::select('id', 'full_name', 'email')->get(),
            'leaveTypes' => $this->getLeaveTypes(),
            'leaveStats' => $leaveStats,
            'recentLeaves' => $recentLeaves,
            'upcomingLeaves' => $upcomingLeaves,
        ]);
    }

    /**
     * Get available leave types
     */
    private function getLeaveTypes(): array
    {
        return [
            ['value' => 'annual', 'label' => 'Annual Leave'],
            ['value' => 'sick', 'label' => 'Sick Leave'],
            ['value' => 'unpaid', 'label' => 'Unpaid Leave'],
            ['value' => 'maternity', 'label' => 'Maternity Leave'],
            ['value' => 'other', 'label' => 'Other Leave'],
        ];
    }
}