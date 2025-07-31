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
import { X, Save } from "lucide-react";
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
    created_at?: string;
    updated_at?: string;
}

interface EditEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee | null;
    onEmployeeUpdated: () => void;
}

const departments = [
    { value: "HR", label: "Human Resources" },
    { value: "IT", label: "Information Technology" },
    { value: "Media", label: "Social Media" },
    { value: "ISO", label: "ISO" },
];

export function EditEmployeeModal({
    isOpen,
    onClose,
    employee,
    onEmployeeUpdated,
}: EditEmployeeModalProps) {
    const { data, setData, put, processing, errors, reset, clearErrors } =
        useForm({
            full_name: "",
            email: "",
            phone: "",
            department: "",
            position: "",
            joint_date: "",
            status: "active" as "active" | "inactive",
        });

    // Populate form with employee data when modal opens
    useEffect(() => {
        if (employee && isOpen) {
            setData({
                full_name: employee.full_name || "",
                email: employee.email || "",
                phone: employee.phone || "",
                department: employee.department || "",
                position: employee.position || "",
                joint_date: employee.joint_date
                    ? employee.joint_date.split("T")[0]
                    : "",
                status: employee.status || "active",
            });
        }
    }, [employee, isOpen]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!employee) return;

        put(route("admin.employees.update", employee.id), {
            onSuccess: () => {
                // Show success message
                toast.success(
                    `Employee "${data.full_name}" has been updated successfully!`,
                    {
                        duration: 4000,
                        position: "top-right",
                    }
                );

                onEmployeeUpdated();
                clearFormData();
                onClose();
            },

            onError: (errors) => {
                console.error("Validation errors:", errors);
                toast.error(
                    "Failed to update employee. Please check the form and try again.",
                    {
                        duration: 4000,
                        position: "top-right",
                    }
                );
            },
        });
    };

    const clearFormData = () => {
        reset();
        clearErrors();
    };

    const handleCancel = () => {
        onClose();
        clearErrors();
    };

    const handleInputChange = (field: string, value: string) => {
        setData(field as any, value);
        if (errors[field as keyof typeof errors]) {
            clearErrors(field as keyof typeof errors);
        }
    };

    if (!employee) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            title="Edit Employee"
            className="max-w-2xl"
            footer={
                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={processing}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleFormSubmit}
                        disabled={processing}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {processing ? "Updating..." : "Update Employee"}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <Input
                            id="full_name"
                            type="text"
                            value={data.full_name}
                            required
                            label="Full Name"
                            onChange={(e) =>
                                handleInputChange("full_name", e.target.value)
                            }
                            placeholder="Enter full name"
                            className={errors.full_name ? "border-danger" : ""}
                        />
                        {errors.full_name && (
                            <p className="text-sm text-danger">
                                {errors.full_name}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Input
                            id="email"
                            type="email"
                            label="Email"
                            required
                            value={data.email}
                            onChange={(e) =>
                                handleInputChange("email", e.target.value)
                            }
                            placeholder="Enter email address"
                            className={errors.email ? "border-danger" : ""}
                        />
                        {errors.email && (
                            <p className="text-sm text-danger">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Input
                            id="phone"
                            type="tel"
                            label="Phone"
                            value={data.phone}
                            onChange={(e) =>
                                handleInputChange("phone", e.target.value)
                            }
                            placeholder="Enter phone number"
                            className={errors.phone ? "border-danger" : ""}
                        />
                        {errors.phone && (
                            <p className="text-sm text-danger">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="department"
                            className="dark:text-gray-700"
                        >
                            Department <span className="text-danger">*</span>
                        </Label>
                        <Select
                            value={data.department}
                            onValueChange={(value) =>
                                handleInputChange("department", value)
                            }
                        >
                            <SelectTrigger
                                className={
                                    errors.department ? "border-danger" : ""
                                }
                            >
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map((dept) => (
                                    <SelectItem
                                        key={dept.value}
                                        value={dept.value}
                                    >
                                        {dept.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.department && (
                            <p className="text-sm text-danger">
                                {errors.department}
                            </p>
                        )}
                    </div>

                    {/* Position */}
                    <div className="space-y-2">
                        <Input
                            id="position"
                            type="text"
                            label="Position"
                            value={data.position}
                            onChange={(e) =>
                                handleInputChange("position", e.target.value)
                            }
                            placeholder="Enter position"
                            className={errors.position ? "border-danger" : ""}
                        />
                        {errors.position && (
                            <p className="text-sm text-danger">
                                {errors.position}
                            </p>
                        )}
                    </div>

                    {/* Join Date */}
                    <div className="space-y-2">
                        <Input
                            id="joint_date"
                            type="date"
                            label="Joint Date"
                            required
                            value={data.joint_date}
                            onChange={(e) =>
                                handleInputChange("joint_date", e.target.value)
                            }
                            className={errors.joint_date ? "border-danger" : ""}
                        />
                        {errors.joint_date && (
                            <p className="text-sm text-danger">
                                {errors.joint_date}
                            </p>
                        )}
                    </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <Label htmlFor="status" className="dark:text-gray-700">
                        Status <span className="text-danger">*</span>
                    </Label>
                    <Select
                        value={data.status}
                        onValueChange={(value) =>
                            handleInputChange(
                                "status",
                                value as "active" | "inactive"
                            )
                        }
                    >
                        <SelectTrigger
                            className={errors.status ? "border-danger" : ""}
                        >
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.status && (
                        <p className="text-sm text-danger">{errors.status}</p>
                    )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-primary">
                        <strong>Note:</strong> All fields marked with * are
                        required. Changes will be saved immediately upon
                        submission.
                    </p>
                </div>
            </form>
        </Modal>
    );
}
