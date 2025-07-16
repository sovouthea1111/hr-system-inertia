<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Admin routes with authentication and admin middleware
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    
    // Admin Dashboard
    Route::get('/', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('dashboard');
    
    // Employee Management
    Route::get('/employees', function () {
        return Inertia::render('Admin/Employees/Index');
    })->name('employees.index');
    
    Route::get('/employees/create', function () {
        return Inertia::render('Admin/Employees/Create');
    })->name('employees.create');
    
    Route::get('/employees/{id}', function ($id) {
        return Inertia::render('Admin/Employees/Show', ['id' => $id]);
    })->name('employees.show');
    
    Route::get('/employees/{id}/edit', function ($id) {
        return Inertia::render('Admin/Employees/Edit', ['id' => $id]);
    })->name('employees.edit');
    
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