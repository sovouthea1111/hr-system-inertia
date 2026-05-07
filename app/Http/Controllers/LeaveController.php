<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use App\Models\Employee;
use App\Models\User;
use App\Traits\HasEmployee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\LeaveApplicationNotification;
use Barryvdh\DomPDF\Facade\Pdf;

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
            return $this->renderEmptyIndex($perPage, $filters);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'leave_type' => 'required|string',
            'reason' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '.' . $image->getClientOriginalExtension();
                $image->move(public_path(self::IMAGE_PATH), $imageName);
                $validated['image'] = $imageName;
            }

            $validated['status'] = 'pending';
            $leave = Leave::create($validated);

            try {
                $employee = Employee::find($validated['employee_id']);
                $superAdmin = User::where('user_role', 'SuperAdmin')->first();
                $hrEmails = User::where('user_role', 'HR')->pluck('email')->toArray();

                if ($superAdmin) {
                    $mail = Mail::to($superAdmin->email);
                    if (!empty($hrEmails)) {
                        $mail->cc($hrEmails);
                    }
                    $mail->send(new LeaveApplicationNotification($leave, $employee));
                }
            } catch (\Exception $mailException) {
            }

            return back()->with('success', 'Leave request submitted successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to submit leave request. Please try again.']);
        }
    }

    public function exportPDF(Request $request)
    {
        $user = Auth::user();
        $filters = $request->only(['employee_name', 'leave_type', 'status', 'start_date', 'end_date']);
        
        if ($user->user_role === 'Employee') {
            $employee = $this->getCurrentEmployee();
            if ($employee) {
                $filters['employee_id'] = $employee->id;
            }
        } elseif ($user->user_role === 'HR') {
            // If it's "My Leaves" for HR, we should use their employee ID
            // If it's the general Leave Management, we should show all.
            // For now, let's assume this is for the current view's data.
            if ($request->has('my_leaves')) {
                $employee = $this->getCurrentEmployee();
                if ($employee) {
                    $filters['employee_id'] = $employee->id;
                }
            }
        }

        $leaves = Leave::with('employee')
            ->where('status', 'approved')
            ->when(!empty($filters['employee_id']), function($query) use ($filters) {
                if (is_array($filters['employee_id'])) {
                    $query->whereIn('employee_id', $filters['employee_id']);
                } else {
                    $query->where('employee_id', $filters['employee_id']);
                }
            })
            ->when(!empty($filters['leave_type']), fn($q) => $q->where('leave_type', $filters['leave_type']))
            ->when(!empty($filters['start_date']), fn($q) => $q->where('start_date', '>=', $filters['start_date']))
            ->when(!empty($filters['end_date']), fn($q) => $q->where('end_date', '<=', $filters['end_date']))
            ->orderBy('created_at', 'desc')
            ->get();

        $pdf = Pdf::loadView('pdf.leaves', [
            'leaves' => $leaves,
            'title' => ($request->has('my_leaves') || $user->user_role === 'Employee') ? 'My Leave Report' : 'Leave Management Report',
            'date' => now()->format('Y-m-d H:i:s'),
            'user' => $user
        ]);

        return $pdf->download('leave-report-' . now()->format('YmdHis') . '.pdf');
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
            return to_route('admin.dashboard')->with('error', 'Unable to load leave management. Please try again.');
        }
    }

    public function view(Leave $leave)
    {
        return response()->json([
            'success' => true,
            'data' => $this->transformLeaveData($leave->load('employee'))
        ]);
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
