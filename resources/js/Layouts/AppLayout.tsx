"use client";

import * as React from "react";
import { AppSidebar } from "@/Layouts/AppSidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/Components/UI/Sidebar";
import { Separator } from "@/Components/UI/Separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/UI/Breadcrumb";
import { Button } from "@/Components/UI/Button";
import { SettingsIcon } from "lucide-react";
import { NotificationDropdown } from "@/Components/UI/NotificationDropdown";

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

interface NotificationResponse {
    success: boolean;
    data: Notification[];
    unreadCount: number;
}

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: {
        label: string;
        href?: string;
    }[];
    title?: string;
    showHeader?: boolean;
    headerActions?: React.ReactNode;
}

export function AppLayout({
    children,
    breadcrumbs = [],
    title,
    showHeader = true,
    headerActions,
}: AppLayoutProps) {
    const [notifications, setNotifications] = React.useState<Notification[]>(
        []
    );
    const [unreadCount, setUnreadCount] = React.useState<number>(0);
    const [userRole, setUserRole] = React.useState<"HR" | "Employee">("HR");
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const fetchNotifications = React.useCallback(
        async (type: string = "all") => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `/api/notifications?role=${userRole}&type=${type}`
                );
                const result: NotificationResponse = await response.json();

                if (result.success) {
                    setNotifications(result.data);
                    setUnreadCount(result.unreadCount);
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            } finally {
                setIsLoading(false);
            }
        },
        [userRole]
    );

    React.useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleNotificationUpdate = (
        updatedNotifications: Notification[],
        newUnreadCount: number
    ) => {
        setNotifications(updatedNotifications);
        setUnreadCount(newUnreadCount);
    };

    const handleRoleChange = (newRole: "HR" | "Employee") => {
        setUserRole(newRole);
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                {/* Sticky Header Container */}
                <div className="sticky top-0 z-50 bg-white">
                    {showHeader && (
                        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b bg-white">
                            <div className="flex items-center gap-2 px-4">
                                <SidebarTrigger className="-ml-1" />
                                <Separator
                                    orientation="vertical"
                                    className="mr-2 h-4"
                                />
                            </div>

                            {/* Header Actions */}
                            <div className="ml-auto flex items-center gap-2 px-4">
                                {/* Notification Dropdown with passed data */}
                                <NotificationDropdown
                                    notifications={notifications}
                                    unreadCount={unreadCount}
                                    userRole={userRole}
                                    isLoading={isLoading}
                                    onNotificationUpdate={
                                        handleNotificationUpdate
                                    }
                                    onRoleChange={handleRoleChange}
                                    onRefresh={fetchNotifications}
                                />

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                >
                                    <SettingsIcon className="h-4 w-4" />
                                    <span className="sr-only">Settings</span>
                                </Button>
                            </div>
                        </header>
                    )}

                    {/* Page Title and Breadcrumbs Section - Now Sticky */}
                    <div className="bg-gray-50 px-6 py-6 border-b">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                {/* Page Title */}
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {title || "Page Title"}
                                </h1>

                                {/* Breadcrumbs */}
                                {breadcrumbs.length > 0 && (
                                    <Breadcrumb>
                                        <BreadcrumbList>
                                            {breadcrumbs.map(
                                                (breadcrumb, index) => (
                                                    <React.Fragment key={index}>
                                                        <BreadcrumbItem>
                                                            {breadcrumb.href ? (
                                                                <BreadcrumbLink
                                                                    href={
                                                                        breadcrumb.href
                                                                    }
                                                                    className="text-sm text-gray-600 hover:text-gray-900"
                                                                >
                                                                    {
                                                                        breadcrumb.label
                                                                    }
                                                                </BreadcrumbLink>
                                                            ) : (
                                                                <BreadcrumbPage className="text-sm text-gray-900 font-medium">
                                                                    {
                                                                        breadcrumb.label
                                                                    }
                                                                </BreadcrumbPage>
                                                            )}
                                                        </BreadcrumbItem>
                                                        {index <
                                                            breadcrumbs.length -
                                                                1 && (
                                                            <BreadcrumbSeparator />
                                                        )}
                                                    </React.Fragment>
                                                )
                                            )}
                                        </BreadcrumbList>
                                    </Breadcrumb>
                                )}
                            </div>

                            {/* Action Button */}
                            <div className="flex items-center gap-2">
                                {headerActions}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-1 flex-col bg-gray-50">
                    <div className="flex-1 p-6">{children}</div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
