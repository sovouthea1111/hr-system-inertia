import { AppLayout } from "@/Layouts/AppLayout";
import { Head, usePage } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/UI/Card";
import { Button } from "@/Components/UI/Button";
import {
    UsersIcon,
    CalendarCheckIcon,
    ClockIcon,
    TrendingUpIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

interface PageProps {
    stats?: {
        total_employees: number;
        pending_leaves: number;
        approved_leaves: number;
        total_users: number;
    };
    recentLeaveRequests?: LeaveRequest[];
    [key: string]: any;
}

interface LeaveRequest {
    id: string;
    name: string;
    leaveType: string;
    duration: string;
}

export default function AdminDashboard() {
    const pageProps = usePage<PageProps & { auth: any }>().props;
    const { stats, recentLeaveRequests } = pageProps;
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const breadcrumbs = [{ label: "Home" }, { label: "Dashboard" }];

    const safeStats = stats || {
        total_employees: 0,
        pending_leaves: 0,
        approved_leaves: 0,
        total_users: 0,
    };
    console.log(stats);

    const safeRecentLeaveRequests = recentLeaveRequests || [];
    const statsData = [
        {
            title: "Total Employees",
            value: safeStats.total_employees.toString(),
            description: "Active employees",
            icon: UsersIcon,
        },
        {
            title: "Pending Leaves",
            value: safeStats.pending_leaves.toString(),
            description: "Awaiting approval",
            icon: CalendarCheckIcon,
        },
        {
            title: "Approved Leaves",
            value: safeStats.approved_leaves.toString(),
            description: "Currently on leave",
            icon: ClockIcon,
        },
        {
            title: "Total Users",
            value: safeStats.total_users.toString(),
            description: "System users",
            icon: TrendingUpIcon,
        },
    ];

    const handleApprove = async (request: LeaveRequest) => {
        setIsProcessing(request.id);
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
                    leave_id: request.id,
                    action: "approve",
                }),
            });

            if (response.ok) {
                const responseData = await response.json();

                // Display success toast
                toast.success(
                    responseData.message ||
                        "Leave request approved successfully"
                );

                // Refresh the page to get updated data
                window.location.reload();
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

    const handleReject = async (request: LeaveRequest) => {
        setIsProcessing(request.id);
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
                    leave_id: request.id,
                    action: "reject",
                }),
            });

            if (response.ok) {
                const responseData = await response.json();

                // Display success toast
                toast.success(
                    responseData.message ||
                        "Leave request rejected successfully"
                );

                // Refresh the page to get updated data
                window.location.reload();
            } else {
                console.error("Failed to reject leave request");
                toast.error("Failed to reject leave request");
            }
        } catch (error) {
            console.error("Failed to reject leave request:", error);
            toast.error("Failed to reject leave request");
        } finally {
            setIsProcessing(null);
        }
    };

    return (
        <>
            <Head title="Admin Dashboard" />
            <AppLayout
                title="Admin Dashboard"
                breadcrumbs={breadcrumbs}
                headerActions={
                    <Button className="hidden" variant="primary">Generate Report</Button>
                }
            >
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {statsData.map((stat, index) => {
                            const IconComponent = stat.icon;
                            return (
                                <Card key={index}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            {stat.title}
                                        </CardTitle>
                                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {stat.value}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {stat.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Recent Activity */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Recent Leave Requests</CardTitle>
                                <CardDescription>
                                    Latest leave applications requiring
                                    attention
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {safeRecentLeaveRequests.length > 0 ? (
                                        safeRecentLeaveRequests.map(
                                            (request) => (
                                                <div
                                                    key={request.id}
                                                    className="flex items-center justify-between p-4 border rounded-lg"
                                                >
                                                    <div>
                                                        <p className="font-medium">
                                                            {request.name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {request.leaveType}{" "}
                                                            - {request.duration}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={
                                                                isProcessing ===
                                                                request.id
                                                            }
                                                            onClick={() =>
                                                                handleReject(
                                                                    request
                                                                )
                                                            }
                                                        >
                                                            {isProcessing ===
                                                            request.id
                                                                ? "Processing..."
                                                                : "Reject"}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            disabled={
                                                                isProcessing ===
                                                                request.id
                                                            }
                                                            onClick={() =>
                                                                handleApprove(
                                                                    request
                                                                )
                                                            }
                                                        >
                                                            {isProcessing ===
                                                            request.id
                                                                ? "Processing..."
                                                                : "Approve"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        )
                                    ) : (
                                        <div className="p-4 text-center text-muted-foreground">
                                            No pending leave requests
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>
                                    Common administrative tasks
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    className="w-full justify-start"
                                    variant="outline"
                                >
                                    <UsersIcon className="mr-2 h-4 w-4" />
                                    Manage Employees
                                </Button>
                                <Button
                                    className="w-full justify-start"
                                    variant="outline"
                                >
                                    <CalendarCheckIcon className="mr-2 h-4 w-4" />
                                    View All Leaves
                                </Button>
                                <Button
                                    className="w-full justify-start"
                                    variant="outline"
                                >
                                    <ClockIcon className="mr-2 h-4 w-4" />
                                    Attendance Report
                                </Button>
                                <Button
                                    className="w-full justify-start"
                                    variant="outline"
                                >
                                    <TrendingUpIcon className="mr-2 h-4 w-4" />
                                    Analytics
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
