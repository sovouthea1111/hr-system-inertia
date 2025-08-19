import * as React from "react";

import { cn } from "../../../../lib/utils";

const Table = React.forwardRef<
    HTMLTableElement,
    React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
    <div className="w-full">
        {/* Desktop Table View */}
        <div className="hidden md:block relative w-full overflow-auto">
            <table
                ref={ref}
                className={cn("w-full caption-bottom text-sm", className)}
                {...props}
            />
        </div>
    </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead
        ref={ref}
        className={cn(
            "[&_tr]:border-b hidden md:table-header-group",
            className
        )}
        {...props}
    />
));
TableHeader.displayName = "TableHeader";

// Table Body
const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody
        ref={ref}
        className={cn(
            "[&_tr:last-child]:border-0 hidden md:table-row-group",
            className
        )}
        {...props}
    />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tfoot
        ref={ref}
        className={cn(
            "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0 hidden md:table-footer-group",
            className
        )}
        {...props}
    />
));
TableFooter.displayName = "TableFooter";

// Table Row - transforms to card on mobile
const TableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
    <tr
        ref={ref}
        className={cn(
            "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted hidden md:table-row",
            className
        )}
        {...props}
    />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <th
        ref={ref}
        className={cn(
            "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 hidden md:table-cell",
            className
        )}
        {...props}
    />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <td
        ref={ref}
        className={cn(
            "p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell",
            className
        )}
        {...props}
    />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
    <caption
        ref={ref}
        className={cn("mt-4 text-sm text-muted-foreground", className)}
        {...props}
    />
));
TableCaption.displayName = "TableCaption";

// Mobile Card Component
interface MobileCardProps {
    children: React.ReactNode;
    className?: string;
}

const MobileCard = React.forwardRef<HTMLDivElement, MobileCardProps>(
    ({ children, className }, ref) => (
        <div
            ref={ref}
            className={cn(
                "md:hidden bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm",
                className
            )}
        >
            {children}
        </div>
    )
);
MobileCard.displayName = "MobileCard";

// Mobile Field Component for card layout
interface MobileFieldProps {
    label: string;
    children: React.ReactNode;
    className?: string;
}

const MobileField = React.forwardRef<HTMLDivElement, MobileFieldProps>(
    ({ label, children, className }, ref) => (
        <div
            ref={ref}
            className={cn(
                "flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0",
                className
            )}
        >
            <span className="text-sm font-medium text-gray-600">{label}</span>
            <div className="text-sm text-gray-900">{children}</div>
        </div>
    )
);
MobileField.displayName = "MobileField";

// Mobile Container for cards
interface MobileContainerProps {
    children: React.ReactNode;
    className?: string;
}

const MobileContainer = React.forwardRef<HTMLDivElement, MobileContainerProps>(
    ({ children, className }, ref) => (
        <div ref={ref} className={cn("md:hidden space-y-3", className)}>
            {children}
        </div>
    )
);
MobileContainer.displayName = "MobileContainer";

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
    MobileCard,
    MobileField,
    MobileContainer,
};
