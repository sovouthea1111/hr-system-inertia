<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\DashboardController; 
use App\Http\Controllers\OvertimeController;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    
    // Replace this inline function with the controller
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    
    // User Management - Resource Routes
    Route::resource('users', UserController::class);
    Route::delete('users-bulk-delete', [UserController::class, 'bulkDelete'])->name('users.bulk-delete');
    
    // Employee Management - Resource Routes
    Route::resource('employees', EmployeeController::class);
    Route::delete('employees-bulk-delete', [EmployeeController::class, 'bulkDelete'])->name('employees.bulk-delete');
    
    // Leave Management - Resource Routes
    Route::resource('leaves', LeaveController::class);
    Route::get('hr-leaves',[LeaveController::class,'hrLeave'])->name('hr-leaves');
    Route::put('leaves-status/{leave}', [LeaveController::class, 'updateStatus'])->name('leaves-status.update');
    
    // Add a new route for viewing a leave application
    Route::get('leaves/{leave}/view', [LeaveController::class, 'view'])->name('leaves.view');
    
    // Department Management
    Route::get('/departments', function () {
        return Inertia::render('Admin/Departments/Index');
    })->name('departments.index');
    
    Route::get('/departments/create', function () {
        return Inertia::render('Admin/Departments/Create');
    })->name('departments.create');
    
    // Payroll Management
    Route::get('/payroll', function () {
        return Inertia::render('Admin/Payroll/Index');
    })->name('payroll.index');
    
    // Reports
    Route::get('/reports', function () {
        return Inertia::render('Admin/Reports/Index');
    })->name('reports.index');
    
    // Settings
    Route::get('/settings', function () {
        return Inertia::render('Admin/Settings/Index');
    })->name('settings.index');

    Route::resource('overtime', OvertimeController::class);
    Route::put('overtime-status/{overtime}', [OvertimeController::class, 'updateStatus'])->name('overtime-status.update');
    Route::get('overtime-reports', [OvertimeController::class, 'reports'])->name('overtime.reports');
    Route::delete('overtimes-bulk-delete', [OvertimeController::class, 'bulkDelete'])->name('overtimes.bulk-delete');
    Route::get('overtime-payroll', [OvertimeController::class, 'payroll'])->name('overtime-payroll');
});
