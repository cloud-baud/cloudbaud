import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Filter } from 'lucide-react';
import { portfolioProjects, categories } from '../data/portfolio';
import ProjectCard from './ProjectCard';
import { Button } from './ui/button';

const PortfolioPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('All Projects');

    const filteredProjects = selectedCategory === 'All Projects'
        ? portfolioProjects
        : portfolioProjects.filter(project => project.category === selectedCategory);

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Hero Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Our{' '}
                        <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                            Portfolio
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Explore our successful client projects across database modernization, AI engineering,
                        custom application development, and cloud architecture.
                    </p>
                </div>
            </section>

            {/* Filter Section */}
            <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Filter className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-400 font-medium">Filter by Category:</span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${selectedCategory === category
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white'
                                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Projects Grid */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <p className="text-gray-400">
                            Showing <span className="text-white font-semibold">{filteredProjects.length}</span> {filteredProjects.length === 1 ? 'project' : 'projects'}
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
                            <p className="text-gray-400 text-lg">
                                No projects found in this category.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Case Study Details */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">
                            Detailed{' '}
                            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                                Case Studies
                            </span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
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
                                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 md:p-12">
                                    {/* Header */}
                                    <div className="mb-8">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full">
                                                {project.category}
                                            </span>
                                            <span className="text-gray-400">{project.year}</span>
                                        </div>
                                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                            {project.title}
                                        </h3>
                                        <p className="text-blue-400 text-lg font-medium">
                                            Client: {project.client}
                                        </p>
                                    </div>

                                    {/* Content Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        {/* Challenge & Solution */}
                                        <div className="space-y-8">
                                            <div>
                                                <h4 className="text-xl font-semibold text-white mb-4">The Challenge</h4>
                                                <p className="text-gray-400 leading-relaxed">{project.challenge}</p>
                                            </div>

                                            <div>
                                                <h4 className="text-xl font-semibold text-white mb-4">Our Solution</h4>
                                                <p className="text-gray-400 leading-relaxed">{project.solution}</p>
                                            </div>
                                        </div>

                                        {/* Results & Tech */}
                                        <div className="space-y-8">
                                            <div>
                                                <h4 className="text-xl font-semibold text-white mb-4">Results Achieved</h4>
                                                <div className="space-y-3">
                                                    {project.results.map((result, index) => (
                                                        <div key={index} className="flex items-start gap-3">
                                                            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <div className="w-2 h-2 bg-green-400 rounded-full" />
                                                            </div>
                                                            <span className="text-gray-300">{result}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-xl font-semibold text-white mb-4">Technologies Used</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {project.technologies.map((tech, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1.5 bg-slate-700 text-gray-300 text-sm rounded-lg border border-slate-600"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                                    <span className="font-medium">Duration:</span>
                                                    <span>{project.duration}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to{' '}
                        <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                            start your project
                        </span>
                        ?
                    </h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                        Let's discuss how we can help you achieve similar results with your technology initiatives.
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-8 py-3 rounded-full"
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
