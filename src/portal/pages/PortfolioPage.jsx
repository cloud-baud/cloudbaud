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
import { useAuth } from '@/context/AuthContext';
import { Lock, FileCode, Server } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';

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
                            <PortfolioDetailCard key={project.id} project={project} />
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

const PortfolioDetailCard = ({ project }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('executive');

    return (
        <div id={project.id} className="scroll-mt-20">
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm dark:shadow-none">
                
                {/* Image Banner */}
                 {project.image && (
                    <div className="w-full h-64 md:h-80 relative bg-slate-900">
                        <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover object-top opacity-90"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                            <div className="p-8">
                                <Badge className="bg-brand-blue text-black mb-3 border-none">{project.industry} Case Study</Badge>
                                <h3 className="text-3xl font-bold text-white">{project.title}</h3>
                            </div>
                         </div>
                    </div>
                 )}

                <div className="p-8">
                     <Tabs defaultValue="executive" className="w-full" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl">
                            <TabsTrigger value="executive" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                                Executive Summary
                            </TabsTrigger>
                            <TabsTrigger value="architecture" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm flex items-center gap-2">
                                <Server className="w-4 h-4" /> Architecture <Lock className="w-3 h-3 text-slate-400" />
                            </TabsTrigger>
                            <TabsTrigger value="implementation" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm flex items-center gap-2">
                                <FileCode className="w-4 h-4" /> Implementation <Lock className="w-3 h-3 text-slate-400" />
                            </TabsTrigger>
                        </TabsList>

                        {/* EXECUTIVE VIEW (Public) */}
                        <TabsContent value="executive" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                     <div>
                                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">The Challenge</h4>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{project.challenge}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Our Solution</h4>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{project.solution}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Business Outcomes</h4>
                                    <ul className="space-y-3">
                                        {project.results.map((result, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="w-1.5 h-1.5 bg-brand-aqua rounded-full mt-2 shrink-0" />
                                                <span className="text-gray-700 dark:text-gray-300">{result}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </TabsContent>

                        {/* ARCHITECTURE VIEW (Gated) */}
                        <TabsContent value="architecture" className="relative min-h-[400px]">
                            <div className="filter blur-sm select-none opacity-50 pointer-events-none p-6 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                                <h3 className="text-xl font-bold mb-4">System Architecture Diagram</h3>
                                <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
                                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                                <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                            </div>
                            
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-[1px] rounded-xl z-10">
                                <Lock className="w-12 h-12 text-gray-400 mb-4" />
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Architecture Blocked</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6 text-center max-w-sm">
                                    Join CloudBaud to access detailed Reference Architectures, Security Models, and Component Diagrams.
                                </p>
                                <Button className="bg-brand-blue text-black hover:bg-brand-blue/90">
                                    Register to Unlock (Free)
                                </Button>
                            </div>
                        </TabsContent>

                        {/* IMPLEMENTATION VIEW (Paid) */}
                         <TabsContent value="implementation" className="relative min-h-[400px]">
                            <div className="filter blur-sm select-none opacity-50 pointer-events-none p-6 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                                <h3 className="text-xl font-bold mb-4 font-mono">infrastructure/main.tf</h3>
                                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                                <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                                <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                            </div>
                            
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-[1px] rounded-xl z-10">
                                <FileCode className="w-12 h-12 text-brand-aqua mb-4" />
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Developer Kit</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6 text-center max-w-sm">
                                    Get the full Terraform templates, PySpark notebooks, and deployment scripts for this solution.
                                </p>
                                <Button className="bg-brand-aqua text-black hover:bg-brand-aqua/90">
                                    Purchase Kit ($499)
                                </Button>
                            </div>
                        </TabsContent>

                     </Tabs>
                </div>
            </div>
        </div>
    );
};
