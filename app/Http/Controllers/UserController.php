<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    private const ALLOWED_PER_PAGE = [10, 25, 50, 100];
    private const DEFAULT_PER_PAGE = 10;
    private const ROLES_WITH_MANAGEMENT_PERMISSIONS = ['HR', 'SuperAdmin'];
    private const AVAILABLE_ROLES = ['HR', 'Employee', 'SuperAdmin'];
    private const IMAGE_PATH = 'images';
    private const MAX_IMAGE_SIZE = 2048; // KB

    /**
     * Display a listing of users
     */
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
            'canManage' => $this->currentUserCanManage(),
        ]);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request): RedirectResponse
    {
        if (!$this->currentUserCanManage()) {
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

            return back()->with([
                'success' => 'User created successfully.',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return $this->handleException('Failed to create user', $e, $request);
        }
    }

    /**
     * Update the specified user
     */
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
            $user->update($updateData);

            return back()->with([
                'success' => 'User updated successfully.',
                'user' => $user->fresh()
            ]);
        } catch (\Exception $e) {
            return $this->handleException('Failed to update user', $e, $request);
        }
    }

    /**
     * Remove the specified user
     */
    public function destroy(User $user): RedirectResponse
    {
        if (!$this->currentUserCanManage()) {
            return $this->unauthorizedResponse('You do not have permission to delete user accounts.');
        }
        if ($this->isCurrentUser($user)) {
            return back()->withErrors(['error' => 'You cannot delete your own account.']);
        }
        try {
            DB::transaction(function () use ($user) {
                Employee::where('email', $user->email)->delete();
                $user->delete();
            });
            return back()->with('success', 'User and associated employee record deleted successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete user: ' . $e->getMessage()]);
        }
    }

    /**
     * Bulk delete users
     */
    public function bulkDelete(Request $request): RedirectResponse
    {
        if (!$this->currentUserCanManage()) {
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
                $userEmails = User::whereIn('id', $validUserIds)->pluck('email')->toArray();
                Employee::whereIn('email', $userEmails)->delete();
                return User::whereIn('id', $validUserIds)->delete();
            });
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
            if ($this->isCurrentUserEmployee()) {
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
        if ($this->currentUserCanManage()) {
            $rules['user_role'] = 'required|in:' . implode(',', self::AVAILABLE_ROLES);
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
        $this->ensureDirectoryExists($destinationPath);
        $image->move($destinationPath, $uniqueName);
        return $uniqueName;
    }

    private function ensureDirectoryExists(string $path): void
    {
        if (!file_exists($path)) {
            mkdir($path, 0755, true);
        }
    }

    private function prepareUpdateData(Request $request, array $validatedData): array
    {
        $updateData = [
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
        ];
        if ($this->currentUserCanManage() && $request->filled('user_role')) {
            $updateData['user_role'] = $validatedData['user_role'];
        }
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($validatedData['password']);
        }
        $imageName = $this->handleImageUpload($request);
        if ($imageName) {
            $updateData['image'] = $imageName;
        }
        return $updateData;
    }
    private function filterValidUserIdsForDeletion(array $userIds): array
    {
        return array_filter($userIds, fn($id) => $id != auth()->id());
    }
    private function isPasswordChangeInvalid(Request $request, User $user): bool
    {
        if (!$request->filled('password') && !$request->filled('currentPassword')) {
            return false;
        }
        if ($request->filled('password') && !$request->filled('currentPassword')) {
            return true;
        }
        if ($request->filled('currentPassword') && !Hash::check($request->currentPassword, $user->password)) {
            return true;
        }
        return false;
    }
    private function currentUserCanManage(): bool
    {
        $user = Auth::user();
        return $user && in_array($user->user_role, self::ROLES_WITH_MANAGEMENT_PERMISSIONS);
    }
    private function isCurrentUserEmployee(): bool
    {
        $user = Auth::user();
        return $user && $user->user_role === 'Employee';
    }
    private function canEditUser(User $user): bool
    {
        $currentUser = Auth::user();
        if (!$currentUser) {
            return false;
        }
        if ($this->currentUserCanManage()) {
            return true;
        }
        return $currentUser->user_role === 'Employee' && $user->id === $currentUser->id;
    }
    private function isCurrentUser(User $user): bool
    {
        return $user->id === auth()->id();
    }
    private function unauthorizedResponse(string $message): RedirectResponse
    {
        return back()->withErrors(['error' => $message]);
    }
    private function handleException(string $message, \Exception $e, Request $request): RedirectResponse
    {
        return back()
            ->withErrors(['error' => $message . ': ' . $e->getMessage()])
            ->withInput();
    }
}