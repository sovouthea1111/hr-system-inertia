<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Leave;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'total_employees' => Employee::count(),
            'pending_leaves' => Leave::where('status', 'pending')->count(),
            'approved_leaves' => Leave::where('status', 'approved')->count(),
            'total_users' => User::count(),
        ];

        $recentLeaveRequests = Leave::with('employee')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => $leave->id,
                    'name' => $leave->employee->full_name,
                    'leaveType' => $leave->leave_type,
                    'duration' => $leave->days_requested . ' days',
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentLeaveRequests' => $recentLeaveRequests,
        ]);
    }
}