export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    user_role: 'HR' | 'Employee' | 'SuperAdmin';
    created_at?: string;
    updated_at?: string;
}

export interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
