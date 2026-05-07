<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@hr-sys.com',
            'user_role' => 'SuperAdmin',
            'password' => Hash::make('Admin@HR-System-2026!'),
            'email_verified_at' => now(),
        ]);

        User::factory()->create([
            'name' => 'HR Manager',
            'email' => 'hr@hr-sys.com',
            'user_role' => 'HR',
            'password' => Hash::make('HR-Manager#2026!Secure'),
            'email_verified_at' => now(),
        ]);

        User::factory()->create([
            'name' => 'John Employee',
            'email' => 'employee@hr-sys.com',
            'user_role' => 'Employee',
            'password' => Hash::make('Employee@2026#Secure!Pass'),
            'email_verified_at' => now(),
        ]);
    }
}
