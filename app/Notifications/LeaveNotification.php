<?php

namespace App\Notifications;

use App\Models\Leave;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class LeaveNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $leave;
    public $type;
    public $message;

    public function __construct(Leave $leave, string $type, string $message)
    {
        $this->leave = $leave->load('employee');
        $this->type = $type;
        $this->message = $message;
    }

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable): array
    {
        return [
            'leave_id' => $this->leave->id,
            'type' => $this->type,
            'message' => $this->message,
            'employee_name' => $this->leave->employee->first_name . ' ' . $this->leave->employee->last_name,
            'status' => $this->leave->status,
            'created_at' => now()->toDateTimeString(),
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'leave_id' => $this->leave->id,
            'type' => $this->type,
            'message' => $this->message,
            'employee_name' => $this->leave->employee->first_name . ' ' . $this->leave->employee->last_name,
            'status' => $this->leave->status,
            'created_at' => now()->toDateTimeString(),
        ]);
    }
}
