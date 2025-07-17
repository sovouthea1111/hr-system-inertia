import { AppLayout } from "@/Layouts/AppLayout";
import { Head } from "@inertiajs/react";
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

export default function AdminDashboard() {
    const breadcrumbs = [{ label: "Home" }, { label: "Dashboard" }];

    const stats = [
        {
            title: "Total Employees",
            value: "124",
            description: "Active employees",
            icon: UsersIcon,
            trend: "+12%",
        },
        {
            title: "Pending Leaves",
            value: "8",
            description: "Awaiting approval",
            icon: CalendarCheckIcon,
            trend: "+3",
        },
        {
            title: "Today's Attendance",
            value: "98%",
            description: "Present today",
            icon: ClockIcon,
            trend: "+2%",
        },
        {
            title: "This Month",
            value: "95%",
            description: "Average attendance",
            icon: TrendingUpIcon,
            trend: "+5%",
        },
    ];

    return (
        <>
            <Head title="Admin Dashboard" />
            <AppLayout
                title="Admin Dashboard"
                breadcrumbs={breadcrumbs}
                headerActions={
                    <Button variant="primary">Generate Report</Button>
                }
            >
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat, index) => {
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
                                            <span className="text-green-600">
                                                {stat.trend}
                                            </span>{" "}
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
                                    {leaveRequests.length > 0 ? (
                                        leaveRequests.map((request) => (
                                            <div
                                                key={request.id}
                                                className="flex items-center justify-between p-4 border rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-medium">
                                                        {request.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {request.leaveType} -{" "}
                                                        {request.duration}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleReject(
                                                                request.id
                                                            )
                                                        }
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() =>
                                                            handleApprove(
                                                                request.id
                                                            )
                                                        }
                                                    >
                                                        Approve
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
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

interface LeaveRequest {
    id: string;
    name: string;
    leaveType: string;
    duration: string;
}

const leaveRequests: LeaveRequest[] = [
    {
        id: "1",
        name: "John Doe",
        leaveType: "Annual Leave",
        duration: "3 days",
    },
    {
        id: "2",
        name: "Jane Smith",
        leaveType: "Sick Leave",
        duration: "1 day",
    },
    {
        id: "3",
        name: "Mike Johnson",
        leaveType: "Personal Leave",
        duration: "2 days",
    },
];

const handleApprove = (requestId: string) => {
    console.log(`Approving request ${requestId}`);
};

const handleReject = (requestId: string) => {
    console.log(`Rejecting request ${requestId}`);
};
