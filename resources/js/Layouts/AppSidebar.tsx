import * as React from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
    LayoutDashboardIcon,
    CalendarCheckIcon,
    LogOutIcon,
    MoonIcon,
    UsersIcon,
    User,
    UserIcon,
    ClockIcon,
} from "lucide-react";

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
import { cn } from "../../../lib/utils";

const defaultUserData = {
    name: "SOVOUTHEA",
    role: "EMPLOYEE",
};

interface UserData {
    name: string;
    role: string;
    avatar?: string;
    email?: string;
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

export function AppSidebar({
    className,
    ...props
}: React.ComponentProps<typeof Sidebar>) {
    const { theme, toggleTheme } = useTheme();
    const { url, props: pageProps } = usePage<ExtendedPageProps>();
    const user = pageProps.auth?.user;
    const userData: UserData = {
        name: user?.name || defaultUserData.name,
        role: user?.user_role || defaultUserData.role,
        avatar: user?.image,
        email: user?.email,
    };

    const userInitials = React.useMemo(() => {
        return userData.name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((name) => name.charAt(0))
            .join("")
            .toUpperCase();
    }, [userData.name]);

    const avatarSrc = userData.avatar
        ? `/images/${userData.avatar}`
        : undefined;

    const navigationItems = React.useMemo(() => {
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
                    title: "Overtime Management",
                    url: "/admin/overtime",
                    icon: ClockIcon,
                    isActive: url.startsWith("/admin/overtime"),
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
                    title: "Overtime Management",
                    url: "/admin/overtime",
                    icon: ClockIcon,
                    isActive:
                        url.startsWith("/admin/overtime") &&
                        !url.startsWith("/admin/overtime-payroll"),
                },
                {
                    title: "Overtime Payroll",
                    url: "/admin/overtime-payroll",
                    icon: ClockIcon,
                    isActive: url.startsWith("/admin/overtime-payroll"),
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
                title: "My Overtime",
                url: "/admin/overtime",
                icon: ClockIcon,
                isActive: url.startsWith("/admin/overtime"),
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
    }, [userData.role, url]);

    const handleLogout = () => {
        router.post(route("logout"));
    };

    return (
        <Sidebar
            collapsible="icon"
            className={cn(
                "border-sidebar-border bg-sidebar shadow-none",
                className,
            )}
            {...props}
        >
            <SidebarHeader className="h-14 justify-center border-b border-sidebar-border/70 px-4 py-0 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
                <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground shadow-sm">
                        HR
                    </div>
                    <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                        <p className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
                            HR System
                        </p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-3 py-4 group-data-[collapsible=icon]:px-2">
                <SidebarGroup className="p-0">
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1.5">
                            {navigationItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={item.isActive}
                                        tooltip={item.title}
                                        className={cn(
                                            "h-10 rounded-xl px-3 text-sm font-medium text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                            "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                                            item.isActive &&
                                                "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                                        )}
                                    >
                                        <Link
                                            href={item.url}
                                            className="flex min-w-0 items-center gap-3"
                                        >
                                            <item.icon className="size-4 shrink-0" />
                                            <span className="truncate group-data-[collapsible=icon]:hidden">
                                                {item.title}
                                            </span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/70 p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
                <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-3 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
                    <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
                        <Avatar className="size-9 border border-sidebar-border">
                            {avatarSrc && (
                                <AvatarImage
                                    className="object-cover"
                                    src={avatarSrc}
                                    alt={userData.name}
                                />
                            )}
                            <AvatarFallback className="bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                                {userInitials || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                            <p className="truncate text-sm font-semibold text-sidebar-foreground">
                                {userData.name}
                            </p>
                            <p className="truncate text-xs text-sidebar-foreground/55">
                                {userData.role}
                            </p>
                        </div>
                    </div>
                    {userData.email && (
                        <p className="mt-2 truncate text-xs text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
                            {userData.email}
                        </p>
                    )}
                </div>

                <SidebarMenu className="mt-2 gap-1 group-data-[collapsible=icon]:items-center">
                    <SidebarMenuItem>
                        <div className="flex h-10 items-center justify-between rounded-xl px-3 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden">
                            <div className="flex min-w-0 items-center gap-3">
                                <MoonIcon className="size-4 shrink-0" />
                                <span className="truncate text-sm font-medium">
                                    Dark mode
                                </span>
                            </div>
                            <Switch
                                checked={theme === "dark"}
                                onCheckedChange={toggleTheme}
                                className="scale-75 data-[state=checked]:bg-sidebar-primary"
                            />
                        </div>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <AlertDialog>
                            <SidebarMenuButton
                                asChild
                                tooltip="Log out"
                                className="h-10 rounded-xl px-3 text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                            >
                                <AlertDialogTrigger>
                                    <LogOutIcon className="size-4 shrink-0" />
                                    <span className="truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
                                        Log out
                                    </span>
                                </AlertDialogTrigger>
                            </SidebarMenuButton>
                            <AlertDialogContent className="mx-auto w-full max-w-sm">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Confirm logout
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to sign out of
                                        your account?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex flex-row items-center justify-center gap-2 space-x-0">
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
            </SidebarFooter>
        </Sidebar>
    );
}
