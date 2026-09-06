import { createContext, useContext, useEffect, useState } from 'react'
import { supabaseAuth } from '@/shared/lib/supabase'

const AuthContext = createContext({})
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// This fake user is why your site opens without login in dev.
// It's intentional - you said you like auto-login for dev speed.
const DEV_USER = {
  id: '0c04376e-2bdf-4d6e-9d59-f21feac9b8a4',
  email: 'jish.nath@cloudbaud.com',
  user_metadata: { full_name: 'Jishnu Nath' },
  role: 'authenticated'
}

// NEW: We use localStorage to remember that user clicked Sign Out.
// Without this, dev auto-login would instantly log you back in.
const SIGNED_OUT_KEY = 'cb_has_signed_out'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  // NEW HELPER: Only allow DEV_USER if we're in DEV AND user hasn't signed out.
  // Why: Fixes Sign Out doing nothing in dev mode.
  const isDevAutoLoginAllowed = () => {
    return import.meta.env.DEV && localStorage.getItem(SIGNED_OUT_KEY) !== '1'
  }

  useEffect(() => {
    supabaseAuth.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      // CHANGED: was `session?.user || (DEV ? DEV_USER : null)`
      // Now checks flag so Sign Out sticks
      setUser(session?.user || (isDevAutoLoginAllowed() ? DEV_USER : null))
      setLoading(false)
    })
    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        // NEW: If real Supabase login happens, clear the flag
        // Why: So next dev reload auto-login works again after a real login
        if (session?.user) localStorage.removeItem(SIGNED_OUT_KEY)
        setUser(session?.user || (isDevAutoLoginAllowed() ? DEV_USER : null))
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  // NEW: Helper to clear flag on any sign-in attempt
  const clearDevFlag = () => localStorage.removeItem(SIGNED_OUT_KEY)

  const signInWithOtp = async (email) => {
    clearDevFlag() // Why: User wants to log back in, so allow dev auto-login future
    const { data, error } = await supabaseAuth.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` }
    })
    return { data, error }
  }

  const signUpWithEmail = async (email, password, metadata = {}) => {
    clearDevFlag()
    const { data, error } = await supabaseAuth.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm`, data: metadata }
    })
    if (error) throw error
    return data
  }

  const signInWithPassword = async (email, password) => {
    clearDevFlag()
    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabaseAuth.auth.signOut()
    // NEW: These 3 lines are the core fix for Sign Out
    // Why 1: Remember that user intentionally signed out
    localStorage.setItem(SIGNED_OUT_KEY, '1')
    // Why 2: Immediately clear React state so UI updates
    setUser(null)
    setSession(null)
    // Why 3: Force redirect to /login, otherwise ProtectedRoute in DEV would keep you on /collaboration with no user
    window.location.href = '/login'
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithOtp, signUpWithEmail, signInWithPassword, signOut, supabaseAuth }}>
      {children}
    </AuthContext.Provider>
  )
}