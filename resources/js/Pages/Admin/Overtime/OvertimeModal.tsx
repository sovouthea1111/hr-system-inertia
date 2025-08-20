import React, { useState } from "react";
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

interface OvertimeModalProps {
    isOpen: boolean;
    onClose: () => void;
    overtimeTypes: OvertimeType[];
    selectedOvertime?: Overtime | null;
}

interface OvertimeFormData {
    overtime_date: string;
    start_time: string;
    end_time: string;
    overtime_type: string;
    reason: string;
    hourly_rate: string;
    [key: string]: string;
}

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

export function OvertimeModal({
    isOpen,
    onClose,
    overtimeTypes,
    selectedOvertime,
}: OvertimeModalProps) {
    const overtimeTypesArray =
        Array.isArray(overtimeTypes) && overtimeTypes.length > 0
            ? overtimeTypes
            : [
                  { value: "regular", label: "Regular" },
                  { value: "weekend", label: "Weekend" },
                  { value: "holiday", label: "Holiday" },
                  { value: "emergency", label: "Emergency" },
              ];

    const [formData, setFormData] = useState<OvertimeFormData>({
        overtime_date: "",
        start_time: "",
        end_time: "",
        overtime_type: "",
        reason: "",
        hourly_rate: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedOvertimeType, setSelectedOvertimeType] = useState("");
    const [hourlyRate, setHourlyRate] = useState(0);

    const convertTo24Hour = (
        hour: string,
        minute: string,
        period: string
    ): string => {
        let hour24 = parseInt(hour);
        if (period === "AM" && hour24 === 12) {
            hour24 = 0;
        } else if (period === "PM" && hour24 !== 12) {
            hour24 += 12;
        }
        return `${hour24.toString().padStart(2, "0")}:${minute.padStart(
            2,
            "0"
        )}`;
    };

    const convertTo12Hour = (
        time24: string
    ): { hour: string; minute: string; period: string } => {
        if (!time24) return { hour: "", minute: "", period: "" };

        const [hour24, minute] = time24.split(":");
        let hour12 = parseInt(hour24);
        let period = "AM";

        if (hour12 === 0) {
            hour12 = 12;
        } else if (hour12 === 12) {
            period = "PM";
        } else if (hour12 > 12) {
            hour12 -= 12;
            period = "PM";
        }

        return {
            hour: hour12.toString(),
            minute: minute || "00",
            period,
        };
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(route("admin.overtime.store"), formData, {
            onSuccess: () => {
                toast.success(
                    "Overtime request submitted successfully! HR will be notified via email."
                );
                onClose();
                setFormData({
                    overtime_date: "",
                    start_time: "",
                    end_time: "",
                    overtime_type: "",
                    reason: "",
                    hourly_rate: "",
                });
            },
            onError: (errors) => {
                const errorMessage =
                    (Object.values(errors)[0] as string) ||
                    "Failed to submit overtime request. Please try again.";
                toast.error(errorMessage);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleInputChange = (
        field: keyof OvertimeFormData,
        value: string
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleTimeChange = (
        timeField: "start_time" | "end_time",
        hour: string,
        minute: string,
        period: string
    ) => {
        const time24 = convertTo24Hour(hour, minute, period);
        handleInputChange(timeField, time24);
    };

    if (!isOpen) return null;

    const startTime12 = convertTo12Hour(formData.start_time);
    const endTime12 = convertTo12Hour(formData.end_time);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Submit Overtime Request"
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
                        form="overtime-form"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Request"}
                    </Button>
                </div>
            }
        >
            <div className="mb-4">
                <p className="text-sm text-gray-600">
                    Fill out the form below to submit your overtime request.
                </p>
            </div>

            <form
                id="overtime-form"
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Overtime Date */}
                    <div className="space-y-2">
                        <Input
                            id="overtime_date"
                            type="date"
                            label="Overtime Date"
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
                            className="w-full"
                        />
                    </div>

                    {/* Overtime Type */}
                    <div className="space-y-2">
                        <Label htmlFor="overtime_type" className="dark:text-gray-700">
                            Overtime Type <span className="text-danger">*</span>
                        </Label>
                        <Select
                            value={selectedOvertimeType}
                            onValueChange={handleOvertimeTypeChange}
                        >
                            <SelectTrigger>
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
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Start Time */}
                    <div className="space-y-2">
                        <Label htmlFor="start_time" className="dark:text-gray-700">
                            Start Time <span className="text-danger">*</span>
                        </Label>
                        <div className="flex gap-2">
                            <Select
                                value={startTime12.hour}
                                onValueChange={(hour) => {
                                    handleTimeChange(
                                        "start_time",
                                        hour,
                                        startTime12.minute || "00",
                                        startTime12.period || "AM"
                                    );
                                }}
                            >
                                <SelectTrigger className="w-16">
                                    <SelectValue placeholder="Hr" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => {
                                        const hour = i + 1;
                                        return (
                                            <SelectItem
                                                key={hour}
                                                value={hour.toString()}
                                            >
                                                {hour}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            <span className="flex items-center">:</span>
                            <Select
                                value={startTime12.minute}
                                onValueChange={(minute) => {
                                    handleTimeChange(
                                        "start_time",
                                        startTime12.hour || "1",
                                        minute,
                                        startTime12.period || "AM"
                                    );
                                }}
                            >
                                <SelectTrigger className="w-16">
                                    <SelectValue placeholder="Min" />
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
                                value={startTime12.period}
                                onValueChange={(period) => {
                                    handleTimeChange(
                                        "start_time",
                                        startTime12.hour || "1",
                                        startTime12.minute || "00",
                                        period
                                    );
                                }}
                            >
                                <SelectTrigger className="w-16">
                                    <SelectValue placeholder="AM" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AM">AM</SelectItem>
                                    <SelectItem value="PM">PM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* End Time */}
                    <div className="space-y-2">
                        <Label htmlFor="end_time" className="dark:text-gray-700">
                            End Time <span className="text-danger">*</span>
                        </Label>
                        <div className="flex gap-2">
                            <Select
                                value={endTime12.hour}
                                onValueChange={(hour) => {
                                    handleTimeChange(
                                        "end_time",
                                        hour,
                                        endTime12.minute || "00",
                                        endTime12.period || "AM"
                                    );
                                }}
                            >
                                <SelectTrigger className="w-16">
                                    <SelectValue placeholder="Hr" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => {
                                        const hour = i + 1;
                                        return (
                                            <SelectItem
                                                key={hour}
                                                value={hour.toString()}
                                            >
                                                {hour}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            <span className="flex items-center">:</span>
                            <Select
                                value={endTime12.minute}
                                onValueChange={(minute) => {
                                    handleTimeChange(
                                        "end_time",
                                        endTime12.hour || "1",
                                        minute,
                                        endTime12.period || "AM"
                                    );
                                }}
                            >
                                <SelectTrigger className="w-16">
                                    <SelectValue placeholder="Min" />
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
                                value={endTime12.period}
                                onValueChange={(period) => {
                                    handleTimeChange(
                                        "end_time",
                                        endTime12.hour || "1",
                                        endTime12.minute || "00",
                                        period
                                    );
                                }}
                            >
                                <SelectTrigger className="w-16">
                                    <SelectValue placeholder="AM" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AM">AM</SelectItem>
                                    <SelectItem value="PM">PM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Hourly Rate */}
                <div className="space-y-2">
                    <Input
                        label="Hourly Rate"
                        id="hourly_rate"
                        type="number"
                        step="0.01"
                        required
                        value={hourlyRate}
                        disabled={true}
                        className="bg-gray-100 cursor-not-allowed"
                        placeholder="Hourly rate will be set automatically"
                    />
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
                        rows={4}
                        className="w-full dark:text-gray-700 bg-inputBackground"
                    />
                </div>
            </form>
        </Modal>
    );
}
