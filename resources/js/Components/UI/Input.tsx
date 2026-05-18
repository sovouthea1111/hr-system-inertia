"use client";

import * as React from "react";
import { cn } from "../../../../lib/utils";
import { Label } from "@/Components/UI/Label";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/Components/UI/Button";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    showLabel?: boolean;
    error?: string;
    helperText?: string;
    required?: boolean;
    showPasswordToggle?: boolean;
    containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            type = "text",
            label,
            showLabel = true,
            error,
            helperText,
            required = false,
            showPasswordToggle = false,
            containerClassName,
            disabled,
            placeholder,
            ...props
        },
        ref,
    ) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const [inputType, setInputType] = React.useState(type);
        const inputId = React.useId();

        React.useEffect(() => {
            if (type === "password" && showPasswordToggle) {
                setInputType(showPassword ? "text" : "password");
            } else {
                setInputType(type);
            }
        }, [type, showPassword, showPasswordToggle]);

        const togglePasswordVisibility = () => {
            setShowPassword(!showPassword);
        };

        return (
            <div className={cn("space-y-2", containerClassName)}>
                {showLabel && label && (
                    <Label
                        htmlFor={inputId}
                        className={cn(
                            "text-sm font-medium text-foreground",
                            required &&
                                "after:content-['*'] after:text-danger after:ml-1",
                            disabled && "text-muted-foreground",
                        )}
                    >
                        {label}
                    </Label>
                )}
                <div className="relative">
                    <input
                        id={inputId}
                        type={inputType}
                        className={cn(
                            "flex h-10 w-full rounded-md border border-border-card bg-inputBackground px-3 py-2 text-base ring-offset-inputBackground file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                            error &&
                                "border-danger focus:border-danger focus:ring-danger",
                            disabled && "opacity-50 cursor-not-allowed",
                            showPasswordToggle &&
                                type === "password" &&
                                "pr-10",
                            className,
                        )}
                        ref={ref}
                        disabled={disabled}
                        placeholder={placeholder}
                        {...props}
                    />
                    {showPasswordToggle && type === "password" && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={togglePasswordVisibility}
                            disabled={disabled}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                        </Button>
                    )}
                </div>
                {helperText && !error && (
                    <p className="text-sm text-muted-foreground">{helperText}</p>
                )}
                {error && <p className="text-sm text-danger">{error}</p>}
            </div>
        );
    },
);

Input.displayName = "Input";

export default Input;
