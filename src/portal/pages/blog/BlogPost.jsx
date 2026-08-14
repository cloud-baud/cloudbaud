import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Share2, Clock } from 'lucide-react';
import { blogPosts } from '@/workspace/data/blog-posts';
import { Button } from '@/shared/ui/button';
import CloudBaudDocumentTemplate from '@/components/common/CloudBaudDocumentTemplate';

const BlogPost = () => {
    const { slug } = useParams();
    const post = blogPosts.find(p => p.slug === slug);

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    const relatedPosts = blogPosts
        .filter(p => p.id !== post.id && p.category === post.category)
        .slice(0, 3);

    const publishedDate = new Date(post.publishDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <CloudBaudDocumentTemplate
            title={post.title}
            category={`Blog / ${post.category}`}
            documentType="Blog"
            description={post.excerpt}
            actions={
                <Button asChild variant="outline" size="sm" className="border-slate-300 dark:border-slate-700">
                    <Link to="/blog">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Blog
                    </Link>
                </Button>
            }
        >
            <div className="flex flex-wrap items-center gap-6 text-slate-500 mb-8 text-sm">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>{publishedDate}</span></div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>{post.readTime}</span></div>
                <div className="flex items-center gap-2"><User className="h-4 w-4" /><span>{post.author}</span></div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-8">
                <div className="font-semibold text-slate-900 dark:text-white text-lg">{post.author}</div>
                <div className="text-slate-500">{post.authorRole}</div>
            </div>

            <article className="prose max-w-none dark:prose-invert prose-slate mb-10">
                <div
                    className="text-slate-700 dark:text-slate-300 leading-relaxed"
                    dangerouslySetInnerHTML={{
                        __html: post.content
                            .replace(/\n\n/g, '</p><p class="mb-6">')
                            .replace(/\n/g, '<br/>')
                            .replace(/^# /gm, '<h1 class="text-4xl font-bold mt-12 mb-6">')
                            .replace(/^## /gm, '<h2 class="text-3xl font-bold mt-10 mb-4">')
                            .replace(/^### /gm, '<h3 class="text-2xl font-bold mt-8 mb-3">')
                            .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                            .replace(/```(.+?)```/gs, '<pre class="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 overflow-x-auto"><code>$1</code></pre>')
                            .replace(/`(.+?)`/g, '<code class="px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded">$1</code>')
                    }}
                />
            </article>

            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm rounded-lg">#{tag}</span>
                    ))}
                </div>
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                </Button>
            </div>

            {relatedPosts.length > 0 && (
                <div className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-800">
                    <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedPosts.map((relatedPost) => (
                            <Link
                                key={relatedPost.id}
                                to={`/blog/${relatedPost.slug}`}
                                className="group bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-brand-blue/50 transition-all duration-300"
                            >
                                <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-xs font-medium rounded-full">{relatedPost.category}</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2 group-hover:text-brand-blue transition-colors line-clamp-2">{relatedPost.title}</h3>
                                <p className="text-slate-500 text-sm line-clamp-2">{relatedPost.excerpt}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-12 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
                <h2 className="text-2xl font-bold mb-3">Need help with implementation?</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">Our team can help you apply these concepts to your specific use case.</p>
                <Button asChild size="lg" className="bg-brand-blue hover:bg-brand-blue/80 text-black px-8 py-3 rounded-full font-semibold">
                    <Link to="/contact">Schedule a Consultation</Link>
                </Button>
            </div>
        </CloudBaudDocumentTemplate>
    );
};

export default BlogPost;

