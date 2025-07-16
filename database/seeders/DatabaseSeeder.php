<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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
            'password' => Hash::make('admin123'),
            'email_verified_at' => now(),
        ]);

        // Create HR Manager
        User::factory()->create([
            'name' => 'HR Manager',
            'email' => 'hr@hr-sys.com',
            'password' => Hash::make('hr123'),
            'email_verified_at' => now(),
        ]);

        // Create Employee User
        User::factory()->create([
            'name' => 'John Employee',
            'email' => 'employee@hr-sys.com',
            'password' => Hash::make('employee123'),
            'email_verified_at' => now(),
        ]);

        // Create Test User (original)
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Create additional random users for testing
        User::factory(10)->create();
    }
}
