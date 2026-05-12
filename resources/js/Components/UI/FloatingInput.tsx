"use client";

import * as React from "react";
import { cn } from "../../../../lib/utils";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: React.ReactNode;
    error?: string;
    isFocused?: boolean;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
    ({ className, label, icon, error, type, isFocused: autoFocus, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);
        const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue);
        const inputId = React.useId();
        const localRef = React.useRef<HTMLInputElement>(null);

        React.useImperativeHandle(ref, () => localRef.current as HTMLInputElement);

        React.useEffect(() => {
            if (autoFocus && localRef.current) {
                localRef.current.focus();
            }
        }, [autoFocus]);

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            setHasValue(!!e.target.value);
            if (props.onBlur) props.onBlur(e);
        };

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            if (props.onFocus) props.onFocus(e);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setHasValue(!!e.target.value);
            if (props.onChange) props.onChange(e);
        };

        React.useEffect(() => {
            setHasValue(!!props.value);
        }, [props.value]);

        const isFloating = isFocused || hasValue;

        return (
            <div className="relative w-full group">
                <div
                    className={cn(
                        "relative flex items-center w-full transition-all duration-300 border-2 rounded-2xl bg-white shadow-sm",
                        isFocused 
                            ? "border-cyan-500" 
                            : error 
                                ? "border-red-500" 
                                : "border-gray-200 hover:border-gray-300",
                        className
                    )}
                >
                    {icon && (
                        <div className="flex items-center h-full">
                            <div className={cn(
                                "px-4 flex items-center justify-center transition-colors duration-200",
                                isFocused ? "text-cyan-500" : (error ? "text-red-500" : "text-gray-400")
                            )}>
                                {icon}
                            </div>
                            <div className={cn(
                                "w-[1px] h-6 transition-colors duration-200",
                                isFocused ? "bg-cyan-500" : (error ? "bg-red-500" : "bg-gray-200")
                            )} />
                        </div>
                    )}
                    
                    <input
                        id={inputId}
                        type={type}
                        className={cn(
                            "w-full px-4 py-4 bg-transparent outline-none border-none focus:ring-0 text-gray-700 font-medium text-base placeholder-transparent",
                            icon && "pl-4"
                        )}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        ref={localRef}
                        {...props}
                    />

                    <label
                        htmlFor={inputId}
                        className={cn(
                            "absolute transition-all duration-200 pointer-events-none bg-white px-2 z-10",
                            isFloating 
                                ? (icon ? "left-14 -top-3 text-sm font-bold" : "left-4 -top-3 text-sm font-bold")
                                : (icon ? "left-14 top-1/2 -translate-y-1/2 text-base font-medium" : "left-4 top-1/2 -translate-y-1/2 text-base font-medium"),
                            
                            isFocused 
                                ? "text-cyan-500" 
                                : error 
                                    ? "text-red-500" 
                                    : "text-gray-400"
                        )}
                    >
                        {label}
                    </label>
                </div>
                {error && (
                    <p className="mt-1.5 ml-1 text-sm font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
