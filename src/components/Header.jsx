import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isAgentsOpen, setIsAgentsOpen] = useState(false);

  const services = [
    { name: 'Architecture', href: '/services' },
    { name: 'AI Solutions', href: '/services' },
    { name: 'Data & Platforms', href: '/services' },
    { name: 'Full Stack Development', href: '/services' },
    { name: 'Mobile Development', href: '/services' },
  ];

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-white">Cloudbaud</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-blue-400 transition-colors">
              Home
            </Link>

            {/* AI Agents Dropdown */}
            <div className="relative group">
              <button
                className="flex items-center text-gray-300 hover:text-blue-400 transition-colors"
                onMouseEnter={() => setIsAgentsOpen(true)}
                onMouseLeave={() => setIsAgentsOpen(false)}
              >
                AI Agents
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>

              {isAgentsOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-lg border border-slate-700 py-2"
                  onMouseEnter={() => setIsAgentsOpen(true)}
                  onMouseLeave={() => setIsAgentsOpen(false)}
                >
                  <Link
                    to="/agents"
                    className="block px-4 py-2 text-gray-300 hover:bg-slate-700 hover:text-blue-400 transition-colors"
                  >
                    All Agents
                  </Link>
                  <Link
                    to="/agents/copywriter"
                    className="block px-4 py-2 text-gray-300 hover:bg-slate-700 hover:text-blue-400 transition-colors"
                  >
                    Copywriter Agent
                  </Link>
                  <Link
                    to="/agents/crm"
                    className="block px-4 py-2 text-gray-300 hover:bg-slate-700 hover:text-blue-400 transition-colors"
                  >
                    CRM Agent
                  </Link>
                  <Link
                    to="/agents/sales"
                    className="block px-4 py-2 text-gray-300 hover:bg-slate-700 hover:text-blue-400 transition-colors"
                  >
                    Sales Agent
                  </Link>
                </div>
              )}
            </div>

            {/* Services Dropdown */}
            <div className="relative group">
              <button
                className="flex items-center text-gray-300 hover:text-blue-400 transition-colors"
                onMouseEnter={() => setIsServicesOpen(true)}
                onMouseLeave={() => setIsServicesOpen(false)}
              >
                Services
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>

              {isServicesOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-lg border border-slate-700 py-2"
                  onMouseEnter={() => setIsServicesOpen(true)}
                  onMouseLeave={() => setIsServicesOpen(false)}
                >
                  {services.map((service) => (
                    <Link
                      key={service.name}
                      to={service.href}
                      className="block px-4 py-2 text-gray-300 hover:bg-slate-700 hover:text-blue-400 transition-colors"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/capabilities" className="text-gray-300 hover:text-blue-400 transition-colors">
              Capabilities
            </Link>
            <Link to="/portfolio" className="text-gray-300 hover:text-blue-400 transition-colors">
              Portfolio
            </Link>
            <Link to="/blog" className="text-gray-300 hover:text-blue-400 transition-colors">
              Blog
            </Link>
            <Link to="/about" className="text-gray-300 hover:text-blue-400 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-blue-400 transition-colors">
              Contact
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Link to="/contact">Get Started</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-300 hover:text-blue-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>

              {/* Mobile Services */}
              <div className="space-y-2">
                <span className="text-white font-medium">Services</span>
                {services.map((service) => (
                  <Link
                    key={service.name}
                    to={service.href}
                    className="block pl-4 text-gray-300 hover:text-blue-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {service.name}
                  </Link>
                ))}
              </div>

              <Link
                to="/capabilities"
                className="text-gray-300 hover:text-blue-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Capabilities
              </Link>
              <Link
                to="/portfolio"
                className="text-gray-300 hover:text-blue-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Portfolio
              </Link>
              <Link
                to="/blog"
                className="text-gray-300 hover:text-blue-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                to="/about"
                className="text-gray-300 hover:text-blue-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-300 hover:text-blue-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              <Button asChild className="w-fit bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

