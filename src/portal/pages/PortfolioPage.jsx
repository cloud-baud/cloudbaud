import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Filter, Maximize2, X } from 'lucide-react';
import { portfolioProjects, categories } from '@/workspace/data/portfolio';
import ProjectCard from '@/components/portfolio/ProjectCard';
import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogClose,
} from "@/shared/ui/dialog";
import GenericDiscoveryWizard from '@/components/discovery/GenericDiscoveryWizard';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Lock, FileCode, Server } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';

const PortfolioPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('All Projects');

    const filteredProjects = selectedCategory === 'All Projects'
        ? portfolioProjects
        : portfolioProjects.filter(project => project.categories && project.categories.includes(selectedCategory));

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
    // Content tabs are handled by the Tabs component intrinsically
    
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
                     <Tabs defaultValue="executive" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl">
                            <TabsTrigger value="executive" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                                Executive Summary
                            </TabsTrigger>
                            <TabsTrigger value="architecture" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm flex items-center gap-2">
                                <Server className="w-4 h-4" /> Architecture
                            </TabsTrigger>
                            <TabsTrigger value="implementation" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm flex items-center gap-2">
                                <FileCode className="w-4 h-4" /> Implementation
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

                        {/* ARCHITECTURE VIEW (Public for Demo) */}
                        <TabsContent value="architecture" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {project.architecture ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                <Server className="w-5 h-5 text-indigo-500" /> System Design
                                            </h4>
                                            <p className="text-gray-600 dark:text-gray-300 mb-6">{project.architecture.summary}</p>
                                            
                                            <div className="space-y-4">
                                                {project.architecture.components.map((comp, i) => (
                                                    <div key={i} className="flex gap-4 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                                                            {i + 1}
                                                        </div>
                                                        <div>
                                                            <h5 className="font-semibold text-gray-900 dark:text-white text-sm">{comp.name}</h5>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{comp.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Mock Diagram Placeholder */}
                                    <div className="bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center min-h-[300px] relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />
                                        <img 
                                            src={project.architecture.diagram} 
                                            alt="Architecture Diagram"
                                            className="max-w-[80%] max-h-[80%] shadow-2xl rounded border border-slate-200 dark:border-slate-700 bg-white"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div className="hidden absolute inset-0 flex-col items-center justify-center text-slate-400">
                                            <Server className="w-16 h-16 mb-4 opacity-20" />
                                            <p>Architecture Diagram Visual</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-slate-500">Architecture details pending...</div>
                            )}
                        </TabsContent>

                        {/* IMPLEMENTATION VIEW (Public for Demo) */}
                         <TabsContent value="implementation" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {project.implementation ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <FileCode className="w-5 h-5 text-emerald-500" /> Implementation Patterns
                                        </h3>
                                        <Badge variant="outline" className="font-mono text-xs">Verified Code</Badge>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {project.implementation.files.map((file, i) => (
                                            <div key={i} className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-lg flex flex-col">
                                                <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                                                    <span className="font-mono text-xs text-slate-400">{file.name}</span>
                                                    <span className="text-[10px] text-slate-500 uppercase">{file.lang}</span>
                                                </div>
                                                <div className="p-4 overflow-x-auto flex-1">
                                                    <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
                                                        <code>{file.code}</code>
                                                    </pre>
                                                </div>
                                                <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800 text-[10px] text-slate-500 flex justify-end gap-2">
                                                    <button className="hover:text-white transition-colors">Copy</button>
                                                    <button className="hover:text-white transition-colors">Raw</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-slate-500">Implementation details pending...</div>
                            )}
                        </TabsContent>

                     </Tabs>
                </div>
            </div>
        </div>
    );
};


