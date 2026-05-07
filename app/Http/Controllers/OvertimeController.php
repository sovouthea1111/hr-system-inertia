<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Overtime;
use App\Models\User;
use App\Mail\OvertimeNotification;
use App\Traits\HasEmployee;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OvertimeController extends Controller
{
   use HasEmployee;

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
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->orderBy('updated_at', 'desc');

        if (empty($filters['start_date']) && empty($filters['end_date'])) {
            $query->whereYear('overtime_date', now()->year)
                ->whereMonth('overtime_date', now()->month);
        } else {
            if (!empty($filters['start_date'])) {
                $query->whereDate('overtime_date', '>=', $filters['start_date']);
            }
            if (!empty($filters['end_date'])) {
                $query->whereDate('overtime_date', '<=', $filters['end_date']);
            }
        }

        if (!empty($filters['employee_name'])) {
            $query->whereHas('employee', fn($q) => $q->where('full_name', 'like', '%' . $filters['employee_name'] . '%'));
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['overtime_type'])) {
            $query->where('overtime_type', $filters['overtime_type']);
        }

        if ($this->isEmployee()) {
            $employee = $this->getCurrentEmployee();
            if ($employee) {
                $query->where('employee_id', $employee->id);
            } else {
                return Inertia::render('Admin/Overtime/Index', [
                    'overtimes' => ['data' => [], 'links' => [], 'meta' => null],
                    'filters' => $filters,
                    'employees' => [],
                    'overtimeTypes' => $this->getOvertimeTypesForSelect(),
                    'currentMonth' => now()->format('Y-m'),
                    'currentMonthName' => now()->format('F Y'),
                    'error' => 'Employee record not found. Please contact HR.'
                ]);
            }
        }

        $overtimes = $query->paginate($perPage);
        
        $overtimes->getCollection()->transform(function ($overtime) {
            $baseAmount = $overtime->total_amount ?? ($overtime->hours_worked * ($overtime->hourly_rate ?? 0));
            $multiplier = match ($overtime->overtime_type) {
                'weekend' => 2.0,
                default => 1.5,
            };
            
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
                'updated_at' => $overtime->updated_at,
            ];
        });
        
        $employees = [];
        if ($this->isHR()) {
            $employees = Employee::select('id', 'full_name', 'email')
                ->orderBy('full_name')
                ->get()
                ->toArray();
        }

        return Inertia::render('Admin/Overtime/Index', [
            'overtimes' => $overtimes,
            'filters' => $filters,
            'employees' => $employees,
            'overtimeTypes' => $this->getOvertimeTypesForSelect(),
            'currentMonth' => now()->format('Y-m'),
            'currentMonthName' => now()->format('F Y'),
            'statistics' => [
                'total_records' => $overtimes->total(),
                'total_hours' => $overtimes->getCollection()->sum('hours_worked'),
                'total_amount' => $overtimes->getCollection()->sum('total_amount'),
            ],
            'isCurrentMonthView' => empty($filters['date']),
        ]);
    }

    private function getOvertimeTypesForSelect(): array
    {
        $employee = $this->getCurrentEmployee();
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

    public function store(Request $request): RedirectResponse
    {
        $employee = $this->getCurrentEmployee();
        
        if (!$employee) {
            return back()->withErrors(['employee' => 'Employee record not found. Please contact HR.']);
        }

        $validatedData = $request->validate([
            'overtime_type' => ['required', 'string', Rule::in(['regular', 'weekend'])],
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
                return back()->withErrors(['time' => 'End time must be after start time.']);
            }

            $overtime = Overtime::create([
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

            try {
                $superAdmin = User::where('user_role', 'SuperAdmin')->first();
                $hrEmails = User::where('user_role', 'HR')->pluck('email')->toArray();

                if ($superAdmin) {
                    $mail = Mail::to($superAdmin->email);
                    if (!empty($hrEmails)) {
                        $mail->cc($hrEmails);
                    }
                    $mail->send(new OvertimeNotification($overtime, $employee));
                }
            } catch (\Exception $mailException) {
            }

            return back()->with('success', 'Overtime request submitted successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to submit overtime request. Please try again.']);
        }
    }

    public function updateStatus(Request $request, Overtime $overtime): RedirectResponse
    {
        if (!$this->isHR()) {
            return back()->withErrors(['error' => 'You are not authorized to perform this action.']);
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

        return back()->with('success', 'Overtime status updated successfully!');
    }

    public function update(Request $request, Overtime $overtime): RedirectResponse
    {
        $employee = $this->getCurrentEmployee();
        $canEdit = $this->isHR() || 
                ($employee && $overtime->employee_id === $employee->id && $overtime->status === 'pending');
        
        if (!$canEdit) {
            return back()->withErrors(['error' => 'You are not authorized to update this overtime record.']);
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

            return back()->with('success', 'Overtime record updated successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update overtime record. Please try again.']);
        }
    }

    public function destroy(Overtime $overtime): RedirectResponse
    {
        if (!$this->canDeleteOvertime($overtime)) {
            return back()->withErrors(['error' => 'You are not authorized to delete this overtime record.']);
        }

        $overtime->delete();
        return back()->with('success', 'Overtime record deleted successfully!');
    }

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



    private function canDeleteOvertime(Overtime $overtime): bool
    {
        if ($this->isHR()) {
            return true;
        }

        $employee = $this->getCurrentEmployee();
        return $employee && $overtime->employee_id === $employee->id;
    }

    public function bulkDelete(Request $request)
    {
        if ($this->isEmployee()) {
            return back()->withErrors(['error' => 'You do not have permission to delete overtime records.']);
        }
        
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'exists:overtimes,id'
            ]);

            $deletedCount = Overtime::whereIn('id', $request->ids)->delete();

            return back()->with(['success' => "Successfully deleted {$deletedCount} overtime record(s)."]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete overtime records: ' . $e->getMessage()]);
        }
    }

    public function exportPDF(Request $request)
    {
        $user = Auth::user();
        $filters = $request->only(['employee_name', 'status', 'overtime_type', 'start_date', 'end_date']);
        
        $query = Overtime::with(['employee:id,full_name,email,department'])
            ->where('status', 'approved')
            ->orderBy('overtime_date', 'desc');

        if ($this->isEmployee()) {
            $employee = $this->getCurrentEmployee();
            if ($employee) {
                $query->where('employee_id', $employee->id);
            }
        }

        if (!empty($filters['employee_name'])) {
            $query->whereHas('employee', fn($q) => $q->where('full_name', 'like', '%' . $filters['employee_name'] . '%'));
        }

        if (!empty($filters['overtime_type'])) {
            $query->where('overtime_type', $filters['overtime_type']);
        }

        if (!empty($filters['start_date'])) {
            $query->whereDate('overtime_date', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('overtime_date', '<=', $filters['end_date']);
        }

        $overtimes = $query->get()->map(function ($overtime) {
            $baseAmount = $overtime->total_amount ?? ($overtime->hours_worked * ($overtime->hourly_rate ?? 0));
            $multiplier = match ($overtime->overtime_type) {
                'weekend' => 2.0,
                default => 1.5,
            };
            
            return [
                'id' => $overtime->id,
                'employee_name' => $overtime->employee->full_name,
                'overtime_date' => $overtime->overtime_date,
                'start_time' => $overtime->start_time,
                'end_time' => $overtime->end_time,
                'hours_worked' => $overtime->hours_worked,
                'hourly_rate' => $overtime->hourly_rate ?? 0,
                'total_amount' => $baseAmount * $multiplier,
                'overtime_type' => $overtime->overtime_type,
                'status' => $overtime->status,
                'reason' => $overtime->reason,
            ];
        });

        $pdf = Pdf::loadView('pdf.overtime', [
            'overtimes' => $overtimes,
            'title' => $this->isEmployee() ? 'My Overtime Report' : 'Overtime Management Report',
            'date' => now()->format('Y-m-d H:i:s'),
            'user' => $user,
            'total_amount' => $overtimes->sum('total_amount'),
            'total_hours' => $overtimes->sum('hours_worked')
        ]);

        return $pdf->download('overtime-report-' . now()->format('YmdHis') . '.pdf');
    }

    public function payroll(Request $request)
    {
        $currentMonth = now()->format('Y-m');
        $filters = $request->only(['employee_name', 'start_date', 'end_date']);
        
        $query = Overtime::with(['employee:id,full_name,email,department'])
            ->where('status', 'approved')
            ->whereYear('overtime_date', now()->year)
            ->whereMonth('overtime_date', now()->month);
        
        if (!empty($filters['employee_name'])) {
            $query->whereHas('employee', fn($q) => $q->where('full_name', 'like', '%' . $filters['employee_name'] . '%'));
        }

        $overtimes = $query->orderBy('overtime_date', 'desc')->get();

        $payrollData = $overtimes->map(function ($overtime) {
            $baseAmount = $overtime->total_amount ?? ($overtime->hours_worked * ($overtime->hourly_rate ?? 0));
            $multiplier = match ($overtime->overtime_type) {
                'weekend' => 2.0,
                default => 1.5,
            };
                
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
        
        $employeePayroll = $payrollData->groupBy('employee.id')->map(function ($records) {
            return [
                'employee' => $records->first()['employee'],
                'total_hours' => $records->sum('hours_worked'),
                'total_amount' => $records->sum('total_amount'),
                'overtime_records' => $records->toArray()
            ];
        })->values();
        
        return Inertia::render("Admin/Overtime/Payroll", [
            'payrollData' => $payrollData,
            'employeePayroll' => $employeePayroll,
            'currentMonth' => $currentMonth,
            'filters' => $filters,
            'statistics' => [
                'total_employees' => $employeePayroll->count(),
                'total_hours' => $employeePayroll->sum('total_hours'),
                'total_payroll_amount' => $employeePayroll->sum('total_amount'),
                'total_records' => $payrollData->count(),
                'current_month_name' => now()->format('F Y'),
                'period' => [
                    'start' => now()->startOfMonth()->format('Y-m-d'),
                    'end' => now()->endOfMonth()->format('Y-m-d')
                ]
            ],
            'isCurrentMonth' => true,
        ]);
    }
}
