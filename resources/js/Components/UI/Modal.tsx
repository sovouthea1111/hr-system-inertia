import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../../../lib/utils";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    showCloseIcon?: boolean;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    headerClassName?: string;
    bodyClassName?: string;
    footerClassName?: string;
    overlayClassName?: string;
    animationDuration?: number;
}

export function Modal({
    isOpen,
    onClose,
    title,
    showCloseIcon = true,
    children,
    footer,
    className,
    headerClassName,
    bodyClassName,
    footerClassName,
    overlayClassName,
    animationDuration = 200,
}: ModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsAnimating(true);
        setIsVisible(false);
        setTimeout(() => {
            onClose();
            setIsAnimating(false);
        }, animationDuration);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            handleClose();
        }
    };

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            setTimeout(() => {
                setIsVisible(true);
            }, 10);
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        } else {
            setIsVisible(false);
            setIsAnimating(false);
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen && !isAnimating) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ease-out",
                isVisible
                    ? "bg-black/50 backdrop-blur-sm opacity-100"
                    : "bg-black/0 backdrop-blur-none opacity-0",
                overlayClassName
            )}
            onClick={handleOverlayClick}
            style={{
                transitionDuration: `${animationDuration}ms`,
            }}
        >
            <div
                className={cn(
                    "relative w-full max-w-md mx-4 bg-white rounded-lg shadow-lg max-h-[90vh] overflow-hidden",
                    "transition-all duration-200 ease-out transform",
                    isVisible
                        ? "scale-100 opacity-100 translate-y-0"
                        : "scale-95 opacity-0 translate-y-4",
                    className
                )}
                onClick={(e) => e.stopPropagation()}
                style={{
                    transitionDuration: `${animationDuration}ms`,
                }}
            >
                <div
                    className={cn(
                        "flex items-center px-6 py-4 border-b border-gray-200",
                        showCloseIcon ? "justify-between" : "justify-center",
                        headerClassName
                    )}
                >
                    <h2
                        className={cn(
                            "text-lg font-semibold text-gray-900",
                            !showCloseIcon && "text-center"
                        )}
                    >
                        {title}
                    </h2>
                    {showCloseIcon && (
                        <button
                            onClick={handleClose}
                            className="p-1 rounded-md hover:bg-gray-100 transition-colors duration-150 hover:scale-110 active:scale-95"
                            aria-label="Close modal"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    )}
                </div>
                <div
                    className={cn(
                        "px-6 py-4 overflow-y-auto max-h-[60vh]",
                        bodyClassName
                    )}
                >
                    {children}
                </div>
                {footer && (
                    <div
                        className={cn(
                            "flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50",
                            footerClassName
                        )}
                    >
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Modal;
