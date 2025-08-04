<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Leave;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Display a listing of the notifications.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $type = $request->get('type', 'all');
        
        if ($user->user_role === 'HR' || $user->user_role === 'SuperAdmin') {
            $query = Leave::with(['employee']);
            
            $this->applyAdminFilters($query, $type);
            
            $leaves = $query->orderBy('created_at', 'desc')->get();
            $notifications = $this->formatNotifications($leaves, 'leave_request');
            
            $unreadCount = Leave::where('hr_notification_read', false)->count();
        } else {
            $employee = Employee::where('email', $user->email)->first();
            
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
    
    /**
     * Mark a single notification as read.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsRead(Request $request)
    {
        $request->validate([
            'leave_id' => 'required|exists:leaves,id'
        ]);
        
        $user = Auth::user();
        $leave = Leave::findOrFail($request->leave_id);
        
        if ($user->user_role === 'HR' || $user->user_role === 'SuperAdmin') {
            $leave->update(['hr_notification_read' => true]);
        } else {
            $employee = Employee::where('email', $user->email)->first();
            if ($employee && $leave->employee_id === $employee->id) {
                $leave->update(['employee_notification_read' => true]);
            }
        }
        
        return response()->json(['success' => true]);
    }
    
    /**
     * Mark all notifications as read for the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAllAsRead()
    {
        $user = Auth::user();
        
        if ($user->user_role === 'HR' || $user->user_role === 'SuperAdmin') {
            // Updated to mark all unread notifications as read, regardless of status
            Leave::where('hr_notification_read', false)->update(['hr_notification_read' => true]);
        } else {
            $employee = Employee::where('email', $user->email)->first();
            if ($employee) {
                Leave::where('employee_id', $employee->id)
                     ->whereIn('status', ['approved', 'rejected'])
                     ->update(['employee_notification_read' => true]);
            }
        }
        
        return response()->json(['success' => true]);
    }
    
    /**
     * Update the status of a leave request (approve/reject).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $request->validate([
            'leave_id' => 'required|exists:leaves,id',
            'action' => 'required|in:approve,reject'
        ]);
        
        $leave = Leave::findOrFail($request->leave_id);
        $user = Auth::user();
        
        if (!in_array($user->user_role, ['HR', 'SuperAdmin'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $status = $request->action === 'approve' ? 'approved' : 'rejected';
        $leave->update([
            'status' => $status,
            'approved_by' => $user->id
        ]);
        
        return response()->json([
            'message' => "Leave request {$status} successfully",
            'leave' => $leave->load(['employee'])
        ]);
    }
    
    /**
     * Apply filters for admin roles (HR and SuperAdmin).
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $type
     * @return void
     */
    private function applyAdminFilters($query, $type)
    {
        switch ($type) {
            case 'pending':
                $query->where('status', 'pending');
                break;
            case 'approved':
                $query->where('status', 'approved');
                break;
            case 'rejected':
                $query->where('status', 'rejected');
                break;
        }
    }
    
    /**
     * Format the leave data into a notification structure.
     *
     * @param  \Illuminate\Support\Collection  $leaves
     * @param  string  $notificationType
     * @param  \App\Models\Employee|null  $employee
     * @return \Illuminate\Support\Collection
     */
    private function formatNotifications($leaves, $notificationType, $employee = null)
    {
        return $leaves->map(function ($leave) use ($notificationType, $employee) {
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
            } else {
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
            }
        })->sortBy('read')->values();
    }
}