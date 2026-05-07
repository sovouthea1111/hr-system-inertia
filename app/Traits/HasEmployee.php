<?php

namespace App\Traits;

use App\Models\Employee;
use Illuminate\Support\Facades\Auth;

trait HasEmployee
{
    protected function getCurrentEmployee(): ?Employee
    {
        $user = Auth::user();
        if (!$user) {
            return null;
        }
        
        return $user->employee ?? Employee::where('email', $user->email)->first();
    }

    protected function isEmployee(): bool
    {
        $user = Auth::user();
        return $user && $user->user_role === 'Employee';
    }

    protected function isHR(): bool
    {
        $user = Auth::user();
        return $user && in_array($user->user_role, ['HR', 'SuperAdmin']);
    }
}
