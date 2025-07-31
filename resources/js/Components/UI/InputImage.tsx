import React, { useState, useRef, forwardRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/Components/UI/Button";
import { Label } from "@/Components/UI/Label";

interface InputImageProps {
    id?: string;
    label?: string;
    value?: File | null;
    onChange?: (file: File | null) => void;
    onRemove?: () => void;
    accept?: string;
    maxSize?: number; // in MB
    required?: boolean;
    disabled?: boolean;
    error?: string;
    placeholder?: string;
    preview?: boolean;
    className?: string;
    dragDrop?: boolean;
}

export const InputImage = forwardRef<HTMLInputElement, InputImageProps>(
    (
        {
            id,
            label,
            value,
            onChange,
            onRemove,
            accept = "image/*",
            maxSize = 2,
            required = false,
            disabled = false,
            error,
            placeholder = "Click to upload or drag and drop",
            preview = true,
            className = "",
            dragDrop = true,
            ...props
        },
        ref
    ) => {
        const [imagePreview, setImagePreview] = useState<string | null>(null);
        const [isDragOver, setIsDragOver] = useState(false);
        const fileInputRef = useRef<HTMLInputElement>(null);

        const handleFileSelect = (file: File) => {
            // Validate file size
            if (file.size > maxSize * 1024 * 1024) {
                return;
            }

            // Validate file type
            if (!file.type.startsWith("image/")) {
                return;
            }

            onChange?.(file);

            // Create preview if enabled
            if (preview) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImagePreview(e.target?.result as string);
                };
                reader.readAsDataURL(file);
            }
        };

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                handleFileSelect(file);
            }
        };

        const handleRemove = () => {
            onChange?.(null);
            onRemove?.();
            setImagePreview(null);

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        };

        const handleClick = () => {
            if (!disabled) {
                fileInputRef.current?.click();
            }
        };

        const handleDragOver = (e: React.DragEvent) => {
            if (!dragDrop || disabled) return;
            e.preventDefault();
            setIsDragOver(true);
        };

        const handleDragLeave = (e: React.DragEvent) => {
            if (!dragDrop || disabled) return;
            e.preventDefault();
            setIsDragOver(false);
        };

        const handleDrop = (e: React.DragEvent) => {
            if (!dragDrop || disabled) return;
            e.preventDefault();
            setIsDragOver(false);

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        };

        const formatFileSize = (bytes: number) => {
            if (bytes === 0) return "0 Bytes";
            const k = 1024;
            const sizes = ["Bytes", "KB", "MB", "GB"];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return (
                parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
            );
        };

        return (
            <div className={`space-y-2 ${className}`}>
                {/* Label */}
                {label && (
                    <Label htmlFor={id} className="text-sm font-medium dark:text-gray-700">
                        {label}
                        {required && (
                            <span className="text-red-500 ml-1">*</span>
                        )}
                    </Label>
                )}

                {/* Upload Area */}
                <div
                    className={`
                    relative border-2 border-dashed rounded-lg transition-colors
                    ${
                        isDragOver
                            ? "border-blue-400 bg-blue-50"
                            : error
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                    }
                    ${
                        disabled
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                    }
                `}
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {/* Hidden File Input */}
                    <input
                        ref={ref || fileInputRef}
                        id={id}
                        type="file"
                        accept={accept}
                        onChange={handleInputChange}
                        disabled={disabled}
                        className="hidden"
                        {...props}
                    />

                    {/* Upload Content */}
                    {!imagePreview ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full mb-3">
                                <Upload className="w-6 h-6 text-gray-500" />
                            </div>
                            <p className="text-sm font-medium text-gray-700 mb-1">
                                {placeholder}
                            </p>
                            <p className="text-xs text-gray-500">
                                {accept.replace("image/", "").toUpperCase()} up
                                to {maxSize}MB
                            </p>
                        </div>
                    ) : (
                        <div className="relative p-4">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-w-full max-h-48 mx-auto rounded-lg object-cover"
                            />

                            {/* Remove Button */}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove();
                                }}
                                className="absolute top-2 right-2 bg-white shadow-md hover:bg-gray-50"
                            >
                                <X className="w-4 h-4" />
                            </Button>

                            {/* File Info */}
                            {value && (
                                <div className="mt-3 text-center">
                                    <p className="text-sm text-gray-600">
                                        {value.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(value.size)}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && <p className="text-sm text-red-600">{error}</p>}

                {/* Helper Text */}
                {!error && (
                    <p className="text-xs text-gray-500">
                        Supported formats: JPG, PNG, GIF, WebP. Maximum size:{" "}
                        {maxSize}MB
                    </p>
                )}
            </div>
        );
    }
);

InputImage.displayName = "InputImage";

export default InputImage;
