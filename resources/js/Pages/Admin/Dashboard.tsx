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

interface DepartmentStat {
    name: string;
    total: number;
    active: number;
    on_leave: number;
}

interface PageProps {
    stats?: {
        total_employees: number;
        active_employees: number;
        pending_leaves: number;
        approved_leaves: number;
        total_users: number;
    };
    recentLeaveRequests?: LeaveRequest[];
    departmentStats?: DepartmentStat[];
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
    const { stats, recentLeaveRequests, departmentStats } = pageProps;
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const breadcrumbs = [{ label: "Home" }, { label: "Dashboard" }];

    const safeStats = stats || {
        total_employees: 0,
        pending_leaves: 0,
        approved_leaves: 0,
        total_users: 0,
    };
    console.log(stats);

    const safeDepartmentStats = departmentStats || [];

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
                    <div className="flex gap-2">
                        <Button className="hidden" variant="outline">
                            Export Report
                        </Button>
                        <Button className="hidden" variant="primary">
                            Add Employee
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    {/* Enhanced Stats Grid with Trends */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {statsData.map((stat, index) => {
                            const IconComponent = stat.icon;
                            return (
                                <Card
                                    key={index}
                                    className="hover:shadow-md transition-shadow"
                                >
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            {stat.title}
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                                            {/* Add trend indicator */}
                                            <span className="text-xs text-success">
                                                +5%
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {stat.value}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {stat.description}
                                        </p>
                                        {/* Add mini chart or progress bar */}
                                        <div className="mt-2 h-1 bg-muted rounded">
                                            <div
                                                className="h-1 bg-primary rounded"
                                                style={{ width: "60%" }}
                                            ></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Main Content Grid - 3 Column Layout */}
                    <div className="grid gap-6 lg:grid-cols-12">
                        {/* Recent Leave Requests - 5 columns */}
                        <Card className="lg:col-span-5">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Recent Leave Requests</CardTitle>
                                    <CardDescription>
                                        Latest applications requiring attention
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" size="sm">
                                    View All
                                </Button>
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
                        {/* Department Overview */}
                        <Card className="lg:col-span-7">
                            <CardHeader>
                                <CardTitle>Department Overview</CardTitle>
                                <CardDescription>
                                    Employee distribution by department
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {safeDepartmentStats.length > 0 ? (
                                        safeDepartmentStats.map(
                                            (dept, index) => {
                                                const maxEmployees = Math.max(
                                                    ...safeDepartmentStats.map(
                                                        (d) => d.total
                                                    )
                                                );
                                                const widthPercentage =
                                                    maxEmployees > 0
                                                        ? (dept.total /
                                                              maxEmployees) *
                                                          80
                                                        : 0;

                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex justify-between items-center"
                                                    >
                                                        <span className="text-sm font-medium">
                                                            {dept.name}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-20 h-2 bg-muted rounded">
                                                                <div
                                                                    className="h-2 bg-primary rounded"
                                                                    style={{
                                                                        width: `${widthPercentage}%`,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm font-medium">
                                                                {dept.total}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground ml-2">
                                                                ({dept.active}{" "}
                                                                active,{" "}
                                                                {dept.on_leave}{" "}
                                                                on leave)
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )
                                    ) : (
                                        <div className="p-4 text-center text-muted-foreground">
                                            No department data available
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
