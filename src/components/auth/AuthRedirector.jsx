import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthRedirector = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // Capture the initial URL immediately when component mounts
    // before Supabase has a chance to strip parameters
    const initialUrlRef = useRef(window.location.href);

    useEffect(() => {
        if (loading || !user) return;

        try {
            const urlP = new URL(initialUrlRef.current);
            const hash = urlP.hash;
            const params = urlP.searchParams;

            const isAuthCallback =
                hash.includes('access_token') ||
                hash.includes('type=signup') ||
                hash.includes('type=recovery') ||
                hash.includes('type=magiclink') ||
                hash.includes('type=invite') ||
                params.has('code');

            if (isAuthCallback) {
                // Redirect to portal if we detected an auth callback
                navigate('/portal', { replace: true });
            }
        } catch (e) {
            console.error("Error parsing URL in AuthRedirector", e);
        }
    }, [user, loading, navigate]);

    return null;
};

export default AuthRedirector;
