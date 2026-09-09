import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import ThemeToggle from './ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { supabaseAuth } from '@/shared/lib/supabase';
import { useAuth } from '@/shared/contexts/AuthContext';
import CloudBaudLogo from '../common/CloudBaudLogo';

const Header = () => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [industries, setIndustries] = useState([]);
  const [services, setServices] = useState([
    { name: 'Data Engineering', href: '/capabilities/data-engineering' },
    { name: 'AI Engineering', href: '/ai-engineering' },
    { name: 'App Dev', href: '/capabilities/custom-applications' },
    { name: 'Platforms', href: '/capabilities/devops-infrastructure' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [navRes, indRes] = await Promise.all([
          supabaseAuth.from('site_navigation').select('label, path').eq('is_active', true).order('order_index'),
          supabaseAuth.from('industries').select('name, slug').eq('is_active', true).order('name')
        ]);
        if (navRes.data) {
          const filtered = navRes.data.filter(i => {
            const l=(i.label||'').toLowerCase(); const p=(i.path||'').toLowerCase();
            return !l.includes('methodology') && !l.includes('metholody') && !l.includes('resource') && !p.includes('resource');
          });
          setServices(filtered.map(i=>({name:i.label, href:i.path})));
        }
        if (indRes.data) setIndustries(indRes.data);
      } catch(e){ console.error(e); }
    };
    fetchData();
  }, []);

  const linkStyles = { fontFamily:"'Segoe UI', sans-serif", color:'#fff', textShadow:'0 0 8px rgba(255,255,255,0.3)' };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#222] bg-[#0a0a0a] px-4 sm:px-6 lg:px-8" style={{boxShadow:'0 4px 10px rgba(0,0,0,0.5)'}}>
      {/* 3 equal columns = true center, aligned to max-w-4xl */}
      <div className="mx-auto flex h-[70px] max-w-4xl w-full items-center">
        {/* LEFT - 1fr */}
        <div className="flex flex-1 justify-start">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-9 w-auto flex items-center shrink-0 group-hover:scale-105 transition-transform">
              {user?.user_metadata?.custom_logo_url ? (
                <img src={user.user_metadata.custom_logo_url} alt="CloudBaud" className="h-full w-auto object-contain" style={{maxHeight:'36px'}} />
              ) : <CloudBaudLogo className="h-full w-auto" />}
            </div>
            <span className="font-semibold text-[17px] text-white tracking-tight">CloudBaud</span>
          </Link>
        </div>

        {/* CENTER - 1fr, truly centered */}
        <nav className="hidden flex-1 items-center justify-center gap-3 xl:gap-5 lg:flex">
          {services.map(s=>(
            <Link key={s.name} to={s.href} className="text-[11px] xl:text-[12px] font-semibold uppercase tracking-widest whitespace-nowrap text-white hover:text-cyan-200 transition-colors">{s.name}</Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-[11px] xl:text-[12px] font-semibold uppercase tracking-widest text-white outline-none">
              Industries <ChevronDown className="w-4 h-4 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-900 border-slate-800 text-slate-200 w-56">
              <DropdownMenuItem asChild><Link to="/industries" className="w-full font-bold text-white border-b border-slate-700 mb-2 pb-2">All Industries</Link></DropdownMenuItem>
              {industries.map(ind=>(
                <DropdownMenuItem key={ind.slug} asChild><Link to={`/industries/${ind.slug}`} className="w-full hover:bg-slate-800">{ind.name}</Link></DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* RIGHT - 1fr */}
        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="hidden sm:block"><ThemeToggle /></div>
          <Button asChild className="bg-[#00d1ff] hover:bg-[#00b8e6] text-black font-bold rounded-full px-5 h-8 text-[13px]">
            <Link to={user ? "/workspace" : "/login"}>{user ? "Go to App" : "Login"}</Link>
          </Button>
          <button className="lg:hidden p-2 text-slate-300" onClick={()=>setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#0f0f0f] py-6">
          <div className="mx-auto max-w-4xl flex flex-col gap-3">
            {services.map(s=>(
              <Link key={s.name} to={s.href} className="py-2 text-slate-300" onClick={()=>setIsMenuOpen(false)}>{s.name}</Link>
            ))}
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center"><span className="text-xs uppercase text-slate-500">Appearance</span><ThemeToggle/></div>
          </div>
        </div>
      )}
    </header>
  );
};
export default Header;
