"use client";

import React, { useState } from "react";
import { BellIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/UI/Avatar";
import { Badge } from "@/Components/UI/Badge";
import { Button } from "@/Components/UI/Button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/Components/UI/DropdownMenu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/UI/Tab";
import toast from "react-hot-toast";
import { router } from "@inertiajs/react";

interface LeaveRequest {
    id: string;
    employeeName: string;
    employeeAvatar?: string;
    type: "Annual Leave" | "Sick Leave" | "Personal Leave";
    startDate: string;
    endDate: string;
    reason?: string;
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
    userRole: "HR" | "Employee";
    isLoading: boolean;
    onNotificationUpdate: (
        notifications: Notification[],
        unreadCount: number
    ) => void;
    onRoleChange: (role: "HR" | "Employee") => void;
    onRefresh: (type?: string) => void;
}

export function NotificationDropdown({
    notifications,
    unreadCount,
    userRole,
    isLoading,
    onNotificationUpdate,
    onRoleChange,
    onRefresh,
}: NotificationDropdownProps) {
    const [activeTab, setActiveTab] = useState<string>("all");
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [isMarkingRead, setIsMarkingRead] = useState<string | null>(null);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("");
    };

    const getTabCount = (tab: string) => {
        if (tab === "all") return notifications.length;
        return notifications.filter((n) =>
            n.leaveRequest?.type.toLowerCase().includes(tab.replace("-", " "))
        ).length;
    };

    const handleApprove = async (notification: Notification) => {
        setIsProcessing(notification.id);
        try {
            // Get CSRF token from cookie
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
                    action: "approve",
                }),
            });

            if (response.ok) {
                const responseData = await response.json();

                // Display toast message from backend
                toast.success(
                    responseData.message ||
                        "Leave request approved successfully"
                );

                const updatedNotifications = notifications.filter(
                    (n) => n.id !== notification.id
                );
                const newUnreadCount = Math.max(0, unreadCount - 1);
                onNotificationUpdate(updatedNotifications, newUnreadCount);

                onRefresh();
            } else {
                console.error("Failed to approve leave request");
                toast.error("Failed to approve leave request");
            }
        } catch (error) {
            console.error("Failed to approve leave request:", error);
            toast.error("Failed to approve leave request");
        } finally {
            setIsProcessing(null);
        }
    };

    const handleReject = async (notification: Notification) => {
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
                    action: "reject",
                }),
            });

            if (response.ok) {
                const responseData = await response.json();

                // Display toast message from backend
                toast.success(
                    responseData.message ||
                        "Leave request rejected successfully"
                );

                const updatedNotifications = notifications.filter(
                    (n) => n.id !== notification.id
                );
                const newUnreadCount = Math.max(0, unreadCount - 1);
                onNotificationUpdate(updatedNotifications, newUnreadCount);

                // Refresh to get updated data
                onRefresh();
            } else {
                console.error("Failed to reject leave request");
            }
        } catch (error) {
            console.error("Failed to reject leave request:", error);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleMarkAsRead = async (notification: Notification) => {
        setIsMarkingRead(notification.id);
        try {
            // Get CSRF token from cookie
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
                // Update the notification locally
                const updatedNotifications = notifications.map((n) =>
                    n.id === notification.id ? { ...n, read: true } : n
                );
                const newUnreadCount = Math.max(0, unreadCount - 1);
                onNotificationUpdate(updatedNotifications, newUnreadCount);

                // Navigate to leave application view page if it's a leave-related notification
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

    // Update the renderNotificationList function to filter notifications by tab
    const renderNotificationList = (tabValue: string) => {
        if (isLoading) {
            return (
                <div className="text-center py-8 text-gray-500 text-sm">
                    Loading notifications...
                </div>
            );
        }

        // Filter notifications based on the active tab
        const filteredNotifications =
            tabValue === "all"
                ? notifications
                : notifications.filter((notification) => {
                      const leaveType =
                          notification.leaveRequest?.type.toLowerCase();
                      return (
                          leaveType &&
                          leaveType.includes(tabValue.replace("-", " "))
                      );
                  });

        return (
            <div className="space-y-4 max-h-80 overflow-y-auto border border-card">
                {filteredNotifications.map((notification) => (
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
                                src={notification.leaveRequest?.employeeAvatar}
                            />
                            <AvatarFallback className="bg-gray-200">
                                {getInitials(
                                    notification.leaveRequest?.employeeName ||
                                        "U"
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
                                                (userRole !== "HR"
                                                    ? "Your"
                                                    : "")}
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {notification.message}
                                        </span>
                                    </p>
                                    {/* Action Buttons - Only show for HR role and leave requests */}
                                    {userRole === "HR" &&
                                        notification.type ===
                                            "leave_request" && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    className="h-8 px-3 text-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleReject(
                                                            notification
                                                        );
                                                    }}
                                                    disabled={
                                                        isProcessing ===
                                                        notification.id
                                                    }
                                                >
                                                    {isProcessing ===
                                                    notification.id
                                                        ? "Rejecting"
                                                        : "Reject"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    className="h-8 px-3 text-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleApprove(
                                                            notification
                                                        );
                                                    }}
                                                    disabled={
                                                        isProcessing ===
                                                        notification.id
                                                    }
                                                >
                                                    {isProcessing ===
                                                    notification.id
                                                        ? "Approving"
                                                        : "Approve"}
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
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        )}
                    </div>
                ))}

                {filteredNotifications.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No notifications found
                    </div>
                )}
            </div>
        );
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <BellIcon className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-96 p-0" align="end">
                <div className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Notifications</h2>
                        <div className="flex items-center gap-2">
                            {/* Removed "Mark all as read" button */}
                            <Button
                                variant="link"
                                className="text-primary p-0 h-auto font-normal"
                            >
                                See all
                            </Button>
                        </div>
                    </div>

                    {/* Tabs Component - Only show for HR */}
                    {userRole === "HR" ? (
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

                            <TabsContent value="annual-leave" className="mt-0">
                                {renderNotificationList("annual-leave")}
                            </TabsContent>

                            <TabsContent value="sick-leave" className="mt-0">
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
    );
}
