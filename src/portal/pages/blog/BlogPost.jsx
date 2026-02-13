import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Share2, Clock } from 'lucide-react';
import { blogPosts } from '@/data/blog-posts';
import { Button } from '@/shared/ui/button';

const BlogPost = () => {
    const { slug } = useParams();
    const post = blogPosts.find(p => p.slug === slug);

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    const relatedPosts = blogPosts
        .filter(p => p.id !== post.id && p.category === post.category)
        .slice(0, 3);

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                <div className="max-w-4xl mx-auto">
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white mb-8"
                    >
                        <Link to="/blog">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Blog
                        </Link>
                    </Button>

                    {/* Category Badge */}
                    <div className="mb-4">
                        <span className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full">
                            {post.category}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        {post.title}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            <span>
                                {new Date(post.publishDate).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            <span>{post.readTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            <span>{post.author}</span>
                        </div>
                    </div>

                    {/* Author Card */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    {post.author.split(' ').map(n => n[0]).join('')}
                                </span>
                            </div>
                            <div>
                                <div className="font-semibold text-white text-lg">{post.author}</div>
                                <div className="text-gray-400">{post.authorRole}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Image */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl border border-slate-700" />
                </div>
            </section>

            {/* Content */}
            <article className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="prose prose-invert prose-lg max-w-none">
                        <div
                            className="text-gray-300 leading-relaxed space-y-6"
                            dangerouslySetInnerHTML={{
                                __html: post.content
                                    .replace(/\n\n/g, '</p><p class="mb-6">')
                                    .replace(/\n/g, '<br/>')
                                    .replace(/^# /gm, '<h1 class="text-4xl font-bold text-white mt-12 mb-6">')
                                    .replace(/^## /gm, '<h2 class="text-3xl font-bold text-white mt-10 mb-4">')
                                    .replace(/^### /gm, '<h3 class="text-2xl font-bold text-white mt-8 mb-3">')
                                    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                                    .replace(/```(.+?)```/gs, '<pre class="bg-slate-800 border border-slate-700 rounded-lg p-4 overflow-x-auto"><code>$1</code></pre>')
                                    .replace(/`(.+?)`/g, '<code class="px-2 py-1 bg-slate-800 text-blue-400 rounded">$1</code>')
                            }}
                        />
                    </div>

                    {/* Tags */}
                    <div className="mt-12 pt-8 border-t border-slate-800">
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-gray-300 text-sm rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Share */}
                    <div className="mt-8 pt-8 border-t border-slate-800">
                        <div className="flex items-center gap-4">
                            <span className="text-gray-400 font-medium">Share this article:</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-white"
                            >
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8 text-center">
                            Related{' '}
                            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                Articles
                            </span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedPosts.map((relatedPost) => (
                                <Link
                                    key={relatedPost.id}
                                    to={`/blog/${relatedPost.slug}`}
                                    className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-all duration-300"
                                >
                                    <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-medium rounded-full">
                                        {relatedPost.category}
                                    </span>
                                    <h3 className="text-xl font-bold text-white mt-4 mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                                        {relatedPost.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm line-clamp-2">
                                        {relatedPost.excerpt}
                                    </p>
                                    <div className="mt-4 text-sm text-gray-400">
                                        {relatedPost.readTime}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-6">
                        Need help with{' '}
                        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            implementation
                        </span>
                        ?
                    </h2>
                    <p className="text-gray-400 text-lg mb-8">
                        Our team can help you apply these concepts to your specific use case.
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full"
                    >
                        <Link to="/contact">Schedule a Consultation</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default BlogPost;
