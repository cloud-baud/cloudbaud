import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- DEV ONLY: Persona Impersonation State ---
    const [realUser, setRealUser] = useState(null); // Stores the actual authenticated user during impersonation

    useEffect(() => {
        let mounted = true;

        async function getSession() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Session error:', err);
                if (mounted) setLoading(false);
            }
        }

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                // If we are impersonating, DO NOT overwrite the mock user with the real session update
                // unless it is a SIGN_OUT event
                setSession(session);

                // If not impersonating, sync user
                setUser((prev) => {
                    if (prev?.isImpersonating && _event !== 'SIGNED_OUT') return prev;
                    return session?.user ?? null;
                });

                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signInWithEmail = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    };

    const signInWithOAuth = async (provider) => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: `${window.location.origin}/portal`,
            },
        });
        if (error) throw error;
        return data;
    };

    const signInWithOtp = async (email) => {
        const { data, error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/portal`,
            },
        });
        if (error) throw error;
        return data;
    };

    const signInWithSSO = async (domain) => {
        const { data, error } = await supabase.auth.signInWithSSO({
            domain: domain,
            options: {
                redirectTo: `${window.location.origin}/portal`,
            },
        });
        if (error) throw error;
        return data;
    };

    const signUpWithEmail = async (email, password, metadata = {}) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: metadata }
        });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        localStorage.clear();
        setRealUser(null); // Clear impersonation backup
        window.location.href = '/login';
    };

    // --- DEV ONLY: Persona Impersonation Logic ---
    const impersonateUser = (persona) => {
        // Double check checks
        const isDev = import.meta.env.DEV || process.env.NODE_ENV === 'development';
        if (!isDev) return;

        // Backup real user if not already backed up
        if (!realUser && user && !user.isImpersonating) {
            setRealUser(user);
        }

        // Mock User Object
        const mockUser = {
            id: `dev-mock-${persona.id}`,
            email: persona.email,
            role: persona.role, // Custom role field
            aud: 'authenticated',
            user_metadata: {
                full_name: persona.name,
                avatar_url: null,
                is_mock: true,
                role: persona.role // Duplicate for metadata access consistency
            },
            app_metadata: {
                role: persona.role
            },
            isImpersonating: true
        };

        setUser(mockUser);
        console.log(`[DevAuth] Impersonating ${persona.name} (${persona.role})`);
    };

    const revertImpersonation = () => {
        if (realUser) {
            setUser(realUser);
            setRealUser(null);
            console.log(`[DevAuth] Reverted to real user`);
        } else {
            // If no real user backup (e.g. started from logged out?), just reload or check session
            // For now, let's refresh session
            supabase.auth.getSession().then(({ data }) => {
                setUser(data.session?.user ?? null);
            });
        }
    };

    const value = {
        user,
        session,
        loading,
        signInWithEmail,
        signInWithOtp,
        signInWithOAuth,
        signInWithSSO,
        signUpWithEmail,
        signOut,
        // Dev Helpers
        impersonateUser,
        revertImpersonation
    };

    // Prevent rendering children until initial load is done to avoid redirects
    // But for debugging, let's render standard loading text
    if (loading) {
        return <div className="fixed inset-0 flex items-center justify-center bg-background">Loading CloudBaud...</div>;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
