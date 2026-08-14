import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Link } from 'react-router-dom'
import './index.css'
import FinanceApp from './FinanceApp'

console.log('Finance Main: Forced navbars for David handover');

const LeftNav = () => (
  <div className="w-64 shrink-0 border-r border-white/10 bg-black p-4 flex flex-col gap-1 text-sm text-white">
    <div className="bg-cyan-400 text-black rounded-full px-4 py-2 font-bold text-center mb-4">+ Create New</div>
    <div className="text- text-slate-500 mt-2">OVERVIEW</div>
    <Link to="/finance/taxes" className="px-3 py-2 rounded bg-white/10">My Feed</Link>
    <Link to="/finance/taxes" className="px-3 py-2 rounded bg-blue-500/10 text-blue-400">Finance</Link>
  </div>
)

const FilterPane = () => (
  <div className="w-64 shrink-0 border-r border-white/10 bg-zinc-900 p-4 text-sm text-white">
    <h2 className="font-bold">Finance</h2>
    <p className="text-xs text-slate-500 mb-4">Context Menu</p>
    <div className="px-3 py-2 rounded bg-blue-500/10 text-blue-400">Taxes ▾</div>
    <div className="ml-4 mt-1 flex flex-col gap-1 text-xs">
      <Link to="/finance/taxes?year=2024" className="px-3 py-1 rounded hover:bg-white/5">2024</Link>
      <Link to="/finance/taxes?year=2023" className="px-3 py-1 rounded hover:bg-white/5">2023</Link>
      <Link to="/finance/taxes?year=2022" className="px-3 py-1 rounded hover:bg-white/5">2022</Link>
      <Link to="/finance/taxes?year=2021" className="px-3 py-1 rounded hover:bg-white/5">2021</Link>
      <Link to="/finance/taxes?year=2020" className="px-3 py-1 rounded hover:bg-white/5">2020</Link>
    </div>
    <div className="mt-2 px-3 py-2 rounded hover:bg-white/5">Bookkeeping</div>
    <div className="px-3 py-2 rounded hover:bg-white/5">Accounting</div>
  </div>
)

const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <div className="flex h-screen bg-slate-950">
          <LeftNav />
          <FilterPane />
          <main className="flex-1 overflow-auto p-6 bg-white dark:bg-slate-950">
            <FinanceApp />
          </main>
        </div>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)