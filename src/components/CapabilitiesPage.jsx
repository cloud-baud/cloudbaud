import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Database,
    Cloud,
    Cpu,
    Code,
    Smartphone,
    Target,
    Zap,
    Shield
} from 'lucide-react';
import { Button } from './ui/button';
import SEO from './SEO';

import { technicalCapabilities, deliveryModels } from '../data/capabilities';

const CapabilitiesPage = () => {
    return (
        <div className="min-h-screen bg-white text-gray-900">
            <SEO
                title="Our Capabilities"
                description="Comprehensive technology capabilities including data engineering, AI engineering, cloud solutions, Microsoft platform, DevOps, mobile development, enterprise integration, and solutions architecture."
                keywords="data engineering, database development, PostgreSQL, MongoDB, AI engineering, cloud migration, AWS, Azure, DevOps, mobile development"
                canonical="/capabilities"
            />
            {/* Hero Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 tracking-tight">
                            Our Capabilities
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            From pre-built solutions to custom enterprise applications, we deliver technology that drives measurable business value.
                        </p>
                    </div>
                </div>
            </section>

            {/* Technical Capabilities */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {technicalCapabilities.map((capability) => {
                            const Icon = capability.icon;
                            return (
                                <Link
                                    key={capability.id}
                                    to={`/capabilities/${capability.slug}`}
                                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group block transform hover:-translate-y-1"
                                >
                                    {/* Content Header */}
                                    <div className="p-4 border-b border-neutral-800 flex items-center gap-3 bg-neutral-900 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] hover:bg-[position:100%_0] transition-all duration-1000">
                                        <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.1)] group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:scale-105 transition-all">
                                            {Icon && <Icon className="h-5 w-5 text-blue-400" />}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-100 leading-tight group-hover:text-blue-400 transition-colors">
                                            {capability.title}
                                        </h3>
                                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                            <ArrowRight className="text-blue-400 w-5 h-5" />
                                        </div>
                                    </div>

                                    {/* Infographic Image */}
                                    <div className="relative aspect-[4/3] bg-white group-hover:bg-gray-50 transition-colors">
                                        <img
                                            src={capability.infographic}
                                            alt={`${capability.title} infographic`}
                                            className="w-full h-full object-contain p-2"
                                        />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Delivery Models */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl mb-16">
                        <h2 className="text-4xl font-bold mb-4 text-gray-900">
                            Flexible Delivery Models
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Choose the engagement approach that best fits your needs and timeline
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {deliveryModels.map((model, index) => {
                            const Icon = model.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-white border border-gray-200 rounded-lg p-8"
                                >
                                    <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center mb-6">
                                        {Icon && <Icon className="h-6 w-6 text-white" />}
                                    </div>
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                                        {model.title}
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {model.description}
                                    </p>
                                    <ul className="space-y-2">
                                        {model.benefits.map((benefit, idx) => (
                                            <li key={idx} className="text-gray-700 text-sm flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                                <span>{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                        Ready to get started?
                    </h2>
                    <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
                        Let's discuss which capabilities and delivery model are the best fit for your project.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            asChild
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base"
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
                            className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-6 text-base"
                        >
                            <Link to="/portfolio">View Portfolio</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CapabilitiesPage;
