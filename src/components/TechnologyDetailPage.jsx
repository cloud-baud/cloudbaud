import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Code, Server, Shield, Zap } from 'lucide-react';
import { Button } from './ui/button';
import SEO from './SEO';
import { technicalCapabilities } from '../data/capabilities';

const TechnologyDetailPage = () => {
    const { slug, techSlug } = useParams();

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
        <div className="min-h-screen bg-white text-gray-900">
            <SEO
                title={`${technology.title || technology.text} - ${capability.title} | CloudBaud`}
                description={technology.description || `Expert ${technology.text} services provided by CloudBaud.`}
                canonical={`/capabilities/${slug}/${techSlug}`}
            />

            {/* Breadcrumb */}
            <div className="bg-slate-50 border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex items-center space-x-2 text-sm">
                    <Link to="/capabilities" className="text-gray-500 hover:text-blue-600">Capabilities</Link>
                    <span className="text-gray-300">/</span>
                    <Link to={`/capabilities/${slug}`} className="text-gray-500 hover:text-blue-600">{capability.title}</Link>
                    <span className="text-gray-300">/</span>
                    <span className="font-medium text-gray-900">{technology.text}</span>
                </div>
            </div>

            {/* Hero Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-6">
                                {capability.title} Expertise
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
                                {technology.title || technology.text}
                            </h1>
                            <p className="text-xl text-slate-600 leading-relaxed mb-8">
                                {technology.fullDescription || technology.description || `Leverage the power of ${technology.text} to build scalable, secure, and efficient solutions for your enterprise.`}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-8 rounded-xl">
                                    <Link to="/contact">
                                        Hire {technology.text} Experts
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-3xl transform rotate-3 scale-105 opacity-60"></div>
                            <div className="relative bg-white border border-slate-100 rounded-3xl p-8 shadow-2xl">
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
            </section>

            {/* Key Features / content */}
            {technology.features && (
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why we use {technology.text}</h2>
                            <p className="text-lg text-slate-600">
                                Our engineering team leverages {technology.text} to deliver superior results.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {technology.features.map((feature, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                    <p className="text-slate-600">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
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
        </div>
    );
};

export default TechnologyDetailPage;
