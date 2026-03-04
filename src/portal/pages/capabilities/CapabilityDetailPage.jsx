import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import SEO from '@/components/common/SEO';
import { technicalCapabilities } from '@/data/capabilities';
import { portfolioProjects } from '@/data/portfolio';

const CapabilityDetailPage = () => {
    const { slug } = useParams();
    const capability = technicalCapabilities.find(cap => cap.slug === slug);

    if (!capability) {
        return <Navigate to="/capabilities" replace />;
    }

    const Icon = capability.icon;

    // Helper to filter projects
    const getProjects = (tags, categories = []) => {
        return portfolioProjects.filter(p => {
            const matchesTag = tags.some(t => p.tags.some(pt => pt.toLowerCase().includes(t.toLowerCase())));
            const matchesCat = categories.some(c => p.category === c);
            return matchesTag || matchesCat;
        }).slice(0, 2); // Limit to 2 for preview
    };

    // Card Component
    const ProjectCard = ({ project }) => (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-blue mb-1 block">
                        {project.category}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                        {project.title}
                    </h4>
                </div>
                {project.year && (
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-1 rounded font-mono">
                        {project.year}
                    </span>
                )}
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3 flex-grow">
                {project.description}
            </p>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                <div className="flex flex-wrap gap-2 mb-4">
                    {project.results.slice(0, 2).map((r, i) => (
                        <div key={i} className="flex items-center text-xs text-green-600 dark:text-green-400 font-medium">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {r}
                        </div>
                    ))}
                </div>
                <Link to="/portfolio" className="text-sm font-bold text-blue-600 dark:text-brand-blue hover:underline">
                    View Case Study →
                </Link>
            </div>
        </div>
    );

    // App Dev Data Preparation
    let cloudCaps = [], mobileCaps = [], devOpsCaps = [];
    if (slug === 'custom-applications') {
        cloudCaps = [
            ...capability.capabilities,
            ...(technicalCapabilities.find(c => c.slug === 'cloud-solutions')?.capabilities || []),
            ...(technicalCapabilities.find(c => c.slug === 'microsoft-platform')?.capabilities || [])
        ];
        mobileCaps = technicalCapabilities.find(c => c.slug === 'mobile-development')?.capabilities || [];
        devOpsCaps = technicalCapabilities.find(c => c.slug === 'devops-infrastructure')?.capabilities || [];
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <SEO
                title={`${capability.title} - CloudBaud Capabilities`}
                description={capability.description}
                canonical={`/capabilities/${slug}`}
            />

            {/* Breadcrumb / Back Navigation */}
            <div className="bg-slate-50 dark:bg-slate-900/30 border-b border-gray-200 dark:border-slate-800 py-4 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <Link
                        to="/capabilities"
                        className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-brand-blue transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Capabilities
                    </Link>
                </div>
            </div>

            {/* Hero Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Text Content */}
                        <div>
                            <div className="w-16 h-16 bg-blue-600 dark:bg-brand-blue rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-600/20 dark:shadow-brand-blue/20">
                                {Icon && <Icon className="h-8 w-8 text-white" />}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                                {capability.title} {slug === 'custom-applications' && '(App Dev)'}
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-slate-400 mb-8 leading-relaxed">
                                {capability.description}
                            </p>

                            {/* Standard Competencies List (Visible ONLY for non-App Dev pages) */}
                            {slug !== 'custom-applications' && (
                                <div className="space-y-4 mb-10">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-brand-blue mb-4">
                                        Key Competencies
                                    </h3>
                                    {capability.capabilities.slice(0, 6).map((item, idx) => {
                                        const isLink = typeof item === 'object' && item.slug;
                                        const text = isLink ? item.text : item;

                                        return (
                                            <div key={idx} className="flex items-start">
                                                <CheckCircle className="w-6 h-6 text-green-500 mr-3 shrink-0" />
                                                {isLink ? (
                                                    <Link
                                                        to={`/capabilities/${slug}/${item.slug}`}
                                                        className="text-lg text-blue-600 dark:text-brand-blue font-medium hover:underline hover:text-blue-700 dark:hover:text-brand-aqua"
                                                    >
                                                        {text}
                                                    </Link>
                                                ) : (
                                                    <span className="text-lg text-gray-700 dark:text-slate-300 font-medium">{text}</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button asChild size="lg" className="bg-blue-600 dark:bg-brand-blue hover:bg-blue-700 dark:hover:bg-brand-blue/80 text-white font-bold py-6 px-8 rounded-xl shadow-lg shadow-blue-600/20 dark:shadow-brand-blue/20">
                                    <Link to="/contact">
                                        Start a Project
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="border-2 py-6 px-8 rounded-xl font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 dark:border-slate-700">
                                    <Link to="/portfolio">View Case Studies</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Visual Content - Single Image for both layouts */}
                        <div className="relative">
                            <div className="relative bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 shadow-2xl">
                                <img
                                    src={capability.infographic || '/infographic-custom-apps.png'}
                                    alt={`${capability.title} Visualization`}
                                    className="w-full h-auto object-contain transform hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="absolute -z-10 top-10 -right-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
                            <div className="absolute -z-10 -bottom-10 -left-10 w-72 h-72 bg-brand-blue rounded-full blur-3xl opacity-50"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section: Tabs (App Dev) or Grid (Standard) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {slug === 'custom-applications' ? (
                    <Tabs defaultValue="cloud" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-8 h-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <TabsTrigger value="cloud" className="py-3 text-sm md:text-base font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-brand-blue shadow-sm rounded-lg transition-all">
                                Cloud & Web
                            </TabsTrigger>
                            <TabsTrigger value="mobile" className="py-3 text-sm md:text-base font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-brand-blue shadow-sm rounded-lg transition-all">
                                Mobile
                            </TabsTrigger>
                            <TabsTrigger value="devops" className="py-3 text-sm md:text-base font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-brand-blue shadow-sm rounded-lg transition-all">
                                DevOps
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="cloud" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {cloudCaps.map((item, idx) => {
                                    const isLink = typeof item === 'object' && item.slug;
                                    const text = isLink ? item.text || item.title : item;
                                    const desc = isLink ? item.description : null;
                                    return (
                                        <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-blue/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-brand-blue mt-1 shrink-0" />
                                                <div>
                                                    {isLink ? (
                                                        <Link to={`/capabilities/custom-applications/${item.slug}`} className="font-bold text-lg text-slate-900 dark:text-white hover:text-brand-blue transition-colors">
                                                            {text}
                                                        </Link>
                                                    ) : (
                                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{text}</h3>
                                                    )}
                                                    {desc && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{desc}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Cloud Success Stories */}
                            <div className="mt-10 border-t border-slate-200 dark:border-slate-800 pt-8">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Success Stories: Cloud & Web</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {getProjects(['Cloud', 'React', 'Web', 'Azure', 'AWS'], ['Custom Applications', 'Architecture']).map(p => (
                                        <ProjectCard key={p.id} project={p} />
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="mobile" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {mobileCaps.map((item, idx) => {
                                    const isLink = typeof item === 'object' && item.slug;
                                    const text = isLink ? item.text || item.title : item;
                                    const desc = isLink ? item.description : null;
                                    return (
                                        <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-blue/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                                                <div>
                                                    {isLink ? (
                                                        <Link to={`/capabilities/mobile-development/${item.slug}`} className="font-bold text-lg text-slate-900 dark:text-white hover:text-brand-blue transition-colors">
                                                            {text}
                                                        </Link>
                                                    ) : (
                                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{text}</h3>
                                                    )}
                                                    {desc && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{desc}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Mobile Success Stories */}
                            <div className="mt-10 border-t border-slate-200 dark:border-slate-800 pt-8">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Success Stories: Mobile</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {getProjects(['Mobile', 'Android', 'iOS', 'Native'], ['Mobile Development']).map(p => (
                                        <ProjectCard key={p.id} project={p} />
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="devops" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {devOpsCaps.map((item, idx) => {
                                    const isLink = typeof item === 'object' && item.slug;
                                    const text = isLink ? item.text || item.title : item;
                                    const desc = isLink ? item.description : null;
                                    return (
                                        <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-blue/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-brand-aqua mt-1 shrink-0" />
                                                <div>
                                                    {isLink ? (
                                                        <Link to={`/capabilities/devops-infrastructure/${item.slug}`} className="font-bold text-lg text-slate-900 dark:text-white hover:text-brand-blue transition-colors">
                                                            {text}
                                                        </Link>
                                                    ) : (
                                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{text}</h3>
                                                    )}
                                                    {desc && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{desc}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* DevOps Success Stories */}
                            <div className="mt-10 border-t border-slate-200 dark:border-slate-800 pt-8">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Success Stories: DevOps</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {getProjects(['DevOps', 'Kubernetes', 'Terraform'], ['Architecture']).map(p => (
                                        <ProjectCard key={p.id} project={p} />
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                ) : (
                    /* Standard Layout Success Stories */
                    <div className="mt-8 border-t border-gray-100 dark:border-slate-800 pt-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">
                            Proven Results in {capability.title}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {getProjects(
                                [capability.title, ...capability.tags || []],
                                [capability.title === 'AI Engineering' ? 'AI Engineering' :
                                    capability.title === 'Data Engineering' ? 'Database Development' :
                                        'Architecture']
                            ).map(p => (
                                <ProjectCard key={p.id} project={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* CTA Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-white mt-12 border-t border-gray-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to leverage our {capability.title} expertise?
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
                        Let's discuss how our engineering team can help you build scalable, mission-critical solutions.
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="bg-brand-blue hover:bg-brand-blue/90 text-black px-10 py-7 text-xl rounded-lg font-bold"
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
