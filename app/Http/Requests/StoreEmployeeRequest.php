<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255', 'min:2'],
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:employees,email'
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'department' => [
                'required',
                'string',
                Rule::in(['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'])
            ],
            'position' => ['nullable', 'string', 'max:255'],
            'status' => [
                'required',
                Rule::in(['active', 'inactive'])
            ],
            'joint_date' => ['required', 'date', 'before_or_equal:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Employee full name is required.',
            'full_name.min' => 'Employee name must be at least 2 characters.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.unique' => 'This email address is already registered.',
            'department.required' => 'Department selection is required.',
            'department.in' => 'Please select a valid department.',
            'status.in' => 'Please select a valid status.',
            'joint_date.required' => 'Join date is required.',
            'joint_date.date' => 'Please provide a valid date.',
            'joint_date.before_or_equal' => 'Join date cannot be in the future.',
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'full_name' => trim($this->full_name),
            'email' => strtolower(trim($this->email)),
            'phone' => $this->phone ? trim($this->phone) : null,
            'position' => $this->position ? trim($this->position) : null,
        ]);
    }
}