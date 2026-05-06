<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use App\Models\Employee;
use App\Traits\HasEmployee;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    use HasEmployee;

    public function index(Request $request): JsonResponse
    {
        $type = $request->get('type', 'all');
        
        if ($this->isHR()) {
            $query = Leave::with(['employee']);
            $this->applyAdminFilters($query, $type);
            $leaves = $query->orderBy('created_at', 'desc')->get();
            $notifications = $this->formatNotifications($leaves, 'leave_request');
            $unreadCount = Leave::where('hr_notification_read', false)->count();
        } else {
            $employee = $this->getCurrentEmployee();
            if ($employee) {
                $leaves = Leave::with(['employee'])
                    ->where('employee_id', $employee->id)
                    ->whereIn('status', ['approved', 'rejected'])
                    ->orderBy('updated_at', 'desc')
                    ->get();
                $notifications = $this->formatNotifications($leaves, 'leave_status', $employee);
                $unreadCount = Leave::employeeUnreadNotifications($employee->id)->count();
            } else {
                $notifications = collect([]);
                $unreadCount = 0;
            }
        }
        
        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }
    
    public function markAsRead(Request $request): JsonResponse
    {
        $request->validate(['leave_id' => 'required|exists:leaves,id']);
        
        $leave = Leave::findOrFail($request->leave_id);
        
        if ($this->isHR()) {
            $leave->update(['hr_notification_read' => true]);
        } else {
            $employee = $this->getCurrentEmployee();
            if ($employee && $leave->employee_id === $employee->id) {
                $leave->update(['employee_notification_read' => true]);
            }
        }
        
        return response()->json(['success' => true]);
    }
    
    public function markAllAsRead(): JsonResponse
    {
        if ($this->isHR()) {
            Leave::where('hr_notification_read', false)->update(['hr_notification_read' => true]);
        } else {
            $employee = $this->getCurrentEmployee();
            if ($employee) {
                Leave::where('employee_id', $employee->id)
                     ->whereIn('status', ['approved', 'rejected'])
                     ->update(['employee_notification_read' => true]);
            }
        }
        
        return response()->json(['success' => true]);
    }
    
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'leave_id' => 'required|exists:leaves,id',
            'action' => 'required|in:approve,reject'
        ]);
        
        $leave = Leave::findOrFail($request->leave_id);
        
        if (!$this->isHR()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $status = $request->action === 'approve' ? 'approved' : 'rejected';
        $leave->update([
            'status' => $status,
            'approved_by' => Auth::id()
        ]);
        
        return response()->json([
            'message' => "Leave request {$status} successfully",
            'leave' => $leave->load(['employee'])
        ]);
    }
    
    private function applyAdminFilters($query, string $type): void
    {
        match ($type) {
            'pending' => $query->where('status', 'pending'),
            'approved' => $query->where('status', 'approved'),
            'rejected' => $query->where('status', 'rejected'),
            default => null,
        };
    }
    
    private function formatNotifications($leaves, string $notificationType, ?Employee $employee = null)
    {
        return $leaves->map(function ($leave) use ($notificationType) {
            if ($notificationType === 'leave_request') {
                return [
                    'id' => $leave->id,
                    'type' => 'leave_request',
                    'title' => 'Leave Request - ' . ucfirst($leave->status),
                    'message' => "{$leave->employee->full_name} has requested {$leave->leave_type} leave - Status: {$leave->status}",
                    'data' => [
                        'leave_id' => $leave->id,
                        'employee_name' => $leave->employee->full_name,
                        'leave_type' => $leave->leave_type,
                        'start_date' => $leave->start_date,
                        'end_date' => $leave->end_date,
                        'reason' => $leave->reason,
                        'status' => $leave->status
                    ],
                    'read' => $leave->hr_notification_read,
                    'created_at' => $leave->created_at
                ];
            }
            
            return [
                'id' => $leave->id,
                'type' => 'leave_status',
                'title' => 'Your Leave Request ' . ucfirst($leave->status),
                'message' => "Your {$leave->leave_type} leave request has been {$leave->status}",
                'data' => [
                    'leave_id' => $leave->id,
                    'employee_name' => 'Your',
                    'leave_type' => $leave->leave_type,
                    'start_date' => $leave->start_date,
                    'end_date' => $leave->end_date,
                    'status' => $leave->status,
                    'reason' => $leave->reason
                ],
                'read' => $leave->employee_notification_read,
                'created_at' => $leave->updated_at
            ];
        })->sortBy('read')->values();
    }
}
