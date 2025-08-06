"use client";

import React, { useState, useEffect } from "react";
import { BellIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/UI/Avatar";
import { Badge } from "@/Components/UI/Badge";
import { Button } from "@/Components/UI/Button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/Components/UI/DropdownMenu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/UI/AlertDialog";
import { Textarea } from "@/Components/UI/Textarea";
import { Label } from "@/Components/UI/Label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/UI/Tab";
import toast from "react-hot-toast";
import { router } from "@inertiajs/react";

interface LeaveRequest {
    id: string;
    employeeId?: string | number; // Add employee ID for comparison
    employeeName: string;
    employeeAvatar?: string;
    type: "Annual Leave" | "Sick Leave" | "Personal Leave";
    startDate: string;
    endDate: string;
    reason?: string;
    image?: string;
    status: "pending" | "approved" | "rejected";
}

interface Notification {
    id: string;
    type: "leave_request" | "leave_approved" | "leave_rejected" | "system";
    message: string;
    timestamp: string;
    read: boolean;
    leaveRequest?: LeaveRequest;
    title?: string;
}

interface NotificationDropdownProps {
    notifications: Notification[];
    unreadCount: number;
    userRole: "HR" | "Employee" | "SuperAdmin";
    currentUserId?: string | number;
    currentUserName?: string;
    isLoading: boolean;
    onNotificationUpdate: (
        notifications: Notification[],
        unreadCount: number
    ) => void;
    onRoleChange: (role: "HR" | "Employee" | "SuperAdmin") => void;
    onRefresh: (type?: string) => void;
}

interface CommentModalData {
    notification: Notification;
    action: "approve" | "reject";
}

export function NotificationDropdown({
    notifications,
    unreadCount,
    userRole,
    currentUserId,
    currentUserName,
    isLoading,
    onNotificationUpdate,
    onRoleChange,
    onRefresh,
}: NotificationDropdownProps) {
    const [activeTab, setActiveTab] = useState<string>("all");
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [isMarkingRead, setIsMarkingRead] = useState<string | null>(null);
    const [commentModal, setCommentModal] = useState<CommentModalData | null>(
        null
    );
    const [comment, setComment] = useState<string>("");
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("");
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatDateRange = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const formatOptions: Intl.DateTimeFormatOptions = {
            month: "short",
            day: "numeric",
        };

        if (
            start.getMonth() === end.getMonth() &&
            start.getFullYear() === end.getFullYear()
        ) {
            return `${start.getDate()}-${end.getDate()} ${start.toLocaleDateString(
                "en-US",
                { month: "short", year: "numeric" }
            )}`;
        }

        return `${start.toLocaleDateString(
            "en-US",
            formatOptions
        )} - ${end.toLocaleDateString("en-US", {
            ...formatOptions,
            year: "numeric",
        })}`;
    };
    const isCurrentUserLeaveRequester = (
        notification: Notification
    ): boolean => {
        if (!notification.leaveRequest) return false;

        if (currentUserId && notification.leaveRequest.employeeId) {
            const isSame =
                currentUserId.toString() ===
                notification.leaveRequest.employeeId.toString();
            return isSame;
        }

        if (currentUserName && notification.leaveRequest.employeeName) {
            const currentName = currentUserName.toLowerCase().trim();
            const requestName = notification.leaveRequest.employeeName
                .toLowerCase()
                .trim();
            const isSame = currentName === requestName;
            return isSame;
        }
        if (userRole === "HR" && notification.leaveRequest.employeeName) {
            const employeeName =
                notification.leaveRequest.employeeName.toLowerCase();
            const isSelfRequest =
                employeeName.includes("hr") &&
                employeeName.split(" ").length <= 2;
            return isSelfRequest;
        }

        return false;
    };

    function getFilteredNotifications() {
        return notifications.filter((notification) => {
            if (notification.type === "leave_request") {
                return !isCurrentUserLeaveRequester(notification);
            }
            return true;
        });
    }

    const filteredNotifications = getFilteredNotifications();
    const filteredUnreadCount = filteredNotifications.filter(
        (n) => !n.read
    ).length;

    useEffect(() => {
        console.log("NotificationDropdown props:", {
            notifications: notifications.length,
            unreadCount,
            userRole,
            currentUserId,
            currentUserName,
            isLoading,
            notificationsData: notifications,
        });
    }, [
        notifications,
        unreadCount,
        userRole,
        currentUserId,
        currentUserName,
        isLoading,
    ]);

    const getTabCount = (tab: string) => {
        if (tab === "all") return filteredNotifications.length;
        return filteredNotifications.filter((n) =>
            n.leaveRequest?.type.toLowerCase().includes(tab.replace("-", " "))
        ).length;
    };

    const handleActionClick = (
        notification: Notification,
        action: "approve" | "reject"
    ) => {
        setCommentModal({ notification, action });
        setComment("");
    };

    const handleActionConfirm = async () => {
        if (!commentModal) return;

        const { notification, action } = commentModal;
        setIsProcessing(notification.id);

        try {
            const xsrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("XSRF-TOKEN="))
                ?.split("=")[1];
            const decodedToken = xsrfToken ? decodeURIComponent(xsrfToken) : "";

            const response = await fetch("/api/notifications", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-XSRF-TOKEN": decodedToken,
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    leave_id: notification.leaveRequest?.id,
                    action: action,
                    comment: comment.trim() || null, // Send comment if provided
                }),
            });

            if (response.ok) {
                const responseData = await response.json();
                toast.success(
                    responseData.message ||
                        `Leave request ${action}d successfully`
                );

                setCommentModal(null);
                setComment("");

                window.location.reload();
            } else {
                toast.error(`Failed to ${action} leave request`);
            }
        } catch (error) {
            console.error(`Failed to ${action} leave request:`, error);
            toast.error(`Failed to ${action} leave request`);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleMarkAsRead = async (notification: Notification) => {
        setIsMarkingRead(notification.id);
        try {
            const xsrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("XSRF-TOKEN="))
                ?.split("=")[1];
            const decodedToken = xsrfToken ? decodeURIComponent(xsrfToken) : "";

            const response = await fetch("/api/notifications/mark-as-read", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-XSRF-TOKEN": decodedToken,
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    leave_id: notification.id,
                }),
            });

            if (response.ok) {
                const updatedNotifications = notifications.map((n) =>
                    n.id === notification.id ? { ...n, read: true } : n
                );
                const newUnreadCount = Math.max(0, unreadCount - 1);
                onNotificationUpdate(updatedNotifications, newUnreadCount);

                if (notification.leaveRequest?.id) {
                    router.visit(
                        route("admin.leaves.view", notification.leaveRequest.id)
                    );
                }
            }
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        } finally {
            setIsMarkingRead(null);
        }
    };

    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab);
        onRefresh(newTab);
    };

    const hasAdminPrivileges = userRole === "HR" || userRole === "SuperAdmin";

    const renderNotificationList = (tabValue: string) => {
        if (isLoading) {
            return (
                <div className="text-center py-8 text-gray-500 text-sm">
                    Loading notifications...
                </div>
            );
        }

        const filteredNotificationsByTab =
            tabValue === "all"
                ? filteredNotifications
                : filteredNotifications.filter((notification) => {
                      const leaveType =
                          notification.leaveRequest?.type.toLowerCase();
                      return (
                          leaveType &&
                          leaveType.includes(tabValue.replace("-", " "))
                      );
                  });

        return (
            <div className="space-y-4 max-h-80 overflow-y-auto border border-card">
                {filteredNotificationsByTab.map((notification) => {
                    const canTakeAction =
                        hasAdminPrivileges &&
                        notification.type === "leave_request" &&
                        notification.leaveRequest?.status === "pending";

                    return (
                        <div
                            key={notification.id}
                            className={`flex items-start gap-3 p-2 rounded cursor-pointer bg-card hover:bg-gray-50 ${
                                !notification.read
                                    ? "bg-blue-50 border-l-4 border-primary"
                                    : ""
                            }`}
                            onClick={() => handleMarkAsRead(notification)}
                        >
                            {/* Avatar */}
                            <Avatar className="h-10 w-10 mt-1">
                                <AvatarImage
                                    src={
                                        notification.leaveRequest
                                            ?.employeeAvatar
                                    }
                                />
                                <AvatarFallback className="bg-gray-200">
                                    {getInitials(
                                        notification.leaveRequest
                                            ?.employeeName || "U"
                                    )}
                                </AvatarFallback>
                            </Avatar>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm">
                                            <span className="text-primary font-medium">
                                                {notification.leaveRequest
                                                    ?.employeeName ||
                                                    notification.title ||
                                                    "User"}
                                            </span>{" "}
                                            <span className="text-gray-600">
                                                {notification.message}
                                            </span>
                                        </p>

                                        {/* Action Buttons - Only show for leave requests */}
                                        {canTakeAction && (
                                            <div className="flex gap-2 mt-2">
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    className="h-8 px-3 text-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleActionClick(
                                                            notification,
                                                            "reject"
                                                        );
                                                    }}
                                                    disabled={
                                                        isProcessing ===
                                                        notification.id
                                                    }
                                                >
                                                    Reject
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    className="h-8 px-3 text-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleActionClick(
                                                            notification,
                                                            "approve"
                                                        );
                                                    }}
                                                    disabled={
                                                        isProcessing ===
                                                        notification.id
                                                    }
                                                >
                                                    Approve
                                                </Button>
                                            </div>
                                        )}

                                        <p className="text-xs text-gray-500 mt-1">
                                            {notification.timestamp}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Unread indicator */}
                            {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            )}
                        </div>
                    );
                })}

                {filteredNotificationsByTab.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No notifications found
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <BellIcon className="h-4 w-4" />
                        {filteredUnreadCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                            >
                                {filteredUnreadCount}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-96 p-0" align="end">
                    <div className="p-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">
                                Notifications
                            </h2>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="link"
                                    className="text-primary p-0 h-auto font-normal"
                                >
                                    See all
                                </Button>
                            </div>
                        </div>

                        {/* Tabs Component - Only show for admin roles (HR or SuperAdmin) */}
                        {hasAdminPrivileges ? (
                            <Tabs
                                value={activeTab}
                                onValueChange={handleTabChange}
                                className="w-full"
                            >
                                <TabsList className="grid w-full grid-cols-3 mb-4 bg-transparent border-b rounded-none h-auto p-0">
                                    <TabsTrigger
                                        value="all"
                                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent pb-2 text-sm font-medium transition-colors hover:text-gray-700"
                                    >
                                        All {getTabCount("all")}
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="annual-leave"
                                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent pb-2 text-sm font-medium transition-colors hover:text-gray-700"
                                    >
                                        Annual Leave
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="sick-leave"
                                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent pb-2 text-sm font-medium transition-colors hover:text-gray-700"
                                    >
                                        Sick Leave
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="all" className="mt-0">
                                    {renderNotificationList("all")}
                                </TabsContent>

                                <TabsContent
                                    value="annual-leave"
                                    className="mt-0"
                                >
                                    {renderNotificationList("annual-leave")}
                                </TabsContent>

                                <TabsContent
                                    value="sick-leave"
                                    className="mt-0"
                                >
                                    {renderNotificationList("sick-leave")}
                                </TabsContent>
                            </Tabs>
                        ) : (
                            // Employee view - no tabs
                            renderNotificationList("all")
                        )}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Comment Alert Dialog */}
            <AlertDialog
                open={!!commentModal}
                onOpenChange={() => setCommentModal(null)}
            >
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {commentModal?.action === "approve"
                                ? "Approve"
                                : "Reject"}{" "}
                            Leave Request
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {commentModal?.action === "approve"
                                ? "You are about to approve this leave request."
                                : "You are about to reject this leave request."}{" "}
                            You can optionally add a comment for the employee.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Leave Request Summary */}
                        {commentModal && (
                            <div className="bg-gray-50 p-3 rounded-md">
                                <p className="text-sm font-medium text-gray-900">
                                    {
                                        commentModal.notification.leaveRequest
                                            ?.employeeName
                                    }
                                </p>
                                <p className="text-sm text-gray-600">
                                    {
                                        commentModal.notification.leaveRequest
                                            ?.type
                                    }{" "}
                                    -{" "}
                                    {commentModal.notification.leaveRequest
                                        ?.startDate &&
                                        commentModal.notification.leaveRequest
                                            ?.endDate &&
                                        formatDateRange(
                                            commentModal.notification
                                                .leaveRequest.startDate,
                                            commentModal.notification
                                                .leaveRequest.endDate
                                        )}
                                </p>
                            </div>
                        )}

                        {/* Comment Input */}
                        <div className="space-y-2">
                            <Label htmlFor="comment">
                                Comment{" "}
                                {commentModal?.action === "reject"
                                    ? "(recommended)"
                                    : "(optional)"}
                            </Label>
                            <Textarea
                                id="comment"
                                placeholder={
                                    commentModal?.action === "approve"
                                        ? "Add an optional comment for the employee..."
                                        : "Please provide a reason for rejection..."
                                }
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                                className="resize-none"
                            />
                            <p className="text-xs text-gray-500">
                                This comment will be visible to the employee.
                            </p>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing !== null}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className={
                                commentModal?.action === "reject"
                                    ? "bg-danger hover:bg-red-700 focus:ring-danger"
                                    : "bg-primary hover:bg-primary/90 focus:ring-primary"
                            }
                            onClick={handleActionConfirm}
                            disabled={isProcessing !== null}
                        >
                            {isProcessing !== null
                                ? `${
                                      commentModal?.action === "approve"
                                          ? "Approving"
                                          : "Rejecting"
                                  }...`
                                : `${
                                      commentModal?.action === "approve"
                                          ? "Approve"
                                          : "Reject"
                                  } Request`}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
