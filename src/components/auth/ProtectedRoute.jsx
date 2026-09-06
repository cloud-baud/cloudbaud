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

    const isDev = import.meta.env.DEV;
    // NEW: Check if user explicitly signed out
    // Why: In DEV, `!user && !isDev` was false, so it let you in with no user after Sign Out.
    // We now also block if signed-out flag exists, forcing /login even in DEV.
    const hasSignedOut = localStorage.getItem('cb_has_signed_out') === '1';

    if (!user && (!isDev || hasSignedOut)) {
        return <Navigate to="/login" replace />;
    }

    // MFA check unchanged
    if (aal && aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
        return <MfaChallengeScreen />;
    }

    return <Outlet />;
};

export default ProtectedRoute;