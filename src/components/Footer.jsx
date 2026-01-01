import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Github, Apple } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              CloudBaud
            </h3>
            <p className="text-gray-400 mb-4">
              Engineering Intelligent Systems
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* AI Agents */}
          <div>
            <h4 className="font-semibold mb-4">AI Agents</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/agents/copywriter" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Copywriter Agent
                </Link>
              </li>
              <li>
                <Link to="/agents/crm" className="text-gray-400 hover:text-blue-400 transition-colors">
                  CRM Agent
                </Link>
              </li>
              <li>
                <Link to="/agents/sales" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Sales Agent
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/services" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Database Development
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-blue-400 transition-colors">
                  AI Engineering
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Custom Applications
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Cloud Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Portfolio
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* CloudBaud Insights App */}
        <div className="border-t border-slate-800 pt-8 pb-8">
          <div className="text-center mb-6">
            <h4 className="font-semibold mb-2">CloudBaud Insights</h4>
            <p className="text-gray-400 text-sm mb-4">
              Get our latest thinking on your iPhone, iPad, or Android device.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* App Store Button */}
              <a
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                aria-label="Download on the App Store"
              >
                <Apple className="h-6 w-6" />
                <div className="text-left">
                  <div className="text-xs text-gray-400">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </a>

              {/* Google Play Button */}
              <a
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                aria-label="Download Android app on Google Play"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs text-gray-400">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="border-t border-slate-800 pt-6 pb-6">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
            <Link to="/contact" className="text-gray-400 hover:text-blue-400 transition-colors">
              FAQ
            </Link>
            <span className="text-gray-600">|</span>
            <Link to="/privacy-policy" className="text-gray-400 hover:text-blue-400 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gray-600">|</span>
            <Link to="/privacy-choices" className="text-gray-400 hover:text-blue-400 transition-colors">
              Your Privacy Choices
            </Link>
            <span className="text-gray-600">|</span>
            <Link to="/cookie-preferences" className="text-gray-400 hover:text-blue-400 transition-colors">
              Cookie Preferences
            </Link>
            <span className="text-gray-600">|</span>
            <Link to="/terms-of-use" className="text-gray-400 hover:text-blue-400 transition-colors">
              Terms of Use
            </Link>
            <span className="text-gray-600">|</span>
            <Link to="/language" className="text-gray-400 hover:text-blue-400 transition-colors">
              Local Language Information
            </Link>
            <span className="text-gray-600">|</span>
            <Link to="/accessibility" className="text-gray-400 hover:text-blue-400 transition-colors">
              Accessibility Statement
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 pt-6">
          <p className="text-center text-gray-400 text-sm">
            &copy; 2017-2026 CloudBaud
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
