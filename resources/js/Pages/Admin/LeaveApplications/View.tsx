import React from "react";
import { Modal } from "@/Components/UI/Modal";
import { Button } from "@/Components/UI/Button";
import { Badge } from "@/Components/UI/Badge";
import { Calendar, User, Clock, FileText, CheckCircle } from "lucide-react";

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

interface ViewLeaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    leave: LeaveApplication | null;
}

export function ViewLeaveModal({
    isOpen,
    onClose,
    leave,
}: ViewLeaveModalProps) {
    if (!leave) return null;

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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-2xl"
            title="Leave Application Details"
        >
            <div className="space-y-6">
                {/* Header with Status */}
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Leave Status
                    </h3>
                    <Badge className={getStatusColor(leave.status)}>
                        {leave.status.charAt(0).toUpperCase() +
                            leave.status.slice(1)}
                    </Badge>
                </div>

                {/* Employee Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <User className="w-5 h-5 text-gray-600" />
                        <h4 className="font-medium text-gray-900">
                            Employee Information
                        </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Name
                            </label>
                            <p className="text-gray-900">
                                {leave.employee_name}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Email
                            </label>
                            <p className="text-gray-900">
                                {leave.employee_email}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Leave Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <h4 className="font-medium text-gray-900">
                            Leave Details
                        </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Leave Type
                            </label>
                            <p className="text-gray-900">{leave.leave_type}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Days Requested
                            </label>
                            <p className="text-gray-900">
                                {leave.days_requested} days
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Start Date
                            </label>
                            <p className="text-gray-900">
                                {formatDate(leave.start_date)}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                End Date
                            </label>
                            <p className="text-gray-900">
                                {formatDate(leave.end_date)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reason */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <h4 className="font-medium text-gray-900">Reason</h4>
                    </div>
                    <p className="text-gray-900 whitespace-pre-wrap">
                        {leave.reason}
                    </p>
                </div>

                {/* Application Date */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <h4 className="font-medium text-gray-900">
                            Application Information
                        </h4>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Applied Date
                        </label>
                        <p className="text-gray-900">
                            {formatDate(leave.applied_date)}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
