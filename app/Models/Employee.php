<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'phone',
        'department',
        'position',
        'status',
        'email',
        'joint_date',
    ];

    protected $casts = [
        'joint_date' => 'datetime',
        'status' => 'string',
    ];

    // Remove the $dates property since we're removing soft deletes
    // protected $dates = [
    //     'deleted_at',
    //     'joint_date',
    // ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByDepartment($query, $department)
    {
        return $query->where('department', $department);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Accessors
    public function getFormattedJointDateAttribute()
    {
        return $this->joint_date->format('Y-m-d');
    }

    public function getStatusBadgeAttribute()
    {
        return [
            'active' => 'success',
            'inactive' => 'danger',
        ][$this->status] ?? 'secondary';
    }

    // Add this accessor
    public function getNameAttribute()
    {
        return $this->full_name;
    }

    // Add this relationship method
    public function leaves(): HasMany
    {
        return $this->hasMany(Leave::class);
    }
}
