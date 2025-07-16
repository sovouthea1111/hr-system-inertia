import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { PageProps } from "@/types";

export default function AdminDashboard({ auth }: PageProps) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Admin Dashboard
                </h2>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-medium mb-4">
                                Welcome to Admin Dashboard
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-blue-100 p-4 rounded-lg">
                                    <h4 className="font-semibold text-blue-800">
                                        Employees
                                    </h4>
                                    <p className="text-blue-600">
                                        Manage employee records
                                    </p>
                                    <a
                                        href="/admin/employees"
                                        className="text-blue-500 hover:underline"
                                    >
                                        View All
                                    </a>
                                </div>

                                <div className="bg-green-100 p-4 rounded-lg">
                                    <h4 className="font-semibold text-green-800">
                                        Departments
                                    </h4>
                                    <p className="text-green-600">
                                        Manage departments
                                    </p>
                                    <a
                                        href="/admin/departments"
                                        className="text-green-500 hover:underline"
                                    >
                                        View All
                                    </a>
                                </div>

                                <div className="bg-yellow-100 p-4 rounded-lg">
                                    <h4 className="font-semibold text-yellow-800">
                                        Payroll
                                    </h4>
                                    <p className="text-yellow-600">
                                        Manage payroll
                                    </p>
                                    <a
                                        href="/admin/payroll"
                                        className="text-yellow-500 hover:underline"
                                    >
                                        View All
                                    </a>
                                </div>

                                <div className="bg-purple-100 p-4 rounded-lg">
                                    <h4 className="font-semibold text-purple-800">
                                        Reports
                                    </h4>
                                    <p className="text-purple-600">
                                        View reports
                                    </p>
                                    <a
                                        href="/admin/reports"
                                        className="text-purple-500 hover:underline"
                                    >
                                        View All
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
