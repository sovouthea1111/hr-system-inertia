<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Overtime;
use App\Models\User;
use App\Mail\OvertimeNotification;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OvertimeController extends Controller
{
    /**
     * Display the overtime management page for admin/HR
     */
   public function index(Request $request): Response
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 10);
        $allowedPerPage = [10, 25, 50, 100];
        
        if (!in_array($perPage, $allowedPerPage)) {
            $perPage = 10;
        }

        $filters = $request->only(['employee_name', 'status', 'overtime_type', 'start_date', 'end_date']);

        $query = Overtime::with(['employee:id,full_name,email,department', 'reviewer:id,name'])
            ->latest();

        if (empty($filters['start_date']) && empty($filters['end_date'])) {
            $query->whereYear('overtime_date', Carbon::now()->year)
                ->whereMonth('overtime_date', Carbon::now()->month);
        } else {
            if (!empty($filters['start_date'])) {
                $query->where('overtime_date', '>=', $filters['start_date']);
            }

            if (!empty($filters['end_date'])) {
                $query->where('overtime_date', '<=', $filters['end_date']);
            }
        }

        if (!empty($filters['employee_name'])) {
            $query->whereHas('employee', function ($q) use ($filters) {
                $q->where('full_name', 'like', '%' . $filters['employee_name'] . '%');
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['overtime_type'])) {
            $query->where('overtime_type', $filters['overtime_type']);
        }

        if ($user->user_role === 'Employee') {
            $employee = Employee::where('email', $user->email)->first();
            if ($employee) {
                $query->where('employee_id', $employee->id);
            } else {
                return Inertia::render('Admin/Overtime/Index', [
                    'overtimes' => ['data' => [], 'links' => [], 'meta' => null],
                    'filters' => $filters,
                    'employees' => [],
                    'overtimeTypes' => $this->getOvertimeTypesForSelect(),
                    'currentMonth' => Carbon::now()->format('Y-m'),
                    'currentMonthName' => Carbon::now()->format('F Y'),
                    'error' => 'Employee record not found. Please contact HR.'
                ]);
            }
        }

        $overtimes = $query->paginate($perPage);
        
        $overtimes->getCollection()->transform(function ($overtime) {
            $baseAmount = $overtime->total_amount ?? ($overtime->hours_worked * ($overtime->hourly_rate ?? 0));
            $multiplier = 1;
            
            switch ($overtime->overtime_type) {
                case 'weekend':
                    $multiplier = 2.0;
                    break;
                case 'regular':
                    $multiplier = 1.5;
                    break;
                default:
                    $multiplier = 1.5;
            }
            
            $finalAmount = $baseAmount * $multiplier;
            
            return [
                'id' => $overtime->id,
                'employee' => [
                    'id' => $overtime->employee->id,
                    'full_name' => $overtime->employee->full_name,
                    'email' => $overtime->employee->email,
                    'department' => $overtime->employee->department ?? 'N/A',
                ],
                'overtime_date' => $overtime->overtime_date,
                'start_time' => $overtime->start_time,
                'end_time' => $overtime->end_time,
                'hours_worked' => $overtime->hours_worked,
                'hourly_rate' => $overtime->hourly_rate ?? 0,
                'total_amount' => $finalAmount,
                'overtime_type' => $overtime->overtime_type,
                'status' => $overtime->status,
                'reason' => $overtime->reason,
                'reviewer' => $overtime->reviewer ? [
                    'id' => $overtime->reviewer->id,
                    'name' => $overtime->reviewer->name,
                ] : null,
                'created_at' => $overtime->created_at,
            ];
        });
        
        $employees = [];
        if ($this->canManageOvertime()) {
            $employees = Employee::select('id', 'full_name', 'email')
                ->orderBy('full_name')
                ->get()
                ->toArray();
        }

        $totalRecords = $overtimes->total();
        $totalHours = $overtimes->getCollection()->sum('hours_worked');
        $totalAmount = $overtimes->getCollection()->sum('total_amount');

        return Inertia::render('Admin/Overtime/Index', [
            'overtimes' => $overtimes,
            'filters' => $filters,
            'employees' => $employees,
            'overtimeTypes' => $this->getOvertimeTypesForSelect(),
            'currentMonth' => Carbon::now()->format('Y-m'),
            'currentMonthName' => Carbon::now()->format('F Y'),
            'statistics' => [
                'total_records' => $totalRecords,
                'total_hours' => $totalHours,
                'total_amount' => $totalAmount,
            ],
            'isCurrentMonthView' => empty($filters['start_date']) && empty($filters['end_date']),
        ]);
    }

    /**
     * Get overtime types for select dropdown
     */
    private function getOvertimeTypesForSelect(): array
    {
        $user = Auth::user();
        $employee = Employee::where("email", $user->email)->first();
        
        $price = 0;
        
        if ($employee) {
            $monthlyOT = 26;
            $dayOT = 8;
            $basicOT = $employee->salary / $monthlyOT;
            $price = $basicOT / $dayOT;
        }

        $overtimePrice = round($price, 2);
        
        return [
            ['value' => 'regular', 'label' => 'Regular Overtime', 'price' => $overtimePrice],
            ['value' => 'weekend', 'label' => 'Weekend Overtime', 'price' => $overtimePrice],
        ];
    }

    /**
     * Store a new overtime record
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $employee = Employee::where('email', $user->email)->first();
        
        if (!$employee) {
            return Redirect::back()->withErrors([
                'employee' => 'Employee record not found. Please contact HR.'
            ]);
        }

        $validatedData = $request->validate([
            'overtime_type' => [
                'required',
                'string',
                Rule::in(['regular', 'weekend'])
            ],
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'overtime_date' => 'required|date|before_or_equal:today',
            'reason' => 'required|string|max:500',
            'hourly_rate' => 'required|numeric|min:0'
        ]);

        try {
            $startTime = $this->parseTime($validatedData['start_time']);
            $endTime = $this->parseTime($validatedData['end_time']);
            
            if ($endTime->lt($startTime)) {
                $endTime->addDay();
            }
            
            $totalHours = $startTime->diffInHours($endTime, true);
            
            if ($totalHours <= 0) {
                return Redirect::back()->withErrors([
                    'time' => 'End time must be after start time.'
                ]);
            }

            Overtime::create([
                'employee_id' => $employee->id,
                'overtime_type' => $validatedData['overtime_type'],
                'start_time' => $startTime->format('H:i:s'),
                'end_time' => $endTime->format('H:i:s'),
                'overtime_date' => $validatedData['overtime_date'],
                'hours_worked' => $totalHours,
                'reason' => $validatedData['reason'],
                'status' => 'pending',
                'hourly_rate' => $validatedData['hourly_rate'],
                'total_amount' => $totalHours * $validatedData['hourly_rate']
            ]);

            return Redirect::back()->with('success', 'Overtime request submitted successfully!');

        } catch (\Exception $e) {
            Log::error('Overtime creation failed: ' . $e->getMessage());
            return Redirect::back()->withErrors([
                'error' => 'Failed to submit overtime request. Please try again.'
            ]);
        }
    }

    /**
     * Update overtime status (HR/Admin only)
     */
    public function updateStatus(Request $request, Overtime $overtime): RedirectResponse
    {
        if (!$this->canManageOvertime()) {
            return $this->redirectWithError('You are not authorized to perform this action.');
        }

        $validatedData = $request->validate([
            'status' => ['required', Rule::in(['approved', 'rejected'])],
            'hr_comments' => 'nullable|string|max:500'
        ]);

        $overtime->update([
            'status' => $validatedData['status'],
            'hr_comments' => $validatedData['hr_comments'] ?? null,
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now()
        ]);

        return Redirect::back()->with('success', 'Overtime status updated successfully!');
    }

    /**
     * Update overtime record (full update)
     */
    public function update(Request $request, Overtime $overtime): RedirectResponse
    {
        $employee = $this->getCurrentEmployee();
        $canEdit = $this->canManageOvertime() || 
                ($employee && $overtime->employee_id === $employee->id && $overtime->status === 'pending');
        
        if (!$canEdit) {
            return $this->redirectWithError('You are not authorized to update this overtime record.');
        }

        $validatedData = $request->validate([
            'overtime_date' => 'required|date|before_or_equal:today',
            'start_time' => 'required|string',
            'end_time' => 'required|string',   
            'overtime_type' => 'required|in:regular,weekend,holiday,emergency',
            'reason' => 'required|string|max:1000',
            'hourly_rate' => 'required|numeric|min:0'
        ]);

        try {
            $startTime = $this->parseTime($validatedData['start_time']);
            $endTime = $this->parseTime($validatedData['end_time']);

            if ($endTime->lessThan($startTime)) {
                $endTime->addDay();
            }

            $totalHours = $startTime->diffInHours($endTime, true);
            $totalAmount = $totalHours * $validatedData['hourly_rate'];

            $overtime->update([
                'overtime_date' => $validatedData['overtime_date'],
                'start_time' => $startTime->format('H:i:s'),
                'end_time' => $endTime->format('H:i:s'),
                'overtime_type' => $validatedData['overtime_type'],
                'reason' => $validatedData['reason'],
                'hourly_rate' => $validatedData['hourly_rate'],
                'hours_worked' => $totalHours,
                'total_amount' => $totalAmount
            ]);

            return Redirect::back()->with('success', 'Overtime record updated successfully!');
            
        } catch (\Exception $e) {
            Log::error('Overtime update failed: ' . $e->getMessage());
            return Redirect::back()->withErrors([
                'error' => 'Failed to update overtime record. Please try again.'
            ]);
        }
    }

    /**
     * Delete overtime record
     */
    public function destroy(Overtime $overtime): RedirectResponse
    {
        if (!$this->canDeleteOvertime($overtime)) {
            return $this->redirectWithError('You are not authorized to delete this overtime record.');
        }

        $overtime->delete();

        return Redirect::back()->with('success', 'Overtime record deleted successfully!');
    }

    /**
     * Parse time string with fallback formats
     */
    private function parseTime(string $timeString): Carbon
    {
        try {
            return Carbon::createFromFormat('H:i:s', $timeString);
        } catch (\Exception $e) {
            try {
                return Carbon::createFromFormat('H:i', $timeString);
            } catch (\Exception $e) {
                throw new \InvalidArgumentException('Invalid time format: ' . $timeString);
            }
        }
    }

    /**
     * Get current authenticated employee
     */
    private function getCurrentEmployee(): ?Employee
    {
        $user = Auth::user();
        
        if (!$user) {
            return null;
        }

        return Employee::where('email', $user->email)->first();
    }

    /**
     * Check if current user can manage overtime
     */
    private function canManageOvertime(): bool
    {
        $user = Auth::user();
        return $user && in_array($user->user_role, ['HR', 'SuperAdmin']);
    }

    /**
     * Check if current user can delete specific overtime
     */
    private function canDeleteOvertime(Overtime $overtime): bool
    {
        if ($this->canManageOvertime()) {
            return true;
        }

        $employee = $this->getCurrentEmployee();
        return $employee && $overtime->employee_id === $employee->id;
    }

    /**
     * Redirect with error message
     */
    private function redirectWithError(string $message): RedirectResponse
    {
        return Redirect::back()->withErrors(['error' => $message]);
    }

    /**
     * Bulk delete employees
     */
    public function bulkDelete(Request $request)
    {
        $user = Auth::user();
        if ($user && $user->user_role === 'Employee') {
            return back()->withErrors(['error' => 'You do not have permission to delete overtime records.']);
        }
        
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'exists:overtimes,id'
            ]);

            $deletedCount = Overtime::whereIn('id', $request->ids)->delete();

            return back()->with([
                'success' => "Successfully deleted {$deletedCount} overtime record(s)."
            ]);
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Failed to delete overtime records: ' . $e->getMessage()
            ]);
        }
    }
  public function payroll(Request $request)
    {
        $currentMonth = Carbon::now()->format('Y-m');
        
        $filters = $request->only(['employee_name', 'start_date', 'end_date']);
        
        $query = Overtime::with(['employee:id,full_name,email,department'])
            ->where('status', 'approved')
            ->whereYear('overtime_date', Carbon::now()->year)
            ->whereMonth('overtime_date', Carbon::now()->month);
        
        if (!empty($filters['employee_name'])) {
            $query->whereHas('employee', function ($q) use ($filters) {
                $q->where('full_name', 'like', '%' . $filters['employee_name'] . '%');
            });
        }

        $overtimes = $query->orderBy('overtime_date', 'desc')->get();

        $payrollData = $overtimes->map(function ($overtime) {
            $baseAmount = $overtime->total_amount ?? ($overtime->hours_worked * ($overtime->hourly_rate ?? 0));
            $multiplier = 1;
            
            switch ($overtime->overtime_type) {
                case 'weekend':
                    $multiplier = 2.0;
                    break;
                case 'regular':
                    $multiplier = 1.5; 
                    break;
                default:
                    $multiplier = 1.5;
            }
                
            $finalAmount = $baseAmount * $multiplier;
            
            return [
                'id' => $overtime->id,
                'employee' => [
                    'id' => $overtime->employee->id,
                    'full_name' => $overtime->employee->full_name,
                    'email' => $overtime->employee->email,
                    'department' => $overtime->employee->department ?? 'N/A',
                ],
                'overtime_date' => $overtime->overtime_date,
                'start_time' => $overtime->start_time,
                'end_time' => $overtime->end_time,
                'hours_worked' => $overtime->hours_worked,
                'hourly_rate' => $overtime->hourly_rate ?? 0,
                'total_amount' => $finalAmount,
                'overtime_type' => $overtime->overtime_type,
            ];
        });
        
        $employeePayroll = $payrollData->groupBy('employee.id')->map(function ($records, $employeeId) {
            $employee = $records->first()['employee'];
            return [
                'employee' => $employee,
                'total_hours' => $records->sum('hours_worked'),
                'total_amount' => $records->sum('total_amount'),
                'overtime_records' => $records->toArray()
            ];
        })->values();
        
        $statistics = [
            'total_employees' => $employeePayroll->count(),
            'total_hours' => $employeePayroll->sum('total_hours'),
            'total_payroll_amount' => $employeePayroll->sum('total_amount'),
            'total_records' => $payrollData->count(),
            'current_month_name' => Carbon::now()->format('F Y'), // e.g., "August 2025"
            'period' => [
                'start' => Carbon::now()->startOfMonth()->format('Y-m-d'),
                'end' => Carbon::now()->endOfMonth()->format('Y-m-d')
            ]
        ];
        
        return Inertia::render("Admin/Overtime/Payroll", [
            'payrollData' => $payrollData,
            'employeePayroll' => $employeePayroll,
            'currentMonth' => $currentMonth,
            'filters' => $filters,
            'statistics' => $statistics,
            'isCurrentMonth' => true,
        ]);
    }
}
   
   