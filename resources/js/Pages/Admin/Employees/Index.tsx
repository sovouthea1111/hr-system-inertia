"use client";
import { useState, useEffect } from "react";
import { GroupFilter } from "@/Components/UI/GroupFilter";
import { Button } from "@/Components/UI/Button";
import { Badge } from "@/Components/UI/Badge";
import GroupHeader from "@/Components/UI/GroupHeader";
import { Card, CardContent } from "@/Components/UI/Card";
import { Checkbox } from "@/Components/UI/CheckBox";
import { GroupButton } from "@/Components/UI/GroupButton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/UI/Table";
import { Plus, Trash2 } from "lucide-react";

interface Employee {
    id: number;
    name: string;
    email: string;
    department: string;
    position: string;
    status: "Active" | "Inactive" | "On Leave";
}

const mockEmployees: Employee[] = [
    {
        id: 1,
        name: "John Smith",
        email: "john.smith@company.com",
        department: "Engineering",
        position: "Senior Developer",
        status: "Active",
    },
    {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah.johnson@company.com",
        department: "Marketing",
        position: "Marketing Manager",
        status: "Active",
    },
    {
        id: 3,
        name: "Mike Davis",
        email: "mike.davis@company.com",
        department: "Sales",
        position: "Sales Representative",
        status: "On Leave",
    },
    {
        id: 4,
        name: "Emily Brown",
        email: "emily.brown@company.com",
        department: "HR",
        position: "HR Specialist",
        status: "Inactive",
    },
];

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
    const [filteredEmployees, setFilteredEmployees] =
        useState<Employee[]>(mockEmployees);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Filter states
    const [nameFilter, setNameFilter] = useState("");
    const [emailFilter, setEmailFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Selection states
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    // Apply filters
    useEffect(() => {
        let filtered = employees;

        if (nameFilter) {
            filtered = filtered.filter((employee) =>
                employee.name.toLowerCase().includes(nameFilter.toLowerCase())
            );
        }

        if (emailFilter) {
            filtered = filtered.filter((employee) =>
                employee.email.toLowerCase().includes(emailFilter.toLowerCase())
            );
        }

        if (departmentFilter) {
            filtered = filtered.filter(
                (employee) => employee.department === departmentFilter
            );
        }

        if (statusFilter) {
            filtered = filtered.filter(
                (employee) => employee.status === statusFilter
            );
        }

        setFilteredEmployees(filtered);
        // Reset selections when filters change
        setSelectedEmployees([]);
        setSelectAll(false);
    }, [employees, nameFilter, emailFilter, departmentFilter, statusFilter]);

    // Handle select all checkbox
    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            setSelectedEmployees(filteredEmployees.map((emp) => emp.id));
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
            selectedEmployees.length === filteredEmployees.length &&
            filteredEmployees.length > 0
        ) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [selectedEmployees, filteredEmployees]);

    const handleClearFilters = () => {
        setNameFilter("");
        setEmailFilter("");
        setDepartmentFilter("");
        setStatusFilter("");
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
                options: [
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
                options: [
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                    { value: "On Leave", label: "On Leave" },
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
        console.log("Edit employee:", employee);
        // Implement edit functionality
    };

    const handleDelete = (employee: Employee) => {
        console.log("Delete employee:", employee);
        // Implement delete functionality
    };

    const handleBulkDelete = () => {
        console.log("Bulk delete employees:", selectedEmployees);
        // Implement bulk delete functionality
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "Active":
                return "bg-green-100 text-green-800 border-green-200";
            case "Inactive":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <div className="space-y-6">
            <GroupHeader
                title="Employee Management"
                managementLabel="Employee Management"
                managementHref="/employees"
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
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setIsAddDialogOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Employee
                        </Button>
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
                                <TableRow className="bg-gray-50">
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectAll}
                                            onCheckedChange={handleSelectAll}
                                            aria-label="Select all employees"
                                        />
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700">
                                        Name
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700">
                                        Email
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700">
                                        Department
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700">
                                        Position
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700">
                                        Status
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-center">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEmployees.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-8"
                                        >
                                            <div className="text-gray-500">
                                                <p className="text-lg font-medium">
                                                    No employees found
                                                </p>
                                                <p className="text-sm">
                                                    Try adjusting your filters
                                                    or add a new employee.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredEmployees.map((employee) => (
                                        <TableRow
                                            key={employee.id}
                                            className="hover:bg-blue-50/30 transition-colors"
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
                                                    aria-label={`Select ${employee.name}`}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-semibold text-primary">
                                                            {employee.name
                                                                .split(" ")
                                                                .map(
                                                                    (n) => n[0]
                                                                )
                                                                .join("")}
                                                        </span>
                                                    </div>
                                                    <div className="font-semibold text-gray-900">
                                                        {employee.name}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {employee.email}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="bg-blue-50 text-primary border-blue-200"
                                                >
                                                    {employee.department}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {employee.position}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`font-medium ${getStatusBadgeVariant(
                                                        employee.status
                                                    )}`}
                                                >
                                                    {employee.status}
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
                                                        handleDelete(employee)
                                                    }
                                                    layout="dropdown"
                                                    itemName={employee.name}
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
            </GroupHeader>
        </div>
    );
}
