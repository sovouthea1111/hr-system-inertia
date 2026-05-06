<?php

namespace App\Traits;

use App\Models\Employee;
use Illuminate\Support\Facades\Auth;

trait HasEmployee
{
    protected function getCurrentEmployee(): ?Employee
    {
        $user = Auth::user();
        return $user ? Employee::where('email', $user->email)->first() : null;
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
