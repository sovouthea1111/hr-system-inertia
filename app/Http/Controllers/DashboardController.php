<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Leave;
use App\Models\User;
use App\Traits\HasEmployee;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    use HasEmployee;

    public function index(): Response
    {
        $user = Auth::user();
        
        return match ($user->user_role) {
            'Employee' => $this->employeeDashboard(),
            default => $this->hrDashboard(),
        };
    }
    
    private function hrDashboard(): Response
    {
        $currentEmployee = $this->getCurrentEmployee();
        
        $pendingLeavesQuery = Leave::where('status', 'pending');
        $approvedLeavesQuery = Leave::where('status', 'approved');
        
        if ($currentEmployee) {
            $pendingLeavesQuery->where('employee_id', '!=', $currentEmployee->id);
            $approvedLeavesQuery->where('employee_id', '!=', $currentEmployee->id);
        }
        
        $stats = [
            'total_employees' => Employee::count(),
            'active_employees' => Employee::active()->count(),
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
            ->map(fn($leave) => [
                'id' => $leave->id,
                'name' => $leave->employee?->full_name ?? 'Unknown Employee',
                'leaveType' => $leave->leave_type,
                'duration' => $leave->duration_type === 'half_day' ? 'Half Day' : $leave->days_requested . ' days',
                'start_date' => $leave->start_date->format('Y-m-d'),
                'reason' => $leave->reason,
            ]);
            
        $departmentStats = Employee::selectRaw('department, COUNT(*) as total, SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END) as active')
            ->groupBy('department')
            ->get()
            ->map(function ($dept) {
                $onLeaveCount = Leave::whereHas('employee', fn($query) => $query->where('department', $dept->department))
                    ->where('status', 'approved')
                    ->where('start_date', '<=', now())
                    ->where('end_date', '>=', now())
                    ->count();
                
                return [
                    'name' => $dept->department,
                    'total' => $dept->total,
                    'active' => $dept->active,
                    'on_leave' => $onLeaveCount,
                ];
            });

        $onLeaveSummary = Leave::with('employee')
            ->where('status', 'approved')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->orderBy('start_date', 'asc')
            ->get()
            ->map(fn($leave) => [
                'id' => $leave->id,
                'name' => $leave->employee?->full_name ?? 'Unknown Employee',
                'department' => $leave->employee?->department ?? 'N/A',
                'leave_type' => ucfirst($leave->leave_type),
                'start_date' => $leave->start_date->format('Y-m-d'),
                'end_date' => $leave->end_date->format('Y-m-d'),
            ]);
    
        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentLeaveRequests' => $recentLeaveRequests,
            'departmentStats' => $departmentStats,
            'onLeaveSummary' => $onLeaveSummary,
        ]);
    }
    
    private function employeeDashboard(): Response
    {
        $employee = $this->getCurrentEmployee();
        
        if (!$employee) {
            return Inertia::render('Employee/Dashboard', [
                'error' => 'Employee record not found'
            ]);
        }

        $currentYear = now()->year;
        $leaveBalance = Leave::getEmployeeLeaveBalance($employee->id, $currentYear);
        
        $annualBalance = $leaveBalance->get('annual', [
            'entitlement' => 0,
            'used' => 0,
            'remaining' => 0
        ]);
            
        $pendingRequests = Leave::where('employee_id', $employee->id)
            ->where('status', 'pending')
            ->count();

        $leaveStats = [
            'total_leave_days' => $annualBalance['entitlement'],
            'used_leave_days' => $annualBalance['used'],
            'remaining_leave_days' => $annualBalance['remaining'],
            'pending_requests' => $pendingRequests,
        ];

        $recentLeaves = Leave::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(fn($leave) => [
                'id' => $leave->id,
                'leave_type' => ucfirst($leave->leave_type),
                'start_date' => $leave->start_date->format('Y-m-d'),
                'end_date' => $leave->end_date->format('Y-m-d'),
                'days_requested' => $leave->duration_type === 'half_day' ? 'Half Day' : $leave->days_requested,
                'status' => $leave->status,
                'reason' => $leave->reason,
            ]);

        $upcomingLeaves = Leave::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->where('start_date', '>', now())
            ->orderBy('start_date', 'asc')
            ->take(4)
            ->get()
            ->map(fn($leave) => [
                'id' => $leave->id,
                'leave_type' => ucfirst($leave->leave_type),
                'start_date' => $leave->start_date->format('Y-m-d'),
                'end_date' => $leave->end_date->format('Y-m-d'),
                'days_requested' => $leave->duration_type === 'half_day' ? 'Half Day' : $leave->days_requested,
            ]);

        $onLeaveSummary = Leave::with('employee')
            ->where('status', 'approved')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->orderBy('start_date', 'asc')
            ->get()
            ->map(fn($leave) => [
                'id' => $leave->id,
                'name' => $leave->employee?->full_name ?? 'Unknown Employee',
                'department' => $leave->employee?->department ?? 'N/A',
                'leave_type' => ucfirst($leave->leave_type),
                'start_date' => $leave->start_date->format('Y-m-d'),
                'end_date' => $leave->end_date->format('Y-m-d'),
            ]);

        return Inertia::render('Employee/Dashboard', [
            'employee' => $employee,
            'employeeData' => Employee::select('id', 'full_name', 'email', 'joint_date')->get(),
            'leaveTypes' => Leave::getLeaveTypes(),
            'leaveStats' => $leaveStats,
            'leaveBalance' => $leaveBalance,
            'recentLeaves' => $recentLeaves,
            'upcomingLeaves' => $upcomingLeaves,
            'onLeaveSummary' => $onLeaveSummary,
        ]);
    }
}
