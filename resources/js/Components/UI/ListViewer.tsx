"use client";

import * as React from "react";
import { cn } from "../../../../lib/utils";
import { LucideIcon, AlertTriangle, ArrowRight, Plus } from "lucide-react";
import { Card, CardContent } from "@/Components/UI/Card";
import { Button } from "@/Components/UI/Button";

interface ListViewerProps extends React.HTMLAttributes<HTMLDivElement> {
    icon?: LucideIcon;
    title: string;
    count?: number;
    onCreateMore?: () => void;
    createMoreText?: string;
    onViewAll?: () => void;
    viewAllText?: string;
    showCreateMoreButton?: boolean;
}

const ListViewer = React.forwardRef<HTMLDivElement, ListViewerProps>(
    (
        {
            className,
            icon: Icon = AlertTriangle,
            title,
            count = 0,
            onCreateMore,
            createMoreText = "create more",
            onViewAll,
            viewAllText = "view all",
            showCreateMoreButton = true,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <Card
                ref={ref}
                className={cn(
                    "overflow-hidden rounded-lg p-3 sm:p-4",
                    className
                )}
                {...props}
            >
                {/* Title at the top */}
                <div className="mb-3 sm:mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-black">
                        {title}
                    </h2>
                </div>

                <CardContent className="p-0">
                    <div className="flex flex-col">
                        {/* Icon and Count row */}
                        <div className="flex items-center justify-between mb-4 sm:mb-5">
                            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md border border-gray-300">
                                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">
                                {count}
                            </div>
                        </div>

                        {/* Custom children content */}
                        {children}

                        {/* Action links at the bottom */}
                        <div className="flex items-center justify-between">
                            <Button
                                variant="link"
                                className="text-danger font-medium p-0 h-auto text-xs sm:text-sm"
                                onClick={onViewAll}
                            >
                                {viewAllText}{" "}
                                <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>

                            {onCreateMore && showCreateMoreButton && (
                                <Button
                                    variant="link"
                                    className="text-danger font-medium p-0 h-auto text-xs sm:text-sm flex items-center"
                                    onClick={onCreateMore}
                                >
                                    {createMoreText}{" "}
                                    <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }
);

ListViewer.displayName = "ListViewer";

export { ListViewer };
