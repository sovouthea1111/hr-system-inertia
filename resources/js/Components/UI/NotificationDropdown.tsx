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
            const response = await fetch("/api/notifications", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    notificationId: notification.id,
                    action: "approve",
                }),
            });

            const result = await response.json();
            if (result.success) {
                const updatedNotifications = notifications.filter(
                    (n) => n.id !== notification.id
                );
                const newUnreadCount = unreadCount - 1;
                onNotificationUpdate(updatedNotifications, newUnreadCount);
            }
        } catch (error) {
            console.error("Failed to approve leave request:", error);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleReject = async (notification: Notification) => {
        setIsProcessing(notification.id);
        try {
            const response = await fetch("/api/notifications", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    notificationId: notification.id,
                    action: "reject",
                }),
            });

            const result = await response.json();
            if (result.success) {
                const updatedNotifications = notifications.filter(
                    (n) => n.id !== notification.id
                );
                const newUnreadCount = unreadCount - 1;
                onNotificationUpdate(updatedNotifications, newUnreadCount);
            }
        } catch (error) {
            console.error("Failed to reject leave request:", error);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab);
        onRefresh(newTab);
    };

    const renderNotificationList = (filteredNotifications: Notification[]) => {
        if (isLoading) {
            return (
                <div className="text-center py-8 text-gray-500 text-sm">
                    Loading notifications...
                </div>
            );
        }

        return (
            <div className="space-y-4 max-h-80 overflow-y-auto">
                {filteredNotifications.map((notification) => (
                    <div
                        key={notification.id}
                        className="flex items-start gap-3"
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
                                        <span className="font-medium">
                                            {notification.leaveRequest
                                                ?.employeeName ||
                                                notification.title}
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
                                                    onClick={() =>
                                                        handleReject(
                                                            notification
                                                        )
                                                    }
                                                    disabled={
                                                        isProcessing ===
                                                        notification.id
                                                    }
                                                >
                                                    {isProcessing ===
                                                    notification.id
                                                        ? "..."
                                                        : "Reject"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    className="h-8 px-3 text-xs"
                                                    onClick={() =>
                                                        handleApprove(
                                                            notification
                                                        )
                                                    }
                                                    disabled={
                                                        isProcessing ===
                                                        notification.id
                                                    }
                                                >
                                                    {isProcessing ===
                                                    notification.id
                                                        ? "..."
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
                            {/* Role Toggle for Demo */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    onRoleChange(
                                        userRole === "HR" ? "Employee" : "HR"
                                    )
                                }
                                className="text-xs"
                            >
                                {userRole}
                            </Button>
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
                                {renderNotificationList(notifications)}
                            </TabsContent>

                            <TabsContent value="annual-leave" className="mt-0">
                                {renderNotificationList(notifications)}
                            </TabsContent>

                            <TabsContent value="sick-leave" className="mt-0">
                                {renderNotificationList(notifications)}
                            </TabsContent>
                        </Tabs>
                    ) : (
                        // Employee view - no tabs
                        renderNotificationList(notifications)
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
