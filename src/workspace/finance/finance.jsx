import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Routes, Route, NavLink, Link, useLocation } from 'react-router-dom'
import '@/index.css'
import FinanceApp from './FinanceApp'
import InvitePage from './pages/InvitePage'
import { setViewAs, VIEW_AS_KEY } from './api/taxService'

/**
 * On initial load, check for ?viewAs=<userId> query parameter
 * (injected by the parent app's iframe src) and sync to localStorage.
 * Also listen for postMessage VIEW_AS_CHANGE from the parent app.
 */
const ViewAsSync = () => {
  useEffect(() => {
    // 1. Parse ?viewAs= from URL on initial load
    const params = new URLSearchParams(window.location.search)
    const viewAsParam = params.get('viewAs')
    if (viewAsParam) {
      setViewAs(viewAsParam)
    }
  }, []) // only on mount

  useEffect(() => {
    // 2. Listen for postMessage from the parent iframe host
    const handler = (event) => {
      if (event.data?.type === 'VIEW_AS_CHANGE') {
        const userId = event.data.userId || ''
        setViewAs(userId)
        // Reload the page to re-fetch all data with the new identity
        window.location.reload()
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return null
}

const FinanceNav = () => {
  const location = useLocation()
  const isTaxes = location.pathname.includes('/taxes') || location.pathname === '/finance' || location.pathname === '/'
  return (
    <div className="w-[280px] shrink-0 border-r border-white/10 bg-[#121214] flex flex-col text-sm text-white">
      <div className="p-4 border-b border-white/5">
        <h1 className="font-bold text-[15px] tracking-tight">Finance</h1>
        <p className="text-[11px] text-white/40 mt-0.5">Secure Console • finance.cloudbaud.com</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Taxes */}
        <div>
          <NavLink to="/finance/taxes" className={({isActive}) => `flex items-center justify-between px-3 py-2.5 rounded-md font-medium transition ${isActive || isTaxes ? 'bg-blue-600/20 text-blue-300 border border-blue-500/20' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
            <span>Taxes</span>
            <span className="text-[10px]">▼</span>
          </NavLink>
          <div className="ml-2 mt-2 space-y-0.5 border-l border-white/5 pl-3">
            {[2024,2023,2022,2021,2020].map(y => (
              <NavLink key={y} to={`/finance/taxes?year=${y}`} className={({isActive}) => `block px-3 py-1.5 rounded text-[13px] transition ${isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}>
                {y}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <NavLink to="/finance/bookkeeping" className={({isActive}) => `block px-3 py-2.5 rounded-md transition ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
            Bookkeeping
          </NavLink>
          <NavLink to="/finance/accounting" className={({isActive}) => `block px-3 py-2.5 rounded-md transition ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
            Accounting / COA
          </NavLink>
        </div>

        <div className="pt-4 border-t border-white/5 text-[11px] text-white/30 px-3">
          <p>Invite-only access</p>
          <p className="mt-1">Data: Supabase • Finance Schema</p>
        </div>
      </div>

      <div className="p-3 border-t border-white/5">
        <Link to="/" className="block w-full text-center py-2 rounded bg-white/5 hover:bg-white/10 text-xs text-white/60 transition">← Back to Feed</Link>
      </div>
    </div>
  )
}

const AppLayout = () => {
  const isEmbedded = typeof window !== 'undefined' && (window.self !== window.top || window.location.search.includes('embedded=true'));

  return (
    <div className="flex h-screen bg-[#0b0f19] overflow-hidden">
      {!isEmbedded && <FinanceNav />}
      <main className="flex-1 overflow-auto bg-[#f8fafc] dark:bg-[#0b0f19] relative">
        {/* Fix for ribbon visibility - force light theme toolbar to be readable */}
        <style>{`
          /* Force tax dashboard ribbon to be visible on light bg */
          button, [role="button"] { color: inherit; }
          .bg-white .text-white\\/50, .bg-white .text-white { color: rgb(71 85 105) !important; }
        `}</style>
        <ViewAsSync />
        <FinanceApp />
      </main>
    </div>
  );
};

import { FontSizeProvider } from '@/shared/contexts/FontSizeContext';

const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <HelmetProvider>
      <FontSizeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/invite/:token" element={<InvitePage />} />
            <Route path="/finance/invite/:token" element={<InvitePage />} />
            <Route path="/finance/*" element={<AppLayout />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </BrowserRouter>
      </FontSizeProvider>
    </HelmetProvider>
  </StrictMode>
)

