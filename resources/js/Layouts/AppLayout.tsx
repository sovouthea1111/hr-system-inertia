"use client";

import * as React from "react";
import { AppSidebar } from "@/Layouts/AppSidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/Components/UI/Sidebar";

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
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import { Toaster } from "@/Components/UI/Toaster";
import toast from "react-hot-toast";

interface FlashProps {
    message?: string;
    success?: string;
    error?: string;
}

interface ExtendedPageProps extends PageProps {
    flash?: FlashProps;
}

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

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: {
        label: string;
        href?: string;
    }[];
    title?: string;
    showHeader?: boolean;
    headerActions?: React.ReactNode;
    userRole?: "HR" | "Employee";
}

export function AppLayout({
    children,
    breadcrumbs = [],
    title,
    showHeader = true,
    headerActions,
    userRole = "Employee",
}: AppLayoutProps) {
    const { auth, flash } = usePage<ExtendedPageProps>().props;
    const authenticatedUserRole = auth?.user?.user_role || "Employee";
    const [notifications, setNotifications] = React.useState<Notification[]>(
        [],
    );

    React.useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.message) {
            toast(flash.message);
        }
    }, [flash]);
    const [unreadCount, setUnreadCount] = React.useState<number>(0);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const fetchNotifications = React.useCallback(
        async (type: string = "all") => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `/api/notifications?type=${type}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                        },
                        credentials: "same-origin",
                    },
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                // Transform backend notifications to match frontend interface
                const transformedNotifications = result.notifications.map(
                    (backendNotification: any) => {
                        // Map leave type to display format
                        const getLeaveTypeDisplay = (type: string) => {
                            switch (type.toLowerCase()) {
                                case "sick":
                                    return "Sick Leave";
                                case "annual":
                                    return "Annual Leave";
                                case "personal":
                                    return "Personal Leave";
                                case "vacation":
                                    return "Annual Leave";
                                default:
                                    return "Personal Leave";
                            }
                        };

                        return {
                            id: backendNotification.id.toString(),
                            type: backendNotification.type,
                            message: backendNotification.message,
                            timestamp: new Date(
                                backendNotification.created_at,
                            ).toLocaleString(),
                            read: backendNotification.read,
                            title: backendNotification.title,
                            leaveRequest: {
                                id: backendNotification.data.leave_id.toString(),
                                employeeName:
                                    backendNotification.data.employee_name || // Looking in data object
                                    "Unknown Employee", // Falls back to this
                                type: getLeaveTypeDisplay(
                                    backendNotification.data.leave_type,
                                ),
                                startDate: backendNotification.data.start_date,
                                endDate: backendNotification.data.end_date,
                                reason: backendNotification.data.reason,
                                status: backendNotification.data.status,
                            },
                        };
                    },
                );

                setNotifications(transformedNotifications);
                setUnreadCount(result.unread_count);
            } catch (error) {
                setNotifications([]);
                setUnreadCount(0);
            } finally {
                setIsLoading(false);
            }
        },
        [],
    );

    React.useEffect(() => {
        fetchNotifications();

        if (window.Echo && auth.user) {
            window.Echo.private(`App.Models.User.${auth.user.id}`)
                .notification((notification: any) => {
                    fetchNotifications();
                    toast.success(notification.message);
                });
        }

        return () => {
            if (window.Echo && auth.user) {
                window.Echo.leave(`App.Models.User.${auth.user.id}`);
            }
        };
    }, [fetchNotifications, auth.user]);

    const handleNotificationUpdate = (
        updatedNotifications: Notification[],
        newUnreadCount: number,
    ) => {
        setNotifications(updatedNotifications);
        setUnreadCount(newUnreadCount);
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                {/* Sticky Header Container */}
                <div className="sticky top-0 z-50 bg-background border-border">
                    {showHeader && (
                        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear">
                            <div className="flex items-center px-4">
                                <SidebarTrigger className="-ml-1 h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground" />
                            </div>

                            {/* Header Actions */}
                            <div className="ml-auto flex items-center gap-2 px-4">
                                <NotificationDropdown
                                    onRoleChange={() => {}}
                                    notifications={notifications}
                                    unreadCount={unreadCount}
                                    userRole={
                                        authenticatedUserRole as
                                            | "HR"
                                            | "Employee"
                                    }
                                    isLoading={isLoading}
                                    onNotificationUpdate={
                                        handleNotificationUpdate
                                    }
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

                    {/* Page Title and Breadcrumbs Section */}
                    <div className="px-6 py-6 border-b border-border">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-foreground">
                                    {title || "Page Title"}
                                </h1>

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
                                                                    className="text-sm text-muted-foreground hover:text-foreground"
                                                                >
                                                                    {
                                                                        breadcrumb.label
                                                                    }
                                                                </BreadcrumbLink>
                                                            ) : (
                                                                <BreadcrumbPage className="text-sm text-foreground font-medium">
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
                                                ),
                                            )}
                                        </BreadcrumbList>
                                    </Breadcrumb>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {headerActions}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-1 flex-col bg-background">
                    <div className="flex-1 p-6">{children}</div>
                </div>
            </SidebarInset>
            <Toaster />
        </SidebarProvider>
    );
}
