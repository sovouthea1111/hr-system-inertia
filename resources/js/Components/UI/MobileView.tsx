import React, { useState } from "react";
import { cn } from "../../../../lib/utils";

interface MobileContainerProps {
    children: React.ReactNode;
    className?: string;
}

export const MobileContainer = React.forwardRef<
    HTMLDivElement,
    MobileContainerProps
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("block md:hidden space-y-4 p-4", className)}
        {...props}
    >
        {children}
    </div>
));
MobileContainer.displayName = "MobileContainer";

interface MobileCardProps {
    children: React.ReactNode;
    className?: string;
    maxVisibleFields?: number;
}

export const MobileCard = React.forwardRef<HTMLDivElement, MobileCardProps>(
    ({ className, children, maxVisibleFields = 3, ...props }, ref) => {
        const [isExpanded, setIsExpanded] = useState(false);

        const childrenArray = React.Children.toArray(children);
        const mobileFields = childrenArray.filter(
            (child) => React.isValidElement(child) && child.type === MobileField
        );
        const otherChildren = childrenArray.filter(
            (child) =>
                !React.isValidElement(child) || child.type !== MobileField
        );

        const shouldShowViewMore = mobileFields.length > maxVisibleFields;
        const visibleFields = isExpanded
            ? mobileFields
            : mobileFields.slice(0, maxVisibleFields);

        return (
            <div
                ref={ref}
                className={cn(
                    "block md:hidden rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-3",
                    className
                )}
                {...props}
            >
                {otherChildren}
                <div className="space-y-3">{visibleFields}</div>
                {shouldShowViewMore && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-primary hover:text-blue-800 text-sm font-medium transition-colors duration-200 mt-2 mx-auto block px-4 py-2 rounded"
                    >
                        {isExpanded ? "View Less" : "View More"}
                    </button>
                )}
            </div>
        );
    }
);
MobileCard.displayName = "MobileCard";

interface MobileFieldProps {
    label: string;
    children: React.ReactNode;
    className?: string;
}

export const MobileField = React.forwardRef<HTMLDivElement, MobileFieldProps>(
    ({ label, children, className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex flex-col space-y-1", className)}
            {...props}
        >
            <span className="text-sm font-medium text-muted-foreground">
                {label}
            </span>
            <div className="text-sm text-foreground">{children}</div>
        </div>
    )
);
MobileField.displayName = "MobileField";
