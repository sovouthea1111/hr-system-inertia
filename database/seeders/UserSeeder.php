<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create SuperAdmin
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@company.com',
            'password' => Hash::make('password'),
            'user_role' => 'SuperAdmin',
            'email_verified_at' => now(),
        ]);

        // Create HR User
        User::create([
            'name' => 'HR Manager',
            'email' => 'hr@company.com',
            'password' => Hash::make('password'),
            'user_role' => 'HR',
            'email_verified_at' => now(),
        ]);

        // Create Employee
        User::create([
            'name' => 'John Employee',
            'email' => 'employee@company.com',
            'password' => Hash::make('password'),
            'user_role' => 'Employee',
            'email_verified_at' => now(),
        ]);
    }
}