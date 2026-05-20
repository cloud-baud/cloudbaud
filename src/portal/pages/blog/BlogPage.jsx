import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { blogPosts, blogCategories } from '@/data/blog-posts';
import BlogCard from '@/components/blog/BlogCard';
import CloudBaudDocumentTemplate from '@/components/common/CloudBaudDocumentTemplate';

const BlogPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('All Posts');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPosts = blogPosts.filter(post => {
        const matchesCategory = selectedCategory === 'All Posts' || post.category === selectedCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <CloudBaudDocumentTemplate
            title="Insights and Articles"
            category="Blog"
            documentType="Blog"
            description="CloudBaud articles follow the same standard document structure used by our documentation and whitepapers."
        >
            <div className="mb-8">
                <div className="relative max-w-2xl mb-6">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search articles, topics, or technologies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="flex items-center gap-3 mb-4">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-500 font-medium">Categories</span>
                </div>
                <div className="flex flex-wrap gap-3">
                    {blogCategories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === category
                                    ? 'bg-brand-blue text-black'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-8 text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-900 dark:text-white">{filteredPosts.length}</span> {filteredPosts.length === 1 ? 'article' : 'articles'}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                ))}
            </div>

            {filteredPosts.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-slate-500 text-lg">No articles found matching your criteria.</p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('All Posts');
                        }}
                        className="mt-4 text-brand-blue hover:opacity-80 transition-opacity font-medium"
                    >
                        Clear filters
                    </button>
                </div>
            )}

            <div className="mt-12 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold mb-2">Newsletter Placeholder</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                    This newsletter block uses the same CloudBaud template style as docs and whitepapers.
                </p>
                <form className="flex flex-col sm:flex-row gap-4 max-w-md" onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 bg-brand-blue hover:bg-brand-blue/80 text-black font-semibold rounded-lg transition-all duration-300"
                    >
                        Subscribe
                    </button>
                </form>
            </div>
        </CloudBaudDocumentTemplate>
    );
};

export default BlogPage;
