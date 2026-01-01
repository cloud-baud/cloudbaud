import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';

const ProjectCard = ({ project, featured = false }) => {
    return (
        <article
            className={`group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500 transition-all duration-300 ${featured ? 'md:col-span-2' : ''
                }`}
        >
            {/* Image */}
            <div className={`relative ${featured ? 'h-80' : 'h-64'} bg-gradient-to-br from-blue-600/20 to-purple-600/20 overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

                {/* Tags */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-white text-xs font-medium rounded-full"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Category Badge */}
                <div className="absolute bottom-4 left-4">
                    <span className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full">
                        {project.category}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {project.title}
                </h3>

                {/* Client */}
                <p className="text-blue-400 text-sm font-medium mb-4">
                    Client: {project.client}
                </p>

                {/* Description */}
                <p className="text-gray-400 mb-4 line-clamp-2">
                    {project.description}
                </p>

                {/* Results Preview */}
                {project.results && (
                    <div className="mb-4">
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                            Key Results
                        </h4>
                        <ul className="space-y-1">
                            {project.results.slice(0, 2).map((result, index) => (
                                <li key={index} className="text-gray-400 text-sm flex items-start gap-2">
                                    <span className="text-blue-400 mt-1">•</span>
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
                                className="px-2 py-1 bg-slate-700 text-gray-300 text-xs rounded-md"
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
                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{project.duration}</span>
                        <span>•</span>
                        <span>{project.year}</span>
                    </div>

                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:text-blue-300"
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
