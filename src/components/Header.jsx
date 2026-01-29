import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import ThemeToggle from './ThemeToggle';


import logo from '../assets/images/cloudbaud_logo.png';
import logoIcon from '../assets/images/cloudbaud_icon.png';
// Image import removed


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const services = [
    { name: 'Data Engineering', href: '/capabilities/data-engineering' },
    { name: 'AI Engineering', href: '/ai-engineering' },
    { name: 'Cloud Solutions', href: '/capabilities/cloud-solutions' },
    { name: 'Custom Applications', href: '/capabilities/custom-applications' },
    { name: 'Microsoft Platform', href: '/capabilities/microsoft-platform' },
    { name: 'DevOps & Infrastructure', href: '/capabilities/devops-infrastructure' },
  ];

  return (
    <header
      className="border-b border-[#222] sticky top-0 z-50 h-[70px] flex items-center px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: '#0f0f0f',
        backgroundImage: `
          linear-gradient(90deg, rgba(255,255,255,0.01) 0%, rgba(0,0,0,0) 50%, rgba(255,255,255,0.01) 100%),
          repeating-linear-gradient(90deg, #111 0px, #111 1px, #161616 2px, #111 3px)
        `,
        boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
      }}
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-12 w-auto flex items-center justify-start shrink-0 transition-transform group-hover:scale-105">
              <img
                src={logo}
                alt="CloudBaud"
                className="h-full w-auto object-contain"
                style={{ mixBlendMode: 'screen' }}
              />
            </div>
            <div className="flex flex-col whitespace-nowrap pt-1">
              <span className="text-xl md:text-2xl uppercase tracking-widest text-brand-blue font-bold">Innovative Engineering</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link
              to="/"
              className="text-lg font-semibold uppercase tracking-widest transition-all duration-300 ease-in-out"
              style={{
                fontFamily: "'Segoe UI', sans-serif",
                color: '#00d2ff',
                textShadow: '0 0 8px rgba(0, 210, 255, 0.6)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textShadow = '0 0 15px rgba(0, 210, 255, 1)';
                e.currentTarget.style.filter = 'brightness(1.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textShadow = '0 0 8px rgba(0, 210, 255, 0.6)';
                e.currentTarget.style.filter = 'none';
              }}
            >
              Home
            </Link>

            {/* Capabilities Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <Link
                to="/capabilities"
                className="flex items-center text-lg font-semibold uppercase tracking-widest transition-all duration-300 ease-in-out py-2"
                style={{
                  fontFamily: "'Segoe UI', sans-serif",
                  color: '#00d2ff',
                  textShadow: '0 0 8px rgba(0, 210, 255, 0.6)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textShadow = '0 0 15px rgba(0, 210, 255, 1)';
                  e.currentTarget.style.filter = 'brightness(1.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textShadow = '0 0 8px rgba(0, 210, 255, 0.6)';
                  e.currentTarget.style.filter = 'none';
                }}
              >
                Capabilities
                <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
              </Link>

              {isServicesOpen && (
                <div
                  className="absolute top-full left-0 mt-0 w-64 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 py-3 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  {services.map((service) => (
                    <Link
                      key={service.name}
                      to={service.href}
                      className="block px-6 py-3 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/industries"
              className="text-lg font-semibold uppercase tracking-widest transition-all duration-300 ease-in-out"
              style={{
                fontFamily: "'Segoe UI', sans-serif",
                color: '#00d2ff',
                textShadow: '0 0 8px rgba(0, 210, 255, 0.6)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textShadow = '0 0 15px rgba(0, 210, 255, 1)';
                e.currentTarget.style.filter = 'brightness(1.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textShadow = '0 0 8px rgba(0, 210, 255, 0.6)';
                e.currentTarget.style.filter = 'none';
              }}
            >
              Industries
            </Link>
            <Link
              to="/portfolio"
              className="text-lg font-semibold uppercase tracking-widest transition-all duration-300 ease-in-out"
              style={{
                fontFamily: "'Segoe UI', sans-serif",
                color: '#00d2ff',
                textShadow: '0 0 8px rgba(0, 210, 255, 0.6)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textShadow = '0 0 15px rgba(0, 210, 255, 1)';
                e.currentTarget.style.filter = 'brightness(1.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textShadow = '0 0 8px rgba(0, 210, 255, 0.6)';
                e.currentTarget.style.filter = 'none';
              }}
            >
              Portfolio
            </Link>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Button asChild className="bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg px-6 font-bold shadow-lg shadow-brand-blue/20">
              <Link to="/login">Login</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
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
                <Link
                  to="/"
                  className="text-lg font-medium text-slate-200 border-l-4 border-transparent pl-2 hover:border-white hover:text-white transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>

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

                <Link
                  to="/industries"
                  className="text-lg font-medium text-slate-200 border-l-4 border-transparent pl-2 hover:border-white hover:text-white transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Industries
                </Link>

                <Link
                  to="/portfolio"
                  className="text-lg font-medium text-slate-200 border-l-4 border-transparent pl-2 hover:border-white hover:text-white transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Portfolio
                </Link>
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
      </div >
    </header >
  );
};

export default Header;
