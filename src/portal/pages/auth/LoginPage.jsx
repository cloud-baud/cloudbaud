import { useState } from 'react'
import { supabaseAuth } from '@/shared/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [message, setMessage] = useState('')
  const isDev = import.meta.env.DEV

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabaseAuth.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      })

      if (error) throw error
      setMessage(isDev ? `Check your email for the magic link! It will return to ${window.location.origin}/auth/confirm` : 'Check your email for the magic link!')
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setMessage('')
    try {
      const { error } = await supabaseAuth.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/confirm`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      if (error) throw error
      // Will redirect to Google, no need to setGoogleLoading false
    } catch (err) {
      setMessage(`Error: ${err.message}`)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm p-8 border border-white/10 rounded-2xl bg-white/5">
        <h1 className="text-2xl font-bold">Sign in to CloudBaud.com</h1>
        {isDev && (
          <>
            <p className="text-sm text-white/60">HUB: mvyav... (Auth) • SPOKE: avmf... (Data)</p>
            <p className="text-xs text-white/40">Redirect: {typeof window !== 'undefined' ? `${window.location.origin}/auth/confirm` : ''}</p>
          </>
        )}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jish.nath@cloudbaud.com"
          className="w-full p-3 border border-white/10 rounded-lg bg-black text-white"
        />
        <button
          disabled={loading || googleLoading}
          className="w-full p-3 bg-white text-black rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? (isDev ? 'Sending via HUB...' : 'Sending...') : 'Send Magic Link'}
        </button>

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="mx-3 text-xs text-white/40 uppercase tracking-widest">OR</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Google Provider */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full p-3 bg-white text-black rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-white/90 transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? 'Redirecting...' : 'Continue with Google'}
        </button>

        {message && <p className="text-sm text-white/80 break-words">{message}</p>}
      </form>
    </div>
  )
}
