import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Github, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#010816] text-slate-400 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-white">CloudBaud</span>
            </Link>
            <p className="text-gray-500 leading-relaxed">
              Engineering high-performance, intelligent systems for the modern enterprise. Specialized in architecture, AI engineering, and cloud platforms.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors" aria-label="Website">
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Capabilities Column */}
          <div>
            <h3 className="text-gray-900 font-bold uppercase tracking-widest text-xs mb-6">Capabilities</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link to="/capabilities" className="hover:text-blue-600 transition-colors">
                  Solutions Architecture
                </Link>
              </li>
              <li>
                <Link to="/capabilities" className="hover:text-blue-600 transition-colors">
                  AI Engineering
                </Link>
              </li>
              <li>
                <Link to="/capabilities" className="hover:text-blue-600 transition-colors">
                  Cloud Platforms
                </Link>
              </li>
              <li>
                <Link to="/capabilities" className="hover:text-blue-600 transition-colors">
                  DevOps Automation
                </Link>
              </li>
              <li>
                <Link to="/capabilities" className="hover:text-blue-600 transition-colors">
                  Enterprise Integration
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-gray-900 font-bold uppercase tracking-widest text-xs mb-6">Company</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link to="/about" className="hover:text-blue-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="hover:text-blue-600 transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link to="/industries" className="hover:text-blue-600 transition-colors">
                  Industries
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-blue-600 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-600 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter / Contact Hint */}
          <div>
            <h3 className="text-gray-900 font-bold uppercase tracking-widest text-xs mb-6">Inquiries</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">
              Ready to accelerate your digital transformation?
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
            >
              Consult with an Expert
            </Link>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="border-t border-gray-100 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Link to="/privacy-policy" className="hover:text-gray-600 transition-colors">
              Privacy
            </Link>
            <Link to="/terms-of-use" className="hover:text-gray-600 transition-colors">
              Terms
            </Link>
            <Link to="/accessibility" className="hover:text-gray-600 transition-colors">
              Accessibility
            </Link>
            <Link to="/cookie-preferences" className="hover:text-gray-600 transition-colors">
              Cookies
            </Link>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
            &copy; 2017-2026 CloudBaud LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
