"use client";

import * as React from "react";
import {
    ChevronDown,
    ChevronUp,
    Trash2,
    Filter,
    CalendarIcon,
} from "lucide-react";
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
import { Calendar } from "@/Components/UI/Calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/UI/Popover";
import { cn } from "../../../../lib/utils";
import { format } from "date-fns";

interface SelectOption {
    value: string;
    label: string;
}

interface FilterField {
    id: string;
    label: string;
    placeholder: string;
    value: string;
    type?: "input" | "select" | "datetime";
    options?: SelectOption[];
    dateValue?: Date;
}

interface GroupFilterProps {
    title?: string;
    fields: FilterField[];
    onFieldChange: (fieldId: string, value: string, dateValue?: Date) => void;
    onClear: () => void;
    className?: string;
}

export function GroupFilter({
    title = "Filter",
    fields,
    onFieldChange,
    onClear,
    className,
}: GroupFilterProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [openPopovers, setOpenPopovers] = React.useState<
        Record<string, boolean>
    >({});

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const hasValues = fields.some(
        (field) => field.value.trim() !== "" || field.dateValue
    );

    const handleDateSelect = (fieldId: string, date: Date | undefined) => {
        const dateString = date ? format(date, "yyyy-MM-dd") : "";
        onFieldChange(fieldId, dateString, date);
    };

    const handleDateDone = (fieldId: string) => {
        setOpenPopovers((prev) => ({ ...prev, [fieldId]: false }));
    };

    const setPopoverOpen = (fieldId: string, open: boolean) => {
        setOpenPopovers((prev) => ({ ...prev, [fieldId]: open }));
    };

    return (
        <div
            className={cn(
                "border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200",
                className
            )}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 rounded-t-xl"
                onClick={toggleExpanded}
            >
                <div className="flex items-center gap-3">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <div>
                        <span className="font-semibold text-gray-900 text-lg">
                            {title}
                        </span>
                        {hasValues && (
                            <div className="flex items-center gap-1 mt-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-600 font-medium">
                                    Active filters
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                    {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                    ) : (
                        <ChevronDown className="h-5 w-5" />
                    )}
                </Button>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-gray-100 bg-gradient-to-br from-gray-50 to-blue-50/30">
                    <div className="p-6">
                        {/* Filter Fields Grid with Clear Button */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-end">
                            {fields.map((field) => (
                                <div key={field.id} className="space-y-2">
                                    <Label
                                        htmlFor={field.id}
                                        className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                                    >
                                        {field.label}
                                    </Label>

                                    {field.type === "select" ? (
                                        <Select
                                            value={field.value}
                                            onValueChange={(value) =>
                                                onFieldChange(field.id, value)
                                            }
                                        >
                                            <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all duration-200 bg-white shadow-sm hover:shadow-md">
                                                <SelectValue
                                                    placeholder={
                                                        field.placeholder
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {field.options?.map(
                                                    (option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    ) : field.type === "datetime" ? (
                                        <Popover
                                            open={
                                                openPopovers[field.id] || false
                                            }
                                            onOpenChange={(open) =>
                                                setPopoverOpen(field.id, open)
                                            }
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "h-11 w-full justify-start text-left font-normal border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all duration-200 bg-white shadow-sm hover:shadow-md",
                                                        !field.dateValue &&
                                                            "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.dateValue ? (
                                                        format(
                                                            field.dateValue,
                                                            "PPP"
                                                        )
                                                    ) : (
                                                        <span>
                                                            {field.placeholder}
                                                        </span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <div className="p-3">
                                                    <Calendar
                                                        mode="single"
                                                        selected={
                                                            field.dateValue
                                                        }
                                                        onSelect={(date) =>
                                                            handleDateSelect(
                                                                field.id,
                                                                date
                                                            )
                                                        }
                                                        initialFocus
                                                    />
                                                    <div className="flex justify-end mt-3 pt-3 border-t">
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDateDone(
                                                                    field.id
                                                                )
                                                            }
                                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                                        >
                                                            Done
                                                        </Button>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    ) : (
                                        <Input
                                            id={field.id}
                                            placeholder={field.placeholder}
                                            value={field.value}
                                            onChange={(e) =>
                                                onFieldChange(
                                                    field.id,
                                                    e.target.value
                                                )
                                            }
                                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Clear Button at the end of the row */}
                            {hasValues && (
                                <div className="flex items-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onClear}
                                        className="h-11 flex items-center gap-2 text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all duration-200 rounded-lg px-4"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Clear All
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
