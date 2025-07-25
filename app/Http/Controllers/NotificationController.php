<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Leave;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $type = $request->get('type', 'all');
        
        if ($user->user_role === 'HR' || $user->user_role === 'SuperAdmin') {
            $query = Leave::with(['employee'])  
                ->where('status', 'pending');
                
            if ($type === 'pending') {
                $query->where('status', 'pending');
            }
            
            $leaves = $query->orderBy('created_at', 'desc')->get();
            
            $notifications = $leaves->map(function ($leave) {
                return [
                    'id' => $leave->id,
                    'type' => 'leave_request',
                    'title' => 'New Leave Request',
                    'message' => "has requested {$leave->leave_type} leave",
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
            })->sortBy('read')->values();
            
            $unreadCount = Leave::hrUnreadNotifications()->count();
        } else {
            // Employee sees their own leave status updates
            $employee = Employee::where('email', $user->email)->first();
            
            if ($employee) {
                $leaves = Leave::with(['employee'])
                    ->where('employee_id', $employee->id)
                    ->whereIn('status', ['approved', 'rejected'])
                    ->orderBy('updated_at', 'desc')
                    ->get();
                    
                $notifications = $leaves->map(function ($leave) {
                    return [
                        'id' => $leave->id,
                        'type' => 'leave_status',
                        'title' => 'Your Leave Request ' . ucfirst($leave->status),
                        'message' => "{$leave->leave_type} leave request has been {$leave->status}",
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
    
    public function markAsRead(Request $request)
    {
        $request->validate([
            'leave_id' => 'required|exists:leaves,id'
        ]);
        
        $user = Auth::user();
        $leave = Leave::findOrFail($request->leave_id);
        
        if ($user->user_role === 'HR' || $user->user_role === 'SuperAdmin') {
            // Mark HR notification as read
            $leave->update(['hr_notification_read' => true]);
        } else {
            // Mark employee notification as read (verify it's their leave)
            $employee = Employee::where('email', $user->email)->first();
            if ($employee && $leave->employee_id === $employee->id) {
                $leave->update(['employee_notification_read' => true]);
            }
        }
        
        return response()->json(['success' => true]);
    }
    
    public function markAllAsRead()
    {
        $user = Auth::user();
        
        if ($user->user_role === 'HR' || $user->user_role === 'SuperAdmin') {
            // Mark all HR notifications as read
            Leave::where('status', 'pending')
                 ->update(['hr_notification_read' => true]);
        } else {
            // Mark all employee notifications as read
            $employee = Employee::where('email', $user->email)->first();
            if ($employee) {
                Leave::where('employee_id', $employee->id)
                     ->whereIn('status', ['approved', 'rejected'])
                     ->update(['employee_notification_read' => true]);
            }
        }
        
        return response()->json(['success' => true]);
    }
    
    public function update(Request $request)
    {
        $request->validate([
            'leave_id' => 'required|exists:leaves,id',
            'action' => 'required|in:approve,reject'
        ]);
        
        $leave = Leave::findOrFail($request->leave_id);
        
        // Check if user has permission to approve/reject
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
}