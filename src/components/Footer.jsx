import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold">Cloudbaud</span>
            </div>
            <p className="text-gray-400 text-sm">
              Engineering intelligent systems across architecture, AI, data platforms, 
              full stack, and mobile development.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/services/architecture" className="text-gray-400 hover:text-white transition-colors">
                  Architecture
                </Link>
              </li>
              <li>
                <Link to="/services/ai" className="text-gray-400 hover:text-white transition-colors">
                  AI Solutions
                </Link>
              </li>
              <li>
                <Link to="/services/data-platforms" className="text-gray-400 hover:text-white transition-colors">
                  Data & Platforms
                </Link>
              </li>
              <li>
                <Link to="/services/full-stack" className="text-gray-400 hover:text-white transition-colors">
                  Full Stack Development
                </Link>
              </li>
              <li>
                <Link to="/services/mobile" className="text-gray-400 hover:text-white transition-colors">
                  Mobile Development
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-400 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/case-studies" className="text-gray-400 hover:text-white transition-colors">
                  Case Studies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">hello@cloudbaud.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Cloudbaud. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

