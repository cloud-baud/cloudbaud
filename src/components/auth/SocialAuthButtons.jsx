import { useState } from 'react'
import { supabase as hubClient } from '../../shared/lib/supabase.js'

// Synolic CMDB paywall — billing_features.whatsapp_login
// Set VITE_ENABLE_WHATSAPP=true for Pro apps, false for free
const WHATSAPP_ENABLED = (import.meta.env.VITE_ENABLE_WHATSAPP || 'false') === 'true'

export default function SocialAuthButtons({ appName = 'cloudbaud.com' }) {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('+91')
  const [loading, setLoading] = useState('')

  const handleGoogle = async () => {
    setLoading('google')
    const { error } = await hubClient.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: { app: appName }
      }
    })
    if (error) alert(error.message)
    setLoading('')
  }

  const handleFacebook = async () => {
    setLoading('facebook')
    const { error } = await hubClient.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
    if (error) alert(error.message)
    setLoading('')
  }

  const handleMagicLink = async () => {
    if (!email) return alert('Enter email')
    setLoading('magic')
    const { error } = await hubClient.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { app: appName } }
    })
    setLoading('')
    if (error) alert(error.message)
    else alert(`Magic link sent to ${email} — FREE, check inbox`)
  }

  const handleWhatsApp = async () => {
    if (!WHATSAPP_ENABLED) {
      alert('WhatsApp login is Pro feature 🔒 — upgrade in Synolic CMDB. Using magic link fallback for now.')
      return
    }
    if (!phone || phone.length < 10) return alert('Enter full phone +91...')
    setLoading('whatsapp')
    // This triggers Supabase Auth SMS Hook -> Edge Function send-otp-via-sent -> sent.dm API -> Meta Cloud = $0.02
    // Edge function: supabase/functions/send-otp-via-sent/index.ts
    const { error, data } = await hubClient.auth.signInWithOtp({
      phone,
      options: { channel: 'whatsapp', data: { app: appName, provider: 'sent.dm' } }
    })
    setLoading('')
    if (error) alert(error.message)
    else alert(`WhatsApp OTP sent to ${phone} via sent.dm ($0.02) — 85% conversion`)
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      {/* 1. Gmail — FREE — 100% conversion for US */}
      <button 
        onClick={handleGoogle} 
        disabled={!!loading}
        className="w-full py-2.5 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
      >
        {loading === 'google' ? '...' : 'Continue with Gmail (FREE)'}
      </button>

      {/* 2. Magic Link — FREE — fallback */}
      <div className="flex gap-2">
        <input 
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
          placeholder="you@company.com" 
          className="flex-1 px-3 py-2 border rounded-lg"
        />
        <button onClick={handleMagicLink} disabled={!!loading} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
          {loading === 'magic' ? '...' : 'Magic Link'}
        </button>
      </div>

      {/* 3. Facebook — FREE — for legalbench.in etc */}
      <button 
        onClick={handleFacebook} 
        disabled={!!loading}
        className="w-full py-2.5 px-4 bg-[#1877F2] text-white rounded-lg hover:bg-[#166fe5] font-medium"
      >
        {loading === 'facebook' ? '...' : 'Continue with Facebook (FREE)'}
      </button>

      {/* 4. WhatsApp — PAYWALLED via sent.dm — $0.02 vs Twilio $0.045 */}
      <div className="flex gap-2">
        <input 
          value={phone} 
          onChange={e=>setPhone(e.target.value)} 
          placeholder="+91 98765 43210" 
          className="flex-1 px-3 py-2 border rounded-lg"
        />
        <button 
          onClick={handleWhatsApp} 
          disabled={!!loading}
          className={`px-4 py-2 rounded-lg font-medium text-white ${WHATSAPP_ENABLED ? 'bg-[#25D366] hover:bg-[#128C7E]' : 'bg-gray-400 cursor-not-allowed'}`}
          title={WHATSAPP_ENABLED ? 'Sent via sent.dm — $0.02' : 'Pro feature — enable in billing_features table'}
        >
          {loading === 'whatsapp' ? '...' : WHATSAPP_ENABLED ? 'WhatsApp OTP ($0.02)' : 'WhatsApp 🔒 Pro'}
        </button>
      </div>

      {!WHATSAPP_ENABLED && (
        <p className="text-[11px] text-gray-500 text-center">
          WhatsApp paywalled — Synolic CMDB: billing_features.whatsapp_login = false for free tier.<br/>
          Cost: Twilio $0.045 → sent.dm direct Meta Cloud $0.02. Conversion: email 20% → WhatsApp 85%
        </p>
      )}
    </div>
  )
}
