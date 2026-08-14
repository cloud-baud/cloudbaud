import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, checkAllowedAccess } from '../lib/supabase'; // from src/contexts -> src/lib/supabase.js

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const allowed = await checkAllowedAccess(session.user.email);
          if (!allowed) {
            await supabase.auth.signOut();
            setUser(null);
          } else {
            setUser(session.user);
          }
        } catch (e) {
          console.error('[Auth] initial check failed', e);
          // Don't lock out if table missing - keep session
          setUser(session.user);
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithOtp = async (email) => {
    const clean = email.trim().toLowerCase();
    if (!clean) throw new Error('Email required');

    // 1. Check allow list FIRST - this fixes your "Access Restricted" bug
    // handles @cloudbaud.com and %@cloudbaud.com
    const allowed = await checkAllowedAccess(clean);
    if (!allowed) {
      throw new Error('Access Restricted: Your email is not on the allowed list.');
    }

    // 2. Send OTP
    const { error } = await supabase.auth.signInWithOtp({
      email: clean,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithOtp, signOut, checkAllowedAccess }}>
      {children}
    </AuthContext.Provider>
  );
}
