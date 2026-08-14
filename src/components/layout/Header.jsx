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
    // Parallel fetch for Navigation and Industries
    const fetchData = async () => {
      try {
        const [navRes, indRes] = await Promise.all([
          supabaseAuth.from('site_navigation')
            .select('label, path')
            .eq('is_active', true)
            .order('order_index'),
          supabaseAuth.from('industries')
            .select('name, slug')
            .eq('is_active', true)
            .order('name')
        ]);

        if (navRes.data) {
          const filteredNav = navRes.data.filter((item) => {
            const label = (item.label || '').toLowerCase();
            const path = (item.path || '').toLowerCase();

            // Remove Methodology/Metholody and Resource links from homepage nav.
            return !label.includes('methodology') && !label.includes('metholody') && !label.includes('resource') && !path.includes('resource');
          });

          setServices(filteredNav.map(item => ({ name: item.label, href: item.path })));
        }
        
        if (indRes.data) {
          setIndustries(indRes.data);
        }
      } catch (error) {
        console.error('Error fetching header data:', error);
      }
    };

    fetchData();
  }, []);

  const linkStyles = {
    fontFamily: "'Segoe UI', sans-serif",
    color: '#ffffff',
    textShadow: '0 0 8px rgba(255, 255, 255, 0.3)'
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.textShadow = '0 0 15px rgba(255, 255, 255, 0.8)';
    e.currentTarget.style.filter = 'brightness(1.2)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.textShadow = '0 0 8px rgba(255, 255, 255, 0.3)';
    e.currentTarget.style.filter = 'none';
  };

  return (
    <header
      className="border-b border-[#222] sticky top-0 z-50 h-[70px] flex items-center px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: '#0a0a0a',
        boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
      }}
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-12 w-auto flex items-center justify-start shrink-0 transition-transform group-hover:scale-105">
              {user?.user_metadata?.custom_logo_url ? (
                <img
                  src={user.user_metadata.custom_logo_url}
                  alt="CloudBaud"
                  className="h-full w-auto object-contain"
                  style={{ maxHeight: '48px' }}
                />
              ) : (
                <CloudBaudLogo className="h-full w-auto" />
              )}
            </div>
            <span className="tracking-tight font-semibold text-lg hover:opacity-90 transition-opacity text-white">
              {user?.user_metadata?.site_name || "CloudBaud"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {services.map((service) => (
              <Link
                key={service.name}
                to={service.href}
                className="text-[11px] xl:text-sm font-semibold uppercase tracking-widest transition-all duration-300 ease-in-out whitespace-nowrap"
                style={linkStyles}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {service.name}
              </Link>
            ))}

            {/* Industries Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none flex items-center gap-1 text-[11px] xl:text-sm font-semibold uppercase tracking-widest transition-all duration-300 ease-in-out whitespace-nowrap cursor-pointer"
                style={linkStyles}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                Industries <ChevronDown className="w-4 h-4 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-900 border-slate-800 text-slate-200 w-56">
                <DropdownMenuItem asChild>
                   <Link to="/industries" className="w-full cursor-pointer font-bold text-white mb-2 pb-2 border-b border-slate-700">All Industries</Link>
                </DropdownMenuItem>
                {industries.map((ind) => (
                  <DropdownMenuItem key={ind.slug} asChild>
                    <Link to={`/industries/${ind.slug}`} className="w-full cursor-pointer hover:bg-slate-800 focus:bg-slate-800">
                      {ind.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            {user ? (
               <Button asChild className="hidden sm:flex bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg px-4 lg:px-6 font-bold shadow-lg shadow-brand-blue/20 h-10">
                 <Link to="/workspace">Go to App</Link>
               </Button>
            ) : (
                <Button asChild className="hidden sm:flex bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg px-4 lg:px-6 font-bold shadow-lg shadow-brand-blue/20 h-10">
                  <Link to="/login">Login</Link>
                </Button>
            )}

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-slate-300 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {
          isMenuOpen && (
            <div className="md:hidden py-6 border-t border-slate-700 bg-slate-950"
              style={{
                backgroundColor: '#0f0f0f',
                backgroundImage: `
                  url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"),
                  repeating-linear-gradient(
                    90deg,
                    rgba(255, 255, 255, 0.01) 0px,
                    rgba(255, 255, 255, 0.01) 1px,
                    transparent 1px,
                    transparent 2px
                  ),
                  linear-gradient(90deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)
                `,
                backgroundBlendMode: 'overlay',
                opacity: 0.95,
              }}
            >
              <div className="flex flex-col space-y-4">
                {/* Capabilities Section */}
                <div className="pt-2">
                  <Link
                    to="/capabilities"
                    className="block text-slate-400 text-xs uppercase tracking-wider mb-4 px-2 font-bold hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Capabilities
                  </Link>
                  <div className="grid grid-cols-1 gap-2">
                    {services.map((service) => (
                      <Link
                        key={service.name}
                        to={service.href}
                        className="block pl-4 py-2 text-slate-300 hover:text-white transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {service.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Industries Section */}
                <div className="pt-2">
                  <Link
                    to="/industries"
                    className="block text-slate-400 text-xs uppercase tracking-wider mb-4 px-2 font-bold hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Industries
                  </Link>
                  <div className="grid grid-cols-1 gap-2">
                    {industries.map((ind) => (
                      <Link
                        key={ind.slug}
                        to={`/industries/${ind.slug}`}
                        className="block pl-4 py-2 text-slate-300 hover:text-white transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {ind.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Industries merged into array above */}


                <Link
                  to="/contact"
                  className="text-lg font-medium text-slate-200 border-l-4 border-transparent pl-2 hover:border-white hover:text-white transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>

                <div className="pt-4 flex items-center justify-between border-t border-slate-700">
                  <span className="text-sm font-medium text-slate-400 uppercase tracking-widest pl-2">Appearance</span>
                  <ThemeToggle />
                </div>

                <div className="pt-2">
                  <Button asChild className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg font-bold py-6">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </header>
  );
};

export default Header;




