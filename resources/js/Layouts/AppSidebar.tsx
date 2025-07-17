"use client";

import * as React from "react";
import { usePage } from "@inertiajs/react";
import {
    LayoutDashboardIcon,
    CalendarCheckIcon,
    LogOutIcon,
    MoonIcon,
    UsersIcon,
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
    const [userData, setUserData] = React.useState<UserData>(defaultUserData);
    const [isLoading, setIsLoading] = React.useState(true);
    const { url } = usePage();

    const isHR =
        userData.role?.toUpperCase().includes("HR") ||
        userData.role?.toUpperCase() === "HUMAN RESOURCES";

    const getNavigation = () => {
        const baseNavigation = [
            {
                title: "DASHBOARD",
                url: "/dashboard",
                icon: LayoutDashboardIcon,
                isActive: url === "/dashboard",
            },
            {
                title: "EMPLOYEES",
                url: "/admin/employees",
                icon: UsersIcon,
                isActive: url.startsWith("/admin/employees"),
            },
            {
                title: "LEAVE APPLICATION",
                url: "/admin/leave-application",
                icon: CalendarCheckIcon,
                isActive: url.startsWith("/admin/leave-application"),
            },
        ];

        return baseNavigation;
    };

    React.useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("/api/user/profile", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const apiUserData = await response.json();
                    setUserData({
                        name:
                            apiUserData.name ||
                            apiUserData.fullName ||
                            defaultUserData.name,
                        role:
                            apiUserData.role ||
                            apiUserData.position ||
                            defaultUserData.role,
                        avatar:
                            apiUserData.avatar ||
                            apiUserData.profileImage ||
                            defaultUserData.avatar,
                        email: apiUserData.email,
                        id: apiUserData.id,
                    });
                } else {
                    setUserData(defaultUserData);
                }
            } catch (error) {
                setUserData(defaultUserData);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = () => {
        setUserData(defaultUserData);
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
                    <Avatar className="h-8 w-8">
                        <AvatarImage
                            src={userData.avatar}
                            alt={userData.name}
                        />
                        <AvatarFallback className="bg-primary text-white font-semibold text-xs">
                            {isLoading ? "..." : userData.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 font-medium truncate">
                            {isLoading ? "Loading..." : userData.role}
                            {isHR && !isLoading && (
                                <span className="ml-1 px-1 py-0.5 bg-green-100 text-green-600 rounded text-xs font-semibold">
                                    HR
                                </span>
                            )}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 truncate">
                            {isLoading ? "Loading..." : userData.name}
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
                        className="data-[state=checked]:bg-blue-500 flex-shrink-0 scale-75"
                    />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
