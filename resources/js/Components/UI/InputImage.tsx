import React, { useState, useRef, forwardRef, useEffect } from "react";
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
    maxSize?: number;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    placeholder?: string;
    preview?: boolean;
    className?: string;
    dragDrop?: boolean;
    allowEdit?: boolean;
    existingImageUrl?: string;
}

interface Transform {
    rotate: number;
    scaleX: number;
    scaleY: number;
    brightness: number;
    contrast: number;
    saturation: number;
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
            allowEdit = false,
            existingImageUrl,
            ...props
        },
        ref
    ) => {
        const [imagePreview, setImagePreview] = useState<string | undefined>(
            undefined
        );
        const [isDragOver, setIsDragOver] = useState(false);
        const [showEditActions, setShowEditActions] = useState(false);

        const fileInputRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
            if (existingImageUrl && !value && !imagePreview) {
                setImagePreview(existingImageUrl);
            }
        }, [existingImageUrl, value, imagePreview]);

        const handleFileSelect = (file: File) => {
            if (file.size > maxSize * 1024 * 1024) {
                return;
            }

            if (!file.type.startsWith("image/")) {
                return;
            }

            onChange?.(file);

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
            setImagePreview(existingImageUrl || undefined);
            setShowEditActions(false);

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        };

        const handleClick = () => {
            if (!disabled && !imagePreview) {
                fileInputRef.current?.click();
            }
        };

        const handleReplace = () => {
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
                    <Label
                        htmlFor={id}
                        className="text-sm font-medium dark:text-gray-700"
                    >
                        {label}
                        {required && (
                            <span className="text-danger ml-1">*</span>
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
                                : imagePreview
                                ? "cursor-default"
                                : "cursor-pointer"
                        }
                    `}
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onMouseEnter={() =>
                        imagePreview && setShowEditActions(true)
                    }
                    onMouseLeave={() => setShowEditActions(false)}
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

                            {/* Replace Actions Overlay - Only shows Replace button now */}
                            {showEditActions && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleReplace();
                                            }}
                                            className="bg-white text-gray-800 hover:bg-gray-100"
                                        >
                                            <Upload className="w-4 h-4 mr-1" />
                                            Replace
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Remove Button */}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove();
                                }}
                                className="absolute top-2 right-2 bg-white shadow-md hover:bg-gray-50 z-10"
                            >
                                <X className="w-4 h-4" />
                            </Button>

                            {/* File Info */}
                            {(value || existingImageUrl) && (
                                <div className="mt-3 text-center">
                                    <p className="text-sm text-gray-600">
                                        {value ? value.name : "Current image"}
                                    </p>
                                    {value && (
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(value.size)}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && <p className="text-sm text-danger">{error}</p>}

                {/* Helper Text */}
                {!error && (
                    <p className="text-xs text-gray-500">
                        Supported formats: JPG, PNG, GIF, WebP. Maximum size:{" "}
                        {maxSize}MB
                        {imagePreview && " • Hover to replace"}
                    </p>
                )}
            </div>
        );
    }
);

InputImage.displayName = "InputImage";

export default InputImage;
