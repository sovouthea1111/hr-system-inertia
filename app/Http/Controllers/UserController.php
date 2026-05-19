<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Employee;
use App\Services\ActivityLogger;
use App\Traits\HasEmployee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    use HasEmployee;

    private const ALLOWED_PER_PAGE = [10, 25, 50, 100];
    private const DEFAULT_PER_PAGE = 10;
    private const ROLES_WITH_MANAGEMENT_PERMISSIONS = ['HR', 'SuperAdmin'];
    private const AVAILABLE_ROLES = ['HR', 'Employee', 'SuperAdmin'];
    private const IMAGE_PATH = 'images';
    private const MAX_IMAGE_SIZE = 2048;

    public function index(Request $request): Response
    {
        $perPage = $this->getValidatedPerPageValue($request);
        $filters = $this->prepareFilters($request);
        
        $users = User::getFilteredUsers($filters, $perPage);
        $this->transformUserImages($users);
        
        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $filters,
            'roles' => User::getRoles(),
            'canManage' => $this->isHR(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if (!$this->isHR()) {
            return $this->unauthorizedResponse('You do not have permission to create user accounts.');
        }
        
        $validatedData = $this->validateUserCreation($request);
        
        try {
            $imageName = $this->handleImageUpload($request);
            
            $user = User::create([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'image' => $imageName,
                'password' => Hash::make($validatedData['password']),
                'user_role' => $validatedData['user_role'],
                'email_verified_at' => now(),
            ]);

            $employee = Employee::where('email', $user->email)->first();
            if ($employee) {
                $employee->update(['user_id' => $user->id]);
            }

            ActivityLogger::log(
                'created',
                'users',
                $user,
                "Created user {$user->name}.",
                ['user' => $user->only(['id', 'name', 'email', 'user_role'])]
            );

            return back()->with([
                'success' => 'User created successfully.',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return $this->handleException('Failed to create user', $e, $request);
        }
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        if (!$this->canEditUser($user)) {
            return $this->unauthorizedResponse('You can only edit your own user account.');
        }
        
        if ($this->isPasswordChangeInvalid($request, $user)) {
            return back()->withErrors(['currentPassword' => 'Current password is required when changing password.']);
        }
        
        $validatedData = $this->validateUserUpdate($request, $user);
        
        try {
            $updateData = $this->prepareUpdateData($request, $validatedData);
            $changes = [];
            
            DB::transaction(function () use ($user, $updateData, &$changes) {
                $user->update($updateData);
                $changes = ActivityLogger::changes($user);

                if ($user->employee) {
                    $user->employee->update([
                        'full_name' => $updateData['name'],
                        'email' => $updateData['email'],
                    ]);
                }
            });

            ActivityLogger::log(
                'updated',
                'users',
                $user,
                "Updated user {$user->name}.",
                $changes
            );

            return back()->with([
                'success' => 'User updated successfully.',
                'user' => $user->fresh()
            ]);
        } catch (\Exception $e) {
            return $this->handleException('Failed to update user', $e, $request);
        }
    }

    public function destroy(User $user): RedirectResponse
    {
        if (!$this->isHR()) {
            return $this->unauthorizedResponse('You do not have permission to delete user accounts.');
        }
        if ($this->isCurrentUser($user)) {
            return back()->withErrors(['error' => 'You cannot delete your own account.']);
        }
        try {
            DB::transaction(function () use ($user) {
                if ($user->employee) {
                    $user->employee->delete();
                }
                $user->delete();
            });
            ActivityLogger::log(
                'deleted',
                'users',
                $user,
                "Deleted user {$user->name}.",
                ['user' => $user->only(['id', 'name', 'email', 'user_role'])]
            );
            return back()->with('success', 'User and associated employee record deleted successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete user: ' . $e->getMessage()]);
        }
    }

    public function bulkDelete(Request $request): RedirectResponse
    {
        if (!$this->isHR()) {
            return $this->unauthorizedResponse('You do not have permission to delete user accounts.');
        }
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);
        try {
            $validUserIds = $this->filterValidUserIdsForDeletion($request->user_ids); 
            if (empty($validUserIds)) {
                return back()->withErrors(['error' => 'No valid users selected for deletion.']);
            }
            $deletedCount = DB::transaction(function() use ($validUserIds) {
                Employee::whereIn('user_id', $validUserIds)->delete();
                return User::whereIn('id', $validUserIds)->delete();
            });
            ActivityLogger::log(
                'bulk_deleted',
                'users',
                null,
                "Bulk deleted {$deletedCount} user(s).",
                ['user_ids' => array_values($validUserIds), 'deleted_count' => $deletedCount]
            );
            return back()->with('success', "Successfully deleted {$deletedCount} user(s) and associated employee records.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete users: ' . $e->getMessage()]);
        }
    }

    private function getValidatedPerPageValue(Request $request): int
    {
        $perPage = $request->get('per_page', self::DEFAULT_PER_PAGE);
        return in_array($perPage, self::ALLOWED_PER_PAGE) ? $perPage : self::DEFAULT_PER_PAGE;
    }

    private function prepareFilters(Request $request): array
    {
        $filters = $request->only(['name', 'email', 'role']);
            if ($this->isEmployee()) {
            $filters['email'] = Auth::user()->email;
        }
        return $filters;
    }

    private function transformUserImages($users): void
    {
        $users->getCollection()->transform(function ($user) {
            $user->image = $user->image ? asset(self::IMAGE_PATH . '/' . $user->image) : null;
            return $user;
        });
    }

    private function validateUserCreation(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'user_role' => 'required|in:' . implode(',', self::AVAILABLE_ROLES),
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:' . self::MAX_IMAGE_SIZE,
        ]);
    }

    private function validateUserUpdate(Request $request, User $user): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,' . $user->id,
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:' . self::MAX_IMAGE_SIZE,
        ];
        if ($this->isHR()) {
            $rules['user_role'] = 'required|in:' . implode(',', self::AVAILABLE_ROLES);
        }
        if ($request->filled('password')) {
            $rules['currentPassword'] = [
                'required',
                fn($attribute, $value, $fail) => Hash::check($value, $user->password) ? null : $fail('The current password is incorrect.')
            ];
            $rules['password'] = ['confirmed', Rules\Password::defaults()];
            $rules['password_confirmation'] = 'required';
        }
        return $request->validate($rules);
    }

    private function handleImageUpload(Request $request): ?string
    {
        if (!$request->hasFile('image')) {
            return null;
        }
        $image = $request->file('image');
        $uniqueName = 'user_' . time() . '_' . Str::random(8) . '.' . $image->getClientOriginalExtension();
        $destinationPath = public_path(self::IMAGE_PATH);
        if (!file_exists($destinationPath)) mkdir($destinationPath, 0755, true);
        $image->move($destinationPath, $uniqueName);
        return $uniqueName;
    }

    private function prepareUpdateData(Request $request, array $validatedData): array
    {
        $updateData = [
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
        ];
        if ($this->isHR() && $request->filled('user_role')) {
            $updateData['user_role'] = $validatedData['user_role'];
        }
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($validatedData['password']);
        }
        $imageName = $this->handleImageUpload($request);
        if ($imageName) $updateData['image'] = $imageName;
        return $updateData;
    }

    private function filterValidUserIdsForDeletion(array $userIds): array
    {
        return array_filter($userIds, fn($id) => $id != Auth::id());
    }

    private function isPasswordChangeInvalid(Request $request, User $user): bool
    {
        if (!$request->filled('password') && !$request->filled('currentPassword')) return false;
        if ($request->filled('password') && !$request->filled('currentPassword')) return true;
        return !Hash::check($request->currentPassword, $user->password);
    }

    private function canEditUser(User $user): bool
    {
        $currentUser = Auth::user();
        if (!$currentUser) return false;
        if ($this->isHR()) return true;
        return $currentUser->user_role === 'Employee' && $user->id === $currentUser->id;
    }

    private function isCurrentUser(User $user): bool
    {
        return $user->id === Auth::id();
    }

    private function unauthorizedResponse(string $message): RedirectResponse
    {
        return back()->withErrors(['error' => $message]);
    }

    private function handleException(string $message, \Exception $e, Request $request): RedirectResponse
    {
        return back()->withErrors(['error' => $message . ': ' . $e->getMessage()])->withInput();
    }
}
