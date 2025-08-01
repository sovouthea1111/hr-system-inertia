<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Leave;
use App\Models\Employee;

class LeaveApplicationNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $leave;
    public $employee;

    public function __construct(Leave $leave, Employee $employee)
    {
        $this->leave = $leave;
        $this->employee = $employee;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Leave Application Submitted - ' . ucfirst($this->leave->leave_type) . ' Leave',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.leave-notification',
            with: [
                'leave' => $this->leave,
                'employee' => $this->employee,
                'leaveDays' => \Carbon\Carbon::parse($this->leave->start_date)
                    ->diffInDays(\Carbon\Carbon::parse($this->leave->end_date)) + 1
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}