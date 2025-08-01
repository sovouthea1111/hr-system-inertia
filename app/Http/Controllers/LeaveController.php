<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\LeaveApplicationNotification;

class LeaveController extends Controller
{
    /**
     * Display a listing of leave applications
     */
    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 10);
        $allowedPerPage = [10, 25, 50, 100];
        if (!in_array($perPage, $allowedPerPage)) {
            $perPage = 10;
        }
        
        $user = Auth::user();
        
        // Prepare filters from request
        $filters = $request->only(['employee_name', 'leave_type', 'status', 'start_date', 'end_date']);
        
        // Add role-based filtering
        if ($user && $user->user_role === 'Employee') {
            $employee = Employee::where('email', $user->email)->first();
            if ($employee) {
                $filters['employee_id'] = $employee->id;
            } else {
                $leaves = Leave::where('id', -1)->paginate($perPage);
                $leaves->getCollection()->transform(function ($leave) {
                    return $this->transformLeaveData($leave);
                });
                
                return $this->renderIndexView($leaves, $filters);
            }
        }
        $leaves = Leave::getFilteredLeaves($filters, $perPage);
        
        $leaves->getCollection()->transform(function ($leave) {
            return $this->transformLeaveData($leave);
        });
    
        return $this->renderIndexView($leaves, $filters);
    }

    /**
     * Transform leave data for frontend
     */
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

    /**
     * Render the index view with data
     */
    private function renderIndexView($leaves, $filters): Response
    {
        return Inertia::render('Admin/LeaveApplications/Index', [
            'leaveApplications' => $leaves,
            'filters' => $filters,
            'leaveTypes' => $this->getLeaveTypes(),
            'statuses' => $this->getStatuses(),
            'canManage' => Auth::check() && in_array(Auth::user()->user_role, ['HR', 'SuperAdmin']),
            'employees' => Employee::select('id', 'full_name', 'email')->get(),
        ]);
    }

    /**
     * Get leave statistics (new endpoint)
     */
    public function stats(Request $request): JsonResponse
    {
        $filters = $request->only(['employee_name', 'leave_type', 'status', 'start_date', 'end_date']);
        
        $user = Auth::user();
        if ($user && $user->user_role === 'Employee') {
            $employee = Employee::where('email', $user->email)->first();
            if ($employee) {
                $filters['employee_id'] = $employee->id;
            }
        }
        
        $stats = Leave::getLeaveStats($filters);
        
        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Show the form for creating a new leave application
     */
    public function create(): Response
    {
        return Inertia::render('Admin/LeaveApplications/Create', [
            'employees' => Employee::select('id', 'full_name', 'email')->get(),
            'leaveTypes' => $this->getLeaveTypes(),
        ]);
    }

    /**
     * Store a newly created leave application
     */
    public function store(Request $request)
    {
        $validationRules = [
            'employee_id' => 'required|exists:employees,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'leave_type' => ['required', Rule::in(['annual', 'sick', 'unpaid', 'maternity', 'other'])],
            'reason' => 'required|string|max:1000',
        ];

        if ($request->leave_type === 'sick') {
            $validationRules['image'] = 'required|image|mimes:jpeg,png,jpg,gif|max:2048';
        }

        $validatedData = $request->validate($validationRules);

        $startDate = new Carbon($validatedData['start_date']);
        $endDate = new Carbon($validatedData['end_date']);
        $leaveDays = $startDate->diffInDays($endDate) + 1;

        if ($validatedData['leave_type'] === 'annual' && $leaveDays > 7) {
            return back()
                ->withErrors(['end_date' => 'Annual leave cannot exceed 7 days.'])
                ->withInput();
        }

        if ($validatedData['leave_type'] === 'sick' && $leaveDays > 4) {
            return back()
                ->withErrors(['end_date' => 'Sick leave cannot exceed 4 days.'])
                ->withInput();
        }

        if ($validatedData['leave_type'] === 'maternity' && $leaveDays > 90) {
            return back()
                ->withErrors(['end_date' => 'Maternity leave cannot exceed 90 days.'])
                ->withInput();
        }

        try {
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $extension = $image->getClientOriginalExtension();
                $uniqueName = 'leave_' . $validatedData['employee_id'] . '_' . date('Y-m-d_H-i-s') . '_' . Str::random(8) . '.' . $extension;
                
                $destinationPath = public_path('images');
                if (!file_exists($destinationPath)) {
                    mkdir($destinationPath, 0755, true);
                }
                $image->move($destinationPath, $uniqueName);
                $validatedData['image'] = $uniqueName;
            }

            $leave = Leave::create($validatedData);
            
            $employee = Employee::find($validatedData['employee_id']);        
            $emailSent = false;
            try {
                if ($employee && $employee->email) {
                Mail::to(config('mail.from.address'))->send(new LeaveApplicationNotification($leave, $employee));
                $emailSent = true;

                }
            } catch (\Exception $mailException) {
                \Log::error('Failed to send leave notification email: ' . $mailException->getMessage());
            }

            $successMessage = 'Leave application created successfully.';
            if ($emailSent) {
                $successMessage .= ' Notification email sent.';
            } else {
                $successMessage .= ' (Email notification could not be sent)';
            }

        return redirect()->route('admin.leaves.index')->with([
            'success' => $successMessage,
        ]);

        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to create leave application: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified leave application in a standalone page
     */
    public function view(Leave $leave)
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }
        
        // Check permissions based on role
        if ($user->user_role === 'Employee') {
            $employee = Employee::where('email', $user->email)->first();
            if (!$employee || $leave->employee_id !== $employee->id) {
                return redirect()->route('admin.leaves.index')
                    ->with('error', 'You can only view your own leave applications.');
            }
        }
        
        // Get employee details
        $employee = Employee::findOrFail($leave->employee_id);
        
        // Transform leave data
        $leaveData = [
            'id' => $leave->id,
            'employee_id' => $leave->employee_id,
            'employee_name' => $employee->full_name,
            'employee_email' => $employee->email,
            'leave_type' => ucfirst($leave->leave_type) . ' Leave',
            'start_date' => $leave->start_date->format('Y-m-d'),
            'end_date' => $leave->end_date->format('Y-m-d'),
            'days_requested' => $leave->days_requested,
            'reason' => $leave->reason,
            'status' => $leave->status,
            'image' => $leave->image ? asset('images/' . $leave->image) : null,
            'applied_date' => $leave->created_at->format('Y-m-d'),
        ];
        
        // Mark notification as read if it exists
        if ($user->user_role === 'HR' || $user->user_role === 'SuperAdmin') {
            $leave->update(['hr_notification_read' => true]);
        } else if ($user->user_role === 'Employee' && $employee && $leave->employee_id === $employee->id) {
            $leave->update(['employee_notification_read' => true]);
        }
        
        return Inertia::render('Admin/LeaveApplications/ViewPage', [
            'leave' => $leaveData,
        ]);
    }

    /**
     * Show the form for editing the specified leave application
     */
    public function edit(Leave $leave): Response
    {
        $leave->load('employee');
        
        return Inertia::render('Admin/LeaveApplications/Edit', [
            'leave' => [
                'id' => $leave->id,
                'employee_id' => $leave->employee_id,
                'employee_name' => $leave->employee->full_name,
                'start_date' => $leave->start_date->format('Y-m-d'),
                'end_date' => $leave->end_date->format('Y-m-d'),
                'leave_type' => $leave->leave_type,
                'reason' => $leave->reason,
                'status' => $leave->status,
                'image' => $leave->image ? asset('images/' . $leave->image) : null,
            ],
            'employees' => Employee::select('id', 'full_name', 'email')->get(),
            'leaveTypes' => $this->getLeaveTypes(),
            'statuses' => $this->getStatuses(),
        ]);
    }

    /**
     * Update the specified leave application
     */
    public function update(Request $request, $id)
    {

        $validatedData = $request->validate(rules: [
            'employee_id' => 'required|exists:employees,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'leave_type' => ['required', Rule::in(['annual', 'sick', 'personal', 'unpaid', 'other',])],
            'status' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
            'reason' => 'required|string|max:1000',
        ]);
        try {
            Leave::where('id', operator:json_decode( $id))->update($validatedData);
            return redirect()->route('admin.leaves.index')->with([
                'success' => 'Leave application updated successfully.',
            ]);
        } catch (\Exception $e) {        
            return back()
                ->withErrors(['error' => 'Failed to update leave application: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Update only the status of the specified leave application
     */
    public function updateStatus(Request $request, Leave $leave)
    {
        $validatedData = $request->validate([
            'status' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
        ]);
        
        try {
            $leave->update([
                'status' => $validatedData['status']
            ]);
    
            return redirect()->route('admin.leaves.index')->with([
                'success' => true,
                'message' => 'Leave status updated successfully.',
                'data' => [
                    'id' => $leave->id,
                    'status' => $leave->status,
                ]
            ]);
        } catch (\Exception $e) {
            return redirect()->route('admin.leaves.index')->with([
                'success' => false,
                'message' => 'Failed to update leave status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified leave application
     */
    public function destroy($id) 
    {
        $user = Auth::user();
        if (!$user) {
            return back()->withErrors(['error' => 'Authentication required.']);
        }
        
        $leave = Leave::findOrFail($id);
        
        switch ($user->user_role) {
            case 'HR':
            case 'SuperAdmin':
                break;
            case 'Employee':
                $employee = Employee::where('email', $user->email)->first();
                if (!$employee || $leave->employee_id !== $employee->id || $leave->status !== 'pending') {
                    return back()->withErrors(['error' => 'You can only delete your own pending leave applications.']);
                }
                break;
                
            default:
                return back()->withErrors(['error' => 'You do not have permission to delete leave applications.']);
        }
        
        try {
            $leave->delete();
            return back()->with([
                'success' => 'Leave application deleted successfully.'
            ]);
        } catch (\Exception $e) {
            \Log::error('Leave deletion failed', [
                'leave_id' => $leave->id,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            return back()->withErrors([
                'error' => 'Failed to delete leave application: ' . $e->getMessage()
            ]);
        }
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

    /**
     * Get available statuses
     */
    private function getStatuses(): array
    {
        return [
            ['value' => 'pending', 'label' => 'Pending'],
            ['value' => 'approved', 'label' => 'Approved'],
            ['value' => 'rejected', 'label' => 'Rejected'],
        ];
    }
}
