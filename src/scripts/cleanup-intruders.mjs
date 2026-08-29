import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../../.env') })

const url = process.env.SUPABASE_URL 
  || process.env.VITE_SUPABASE_URL 
  || process.env.VITE_SUPABASE_HUB_URL
  || process.env.vitesupabasehuburl

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY 
  || process.env.VITE_SUPABASE_HUB_SECRET_KEY
  || process.env.vitesupabasehubsecretkey

console.log('Loaded:', { url: !!url, serviceKey: !!serviceKey })

if (!url || !serviceKey) {
  console.log('Supabase vars:', Object.keys(process.env).filter(k => k.toLowerCase().includes('supabase')))
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

console.log('Connecting to:', url)
console.log('Reading public.allowed_access (email_pattern)...')

const { data: allowlist, error: allowError } = await supabase
  .from('allowed_access')
  .select('email_pattern, is_active, description')
  .eq('is_active', true)

if (allowError) {
  console.error('Error reading allowed_access:', allowError)
  process.exit(1)
}

console.log(`Active patterns: ${allowlist.length}`)
allowlist.forEach(r => console.log(` - ${r.email_pattern} (${r.description || ''})`))

function matchesPattern(email, pattern) {
  const e = email.toLowerCase().trim()
  const p = pattern.toLowerCase().trim()
  if (!p) return false
  // wildcard support: *@domain.com or *@*.com
  if (p.includes('*')) {
    const regex = '^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*').replace(/\*/g, '.*') + '$'
    return new RegExp(regex).test(e)
  }
  // @domain.com pattern
  if (p.startsWith('@')) {
    return e.endsWith(p)
  }
  // exact email
  return e === p
}

function isAllowed(email) {
  return allowlist.some(row => matchesPattern(email, row.email_pattern))
}

const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

if (usersError) {
  console.error('listUsers error:', usersError)
  process.exit(1)
}

const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000)
const recent = users.filter(u => new Date(u.created_at) > sevenDaysAgo)

console.log(`Total users: ${users.length}, Recent 7d: ${recent.length}`)

const intruders = recent.filter(u => {
  const email = u.email
  if (!email) return false
  return !isAllowed(email)
})

console.log(`Found ${intruders.length} intruders to delete:`)
intruders.forEach(u => console.log(` - ${u.email} | ${u.created_at} | ${u.id}`))

if (intruders.length === 0) {
  console.log('No intruders - done')
  process.exit(0)
}

console.log('Deleting...')
for (const u of intruders) {
  console.log(`Deleting ${u.email}...`)
  const { error } = await supabase.auth.admin.deleteUser(u.id)
  if (error) console.error(`  FAILED: ${error.message}`)
  else console.log(`  DELETED`)
}

console.log('Cleanup complete - now disable signups in Dashboard -> Auth -> Configuration')