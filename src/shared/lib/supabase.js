import { createClient } from '@supabase/supabase-js'

// HUB = Auth (mvyavz...) - this is source of truth for auth
const HUB_URL = import.meta.env.VITE_SUPABASE_HUB_URL
const HUB_ANON = import.meta.env.VITE_SUPABASE_HUB_ANON_KEY

// SPOKE = Data (avmf...) - site_navigation, industries, etc
const SPOKE_URL = import.meta.env.VITE_SUPABASE_SPOKE_URL
const SPOKE_ANON = import.meta.env.VITE_SUPABASE_SPOKE_ANON_KEY

if (!HUB_URL || !HUB_ANON) {
  console.error('Missing VITE_SUPABASE_HUB_URL / HUB_ANON')
}
if (!SPOKE_URL || !SPOKE_ANON) {
  console.error('Missing VITE_SUPABASE_SPOKE_URL / SPOKE_ANON')
}

// Single lib, two clients, but auth only from HUB
export const supabaseAuth = createClient(HUB_URL, HUB_ANON, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    //flowType: 'pkce', // REQUIRED for magic link with /auth/confirm
    flowType: 'implicit'
  }
})

// Data client - no auth persistence, just data
export const supabaseSpoke = createClient(SPOKE_URL, SPOKE_ANON, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

// Backwards compat if anything still imports { supabase }
export const supabase = supabaseSpoke
export default supabaseAuth