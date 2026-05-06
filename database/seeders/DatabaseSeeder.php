<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Employee;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin User
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@hr-sys.com',
            'user_role' => 'SuperAdmin',
            'password' => Hash::make('admin123'),
            'email_verified_at' => now(),
        ]);

        // Create HR Manager User
        User::factory()->create([
            'name' => 'HR Manager',
            'email' => 'hr@hr-sys.com',
            'user_role' => 'HR',
            'password' => Hash::make('hr123'),
            'email_verified_at' => now(),
        ]);

        // Create HR Manager Employee Record (needed for "My Leaves")
        Employee::create([
            'full_name' => 'HR Manager',
            'email' => 'hr@hr-sys.com',
            'phone' => '012345678',
            'department' => 'HR',
            'position' => 'HR Manager',
            'salary' => 1500,
            'status' => 'active',
            'joint_date' => Carbon::now(),
        ]);

        // Create Employee User
        User::factory()->create([
            'name' => 'John Employee',
            'email' => 'employee@hr-sys.com',
            'user_role' => 'Employee',
            'password' => Hash::make('employee123'),
            'email_verified_at' => now(),
        ]);

        // Create Test User (original)
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'user_role' => 'Employee',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Create additional random users for testing
        User::factory(10)->create();
    }
}
