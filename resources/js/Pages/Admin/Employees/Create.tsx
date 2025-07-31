import React, { useState } from "react";
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

interface CreateEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEmployeeCreated: (employee: Employee) => void;
}

const departments = [
    { value: "HR", label: "Human Resources" },
    { value: "IT", label: "Information Technology" },
    { value: "Media", label: "Social Media" },
    { value: "ISO", label: "ISO" },
];

export function CreateEmployeeModal({
    isOpen,
    onClose,
    onEmployeeCreated,
}: CreateEmployeeModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            full_name: "",
            email: "",
            phone: "",
            department: "",
            position: "",
            joint_date: "",
            status: "active" as "active" | "inactive",
        });
    interface PageProps {
        employee?: Employee;
        data?: {
            employee?: Employee;
        };
        [key: string]: any;
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route("admin.employees.store"), {
            onSuccess: (page: { props: PageProps }) => {

                const responseEmployee =
                    page.props.employee || page.props.data?.employee;

                const employee: Employee = responseEmployee || {
                    id: Date.now(),
                    full_name: data.full_name,
                    email: data.email,
                    phone: data.phone,
                    department: data.department,
                    position: data.position,
                    joint_date: data.joint_date,
                    status: data.status,
                };

                // Show success message
                toast.success(
                    `Employee "${data.full_name}" has been created successfully!`,
                    {
                        duration: 4000,
                        position: "top-right",
                    }
                );

                onEmployeeCreated(employee);
                clearFormData();
                onClose();
            },

            onError: (errors) => {
                console.error("Validation errors:", errors);
                toast.error(
                    "Failed to create employee. Please check the form and try again.",
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            title="Add New Employee"
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
                        {processing ? "Adding..." : "Add Employee"}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="md:col-span-2">
                        <Input
                            id="full_name"
                            type="text"
                            label="Full Name"
                            required
                            placeholder="Enter full name"
                            value={data.full_name}
                            onChange={(e) =>
                                handleInputChange("full_name", e.target.value)
                            }
                            className={errors.full_name ? "border-danger" : ""}
                        />
                        {errors.full_name && (
                            <p className="text-danger text-sm mt-1">
                                {errors.full_name}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <Input
                            id="email"
                            type="email"
                            label="Email"
                            required
                            placeholder="Enter email address"
                            value={data.email}
                            onChange={(e) =>
                                handleInputChange("email", e.target.value)
                            }
                            className={errors.email ? "border-danger" : ""}
                        />
                        {errors.email && (
                            <p className="text-danger text-sm mt-1">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <Input
                            id="phone"
                            type="tel"
                            label="Phone"
                            placeholder="Enter phone number"
                            value={data.phone}
                            onChange={(e) =>
                                handleInputChange("phone", e.target.value)
                            }
                            className={errors.phone ? "border-danger" : ""}
                        />
                        {errors.phone && (
                            <p className="text-danger text-sm mt-1">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    {/* Department */}
                    <div>
                        <Label
                            htmlFor="department"
                            className="text-sm font-medium text-gray-700 mb-2 block"
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
                            <p className="text-danger text-sm mt-1">
                                {errors.department}
                            </p>
                        )}
                    </div>

                    {/* Position */}
                    <div>
                        <Input
                            id="position"
                            type="text"
                            label="Position"
                            placeholder="Enter position/job title"
                            value={data.position}
                            onChange={(e) =>
                                handleInputChange("position", e.target.value)
                            }
                            className={errors.position ? "border-danger" : ""}
                        />
                        {errors.position && (
                            <p className="text-danger text-sm mt-1">
                                {errors.position}
                            </p>
                        )}
                    </div>

                    {/* Join Date */}
                    <div className="md:col-span-2">
                        <Input
                            id="joint_date"
                            type="date"
                            label="Join Date"
                            required
                            value={data.joint_date}
                            onChange={(e) =>
                                handleInputChange("joint_date", e.target.value)
                            }
                            className={errors.joint_date ? "border-danger" : ""}
                        />
                        {errors.joint_date && (
                            <p className="text-danger text-sm mt-1">
                                {errors.joint_date}
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-primary">
                        <strong>Note:</strong> Only HR personnel can input
                        employee information. All fields marked with{" "}
                        <span className="text-danger">*</span> are required.
                    </p>
                </div>
            </form>
        </Modal>
    );
}
