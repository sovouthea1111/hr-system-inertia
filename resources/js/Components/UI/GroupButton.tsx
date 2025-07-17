import { Button } from "@/Components/UI/Button";
import { Edit, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { cn } from "../../../../lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/Components/UI/DropdownMenu";

interface GroupButtonProps {
    canEdit?: boolean;
    canDelete?: boolean;
    canView?: boolean;

    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;

    size?: "sm" | "default" | "lg";
    variant?: "default" | "outline" | "ghost";
    className?: string;

    isEditLoading?: boolean;
    isDeleteLoading?: boolean;

    editLabel?: string;
    deleteLabel?: string;
    viewLabel?: string;
    layout?: "horizontal" | "dropdown";
    itemId?: string | number;
    itemName?: string;
}

export function GroupButton({
    canEdit = false,
    canDelete = false,
    canView = false,
    onEdit,
    onDelete,
    onView,
    size = "sm",
    variant = "outline",
    className,
    isEditLoading = false,
    isDeleteLoading = false,
    editLabel = "Edit",
    deleteLabel = "Delete",
    viewLabel = "View",
    layout = "horizontal",
    itemId,
    itemName,
}: GroupButtonProps) {
    if (!canEdit && !canDelete && !canView) {
        return null;
    }

    const buttonCount = [canView, canEdit, canDelete].filter(Boolean).length;

    if (layout === "horizontal") {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                {canView && (
                    <Button
                        variant={variant}
                        size={size}
                        onClick={onView}
                        className="transition-all duration-150 hover:scale-105 active:scale-95"
                        title={`${viewLabel} ${itemName || "item"}`}
                    >
                        <Eye className="h-4 w-4 mr-1" />
                        {viewLabel}
                    </Button>
                )}

                {canEdit && (
                    <Button
                        variant={variant}
                        size={size}
                        onClick={onEdit}
                        disabled={isEditLoading}
                        className="transition-all duration-150 hover:scale-105 active:scale-95"
                        title={`${editLabel} ${itemName || "item"}`}
                    >
                        {isEditLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1"></div>
                        ) : (
                            <Edit className="h-4 w-4 mr-1" />
                        )}
                        {editLabel}
                    </Button>
                )}

                {canDelete && (
                    <Button
                        variant="danger"
                        size={size}
                        onClick={onDelete}
                        disabled={isDeleteLoading}
                        className="transition-all duration-150 hover:scale-105 active:scale-95"
                        title={`${deleteLabel} ${itemName || "item"}`}
                    >
                        {isDeleteLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                        ) : (
                            <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        {deleteLabel}
                    </Button>
                )}
            </div>
        );
    }

    // Dropdown layout for space-saving
    return (
        <div className={cn("relative", className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant={variant}
                        size={size}
                        className="transition-all duration-150 hover:scale-105 active:scale-95"
                        title={`Actions for ${itemName || "item"}`}
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    {canView && (
                        <DropdownMenuItem
                            onClick={onView}
                            className="cursor-pointer"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            {viewLabel}
                        </DropdownMenuItem>
                    )}

                    {canEdit && (
                        <DropdownMenuItem
                            onClick={onEdit}
                            disabled={isEditLoading}
                            className="cursor-pointer"
                        >
                            {isEditLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                            ) : (
                                <Edit className="h-4 w-4 mr-2" />
                            )}
                            {editLabel}
                        </DropdownMenuItem>
                    )}

                    {canDelete && (
                        <>
                            {(canView || canEdit) && <DropdownMenuSeparator />}
                            <DropdownMenuItem
                                onClick={onDelete}
                                disabled={isDeleteLoading}
                                className="cursor-pointer text-destructive focus:text-destructive"
                            >
                                {isDeleteLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                ) : (
                                    <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                {deleteLabel}
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default GroupButton;
