<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10); 
        $perPage = in_array($perPage, [10, 25, 50, 100]) ? $perPage : 10;
        
        // Prepare filters from request
        $filters = $request->only(['name', 'email', 'role']);
        
        $user = Auth::user();
        if ($user && $user->user_role === 'Employee') {
            $filters['email'] = $user->email;
        }
        
        
        $users = User::getFilteredUsers($filters, $perPage);
        $users->getCollection()->transform(function ($user) {
        $user->image = $user->image ? asset('images/' . $user->image) : null;
            return $user;
        });
        
        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $filters,
            'roles' => User::getRoles(),
            'canManage' => Auth::user() && in_array(Auth::user()->user_role, ['HR', 'SuperAdmin']),
        ]);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        // Prevent employees from creating new user records
        if ($user && $user->user_role === 'Employee') {
            return back()->withErrors(['error' => 'You do not have permission to create user accounts.']);
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'user_role' => 'required|in:HR,Employee,SuperAdmin',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
        

        try {
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $uniqueName = 'user_' . time() . '_' . Str::random(8) . '.' . $image->getClientOriginalExtension();                
                $destinationPath = public_path('images');
                if (!file_exists($destinationPath)) {
                    mkdir($destinationPath, 0755, true);
                }
                $image->move($destinationPath, $uniqueName);
            }
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'image' => $uniqueName,
                'password' => Hash::make($request->password),
                'user_role' => $request->user_role,
                'email_verified_at' => now(),
            ]);

            return back()->with([
                'success' => 'User created successfully.',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to create user: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, User $user)
    {
        $currentUser = Auth::user();
        
        // If current user is an Employee, only allow editing their own record
        if ($currentUser && $currentUser->user_role === 'Employee' && $user->id !== $currentUser->id) {
            return back()->withErrors(['error' => 'You can only edit your own user account.']);
        }
        
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,' . $user->id,
            'currentPassword' => [
            'required',
                function ($attribute, $value, $fail) use ($user) {
                    if (!Hash::check($value, $user->password)) {
                        $fail('The current password is incorrect.');
                    }
                }
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'password_confirmation' => 'required',
        ];
        
        // Only allow role changes for HR and SuperAdmin
        if ($currentUser && in_array($currentUser->user_role, ['HR', 'SuperAdmin'])) {
            $rules['user_role'] = 'required|in:HR,Employee,SuperAdmin';
        }

        if ($request->filled('password')) {
            $rules['currentPassword'] = [
                'required',
                function ($attribute, $value, $fail) use ($user) {
                    if (!Hash::check($value, $user->password)) {
                        $fail('The current password is incorrect.');
                    }
                }
            ];
            $rules['password'] = ['confirmed', Rules\Password::defaults()];
            $rules['password_confirmation'] = 'required';
        }
        if ($request->filled('password') || $request->filled('currentPassword')) {
            if (!$request->filled('currentPassword')) {
                return back()->withErrors(['currentPassword' => 'Current password is required when changing password.']);
            }
            
            if (!Hash::check($request->currentPassword, $user->password)) {
                return back()->withErrors(['currentPassword' => 'The current password is incorrect.']);
            }
        }
        $request->validate($rules);

        try {
            $updateData = [
                'name' => $request->name,
                'email' => $request->email,
            ];
            
            // Only update role if user has permission
            if ($currentUser && in_array($currentUser->user_role, ['HR', 'SuperAdmin']) && $request->filled('user_role')) {
                $updateData['user_role'] = $request->user_role;
            }

            // Only update password if provided
            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $user->update($updateData);

            return back()->with([
                'success' => 'User updated successfully.',
                'user' => $user->fresh()
            ]);
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to update user: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified user
     */
    public function destroy(User $user)
    {
        $currentUser = Auth::user();
        
        // Prevent employees from deleting user accounts
        if ($currentUser && $currentUser->user_role === 'Employee') {
            return back()->withErrors(['error' => 'You do not have permission to delete user accounts.']);
        }
        
        try {
            // Prevent deletion of the current user
            if ($user->id === auth()->id()) {
                return back()->withErrors(['error' => 'You cannot delete your own account.']);
            }

            $user->delete();

            return back()->with('success', 'User deleted successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete user: ' . $e->getMessage()]);
        }
    }

    /**
     * Bulk delete users
     */
    public function bulkDelete(Request $request)
    {
        $currentUser = Auth::user();
        
        // Prevent employees from bulk deleting user accounts
        if ($currentUser && $currentUser->user_role === 'Employee') {
            return back()->withErrors(['error' => 'You do not have permission to delete user accounts.']);
        }
        
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        try {
            $userIds = $request->user_ids;
            
            // Remove current user from deletion list
            $userIds = array_filter($userIds, function($id) {
                return $id != auth()->id();
            });

            if (empty($userIds)) {
                return back()->withErrors(['error' => 'No valid users selected for deletion.']);
            }

            $deletedCount = User::whereIn('id', $userIds)->delete();

            return back()->with('success', "Successfully deleted {$deletedCount} user(s).");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete users: ' . $e->getMessage()]);
        }
    }
}