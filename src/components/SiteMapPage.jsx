import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Zap, Layers, Briefcase, Info } from 'lucide-react';
import SEO from './SEO';

const SiteMapPage = () => {
    const sitemapLinks = [
        {
            category: 'Main',
            icon: Zap,
            links: [
                { label: 'Home', to: '/' },
                { label: 'Services', to: '/services' },
                { label: 'Portfolio', to: '/portfolio' },
                { label: 'Contact', to: '/contact' },
            ]
        },
        {
            category: 'Capabilities',
            icon: Layers,
            links: [
                { label: 'All Capabilities', to: '/capabilities' },
                { label: 'AI Engineering', to: '/ai-engineering' },
                { label: 'Data Engineering', to: '/capabilities/data-engineering' },
                { label: 'Custom Applications', to: '/capabilities/custom-applications' },
                { label: 'Cloud Solutions', to: '/capabilities/cloud-solutions' },
                { label: 'Microsoft Platform', to: '/capabilities/microsoft-platform' },
                { label: 'DevOps & Infrastructure', to: '/capabilities/devops-infrastructure' },
            ]
        },
        {
            category: 'Company',
            icon: Info,
            links: [
                { label: 'About Us', to: '/about' },
                { label: 'Careers', to: '/careers' },
                { label: 'Privacy Policy', to: '/privacy-policy' },
                { label: 'Terms and Conditions', to: '/terms-and-conditions' },
                { label: 'Sales and Refunds', to: '/sales' },
                { label: 'Legal', to: '/legal' },
            ]
        },
        {
            category: 'Resources',
            icon: Briefcase,
            links: [
                { label: 'Blog', to: '/blog' },
                { label: 'Agents', to: '/agents' },
                { label: 'Industries', to: '/industries' },
            ]
        }
    ];

    return (
        <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
            <SEO
                title="Site Map - CloudBaud"
                description="Complete overview of pages on the CloudBaud website."
                canonical="/site-map"
            />

            {/* Header Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block p-3 rounded-full bg-blue-500/10 mb-6">
                        <Map className="w-10 h-10 text-blue-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                        Site Map
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        Overview of our website structure and direct links to all sections.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {sitemapLinks.map((section, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-900 dark:text-slate-100">
                                    <section.icon className="w-5 h-5 text-blue-500" />
                                    {section.category}
                                </h2>
                                <ul className="space-y-3">
                                    {section.links.map((link, linkIdx) => (
                                        <li key={linkIdx}>
                                            <Link
                                                to={link.to}
                                                className="text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:underline transition-colors block py-1"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SiteMapPage;
