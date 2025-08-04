import React, { useState, useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
import { Modal } from "@/Components/UI/Modal";
import { Button } from "@/Components/UI/Button";
import { Input } from "@/Components/UI/Input";
import { Label } from "@/Components/UI/Label";
import { InputImage } from "@/Components/UI/InputImage";
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
            image: null as File | null,
            remove_existing_image: false,
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
                image: null,
                remove_existing_image: false,
            });
        }
    }, [leave, isOpen, employees]);

    const handleEmployeeChange = (employeeId: string) => {
        setData("employee_id", employeeId);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!leave) return;

        const formData = new FormData();

        formData.append("employee_id", data.employee_id);
        formData.append("start_date", data.start_date);
        formData.append("end_date", data.end_date);
        formData.append("leave_type", data.leave_type);
        formData.append("reason", data.reason);
        formData.append("status", data.status);
        formData.append("_method", "PUT");
        if (data.image) {
            formData.append("image", data.image);
        } else if (data.remove_existing_image) {
            formData.append("remove_image", "1");
        }
        router.post(route("admin.leaves.update", leave.id), formData, {
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

    const isSickLeave = data.leave_type === "sick";

    const handleImageChange = (file: File | null) => {
        setData("image", file);
        if (file) {
            setData("remove_existing_image", false);
        }
    };

    const handleImageRemove = () => {
        setData("image", null);
        if (leave?.image) {
            setData("remove_existing_image", false);
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
                        className="text-sm font-medium  dark:text-gray-700"
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
                    <Input
                        id="start_date"
                        type="date"
                        label="Start Date"
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
                    <Input
                        id="end_date"
                        type="date"
                        label="End Date"
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
                    <Label
                        htmlFor="leave_type"
                        className="text-sm font-medium  dark:text-gray-700"
                    >
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
                    <Label
                        htmlFor="reason"
                        className="text-sm font-medium  dark:text-gray-700"
                    >
                        Reason <span className="text-danger">*</span>
                    </Label>
                    <textarea
                        id="reason"
                        value={data.reason}
                        onChange={(e) =>
                            handleInputChange("reason", e.target.value)
                        }
                        className="w-full min-h-[100px] px-3 py-2 border  dark:text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                        placeholder="Enter reason for leave..."
                        required
                    />
                    {errors.reason && (
                        <p className="text-sm text-danger">{errors.reason}</p>
                    )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <Label
                        htmlFor="status"
                        className="text-sm font-medium dark:text-gray-700"
                    >
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

                <div className="space-y-2">
                    {isSickLeave && (
                        <InputImage
                            id="medical_certificate"
                            label="Medical Certificate"
                            value={data.image}
                            onChange={handleImageChange}
                            onRemove={handleImageRemove}
                            required={!leave?.image}
                            accept="image/*"
                            maxSize={2}
                            placeholder="Upload medical certificate"
                            error={errors.image}
                            dragDrop={true}
                            preview={true}
                            existingImageUrl={leave?.image}
                        />
                    )}
                    {errors.image && (
                        <p className="text-sm text-danger">{errors.image}</p>
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
