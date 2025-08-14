<?php

namespace App\Mail;

use App\Models\Overtime;
use App\Models\Employee;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OvertimeNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $overtime;
    public $employee;

    public function __construct(Overtime $overtime, Employee $employee)
    {
        $this->overtime = $overtime;
        $this->employee = $employee;
    }

    public function build()
    {
        return $this->subject('New Overtime Request - ' . $this->employee->full_name)
                    ->view('emails.overtime-notification')
                    ->with([
                        'overtime' => $this->overtime,
                        'employee' => $this->employee,
                    ]);
    }
}