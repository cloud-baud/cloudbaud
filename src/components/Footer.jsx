import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Globe, ChevronDown, Smartphone } from 'lucide-react';

const Footer = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const footerSections = [
    {
      title: 'Platforms',
      links: [
        { label: 'Cloud Infrastructure', to: '/platforms/cloud' },
        { label: 'Edge Computing', to: '/platforms/edge' },
        { label: 'Hybrid Mesh', to: '/platforms/hybrid' },
        { label: 'Serverless SDK', to: '/platforms/serverless' },
        { label: 'Data Fabric', to: '/platforms/data' },
      ],
    },
    {
      title: 'Topics & Engineering',
      links: [
        { label: 'Generative AI', to: '/engineering/ai' },
        { label: 'System Architecture', to: '/engineering/architecture' },
        { label: 'DevOps & CI/CD', to: '/engineering/devops' },
        { label: 'Cybersecurity', to: '/engineering/security' },
        { label: 'Performance', to: '/engineering/performance' },
        { label: 'Scalability', to: '/engineering/scalability' },
        { label: 'Microservices', to: '/engineering/microservices' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', to: '/docs' },
        { label: 'Whitepapers', to: '/whitepapers' },
        { label: 'Case Studies', to: '/case-studies' },
        { label: 'API Reference', to: '/api' },
        { label: 'Community', to: '/community' },
        { label: 'Events', to: '/events' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', to: '/support' },
        { label: 'Contact Us', to: '/contact' },
        { label: 'System Status', to: '/status' },
        { label: 'Professional Services', to: '/services' },
      ],
    },
    {
      title: 'Account',
      links: [
        { label: 'CloudBaud Console', to: '/console' },
        { label: 'Billing', to: '/billing' },
        { label: 'Developer ID', to: '/dev-id' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', to: '/about' },
        { label: 'Portfolio', to: '/portfolio' },
        { label: 'Careers', to: '/careers' },
        { label: 'Newsroom', to: '/news' },
        { label: 'Ethics', to: '/ethics' },
      ],
    },
  ];

  if (!mounted) return null;

  return (
    <footer className="bg-[#f5f5f7] dark:bg-[#010816] text-[#1d1d1f] dark:text-[#f5f5f7] border-t border-slate-200 dark:border-slate-800 transition-colors pt-12 pb-8 px-4 font-sans tracking-tight">
      <div className="max-w-[1024px] mx-auto">
        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col space-y-3">
              <h3 className="text-[12px] font-semibold text-[#6e6e73] dark:text-[#86868b] leading-[1.3] mb-1">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[12px] text-[#424245] dark:text-[#d2d2d7] hover:underline leading-[1.33]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Call to action & Theme row */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2 text-[12px] text-[#6e6e73] dark:text-[#86868b]">
            <Smartphone className="w-4 h-4" />
            <span>Get the <Link to="/app" className="text-blue-600 hover:underline">CloudBaud Console app</Link>.</span>
          </div>

          {/* Theme Segmented Control */}
          <div className="flex bg-[#e8e8ed] dark:bg-[#1d1d1f] rounded-full p-[2px] w-fit shadow-inner">
            {['light', 'dark', 'system'].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-4 py-1 text-[11px] font-medium rounded-full transition-all ${(t === 'system' ? theme === 'system' : theme === t)
                  ? 'bg-white dark:bg-slate-700 text-[#1d1d1f] dark:text-white shadow-sm'
                  : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
                  }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Legal & Local Footer */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-1">
          <div className="flex flex-wrap items-center gap-y-2 text-[12px] text-[#6e6e73] dark:text-[#86868b]">
            <span className="mr-4">Copyright © 2026 CloudBaud Inc. All rights reserved.</span>
            <div className="flex divide-x divide-slate-300 dark:divide-slate-700">
              <Link to="/privacy-policy" className="px-2 first:pl-0 hover:underline">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="px-2 hover:underline">Terms of Use</Link>
              <Link to="/sales" className="px-2 hover:underline">Sales and Refunds</Link>
              <Link to="/legal" className="px-3 hover:underline">Legal</Link>
              <Link to="/site-map" className="px-3 hover:underline">Site Map</Link>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-[12px] text-[#424245] dark:text-[#d2d2d7] hover:underline cursor-pointer group">
            <span className="font-medium">United States</span>
            <Globe className="w-3 h-3 text-[#6e6e73]" />
            <ChevronDown className="w-3 h-3 text-[#6e6e73] group-hover:block hidden" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

