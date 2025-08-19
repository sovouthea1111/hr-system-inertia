"use client";
import { useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { GroupFilter } from "@/Components/UI/GroupFilter";
import { Button } from "@/Components/UI/Button";
import { Badge } from "@/Components/UI/Badge";
import GroupHeader from "@/Components/UI/GroupHeader";
import { Card, CardContent } from "@/Components/UI/Card";
import { Checkbox } from "@/Components/UI/CheckBox";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/UI/Table";
import { MobileCard, MobileField, MobileContainer } from "@/Components/UI/MobileView";
import {
    Plus,
    Calendar,
    Clock,
    User,
    XCircle,
    CheckCircle,
    Trash2,
} from "lucide-react";
import { PageProps as InertiaPageProps } from "@/types";
import toast from "react-hot-toast";
import { OvertimeModal } from "@/Pages/Admin/Overtime/OvertimeModal";
import { UpdateOvertimeModal } from "@/Pages/Admin/Overtime/UpdateOvertimeModal";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/Components/UI/Select";
import GroupButton from "@/Components/UI/GroupButton";
import DeleteConfirmationModal from "@/Components/UI/PopupDelete";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/Components/UI/Pagination";

interface Overtime {
    id: number;
    employee: {
        id: number;
        full_name: string;
        email: string;
        department: string;
    };
    overtime_date: string;
    start_time: string;
    end_time: string;
    hours_worked: number;
    hourly_rate: number;
    total_amount: number;
    overtime_type: string;
    status: "pending" | "approved" | "rejected";
    reason: string;
    created_at: string;
}

interface OvertimeType {
    value: string;
    label: string;
    price: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: Overtime[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}
interface OvertimePageProps extends InertiaPageProps {
    overtimes: PaginatedData;
    filters: {
        status?: string;
        overtime_type?: string;
        employee_name?: string;
        start_date?: string;
        end_date?: string;
    };
    employees: Array<{ id: number; full_name: string; email: string }>;
    overtimeTypes: OvertimeType[];
}

export default function OvertimeIndex() {
    const {
        overtimes,
        filters = {},
        employees = [],
        overtimeTypes = [],
        auth,
    } = usePage<OvertimePageProps>().props;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOvertime, setSelectedOvertime] = useState<Overtime | null>(
        null
    );
    const [selectedOvertimes, setSelectedOvertimes] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedOvertimeForUpdate, setSelectedOvertimeForUpdate] =
        useState<Overtime | null>(null);

    const isEmployee = auth.user.user_role === "Employee";
    const isHROrAdmin = ["HR", "SuperAdmin"].includes(auth.user.user_role);
    const canManage = isHROrAdmin;

    const [statusFilter, setStatusFilter] = useState(filters?.status || "");
    const [overtimeTypeFilter, setOvertimeTypeFilter] = useState(
        filters?.overtime_type || ""
    );
    const [employeeNameFilter, setEmployeeNameFilter] = useState(
        filters?.employee_name || ""
    );
    const [dateFilter, setDateFilter] = useState(filters?.start_date || "");
    const [applicationToDelete, setApplicationToDelete] =
        useState<Overtime | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const applyFilters = () => {
        const filterData: any = {};
        if (statusFilter) filterData.status = statusFilter;
        if (overtimeTypeFilter) filterData.overtime_type = overtimeTypeFilter;
        if (employeeNameFilter) filterData.employee_name = employeeNameFilter;
        if (dateFilter) filterData.date = dateFilter;

        router.get(route("admin.overtime.index"), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            applyFilters();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [statusFilter, overtimeTypeFilter, employeeNameFilter, dateFilter]);

    // Add these helper functions at the top of the component
    const getCurrentMonthRange = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { firstDay, lastDay };
    };

    const isDateInCurrentMonth = (date: Date) => {
        const now = new Date();
        return (
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth()
        );
    };

    const handleFilterChange = (
        field: string,
        value: string,
        dateValue?: Date
    ) => {
        // Validate date restrictions for date field
        if (field === "date" && dateValue) {
            if (!isDateInCurrentMonth(dateValue)) {
                toast.error(
                    "Please select a date within the current month only."
                );
                return; // Don't update the filter if date is outside current month
            }
        }

        switch (field) {
            case "status":
                setStatusFilter(value);
                break;
            case "overtime_type":
                setOvertimeTypeFilter(value);
                break;
            case "employee_name":
                setEmployeeNameFilter(value);
                break;
            case "date":
                setDateFilter(value);
                break;
        }
    };

    const handleClearFilters = () => {
        setStatusFilter("");
        setOvertimeTypeFilter("");
        setEmployeeNameFilter("");
        setDateFilter("");

        router.get(
            route("admin.overtime.index"),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleStatusUpdate = (overtimeId: number, newStatus: string) => {
        router.put(
            route("admin.overtime-status.update", overtimeId),
            { status: newStatus },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Overtime ${newStatus} successfully`);
                },
                onError: () => {
                    toast.error("Failed to update overtime status");
                },
            }
        );
    };

    const formatTime = (time: string) => {
        return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const formatStatus = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const getStatusIndicatorClass = (status: string) => {
        switch (status) {
            case "approved":
                return "bg-green-500";
            case "rejected":
                return "bg-red-500";
            default:
                return "bg-yellow-500";
        }
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            setSelectedOvertimes(overtimes.data.map((overtime) => overtime.id));
        } else {
            setSelectedOvertimes([]);
        }
    };

    const handleSelectOvertime = (overtimeId: number, checked: boolean) => {
        if (checked) {
            setSelectedOvertimes([...selectedOvertimes, overtimeId]);
        } else {
            setSelectedOvertimes(
                selectedOvertimes.filter((id) => id !== overtimeId)
            );
            setSelectAll(false);
        }
    };

    const handleBulkDelete = () => {
        setIsBulkDeleteDialogOpen(true);
    };

    const confirmBulkDelete = () => {
        setIsDeleting(true);
        router.delete(route("admin.overtime.bulk-delete"), {
            data: { ids: selectedOvertimes },
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    `${selectedOvertimes.length} overtime record${
                        selectedOvertimes.length > 1 ? "s" : ""
                    } deleted successfully!`,
                    {
                        duration: 4000,
                        position: "top-right",
                    }
                );

                setSelectedOvertimes([]);
                setSelectAll(false);
                setIsBulkDeleteDialogOpen(false);
                setIsDeleting(false);
            },
            onError: (errors) => {
                const errorMessage =
                    errors.error ||
                    errors.message ||
                    "Failed to delete overtime records. Please try again.";
                toast.error(errorMessage, {
                    duration: 6000,
                    position: "top-right",
                });
                setIsDeleting(false);
            },
        });
    };

    const handleEdit = (overtime: Overtime) => {
        setSelectedOvertimeForUpdate(overtime);
        setIsUpdateModalOpen(true);
    };

    const handleCloseUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setSelectedOvertimeForUpdate(null);
    };

    const handleDelete = (overtime: Overtime) => {
        setApplicationToDelete(overtime);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!applicationToDelete) return;

        setIsDeleting(true);
        router.delete(route("admin.overtime.destroy", applicationToDelete.id), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Overtime record deleted successfully");
                setIsDeleteDialogOpen(false);
                setApplicationToDelete(null);
                setIsDeleting(false);
            },
            onError: () => {
                toast.error("Failed to delete overtime record");
                setIsDeleting(false);
            },
        });
    };

    const getFilterFields = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return [
            {
                id: "status",
                label: "Status",
                placeholder: "Select status",
                value: statusFilter,
                type: "select" as const,
                options: [
                    { value: "pending", label: "Pending" },
                    { value: "approved", label: "Approved" },
                    { value: "rejected", label: "Rejected" },
                ],
            },
            {
                id: "overtime_type",
                label: "Overtime Type",
                placeholder: "Select type",
                value: overtimeTypeFilter,
                type: "select" as const,
                options:
                    overtimeTypes?.map((type) => ({
                        value: type.value,
                        label: type.label,
                    })) || [],
            },
            {
                id: "employee_name",
                label: "Employee Name",
                placeholder: "Search by employee name...",
                value: employeeNameFilter,
                type: "input" as const,
            },
            {
                id: "date",
                label: "Date (Current Month Only)",
                placeholder: `Select date (${firstDay.toLocaleDateString()} - ${lastDay.toLocaleDateString()})`,
                value: dateFilter,
                type: "datetime" as const,
                dateValue: dateFilter ? new Date(dateFilter) : undefined,
                disableMonthSelection: true,
                disableYearSelection: true,
            },
        ];
    };

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

    const handlePerPageChange = (perPage: string) => {
        const currentFilters: Record<string, string | number> = {
            employee_name: employeeNameFilter,
            overtime_type: overtimeTypeFilter,
            date: dateFilter,
            status: statusFilter,
            per_page: perPage,
            page: 1,
        };

        Object.keys(currentFilters).forEach((key) => {
            if (!currentFilters[key]) {
                delete currentFilters[key];
            }
        });

        router.get(route("admin.overtime.index"), currentFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Overtime Management" />
            <div className="space-y-6">
                <GroupHeader
                    title="Overtime Management"
                    managementLabel="Overtime Management"
                    managementHref="/admin/overtime"
                    headerActions={
                        <div className="flex items-center gap-3">
                            {selectedOvertimes.length > 0 && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleBulkDelete}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Selected ({selectedOvertimes.length})
                                </Button>
                            )}
                            {isEmployee && (
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        setSelectedOvertime(null);
                                        setIsModalOpen(true);
                                    }}
                                    className="flex items-center space-x-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Request Overtime</span>
                                </Button>
                            )}
                        </div>
                    }
                >
                    {/* Filters */}
                    <GroupFilter
                        fields={getFilterFields()}
                        onClear={handleClearFilters}
                        title="Filter Overtime Records"
                        onFieldChange={handleFilterChange}
                    />

                    {/* Overtime Table */}
                    <Card>
                        <CardContent className="p-0">
                            {/* Desktop Table View */}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {canManage && (
                                            <TableHead className="w-12">
                                                <Checkbox
                                                    checked={selectAll}
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleSelectAll(
                                                            checked === true
                                                        )
                                                    }
                                                    aria-label="Select all overtime requests"
                                                />
                                            </TableHead>
                                        )}
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Hours</TableHead>
                                        <TableHead>Type</TableHead>
                                        {isHROrAdmin && (
                                            <TableHead>Rate</TableHead>
                                        )}
                                        {isHROrAdmin && (
                                            <TableHead>Total</TableHead>
                                        )}
                                        <TableHead>Status</TableHead>
                                        <TableHead>Reason</TableHead>
                                        {isEmployee && (
                                            <TableHead className="text-center">
                                                Action
                                            </TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(overtimes?.data?.length || 0) === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={canManage ? 11 : 10}
                                                className="text-center py-8 text-gray-500"
                                            >
                                                No overtime records found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        overtimes?.data?.map((overtime) => (
                                            <TableRow key={overtime.id}>
                                                {canManage && (
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedOvertimes.includes(
                                                                overtime.id
                                                            )}
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                handleSelectOvertime(
                                                                    overtime.id,
                                                                    checked as boolean
                                                                )
                                                            }
                                                        />
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar className="items-center">
                                                            <AvatarFallback className="w-10 h-10 rounded-full bg-gray-500">
                                                                <User className="w-5 h-5" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">
                                                                {
                                                                    overtime
                                                                        .employee
                                                                        .full_name
                                                                }
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {
                                                                    overtime
                                                                        .employee
                                                                        .email
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <span>
                                                            {new Date(
                                                                overtime.overtime_date
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-1">
                                                        <Clock className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm">
                                                            {formatTime(
                                                                overtime.start_time
                                                            )}{" "}
                                                            -{" "}
                                                            {formatTime(
                                                                overtime.end_time
                                                            )}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">
                                                        {overtime.hours_worked}h
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {overtime.overtime_type}
                                                    </Badge>
                                                </TableCell>
                                                {isHROrAdmin && (
                                                    <TableCell>
                                                        {formatCurrency(
                                                            overtime.hourly_rate
                                                        )}
                                                        /hr
                                                    </TableCell>
                                                )}
                                                {isHROrAdmin && (
                                                    <TableCell className="font-medium">
                                                        {formatCurrency(
                                                            overtime.total_amount
                                                        )}
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    {isHROrAdmin &&
                                                    overtime.status ===
                                                        "pending" ? (
                                                        <Select
                                                            value={
                                                                overtime.status
                                                            }
                                                            onValueChange={(
                                                                value
                                                            ) =>
                                                                handleStatusUpdate(
                                                                    overtime.id,
                                                                    value
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="w-auto min-w-[140px] h-8 rounded-full bg-muted border-2 hover:bg-muted/80 transition-colors">
                                                                <div className="flex items-center gap-2">
                                                                    <div
                                                                        className={`w-2 h-2 rounded-full ${getStatusIndicatorClass(
                                                                            overtime.status
                                                                        )}`}
                                                                    />
                                                                    <span className="text-sm font-medium">
                                                                        {formatStatus(
                                                                            overtime.status
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </SelectTrigger>
                                                            <SelectContent className="min-w-[160px]">
                                                                <SelectItem
                                                                    value="pending"
                                                                    className="cursor-pointer"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="w-4 h-4 text-warning" />
                                                                        <span>
                                                                            Pending
                                                                        </span>
                                                                    </div>
                                                                </SelectItem>
                                                                <SelectItem
                                                                    value="approved"
                                                                    className="cursor-pointer"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <CheckCircle className="w-4 h-4 text-success" />
                                                                        <span>
                                                                            Approved
                                                                        </span>
                                                                    </div>
                                                                </SelectItem>
                                                                <SelectItem
                                                                    value="rejected"
                                                                    className="cursor-pointer"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <XCircle className="w-4 h-4 text-destructive" />
                                                                        <span>
                                                                            Rejected
                                                                        </span>
                                                                    </div>
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                                                            {overtime.status ===
                                                            "approved" ? (
                                                                <CheckCircle className="w-4 h-4 text-success" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-danger" />
                                                            )}
                                                            <div
                                                                className={getStatusIndicatorClass(
                                                                    overtime.status
                                                                )}
                                                            />
                                                            <span>
                                                                {formatStatus(
                                                                    overtime.status
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="max-w-xs">
                                                    <div
                                                        className="truncate"
                                                        title={overtime.reason}
                                                    >
                                                        {overtime.reason}
                                                    </div>
                                                </TableCell>
                                                {isEmployee && (
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <GroupButton
                                                                canView={
                                                                    isEmployee &&
                                                                    overtime.status ===
                                                                        "approved"
                                                                }
                                                                canEdit={
                                                                    overtime.status !==
                                                                    "approved"
                                                                }
                                                                canDelete={
                                                                    overtime.status !==
                                                                    "approved"
                                                                }
                                                                onEdit={() =>
                                                                    handleEdit(
                                                                        overtime
                                                                    )
                                                                }
                                                                onDelete={() =>
                                                                    handleDelete(
                                                                        overtime
                                                                    )
                                                                }
                                                                layout="dropdown"
                                                                itemName={
                                                                    overtime
                                                                        .employee
                                                                        .full_name
                                                                }
                                                                size="sm"
                                                                disabled={
                                                                    overtime.status !==
                                                                    "pending"
                                                                }
                                                            />
                                                        </div>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            
                            {/* Mobile Card Layout */}
                            <MobileContainer className="p-4">
                                {(overtimes?.data?.length || 0) === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No overtime records found.
                                    </div>
                                ) : (
                                    overtimes?.data?.map((overtime) => (
                                        <MobileCard key={overtime.id}>
                                            {/* Employee Info Header */}
                                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                                                <div className="flex items-center space-x-3">
                                                    {canManage && (
                                                        <Checkbox
                                                            checked={selectedOvertimes.includes(
                                                                overtime.id
                                                            )}
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                handleSelectOvertime(
                                                                    overtime.id,
                                                                    checked as boolean
                                                                )
                                                            }
                                                        />
                                                    )}
                                                    <Avatar className="items-center">
                                                        <AvatarFallback className="w-12 h-12 rounded-full bg-gray-500">
                                                            <User className="w-6 h-6" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-lg font-semibold text-gray-900 truncate">
                                                            {overtime.employee.full_name}
                                                        </p>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {overtime.employee.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    {isEmployee && (
                                                        <GroupButton
                                                            canView={
                                                                isEmployee &&
                                                                overtime.status ===
                                                                    "approved"
                                                            }
                                                            canEdit={
                                                                overtime.status !==
                                                                "approved"
                                                            }
                                                            canDelete={
                                                                overtime.status !==
                                                                "approved"
                                                            }
                                                            onEdit={() =>
                                                                handleEdit(overtime)
                                                            }
                                                            onDelete={() =>
                                                                handleDelete(overtime)
                                                            }
                                                            layout="dropdown"
                                                            itemName={
                                                                overtime.employee
                                                                    .full_name
                                                            }
                                                            size="sm"
                                                            disabled={
                                                                overtime.status !==
                                                                "pending"
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Overtime Details */}
                                            <MobileField label="Date">
                                                {new Date(
                                                    overtime.overtime_date
                                                ).toLocaleDateString()}
                                            </MobileField>
                                            
                                            <MobileField label="Time">
                                                {formatTime(overtime.start_time)} -{" "}
                                                {formatTime(overtime.end_time)}
                                            </MobileField>
                                            
                                            <MobileField label="Hours">
                                                <span className="font-semibold">
                                                    {overtime.hours_worked}h
                                                </span>
                                            </MobileField>
                                            
                                            <MobileField label="Type">
                                                <Badge variant="outline">
                                                    {overtime.overtime_type}
                                                </Badge>
                                            </MobileField>
                                            
                                            {isHROrAdmin && (
                                                <MobileField label="Rate">
                                                    <span className="font-semibold">
                                                        {formatCurrency(
                                                            overtime.hourly_rate
                                                        )}
                                                        /hr
                                                    </span>
                                                </MobileField>
                                            )}
                                            
                                            {isHROrAdmin && (
                                                <MobileField label="Total">
                                                    <span className="font-bold text-green-600">
                                                        {formatCurrency(
                                                            overtime.total_amount
                                                        )}
                                                    </span>
                                                </MobileField>
                                            )}
                                            
                                            <MobileField label="Status">
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${
                                                            getStatusIndicatorClass(
                                                                overtime.status
                                                            )
                                                        }`}
                                                    ></div>
                                                    <span className="capitalize">
                                                        {formatStatus(overtime.status)}
                                                    </span>
                                                </div>
                                            </MobileField>
                                            
                                            <MobileField label="Reason">
                                                <div className="text-right max-w-48">
                                                    <p className="text-sm break-words">
                                                        {overtime.reason}
                                                    </p>
                                                </div>
                                            </MobileField>
                                        </MobileCard>
                                    ))
                                )}
                            </MobileContainer>
                        </CardContent>
                    </Card>

                    {/* Pagination - Only show if there are more than 10 applications */}
                    {(overtimes?.data?.length || 0) > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-card border-t border-border gap-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {overtimes?.from || 0} to{" "}
                                {overtimes?.to || 0} of {overtimes?.total || 0}{" "}
                                results
                            </div>

                            {/* Center - Pagination controls (only show if more than one page) - Hidden on mobile */}
                            <div className="hidden md:flex flex-1 justify-center">
                                {(overtimes?.last_page || 1) > 1 && (
                                    <Pagination>
                                        <PaginationContent>
                                            {/* Previous Button */}
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() =>
                                                        handlePageChange(
                                                            overtimes
                                                                ?.links?.[0]
                                                                ?.url || ""
                                                        )
                                                    }
                                                    className={`${
                                                        (overtimes?.current_page ||
                                                            1) <= 1
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer hover:bg-accent"
                                                    }`}
                                                />
                                            </PaginationItem>

                                            {/* Page Numbers */}
                                            {(overtimes?.links || []).length >
                                                2 &&
                                                (overtimes?.links || [])
                                                    .slice(1, -1)
                                                    .map((link, index) => (
                                                        <PaginationItem
                                                            key={`page-${
                                                                link.label
                                                            }-${
                                                                link.url ||
                                                                index
                                                            }`}
                                                        >
                                                            {link.label ===
                                                            "..." ? (
                                                                <PaginationEllipsis
                                                                    key={`ellipsis-${
                                                                        link.url ||
                                                                        index
                                                                    }`}
                                                                />
                                                            ) : (
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
                                                            )}
                                                        </PaginationItem>
                                                    ))}

                                            {/* Next Button */}
                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() =>
                                                        handlePageChange(
                                                            (overtimes?.links ||
                                                                [])[
                                                                (
                                                                    overtimes?.links ||
                                                                    []
                                                                ).length - 1
                                                            ]?.url || ""
                                                        )
                                                    }
                                                    className={`${
                                                        (overtimes?.current_page ||
                                                            1) >=
                                                        (overtimes?.last_page ||
                                                            1)
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer hover:bg-accent"
                                                    }`}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                )}
                            </div>

                            {/* Right - Per page selector - Hidden on mobile */}
                            <div className="hidden sm:flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">
                                    Items per page:
                                </span>
                                <Select
                                    value={(
                                        overtimes?.per_page || 10
                                    ).toString()}
                                    onValueChange={(value) => {
                                        const url = new URL(
                                            window.location.href
                                        );
                                        url.searchParams.set("per_page", value);
                                        url.searchParams.set("page", "1");
                                        router.get(url.toString());
                                    }}
                                >
                                    <SelectTrigger className="w-20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Overtime Modal */}
                    <OvertimeModal
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            setSelectedOvertime(null);
                        }}
                        selectedOvertime={selectedOvertime}
                        overtimeTypes={overtimeTypes}
                    />

                    <UpdateOvertimeModal
                        isOpen={isUpdateModalOpen}
                        onClose={handleCloseUpdateModal}
                        overtimeTypes={overtimeTypes}
                        selectedOvertime={selectedOvertimeForUpdate}
                    />

                    {/* Delete Confirmation Modal */}
                    <DeleteConfirmationModal
                        isOpen={isDeleteDialogOpen}
                        onClose={() => {
                            setIsDeleteDialogOpen(false);
                            setApplicationToDelete(null);
                        }}
                        onConfirm={confirmDelete}
                        itemName={applicationToDelete?.employee?.full_name}
                        isDeleting={isDeleting}
                        type="single"
                        itemType="Overtime Record"
                    />
                    {/* Bulk Delete Confirmation Modal */}
                    <DeleteConfirmationModal
                        isOpen={isBulkDeleteDialogOpen}
                        itemType="Overtime Record"
                        onClose={() => setIsBulkDeleteDialogOpen(false)}
                        onConfirm={confirmBulkDelete}
                        isDeleting={isDeleting}
                        type="bulk"
                        count={selectedOvertimes.length}
                    />
                </GroupHeader>
            </div>
        </>
    );
}
