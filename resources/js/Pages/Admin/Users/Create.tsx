import React from "react";
import { useForm } from "@inertiajs/react";
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

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserCreated: (user: User) => void;
}

const roles = [
    { value: "HR", label: "HR" },
    { value: "Employee", label: "Employee" },
    { value: "SuperAdmin", label: "SuperAdmin" },
];

export function CreateUserModal({
    isOpen,
    onClose,
    onUserCreated,
}: CreateUserModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            name: "",
            email: "",
            password: "",
            password_confirmation: "",
            user_role: "Employee" as "HR" | "Employee" | "SuperAdmin",
        });

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route("admin.users.store"), {
            onSuccess: (page: any) => {
                const responseUser = page.props.user || page.props.data?.user;

                const user: User = responseUser || {
                    id: Date.now(),
                    name: data.name,
                    email: data.email,
                    user_role: data.user_role,
                };

                toast.success(
                    `User "${data.name}" has been created successfully!`,
                    {
                        duration: 4000,
                        position: "top-right",
                    }
                );

                onUserCreated(user);
                clearFormData();
                onClose();
            },

            onError: (errors) => {
                console.error("Validation errors:", errors);
                toast.error(
                    "Failed to create user. Please check the form and try again.",
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            title="Add New User"
            className="max-w-md"
        >
            <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-4 p-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            placeholder="Enter full name"
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            placeholder="Enter email address"
                            className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            placeholder="Enter password"
                            className={errors.password ? "border-red-500" : ""}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => handleInputChange("password_confirmation", e.target.value)}
                            placeholder="Confirm password"
                            className={errors.password_confirmation ? "border-red-500" : ""}
                        />
                        {errors.password_confirmation && (
                            <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="user_role">Role</Label>
                        <Select
                            value={data.user_role}
                            onValueChange={(value) => handleInputChange("user_role", value)}
                        >
                            <SelectTrigger className={errors.user_role ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role.value} value={role.value}>
                                        {role.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.user_role && (
                            <p className="text-sm text-red-500">{errors.user_role}</p>
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
                    <Button type="submit" disabled={processing}>
                        <Save className="mr-2 h-4 w-4" />
                        {processing ? "Creating..." : "Create User"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}