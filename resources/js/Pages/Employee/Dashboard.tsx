import { AppLayout } from "@/Layouts/AppLayout";
import { Head, usePage } from "@inertiajs/react";
import { RequestLeaveModal } from "../Admin/LeaveApplications/Create";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/UI/Card";
import { Button } from "@/Components/UI/Button";
import { Badge } from "@/Components/UI/Badge";
import {
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    Plus,
    UserIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { PageProps as InertiaPageProps } from "@/types";

interface Employee {
    id: number;
    full_name: string;
    email: string;
    department: string;
    position: string;
    joint_date: string;
    status: string;
}

interface LeaveStats {
    total_leave_days: number;
    used_leave_days: number;
    remaining_leave_days: number;
    pending_requests: number;
}

interface LeaveRequest {
    id: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    days_requested: number;
    status: string;
    reason?: string;
}

interface PageProps
    extends InertiaPageProps<{
        employee: Employee;
        leaveStats: LeaveStats;
        recentLeaves: LeaveRequest[];
        upcomingLeaves: LeaveRequest[];
        employeeData: Array<{ id: number; full_name: string; email: string }>;
        leaveTypes: Array<{ value: string; label: string }>;
        error?: string;
    }> {}

export default function EmployeeDashboard() {
    const {
        employee,
        leaveStats,
        recentLeaves,
        upcomingLeaves,
        error,
        auth,
        employeeData,
        leaveTypes,
    } = usePage<PageProps>().props;

    const breadcrumbs = [{ label: "Home" }, { label: "Dashboard" }];
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    if (error) {
        return (
            <AppLayout breadcrumbs={breadcrumbs} title="Dashboard">
                <Head title="Employee Dashboard" />
                <div className="p-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center text-danger">
                                <XCircleIcon className="mx-auto h-12 w-12 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    Error
                                </h3>
                                <p>{error}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    const getStatusBadge = (status: string) => {
        const variants = {
            pending:
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
            approved:
                "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            rejected:
                "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        };
        return (
            variants[status as keyof typeof variants] ||
            "bg-muted text-muted-foreground"
        );
    };

    const leaveStatsData = [
        {
            title: "Total Leave Days",
            value: leaveStats.total_leave_days.toString(),
            description: "Annual allocation",
            icon: CalendarIcon,
            color: "text-blue-600",
        },
        {
            title: "Used Leave Days",
            value: leaveStats.used_leave_days.toString(),
            description: "This year",
            icon: CheckCircleIcon,
            color: "text-green-600",
        },
        {
            title: "Remaining Days",
            value: leaveStats.remaining_leave_days.toString(),
            description: "Available",
            icon: ClockIcon,
            color: "text-orange-600",
        },
        {
            title: "Pending Requests",
            value: leaveStats.pending_requests.toString(),
            description: "Awaiting approval",
            icon: XCircleIcon,
            color: "text-yellow-600",
        },
    ];
    // Handle leave creation success
    const handleLeaveCreated = () => {
        router.get(
            route("admin.leaves.index"),
            {},
            {
                preserveState: false,
                preserveScroll: false,
            }
        );
    };

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
            title="Dashboard"
            showHeader={true}
            headerActions={
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsAddDialogOpen(true)}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Request Leave
                </Button>
            }
        >
            <RequestLeaveModal
                employees={employeeData}
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onLeaveCreated={handleLeaveCreated}
                leaveTypes={leaveTypes}
                auth={auth}
            />
            <Head title="Employee Dashboard" />
            <div className="space-y-6">
                {/* Welcome Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <UserIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">
                                    Welcome back, {employee.full_name}!
                                </CardTitle>
                                <CardDescription>
                                    {employee.position} • {employee.department}{" "}
                                    Department
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Leave Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {leaveStatsData.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={index}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className={`h-4 w-4 ${stat.color}`} />
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Leave Requests */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Leave Requests</CardTitle>
                            <CardDescription>
                                Your latest leave applications
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentLeaves.length > 0 ? (
                                <div className="space-y-4">
                                    {recentLeaves.map((leave) => (
                                        <div
                                            key={leave.id}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium">
                                                        {leave.leave_type}
                                                    </span>
                                                    <Badge
                                                        className={getStatusBadge(
                                                            leave.status
                                                        )}
                                                    >
                                                        {leave.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {leave.start_date} to{" "}
                                                    {leave.end_date} (
                                                    {leave.days_requested} days)
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">
                                    No leave requests found
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Leaves */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Approved Leaves</CardTitle>
                            <CardDescription>
                                Your scheduled time off
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {upcomingLeaves.length > 0 ? (
                                <div className="space-y-4">
                                    {upcomingLeaves.map((leave) => (
                                        <div
                                            key={leave.id}
                                            className="flex items-center justify-between p-3 border border-border rounded-lg bg-success/10"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium">
                                                        {leave.leave_type}
                                                    </span>
                                                    <Badge className="bg-success/20 text-success">
                                                        Approved
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {leave.start_date} to{" "}
                                                    {leave.end_date} (
                                                    {leave.days_requested} days)
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">
                                    No upcoming leaves scheduled
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
