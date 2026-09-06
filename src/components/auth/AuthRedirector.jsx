import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/shared/contexts/AuthContext";
import { toast } from 'sonner';

const AuthRedirector = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const redirectedRef = useRef(false);
    const callbackDetectedToastRef = useRef(false);

    useEffect(() => {
        // Log URL on mount for debugging
        const urlP = new URL(window.location.href);
        const hasCode = urlP.searchParams.has('code') || urlP.hash.includes('access_token');
        
        if (hasCode && !callbackDetectedToastRef.current) {
            callbackDetectedToastRef.current = true;
            console.log('[AuthRedirector] OAuth callback detected in URL. Waiting for session...');
            toast.info("Verifying LinkedIn session... Please wait.", { id: 'auth-callback-toast' });
        }

        if (loading || !user || redirectedRef.current) return;

        try {
            const hash = urlP.hash;
            const params = urlP.searchParams;

            const isAuthCallback =
                hash.includes('access_token') ||
                hash.includes('type=signup') ||
                hash.includes('type=recovery') ||
                hash.includes('type=magiclink') ||
                hash.includes('type=invite') ||
                params.has('code');

            console.log('[AuthRedirector] Checking callback:', { isAuthCallback, hash: !!hash, hasCode: params.has('code'), pathname: location.pathname });

            // 1. OAuth / magic link / invite callbacks -> /collaboration (was /workspace)
            if (isAuthCallback) {
                redirectedRef.current = true;
                console.log('[AuthRedirector] Detected callback! Redirecting to /collaboration...');
                toast.dismiss('auth-callback-toast');
                toast.success("Login successful! Welcome back.");
                navigate('/collaboration', { replace: true });
                return;
            }

            // 2. Logged-in landing: if user lands on / or /login, send to /collaboration
            // This makes http://localhost:17117/ show as http://localhost:17117/collaboration when logged in
            const isLandingRoute = location.pathname === '/' || location.pathname === '/login';
            if (isLandingRoute) {
                redirectedRef.current = true;
                console.log('[AuthRedirector] Logged user on landing route, redirecting to /collaboration...');
                navigate('/collaboration', { replace: true });
            }

        } catch (e) {
            console.error("Error parsing URL in AuthRedirector", e);
        }
    }, [user, loading, navigate, location]);

    return null;
};

export default AuthRedirector;