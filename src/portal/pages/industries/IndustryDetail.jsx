import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    Heart,
    TrendingUp,
    ShoppingCart,
    Factory,
    GraduationCap,
    Cpu,
    Check,
    AlertCircle,
    Landmark,
    HelpCircle
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { supabase } from '@/shared/lib/supabase';

const iconMap = {
    Heart,
    TrendingUp,
    ShoppingCart,
    Factory,
    GraduationCap,
    Cpu,
    Landmark
};

const IndustryDetail = () => {
    const { slug } = useParams();
    const [industry, setIndustry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchIndustry = async () => {
            try {
                const { data, error } = await supabase
                    .from('industries')
                    .select('*')
                    .eq('slug', slug)
                    .eq('is_active', true)
                    .single();

                if (error) throw error;

                if (data) {
                    // Flatten content for easier access
                    setIndustry({
                        ...data,
                        challenges: data.content?.challenges || [],
                        solutions: data.content?.solutions || [],
                        technologies: data.content?.technologies || [],
                        caseStudy: data.content?.caseStudy || { client: '', challenge: '', solution: '', results: [] }
                    });
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error('Error fetching industry:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchIndustry();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-slate-500">Loading industry details...</div>
            </div>
        );
    }

    if (error || !industry) {
        return <Navigate to="/industries" replace />;
    }

    const Icon = iconMap[industry.icon] || HelpCircle;

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Back Link */}
            <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                        <Link to="/industries">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Industries
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Hero Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="w-20 h-20 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-2xl flex items-center justify-center mb-6">
                                <Icon className="h-10 w-10 text-brand-blue" />
                            </div>
                            <h1 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">{industry.name}</h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                                {industry.description}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-brand-blue hover:bg-brand-blue/90 text-black font-semibold px-8 py-3 rounded-full shadow-lg shadow-brand-blue/20"
                                >
                                    <Link to="/contact">
                                        Discuss Your Project
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

                        {/* Key Challenges */}
                        {industry.challenges && industry.challenges.length > 0 && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-3xl p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <AlertCircle className="h-6 w-6 text-brand-magenta" />
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Key Challenges</h3>
                                </div>
                                <ul className="space-y-4">
                                    {industry.challenges.map((challenge, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-brand-magenta rounded-full mt-2 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-300">{challenge}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Our Solutions */}
            {industry.solutions && industry.solutions.length > 0 && (
                <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/30">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                                Our{' '}
                                <span className="bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent">
                                    Solutions
                                </span>
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Proven approaches to address your industry-specific challenges
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {industry.solutions.map((solution, index) => (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-xl p-8 hover:border-brand-blue hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="w-12 h-12 bg-brand-blue/10 rounded-lg flex items-center justify-center mb-6">
                                        <span className="text-2xl font-bold text-brand-blue">{index + 1}</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                        {solution.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">{solution.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Technologies */}
            {industry.technologies && industry.technologies.length > 0 && (
                <section className="py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                                Technology{' '}
                                <span className="bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent">
                                    Stack
                                </span>
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Industry-leading technologies and platforms we leverage
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4">
                            {industry.technologies.map((tech, index) => (
                                <div
                                    key={index}
                                    className="px-6 py-3 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-brand-blue transition-colors shadow-sm dark:shadow-none"
                                >
                                    {tech}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Case Study */}
            {industry.caseStudy && industry.caseStudy.client && (
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/30">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                                Success{' '}
                                <span className="bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent">
                                    Story
                                </span>
                            </h2>
                        </div>

                        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-3xl p-12 shadow-sm dark:shadow-none">
                            <div className="text-brand-blue font-semibold mb-6 text-lg">
                                CLIENT: {industry.caseStudy.client}
                            </div>

                            <div className="space-y-8">
                                {industry.caseStudy.challenge && (
                                    <div>
                                        <h4 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                            <AlertCircle className="h-6 w-6 text-brand-magenta" />
                                            The Challenge
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-lg">{industry.caseStudy.challenge}</p>
                                    </div>
                                )}

                                {industry.caseStudy.solution && (
                                    <div>
                                        <h4 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                            <Check className="h-6 w-6 text-brand-aqua" />
                                            Our Solution
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-lg">{industry.caseStudy.solution}</p>
                                    </div>
                                )}

                                {industry.caseStudy.results && industry.caseStudy.results.length > 0 && (
                                    <div>
                                        <h4 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Results Achieved</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {industry.caseStudy.results.map((result, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-slate-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl p-6"
                                                >
                                                    <Check className="h-6 w-6 text-brand-aqua mb-3" />
                                                    <p className="text-gray-800 dark:text-white font-semibold text-lg">{result}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                        Ready to{' '}
                        <span className="bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent">
                            get started
                        </span>
                        ?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                        Let's discuss how we can help transform your {industry.name ? industry.name.toLowerCase() : 'industry'} organization.
                    </p>
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
                </div>
            </section>
        </div>
    );
};
export default IndustryDetail;

