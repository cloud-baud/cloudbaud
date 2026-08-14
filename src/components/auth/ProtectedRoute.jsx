import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from "@/shared/contexts/AuthContext";
import MfaChallengeScreen from './MfaChallengeScreen';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
    const { user, loading, aal } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Intercept if MFA is active but user session is unverified (AAL1 instead of AAL2)
    if (aal && aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
        return <MfaChallengeScreen />;
    }

    return <Outlet />;
};

export default ProtectedRoute;


