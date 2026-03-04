import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- DEV ONLY: Persona Impersonation State ---
    const [realUser, setRealUser] = useState(null); // Stores the actual authenticated user during impersonation

    useEffect(() => {
        let mounted = true;

        // Check for error in URL (OAuth failures)
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const errorDesc = urlParams.get('error_description');
        const code = urlParams.get('code');
        
        console.log('[Auth] Initializing. URL:', window.location.pathname, { hasCode: !!code, hasError: !!error });

        if (error) {
            console.error('[Auth] Callback Error:', error, errorDesc);
            // Delay toast slightly to ensure Toaster is mounted
            setTimeout(() => {
                toast.error(`Login Failed: ${errorDesc || error}`, {
                    description: "Please check your Supabase/LinkedIn redirect configurations.",
                    duration: 8000,
                });
            }, 500);
        }

        async function fetchProfile(userId) {
            try {
                // Use maybeSingle to avoid 406 errors on missing profiles
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .maybeSingle();
                
                if (error) {
                    console.warn('[Auth] Profile fetch error:', error.message);
                    return null;
                }
                return data;
            } catch (err) {
                console.warn('[Auth] Unexpected error fetching profile:', err);
                return null;
            }
        }

        async function getSession() {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                if (mounted) {
                    setSession(currentSession);
                    
                    if (currentSession?.user) {
                        // 1. SET USER IMMEDIATELY from session to unblock Redirector
                        setUser(currentSession.user);
                        setLoading(false);
                        
                        // 2. Fetch profile in background and augment user data
                        try {
                            const profilePromise = fetchProfile(currentSession.user.id);
                            const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 2500));
                            
                            const profile = await Promise.race([profilePromise, timeoutPromise]);
                            if (profile) {
                                setUser(prev => ({ ...prev, ...profile }));
                            }
                        } catch (profileErr) {
                            console.warn('[Auth] Background profile fetch failed:', profileErr);
                        }
                    } else {
                        setUser(null);
                        setLoading(false);
                    }
                }
            } catch (err) {
                console.error('[Auth] Session error:', err);
                if (mounted) setLoading(false);
            }
        }

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log('[Auth] State Change:', _event, { hasUser: !!session?.user });
            if (mounted) {
                setSession(session);

                if (_event === 'SIGNED_OUT') {
                    setUser(null);
                    setLoading(false);
                } else if (session?.user) {
                    // Set user immediately to unblock UI
                    setUser(session.user);
                    setLoading(false);
                    
                    // Sync user with profile data in background
                    try {
                        const profilePromise = fetchProfile(session.user.id);
                        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 2500));
                        
                        const profile = await Promise.race([profilePromise, timeoutPromise]);
                        if (profile) {
                            setUser(prev => {
                                if (prev?.isImpersonating && _event !== 'SIGNED_OUT') return prev;
                                return { ...session.user, ...profile };
                            });
                        }
                    } catch (syncErr) {
                        console.warn('[Auth] Background profile sync failed:', syncErr);
                    }
                } else {
                    setLoading(false);
                }
            }
        });
        
        // Safety timeout: Ensure loading always stops eventually
        // Increased to 15s for OAuth handshakes which can be slow on cold starts
        const safetyTimer = setTimeout(() => {
            if (mounted) {
                setLoading((l) => {
                    if (l) {
                        console.warn('[Auth] Loading timed out after 15s - forcing UI unblock');
                        const urlParams = new URLSearchParams(window.location.search);
                        if (urlParams.has('code')) {
                            toast.error("Auth Timeout: We detected a login code from LinkedIn/Microsoft, but LinkedIn's server is taking too long to respond. Please try again or check your internet connection.");
                        }
                    }
                    return false;
                });
            }
        }, 15000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(safetyTimer);
        };
    }, []);

    // Helper: Check if email is allowed
    const checkAccess = async (email) => {
        try {
            const { data: patterns, error } = await supabase
                .from('allowed_access')
                .select('email_pattern')
                .eq('is_active', true);

            if (error) throw error;

            const emailLower = email.toLowerCase();
            const isAllowed = patterns?.some(p => {
                const pattern = p.email_pattern.toLowerCase();
                // Check for domain wildcard (starts with @) or exact match
                return pattern.startsWith('@') 
                    ? emailLower.endsWith(pattern) 
                    : emailLower === pattern;
            }) || emailLower === 'admin@shiftleft.digital'; // Hardcoded admin bypass

            if (!isAllowed) {
                throw new Error('Access Restricted: Your email is not on the allowed list.');
            }
            return true;
        } catch (err) {
            console.error('Access check failed:', err);
            // If it's our specific error, rethrow it. Otherwise generic error.
            if (err.message.startsWith('Access')) throw err;
            throw new Error('Unable to verify access permissions.');
        }
    };

    const signInWithEmail = async (email, password) => {
        await checkAccess(email);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    };

    const signInWithOAuth = async (provider) => {
        // OAuth checks happen post-login or via DB triggers since we don't have email yet
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: `${window.location.origin}/workspace`,
            },
        });
        if (error) throw error;
        return data;
    };

    const signInWithOtp = async (email) => {
        await checkAccess(email);
        const { data, error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/workspace`,
            },
        });
        if (error) throw error;
        return data;
    };

    const signInWithSSO = async (domain) => {
        const { data, error } = await supabase.auth.signInWithSSO({
            domain: domain,
            options: {
                redirectTo: `${window.location.origin}/workspace`,
            },
        });
        if (error) throw error;
        return data;
    };

    const signUpWithEmail = async (email, password, metadata = {}) => {
        await checkAccess(email);
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
        const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
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
