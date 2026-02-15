import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

// Hardcoded Allowlist for Finance Access
// In a future PROD version, this should move to a DB table 'finance_access_control'
const ALLOWED_FINANCE_EMAILS = [
    'jish.nath@cloudbaud.com',
    'admin@shiftleft.digital',
    'cpa@example.com' // TODO: Replace with actual CPA email when onboarded
];

export const isFinanceAuthorized = (user) => {
    if (!user || !user.email) return false;
    return ALLOWED_FINANCE_EMAILS.includes(user.email.toLowerCase());
};

const FinanceGuard = () => {
    const { user } = useAuth();

    if (!isFinanceAuthorized(user)) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 animate-in fade-in zoom-in duration-500">
                <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-6">
                    <ShieldAlert className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
                <p className="text-muted-foreground max-w-md mb-6">
                    Values contained in this module are highly sensitive.
                    Your account <strong>{user?.email}</strong> is not authorized to view Financial Data.
                </p>
                <div className="flex gap-4">
                    <a href="/collaboration" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        Return to Dashboard
                    </a>
                </div>
            </div>
        );
    }

    return <Outlet />;
};

export default FinanceGuard;
