import { Modal } from "@/Components/UI/Modal";
import { Button } from "@/Components/UI/Button";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName?: string;
    isDeleting?: boolean;
    type: "single" | "bulk";
    count?: number;
    itemType?: string;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    isDeleting = false,
    type,
    count,
    itemType = "Employee",
}: DeleteConfirmationModalProps) {
    const getTitle = () => {
        if (type === "bulk") {
            return `Delete ${count} ${itemType}${count !== 1 ? "s" : ""}?`;
        }
        return `Delete ${itemName}?`;
    };

    const getMessage = () => {
        if (type === "bulk") {
            return (
                <>
                    <p className="text-gray-700 text-base leading-relaxed">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-gray-900">
                            {count} {itemType}
                            {count !== 1 ? "s" : ""}?
                        </span>
                    </p>
                    <p className="text-gray-600 text-sm">
                        This action cannot be undone.
                    </p>
                </>
            );
        }
        return (
            <>
                <p className="text-gray-700 text-base leading-relaxed">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-gray-900">
                        '{itemName}'
                    </span>
                    ?
                </p>
                <p className="text-gray-600 text-sm">
                    You cannot undo this action.
                </p>
            </>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={getTitle()}
            showCloseIcon={false}
            animationDuration={250}
            className="max-w-md"
            footer={
                <>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="transition-all duration-150 hover:scale-105 active:scale-95"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="transition-all duration-150 hover:scale-105 active:scale-95"
                    >
                        {isDeleting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </>
                        )}
                    </Button>
                </>
            }
        >
            <div className="text-center py-2">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div className="space-y-3">{getMessage()}</div>
            </div>
        </Modal>
    );
}

export default DeleteConfirmationModal;
