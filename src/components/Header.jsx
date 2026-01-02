import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const services = [
    { name: 'Database Development', href: '/capabilities' },
    { name: 'AI Engineering', href: '/capabilities' },
    { name: 'Cloud Solutions', href: '/capabilities' },
    { name: 'Microsoft Platform', href: '/capabilities' },
    { name: 'DevOps & Infrastructure', href: '/capabilities' },
    { name: 'Solutions Architecture', href: '/capabilities' },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white font-black text-xl">C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 leading-tight">CloudBaud</span>
              <span className="text-[10px] uppercase tracking-widest text-blue-600 font-bold">Innovation Engineering</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Home
            </Link>

            {/* Capabilities Dropdown */}
            <div className="relative group">
              <button
                className="flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors py-2"
                onMouseEnter={() => setIsServicesOpen(true)}
                onMouseLeave={() => setIsServicesOpen(false)}
              >
                Capabilities
                <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
              </button>

              {isServicesOpen && (
                <div
                  className="absolute top-full left-0 mt-0 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 animate-in fade-in slide-in-from-top-2 duration-200"
                  onMouseEnter={() => setIsServicesOpen(true)}
                  onMouseLeave={() => setIsServicesOpen(false)}
                >
                  {services.map((service) => (
                    <Link
                      key={service.name}
                      to={service.href}
                      className="block px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/industries" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Industries
            </Link>
            <Link to="/portfolio" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Portfolio
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              About
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 font-bold shadow-lg shadow-blue-100">
              <Link to="/contact">Get Started</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-gray-100 bg-white">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-lg font-medium text-gray-900 border-l-4 border-transparent pl-2 hover:border-blue-600 hover:text-blue-600 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>

              {/* Capabilities Section */}
              <div className="pt-2">
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-4 px-2 font-bold">Capabilities</div>
                <div className="grid grid-cols-1 gap-2">
                  {services.map((service) => (
                    <Link
                      key={service.name}
                      to={service.href}
                      className="block pl-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                to="/industries"
                className="text-lg font-medium text-gray-900 border-l-4 border-transparent pl-2 hover:border-blue-600 hover:text-blue-600 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Industries
              </Link>

              <Link
                to="/portfolio"
                className="text-lg font-medium text-gray-900 border-l-4 border-transparent pl-2 hover:border-blue-600 hover:text-blue-600 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Portfolio
              </Link>
              <Link
                to="/about"
                className="text-lg font-medium text-gray-900 border-l-4 border-transparent pl-2 hover:border-blue-600 hover:text-blue-600 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-lg font-medium text-gray-900 border-l-4 border-transparent pl-2 hover:border-blue-600 hover:text-blue-600 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              <div className="pt-4">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold py-6">
                  <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
