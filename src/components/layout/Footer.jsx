import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ChevronDown, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  const footerSections = [
    { title: 'Platforms', links: [ { label: 'Cloud Infrastructure', to: '/platforms/cloud' }, { label: 'Edge Computing', to: '/platforms/edge' }, { label: 'Hybrid Mesh', to: '/platforms/hybrid' }, { label: 'Serverless SDK', to: '/platforms/serverless' }, { label: 'Data Fabric', to: '/platforms/data' }, ] },
    { title: 'Topics & Engineering', links: [ { label: 'AI Engineering Services', to: '/ai-engineering' }, { label: 'System Architecture', to: '/engineering/architecture' }, { label: 'DevOps & CI/CD', to: '/engineering/devops' }, { label: 'Cybersecurity', to: '/engineering/security' }, { label: 'Performance', to: '/engineering/performance' }, { label: 'Scalability', to: '/engineering/scalability' }, { label: 'Microservices', to: '/engineering/microservices' }, ] },
    { title: 'Resources', links: [ { label: 'Documentation', to: '/docs' }, { label: 'Whitepapers', to: '/whitepapers' }, { label: 'Case Studies', to: '/case-studies' }, { label: 'API Reference', to: '/api' }, { label: 'Community', to: '/community' }, { label: 'Events', to: '/events' }, ] },
    { title: 'Support', links: [ { label: 'Help Center', to: '/support' }, { label: 'Contact Us', to: '/contact' }, { label: 'System Status', to: '/status' }, { label: 'Professional Services', to: '/services' }, ] },
    { title: 'Account', links: [ { label: 'CloudBaud Console', to: '/console' }, { label: 'Billing', to: '/billing' }, { label: 'Developer ID', to: '/dev-id' }, ] },
    { title: 'Company', links: [ { label: 'About Us', to: '/about' }, { label: 'Portfolio', to: '/portfolio' }, { label: 'Careers', to: '/careers' }, { label: 'Newsroom', to: '/news' }, { label: 'Ethics', to: '/ethics' }, ] },
  ];

  return (
    <footer className="w-full bg-[#0a0a0a] border-t border-[#222] pt-12 pb-8 px-4 font-sans">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col space-y-3">
              <h3 className="text-[12px] font-semibold text-[#86868b] leading-[1.3] mb-1">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-[12px] text-[#a1a1a6] hover:text-white hover:underline leading-[1.33]">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-b border-[#222] pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-[11px] text-[#86868b]">Built for scale, engineered for compliance.</div>
          <div className="flex items-center gap-4">
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-[#86868b] hover:text-white"><Linkedin className="w-4 h-4" /></a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-[#86868b] hover:text-white"><Github className="w-4 h-4" /></a>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-1">
          <div className="flex flex-wrap items-center gap-y-2 text-[12px] text-[#86868b]">
            <span className="mr-4">Copyright © 2026 CloudBaud Inc. All rights reserved.</span>
            <div className="flex divide-x divide-[#333]">
              <Link to="/privacy-policy" className="px-2 first:pl-0 hover:underline">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="px-2 hover:underline">Terms of Use</Link>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-[12px] text-[#a1a1a6] cursor-pointer">
            <span className="font-medium">United States</span><Globe className="w-3 h-3" /><ChevronDown className="w-3 h-3" />
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
