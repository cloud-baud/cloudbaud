import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const AuthRedirector = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

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

            console.log('[AuthRedirector] Checking callback:', { isAuthCallback, hash: !!hash, hasCode: params.has('code') });

            if (isAuthCallback) {
                redirectedRef.current = true;
                console.log('[AuthRedirector] Detected callback! Redirecting to /workspace...');
                toast.dismiss('auth-callback-toast');
                toast.success("Login successful! Welcome back.");
                // Redirect to portal if we detected an auth callback
                navigate('/workspace', { replace: true });
            }
        } catch (e) {
            console.error("Error parsing URL in AuthRedirector", e);
        }
    }, [user, loading, navigate]);

    return null;
};

export default AuthRedirector;
