import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

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
                setSession(session);
                setUser(session?.user ?? null);
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
        window.location.href = '/login';
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
        signOut
    };

    // Prevent rendering children until initial load is done to avoid redirects
    // But for debugging, let's render standard loading text
    if (loading) {
        return <div className="fixed inset-0 flex items-center justify-center bg-background">Loading...</div>;
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
