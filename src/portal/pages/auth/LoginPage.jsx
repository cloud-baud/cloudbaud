import { useState } from 'react'
import { supabaseAuth } from '@/shared/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // FIX: This makes magic link respect localhost vs prod
      const { error } = await supabaseAuth.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      })

      if (error) throw error
      setMessage(`Check your email for the magic link! It will return to ${window.location.origin}/auth/confirm`)
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm p-8 border border-white/10 rounded-2xl bg-white/5">
        <h1 className="text-2xl font-bold">Sign in to CloudBaud.com</h1>
        <p className="text-sm text-white/60">HUB: mvyav... (Auth) • SPOKE: avmf... (Data)</p>
        <p className="text-xs text-white/40">Redirect: {typeof window !== 'undefined' ? `${window.location.origin}/auth/confirm` : ''}</p>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jish.nath@cloudbaud.com"
          className="w-full p-3 border border-white/10 rounded-lg bg-black text-white"
        />
        <button
          disabled={loading}
          className="w-full p-3 bg-white text-black rounded-lg font-medium disabled:opacity-50"
        >
          {loading? 'Sending via HUB...' : 'Send Magic Link'}
        </button>
        {message && <p className="text-sm text-white/80 break-words">{message}</p>}
      </form>
    </div>
  )
}