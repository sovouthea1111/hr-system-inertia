<?php

namespace App\Services;

use App\Models\UserActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ActivityLogger
{
    private const SENSITIVE_KEYS = [
        'password',
        'password_confirmation',
        'currentPassword',
        'current_password',
        'remember_token',
        'image',
    ];

    public static function log(
        string $action,
        string $module,
        ?Model $subject = null,
        ?string $description = null,
        array $properties = []
    ): void {
        try {
            $user = Auth::user();
            $request = request();

            UserActivity::create([
                'user_id' => $user?->id,
                'user_name' => $user?->name,
                'user_email' => $user?->email,
                'user_role' => $user?->user_role,
                'action' => $action,
                'module' => $module,
                'subject_type' => $subject ? $subject::class : null,
                'subject_id' => $subject?->getKey(),
                'description' => $description,
                'properties' => self::sanitize($properties),
                'ip_address' => $request?->ip(),
                'user_agent' => $request?->userAgent(),
            ]);
        } catch (\Throwable $exception) {
            Log::warning('Failed to write user activity log.', [
                'action' => $action,
                'module' => $module,
                'message' => $exception->getMessage(),
            ]);
        }
    }

    public static function changes(Model $model): array
    {
        $changes = collect($model->getChanges())
            ->except(['updated_at', 'created_at'])
            ->all();

        $before = [];
        $after = [];

        $previous = method_exists($model, 'getPrevious') ? $model->getPrevious() : [];

        foreach ($changes as $key => $value) {
            $before[$key] = $previous[$key] ?? $model->getOriginal($key);
            $after[$key] = $value;
        }

        return [
            'before' => $before,
            'after' => $after,
        ];
    }

    private static function sanitize(array $properties): array
    {
        foreach ($properties as $key => $value) {
            if (in_array($key, self::SENSITIVE_KEYS, true)) {
                $properties[$key] = '[hidden]';
                continue;
            }

            if (is_array($value)) {
                $properties[$key] = self::sanitize($value);
            }
        }

        return $properties;
    }
}
