import React, { useState, useEffect } from "react";
import { useForm, Head, router } from "@inertiajs/react";
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
import { InputImage } from "@/Components/UI/InputImage";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

interface Employee {
    id: number;
    full_name: string;
    email: string;
}

interface RequestLeaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLeaveCreated: () => void;
    employees: Employee[];
    leaveTypes: Array<{ value: string; label: string }>;
    auth?: { user?: { user_role: string; email?: string } };
}

export function RequestLeaveModal({
    isOpen,
    onClose,
    onLeaveCreated,
    employees,
    leaveTypes,
    auth,
}: RequestLeaveModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<{
            employee_id: string;
            employee_name: string;
            start_date: string;
            end_date: string;
            leave_type: string;
            reason: string;
            image: File | null;
        }>({
            employee_id: "",
            employee_name: "",
            start_date: "",
            end_date: "",
            leave_type: "",
            reason: "",
            image: null,
        });

    // Auth checks
    const userRole = auth?.user?.user_role;
    const currentUserEmail = auth?.user?.email;
    const isEmployee = userRole === "Employee";
    const isHR = userRole === "HR";
    const isAdmin = userRole === "Admin" || userRole === "Super Admin";

    const shouldDisableEmployeeSelect = isEmployee || isHR;

    const isSickLeave = data.leave_type === "sick";

    const handleImageChange = (file: File | null) => {
        setData("image", file);
    };

    const handleImageRemove = () => {
        setData("image", null);
    };

    useEffect(() => {
        if (
            (isEmployee || isHR) &&
            currentUserEmail &&
            employees.length > 0 &&
            isOpen
        ) {
            const currentEmployee = employees.find(
                (emp) => emp.email === currentUserEmail
            );
            if (currentEmployee) {
                setData((prevData) => ({
                    ...prevData,
                    employee_id: currentEmployee.id.toString(),
                    employee_name: currentEmployee.full_name,
                }));
            }
        }
    }, [isEmployee, isHR, currentUserEmail, employees, isOpen]);

    useEffect(() => {
        if (!isOpen) {
            clearFormData();
        }
    }, [isOpen]);

    const handleEmployeeChange = (employeeId: string) => {
        const selectedEmployee = employees.find(
            (emp) => emp.id.toString() === employeeId
        );

        setData((prevData) => ({
            ...prevData,
            employee_id: employeeId,
            employee_name: selectedEmployee ? selectedEmployee.full_name : "",
        }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if ((isEmployee || isHR) && currentUserEmail) {
            const currentEmployee = employees.find(
                (emp) => emp.email === currentUserEmail
            );
            if (
                !currentEmployee ||
                data.employee_id !== currentEmployee.id.toString()
            ) {
                toast.error("You can only create leave requests for yourself.");
                return;
            }
        }

        post(route("admin.leaves.store"), {
            onSuccess: () => {
                toast.success("Leave request submitted successfully!", {
                    duration: 4000,
                    position: "top-right",
                });
                onLeaveCreated();
                handleClose();
            },
            onError: (errors) => {
                toast.error(
                    "Failed to submit leave request. Please check the form."
                );
                console.error("Form errors:", errors);
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

    const getFilteredEmployees = () => {
        if ((isEmployee || isHR) && currentUserEmail) {
            return employees.filter((emp) => emp.email === currentUserEmail);
        }
        return employees;
    };

    const filteredEmployees = getFilteredEmployees();

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            className="max-w-2xl"
            title="Request Leave"
        >
            <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Employee Selection */}
                <div className="space-y-2">
                    <Label
                        htmlFor="employee_id"
                        className="text-sm font-medium dark:text-gray-700"
                    >
                        Employee <span className="text-danger">*</span>
                    </Label>
                    <Select
                        value={data.employee_id}
                        onValueChange={handleEmployeeChange}
                        disabled={shouldDisableEmployeeSelect}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue
                                placeholder={
                                    isEmployee || isHR
                                        ? "Your account"
                                        : "Select an employee"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredEmployees.map((employee) => (
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
                    {(isEmployee || isHR) && (
                        <p className="text-xs text-gray-500">
                            You can only create leave requests for yourself.
                        </p>
                    )}
                    {isAdmin && (
                        <p className="text-xs text-gray-500">
                            You can create leave requests for any employee.
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
                        onChange={(e) => setData("start_date", e.target.value)}
                        className="w-full"
                        required
                        min={new Date().toISOString().split("T")[0]} // Prevent past dates
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
                        onChange={(e) => setData("end_date", e.target.value)}
                        className="w-full"
                        required
                        min={
                            data.start_date ||
                            new Date().toISOString().split("T")[0]
                        }
                    />
                    {errors.end_date && (
                        <p className="text-sm text-danger">{errors.end_date}</p>
                    )}
                </div>

                {/* Leave Type */}
                <div className="space-y-2">
                    <Label
                        htmlFor="leave_type"
                        className="text-sm font-medium dark:text-gray-700"
                    >
                        Leave Type <span className="text-danger">*</span>
                    </Label>
                    <Select
                        value={data.leave_type}
                        onValueChange={(value) => {
                            setData("leave_type", value);
                            if (value !== "sick") {
                                setData("image", null);
                            }
                        }}
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
                        className="text-sm font-medium dark:text-gray-700"
                    >
                        Reason <span className="text-danger">*</span>
                    </Label>
                    <textarea
                        id="reason"
                        value={data.reason}
                        onChange={(e) => setData("reason", e.target.value)}
                        className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        placeholder="Enter the reason for leave request..."
                        required
                    />
                    {errors.reason && (
                        <p className="text-sm text-danger">{errors.reason}</p>
                    )}
                </div>

                {/* Medical Certificate for Sick Leave */}
                {isSickLeave && (
                    <div className="space-y-2">
                        <InputImage
                            id="medical_certificate"
                            label="Medical Certificate"
                            value={data.image}
                            onChange={handleImageChange}
                            onRemove={handleImageRemove}
                            required={true}
                            accept="image/*,.pdf"
                            maxSize={2}
                            placeholder="Upload medical certificate (Image or PDF)"
                            error={errors.image}
                            dragDrop={true}
                            preview={true}
                        />
                    </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
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
                        disabled={processing || !data.employee_id}
                        variant="primary"
                        className="flex items-center space-x-2"
                    >
                        <Save className="h-4 w-4" />
                        <span>
                            {processing ? "Submitting..." : "Submit Request"}
                        </span>
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

interface CreatePageProps {
    employees: Employee[];
    leaveTypes: Array<{ value: string; label: string }>;
    auth?: { user?: { user_role: string; email?: string } };
}

export default function Create({
    employees,
    leaveTypes,
    auth,
}: CreatePageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleLeaveCreated = () => {
        router.get(route("admin.leaves.index"));
    };

    return (
        <>
            <Head title="Create Leave Application" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                        Leave Management
                                    </h1>
                                    <Button
                                        onClick={() => setIsModalOpen(true)}
                                        variant="primary"
                                    >
                                        Create Leave Application
                                    </Button>
                                </div>

                                <RequestLeaveModal
                                    isOpen={isModalOpen}
                                    onClose={() => setIsModalOpen(false)}
                                    onLeaveCreated={handleLeaveCreated}
                                    employees={employees}
                                    leaveTypes={leaveTypes}
                                    auth={auth}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
}
