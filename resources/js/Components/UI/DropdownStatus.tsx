"use client";
import { Button } from "@/Components/UI/Button";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/UI/DropdownMenu";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface DropdownStatusProps {
    onStatusChange?: (status: string, label: string) => void;
    onBackendUpdate?: (
        status: string,
        employeeId?: string | number
    ) => Promise<boolean>;
    employeeId?: string | number;
    defaultStatus?: string;
    initialValue?: string;
    className?: string;
    disabled?: boolean;
}

const statusOptions = [
    {
        label: "Pending",
        value: "pending",
        color: "text-warning",
        bgColor: "hover:bg-warning",
    },
    {
        label: "Approved",
        value: "approved",
        color: "text-success",
        bgColor: "hover:bg-success",
    },
    {
        label: "Rejected",
        value: "rejected",
        color: "text-danger",
        bgColor: "hover:bg-danger",
    },
];

function getStatusLabel(
    value: string,
    defaultStatus: string = "Status"
): string {
    const option = statusOptions.find((opt) => opt.value === value);
    return option ? option.label : defaultStatus;
}

export function DropdownStatus({
    onStatusChange,
    onBackendUpdate,
    employeeId,
    defaultStatus = "Status",
    initialValue = "",
    className = "",
    disabled = false,
}: DropdownStatusProps) {
    const [selectedStatus, setSelectedStatus] = useState(
        initialValue
            ? getStatusLabel(initialValue, defaultStatus)
            : defaultStatus
    );
    const [selectedValue, setSelectedValue] = useState(initialValue);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (status: string, label: string) => {
        // If changing to approved or rejected, handle backend update
        if (
            (status === "approved" || status === "rejected") &&
            onBackendUpdate
        ) {
            setIsUpdating(true);

            try {
                const success = await onBackendUpdate(status, employeeId);

                if (success) {
                    // Show success message
                    toast.success(
                        `Employee status updated to ${label.toLowerCase()} successfully!`
                    );

                    // Update local state
                    setSelectedStatus(label);
                    setSelectedValue(status);
                    onStatusChange?.(status, label);
                } else {
                    // Show error message
                    toast.error(
                        "Failed to update employee status. Please try again."
                    );
                }
            } catch (error) {
                console.error("Error updating status:", error);
                toast.error("An error occurred while updating status.");
            } finally {
                setIsUpdating(false);
            }
        } else {
            // For pending status, update immediately
            setSelectedStatus(label);
            setSelectedValue(status);
            onStatusChange?.(status, label);
        }
    };

    // Get the color for the selected status
    const getSelectedStatusColor = () => {
        const selected = statusOptions.find(
            (option) => option.value === selectedValue
        );
        return selected ? selected.color : "text-gray-700";
    };

    // Check if status should be disabled (approved or rejected)
    const isStatusDisabled =
        selectedValue === "approved" ||
        selectedValue === "rejected" ||
        disabled;

    // If status is approved or rejected, show as disabled text with icon
    if (isStatusDisabled) {
        return (
            <div
                className={`w-fit px-3 py-2 border border-gray-200 rounded-md bg-gray-50 ${className}`}
            >
                <div className="flex items-center gap-2">
                    <span className={`${getSelectedStatusColor()} font-medium`}>
                        {selectedStatus}
                    </span>
                </div>
            </div>
        );
    }

    // Otherwise, show as dropdown
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    disabled={isUpdating}
                    className={`min-w-[120px] justify-between bg-white border-gray-300 hover:bg-gray-50 ${className}`}
                >
                    <span
                        className={
                            selectedValue
                                ? getSelectedStatusColor()
                                : "text-gray-700"
                        }
                    >
                        {isUpdating ? "Updating..." : selectedStatus}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
                {statusOptions.map((option) => {
                    return (
                        <DropdownMenuItem
                            key={option.value}
                            onClick={() =>
                                handleStatusChange(option.value, option.label)
                            }
                            className={`cursor-pointer ${option.bgColor} ${option.color} font-medium`}
                        >
                            <div className="flex items-center gap-2">
                                {option.label}
                            </div>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default DropdownStatus;
