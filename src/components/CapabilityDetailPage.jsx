import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import SEO from './SEO';
import { technicalCapabilities } from '../data/capabilities';

const CapabilityDetailPage = () => {
    const { slug } = useParams();
    const capability = technicalCapabilities.find(cap => cap.slug === slug);

    if (!capability) {
        return <Navigate to="/capabilities" replace />;
    }

    const Icon = capability.icon;

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <SEO
                title={`${capability.title} - CloudBaud Capabilities`}
                description={capability.description}
                canonical={`/capabilities/${slug}`}
            />

            {/* Breadcrumb / Back Navigation */}
            <div className="bg-slate-50 dark:bg-slate-900/30 border-b border-gray-200 dark:border-slate-800 py-4 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <Link
                        to="/capabilities"
                        className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-brand-blue transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Capabilities
                    </Link>
                </div>
            </div>

            {/* Hero Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Text Content */}
                        <div>
                            <div className="w-16 h-16 bg-blue-600 dark:bg-brand-blue rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-600/20 dark:shadow-brand-blue/20">
                                {Icon && <Icon className="h-8 w-8 text-white" />}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                                {capability.title}
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-slate-400 mb-8 leading-relaxed">
                                {capability.description}
                            </p>

                            <div className="space-y-4 mb-10">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-brand-blue mb-4">
                                    Key Competencies
                                </h3>
                                {capability.capabilities.map((item, idx) => {
                                    const isLink = typeof item === 'object' && item.slug;
                                    const text = isLink ? item.text : item;

                                    return (
                                        <div key={idx} className="flex items-start">
                                            <CheckCircle className="w-6 h-6 text-green-500 mr-3 shrink-0" />
                                            {isLink ? (
                                                <Link
                                                    to={`/capabilities/${slug}/${item.slug}`}
                                                    className="text-lg text-blue-600 dark:text-brand-blue font-medium hover:underline hover:text-blue-700 dark:hover:text-brand-aqua"
                                                >
                                                    {text}
                                                </Link>
                                            ) : (
                                                <span className="text-lg text-gray-700 dark:text-slate-300 font-medium">{text}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button asChild size="lg" className="bg-blue-600 dark:bg-brand-blue hover:bg-blue-700 dark:hover:bg-brand-blue/80 text-white font-bold py-6 px-8 rounded-xl shadow-lg shadow-blue-600/20 dark:shadow-brand-blue/20">
                                    <Link to="/contact">
                                        Start a Project
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="border-2 py-6 px-8 rounded-xl font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 dark:border-slate-700">
                                    <Link to="/portfolio">View Case Studies</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Visual Content */}
                        <div className="relative">
                            <div className="relative bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 shadow-2xl">
                                <img
                                    src={capability.infographic}
                                    alt={`${capability.title} Visualization`}
                                    className="w-full h-auto object-contain transform hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            {/* Decorative Elements */}
                            <div className="absolute -z-10 top-10 -right-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
                            <div className="absolute -z-10 -bottom-10 -left-10 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-50"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-white mt-12 border-t border-gray-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to leverage our {capability.title} expertise?
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
                        Let's discuss how our engineering team can help you build scalable, mission-critical solutions.
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="bg-brand-blue hover:bg-brand-blue/90 text-black px-10 py-7 text-xl rounded-lg font-bold"
                    >
                        <Link to="/contact">
                            Get in Touch
                            <ArrowRight className="ml-2 h-6 w-6" />
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default CapabilityDetailPage;
