import React, { useEffect, useState } from "react";
import { AppLayout } from "@/Layouts/AppLayout";
import { Badge } from "@/Components/UI/Badge";
import { Button } from "@/Components/UI/Button";
import { Calendar, User, Clock, FileText } from "lucide-react";
import { Head, usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";

interface LeaveApplication {
    id: number;
    employee_id?: number;
    employee_name: string;
    employee_email: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    days_requested: number;
    reason: string;
    status: "pending" | "approved" | "rejected";
    applied_date: string;
}

interface ViewPageProps {
    leave: LeaveApplication;
    auth: {
        user: {
            user_role: string;
        };
    };
}

export default function ViewPage({ leave, auth }: ViewPageProps) {
    const isHROrSuperAdmin = ["HR", "SuperAdmin"].includes(
        auth?.user?.user_role
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "bg-success text-white font-semibold";
            case "rejected":
                return "bg-danger text-white font-semibold";
            case "pending":
                return "bg-warning text-white font-semibold";
            default:
                return "bg-gray-500 text-white font-semibold";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const handleStatusUpdate = (newStatus: string) => {
        router.put(
            route("admin.leaves-status.update", leave.id),
            { status: newStatus },
            {
                onSuccess: () => {
                    toast.success("Leave status updated successfully!");
                    router.reload();
                },
                onError: () => {
                    toast.error("Failed to update leave status.");
                },
            }
        );
    };

    const handleBack = () => {
        router.visit(route("admin.leaves.index"));
    };

    const breadcrumbs = [
        { label: "Home", href: "/admin/dashboard" },
        { label: "Leave Applications", href: route("admin.leaves.index") },
        { label: `Application #${leave.id}` },
    ];

    return (
        <AppLayout title="Leave Application Details" breadcrumbs={breadcrumbs}>
            <Head title="Leave Application Details" />
            <div className="max-w-4xl mx-auto border border-border-card bg-card rounded-lg shadow-sm p-6 space-y-6">
                {/* Header with Status */}
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-card-foreground">
                        Leave Status
                    </h3>
                    <Badge className={getStatusColor(leave.status)}>
                        {leave.status.charAt(0).toUpperCase() +
                            leave.status.slice(1)}
                    </Badge>
                </div>

                {/* Employee Information */}
                <div className="border border-border-card bg-card rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <User className="w-5 h-5 text-card-foreground" />
                        <h4 className="font-medium text-card-foreground">
                            Employee Information
                        </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-card-foreground">
                                Name
                            </label>
                            <p className="text-card-foreground">
                                {leave.employee_name}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Email
                            </label>
                            <p className="text-card-foreground">
                                {leave.employee_email}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Leave Details */}
                <div className="border border-border-card bg-card rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <h4 className="font-medium text-card-foreground">
                            Leave Details
                        </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Leave Type
                            </label>
                            <p className="text-card-foreground">
                                {leave.leave_type}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Days Requested
                            </label>
                            <p className="text-card-foreground">
                                {leave.days_requested} days
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Start Date
                            </label>
                            <p className="text-card-foreground">
                                {formatDate(leave.start_date)}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                End Date
                            </label>
                            <p className="text-card-foreground">
                                {formatDate(leave.end_date)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reason */}
                <div className="border border-border-card bg-card rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <h4 className="font-medium text-card-foreground">
                            Reason
                        </h4>
                    </div>
                    <p className="text-card-foreground whitespace-pre-wrap">
                        {leave.reason}
                    </p>
                </div>

                {/* Application Date */}
                <div className="border border-border-card bg-card rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <h4 className="font-medium text-card-foreground">
                            Application Information
                        </h4>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Applied Date
                        </label>
                        <p className="text-card-foreground">
                            {formatDate(leave.applied_date)}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                    >
                        Back to List
                    </Button>

                    {isHROrSuperAdmin && leave.status === "pending" && (
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="primary"
                                onClick={() => handleStatusUpdate("approved")}
                            >
                                Approve
                            </Button>
                            <Button
                                type="button"
                                variant="danger"
                                onClick={() => handleStatusUpdate("rejected")}
                            >
                                Reject
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
