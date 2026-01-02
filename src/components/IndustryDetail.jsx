import React from 'react';
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
    AlertCircle
} from 'lucide-react';
import { industries } from '../data/industries';
import { Button } from './ui/button';

const iconMap = {
    Heart,
    TrendingUp,
    ShoppingCart,
    Factory,
    GraduationCap,
    Cpu
};

const IndustryDetail = () => {
    const { slug } = useParams();
    const industry = industries.find(i => i.slug === slug);

    if (!industry) {
        return <Navigate to="/industries" replace />;
    }

    const Icon = iconMap[industry.icon];

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
                        <Link to="/industries">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Industries
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Hero Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                                <Icon className="h-10 w-10 text-white" />
                            </div>
                            <h1 className="text-5xl font-bold mb-6">{industry.name}</h1>
                            <p className="text-xl text-gray-300 leading-relaxed mb-8">
                                {industry.description}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full"
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
                                    className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 rounded-full"
                                >
                                    <Link to="/portfolio">View Case Studies</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Key Challenges */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <AlertCircle className="h-6 w-6 text-orange-400" />
                                <h3 className="text-2xl font-bold text-white">Key Challenges</h3>
                            </div>
                            <ul className="space-y-4">
                                {industry.challenges.map((challenge, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                                        <span className="text-gray-300">{challenge}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Solutions */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">
                            Our{' '}
                            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                Solutions
                            </span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Proven approaches to address your industry-specific challenges
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {industry.solutions.map((solution, index) => (
                            <div
                                key={index}
                                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-blue-500 transition-all duration-300"
                            >
                                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-6">
                                    <span className="text-2xl font-bold text-blue-400">{index + 1}</span>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">
                                    {solution.title}
                                </h3>
                                <p className="text-gray-400">{solution.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technologies */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">
                            Technology{' '}
                            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                Stack
                            </span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Industry-leading technologies and platforms we leverage
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        {industry.technologies.map((tech, index) => (
                            <div
                                key={index}
                                className="px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-gray-300 hover:border-blue-500 transition-colors"
                            >
                                {tech}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Case Study */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">
                            Success{' '}
                            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                Story
                            </span>
                        </h2>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-12">
                        <div className="text-blue-400 font-semibold mb-6 text-lg">
                            CLIENT: {industry.caseStudy.client}
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h4 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                                    <AlertCircle className="h-6 w-6 text-orange-400" />
                                    The Challenge
                                </h4>
                                <p className="text-gray-300 text-lg">{industry.caseStudy.challenge}</p>
                            </div>

                            <div>
                                <h4 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                                    <Check className="h-6 w-6 text-green-400" />
                                    Our Solution
                                </h4>
                                <p className="text-gray-300 text-lg">{industry.caseStudy.solution}</p>
                            </div>

                            <div>
                                <h4 className="text-2xl font-semibold text-white mb-6">Results Achieved</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {industry.caseStudy.results.map((result, index) => (
                                        <div
                                            key={index}
                                            className="bg-slate-900/50 border border-slate-700 rounded-xl p-6"
                                        >
                                            <Check className="h-6 w-6 text-green-400 mb-3" />
                                            <p className="text-white font-semibold text-lg">{result}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to{' '}
                        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            get started
                        </span>
                        ?
                    </h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                        Let's discuss how we can help transform your {industry.name.toLowerCase()} organization.
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full"
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
