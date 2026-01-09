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
        <div className="min-h-screen bg-white text-gray-900">
            <SEO
                title={`${capability.title} - CloudBaud Capabilities`}
                description={capability.description}
                canonical={`/capabilities/${slug}`}
            />

            {/* Breadcrumb / Back Navigation */}
            <div className="bg-slate-50 border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <Link
                        to="/capabilities"
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Capabilities
                    </Link>
                </div>
            </div>

            {/* Hero Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Text Content */}
                        <div>
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-600/20">
                                {Icon && <Icon className="h-8 w-8 text-white" />}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                                {capability.title}
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                {capability.description}
                            </p>

                            <div className="space-y-4 mb-10">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-4">
                                    Key Competencies
                                </h3>
                                {capability.capabilities.map((item, idx) => (
                                    <div key={idx} className="flex items-start">
                                        <CheckCircle className="w-6 h-6 text-green-500 mr-3 shrink-0" />
                                        <span className="text-lg text-gray-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-8 rounded-xl shadow-lg shadow-blue-600/20">
                                    <Link to="/contact">
                                        Start a Project
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="border-2 py-6 px-8 rounded-xl font-bold text-gray-700 hover:bg-gray-50">
                                    <Link to="/portfolio">View Case Studies</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Visual Content */}
                        <div className="relative">
                            <div className="relative bg-slate-50 border border-gray-100 rounded-3xl p-8 shadow-2xl">
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
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white mt-12">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to leverage our {capability.title} expertise?
                    </h2>
                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                        Let's discuss how our engineering team can help you build scalable, mission-critical solutions.
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="bg-white text-slate-900 hover:bg-slate-100 px-10 py-7 text-xl rounded-lg font-bold"
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
