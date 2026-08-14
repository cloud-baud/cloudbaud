import { createContext, useContext, useEffect, useState } from 'react'
import { supabaseAuth } from '@/shared/lib/supabase' // if you also moved lib to shared, change to '@/shared/lib/supabase'

const AuthContext = createContext({})
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabaseAuth.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user?? null)
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const signInWithOtp = async (email) => {
    const { data, error } = await supabaseAuth.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      }
    })
    return { data, error }
  }

  const signUpWithEmail = async (email, password, metadata = {}) => {
    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: metadata
      }
    })
    if (error) throw error
    return data
  }

  const signInWithPassword = async (email, password) => {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabaseAuth.auth.signOut()
    if (!error) { setUser(null); setSession(null) }
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithOtp, signUpWithEmail, signInWithPassword, signOut, supabaseAuth }}>
      {children}
    </AuthContext.Provider>
  )
}