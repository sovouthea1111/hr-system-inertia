<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use App\Models\Employee;
use App\Models\User;
use App\Traits\HasEmployee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class LeaveController extends Controller
{
    use HasEmployee;

    private const IMAGE_PATH = 'images';

    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 10);
        $allowedPerPage = [10, 25, 50, 100];
        if (!in_array($perPage, $allowedPerPage)) {
            $perPage = 10;
        }
        
        $user = Auth::user();
        $filters = $request->only(['employee_name', 'leave_type', 'status', 'start_date', 'end_date']);
        
        if ($user) {
            switch ($user->user_role) {
                case 'SuperAdmin':
                    if (empty($filters['status'])) {
                        $filters['status'] = 'pending';
                    }
                    break;
                    
                case 'HR':
                    $employeeIds = Employee::whereIn(
                        'email',
                        User::where('user_role', 'Employee')->pluck('email')
                    )->pluck('id');

                    if ($employeeIds->isNotEmpty()) {
                        $filters['employee_id'] = $employeeIds->toArray();
                    } else {
                        return $this->renderEmptyIndex($perPage, $filters);
                    }
                    break;
                    
                case 'Employee':
                    $employee = $this->getCurrentEmployee();
                    if ($employee) {
                        $filters['employee_id'] = $employee->id;
                    } else {
                        return $this->renderEmptyIndex($perPage, $filters);
                    }
                    break;
                    
                default:
                    return $this->renderEmptyIndex($perPage, $filters);
            }
        }
        
        try {
            $leaves = Leave::getFilteredLeaves($filters, $perPage);
            $leaves->getCollection()->transform(fn($leave) => $this->transformLeaveData($leave));
            return $this->renderIndexView($leaves, $filters);
        } catch (\Exception $e) {
            Log::error('Leave index failed', [
                'user_id' => $user->id ?? null,
                'error' => $e->getMessage()
            ]);
            return $this->renderEmptyIndex($perPage, $filters);
        }
    }

    public function hrLeave(Request $request)
    {
        if (!$this->isHR()) {
            return to_route('admin.dashboard')->with('error', 'You do not have permission to access this page.');
        }
        
        $employee = $this->getCurrentEmployee();
        if (!$employee) {
            if (Auth::user()->user_role === 'SuperAdmin') {
                return to_route('admin.leaves.index')->with('error', 'SuperAdmin does not have an employee record for "My Leaves". Please use Leave Management instead.');
            }
            return to_route('admin.dashboard')->with('error', 'Employee record not found for your account. You need an employee record with email ' . Auth::user()->email . ' to use "My Leaves".');
        }
        
        $perPage = $request->get('per_page', 10);
        $allowedPerPage = [10, 25, 50, 100];
        if (!in_array($perPage, $allowedPerPage)) {
            $perPage = 10;
        }
        $filters = $request->only(['employee_name', 'leave_type', 'status', 'start_date', 'end_date']);
        $filters['employee_id'] = $employee->id;

        try {
            $leaves = Leave::getFilteredLeaves($filters, $perPage);
            $leaves->getCollection()->transform(fn($leave) => $this->transformLeaveData($leave));
            
            return Inertia::render('Admin/LeaveApplications/HRIndex', [
                'leaveApplications' => $leaves,
                'filters' => $filters,
                'leaveTypes' => Leave::getLeaveTypes(),
                'statuses' => Leave::getStatuses(),
                'canManage' => true,
                'employees' => Employee::select('id', 'full_name', 'email')->where('id', $employee->id)->get(),
                'stats' => Leave::getLeaveStats($filters),
                'currentEmployee' => $employee,
            ]);
        } catch (\Exception $e) {
            Log::error('HR Leave view failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);
            return to_route('admin.dashboard')->with('error', 'Unable to load leave management. Please try again.');
        }
    }

    private function transformLeaveData($leave): array
    {
        return [
            'id' => $leave->id,
            'employee_id' => $leave->employee_id,
            'employee_name' => $leave->employee->full_name,
            'employee_email' => $leave->employee->email,
            'leave_type' => $leave->leave_type,
            'start_date' => $leave->start_date->format('Y-m-d'),
            'end_date' => $leave->end_date->format('Y-m-d'),
            'days_requested' => $leave->days_requested,
            'reason' => $leave->reason,
            'status' => $leave->status,
            'image' => $leave->image ? asset('images/' . $leave->image) : null,
            'applied_date' => $leave->created_at->format('Y-m-d'),
        ];
    }

    private function renderEmptyIndex($perPage, $filters): Response
    {
        $leaves = Leave::where('id', -1)->paginate($perPage);
        $leaves->getCollection()->transform(fn($leave) => $this->transformLeaveData($leave));
        return $this->renderIndexView($leaves, $filters);
    }

    private function renderIndexView($leaves, $filters): Response
    {
        return Inertia::render('Admin/LeaveApplications/Index', [
            'leaveApplications' => $leaves,
            'filters' => $filters,
            'leaveTypes' => Leave::getLeaveTypes(),
            'statuses' => Leave::getStatuses(),
            'canManage' => $this->isHR(),
            'employees' => Employee::select('id', 'full_name', 'email')->get(),
            'stats' => Leave::getLeaveStats($filters),
        ]);
    }
}
