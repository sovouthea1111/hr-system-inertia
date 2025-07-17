"use client";

import * as React from "react";
import { AppLayout } from "../../Layouts/AppLayout";

import { Button } from "@/Components/UI/Button";
import { PlusIcon } from "lucide-react";

interface GroupHeaderProps {
    title?: string;
    breadcrumbs?: {
        label: string;
        href?: string;
    }[];
    headerActions?: React.ReactNode;
    children?: React.ReactNode;
    buttonText?: string;
    buttonIcon?: React.ReactNode;
    onButtonClick?: () => void;
    showDefaultButton?: boolean;
    managementLabel?: string;
    managementHref?: string;
    currentPageLabel?: string;
}

export default function GroupHeader({
    title = "Management",
    breadcrumbs,
    headerActions,
    children,
    buttonText = "Custom Button",
    buttonIcon = <PlusIcon className="h-4 w-4 mr-2" />,
    onButtonClick,
    showDefaultButton = true,
    managementLabel = "Title",
    managementHref = "/employees",
    currentPageLabel = "List",
}: GroupHeaderProps) {
    const defaultBreadcrumbs = [
        { label: "Home" },
        { label: managementLabel, href: managementHref },
        { label: currentPageLabel },
    ];

    const finalBreadcrumbs = breadcrumbs || defaultBreadcrumbs;

    const defaultButton = (
        <Button variant="primary" onClick={onButtonClick}>
            {buttonIcon}
            {buttonText}
        </Button>
    );

    return (
        <AppLayout
            breadcrumbs={finalBreadcrumbs}
            title={title}
            headerActions={
                headerActions || (showDefaultButton ? defaultButton : undefined)
            }
        >
            <div className="space-y-6"> {children}</div>
        </AppLayout>
    );
}
