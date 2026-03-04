import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ExternalLink, PenTool, Users, TrendingUp } from 'lucide-react';
import { agents } from '@/data/agents';
import { Button } from '@/shared/ui/button';

const iconMap = {
    PenTool,
    Users,
    TrendingUp
};

const AgentDetail = () => {
    const { slug } = useParams();
    const agent = agents.find(a => a.slug === slug);

    if (!agent) {
        return <Navigate to="/agents" replace />;
    }

    const Icon = iconMap[agent.icon];

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Back Link */}
            <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                    >
                        <Link to="/agents">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to All Agents
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Hero Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            {/* Icon */}
                            <div className="w-20 h-20 bg-gradient-to-r from-brand-blue to-brand-aqua rounded-2xl flex items-center justify-center mb-6">
                                <Icon className="h-10 w-10 text-white" />
                            </div>

                            {/* Title */}
                            <h1 className="text-5xl font-bold mb-4">{agent.name}</h1>
                            <p className="text-2xl text-gray-400 mb-8">{agent.tagline}</p>
                            <p className="text-lg text-gray-300 leading-relaxed mb-8">
                                {agent.description}
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-gradient-to-r from-brand-blue to-brand-aqua hover:from-brand-blue hover:to-brand-aqua text-white px-8 py-3 rounded-full"
                                >
                                    <Link to="/contact">
                                        Request Demo
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="lg"
                                    className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 rounded-full"
                                >
                                    <Link to="#pricing">View Pricing</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8">
                            <div className="mb-8">
                                <div className="text-6xl font-bold bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent mb-2">
                                    {agent.metrics.primary.value}
                                </div>
                                <div className="text-xl text-gray-400">{agent.metrics.primary.label}</div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                {agent.metrics.secondary.map((metric, index) => (
                                    <div key={index}>
                                        <div className="text-2xl font-bold text-blue-400 mb-1">{metric.value}</div>
                                        <div className="text-sm text-gray-400">{metric.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold mb-12 text-center">
                        Key{' '}
                        <span className="bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent">
                            Features
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {agent.features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-all duration-300"
                            >
                                <Check className="h-6 w-6 text-green-400 mb-4" />
                                <p className="text-white">{feature}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold mb-12 text-center">
                        Use{' '}
                        <span className="bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent">
                            Cases
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {agent.useCases.map((useCase, index) => (
                            <div
                                key={index}
                                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-blue-500 transition-all duration-300"
                            >
                                <h3 className="text-2xl font-semibold text-white mb-3">{useCase.title}</h3>
                                <p className="text-gray-400">{useCase.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Case Study */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-4xl font-bold mb-12 text-center">
                        Success{' '}
                        <span className="bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent">
                            Story
                        </span>
                    </h2>

                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-12">
                        <div className="text-blue-400 font-semibold mb-4">CLIENT: {agent.caseStudy.client}</div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xl font-semibold text-white mb-3">The Challenge</h4>
                                <p className="text-gray-400">{agent.caseStudy.challenge}</p>
                            </div>

                            <div>
                                <h4 className="text-xl font-semibold text-white mb-3">Our Solution</h4>
                                <p className="text-gray-400">{agent.caseStudy.solution}</p>
                            </div>

                            <div>
                                <h4 className="text-xl font-semibold text-white mb-4">Results Achieved</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {agent.caseStudy.results.map((result, index) => (
                                        <div key={index} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                            <Check className="h-5 w-5 text-green-400 mb-2" />
                                            <p className="text-white font-medium">{result}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Integrations */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold mb-8 text-center">
                        Seamless{' '}
                        <span className="bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent">
                            Integrations
                        </span>
                    </h2>
                    <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                        {agent.name} integrates with your existing tools and platforms
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        {agent.integrations.map((integration, index) => (
                            <div
                                key={index}
                                className="px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-gray-300 hover:border-blue-500 transition-colors"
                            >
                                {integration}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold mb-12 text-center">
                        Simple,{' '}
                        <span className="bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent">
                            Transparent Pricing
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {Object.entries(agent.pricing).map(([tier, details]) => (
                            <div
                                key={tier}
                                className={`bg-slate-800/50 backdrop-blur-sm border rounded-3xl p-8 ${tier === 'professional'
                                        ? 'border-blue-500 relative'
                                        : 'border-slate-700 hover:border-blue-500'
                                    } transition-all duration-300`}
                            >
                                {tier === 'professional' && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="px-4 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <h3 className="text-2xl font-bold text-white mb-2 capitalize">{tier}</h3>
                                <div className="mb-6">
                                    <span className="text-5xl font-bold text-white">{details.price}</span>
                                    {details.period && (
                                        <span className="text-gray-400 ml-2">/ {details.period}</span>
                                    )}
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {details.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2 text-gray-300">
                                            <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    asChild
                                    className={
                                        tier === 'professional'
                                            ? 'w-full bg-gradient-to-r from-brand-blue to-brand-aqua hover:from-brand-blue hover:to-brand-aqua text-white'
                                            : 'w-full border border-gray-600 bg-transparent text-white hover:bg-gray-800'
                                    }
                                >
                                    <Link to="/contact">
                                        {tier === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                                    </Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to{' '}
                        <span className="bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent">
                            get started
                        </span>
                        ?
                    </h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                        Schedule a personalized demo to see {agent.name} in action and discuss your specific needs.
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="bg-gradient-to-r from-brand-blue to-brand-aqua hover:from-brand-blue hover:to-brand-aqua text-white px-8 py-3 rounded-full"
                    >
                        <Link to="/contact">
                            Schedule Demo
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default AgentDetail;
