import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { agents, agentBenefits } from '../data/agents';
import AgentCard from './AgentCard';
import { Button } from './ui/button';

const AgentsPage = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Hero Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-block mb-6 px-4 py-1 rounded-full border border-purple-500 text-xs uppercase tracking-wider">
                        <Sparkles className="inline h-3 w-3 mr-2" />
                        AI Agents That Work For You
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Deploy{' '}
                        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Intelligent Agents
                        </span>{' '}
                        <br />
                        In Days, Not Months
                    </h1>

                    <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
                        Pre-built AI agents for copywriting, customer engagement, and sales.
                        Ready to integrate with your existing tools, backed by expert implementation support.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            asChild
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full"
                        >
                            <Link to="/contact">
                                Schedule Demo
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 rounded-full"
                        >
                            <Link to="#compare">Compare Agents</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Agent Cards Grid */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {agents.map((agent) => (
                            <AgentCard key={agent.id} agent={agent} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">
                            Why Choose{' '}
                            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                CloudBaud Agents
                            </span>
                            ?
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Unlike generic AI tools, our agents are purpose-built, enterprise-ready,
                            and backed by expert implementation support.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {agentBenefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-all duration-300"
                            >
                                <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                                    <div className="w-3 h-3 bg-blue-400 rounded-full" />
                                </div>
                                <p className="text-white font-medium">{benefit}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">
                            Get Started in{' '}
                            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                Three Steps
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-white">1</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Choose Your Agent</h3>
                            <p className="text-gray-400">
                                Select the agent that fits your needs - Copywriter, CRM, or Sales
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-white">2</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Quick Integration</h3>
                            <p className="text-gray-400">
                                We handle the setup and integration with your existing tools
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-white">3</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Start Seeing Results</h3>
                            <p className="text-gray-400">
                                Your agent starts working immediately, learning and improving over time
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to{' '}
                        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            deploy your agent
                        </span>
                        ?
                    </h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                        Schedule a demo to see our agents in action and discuss your specific use case.
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full"
                    >
                        <Link to="/contact">
                            Schedule Your Demo
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default AgentsPage;
