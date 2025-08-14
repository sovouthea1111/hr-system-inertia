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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/UI/Popover";
import { cn } from "../../../../lib/utils";
import { format } from "date-fns";

interface CalendarProps {
    mode?: "single";
    selected?: Date;
    onSelect?: (date: Date | undefined) => void;
    initialFocus?: boolean;
}

function Calendar({ selected, onSelect }: CalendarProps) {
    const [currentDate, setCurrentDate] = React.useState(
        selected || new Date()
    );
    const [viewDate, setViewDate] = React.useState(selected || new Date());

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(
            viewDate.getFullYear(),
            viewDate.getMonth(),
            day
        );
        setCurrentDate(newDate);
        onSelect?.(newDate);
    };

    const handleMonthChange = (monthIndex: number) => {
        const newDate = new Date(viewDate.getFullYear(), monthIndex, 1);
        setViewDate(newDate);
    };

    const handleYearChange = (year: number) => {
        const newDate = new Date(year, viewDate.getMonth(), 1);
        setViewDate(newDate);
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(viewDate);
        const firstDay = getFirstDayOfMonth(viewDate);
        const days = [];

        const prevMonth = new Date(
            viewDate.getFullYear(),
            viewDate.getMonth() - 1,
            0
        );
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = prevMonth.getDate() - i;
            days.push(
                <button
                    key={`prev-${day}`}
                    className="h-8 w-8 text-sm text-gray-400 hover:bg-gray-100 rounded"
                    onClick={() => {
                        const newDate = new Date(
                            prevMonth.getFullYear(),
                            prevMonth.getMonth(),
                            day
                        );
                        setViewDate(newDate);
                        setCurrentDate(newDate);
                        onSelect?.(newDate);
                    }}
                >
                    {day}
                </button>
            );
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const isSelected =
                selected &&
                selected.getDate() === day &&
                selected.getMonth() === viewDate.getMonth() &&
                selected.getFullYear() === viewDate.getFullYear();

            days.push(
                <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`h-8 w-8 text-sm rounded hover:bg-gray-100 ${
                        isSelected
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "text-gray-700"
                    }`}
                >
                    {day}
                </button>
            );
        }

        const totalCells = 42;
        const remainingCells = totalCells - days.length;
        for (let day = 1; day <= remainingCells; day++) {
            days.push(
                <button
                    key={`next-${day}`}
                    className="h-8 w-8 text-sm text-gray-400 hover:bg-gray-100 rounded"
                    onClick={() => {
                        const nextMonth = new Date(
                            viewDate.getFullYear(),
                            viewDate.getMonth() + 1,
                            day
                        );
                        setViewDate(nextMonth);
                        setCurrentDate(nextMonth);
                        onSelect?.(nextMonth);
                    }}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    const years = Array.from(
        { length: 20 },
        (_, i) => new Date().getFullYear() - 10 + i
    );

    return (
        <div className="p-3">
            {/* Month and Year selectors */}
            <div className="flex gap-2 mb-4">
                <select
                    value={viewDate.getMonth()}
                    onChange={(e) =>
                        handleMonthChange(parseInt(e.target.value))
                    }
                    className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                >
                    {months.map((month, index) => (
                        <option key={month} value={index}>
                            {month}
                        </option>
                    ))}
                </select>

                <select
                    value={viewDate.getFullYear()}
                    onChange={(e) => handleYearChange(parseInt(e.target.value))}
                    className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                >
                    {years.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>

            {/* Calendar header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div
                        key={day}
                        className="h-8 flex items-center justify-center"
                    >
                        <span className="text-xs font-medium text-gray-500">
                            {day}
                        </span>
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
        </div>
    );
}

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
        onFieldChange(fieldId, dateString, date); // Passing 3 parameters
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
                "border border-border rounded-xl bg-card shadow-sm hover:shadow-md transition-all duration-200",
                className
            )}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-all duration-200 rounded-t-xl"
                onClick={toggleExpanded}
            >
                <div className="flex items-center gap-3">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <span className="font-semibold text-foreground text-lg">
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
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-all duration-200"
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
                <div className="border-t border-border bg-muted/30">
                    <div className="p-6">
                        {/* Filter Fields Grid with Clear Button */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-end">
                            {fields.map((field) => (
                                <div key={field.id} className="space-y-2">
                                    <Label
                                        htmlFor={field.id}
                                        className="text-sm font-semibold text-foreground flex items-center gap-2"
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
                                            <SelectTrigger className="h-11 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-200 bg-background shadow-sm hover:shadow-md">
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
                                                        "h-11 w-full justify-start text-left font-normal border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-200 bg-background shadow-sm hover:shadow-md",
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
                                                <Calendar
                                                    mode="single"
                                                    selected={field.dateValue}
                                                    onSelect={(date) =>
                                                        handleDateSelect(
                                                            field.id,
                                                            date
                                                        )
                                                    }
                                                    initialFocus
                                                />
                                                <div className="flex justify-end mt-3 pt-3 border-t border-border px-3 pb-3">
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDateDone(
                                                                field.id
                                                            )
                                                        }
                                                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                                    >
                                                        Done
                                                    </Button>
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
                                            className="h-11 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-200 bg-background shadow-sm hover:shadow-md"
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
                                        className="h-11 flex items-center gap-2 text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/10 transition-all duration-200 rounded-lg px-4"
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
