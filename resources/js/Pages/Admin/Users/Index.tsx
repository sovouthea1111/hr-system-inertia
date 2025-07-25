"use client";
import { useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { GroupFilter } from "@/Components/UI/GroupFilter";
import { Button } from "@/Components/UI/Button";
import { Badge } from "@/Components/UI/Badge";
import GroupHeader from "@/Components/UI/GroupHeader";
import { Card, CardContent } from "@/Components/UI/Card";
import { Checkbox } from "@/Components/UI/CheckBox";
import { GroupButton } from "@/Components/UI/GroupButton";
import { DeleteConfirmationModal } from "@/Components/UI/PopupDelete";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/UI/Table";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/Components/UI/Pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/UI/Select";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { PageProps as InertiaPageProps } from "@/types";
import toast from "react-hot-toast";
import { CreateUserModal } from "@/Pages/Admin/Users/Create";
import { EditUserModal } from "@/Pages/Admin/Users/Edit";

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    user_role: "HR" | "Employee" | "SuperAdmin";
    created_at?: string;
    updated_at?: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

interface PageProps
    extends InertiaPageProps<{
        users: PaginatedData;
        filters: {
            name?: string;
            email?: string;
            role?: string;
        };
        roles: string[];
        canManage: boolean;
    }> {}

export default function UsersPage() {
    const { users, filters, roles, canManage, auth } =
        usePage<PageProps>().props;

    // Modal states
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Delete confirmation states
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter states - initialize from server filters
    const [nameFilter, setNameFilter] = useState(filters.name || "");
    const [emailFilter, setEmailFilter] = useState(filters.email || "");
    const [roleFilter, setRoleFilter] = useState(filters.role || "");

    // Selection states
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    // Selection handlers
    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            setSelectedUsers(users.data.map((user) => user.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectUser = (userId: number, checked: boolean) => {
        if (checked) {
            setSelectedUsers((prev) => [...prev, userId]);
        } else {
            setSelectedUsers((prev) => prev.filter((id) => id !== userId));
            setSelectAll(false);
        }
    };

    // Update selectAll state when selectedUsers changes
    useEffect(() => {
        if (
            selectedUsers.length === users.data.length &&
            users.data.length > 0
        ) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [selectedUsers, users.data]);

    // Filter functions
    const applyFilters = () => {
        const filterData: any = {};
        if (nameFilter) filterData.name = nameFilter;
        if (emailFilter) filterData.email = emailFilter;
        if (roleFilter) filterData.role = roleFilter;

        router.get(route("admin.users.index"), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Debounced filter application
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            applyFilters();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [nameFilter, emailFilter, roleFilter]);

    const handleClearFilters = () => {
        setNameFilter("");
        setEmailFilter("");
        setRoleFilter("");

        router.get(
            route("admin.users.index"),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const getFilterFields = () => {
        return [
            {
                id: "name",
                label: "User Name",
                placeholder: "Search by name...",
                value: nameFilter,
                type: "input" as const,
            },
            {
                id: "email",
                label: "Email",
                placeholder: "Search by email...",
                value: emailFilter,
                type: "input" as const,
            },
            {
                id: "role",
                label: "Role",
                placeholder: "Select role",
                value: roleFilter,
                type: "select" as const,
                options: roles?.map((role) => ({
                    value: role,
                    label: role,
                })) || [
                    { value: "HR", label: "HR" },
                    { value: "Employee", label: "Employee" },
                    { value: "SuperAdmin", label: "SuperAdmin" },
                ],
            },
        ];
    };

    const handleFilterChange = (fieldId: string, value: string) => {
        switch (fieldId) {
            case "name":
                setNameFilter(value);
                break;
            case "email":
                setEmailFilter(value);
                break;
            case "role":
                setRoleFilter(value);
                break;
        }
    };

    // User management handlers
    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsEditDialogOpen(true);
    };

    const handleUserUpdated = () => {
        router.reload({ only: ["users"] });
        setIsEditDialogOpen(false);
        setSelectedUser(null);
    };

    const handleDelete = (user: User) => {
        setUserToDelete(user);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        router.delete(route("admin.users.destroy", userToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    `User "${userToDelete.name}" has been deleted successfully!`,
                    {
                        duration: 4000,
                        position: "top-right",
                    }
                );

                setSelectedUsers((prev) =>
                    prev.filter((id) => id !== userToDelete.id)
                );
                setIsDeleteDialogOpen(false);
                setUserToDelete(null);
                setIsDeleting(false);
            },
            onError: () => {
                toast.error("Failed to delete user. Please try again.", {
                    duration: 4000,
                    position: "top-right",
                });
                setIsDeleting(false);
            },
        });
    };

    const handleBulkDelete = () => {
        setIsBulkDeleteDialogOpen(true);
    };

    const confirmBulkDelete = () => {
        setIsDeleting(true);
        router.delete(route("admin.users.bulk-delete"), {
            data: { user_ids: selectedUsers },
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    `${selectedUsers.length} user${
                        selectedUsers.length > 1 ? "s" : ""
                    } deleted successfully!`,
                    {
                        duration: 4000,
                        position: "top-right",
                    }
                );

                setSelectedUsers([]);
                setSelectAll(false);
                setIsBulkDeleteDialogOpen(false);
                setIsDeleting(false);
            },
            onError: (errors) => {
                const errorMessage =
                    errors.error ||
                    errors.message ||
                    "Failed to delete users. Please try again.";
                toast.error(errorMessage, {
                    duration: 6000,
                    position: "top-right",
                });
                setIsDeleting(false);
            },
        });
    };

    const handleUserCreated = () => {
        router.reload({ only: ["users"] });
    };

    // Pagination handlers
    const handlePageChange = (url: string) => {
        if (url) {
            router.get(
                url,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                }
            );
        }
    };

    const handlePerPageChange = (perPage: string) => {
        const filterData: any = {
            per_page: perPage,
            page: 1, // Reset to first page when changing per-page
        };

        // Include current filters
        if (nameFilter) filterData.name = nameFilter;
        if (emailFilter) filterData.email = emailFilter;
        if (roleFilter) filterData.role = roleFilter;

        router.get(route("admin.users.index"), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="User Management" />
            <div className="space-y-6">
                <GroupHeader
                    title={
                        auth.user.user_role === "Employee"
                            ? "My Account"
                            : "User Management"
                    }
                    managementLabel="User Management"
                    managementHref="/admin/users"
                    headerActions={
                        <div className="flex items-center gap-3">
                            {Boolean(canManage) && selectedUsers.length > 0 && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleBulkDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Selected (
                                            {selectedUsers.length})
                                        </>
                                    )}
                                </Button>
                            )}
                            {Boolean(canManage) && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setIsAddDialogOpen(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add User
                                </Button>
                            )}
                        </div>
                    }
                >
                    {/* Only show filters for HR and SuperAdmin */}
                    {canManage && (
                        <GroupFilter
                            title="Filter Users"
                            fields={getFilterFields()}
                            onFieldChange={handleFilterChange}
                            onClear={handleClearFilters}
                        />
                    )}

                    {/* Table Section */}
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {canManage && (
                                            <TableHead className="w-12">
                                                <Checkbox
                                                    checked={selectAll}
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleSelectAll(
                                                            checked === true
                                                        )
                                                    }
                                                    aria-label="Select all users"
                                                />
                                            </TableHead>
                                        )}
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Updated Date</TableHead>
                                        <TableHead className="text-center">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={canManage ? 6 : 5}
                                                className="text-center py-8 text-gray-500"
                                            >
                                                No users found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.data.map((user) => (
                                            <TableRow key={user.id}>
                                                {canManage && (
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedUsers.includes(
                                                                user.id
                                                            )}
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                handleSelectUser(
                                                                    user.id,
                                                                    checked as boolean
                                                                )
                                                            }
                                                        />
                                                    </TableCell>
                                                )}
                                                <TableCell className="font-medium">
                                                    {user.name}
                                                </TableCell>
                                                <TableCell>
                                                    {user.email}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            user.user_role ===
                                                            "SuperAdmin"
                                                                ? "destructive"
                                                                : user.user_role ===
                                                                  "HR"
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                    >
                                                        {user.user_role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {user.updated_at
                                                        ? new Date(
                                                              user.updated_at
                                                          ).toLocaleDateString()
                                                        : "N/A"}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <GroupButton
                                                        canEdit={true}
                                                        canDelete={Boolean(
                                                            canManage
                                                        )}
                                                        onEdit={() =>
                                                            handleEdit(user)
                                                        }
                                                        onDelete={() =>
                                                            handleDelete(user)
                                                        }
                                                        layout="dropdown"
                                                        itemName={user.name}
                                                        size="sm"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Pagination - Always show if there are users */}
                    {users.data.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-3 bg-card border-t border-border">
                            <div className="text-sm text-muted-foreground">
                                Showing {users.from || 0} to {users.to || 0} of {users.total} results
                            </div>
                            {/* Left side - Results info */}
                            <div className="text-sm text-gray-700">
                                Showing {users.from || 0} to {users.to || 0} of{" "}
                                {users.total} results
                            </div>

                            {/* Center - Pagination controls (only show if more than one page) */}
                            <div className="flex-1 flex justify-center">
                                {users.last_page > 1 && (
                                    <Pagination>
                                        <PaginationContent>
                                            {/* Previous Button */}
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() =>
                                                        handlePageChange(
                                                            users.links[0]
                                                                ?.url || ""
                                                        )
                                                    }
                                                    className={
                                                        users.current_page === 1
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer"
                                                    }
                                                />
                                            </PaginationItem>

                                            {/* Page Numbers */}
                                            {users.links
                                                .slice(1, -1)
                                                .map((link, index) => {
                                                    if (link.label === "...") {
                                                        return (
                                                            <PaginationItem
                                                                key={`ellipsis-${index}`}
                                                            >
                                                                <PaginationEllipsis />
                                                            </PaginationItem>
                                                        );
                                                    }
                                                    return (
                                                        <PaginationItem
                                                            key={`page-${index}`}
                                                        >
                                                            <PaginationLink
                                                                onClick={() =>
                                                                    handlePageChange(
                                                                        link.url ||
                                                                            ""
                                                                    )
                                                                }
                                                                isActive={
                                                                    link.active
                                                                }
                                                                className="cursor-pointer"
                                                            >
                                                                {link.label}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    );
                                                })}

                                            {/* Next Button */}
                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() =>
                                                        handlePageChange(
                                                            users.links[
                                                                users.links
                                                                    .length - 1
                                                            ]?.url || ""
                                                        )
                                                    }
                                                    className={
                                                        users.current_page ===
                                                        users.last_page
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer"
                                                    }
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                )}
                            </div>

                            {/* Right side - Per-page selector */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Show:</span>
                                <Select
                                    value={users.per_page.toString()}
                                    onValueChange={handlePerPageChange}
                                >
                                    <SelectTrigger className="w-20 h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span>per page</span>
                            </div>
                        </div>
                    )}
                </GroupHeader>
            </div>

            {/* Modal Components */}
            <CreateUserModal
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onUserCreated={handleUserCreated}
            />

            <EditUserModal
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                user={selectedUser}
                onUserUpdated={handleUserUpdated}
            />

            {/* Single User Delete Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                type="single"
                itemName={userToDelete?.name}
                isDeleting={isDeleting}
            />

            {/* Bulk Delete Modal */}
            <DeleteConfirmationModal
                isOpen={isBulkDeleteDialogOpen}
                onClose={() => setIsBulkDeleteDialogOpen(false)}
                onConfirm={confirmBulkDelete}
                type="bulk"
                count={selectedUsers.length}
                isDeleting={isDeleting}
            />
        </>
    );
}
