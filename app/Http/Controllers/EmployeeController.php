<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Models\Employee;
use App\Models\Overtime;
use App\Traits\HasEmployee;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Support\Facades\Hash;



class EmployeeController extends Controller
{
    use HasEmployee;

    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 10);
        $allowedPerPage = [10, 25, 50, 100];
        if (!in_array($perPage, $allowedPerPage)) {
            $perPage = 10;
        }

        $query = Employee::query();
        $user = Auth::user();
        
        if ($this->isEmployee()) {
            $query->where('user_id', $user->id);
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
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Employees/Index', [
            'employees' => $employees,
            'filters' => $request->only(['name', 'email', 'department', 'status']),
            'departments' => Employee::getDepartments(),
            'statuses' => Employee::getStatuses(),
            'canManage' => $this->isHR(),
        ]);
    }

    public function store(StoreEmployeeRequest $request)
    {
        if ($this->isEmployee()) {
            return back()->withErrors(['error' => 'You do not have permission to create employee records.']);
        }
        
        try {
            $employee = null;
            DB::transaction(function () use ($request, &$employee) {
                $data = $request->validated();
                
                $user = User::where('email', $data['email'])->first();
                
                if (!$user) {
                    $user = User::create([
                        'name' => $data['full_name'],
                        'email' => $data['email'],
                        'password' => Hash::make('K7!bP9zQ#2vR@mN512bfhgrwu'),
                        'user_role' => 'Employee',
                        'email_verified_at' => now(),
                    ]);
                }

                $data['user_id'] = $user->id;
                $employee = Employee::create($data);
            });

            return back()->with([
                'success' => 'Employee and User account created successfully.',
                'employee' => $employee
            ]);
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to create employee: ' . $e->getMessage()])
                ->withInput();
        }
    }
    
    public function update(UpdateEmployeeRequest $request, Employee $employee)
    {
        if ($this->isEmployee() && $employee->email !== Auth::user()->email) {
            return back()->withErrors(['error' => 'You can only edit your own employee record.']);
        }

        try {
            $original_salary = $employee->salary;
            
            DB::transaction(function () use ($request, $employee) {
                $data = $request->validated();
                $employee->update($data);
                
                if ($employee->user) {
                    $employee->user->update([
                        'name' => $data['full_name'],
                        'email' => $data['email'],
                    ]);
                }
            });

            $new_salary = $employee->salary;

            if($original_salary !== $new_salary){
                $employee_id = $employee->id;
                $monthlyOT = 26;
                $dayOT = 8;
                $basicOT = $employee->salary / $monthlyOT;
                $price = $basicOT / $dayOT;
                $overtimePrice = round($price, 2);

                $pendingOvertimes = Overtime::where('employee_id', $employee_id)
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

    public function show(Employee $employee): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $employee
        ]);
    }

    public function destroy(Employee $employee) 
    {
        if ($this->isEmployee()) {
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

    public function bulkDelete(Request $request)
    {
        if ($this->isEmployee()) {
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
