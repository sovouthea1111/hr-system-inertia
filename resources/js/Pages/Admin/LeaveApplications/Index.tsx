"use client";
import { useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { GroupFilter } from "@/Components/UI/GroupFilter";
import { Button } from "@/Components/UI/Button";
import { Badge } from "@/Components/UI/Badge";
import GroupHeader from "@/Components/UI/GroupHeader";
import { Card, CardContent } from "@/Components/UI/Card";
import { GroupButton } from "@/Components/UI/GroupButton";
import { DeleteConfirmationModal } from "@/Components/UI/PopupDelete";
import { RequestLeaveModal } from "@/Pages/Admin/LeaveApplications/Create";
import { EditLeaveModal } from "@/Pages/Admin/LeaveApplications/Edit";
import { ViewLeaveModal } from "@/Pages/Admin/LeaveApplications/View";
import { Avatar } from "@/Components/UI/Avatar";
import { MobileContainer, MobileCard, MobileField } from "@/Components/UI/MobileView";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/UI/Table";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/Components/UI/Pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/UI/Select";
import { Plus, CheckCircle, Clock, XCircle } from "lucide-react";
import { PageProps as InertiaPageProps } from "@/types";
import toast from "react-hot-toast";

interface LeaveApplication {
    id: number;
    employee_id?: number;
    employee_name: string;
    employee_email: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    days_requested: number;
    reason: string;
    image: string;
    status: "pending" | "approved" | "rejected";
    applied_date: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: LeaveApplication[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

interface PageProps
    extends InertiaPageProps<{
        leaveApplications: PaginatedData;
        filters: {
            employee_name?: string;
            leave_type?: string;
            status?: string;
            start_date?: string;
            end_date?: string;
        };
        leaveTypes: Array<{ value: string; label: string }>;
        statuses: Array<{ value: string; label: string }>;
        canManage?: boolean;
        employees: Array<{ id: number; full_name: string; email: string }>;
    }> {}

export default function LeaveApplicationsPage() {
    const {
        leaveApplications,
        filters,
        leaveTypes,
        statuses,
        canManage,
        employees,
        auth,
    } = usePage<PageProps>().props;

    const isHROrSuperAdmin =
        auth?.user?.user_role === "HR" ||
        auth?.user?.user_role === "SuperAdmin";
    const isEmployee = auth?.user?.user_role === "Employee";

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [applicationToDelete, setApplicationToDelete] =
        useState<LeaveApplication | null>(null);
    const [applicationToEdit, setApplicationToEdit] =
        useState<LeaveApplication | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [employeeNameFilter, setEmployeeNameFilter] = useState(
        filters.employee_name || ""
    );
    const [leaveTypeFilter, setLeaveTypeFilter] = useState(
        filters.leave_type || ""
    );
    const [statusFilter, setStatusFilter] = useState(filters.status || "");
    const [startDateFilter, setStartDateFilter] = useState(
        filters.start_date || ""
    );
    const [endDateFilter, setEndDateFilter] = useState(filters.end_date || "");

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            applyFilters();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [
        employeeNameFilter,
        leaveTypeFilter,
        statusFilter,
        startDateFilter,
        endDateFilter,
    ]);

    const applyFilters = () => {
        const filterData: Record<string, string> = {};
        if (employeeNameFilter) filterData.employee_name = employeeNameFilter;
        if (leaveTypeFilter) filterData.leave_type = leaveTypeFilter;
        if (statusFilter) filterData.status = statusFilter;
        if (startDateFilter) filterData.start_date = startDateFilter;
        if (endDateFilter) filterData.end_date = endDateFilter;

        router.get(route("admin.leaves.index"), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Clear all filters
    const clearFilters = () => {
        setEmployeeNameFilter("");
        setLeaveTypeFilter("");
        setStatusFilter("");
        setStartDateFilter("");
        setEndDateFilter("");

        router.get(
            route("admin.leaves.index"),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    // Handle pagination
    const handlePageChange = (url: string) => {
        if (url) {
            router.get(
                url,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                }
            );
        }
    };

    // Handle per page change
    const handlePerPageChange = (perPage: string) => {
        const currentFilters: Record<string, string | number> = {
            employee_name: employeeNameFilter,
            leave_type: leaveTypeFilter,
            status: statusFilter,
            start_date: startDateFilter,
            end_date: endDateFilter,
            per_page: perPage,
            page: 1, // Reset to first page when changing per_page
        };

        // Remove empty filters
        Object.keys(currentFilters).forEach((key) => {
            if (!currentFilters[key]) {
                delete currentFilters[key];
            }
        });

        router.get(route("admin.leaves.index"), currentFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

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

    // Handle leave update success
    const handleLeaveUpdated = () => {
        router.get(
            route("admin.leaves.index"),
            {},
            {
                preserveState: false,
                preserveScroll: false,
            }
        );
    };

    // Edit handlers
    const handleEdit = (application: LeaveApplication) => {
        setApplicationToEdit(application);
        setIsEditDialogOpen(true);
    };

    // View handlers
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [applicationToView, setApplicationToView] =
        useState<LeaveApplication | null>(null);
    const handleView = (application: LeaveApplication) => {
        setApplicationToView(application);
        setIsViewDialogOpen(true);
    };

    // Delete handlers
    const handleDelete = (application: LeaveApplication) => {
        setApplicationToDelete(application);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!applicationToDelete) return;
        setIsDeleting(true);
        try {
            router.delete(
                route("admin.leaves.destroy", applicationToDelete.id),
                {
                    onSuccess: () => {
                        toast.success("Leave application deleted successfully");
                        setIsDeleteDialogOpen(false);
                        setApplicationToDelete(null);
                    },
                    onError: (errors) => {
                        console.error("Delete errors:", errors);
                        toast.error("Failed to delete leave application");
                    },
                }
            );
        } catch (error) {
            console.error("Delete exception:", error);
            toast.error("An error occurred while deleting");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleStatusUpdate = (applicationId: number, newStatus: string) => {
        router.put(
            route("admin.leaves-status.update", applicationId),
            { status: newStatus },
            {
                onSuccess: (response) => {
                    toast.success("Leave status updated successfully!");
                    router.reload({ only: ["leaveApplications"] });
                },
                onError: (errors) => {
                    toast.error("Failed to update leave status.");
                },
            }
        );
    };
    const getStatusIndicatorClass = (status: string) => {
        switch (status) {
            case "approved":
                return "bg-success";
            case "pending":
                return "bg-warning animate-pulse";
            case "rejected":
            default:
                return "bg-danger";
        }
    };
    const formatStatus = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const breadcrumbs = [
        { label: "Home", href: "/admin/dashboard" },
        { label: "Leave Applications" },
    ];

    // Filter options for GroupFilter component
    const filterOptions = [
        {
            id: "employee_name",
            label: "Employee Name",
            type: "input" as const,
            value: employeeNameFilter,
            placeholder: "Search by employee name...",
        },
        {
            id: "leave_type",
            label: "Leave Type",
            type: "select" as const,
            value: leaveTypeFilter,
            options: leaveTypes,
            placeholder: "All leave types",
        },
        {
            id: "status",
            label: "Status",
            type: "select" as const,
            value: statusFilter,
            options: statuses,
            placeholder: "All statuses",
        },
        {
            id: "start_date",
            label: "Start Date",
            type: "datetime" as const,
            value: startDateFilter,
            placeholder: "Select start date",
            dateValue: startDateFilter ? new Date(startDateFilter) : undefined,
        },
        {
            id: "end_date",
            label: "End Date",
            type: "datetime" as const,
            value: endDateFilter,
            placeholder: "Select end date",
            dateValue: endDateFilter ? new Date(endDateFilter) : undefined,
        },
    ];
    const handleFieldChange = (
        fieldId: string,
        value: string,
        dateValue?: Date
    ) => {
        switch (fieldId) {
            case "employee_name":
                setEmployeeNameFilter(value);
                break;
            case "leave_type":
                setLeaveTypeFilter(value);
                break;
            case "status":
                setStatusFilter(value);
                break;
            case "start_date":
                setStartDateFilter(value);
                break;
            case "end_date":
                setEndDateFilter(value);
                break;
        }
    };

    return (
        <>
            <Head title="Leave Applications" />
            <div className="space-y-6">
                <GroupHeader
                    title="Leave Applications"
                    breadcrumbs={breadcrumbs}
                    headerActions={
                        <div className="flex items-center gap-3">
                            {!isHROrSuperAdmin && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setIsAddDialogOpen(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Request Leave
                                </Button>
                            )}
                        </div>
                    }
                >
                    {/* Filters */}
                    <GroupFilter
                        fields={filterOptions}
                        onFieldChange={handleFieldChange}
                        onClear={clearFilters}
                        title="Filter Leaves"
                    />

                    {/* Leave Applications Table */}
                    <Card>
                        <CardContent className="p-0">
                            {/* Desktop Table View */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Leave Type</TableHead>
                                            <TableHead>Start Date</TableHead>
                                            <TableHead>End Date</TableHead>
                                            <TableHead>Days</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Applied Date</TableHead>
                                            <TableHead className="text-center">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {leaveApplications.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={8}
                                                    className="text-center py-8 text-muted-foreground"
                                                >
                                                    No leave applications found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            leaveApplications.data.map(
                                                (application) => (
                                                    <TableRow key={application.id}>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium text-foreground">
                                                                    {application.employee_name}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {application.employee_email}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-primary/10 text-primary border-primary/20"
                                                            >
                                                                {application.leave_type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            {formatDate(application.start_date)}
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            {formatDate(application.end_date)}
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            {application.days_requested}
                                                        </TableCell>
                                                        <TableCell>
                                                            {isHROrSuperAdmin && application.status === "pending" ? (
                                                                <Select
                                                                    value={application.status}
                                                                    onValueChange={(value) =>
                                                                        handleStatusUpdate(
                                                                            application.id,
                                                                            value as "pending" | "approved" | "rejected"
                                                                        )
                                                                    }
                                                                >
                                                                    <SelectTrigger className="w-auto min-w-[140px] h-8 rounded-full bg-muted border-2 hover:bg-muted/80 transition-colors">
                                                                        <div className="flex items-center gap-2">
                                                                            <div
                                                                                className={`w-2 h-2 rounded-full ${getStatusIndicatorClass(
                                                                                    application.status
                                                                                )}`}
                                                                            />
                                                                            <span className="text-sm font-medium">
                                                                                {formatStatus(application.status)}
                                                                            </span>
                                                                        </div>
                                                                    </SelectTrigger>
                                                                    <SelectContent className="min-w-[160px]">
                                                                        <SelectItem value="approved" className="cursor-pointer">
                                                                            <div className="flex items-center gap-2">
                                                                                <CheckCircle className="w-4 h-4 text-success" />
                                                                                <span>Approved</span>
                                                                            </div>
                                                                        </SelectItem>
                                                                        <SelectItem value="pending" className="cursor-pointer">
                                                                            <div className="flex items-center gap-2">
                                                                                <Clock className="w-4 h-4 text-warning" />
                                                                                <span>Pending</span>
                                                                            </div>
                                                                        </SelectItem>
                                                                        <SelectItem value="rejected" className="cursor-pointer">
                                                                            <div className="flex items-center gap-2">
                                                                                <XCircle className="w-4 h-4 text-danger" />
                                                                                <span>Rejected</span>
                                                                            </div>
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            ) : (
                                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                                                                    {application.status === "approved" ? (
                                                                        <CheckCircle className="w-4 h-4 text-success" />
                                                                    ) : (
                                                                        <XCircle className="w-4 h-4 text-danger" />
                                                                    )}
                                                                    <div
                                                                        className={getStatusIndicatorClass(application.status)}
                                                                    />
                                                                    <span>
                                                                        {formatStatus(application.status)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            {formatDate(application.applied_date)}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <GroupButton
                                                                canEdit={
                                                                    (canManage && !isHROrSuperAdmin) ||
                                                                    (isEmployee && application.status === "pending")
                                                                }
                                                                canDelete={
                                                                    (canManage && !isHROrSuperAdmin) ||
                                                                    (isEmployee && application.status === "pending")
                                                                }
                                                                canView={true}
                                                                onEdit={() => handleEdit(application)}
                                                                onDelete={() => handleDelete(application)}
                                                                onView={() => handleView(application)}
                                                                layout="dropdown"
                                                                itemName={application.employee_name}
                                                                size="sm"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden">
                                {leaveApplications.data.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No leave applications found.
                                    </div>
                                ) : (
                                    <MobileContainer>
                                        {leaveApplications.data.map((application) => (
                                            <MobileCard key={application.id}>
                                                {/* Employee Info Header */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-10 h-10">
                                                            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                                                {application.employee_name.charAt(0).toUpperCase()}
                                                            </div>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium text-foreground">
                                                                {application.employee_name}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {application.employee_email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <GroupButton
                                                        canEdit={
                                                            (canManage && !isHROrSuperAdmin) ||
                                                            (isEmployee && application.status === "pending")
                                                        }
                                                        canDelete={
                                                            (canManage && !isHROrSuperAdmin) ||
                                                            (isEmployee && application.status === "pending")
                                                        }
                                                        canView={true}
                                                        onEdit={() => handleEdit(application)}
                                                        onDelete={() => handleDelete(application)}
                                                        onView={() => handleView(application)}
                                                        layout="dropdown"
                                                        itemName={application.employee_name}
                                                        size="sm"
                                                    />
                                                </div>

                                                {/* Leave Details */}
                                                <div className="space-y-2">
                                                    <MobileField label="Leave Type">
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-primary/10 text-primary border-primary/20"
                                                        >
                                                            {application.leave_type}
                                                        </Badge>
                                                    </MobileField>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <MobileField label="Start Date">
                                                            <span className="text-sm text-muted-foreground">
                                                                {formatDate(application.start_date)}
                                                            </span>
                                                        </MobileField>
                                                        <MobileField label="End Date">
                                                            <span className="text-sm text-muted-foreground">
                                                                {formatDate(application.end_date)}
                                                            </span>
                                                        </MobileField>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <MobileField label="Days Requested">
                                                            <span className="text-sm font-medium">
                                                                {application.days_requested}
                                                            </span>
                                                        </MobileField>
                                                        <MobileField label="Applied Date">
                                                            <span className="text-sm text-muted-foreground">
                                                                {formatDate(application.applied_date)}
                                                            </span>
                                                        </MobileField>
                                                    </div>

                                                    <MobileField label="Status">
                                                        {isHROrSuperAdmin && application.status === "pending" ? (
                                                            <Select
                                                                value={application.status}
                                                                onValueChange={(value) =>
                                                                    handleStatusUpdate(
                                                                        application.id,
                                                                        value as "pending" | "approved" | "rejected"
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="w-full h-8 rounded-full bg-muted border-2 hover:bg-muted/80 transition-colors">
                                                                    <div className="flex items-center gap-2">
                                                                        <div
                                                                            className={`w-2 h-2 rounded-full ${getStatusIndicatorClass(
                                                                                application.status
                                                                            )}`}
                                                                        />
                                                                        <span className="text-sm font-medium">
                                                                            {formatStatus(application.status)}
                                                                        </span>
                                                                    </div>
                                                                </SelectTrigger>
                                                                <SelectContent className="min-w-[160px]">
                                                                    <SelectItem value="approved" className="cursor-pointer">
                                                                        <div className="flex items-center gap-2">
                                                                            <CheckCircle className="w-4 h-4 text-success" />
                                                                            <span>Approved</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                    <SelectItem value="pending" className="cursor-pointer">
                                                                        <div className="flex items-center gap-2">
                                                                            <Clock className="w-4 h-4 text-warning" />
                                                                            <span>Pending</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                    <SelectItem value="rejected" className="cursor-pointer">
                                                                        <div className="flex items-center gap-2">
                                                                            <XCircle className="w-4 h-4 text-danger" />
                                                                            <span>Rejected</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        ) : (
                                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                                                                {application.status === "approved" ? (
                                                                    <CheckCircle className="w-4 h-4 text-success" />
                                                                ) : application.status === "pending" ? (
                                                                    <Clock className="w-4 h-4 text-warning" />
                                                                ) : (
                                                                    <XCircle className="w-4 h-4 text-danger" />
                                                                )}
                                                                <div
                                                                    className={`w-2 h-2 rounded-full ${getStatusIndicatorClass(application.status)}`}
                                                                />
                                                                <span>
                                                                    {formatStatus(application.status)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </MobileField>
                                                </div>
                                            </MobileCard>
                                        ))}
                                    </MobileContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pagination - Only show if there are more than 10 applications */}
                    {leaveApplications.total > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-card border-t border-border gap-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {leaveApplications.from || 0} to{" "}
                                {leaveApplications.to || 0} of{" "}
                                {leaveApplications.total} results
                            </div>

                            {/* Center - Pagination controls (only show if more than one page) - Hidden on mobile */}
                            <div className="hidden md:flex flex-1 justify-center">
                                {leaveApplications.last_page > 1 && (
                                    <Pagination>
                                        <PaginationContent>
                                            {/* Previous Button */}
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() =>
                                                        handlePageChange(
                                                            leaveApplications
                                                                .links[0]
                                                                ?.url || ""
                                                        )
                                                    }
                                                    className={
                                                        leaveApplications.current_page ===
                                                        1
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer"
                                                    }
                                                />
                                            </PaginationItem>

                                            {/* Page Numbers */}
                                            {leaveApplications.links
                                                .slice(1, -1)
                                                .map((link, index) => {
                                                    if (link.label === "...") {
                                                        return (
                                                            <PaginationItem
                                                                key={`ellipsis-${index}`}
                                                            >
                                                                <PaginationEllipsis />
                                                            </PaginationItem>
                                                        );
                                                    }
                                                    return (
                                                        <PaginationItem
                                                            key={`page-${index}`}
                                                        >
                                                            <PaginationLink
                                                                onClick={() =>
                                                                    handlePageChange(
                                                                        link.url ||
                                                                            ""
                                                                    )
                                                                }
                                                                isActive={
                                                                    link.active
                                                                }
                                                                className="cursor-pointer"
                                                            >
                                                                {link.label}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    );
                                                })}

                                            {/* Next Button */}
                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() =>
                                                        handlePageChange(
                                                            leaveApplications
                                                                .links[
                                                                leaveApplications
                                                                    .links
                                                                    .length - 1
                                                            ]?.url || ""
                                                        )
                                                    }
                                                    className={
                                                        leaveApplications.current_page ===
                                                        leaveApplications.last_page
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer"
                                                    }
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                )}
                            </div>

                            {/* Right side - Per-page selector - Hidden on mobile */}
                            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Show:</span>
                                <Select
                                    value={leaveApplications.per_page.toString()}
                                    onValueChange={handlePerPageChange}
                                >
                                    <SelectTrigger className="w-20 h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span>per page</span>
                            </div>
                        </div>
                    )}
                </GroupHeader>

                {/* Request Leave Modal */}
                <RequestLeaveModal
                    employees={employees}
                    isOpen={isAddDialogOpen}
                    onClose={() => setIsAddDialogOpen(false)}
                    onLeaveCreated={handleLeaveCreated}
                    leaveTypes={leaveTypes}
                    auth={auth}
                />

                {/* Edit Leave Modal */}
                <EditLeaveModal
                    isOpen={isEditDialogOpen}
                    onClose={() => {
                        setIsEditDialogOpen(false);
                        setApplicationToEdit(null);
                    }}
                    leave={applicationToEdit}
                    onLeaveUpdated={handleLeaveUpdated}
                    employees={employees}
                    leaveTypes={leaveTypes}
                    statuses={statuses}
                    auth={auth}
                />

                {/* View Leave Modal */}
                <ViewLeaveModal
                    isOpen={isViewDialogOpen}
                    onClose={() => {
                        setIsViewDialogOpen(false);
                        setApplicationToView(null);
                    }}
                    leave={applicationToView}
                />

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationModal
                    isOpen={isDeleteDialogOpen}
                    onClose={() => {
                        setIsDeleteDialogOpen(false);
                        setApplicationToDelete(null);
                    }}
                    onConfirm={confirmDelete}
                    itemName={applicationToDelete?.employee_name}
                    isDeleting={isDeleting}
                    type="single"
                />
            </div>
        </>
    );
}
