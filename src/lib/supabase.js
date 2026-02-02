import { createClient } from '@supabase/supabase-js';

// Configuration for Production Database
const prodUrl = import.meta.env.VITE_SUPABASE_URL_PROD || import.meta.env.VITE_SUPABASE_URL;
const prodKey = import.meta.env.VITE_SUPABASE_ANON_KEY_PROD || import.meta.env.VITE_SUPABASE_ANON_KEY;

// Configuration for Test/Dev Database
const testUrl = import.meta.env.VITE_SUPABASE_URL_TEST || import.meta.env.VITE_SUPABASE_URL; // Fallback to same if not defined
const testKey = import.meta.env.VITE_SUPABASE_ANON_KEY_TEST || import.meta.env.VITE_SUPABASE_ANON_KEY;

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Determine active config based on environment
// Localhost -> Test DB
// Production -> Prod DB
const activeUrl = isLocalhost ? testUrl : prodUrl;
const activeKey = isLocalhost ? testKey : prodKey;

if (!activeUrl || !activeKey) {
    console.warn('Supabase URL or Key missing in environment variables');
}

// The default client (used by 99% of the app)
export const supabase = createClient(activeUrl, activeKey);

// Admin-only clients (Lazy initialized or just exported if needed for specific operations)
// We export factories to avoid initializing connections we don't need
export const getProdClient = () => createClient(prodUrl, prodKey);
export const getTestClient = () => createClient(testUrl, testKey);

export const envInfo = {
    isLocalhost,
    mode: isLocalhost ? 'development' : 'production',
    activeDatabase: isLocalhost ? 'TEST' : 'PROD',
    activeUrl: activeUrl
};
