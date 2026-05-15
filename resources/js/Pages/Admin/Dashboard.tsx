import { AppLayout } from "@/Layouts/AppLayout";
import { Head, usePage, router } from "@inertiajs/react";
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
import { useState } from "react";
import toast from "react-hot-toast";
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
import { Label } from "@/Components/UI/Label";
import { Textarea } from "@/Components/UI/Textarea";

interface DepartmentStat {
    name: string;
    total: number;
    active: number;
    on_leave: number;
}

interface OnLeaveSummary {
    id: number;
    name: string;
    department: string;
    leave_type: string;
    start_date: string;
    end_date: string;
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
    onLeaveSummary?: OnLeaveSummary[];
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
    const { stats, recentLeaveRequests, departmentStats, onLeaveSummary } =
        pageProps;
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [commentModal, setCommentModal] = useState<{
        request: LeaveRequest;
        action: "approve" | "reject";
    } | null>(null);
    const [comment, setComment] = useState<string>("");

    const breadcrumbs = [{ label: "Home" }, { label: "Dashboard" }];

    const safeStats = stats || {
        total_employees: 0,
        pending_leaves: 0,
        approved_leaves: 0,
        total_users: 0,
    };

    const safeDepartmentStats = departmentStats || [];
    const safeOnLeaveSummary = onLeaveSummary || [];

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

    const handleApprove = (request: LeaveRequest) => {
        setCommentModal({ request, action: "approve" });
        setComment("");
    };

    const handleReject = (request: LeaveRequest) => {
        setCommentModal({ request, action: "reject" });
        setComment("");
    };

    const handleActionConfirm = async () => {
        if (!commentModal) return;

        const { request, action } = commentModal;
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
                    action: action,
                    comment: comment.trim() || null,
                }),
            });

            if (response.ok) {
                toast.success(
                    `Leave request for ${request.name} ${action}d successfully`
                );
                setCommentModal(null);
                setComment("");
                router.reload();
            } else {
                toast.error(`Failed to ${action} leave request`);
            }
        } catch (error) {
            toast.error(
                `An error occurred while ${action}ing the leave request`
            );
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
                                            <span className="text-sm text-success">
                                                +5%
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {stat.value}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
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
                                                            <span className="text-sm text-muted-foreground ml-2">
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

                    {/* On Leave Summary Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>On Leave Today</CardTitle>
                            <CardDescription>
                                Employees currently away for task coordination
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {safeOnLeaveSummary.length > 0 ? (
                                    safeOnLeaveSummary.map((leave) => (
                                        <div
                                            key={leave.id}
                                            className="p-4 border rounded-lg flex flex-col gap-1 bg-blue-50/50 border-blue-100"
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
                                                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
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
                                        No employees currently on leave today.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

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
                                You can optionally add a comment for the
                                employee.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="space-y-4 py-4">
                            {commentModal && (
                                <div className="bg-gray-50 p-3 rounded-md">
                                    <p className="text-sm font-medium text-gray-900">
                                        {commentModal.request.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {commentModal.request.leaveType} -{" "}
                                        {commentModal.request.duration}
                                    </p>
                                </div>
                            )}

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
                            </div>
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel
                                disabled={isProcessing !== null}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                className={
                                    commentModal?.action === "reject"
                                        ? "bg-danger hover:bg-red-700 focus:ring-danger text-white"
                                        : "bg-primary hover:bg-primary-hover focus:ring-primary text-white"
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
            </AppLayout>
        </>
    );
}
