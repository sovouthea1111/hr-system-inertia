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
    Infinity,
} from "lucide-react";
import { useState } from "react";
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
        onLeaveSummary?: Array<{
            id: number;
            name: string;
            department: string;
            leave_type: string;
            start_date: string;
            end_date: string;
        }>;
        employeeData: Array<{ id: number; full_name: string; email: string }>;
        leaveTypes: Array<{ value: string; label: string }>;
        leaveBalance: Record<
            string,
            {
                entitlement: number | string;
                used: number;
                remaining: number | string;
                percentage_used: number;
            }
        >;
        error?: string;
    }> {}

export default function EmployeeDashboard() {
    const {
        employee,
        leaveStats,
        recentLeaves,
        upcomingLeaves,
        onLeaveSummary,
        error,
        auth,
        employeeData,
        leaveTypes,
        leaveBalance,
    } = usePage<PageProps>().props;

    const safeOnLeaveSummary = onLeaveSummary || [];

    const breadcrumbs = [{ label: "Home" }, { label: "Dashboard" }];
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const checkProbation = (date?: string) => {
        if (!date) return false;
        const jointDate = new Date(date);
        const probationEndDate = new Date(jointDate);
        probationEndDate.setMonth(probationEndDate.getMonth() + 3);
        return new Date() < probationEndDate;
    };

    const isInProbation = checkProbation(employee.joint_date);

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
                                    <p className="text-sm text-muted-foreground">
                                        {stat.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Leave Type Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Leave type summary</CardTitle>
                        <CardDescription>
                            Allocation overview for this year
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {/* Annual Leave */}
                            <div className="flex items-center justify-between p-4">
                                <span className="font-medium">Annual leave</span>
                                <div className="flex items-center gap-4">
                                    {isInProbation ? (
                                        <>
                                            <span className="text-sm text-muted-foreground">
                                                Available after 3 months
                                            </span>
                                            <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-none">
                                                Locked
                                            </Badge>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-sm text-muted-foreground">
                                                {leaveBalance.annual?.entitlement} days
                                                allocated • {leaveBalance.annual?.used}{" "}
                                                used
                                            </span>
                                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
                                                {leaveBalance.annual?.remaining}{" "}
                                                remaining
                                            </Badge>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Sick Leave */}
                            <div className="flex items-center justify-between p-4">
                                <span className="font-medium">Sick leave</span>
                                <div className="flex items-center gap-4">
                                    {isInProbation ? (
                                        <>
                                            <span className="text-sm text-muted-foreground">
                                                Available after 3 months
                                            </span>
                                            <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-none">
                                                Locked
                                            </Badge>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-sm text-muted-foreground">
                                                {leaveBalance.sick?.entitlement} days
                                                allocated • {leaveBalance.sick?.used}{" "}
                                                used
                                            </span>
                                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">
                                                {leaveBalance.sick?.remaining} remaining
                                            </Badge>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Unpaid Leave */}
                            <div className="flex items-center justify-between p-4">
                                <span className="font-medium">Unpaid leave</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-muted-foreground">
                                        No limit
                                    </span>
                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none flex items-center gap-1">
                                        <Infinity className="h-3 w-3" /> Unlimited
                                    </Badge>
                                </div>
                            </div>

                            {/* Maternity / Paternity */}
                            <div className="flex items-center justify-between p-4">
                                <span className="font-medium">
                                    Maternity / Paternity
                                </span>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-muted-foreground">
                                        Per company policy
                                    </span>
                                    <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none">
                                        Refer to HR
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

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

                {/* On Leave Summary Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Team On Leave Today</CardTitle>
                        <CardDescription>
                            Colleagues currently away for task coordination
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {safeOnLeaveSummary.length > 0 ? (
                                safeOnLeaveSummary.map((leave) => (
                                    <div
                                        key={leave.id}
                                        className="p-4 border rounded-lg flex flex-col gap-1 bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-sm">
                                                    {leave.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {leave.department}
                                                </p>
                                            </div>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                On Leave
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-muted-foreground mt-1">
                                            {leave.leave_type}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-8 text-center text-muted-foreground text-sm">
                                    No team members currently on leave today.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
