import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Code, Server, Shield, Zap, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import SEO from './SEO';
import { technicalCapabilities } from '../data/capabilities';
import FabricDemo from './portal/FabricDemo';
import FabricDiscoveryWizard from './FabricDiscoveryWizard';
import { useAuth } from '../context/AuthContext';

const TechnologyDetailPage = () => {
    const { slug, techSlug } = useParams();
    const { user } = useAuth();
    const [showFeatures, setShowFeatures] = useState(false);

    // Find the parent capability
    const capability = technicalCapabilities.find(cap => cap.slug === slug);

    if (!capability) {
        return <Navigate to="/capabilities" replace />;
    }

    // Find the specific technology/competency data
    // We expect the capability.capabilities array to contain objects with a 'slug' property for this to work
    // or we transform/find it based on the slug.
    // For now, let's assume we update the data structure to include slugs.

    const technology = capability.capabilities.find(item =>
        (typeof item === 'object' && item.slug === techSlug)
    );

    if (!technology) {
        return <Navigate to={`/capabilities/${slug}`} replace />;
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <SEO
                title={`${technology.title || technology.text} - ${capability.title} | CloudBaud`}
                description={technology.description || `Expert ${technology.text} services provided by CloudBaud.`}
                canonical={`/capabilities/${slug}/${techSlug}`}
            />

            {/* Breadcrumb */}
            <div className="bg-slate-50 dark:bg-slate-900/30 border-b border-gray-200 dark:border-slate-800 py-4 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex items-center space-x-2 text-sm">
                    <Link to="/capabilities" className="text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-brand-blue">Capabilities</Link>
                    <span className="text-gray-300 dark:text-slate-600">/</span>
                    <Link to={`/capabilities/${slug}`} className="text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-brand-blue">{capability.title}</Link>
                    <span className="text-gray-300 dark:text-slate-600">/</span>
                    <span className="font-medium text-gray-900 dark:text-white">{technology.text}</span>
                </div>
            </div>

            {/* Hero Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-background overflow-hidden relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-block px-4 py-1.5 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue font-semibold text-sm mb-6">
                                {capability.title} Expertise
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
                                {technology.title || technology.text}
                            </h1>
                            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                                {technology.fullDescription || technology.description || `Leverage the power of ${technology.text} to build scalable, secure, and efficient solutions for your enterprise.`}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button asChild size="lg" className="bg-brand-blue hover:bg-brand-blue/90 text-black font-bold py-6 px-8 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(0,210,255,0.3)] hover:shadow-[0_0_30px_rgba(0,210,255,0.5)]">
                                    <Link to="/contact">
                                        {techSlug === 'microsoft-fabric' ? 'Start Assessment' : `Hire ${technology.text} Experts`}
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/20 to-brand-aqua/20 dark:from-brand-blue/10 dark:to-brand-aqua/5 rounded-3xl transform rotate-3 scale-105 opacity-60"></div>
                            <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-2xl">
                                {/* Placeholder for tech-specific visual, defaulting to parent infographic if specific one not available */}
                                <img
                                    src={technology.image || capability.infographic}
                                    alt={technology.text}
                                    className="w-full h-auto rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* Interactive Demo Section - Only for Microsoft Fabric */}
            {
                technology.slug === 'microsoft-fabric' && (
                    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 border-y border-slate-800">
                        <div className="max-w-7xl mx-auto">
                            <FabricDemo />
                        </div>
                    </section>

                )
            }

            {/* Scale/Intake Section - Only for Fabric */}
            {
                technology.slug === 'microsoft-fabric' && (
                    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 border-b border-slate-900 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950/50 to-slate-950 pointer-events-none" />
                        <div className="max-w-4xl mx-auto relative z-10 text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-aqua mb-4">
                                Ready to modernize with Fabric?
                            </h2>
                            <p className="text-lg text-slate-400">
                                Complete this architectural discovery wizard to get a custom roadmap and readiness score.
                            </p>
                        </div>

                        {user ? (
                            <FabricDiscoveryWizard />
                        ) : (
                            <div className="max-w-md mx-auto relative z-10">
                                <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
                                    <div className="w-16 h-16 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-blue/20">
                                        <Lock className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-3">Authentication Required</h3>
                                    <p className="text-slate-400 mb-8">
                                        This discovery tool generates architectural artifacts. Please sign in with your corporate account to proceed.
                                    </p>
                                    <Button asChild className="w-full bg-brand-blue hover:bg-brand-blue/90 text-black font-semibold py-6 shadow-[0_0_15px_rgba(0,210,255,0.2)]">
                                        <Link to="/login">
                                            Sign In to Start Assessment
                                        </Link>
                                    </Button>
                                    <p className="mt-4 text-xs text-slate-600">
                                        Enterprise SSO supported
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                )
            }

            {/* Key Features / content */}
            {
                technology.features && (
                    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/30">
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center max-w-3xl mx-auto mb-16">
                                <button
                                    onClick={() => setShowFeatures(!showFeatures)}
                                    className="group flex items-center justify-center gap-3 w-full text-3xl font-bold text-slate-900 dark:text-white hover:text-brand-blue transition-colors focus:outline-none"
                                >
                                    <h2>Why we use {technology.text}?</h2>
                                    {showFeatures ? (
                                        <ChevronUp className="w-8 h-8 text-brand-blue" />
                                    ) : (
                                        <ChevronDown className="w-8 h-8 text-brand-blue group-hover:animate-bounce" />
                                    )}
                                </button>
                                {!showFeatures && (
                                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                                        Click to explore the technical benefits.
                                    </p>
                                )}
                            </div>

                            {showFeatures && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                    {technology.features.map((feature, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                                            <div className="w-12 h-12 bg-blue-50 dark:bg-brand-blue/10 text-blue-600 dark:text-brand-blue rounded-lg flex items-center justify-center mb-6">
                                                <CheckCircle className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                                            <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )
            }

            {/* CTA */}
            {/* CTA - Hidden for Fabric as it has a dedicated wizard section */}
            {techSlug !== 'microsoft-fabric' && (
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Start your {technology.text} project today
                        </h2>
                        <p className="text-xl text-slate-300 mb-10">
                            Work with engineers who understand the deep internals of the platform.
                        </p>
                        <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100 px-10 py-7 text-xl font-bold rounded-lg">
                            <Link to="/contact">
                                Schedule a Consultation
                            </Link>
                        </Button>
                    </div>
                </section>
            )}
        </div >
    );
};

export default TechnologyDetailPage;
