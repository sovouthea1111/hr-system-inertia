"use client";
import { useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { GroupFilter } from "@/Components/UI/GroupFilter";
import { Button } from "@/Components/UI/Button";
import { Badge } from "@/Components/UI/Badge";
import GroupHeader from "@/Components/UI/GroupHeader";
import { Card, CardContent } from "@/Components/UI/Card";
import { GroupButton } from "@/Components/UI/GroupButton";
import { RequestLeaveModal } from "@/Pages/Admin/LeaveApplications/Create";
import { DeleteConfirmationModal } from "@/Components/UI/PopupDelete";
import { ViewLeaveModal } from "@/Pages/Admin/LeaveApplications/View";
import { EditLeaveModal } from "@/Pages/Admin/LeaveApplications/Edit";

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
import { CheckCircle, Clock, XCircle, Plus } from "lucide-react";
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

interface LeaveStats {
    total_requests: number;
    pending_requests: number;
    approved_requests: number;
    rejected_requests: number;
    total_days_requested: number;
    total_days_approved: number;
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
        stats: LeaveStats;
    }> {}

export default function HRLeaveIndex() {
    const {
        leaveApplications,
        filters,
        leaveTypes,
        statuses,
        canManage,
        employees,
        auth,
    } = usePage<PageProps>().props;

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [applicationToDelete, setApplicationToDelete] =
        useState<LeaveApplication | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Add state for edit modal
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [applicationToEdit, setApplicationToEdit] =
        useState<LeaveApplication | null>(null);

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

        router.get(route("admin.hr.leaves"), filterData, {
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
            route("admin.hr.leaves"),
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

        router.get(route("admin.hr.leaves"), currentFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // View handlers
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [applicationToView, setApplicationToView] =
        useState<LeaveApplication | null>(null);
    const handleView = (application: LeaveApplication) => {
        setApplicationToView(application);
        setIsViewDialogOpen(true);
    };

    // Edit handlers
    const handleEdit = (application: LeaveApplication) => {
        setApplicationToEdit(application);
        setIsEditDialogOpen(true);
    };

    // Handle leave creation/edit success
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
                    router.reload({ only: ["leaveApplications", "stats"] });
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
        { label: "My Leave Applications" },
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
            <Head title="My Leave Applications" />
            <div className="space-y-6">
                <GroupHeader
                    title="My Leave Applications"
                    breadcrumbs={breadcrumbs}
                    headerActions={
                        <div className="flex items-center gap-3">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setIsAddDialogOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Request Leave
                            </Button>
                        </div>
                    }
                >
                    {/* Filters */}
                    <GroupFilter
                        fields={filterOptions}
                        onFieldChange={handleFieldChange}
                        onClear={clearFilters}
                        title="Filter Leave Applications"
                    />

                    {/* Leave Applications Table */}
                    <Card>
                        <CardContent className="p-0">
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
                                                                {
                                                                    application.employee_name
                                                                }
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {
                                                                    application.employee_email
                                                                }
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-primary/10 text-primary border-primary/20"
                                                        >
                                                            {
                                                                application.leave_type
                                                            }
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {formatDate(
                                                            application.start_date
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {formatDate(
                                                            application.end_date
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {
                                                            application.days_requested
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                                                            {application.status ===
                                                                "approved" && (
                                                                <CheckCircle className="w-4 h-4 text-success" />
                                                            )}
                                                            {application.status ===
                                                                "pending" && (
                                                                <Clock className="w-4 h-4 text-warning" />
                                                            )}
                                                            {application.status ===
                                                                "rejected" && (
                                                                <XCircle className="w-4 h-4 text-danger" />
                                                            )}
                                                            <div
                                                                className={`${getStatusIndicatorClass(
                                                                    application.status
                                                                )}`}
                                                            />
                                                            <span>
                                                                {formatStatus(
                                                                    application.status
                                                                )}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {formatDate(
                                                            application.applied_date
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <GroupButton
                                                            canEdit={
                                                                application.status ===
                                                                "pending"
                                                            }
                                                            canDelete={
                                                                canManage &&
                                                                application.status ===
                                                                    "pending"
                                                            }
                                                            canView={true}
                                                            onEdit={
                                                                application.status ===
                                                                "pending"
                                                                    ? () =>
                                                                          handleEdit(
                                                                              application
                                                                          )
                                                                    : undefined
                                                            }
                                                            onDelete={
                                                                canManage &&
                                                                application.status ===
                                                                    "pending"
                                                                    ? () =>
                                                                          handleDelete(
                                                                              application
                                                                          )
                                                                    : undefined
                                                            }
                                                            onView={() =>
                                                                handleView(
                                                                    application
                                                                )
                                                            }
                                                            layout="dropdown"
                                                            itemName={
                                                                application.employee_name
                                                            }
                                                            size="sm"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Pagination */}
                    {leaveApplications.total > 0 && (
                        <div className="flex items-center justify-between px-4 py-3 bg-card border-t border-border">
                            <div className="text-sm text-muted-foreground">
                                Showing {leaveApplications.from || 0} to{" "}
                                {leaveApplications.to || 0} of{" "}
                                {leaveApplications.total} results
                            </div>

                            {/* Center - Pagination controls */}
                            <div className="flex-1 flex justify-center">
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

                            {/* Right side - Per-page selector */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
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

                {/* Edit Leave Modal - You'll need to create this component or modify RequestLeaveModal to handle editing */}
                {applicationToEdit && (
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
                )}

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
