<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    if (Auth::check()) {
        $user = Auth::user();
        if ($user->user_role === 'Employee') {
            return redirect()->route('dashboard');
        }
        return redirect()->route('admin.dashboard');
    }
    return redirect()->route('login');
});

Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
require __DIR__.'/admin.php';

// Notification routes
Route::middleware(['auth'])->prefix('api')->group(function () {
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index']);
    Route::put('/notifications', [App\Http\Controllers\NotificationController::class, 'update']);
    Route::post('/notifications/mark-as-read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-as-read', [App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
});
