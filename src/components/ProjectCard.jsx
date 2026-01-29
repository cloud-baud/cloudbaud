import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';

const ProjectCard = ({ project, featured = false }) => {
    return (
        <article
            className={`group bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:border-brand-blue hover:shadow-lg transition-all duration-300 ${featured ? 'md:col-span-2' : ''
                }`}
        >
            {/* ImagePlaceholder with Gradient */}
            <div className={`relative ${featured ? 'h-64' : 'h-48'} bg-gradient-to-br from-brand-blue/10 to-brand-aqua/10 overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 dark:from-slate-900 dark:via-slate-900/60 to-transparent" />

                {/* Tags */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-white text-xs font-medium rounded-full"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Category Badge */}
                <div className="absolute bottom-4 left-4">
                    <span className="px-4 py-2 bg-brand-blue text-black text-sm font-semibold rounded-full shadow-lg">
                        {project.category}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-blue transition-colors">
                    {project.title}
                </h3>

                {/* Client */}
                <p className="text-brand-blue text-sm font-medium mb-4">
                    Client: {project.client}
                </p>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {project.description}
                </p>

                {/* Results Preview */}
                {project.results && (
                    <div className="mb-4">
                        <h4 className="text-gray-900 dark:text-white font-semibold mb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-brand-aqua" />
                            Key Results
                        </h4>
                        <ul className="space-y-1">
                            {project.results.slice(0, 2).map((result, index) => (
                                <li key={index} className="text-gray-600 dark:text-gray-400 text-sm flex items-start gap-2">
                                    <span className="text-brand-blue mt-1">•</span>
                                    <span>{result}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Technologies */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        {project.technologies.slice(0, 5).map((tech, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                            >
                                {tech}
                            </span>
                        ))}
                        {project.technologies.length > 5 && (
                            <span className="px-2 py-1 text-gray-400 text-xs">
                                +{project.technologies.length - 5} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{project.duration}</span>
                        <span>•</span>
                        <span>{project.year}</span>
                    </div>

                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-brand-blue hover:text-brand-blue/80 hover:bg-brand-blue/10"
                    >
                        <Link to={`/portfolio#${project.id}`}>
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </article>
    );
};

export default ProjectCard;
