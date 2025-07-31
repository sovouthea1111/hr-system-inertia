<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'user_role',
        'image'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole(string $role): bool
    {
        return $this->user_role === $role;
    }

    /**
     * Check if user is SuperAdmin
     */
    public function isSuperAdmin(): bool
    {
        return $this->user_role === 'SuperAdmin';
    }

    /**
     * Check if user is HR
     */
    public function isHR(): bool
    {
        return $this->user_role === 'HR';
    }

    /**
     * Check if user is Employee
     */
    public function isEmployee(): bool
    {
        return $this->user_role === 'Employee';
    }

    /**
     * Get available user roles
     */
    public static function getRoles(): array
    {
        return ['HR', 'Employee', 'SuperAdmin'];
    }

    /**
     * Apply filters to the user query
     */
    public function scopeFilter($query, array $filters)
    {
        return $query->when($filters['name'] ?? null, function ($query, $name) {
                $query->where('name', 'like', '%' . $name . '%');
            })
            ->when($filters['email'] ?? null, function ($query, $email) {
                $query->where('email', 'like', '%' . $email . '%');
            })
            ->when($filters['role'] ?? null, function ($query, $role) {
                $query->where('user_role', $role);
            });
    }

    /**
     * Get users with advanced filtering
     */
    public static function getFilteredUsers(array $filters = [], int $perPage = 10)
    {
        return static::filter($filters)
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage);
    }
}
