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
    $users = [
      [
        "name" => "Tuan Sim",
        "email" => "TuanSim318@gmail.com",
        "user_role" => "SuperAdmin",
        "password" => Hash::make("TuanSimAdmin@HR-System-2026!"),
        "email_verified_at" => now(),
      ],

      [
        "name" => "Bunsochea Tapov",
        "email" => "bunsocheatapov99@gmail.com",
        "user_role" => "HR",
        "password" => Hash::make("SocheataHR-Manager#2026!Secure"),
        "email_verified_at" => now(),
      ],

      [
        "name" => "Kanha But",
        "email" => "KanhaBut@gmail.com",
        "user_role" => "Employee",
        "password" => Hash::make("KanhaEmployee@2026#Secure!Pass"),
        "email_verified_at" => now(),
      ],
      [
        "name" => "Naroth Roth",
        "email" => "NarothRoth@gmai.com",
        "user_role" => "Employee",
        "password" => Hash::make("NarothEmployee@2026#Secure!Pass"),
        "email_verified_at" => now(),
      ],
      [
        "name" => "Sithy",
        "email" => "Sithy@gmai.com",
        "user_role" => "Employee",
        "password" => Hash::make("SithyEmployee@2026#Secure!Pass"),
        "email_verified_at" => now(),
      ],
      [
        "name" => "Peakney",
        "email" => "peakney@gmai.com",
        "user_role" => "Employee",
        "password" => Hash::make("PeakneyEmployee@2026#Secure!Pass"),
        "email_verified_at" => now(),
      ],
      [
        "name" => "Bunchan",
        "email" => "bunchan@gmail.com",
        "user_role" => "Employee",
        "password" => Hash::make("BunchanEmployee@2026#Secure!Pass"),
        "email_verified_at" => now(),
      ],
      [
        "name" => "Rachana",
        "email" => "rachana@gmail.com",
        "user_role" => "Employee",
        "password" => Hash::make("RachanaEmployee@2026#Secure!Pass"),
        "email_verified_at" => now(),
      ],
      [
        "name" => "Chhork",
        "email" => "chhork@gmail.com",
        "user_role" => "Employee",
        "password" => Hash::make("ChhourkEmployee@2026#Secure!Pass"),
        "email_verified_at" => now(),
      ],
      [
        "name" => "Theara",
        "email" => "theara@gmail.com",
        "user_role" => "Employee",
        "password" => Hash::make("ThearaEmployee@2026#Secure!Pass"),
        "email_verified_at" => now(),
      ],
      [
        "name" => "Sombath",
        "email" => "sombath@gmail.com",
        "user_role" => "Employee",
        "password" => Hash::make("SombathEmployee@2026#Secure!Pass"),
        "email_verified_at" => now(),
      ],
      [
        "name" => "Sockea",
        "email" => "sockea@gmail.com",
        "user_role" => "Employee",
        "password" => Hash::make("SokcheaEmployee@2026#Secure!Pass"),
        "email_verified_at" => now(),
      ],
      [
        "name" => "Neth",
        "email" => "neth@gmail.com",
        "user_role" => "Employee",
        "password" => Hash::make("NethEmployee@2026#Secure!Pass"),
        "email_verified_at" => now(),
      ],
      [
        "name" => "Makra",
        "email" => "makra@gmail.com",
        "user_role" => "Employee",
        "password" => Hash::make("MakaraEmployee@2026#Secure!Pass"),
        "email_verified_at" => now(),
      ],
      [
        "name" => "Chhis",
        "email" => "chhis@gmai.com",
        "user_role" => "Employee",
        "password" => Hash::make("ChhisEmployee@2026#Secure!Pass"),
        "email_verified_at" => now(),
      ],
    ];

    foreach ($users as $userData) {
      User::factory()->create($userData);
    }
  }
}
