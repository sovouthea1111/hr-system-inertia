import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";
import { Modal } from "@/Components/UI/Modal";
import { Button } from "@/Components/UI/Button";
import { Input } from "@/Components/UI/Input";
import { Label } from "@/Components/UI/Label";
import { Textarea } from "@/Components/UI/Textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/UI/Select";

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

interface UpdateOvertimeModalProps {
    isOpen: boolean;
    onClose: () => void;
    overtimeTypes: OvertimeType[];
    selectedOvertime: Overtime | null;
}

interface FormData {
    overtime_date: string;
    overtime_type: string;
    start_time: string;
    end_time: string;
    hourly_rate: string;
    reason: string;
}

const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";
    return dateString.split("T")[0];
};

const convertTo24Hour = (time: string): string => {
    if (!time) return "";

    const [timePart, period] = time.split(" ");
    if (!period) return time;

    let [hours, minutes] = timePart.split(":");
    let hour = parseInt(hours, 10);

    if (period.toLowerCase() === "pm" && hour !== 12) {
        hour += 12;
    } else if (period.toLowerCase() === "am" && hour === 12) {
        hour = 0;
    }

    const paddedMinutes = minutes ? minutes.padStart(2, "0") : "00";
    return `${hour.toString().padStart(2, "0")}:${paddedMinutes}`;
};

const convertTo12Hour = (time: string): string => {
    if (!time) return "";

    const [hours, minutes] = time.split(":");
    let hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";

    if (hour === 0) {
        hour = 12;
    } else if (hour > 12) {
        hour -= 12;
    }

    const paddedMinutes = minutes ? minutes.padStart(2, "0") : "00";
    return `${hour}:${paddedMinutes} ${period}`;
};

export function UpdateOvertimeModal({
    isOpen,
    onClose,
    overtimeTypes,
    selectedOvertime,
}: UpdateOvertimeModalProps) {
    const [formData, setFormData] = useState<FormData>({
        overtime_date: "",
        overtime_type: "",
        start_time: "",
        end_time: "",
        hourly_rate: "",
        reason: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [selectedOvertimeType, setSelectedOvertimeType] = useState("");
    const [hourlyRate, setHourlyRate] = useState(0);

    useEffect(() => {
        if (selectedOvertime) {
            setFormData({
                overtime_date: formatDateForInput(
                    selectedOvertime.overtime_date
                ),
                overtime_type: selectedOvertime.overtime_type,
                start_time: convertTo12Hour(selectedOvertime.start_time),
                end_time: convertTo12Hour(selectedOvertime.end_time),
                hourly_rate: selectedOvertime.hourly_rate.toString(),
                reason: selectedOvertime.reason,
            });
        }
    }, [selectedOvertime]);

    useEffect(() => {
        if (!isOpen) {
            setErrors({});
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleOvertimeTypeChange = (value: string) => {
        setSelectedOvertimeType(value);
        handleInputChange("overtime_type", value);

        const selectedType = overtimeTypes.find((type) => type.value === value);
        if (selectedType && selectedType.price) {
            setHourlyRate(selectedType.price);
            handleInputChange("hourly_rate", selectedType.price.toString());
        }
    };
    const validateForm = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.overtime_date.trim()) {
            newErrors.overtime_date = "Overtime date is required";
        }

        if (!formData.overtime_type.trim()) {
            newErrors.overtime_type = "Overtime type is required";
        }

        if (!formData.start_time.trim()) {
            newErrors.start_time = "Start time is required";
        }

        if (!formData.end_time.trim()) {
            newErrors.end_time = "End time is required";
        }

        if (!formData.hourly_rate.trim()) {
            newErrors.hourly_rate = "Hourly rate is required";
        } else if (
            isNaN(Number(formData.hourly_rate)) ||
            Number(formData.hourly_rate) <= 0
        ) {
            newErrors.hourly_rate = "Please enter a valid hourly rate";
        }

        if (!formData.reason.trim()) {
            newErrors.reason = "Reason is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !selectedOvertime) {
            return;
        }

        setIsSubmitting(true);

        try {
            const submitData = {
                overtime_date: formData.overtime_date,
                overtime_type: formData.overtime_type,
                start_time: convertTo24Hour(formData.start_time),
                end_time: convertTo24Hour(formData.end_time),
                hourly_rate: parseFloat(formData.hourly_rate),
                reason: formData.reason.trim(),
                _method: "PUT",
            };

            router.put(`/admin/overtime/${selectedOvertime.id}`, submitData, {
                onSuccess: () => {
                    toast.success("Overtime request updated successfully!");
                    onClose();
                },
                onError: (errors) => {
                    console.error("Update failed:", errors);

                    if (typeof errors === "object" && errors !== null) {
                        setErrors(errors as Partial<FormData>);
                    }

                    toast.error(
                        "Failed to update overtime request. Please check the form and try again."
                    );
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        } catch (error) {
            console.error("Unexpected error:", error);
            toast.error("An unexpected error occurred. Please try again.");
            setIsSubmitting(false);
        }
    };

    const getCurrentMonthRange = (): { min: string; max: string } => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        return {
            min: firstDay.toISOString().split("T")[0],
            max: lastDay.toISOString().split("T")[0],
        };
    };

    const getTodayDate = (): string => {
        return new Date().toISOString().split("T")[0];
    };

    if (!selectedOvertime) {
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Update Overtime Request"
            className="max-w-2xl"
            bodyClassName="max-h-[60vh] overflow-y-auto"
            footer={
                <div className="flex justify-end space-x-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="update-overtime-form"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isSubmitting ? "Updating..." : "Update Request"}
                    </Button>
                </div>
            }
        >
            <div className="mb-4">
                <p className="text-sm text-gray-600">
                    Update the overtime request below.
                </p>
            </div>

            <form
                id="update-overtime-form"
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                {/* Employee Info Display */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">
                        Employee Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm dark:text-gray-700">
                        <div>
                            <span className="font-medium dark:text-gray-700">Name:</span>{" "}
                            {selectedOvertime.employee.full_name}
                        </div>
                        <div>
                            <span className="font-medium dark:text-gray-700">Email:</span>{" "}
                            {selectedOvertime.employee.email}
                        </div>
                        <div>
                            <span className="font-medium">Department:</span>{" "}
                            {selectedOvertime.employee.department}
                        </div>
                        <div>
                            <span className="font-medium dark:text-gray-700">Status:</span>
                            <span
                                className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                    selectedOvertime.status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : selectedOvertime.status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                }`}
                            >
                                {selectedOvertime.status
                                    .charAt(0)
                                    .toUpperCase() +
                                    selectedOvertime.status.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Overtime Date */}
                    <div className="space-y-2">
                        <Label htmlFor="overtime_date" className="dark:text-gray-700">
                            Overtime Date{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="overtime_date"
                            type="date"
                            value={formData.overtime_date}
                            onChange={(e) =>
                                handleInputChange(
                                    "overtime_date",
                                    e.target.value
                                )
                            }
                            min={getCurrentMonthRange().min}
                            max={getCurrentMonthRange().max}
                            required
                            className={
                                errors.overtime_date ? "border-danger" : ""
                            }
                        />
                        {errors.overtime_date && (
                            <p className="text-sm text-danger">
                                {errors.overtime_date}
                            </p>
                        )}
                    </div>
                    {/* Overtime Type */}
                    <div className="space-y-2">
                        <Label htmlFor="overtime_type" className="dark:text-gray-700">
                            Overtime Type{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.overtime_type}
                            onValueChange={handleOvertimeTypeChange}
                        >
                            <SelectTrigger
                                className={
                                    errors.overtime_type ? "border-red-500" : ""
                                }
                            >
                                <SelectValue placeholder="Select overtime type" />
                            </SelectTrigger>
                            <SelectContent>
                                {overtimeTypes.map((type) => (
                                    <SelectItem
                                        key={type.value}
                                        value={type.value}
                                    >
                                        <div className="flex justify-between items-center w-full">
                                            <span>{type.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.overtime_type && (
                            <p className="text-sm text-danger">
                                {errors.overtime_type}
                            </p>
                        )}
                    </div>
                </div>

                {/* Time Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Start Time */}
                    <div className="space-y-2">
                        <Label htmlFor="start_time" className="dark:text-gray-700">
                            Start Time <span className="text-danger">*</span>
                        </Label>
                        <div className="flex gap-2">
                            <Select
                                value={formData.start_time.split(":")[0] || ""}
                                onValueChange={(hour) => {
                                    const currentMinute =
                                        formData.start_time
                                            .split(":")[1]
                                            ?.split(" ")[0] || "00";
                                    const currentPeriod =
                                        formData.start_time.includes("AM")
                                            ? "AM"
                                            : "PM";
                                    handleInputChange(
                                        "start_time",
                                        `${hour}:${currentMinute} ${currentPeriod}`
                                    );
                                }}
                            >
                                <SelectTrigger
                                    className={`w-20 ${
                                        errors.start_time ? "border-danger" : ""
                                    }`}
                                >
                                    <SelectValue placeholder="H" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from(
                                        { length: 12 },
                                        (_, i) => i + 1
                                    ).map((hour) => (
                                        <SelectItem
                                            key={hour}
                                            value={hour.toString()}
                                        >
                                            {hour}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="flex items-center">:</span>
                            <Select
                                value={
                                    formData.start_time
                                        .split(":")[1]
                                        ?.split(" ")[0] || ""
                                }
                                onValueChange={(minute) => {
                                    const currentHour =
                                        formData.start_time.split(":")[0] ||
                                        "1";
                                    const currentPeriod =
                                        formData.start_time.includes("AM")
                                            ? "AM"
                                            : "PM";
                                    handleInputChange(
                                        "start_time",
                                        `${currentHour}:${minute} ${currentPeriod}`
                                    );
                                }}
                            >
                                <SelectTrigger
                                    className={`w-20 ${
                                        errors.start_time ? "border-danger" : ""
                                    }`}
                                >
                                    <SelectValue placeholder="M" />
                                </SelectTrigger>
                                <SelectContent>
                                    {["00", "15", "30", "45"].map((minute) => (
                                        <SelectItem key={minute} value={minute}>
                                            {minute}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={
                                    formData.start_time.includes("AM")
                                        ? "AM"
                                        : formData.start_time.includes("PM")
                                        ? "PM"
                                        : ""
                                }
                                onValueChange={(period) => {
                                    const timePart =
                                        formData.start_time.split(" ")[0] ||
                                        "1:00";
                                    handleInputChange(
                                        "start_time",
                                        `${timePart} ${period}`
                                    );
                                }}
                            >
                                <SelectTrigger
                                    className={`w-20 ${
                                        errors.start_time ? "border-danger" : ""
                                    }`}
                                >
                                    <SelectValue placeholder="AM/PM" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AM">AM</SelectItem>
                                    <SelectItem value="PM">PM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {errors.start_time && (
                            <p className="text-sm text-danger">
                                {errors.start_time}
                            </p>
                        )}
                    </div>

                    {/* End Time */}
                    <div className="space-y-2">
                        <Label htmlFor="end_time" className="dark:text-gray-700">
                            End Time <span className="text-danger">*</span>
                        </Label>
                        <div className="flex gap-2">
                            <Select
                                value={formData.end_time.split(":")[0] || ""}
                                onValueChange={(hour) => {
                                    const currentMinute =
                                        formData.end_time
                                            .split(":")[1]
                                            ?.split(" ")[0] || "00";
                                    const currentPeriod =
                                        formData.end_time.includes("AM")
                                            ? "AM"
                                            : "PM";
                                    handleInputChange(
                                        "end_time",
                                        `${hour}:${currentMinute} ${currentPeriod}`
                                    );
                                }}
                            >
                                <SelectTrigger
                                    className={`w-20 ${
                                        errors.end_time ? "border-danger" : ""
                                    }`}
                                >
                                    <SelectValue placeholder="H" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from(
                                        { length: 12 },
                                        (_, i) => i + 1
                                    ).map((hour) => (
                                        <SelectItem
                                            key={hour}
                                            value={hour.toString()}
                                        >
                                            {hour}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="flex items-center">:</span>
                            <Select
                                value={
                                    formData.end_time
                                        .split(":")[1]
                                        ?.split(" ")[0] || ""
                                }
                                onValueChange={(minute) => {
                                    const currentHour =
                                        formData.end_time.split(":")[0] || "1";
                                    const currentPeriod =
                                        formData.end_time.includes("AM")
                                            ? "AM"
                                            : "PM";
                                    handleInputChange(
                                        "end_time",
                                        `${currentHour}:${minute} ${currentPeriod}`
                                    );
                                }}
                            >
                                <SelectTrigger
                                    className={`w-20 ${
                                        errors.end_time ? "border-danger" : ""
                                    }`}
                                >
                                    <SelectValue placeholder="M" />
                                </SelectTrigger>
                                <SelectContent>
                                    {["00", "15", "30", "45"].map((minute) => (
                                        <SelectItem key={minute} value={minute}>
                                            {minute}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={
                                    formData.end_time.includes("AM")
                                        ? "AM"
                                        : formData.end_time.includes("PM")
                                        ? "PM"
                                        : ""
                                }
                                onValueChange={(period) => {
                                    const timePart =
                                        formData.end_time.split(" ")[0] ||
                                        "1:00";
                                    handleInputChange(
                                        "end_time",
                                        `${timePart} ${period}`
                                    );
                                }}
                            >
                                <SelectTrigger
                                    className={`w-20 ${
                                        errors.end_time ? "border-danger" : ""
                                    }`}
                                >
                                    <SelectValue placeholder="AM/PM" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AM">AM</SelectItem>
                                    <SelectItem value="PM">PM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {errors.end_time && (
                            <p className="text-sm text-danger">
                                {errors.end_time}
                            </p>
                        )}
                    </div>
                </div>

                {/* Hourly Rate */}
                <div className="space-y-2">
                    <Input
                        label="Hourly Rate"
                        id="hourly_rate"
                        type="number"
                        step="0.01"
                        min="0"
                        value={hourlyRate || formData.hourly_rate}
                        disabled={true}
                        className={`w-full ${
                            selectedOvertimeType !== ""
                                ? "bg-gray-100 cursor-not-allowed"
                                : ""
                        } ${errors.hourly_rate ? "border-danger" : ""}`}
                        onChange={(e) =>
                            handleInputChange("hourly_rate", e.target.value)
                        }
                        placeholder={
                            selectedOvertimeType !== ""
                                ? "Rate set automatically"
                                : "Enter hourly rate"
                        }
                        required
                    />
                    {errors.hourly_rate && (
                        <p className="text-sm text-danger">
                            {errors.hourly_rate}
                        </p>
                    )}
                </div>

                {/* Reason */}
                <div className="space-y-2">
                    <Label htmlFor="reason" className="dark:text-gray-700">
                        Reason for Overtime{" "}
                        <span className="text-danger">*</span>
                    </Label>
                    <Textarea
                        id="reason"
                        value={formData.reason}
                        onChange={(e) =>
                            handleInputChange("reason", e.target.value)
                        }
                        placeholder="Please provide a detailed reason for the overtime request..."
                        required
                        className={`min-h-[100px] resize-none bg-inputBackground dark:text-gray-700 ${
                            errors.reason ? "border-danger " : ""
                        }`}
                        maxLength={1000}
                    />
                    <div className="flex justify-between items-center">
                        {errors.reason && (
                            <p className="text-sm text-danger">
                                {errors.reason}
                            </p>
                        )}
                        <p className="text-sm text-gray-500 ml-auto">
                            {formData.reason.length}/1000 characters
                        </p>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
