import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Modal } from "@/Components/UI/Modal";
import { Button } from "@/Components/UI/Button";
import { Input } from "@/Components/UI/Input";
import { Label } from "@/Components/UI/Label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/UI/Select";
import { Save } from "lucide-react";
import toast from "react-hot-toast";

interface Employee {
    id: number;
    full_name: string;
    email: string;
}

interface LeaveApplication {
    id: number;
    employee_id?: number; // Make this optional to match Index.tsx
    employee_name: string;
    employee_email: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    days_requested: number;
    reason: string;
    status: "pending" | "approved" | "rejected"; // Add missing status field
    applied_date: string;
}

interface EditLeaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    leave: LeaveApplication | null;
    onLeaveUpdated: () => void;
    employees: Employee[];
    leaveTypes: Array<{ value: string; label: string }>;
    statuses: Array<{ value: string; label: string }>;
    auth?: { user?: { user_role: string } };
}

export function EditLeaveModal({
    isOpen,
    onClose,
    leave,
    onLeaveUpdated,
    employees,
    leaveTypes,
    statuses,
    auth,
}: EditLeaveModalProps) {
    const { data, setData, put, processing, errors, reset, clearErrors } =
        useForm({
            employee_id: "",
            start_date: "",
            end_date: "",
            leave_type: "",
            reason: "",
            status: "",
        });

    useEffect(() => {
        if (leave && isOpen) {
            let employeeId = "";
            if (leave.employee_id) {
                employeeId = leave.employee_id.toString();
            } else {
                const matchingEmployee = employees.find(
                    (emp) => emp.full_name === leave.employee_name
                );
                employeeId = matchingEmployee
                    ? matchingEmployee.id.toString()
                    : "";
            }

            setData({
                employee_id: employeeId,
                start_date: leave.start_date,
                end_date: leave.end_date,
                leave_type: leave.leave_type,
                reason: leave.reason,
                status: leave.status,
            });
        }
    }, [leave, isOpen, employees]);

    const handleEmployeeChange = (employeeId: string) => {
        setData("employee_id", employeeId);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!leave) return;

        put(route("admin.leaves.update", leave.id), {
            onSuccess: () => {
                toast.success("Leave application updated successfully!");
                onLeaveUpdated();
                handleClose();
            },
            onError: (errors) => {
                toast.error(
                    "Failed to update leave application. Please check the form."
                );
            },
        });
    };

    const clearFormData = () => {
        reset();
        clearErrors();
    };

    const handleClose = () => {
        clearFormData();
        onClose();
    };

    const handleInputChange = (field: string, value: string) => {
        setData(field as any, value);
        if (errors[field as keyof typeof errors]) {
            clearErrors(field as keyof typeof errors);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            className="max-w-2xl"
            title="Edit Leave Application"
        >
            <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Employee Selection */}
                <div className="space-y-2">
                    <Label
                        htmlFor="employee_id"
                        className="text-sm font-medium"
                    >
                        Employee <span className="text-danger">*</span>
                    </Label>
                    <Select
                        value={data.employee_id}
                        onValueChange={handleEmployeeChange}
                        disabled={auth?.user?.user_role === "Employee"}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                        <SelectContent>
                            {employees.map((employee) => (
                                <SelectItem
                                    key={employee.id}
                                    value={employee.id.toString()}
                                >
                                    {employee.full_name} ({employee.email})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.employee_id && (
                        <p className="text-sm text-danger">
                            {errors.employee_id}
                        </p>
                    )}
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                    <Label htmlFor="start_date" className="text-sm font-medium">
                        Start Date <span className="text-danger">*</span>
                    </Label>
                    <Input
                        id="start_date"
                        type="date"
                        value={data.start_date}
                        onChange={(e) =>
                            handleInputChange("start_date", e.target.value)
                        }
                        className="w-full"
                        required
                    />
                    {errors.start_date && (
                        <p className="text-sm text-danger">
                            {errors.start_date}
                        </p>
                    )}
                </div>

                {/* End Date */}
                <div className="space-y-2">
                    <Label htmlFor="end_date" className="text-sm font-medium">
                        End Date <span className="text-danger">*</span>
                    </Label>
                    <Input
                        id="end_date"
                        type="date"
                        value={data.end_date}
                        onChange={(e) =>
                            handleInputChange("end_date", e.target.value)
                        }
                        className="w-full"
                        required
                    />
                    {errors.end_date && (
                        <p className="text-sm text-danger">{errors.end_date}</p>
                    )}
                </div>

                {/* Leave Type */}
                <div className="space-y-2">
                    <Label htmlFor="leave_type" className="text-sm font-medium">
                        Leave Type <span className="text-danger">*</span>
                    </Label>
                    <Select
                        value={data.leave_type}
                        onValueChange={(value) =>
                            handleInputChange("leave_type", value)
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        <SelectContent>
                            {leaveTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.leave_type && (
                        <p className="text-sm text-danger">
                            {errors.leave_type}
                        </p>
                    )}
                </div>
                {/* Reason */}
                <div className="space-y-2">
                    <Label htmlFor="reason" className="text-sm font-medium">
                        Reason <span className="text-danger">*</span>
                    </Label>
                    <textarea
                        id="reason"
                        value={data.reason}
                        onChange={(e) =>
                            handleInputChange("reason", e.target.value)
                        }
                        className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                        placeholder="Enter reason for leave..."
                        required
                    />
                    {errors.reason && (
                        <p className="text-sm text-danger">{errors.reason}</p>
                    )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">
                        Status <span className="text-danger">*</span>
                    </Label>
                    <Select
                        value={data.status}
                        onValueChange={(value) =>
                            handleInputChange("status", value)
                        }
                        disabled={auth?.user?.user_role === "Employee"}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statuses.map((status) => (
                                <SelectItem
                                    key={status.value}
                                    value={status.value}
                                >
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.status && (
                        <p className="text-sm text-danger">{errors.status}</p>
                    )}
                </div>
                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={processing}
                        className="flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {processing ? "Updating..." : "Update Leave"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
