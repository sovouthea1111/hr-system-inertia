import React, { useEffect } from "react";
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
    auth?: { user?: { user_role: string; email?: string } };
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

    const userRole = auth?.user?.user_role;
    const currentUserEmail = auth?.user?.email;
    const isEmployee = userRole === "Employee";
    const isHR = userRole === "HR";

    const isOwnLeave =
        leave && currentUserEmail && leave.employee_email === currentUserEmail;

    const shouldDisableEmployeeSelect = isEmployee || (isHR && isOwnLeave);
    const shouldDisableStatusSelect = isEmployee || (isHR && isOwnLeave);

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

        if ((isEmployee || (isHR && isOwnLeave)) && currentUserEmail) {
            const currentEmployee = employees.find(
                (emp) => emp.email === currentUserEmail
            );
            if (
                !currentEmployee ||
                data.employee_id !== currentEmployee.id.toString()
            ) {
                toast.error("You can only edit your own leave applications.");
                return;
            }
        }

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
                console.error("Update errors:", errors);
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

    const getFilteredEmployees = () => {
        if ((isEmployee || (isHR && isOwnLeave)) && currentUserEmail) {
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
            title="Edit Leave Application"
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
                        disabled={shouldDisableEmployeeSelect || false}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue
                                placeholder={
                                    shouldDisableEmployeeSelect
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
                    {shouldDisableEmployeeSelect && (
                        <p className="text-xs text-gray-500">
                            You can only edit your own leave applications.
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
                        onChange={(e) =>
                            handleInputChange("end_date", e.target.value)
                        }
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
                            handleInputChange("leave_type", value);
                            if (value !== "sick") {
                                setData("image", null);
                                setData("remove_existing_image", false);
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
                        onChange={(e) =>
                            handleInputChange("reason", e.target.value)
                        }
                        className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        placeholder="Enter reason for leave..."
                        required
                    />
                    {errors.reason && (
                        <p className="text-sm text-danger">{errors.reason}</p>
                    )}
                </div>

                {/* Status - Only show for Admin or HR managing others' leaves */}
                {!shouldDisableStatusSelect && (
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
                            <p className="text-sm text-danger">
                                {errors.status}
                            </p>
                        )}
                    </div>
                )}

                {/* Show current status for employees and HR editing their own leaves */}
                {shouldDisableStatusSelect && (
                    <div className="space-y-2">
                        <Label className="text-sm font-medium dark:text-gray-700">
                            Current Status
                        </Label>
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
                            <div
                                className={`w-2 h-2 rounded-full ${
                                    data.status === "approved"
                                        ? "bg-green-500"
                                        : data.status === "pending"
                                        ? "bg-yellow-500 animate-pulse"
                                        : "bg-red-500"
                                }`}
                            />
                            <span className="text-sm font-medium capitalize">
                                {data.status}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">
                            {isHR && isOwnLeave
                                ? "You cannot change the status of your own leave request."
                                : "You cannot change the status of your leave request."}
                        </p>
                    </div>
                )}

                {/* Medical Certificate for Sick Leave */}
                {isSickLeave && (
                    <div className="space-y-2">
                        <InputImage
                            id="medical_certificate"
                            label="Medical Certificate"
                            value={data.image}
                            onChange={handleImageChange}
                            onRemove={handleImageRemove}
                            required={!leave?.image}
                            accept="image/*,.pdf"
                            maxSize={2}
                            placeholder="Upload medical certificate (Image or PDF)"
                            error={errors.image}
                            dragDrop={true}
                            preview={true}
                            existingImageUrl={leave?.image}
                        />
                        {errors.image && (
                            <p className="text-sm text-danger">
                                {errors.image}
                            </p>
                        )}
                        <p className="text-xs text-gray-500">
                            Medical certificate is required for sick leave
                            requests.
                        </p>
                    </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
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
                        disabled={processing || !data.employee_id}
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
