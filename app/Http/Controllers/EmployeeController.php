<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Models\Employee;
use App\Models\Overtime;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class EmployeeController extends Controller
{
    /**
     * Display a listing of employees
     */
    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 10);
        $allowedPerPage = [10, 25, 50, 100];
        if (!in_array($perPage, $allowedPerPage)) {
            $perPage = 10;
        }

        $query = Employee::query();
        $user = Auth::user();
        
        if ($user && $user->user_role === 'Employee') {
            $query->where('email', $user->email);
        } else {
            if ($request->filled('name')) {
                $query->where('full_name', 'like', '%' . $request->name . '%');
            }

            if ($request->filled('email')) {
                $query->where('email', 'like', '%' . $request->email . '%');
            }

            if ($request->filled('department')) {
                $query->where('department', $request->department);
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }
        }

        $employees = $query
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)  // Changed from hardcoded 10 to $perPage
            ->withQueryString();

        return Inertia::render('Admin/Employees/Index', [
            'employees' => $employees,
            'filters' => $request->only(['name', 'email', 'department', 'status']),
            'departments' => $this->getDepartments(),
            'statuses' => $this->getStatuses(),
            'canManage' => $user && in_array($user->user_role, ['HR', 'SuperAdmin']),
        ]);
    }

    /**
     * Store a newly created employee
     */
    public function store(StoreEmployeeRequest $request)
    {
        $user = Auth::user();
        
        if ($user && $user->user_role === 'Employee') {
            return back()->withErrors(['error' => 'You do not have permission to create employee records.']);
        }
        
        try {
            $employee = Employee::create($request->validated());

            return back()->with([
                'success' => 'Employee created successfully.',
                'employee' => $employee
            ]);
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to create employee: ' . $e->getMessage()])
                ->withInput();
        }
    }
    
    /**
     * Update the specified employee
     */
    public function update(UpdateEmployeeRequest $request, Employee $employee)
    {
        $user = Auth::user();
        if ($user && $user->user_role === 'Employee' && $employee->email !== $user->email) {
            return back()->withErrors(['error' => 'You can only edit your own employee record.']);
        }

        try {
            $original_salary = $employee->salary;
            $employee->update($request->validated());
            $new_salary = $employee->salary;
            if($original_salary !== $new_salary){
                $employee_id = $employee->id;
            if ($employee) {
                $monthlyOT = 26;
                $dayOT = 8;
                $basicOT = $employee->salary / $monthlyOT;
                $price = $basicOT / $dayOT;
            }

            $overtimePrice = round($price, 2);
                $pendingOvertimes = Overtime::with('employee:id,full_name,email,department')
                    ->where('employee_id', $employee_id)
                    ->where('status', 'pending')
                    ->get();
                    foreach($pendingOvertimes as $overtime){
                        $total_amount = round($overtimePrice * $overtime->hour, 2);
                        $overtime->update([
                            'hourly_rate' => $overtimePrice,
                            'total_amount' => $total_amount,
                        ]);
                    }
            }    
            return back()->with([
                'success' => 'Employee updated successfully.',
                'employee' => $employee->fresh()
            ]);
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to update employee: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified employee
     */
    public function show(Employee $employee): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $employee
        ]);
    }

    /**
     * Remove the specified employee
     */
    public function destroy(Employee $employee) 
    {
        $user = Auth::user();
        
        if ($user && $user->user_role === 'Employee') {
            return back()->withErrors(['error' => 'You do not have permission to delete employee records.']);
        }
        
        try {
            $employee->delete();

            return back()->with([
                'success' => 'Employee deleted successfully.'
            ]);
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to delete employee: ' . $e->getMessage()]);
        }
    }

    /**
     * Get available departments
     */
    private function getDepartments(): array
    {
        return [
            ['value' => 'HR', 'label' => 'HR'],
            ['value' => 'IT', 'label' => 'Information Technology'],
            ['value' => 'Media', 'label' => 'Social Media'],
            ['value' => 'ISO', 'label' => 'ISO'],
        ];
    }

    /**
     * Get available statuses
     */
    private function getStatuses(): array
    {
        return [
            ['value' => 'active', 'label' => 'Active'],
            ['value' => 'inactive', 'label' => 'Inactive'],
        ];
    }

    /**
     * Bulk delete employees
     */
    public function bulkDelete(Request $request)
    {
        $user = Auth::user();
        if ($user && $user->user_role === 'Employee') {
            return back()->withErrors(['error' => 'You do not have permission to delete employee records.']);
        }
        
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'exists:employees,id'
            ]);
    
            $deletedCount = Employee::whereIn('id', $request->ids)->delete();
    
            return back()->with([
                'success' => "Successfully deleted {$deletedCount} employee(s)."
            ]);
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Failed to delete employees: ' . $e->getMessage()
            ]);
        }
    }
}
