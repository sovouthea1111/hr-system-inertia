import { Head, usePage, router } from "@inertiajs/react";
import { useState } from "react";
import { PageProps as InertiaPageProps } from "@/types";
import { Card, CardContent } from "@/Components/UI/Card";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/UI/Table";
import { MobileCard, MobileField, MobileContainer } from "@/Components/UI/MobileView";
import { Avatar, AvatarFallback } from "@/Components/UI/Avatar";
import { User } from "lucide-react";
import GroupHeader from "@/Components/UI/GroupHeader";
import { GroupFilter } from "@/Components/UI/GroupFilter";

interface Employee {
    id: number;
    full_name: string;
    email: string;
    department: string;
}

interface OvertimeRecord {
    id: number;
    employee: Employee;
    overtime_date: string;
    start_time: string;
    end_time: string;
    hours_worked: number;
    hourly_rate: number;
    total_amount: number;
    overtime_type: "regular" | "holiday" | "weekend" | "emergency";
}

interface EmployeePayroll {
    employee: Employee;
    total_hours: number;
    total_amount: number;
    overtime_records: OvertimeRecord[];
}

interface PayrollStatistics {
    total_employees: number;
    total_hours: number;
    total_payroll_amount: number;
    total_records: number;
}

interface PayrollPageProps extends InertiaPageProps {
    payrollData: OvertimeRecord[];
    employeePayroll: EmployeePayroll[];
    statistics: PayrollStatistics;
    currentMonth: string;
    filters: {
        employee_name?: string;
        start_date?: string;
        end_date?: string;
    };
}

export default function OvertimePayroll() {
    const {
        employeePayroll = [],
        filters = {},
        statistics,
        currentMonth,
    } = usePage<PayrollPageProps>().props;

    const [employeeNameFilter, setEmployeeNameFilter] = useState(
        filters?.employee_name || ""
    );

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const handleFilterChange = (
        field: string,
        value: string,
        dateValue?: Date
    ) => {
        switch (field) {
            case "employee_name":
                setEmployeeNameFilter(value);
                break;
        }

        const filterData: any = {};
        const updatedEmployeeNameFilter =
            field === "employee_name" ? value : employeeNameFilter;
        if (updatedEmployeeNameFilter)
            filterData.employee_name = updatedEmployeeNameFilter;

        router.get(route("admin.overtime-payroll"), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setEmployeeNameFilter("");

        router.get(
            route("admin.overtime-payroll"),
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
                id: "employee_name",
                label: "Employee Name",
                placeholder: "Search by employee name...",
                value: employeeNameFilter,
                type: "input" as const,
            },
        ];
    };

    return (
        <>
            <Head title="Overtime Payroll" />
            <div className="space-y-6">
                <GroupHeader
                    title="Overtime Payroll"
                    managementLabel={`Payroll for ${
                        currentMonth || format(new Date(), "MMMM yyyy")
                    }`}
                    managementHref="/admin/overtime-payroll"
                    showDefaultButton={false}
                >
                    {/* Statistics Cards */}
                    {statistics && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {statistics.total_employees}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Total Employees
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-green-600">
                                        {statistics.total_hours.toFixed(1)}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Total Hours
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {formatCurrency(
                                            statistics.total_payroll_amount
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Total Payroll
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {statistics.total_records}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Total Records
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Filters */}
                    <GroupFilter
                        fields={getFilterFields()}
                        onClear={handleClearFilters}
                        title="Filter Payroll Records"
                        onFieldChange={handleFilterChange}
                    />

                    {/* Employee Payroll Table - Desktop */}
                    <div className="hidden md:block">
                        <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[250px]">
                                                Employee
                                            </TableHead>
                                            <TableHead className="w-[120px]">
                                                Total Amount
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {employeePayroll.length > 0 ? (
                                            employeePayroll.map((employee) => (
                                                <TableRow
                                                    key={employee.employee.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center space-x-3">
                                                            <Avatar className="w-8 h-8">
                                                                <AvatarFallback className="bg-gray-500">
                                                                    <User className="w-4 h-4 text-white" />
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="font-medium truncate text-sm">
                                                                    {
                                                                        employee
                                                                            .employee
                                                                            .full_name
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {
                                                                        employee
                                                                            .employee
                                                                            .email
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-gray-400">
                                                                    {
                                                                        employee
                                                                            .employee
                                                                            .department
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-bold text-green-600">
                                                            {formatCurrency(
                                                                employee.total_amount
                                                            )}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={3}
                                                    className="text-center py-8 text-gray-500"
                                                >
                                                    No payroll records found for
                                                    the selected criteria.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                        </Card>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden">
                        {employeePayroll.length === 0 ? (
                            <Card>
                                <CardContent className="text-center py-8 text-gray-500">
                                    No payroll records found for the selected criteria.
                                </CardContent>
                            </Card>
                        ) : (
                            <MobileContainer>
                                {employeePayroll.map((employee) => (
                                    <MobileCard key={employee.employee.id}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback className="bg-gray-500">
                                                        <User className="w-4 h-4 text-white" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium text-sm">
                                                        {employee.employee.full_name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {employee.employee.email}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {employee.employee.department}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <MobileField label="Total Amount">
                                                <span className="font-bold text-green-600">
                                                    {formatCurrency(employee.total_amount)}
                                                </span>
                                            </MobileField>
                                        </div>
                                    </MobileCard>
                                ))}
                            </MobileContainer>
                        )}
                    </div>
                </GroupHeader>
            </div>
        </>
    );
}
