import React from "react";
import { useForm } from "@inertiajs/react";
import { Modal } from "@/Components/UI/Modal";
import { Button } from "@/Components/UI/Button";
import { Input } from "@/Components/UI/Input";
import { Label } from "@/Components/UI/Label";
import InputImage from "@/Components/UI/InputImage";
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
    image: File | null;
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
            image: null,
            name: "",
            email: "",
            password: "",
            password_confirmation: "",
            user_role: "Employee",
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
    const handleImageChange = (file: File | null) => {
        setData("image" as any, file);
    };

    const handleImageRemove = () => {
        setData("image", null);
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
                            id="password"
                            type="password"
                            label="Password"
                            required
                            value={data.password}
                            onChange={(e) =>
                                handleInputChange("password", e.target.value)
                            }
                            placeholder="Enter password"
                            className={errors.password ? "border-danger" : ""}
                        />
                        {errors.password && (
                            <p className="text-sm text-danger">
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
                            placeholder="Confirm password"
                            className={
                                errors.password_confirmation
                                    ? "border-danger"
                                    : ""
                            }
                        />
                        {errors.password_confirmation && (
                            <p className="text-sm text-danger">
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
                    </div>

                    <InputImage
                        id="medical_certificate"
                        label="Medical Certificate"
                        value={data.image}
                        onChange={handleImageChange}
                        onRemove={handleImageRemove}
                        required={false}
                        accept="image/*"
                        maxSize={2}
                        placeholder="Upload medical certificate"
                        error={errors.image}
                        dragDrop={true}
                        preview={true}
                    />
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
                        type="submit"
                        variant="primary"
                        disabled={processing}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {processing ? "Creating..." : "Create User"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
