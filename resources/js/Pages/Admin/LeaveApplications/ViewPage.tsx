import { useState } from "react";
import { AppLayout } from "@/Layouts/AppLayout";
import { Badge } from "@/Components/UI/Badge";
import { Button } from "@/Components/UI/Button";
import { Calendar, User, Clock, FileText, ZoomIn } from "lucide-react";
import { Head } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";
import Modal from "@/Components/Modal";

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
    image: string;
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

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

                {/* Medical Certificate */}
                {leave.image && (
                    <>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock className="w-5 h-5 text-gray-600" />
                                <h4 className="font-medium text-gray-900">
                                    Medical Certificate
                                </h4>
                            </div>
                            <div
                                className="relative group cursor-pointer"
                                onClick={openModal}
                            >
                                <img
                                    src={leave.image}
                                    alt={leave.employee_name}
                                    className="w-full h-auto rounded-md transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-md flex items-center justify-center">
                                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                </div>
                            </div>
                        </div>

                        <Modal
                            show={isModalOpen}
                            onClose={closeModal}
                            maxWidth="2xl"
                            closeable={true}
                        >
                            <img
                                src={leave.image}
                                alt={leave.employee_name}
                                className="w-full h-auto rounded-lg"
                            />
                        </Modal>
                    </>
                )}

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
