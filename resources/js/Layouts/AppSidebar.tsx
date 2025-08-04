"use client";

import * as React from "react";
import { usePage } from "@inertiajs/react";
import {
    LayoutDashboardIcon,
    CalendarCheckIcon,
    LogOutIcon,
    MoonIcon,
    UsersIcon,
    User,
    UserIcon,
} from "lucide-react";
import { router } from "@inertiajs/react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupContent,
} from "@/Components/UI/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/UI/Avatar";
import { Switch } from "@/Components/UI/Switch";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/Components/UI/AlertDialog";
import { PageProps } from "@/types";
import { useTheme } from "@/Contexts/ThemeContext";

const defaultUserData = {
    name: "SOVOUTHEA",
    role: "EMPLOYEE",
    avatar: "/placeholder-user.jpg",
};

interface UserData {
    name: string;
    role: string;
    avatar?: string;
    email?: string;
    id?: string;
}
interface ExtendedUser {
    id: number;
    name: string;
    email: string;
    user_role: "HR" | "Employee" | "SuperAdmin";
    image?: string;
    email_verified_at?: string;
    created_at?: string;
    updated_at?: string;
}

interface ExtendedPageProps extends Omit<PageProps, "auth"> {
    auth: {
        user: ExtendedUser;
    };
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { theme, toggleTheme } = useTheme();
    const { url } = usePage();
    const { auth } = usePage<ExtendedPageProps>().props;
    const user = auth?.user;
    const userData: UserData = {
        name: user?.name || defaultUserData.name,
        role: user?.user_role || defaultUserData.role,
        avatar: user?.image || defaultUserData.avatar,
        email: user?.email,
        id: user?.id?.toString(),
    };

    const isHR =
        userData.role?.toUpperCase().includes("HR") ||
        userData.role?.toUpperCase() === "HUMAN RESOURCES";

    const getNavigation = () => {
        if (userData.role === "SuperAdmin") {
            return [
                {
                    title: "Dashboard",
                    url: "/admin",
                    icon: LayoutDashboardIcon,
                    isActive: url === "/admin" || url === "/admin/dashboard",
                },
                {
                    title: "Employees",
                    url: "/admin/employees",
                    icon: UsersIcon,
                    isActive: url.startsWith("/admin/employees"),
                },
                {
                    title: "Leave Management",
                    url: "/admin/leaves",
                    icon: CalendarCheckIcon,
                    isActive: url.startsWith("/admin/leaves"),
                },
                {
                    title: "Users",
                    url: "/admin/users",
                    icon: User,
                    isActive: url.startsWith("/admin/users"),
                },
            ];
        }

        // HR Navigation
        if (userData.role === "HR") {
            return [
                {
                    title: "Dashboard",
                    url: "/admin",
                    icon: LayoutDashboardIcon,
                    isActive: url === "/admin" || url === "/admin/dashboard",
                },
                {
                    title: "Employees",
                    url: "/admin/employees",
                    icon: UsersIcon,
                    isActive: url.startsWith("/admin/employees"),
                },
                {
                    title: "Leave Management",
                    url: "/admin/leaves",
                    icon: CalendarCheckIcon,
                    isActive: url.startsWith("/admin/leaves"),
                },
                {
                    title: "My Leaves",
                    url: "/admin/hr-leaves",
                    icon: CalendarCheckIcon,
                    isActive: url.startsWith("/admin/hr-leaves"),
                },
                {
                    title: "Users",
                    url: "/admin/users",
                    icon: User,
                    isActive: url.startsWith("/admin/users"),
                },
            ];
        }

        // Employee Navigation
        return [
            {
                title: "Dashboard",
                url: "/dashboard",
                icon: LayoutDashboardIcon,
                isActive: url === "/dashboard",
            },
            {
                title: "My Leaves",
                url: "/admin/leaves",
                icon: CalendarCheckIcon,
                isActive: url.startsWith("/admin/leaves"),
            },
            {
                title: "My Profile",
                url: "/admin/employees",
                icon: UserIcon,
                isActive: url.startsWith("/admin/employees"),
            },
            {
                title: "Users",
                url: "/admin/users",
                icon: User,
                isActive: url.startsWith("/admin/users"),
            },
        ];
    };

    // Remove the separate getEmployeeNavigation function and use getNavigation() instead

    const handleLogout = () => {
        router.post(route("logout"));
    };

    return (
        <Sidebar
            collapsible="offcanvas"
            className="bg-sidebar border-r border-sidebar-border w-64 min-w-64 shadow-md"
            {...props}
        >
            <SidebarHeader className="p-3">
                {/* User Profile Section */}
                <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-8 w-8 items-center">
                        <AvatarImage
                            className="object-cover"
                            src={`/images/${userData.avatar}`}
                            alt={userData.name}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                            {userData.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs text-sidebar-foreground/70 font-medium truncate">
                            {userData.role}
                        </div>
                        <div className="text-sm font-semibold text-sidebar-foreground truncate">
                            {userData.name}
                        </div>
                        {userData.email && (
                            <div className="text-xs text-sidebar-foreground/60 truncate">
                                {userData.email}
                            </div>
                        )}
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-3">
                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            {getNavigation().map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        className={`w-full justify-start h-9 px-2 rounded-lg transition-colors ${
                                            item.isActive
                                                ? theme === "dark"
                                                    ? "bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground font-medium"
                                                    : "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground font-medium"
                                                : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground"
                                        }`}
                                    >
                                        <a
                                            href={item.url}
                                            className="flex items-center gap-2 min-w-0"
                                        >
                                            <item.icon className="h-4 w-4 flex-shrink-0" />
                                            <span className="font-medium text-xs truncate">
                                                {item.title}
                                            </span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-3 mt-auto">
                {/* Secondary Navigation */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1 mb-3">
                            <SidebarMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <SidebarMenuButton className="w-full justify-start h-9 px-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <LogOutIcon className="h-4 w-4 text-sidebar-foreground/70 flex-shrink-0" />
                                                <span className="font-medium text-sidebar-foreground text-xs truncate">
                                                    LOG OUT
                                                </span>
                                            </div>
                                        </SidebarMenuButton>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="w-full max-w-sm mx-auto">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Confirm Logout
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure to logout?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="flex flex-row justify-center items-center space-x-2">
                                            <AlertDialogCancel>
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-primary text-primary-foreground hover:bg-danger"
                                                onClick={handleLogout}
                                            >
                                                Logout
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Night Mode Toggle */}
                <div className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MoonIcon className="h-4 w-4 text-sidebar-foreground/70 flex-shrink-0" />
                        <span className="font-medium text-sidebar-foreground text-xs truncate">
                            NIGHTMODE
                        </span>
                    </div>
                    <Switch
                        checked={theme === "dark"}
                        onCheckedChange={toggleTheme}
                        className="data-[state=checked]:bg-primary flex-shrink-0 scale-75"
                    />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
