export interface Employee {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
    department: string;
    position: string | null;
    joint_date: string;
    status: "active" | "inactive";
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
}

export interface EmployeeFormData {
    full_name: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    joint_date: string;
    status: "active" | "inactive";
}
