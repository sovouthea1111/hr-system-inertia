import React, { useEffect } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { Modal } from "@/Components/UI/Modal";
import { Button } from "@/Components/UI/Button";
import { Input } from "@/Components/UI/Input";
import { Label } from "@/Components/UI/Label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/UI/Select";
import { X, Save } from "lucide-react";
import toast from "react-hot-toast";

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    user_role: "HR" | "Employee" | "SuperAdmin";
    created_at?: string;
    updated_at?: string;
}

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUserUpdated: () => void;
}

const roles = [
    { value: "HR", label: "HR" },
    { value: "Employee", label: "Employee" },
    { value: "SuperAdmin", label: "SuperAdmin" },
];

export function EditUserModal({
    isOpen,
    onClose,
    user,
    onUserUpdated,
}: EditUserModalProps) {
    const { auth } = usePage().props;
    const isEmployee = auth.user.user_role === "Employee";

    const { data, setData, put, processing, errors, reset, clearErrors } =
        useForm({
            name: "",
            email: "",
            currentPassword: "",
            password: "",
            password_confirmation: "",
            user_role: "Employee" as "HR" | "Employee" | "SuperAdmin",
        });

    // Populate form with user data when modal opens
    useEffect(() => {
        if (user && isOpen) {
            setData({
                name: user.name || "",
                email: user.email || "",
                currentPassword: "",
                password: "",
                password_confirmation: "",
                user_role: user.user_role || "Employee",
            });
        }
    }, [user, isOpen]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        put(route("admin.users.update", user.id), {
            onSuccess: () => {
                toast.success(
                    `User "${data.name}" has been updated successfully!`,
                    {
                        duration: 4000,
                        position: "top-right",
                    }
                );

                onUserUpdated();
                clearFormData();
                onClose();
            },

            onError: (errors) => {
                toast.error(
                    "Failed to update user. Please check the form and try again.",
                    {
                        duration: 4000,
                        position: "top-right",
                    }
                );
            },
        });
    };

    const clearFormData = () => {
        reset();
        clearErrors();
    };

    const handleCancel = () => {
        onClose();
        clearErrors();
    };

    const handleInputChange = (field: string, value: string) => {
        setData(field as any, value);
        if (errors[field as keyof typeof errors]) {
            clearErrors(field as keyof typeof errors);
        }
    };

    if (!user) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            title="Edit User"
            className="max-w-md"
        >
            <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-4 p-6">
                    <div className="space-y-2">
                        <Input
                            id="name"
                            type="text"
                            label="Full Name"
                            value={data.name}
                            onChange={(e) =>
                                handleInputChange("name", e.target.value)
                            }
                            placeholder="Enter full name"
                            className={errors.name ? "border-danger" : ""}
                        />
                        {errors.name && (
                            <p className="text-sm text-danger">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Input
                            id="email"
                            type="email"
                            label="Email"
                            required
                            value={data.email}
                            onChange={(e) =>
                                handleInputChange("email", e.target.value)
                            }
                            placeholder="Enter email address"
                            className={errors.email ? "border-danger" : ""}
                        />
                        {errors.email && (
                            <p className="text-sm text-danger">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Input
                            id="currentPassword"
                            type="password"
                            label="Current Password"
                            required
                            value={data.currentPassword}
                            onChange={(e) =>
                                handleInputChange(
                                    "currentPassword",
                                    e.target.value
                                )
                            }
                            placeholder="Enter current password"
                            className={
                                errors.currentPassword ? "border-red-500" : ""
                            }
                        />
                        {errors.currentPassword && (
                            <p className="text-sm text-red-500">
                                {errors.currentPassword}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Input
                            id="newPassword"
                            type="password"
                            label="New Password"
                            required
                            value={data.password}
                            onChange={(e) =>
                                handleInputChange("password", e.target.value)
                            }
                            placeholder="Enter new password"
                            className={errors.password ? "border-red-500" : ""}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-500">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Input
                            id="password_confirmation"
                            type="password"
                            label="Confirm Password"
                            required
                            value={data.password_confirmation}
                            onChange={(e) =>
                                handleInputChange(
                                    "password_confirmation",
                                    e.target.value
                                )
                            }
                            placeholder="Confirm new password"
                            className={
                                errors.password_confirmation
                                    ? "border-red-500"
                                    : ""
                            }
                        />
                        {errors.password_confirmation && (
                            <p className="text-sm text-red-500">
                                {errors.password_confirmation}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="user_role"
                            className="dark:text-gray-700"
                        >
                            Role <span className="text-danger">*</span>
                        </Label>
                        <Select
                            value={data.user_role}
                            onValueChange={(value) =>
                                handleInputChange("user_role", value)
                            }
                            disabled={isEmployee}
                        >
                            <SelectTrigger
                                className={
                                    errors.user_role ? "border-danger" : ""
                                }
                            >
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem
                                        key={role.value}
                                        value={role.value}
                                    >
                                        {role.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.user_role && (
                            <p className="text-sm text-danger">
                                {errors.user_role}
                            </p>
                        )}
                        {isEmployee && (
                            <p className="text-sm text-danger">
                                Role cannot be changed by employees
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={processing}
                    >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={processing}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {processing ? "Updating..." : "Update User"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
