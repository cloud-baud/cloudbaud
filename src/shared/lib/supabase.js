import { createClient } from '@supabase/supabase-js'

// HUB = Auth (mvyavz...) - this is source of truth for auth
const HUB_URL = import.meta.env.VITE_SUPABASE_HUB_URL || import.meta.env.VITE_SUPABASE_URL || 'https://mvyavzjzdinelcufpzek.supabase.co'
const HUB_ANON = import.meta.env.VITE_SUPABASE_HUB_ANON_KEY || import.meta.env.VITE_SUPABASE_HUB_ANON || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12eWF2emp6ZGluZWxjdWZwemVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDU1ODcsImV4cCI6MjA2OTUyMTU4N30.ooo-nyhz_Tr0TjvLeU3Y8s-OtMDW4K6OiF04i5vAPAw'

// SPOKE = Data (avmf...) - site_navigation, industries, etc
const SPOKE_URL = import.meta.env.VITE_SUPABASE_SPOKE_URL || import.meta.env.VITE_SUPABASE_URL || HUB_URL
const SPOKE_ANON = import.meta.env.VITE_SUPABASE_SPOKE_ANON_KEY || import.meta.env.VITE_SUPABASE_SPOKE_ANON || import.meta.env.VITE_SUPABASE_ANON_KEY || HUB_ANON

if (!HUB_URL || !HUB_ANON) {
  console.warn('Missing VITE_SUPABASE_HUB_URL / HUB_ANON')
}
if (!SPOKE_URL || !SPOKE_ANON) {
  console.warn('Missing VITE_SUPABASE_SPOKE_URL / SPOKE_ANON')
}

// Single lib, two clients, but auth only from HUB
export const supabaseAuth = createClient(HUB_URL || 'https://mvyavzjzdinelcufpzek.supabase.co', HUB_ANON || 'anon-key-placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit'
  }
})

// Data client - no auth persistence, just data
export const supabaseSpoke = createClient(SPOKE_URL || 'https://avmfveeyeuldzfzjfvuv.supabase.co', SPOKE_ANON || HUB_ANON || 'anon-key-placeholder', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

// Backwards compat if anything still imports { supabase }
export const supabase = supabaseSpoke
export default supabaseAuth