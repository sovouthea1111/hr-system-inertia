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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [isDarkMode, setIsDarkMode] = React.useState(false);
    const { url } = usePage();
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;
    const userData: UserData = {
        name: user?.name || defaultUserData.name,
        role: user?.user_role || defaultUserData.role,
        avatar: defaultUserData.avatar,
        email: user?.email,
        id: user?.id?.toString(),
    };

    const isHR =
        userData.role?.toUpperCase().includes("HR") ||
        userData.role?.toUpperCase() === "HUMAN RESOURCES";

    const getNavigation = () => {
        // HR/Admin Navigation
        if (userData.role === "HR" || userData.role === "SuperAdmin") {
            return [
                {
                    title: "DASHBOARD",
                    url: "/admin",
                    icon: LayoutDashboardIcon,
                    isActive: url === "/admin" || url === "/admin/dashboard",
                },
                {
                    title: "EMPLOYEES",
                    url: "/admin/employees",
                    icon: UsersIcon,
                    isActive: url.startsWith("/admin/employees"),
                },
                {
                    title: "LEAVE MANAGEMENT",
                    url: "/admin/leaves",
                    icon: CalendarCheckIcon,
                    isActive: url.startsWith("/admin/leaves"),
                },
                {
                    title: "USERS",
                    url: "/admin/users",
                    icon: User,
                    isActive: url.startsWith("/admin/users"),
                },
            ];
        }

        // Employee Navigation
        return [
            {
                title: "DASHBOARD",
                url: "/dashboard",
                icon: LayoutDashboardIcon,
                isActive: url === "/dashboard",
            },
            {
                title: "MY LEAVES",
                url: "/admin/leaves",
                icon: CalendarCheckIcon,
                isActive: url.startsWith("/admin/leaves"),
            },
            {
                title: "MY PROFILE",
                url: "/admin/employees",
                icon: UserIcon,
                isActive: url.startsWith("/admin/employees"),
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
            className="bg-white shadow-md border-r border-gray-200 w-64 min-w-64"
            {...props}
        >
            <SidebarHeader className="p-3">
                {/* User Profile Section */}
                <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-8 w-8 items-center">
                        <AvatarImage
                            src={userData.avatar}
                            alt={userData.name}
                        />
                        <AvatarFallback className="bg-primary text-white font-semibold text-xs">
                            {userData.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 font-medium truncate">
                            {userData.role}
                            {isHR && (
                                <span className="ml-1 px-1 py-0.5 bg-green-100 text-green-600 rounded text-xs font-semibold">
                                    HR
                                </span>
                            )}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 truncate">
                            {userData.name}
                        </div>
                        {userData.email && (
                            <div className="text-xs text-gray-400 truncate">
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
                                                ? "bg-primary text-white hover:bg-primary hover:text-white"
                                                : "hover:bg-primary hover:text-white text-gray-700"
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
                                        <SidebarMenuButton className="w-full justify-start h-9 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <LogOutIcon className="h-4 w-4 text-gray-600 flex-shrink-0" />
                                                <span className="font-medium text-gray-700 text-xs truncate">
                                                    LOG OUT
                                                </span>
                                            </div>
                                        </SidebarMenuButton>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Confirm Logout
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure to logout?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-primary text-white hover:bg-danger"
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
                <div className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MoonIcon className="h-4 w-4 text-gray-600 flex-shrink-0" />
                        <span className="font-medium text-gray-700 text-xs truncate">
                            NIGHTMODE
                        </span>
                    </div>
                    <Switch
                        checked={isDarkMode}
                        onCheckedChange={setIsDarkMode}
                        className="data-[state=checked]:bg-primary flex-shrink-0 scale-75"
                    />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
