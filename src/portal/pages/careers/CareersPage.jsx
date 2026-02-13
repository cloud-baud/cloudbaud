import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    DollarSign,
    Home as HomeIcon,
    Heart,
    BookOpen,
    Cpu,
    Calendar,
    CheckCircle2
} from 'lucide-react';
import { careers } from '@/data/careers';
import { Button } from '@/shared/ui/button';

const iconMap = {
    DollarSign,
    Home: HomeIcon,
    Heart,
    BookOpen,
    Cpu,
    Calendar
};

const CareersPage = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Hero Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Join Our{' '}
                        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Team
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Build cutting-edge solutions, work with the latest technologies, and grow your career
                        with a team of passionate engineers and consultants.
                    </p>
                </div>
            </section>

            {/* Culture Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6">
                                {careers.culture.title}
                            </h2>
                            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                {careers.culture.description}
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {careers.culture.values.map((value, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 text-gray-300"
                                    >
                                        <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0" />
                                        <span>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl border border-slate-700" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-6">
                            Benefits &{' '}
                            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                Perks
                            </span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            We invest in our team's success with comprehensive benefits and support.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {careers.benefits.map((benefit, index) => {
                            const Icon = iconMap[benefit.icon];
                            return (
                                <div
                                    key={index}
                                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-blue-500 transition-all duration-300"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-3">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-gray-400">
                                        {benefit.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Open Positions */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-6">
                            Open{' '}
                            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                Positions
                            </span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Join our growing team and work on exciting projects for leading companies.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {careers.openPositions.map((position) => (
                            <div
                                key={position.id}
                                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-blue-500 transition-all duration-300"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            {position.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4 text-gray-400">
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-blue-400 rounded-full" />
                                                {position.department}
                                            </span>
                                            <span>•</span>
                                            <span>{position.location}</span>
                                            <span>•</span>
                                            <span>{position.type}</span>
                                        </div>
                                    </div>
                                    <Button
                                        asChild
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                                    >
                                        <Link to={`/contact?position=${encodeURIComponent(position.title)}`}>
                                            Apply Now
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>

                                <p className="text-gray-400 mb-6">
                                    {position.description}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-white font-semibold mb-3">Responsibilities</h4>
                                        <ul className="space-y-2">
                                            {position.responsibilities.map((item, index) => (
                                                <li key={index} className="text-gray-400 text-sm flex items-start gap-2">
                                                    <span className="text-blue-400 mt-1">•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold mb-3">Requirements</h4>
                                        <ul className="space-y-2">
                                            {position.requirements.map((item, index) => (
                                                <li key={index} className="text-gray-400 text-sm flex items-start gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {position.niceToHave && position.niceToHave.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-slate-700">
                                        <h4 className="text-white font-semibold mb-3">Nice to Have</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {position.niceToHave.map((item, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-slate-700 text-gray-300 text-sm rounded-full"
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Hiring Process */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-6">
                            Our Hiring{' '}
                            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                Process
                            </span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            We've designed a transparent and efficient hiring process to find the best fit for both sides.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {careers.hiringProcess.map((step) => (
                            <div
                                key={step.step}
                                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 relative"
                            >
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                                    <span className="text-white font-bold text-xl">{step.step}</span>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    {step.description}
                                </p>
                                <div className="text-blue-400 text-sm font-medium">
                                    {step.duration}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to{' '}
                        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            join us
                        </span>
                        ?
                    </h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                        Don't see a position that fits? We're always looking for talented people.
                        Send us your resume and let's talk.
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full"
                    >
                        <Link to="/contact">
                            Get in Touch
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default CareersPage;
