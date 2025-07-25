"use client";
import { useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { GroupFilter } from "@/Components/UI/GroupFilter";
import { Button } from "@/Components/UI/Button";
import { Badge } from "@/Components/UI/Badge";
import GroupHeader from "@/Components/UI/GroupHeader";
import { Card, CardContent } from "@/Components/UI/Card";
import { Checkbox } from "@/Components/UI/CheckBox";
import { GroupButton } from "@/Components/UI/GroupButton";
import { CreateEmployeeModal } from "@/Pages/Admin/Employees/Create";
import { EditEmployeeModal } from "@/Pages/Admin/Employees/Edit";
import { DeleteConfirmationModal } from "@/Components/UI/PopupDelete";
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
import { Plus, Trash2 } from "lucide-react";

import { PageProps as InertiaPageProps } from "@/types";
import toast from "react-hot-toast";

interface Employee {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
    department: string;
    position: string | null;
    joint_date: string;
    status: "active" | "inactive";
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: Employee[];
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
        employees: PaginatedData;
        filters: {
            name?: string;
            email?: string;
            department?: string;
            status?: string;
        };
        departments: Array<{ value: string; label: string }>;
        statuses: Array<{ value: string; label: string }>;
    }> {}

export default function EmployeesPage() {
    const { employees, filters, departments, statuses, canManage, auth } =
        usePage<PageProps>().props;
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
        null
    );

    // Delete confirmation states
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
        null
    );
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter states - initialize from server filters
    const [nameFilter, setNameFilter] = useState(filters.name || "");
    const [emailFilter, setEmailFilter] = useState(filters.email || "");
    const [departmentFilter, setDepartmentFilter] = useState(
        filters.department || ""
    );
    const [statusFilter, setStatusFilter] = useState(filters.status || "");

    // Selection states
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    // Handle select all checkbox
    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            setSelectedEmployees(employees.data.map((emp) => emp.id));
        } else {
            setSelectedEmployees([]);
        }
    };

    // Handle individual checkbox
    const handleSelectEmployee = (employeeId: number, checked: boolean) => {
        if (checked) {
            setSelectedEmployees((prev) => [...prev, employeeId]);
        } else {
            setSelectedEmployees((prev) =>
                prev.filter((id) => id !== employeeId)
            );
            setSelectAll(false);
        }
    };

    // Update select all state when individual selections change
    useEffect(() => {
        if (
            selectedEmployees.length === employees.data.length &&
            employees.data.length > 0
        ) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [selectedEmployees, employees.data]);

    // Apply filters with server-side filtering
    const applyFilters = () => {
        const filterData: any = {};
        if (nameFilter) filterData.name = nameFilter;
        if (emailFilter) filterData.email = emailFilter;
        if (departmentFilter) filterData.department = departmentFilter;
        if (statusFilter) filterData.status = statusFilter;

        router.get(route("admin.employees.index"), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Debounced filter application
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            applyFilters();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [nameFilter, emailFilter, departmentFilter, statusFilter]);

    const handleClearFilters = () => {
        setNameFilter("");
        setEmailFilter("");
        setDepartmentFilter("");
        setStatusFilter("");

        router.get(
            route("admin.employees.index"),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const getFilterFields = () => {
        return [
            {
                id: "name",
                label: "Employee Name",
                placeholder: "Search by name...",
                value: nameFilter,
                type: "input" as const,
            },
            {
                id: "email",
                label: "Email",
                placeholder: "Search by email...",
                value: emailFilter,
                type: "input" as const,
            },
            {
                id: "department",
                label: "Department",
                placeholder: "Select department",
                value: departmentFilter,
                type: "select" as const,
                options: departments || [
                    { value: "Engineering", label: "Engineering" },
                    { value: "Marketing", label: "Marketing" },
                    { value: "Sales", label: "Sales" },
                    { value: "HR", label: "HR" },
                    { value: "Finance", label: "Finance" },
                ],
            },
            {
                id: "status",
                label: "Status",
                placeholder: "Select status",
                value: statusFilter,
                type: "select" as const,
                options: statuses || [
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                ],
            },
        ];
    };

    const handleFilterChange = (fieldId: string, value: string) => {
        switch (fieldId) {
            case "name":
                setNameFilter(value);
                break;
            case "email":
                setEmailFilter(value);
                break;
            case "department":
                setDepartmentFilter(value);
                break;
            case "status":
                setStatusFilter(value);
                break;
        }
    };

    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsEditDialogOpen(true);
    };

    const handleEmployeeUpdated = () => {
        // Refresh the page to show the updated employee
        router.reload({ only: ["employees"] });
        setIsEditDialogOpen(false);
        setSelectedEmployee(null);
    };

    const handleDelete = (employee: Employee) => {
        setEmployeeToDelete(employee);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!employeeToDelete) return;

        setIsDeleting(true);
        router.delete(route("admin.employees.destroy", employeeToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                // Show success message
                toast.success(
                    `Employee "${employeeToDelete.full_name}" has been deleted successfully!`,
                    {
                        duration: 4000,
                        position: "top-right",
                    }
                );

                setSelectedEmployees((prev) =>
                    prev.filter((id) => id !== employeeToDelete.id)
                );
                setIsDeleteDialogOpen(false);
                setEmployeeToDelete(null);
                setIsDeleting(false);
            },
            onError: () => {
                toast.error("Failed to delete employee. Please try again.", {
                    duration: 4000,
                    position: "top-right",
                });
                setIsDeleting(false);
            },
        });
    };

    const handleBulkDelete = () => {
        setIsBulkDeleteDialogOpen(true);
    };

    const confirmBulkDelete = () => {
        setIsDeleting(true);
        router.delete(route("admin.employees.bulk-delete"), {
            data: { ids: selectedEmployees },
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    `${selectedEmployees.length} employee${
                        selectedEmployees.length > 1 ? "s" : ""
                    } deleted successfully!`,
                    {
                        duration: 4000,
                        position: "top-right",
                    }
                );

                setSelectedEmployees([]);
                setSelectAll(false);
                setIsBulkDeleteDialogOpen(false);
                setIsDeleting(false);
            },
            onError: (errors) => {
                const errorMessage =
                    errors.error ||
                    errors.message ||
                    "Failed to delete employees. Please try again.";
                toast.error(errorMessage, {
                    duration: 6000,
                    position: "top-right",
                });
                setIsDeleting(false);
            },
        });
    };

    const handleEmployeeCreated = () => {
        router.reload({ only: ["employees"] });
    };

    // Update status badge function
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "active":
                return "bg-success/10 text-success border-success/20";
            case "inactive":
                return "bg-muted text-muted-foreground border-border";
            default:
                return "bg-muted text-muted-foreground border-border";
        }
    };

    const formatStatus = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <>
            <Head title="Employee Management" />
            <div className="space-y-6">
                <GroupHeader
                    title="Employee Management"
                    managementLabel="Employee Management"
                    managementHref="/admin/employees"
                    headerActions={
                        <div className="flex items-center gap-3">
                            {selectedEmployees.length > 0 && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleBulkDelete}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Selected ({selectedEmployees.length})
                                </Button>
                            )}
                            {auth.user.user_role !== "Employee" && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setIsAddDialogOpen(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Employee
                                </Button>
                            )}
                        </div>
                    }
                >
                    <GroupFilter
                        title="Filter Employees"
                        fields={getFilterFields()}
                        onFieldChange={handleFilterChange}
                        onClear={handleClearFilters}
                    />

                    {/* Table Section */}
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectAll}
                                                onCheckedChange={
                                                    handleSelectAll
                                                }
                                                aria-label="Select all employees"
                                            />
                                        </TableHead>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead>Join Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-center">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {employees.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={9}
                                                className="text-center py-8 text-muted-foreground"
                                            >
                                                No employees found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        employees.data.map((employee) => (
                                            <TableRow
                                                key={employee.id}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedEmployees.includes(
                                                            employee.id
                                                        )}
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            handleSelectEmployee(
                                                                employee.id,
                                                                checked as boolean
                                                            )
                                                        }
                                                        aria-label={`Select ${employee.full_name}`}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-shrink-0">
                                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <span className="text-sm font-medium text-primary">
                                                                    {employee.full_name
                                                                        .split(
                                                                            " "
                                                                        )
                                                                        .map(
                                                                            (
                                                                                n
                                                                            ) =>
                                                                                n[0]
                                                                        )
                                                                        .join(
                                                                            ""
                                                                        )
                                                                        .toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="font-semibold text-foreground">
                                                            {employee.full_name}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {employee.email}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {employee.phone || "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-primary/10 text-primary border-primary/20"
                                                    >
                                                        {employee.department}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {employee.position || "N/A"}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(
                                                        employee.joint_date
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={`font-medium ${getStatusBadgeVariant(
                                                            employee.status
                                                        )}`}
                                                    >
                                                        {formatStatus(
                                                            employee.status
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <GroupButton
                                                        canEdit={true}
                                                        canDelete={true}
                                                        onEdit={() =>
                                                            handleEdit(employee)
                                                        }
                                                        onDelete={() =>
                                                            handleDelete(
                                                                employee
                                                            )
                                                        }
                                                        layout="dropdown"
                                                        itemName={
                                                            employee.full_name
                                                        }
                                                        size="sm"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Pagination - Only show if there are more than 10 employees */}
                    {employees.total > 10 && (
                        <div className="flex items-center justify-between px-4 py-3 bg-card border-t border-border">
                            {/* Left side - Results info */}
                            <div className="text-sm text-muted-foreground">
                                Showing {employees.from || 0} to{" "}
                                {employees.to || 0} of {employees.total} results
                            </div>

                            {/* Center - Pagination controls (only show if more than one page) */}
                            <div className="flex-1 flex justify-center">
                                {employees.last_page > 1 && (
                                    <Pagination>
                                        <PaginationContent>
                                            {/* Previous Button */}
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() =>
                                                        router.get(
                                                            employees.links[0]
                                                                ?.url || ""
                                                        )
                                                    }
                                                    className={
                                                        employees.current_page ===
                                                        1
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer"
                                                    }
                                                />
                                            </PaginationItem>

                                            {/* Page Numbers */}
                                            {employees.links
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
                                                                    router.get(
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
                                                        router.get(
                                                            employees.links[
                                                                employees.links
                                                                    .length - 1
                                                            ]?.url || ""
                                                        )
                                                    }
                                                    className={
                                                        employees.current_page ===
                                                        employees.last_page
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
                                    value={employees.per_page.toString()}
                                    onValueChange={(value) => {
                                        router.get(
                                            route("admin.employees.index"),
                                            { per_page: value },
                                            {
                                                preserveState: true,
                                                preserveScroll: true,
                                            }
                                        );
                                    }}
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

                {/* Create Employee Modal */}
                <CreateEmployeeModal
                    isOpen={isAddDialogOpen}
                    onClose={() => setIsAddDialogOpen(false)}
                    onEmployeeCreated={handleEmployeeCreated}
                />

                {/* Edit Employee Modal */}
                <EditEmployeeModal
                    isOpen={isEditDialogOpen}
                    onClose={() => {
                        setIsEditDialogOpen(false);
                        setSelectedEmployee(null);
                    }}
                    employee={selectedEmployee}
                    onEmployeeUpdated={handleEmployeeUpdated}
                />

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationModal
                    isOpen={isDeleteDialogOpen}
                    onClose={() => {
                        setIsDeleteDialogOpen(false);
                        setEmployeeToDelete(null);
                    }}
                    onConfirm={confirmDelete}
                    itemName={employeeToDelete?.full_name}
                    isDeleting={isDeleting}
                    type="single"
                />

                {/* Bulk Delete Confirmation Modal */}
                <DeleteConfirmationModal
                    isOpen={isBulkDeleteDialogOpen}
                    onClose={() => setIsBulkDeleteDialogOpen(false)}
                    onConfirm={confirmBulkDelete}
                    isDeleting={isDeleting}
                    type="bulk"
                    count={selectedEmployees.length}
                />
            </div>
        </>
    );
}
