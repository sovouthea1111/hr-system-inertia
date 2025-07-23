<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LeaveController;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    
    Route::get('/', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('dashboard');
    
    // User Management - Resource Routes
    Route::resource('users', UserController::class);
    Route::delete('users-bulk-delete', [UserController::class, 'bulkDelete'])->name('users.bulk-delete');
    
    // Employee Management - Resource Routes
    Route::resource('employees', EmployeeController::class);
    Route::delete('employees-bulk-delete', [EmployeeController::class, 'bulkDelete'])->name('employees.bulk-delete');
    
    // Leave Management - Resource Routes
    Route::resource('leaves', LeaveController::class);
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
});