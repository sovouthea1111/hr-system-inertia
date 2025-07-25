# HR Management System

A comprehensive HR Management System built with Laravel and React/TypeScript for managing employees, leave applications, and HR operations.

## Features

- Employee Management
- Leave Application System
- HR Dashboard with Analytics
- Real-time Notifications
- Role-based Access Control (SuperAdmin, HR, Employee)
- Dark/Light Theme Support

## Tech Stack

- **Backend:** Laravel 11
- **Frontend:** React with TypeScript
- **Database:** MySQL
- **Styling:** Tailwind CSS
- **Build Tool:** Vite

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd hr-management-sys/hr-sys
```

2. Install PHP dependencies
```bash
composer install
```

3. Install Node.js dependencies
```bash
npm install
```

4. Copy environment file
```bash
copy .env.example .env
```

5. Generate application key
```bash
php artisan key:generate
```

6. Configure your database in `.env` file

7. Run database migrations
```bash
php artisan migrate
```

8. Seed the database with initial data
```bash
php artisan db:seed --class=UserSeeder
```

Or seed all seeders:
```bash
php artisan db:seed