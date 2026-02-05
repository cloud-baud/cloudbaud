import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Share2, Maximize2, X } from 'lucide-react';
import { Button } from '../ui/button';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";

const ProjectCard = ({ project, featured = false }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleShare = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/portfolio#${project.id}`;
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <article
            className={`group bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:border-brand-blue hover:shadow-lg transition-all duration-300 ${featured ? 'md:col-span-2' : ''
                }`}
        >
            {/* Image Banner with Lightbox */}
            <div className={`relative ${featured ? 'h-72' : 'h-52'} bg-slate-900 overflow-hidden`}>
                <Dialog>
                    <DialogTrigger asChild>
                        <div className="w-full h-full cursor-pointer relative group/image">
                            {project.image ? (
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-brand-aqua/10" />
                            )}

                            {/* Reduced Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />

                            {/* Zoom Indicator */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px]">
                                <span className="bg-black/50 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                                    <Maximize2 className="w-4 h-4" />
                                    View Full Image
                                </span>
                            </div>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl w-full p-1 bg-transparent border-none shadow-none text-white">
                        <div className="relative w-full h-[80vh] flex items-center justify-center">
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

                {/* Tags */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10 pointer-events-none">
                    {project.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-white text-xs font-medium rounded-full shadow-sm"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Category Badge */}
                <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                    <span className="px-4 py-2 bg-brand-blue text-black text-sm font-semibold rounded-full shadow-lg border border-brand-blue/20">
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

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleShare}
                            className="text-slate-500 hover:text-brand-blue hover:bg-brand-blue/10"
                            title="Share Project"
                        >
                            {isCopied ? <span className="text-green-500 font-bold text-xs">Copied!</span> : <Share2 className="h-4 w-4" />}
                        </Button>

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
            </div>
        </article>
    );
};

export default ProjectCard;
