import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Heart,
    TrendingUp,
    ShoppingCart,
    Factory,
    GraduationCap,
    Cpu,
    Landmark,
    ArrowRight,
    Check,
    HelpCircle // Fallback icon
} from 'lucide-react';
import { industryStats } from '@/data/industries';
import { Button } from '@/shared/ui/button';
import { supabase } from '@/lib/supabase';

const iconMap = {
    Heart,
    TrendingUp,
    ShoppingCart,
    Factory,
    GraduationCap,
    Cpu,
    Landmark
};

const IndustriesPage = () => {
    const [industries, setIndustries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIndustries = async () => {
            try {
                const { data, error } = await supabase
                    .from('industries')
                    .select('*')
                    .eq('is_active', true)
                    .order('name');
                
                if (error) throw error;
                if (data) setIndustries(data);
            } catch (error) {
                console.error('Error fetching industries:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchIndustries();
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Hero Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
                        Industries{' '}
                        <span className="bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent">
                            We Serve
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12">
                        Deep industry expertise combined with cutting-edge technology to solve your most complex challenges.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm dark:shadow-none">
                            <div className="text-4xl font-bold bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent mb-2">
                                {industryStats.clientsServed}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Clients Served</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm dark:shadow-none">
                            <div className="text-4xl font-bold bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent mb-2">
                                {industries.length > 0 ? `${industries.length}+` : industryStats.industriesCovered}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Industries</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm dark:shadow-none">
                            <div className="text-4xl font-bold bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent mb-2">
                                {industryStats.avgROI}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Avg ROI</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm dark:shadow-none">
                            <div className="text-4xl font-bold bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent mb-2">
                                {industryStats.projectSuccessRate}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Success Rate</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Industries Grid */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/30">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="text-center text-slate-500">Loading industries...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {industries.map((industry) => {
                                const Icon = iconMap[industry.icon] || HelpCircle;
                                return (
                                    <div
                                        key={industry.id || industry.slug}
                                        className="group bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-2xl p-8 hover:border-brand-blue hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                                    >
                                        <div className="flex-1">
                                            <Link to={`/industries/${industry.slug}`} className="block">
                                                <div className="w-16 h-16 bg-blue-50 dark:bg-brand-blue/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                                    <Icon className="h-8 w-8 text-brand-blue" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-brand-blue transition-colors">
                                                    {industry.name}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400 mb-6">{industry.description}</p>
                                            </Link>
                                        </div>

                                        <div className="mt-auto space-y-4">
                                            <Link
                                                to={`/industries/${industry.slug}`}
                                                className="flex items-center text-brand-blue text-sm font-medium hover:text-brand-aqua mb-4"
                                            >
                                                Learn more
                                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Link>

                                            <Button asChild className="w-full bg-brand-blue hover:bg-brand-blue/80 text-black font-semibold rounded-lg">
                                                <Link to="/contact">Get Started</Link>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Why Industry Expertise Matters */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                            Why{' '}
                            <span className="bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent">
                                Industry Expertise
                            </span>{' '}
                            Matters
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                            We don't just build technology—we understand your business challenges, regulatory requirements, and competitive landscape.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-xl p-8 shadow-sm dark:shadow-none">
                            <Check className="h-10 w-10 text-brand-aqua mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                Domain Knowledge
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Our team includes former healthcare administrators, fintech engineers, and retail operators who understand your pain points.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-xl p-8 shadow-sm dark:shadow-none">
                            <Check className="h-10 w-10 text-brand-aqua mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                Regulatory Expertise
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                We navigate HIPAA, PCI-DSS, SOC 2, GDPR, and industry-specific compliance requirements with confidence.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-xl p-8 shadow-sm dark:shadow-none">
                            <Check className="h-10 w-10 text-brand-aqua mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                Proven Solutions
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Leverage battle-tested architectures and best practices from similar projects in your industry.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-xl p-8 shadow-sm dark:shadow-none">
                            <Check className="h-10 w-10 text-brand-aqua mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                Faster Time to Value
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Skip the learning curve—we already understand your industry's technology ecosystem and integration points.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/30">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                        Ready to{' '}
                        <span className="bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent">
                            transform your industry
                        </span>
                        ?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                        Let's discuss how our industry expertise can accelerate your digital transformation.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            asChild
                            size="lg"
                            className="bg-brand-blue hover:bg-brand-blue/90 text-black font-semibold px-8 py-3 rounded-full shadow-lg shadow-brand-blue/20"
                        >
                            <Link to="/contact">
                                Schedule Consultation
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-8 py-3 rounded-full bg-transparent"
                        >
                            <Link to="/portfolio">View Case Studies</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default IndustriesPage;
