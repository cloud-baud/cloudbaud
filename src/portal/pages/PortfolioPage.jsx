import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Filter, Maximize2, X } from 'lucide-react';
import { portfolioProjects, categories } from '@/data/portfolio';
import ProjectCard from '@/components/portfolio/ProjectCard';
import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogClose,
} from "@/shared/ui/dialog";
import GenericDiscoveryWizard from '@/components/discovery/GenericDiscoveryWizard';

const PortfolioPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('All Projects');

    const filteredProjects = selectedCategory === 'All Projects'
        ? portfolioProjects
        : portfolioProjects.filter(project => project.category === selectedCategory);

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Hero Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
                        Our{' '}
                        <span className="bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent">
                            Portfolio
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        Explore our successful client projects across database modernization, AI engineering,
                        custom application development, and cloud architecture.
                    </p>
                </div>
            </section>

            {/* Filter Section */}
            <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Filter by Category:</span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${selectedCategory === category
                                    ? 'bg-brand-blue text-black shadow-lg shadow-brand-blue/20'
                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Projects Grid */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <p className="text-gray-600 dark:text-gray-400">
                            Showing <span className="text-gray-900 dark:text-white font-semibold">{filteredProjects.length}</span> {filteredProjects.length === 1 ? 'project' : 'projects'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {filteredProjects.map((project, index) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                featured={index === 0}
                            />
                        ))}
                    </div>

                    {filteredProjects.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                                No projects found in this category.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Case Study Details */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                            Detailed{' '}
                            <span className="bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent">
                                Case Studies
                            </span>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                            Dive deep into how we solved complex challenges for our clients
                        </p>
                    </div>

                    <div className="space-y-20">
                        {filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                id={project.id}
                                className="scroll-mt-20"
                            >
                                <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm dark:shadow-none">

                                    {/* Detailed Image Banner */}
                                    {project.image && (
                                        <div className="w-full h-64 md:h-96 relative group bg-slate-900">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <div className="w-full h-full cursor-pointer relative">
                                                        <img
                                                            src={project.image}
                                                            alt={project.title}
                                                            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px]">
                                                            <span className="bg-black/50 text-white px-4 py-2 rounded-full text-base font-medium flex items-center gap-2">
                                                                <Maximize2 className="w-5 h-5" />
                                                                View Full Size
                                                            </span>
                                                        </div>
                                                    </div>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-7xl w-full p-1 bg-transparent border-none shadow-none text-white overflow-hidden">
                                                    <div className="relative w-full h-[90vh] flex items-center justify-center">
                                                        <img
                                                            src={project.image}
                                                            alt={project.title}
                                                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                                        />
                                                        <DialogClose className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors">
                                                            <X className="w-6 h-6" />
                                                        </DialogClose>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    )}

                                    <div className="p-8 md:p-12">
                                        {/* Header */}
                                        <div className="mb-8">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="px-4 py-2 bg-brand-blue/10 text-brand-blue text-sm font-semibold rounded-full border border-brand-blue/20">
                                                    {project.category}
                                                </span>
                                                <span className="text-gray-500 dark:text-gray-400">{project.year}</span>
                                            </div>
                                            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                                {project.title}
                                            </h3>
                                            <p className="text-brand-blue text-lg font-medium">
                                                Client: {project.client}
                                            </p>
                                        </div>

                                        {/* Content Grid */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                            {/* Challenge & Solution */}
                                            <div className="space-y-8">
                                                <div>
                                                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">The Challenge</h4>
                                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{project.challenge}</p>
                                                </div>

                                                <div>
                                                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Our Solution</h4>
                                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{project.solution}</p>
                                                </div>
                                            </div>

                                            {/* Results & Tech */}
                                            <div className="space-y-8">
                                                <div>
                                                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Results Achieved</h4>
                                                    <div className="space-y-3">
                                                        {project.results.map((result, index) => (
                                                            <div key={index} className="flex items-start gap-3">
                                                                <div className="w-6 h-6 bg-brand-aqua/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                    <div className="w-2 h-2 bg-brand-aqua rounded-full" />
                                                                </div>
                                                                <span className="text-gray-600 dark:text-gray-300">{result}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Technologies Used</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {project.technologies.map((tech, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg border border-gray-200 dark:border-slate-600"
                                                            >
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="pt-4">
                                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                        <span className="font-medium">Duration:</span>
                                                        <span>{project.duration}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-24">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Start Your Transformation</h3>
                            <p className="text-gray-600 dark:text-gray-400">See a project you like? Let's build a similar success story for you.</p>
                        </div>
                        <GenericDiscoveryWizard
                            serviceName="Project Discovery"
                            serviceId="portfolio-inquiry"
                            workloadOptions={['FinOps', 'App Modernization', 'Data Platform', 'AI Integration']}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                        Ready to{' '}
                        <span className="bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent">
                            start your project
                        </span>
                        ?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                        Let's discuss how we can help you achieve similar results with your technology initiatives.
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="bg-brand-blue hover:bg-brand-blue/90 text-black font-semibold px-8 py-3 rounded-full shadow-lg shadow-brand-blue/20"
                    >
                        <Link to="/contact">
                            Schedule a Consultation
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default PortfolioPage;
