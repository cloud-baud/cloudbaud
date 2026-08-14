import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/ui/card';
import { Search, Loader2, ExternalLink, Calendar, Key, AlertCircle } from 'lucide-react';

const PriorArtSearch = () => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        setError(null);
        setResults([]);

        try {
            // Build PatentsView API Query
            // Seeking relevance in title or abstract
            const apiQuery = {
                "_or": [
                    { "_text_any": { "patent_title": query } },
                    { "_text_any": { "patent_abstract": query } }
                ]
            };

            const fields = [
                "patent_number",
                "patent_title",
                "patent_date",
                "patent_abstract",
                "assignees"
            ];
            
            const options = { "per_page": 20 };
            
            const url = `https://api.patentsview.org/patents/query?q=${encodeURIComponent(JSON.stringify(apiQuery))}&f=${encodeURIComponent(JSON.stringify(fields))}&o=${encodeURIComponent(JSON.stringify(options))}`;
            
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data && data.patents) {
                setResults(data.patents);
            } else {
                setResults([]);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to fetch patent data. The USPTO PatentsView API might be experiencing issues or rate limiting.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Prior Art Search</h2>
                    <p className="text-sm text-muted-foreground">Search the USPTO Public Data Portal for existing patents.</p>
                </div>
            </div>

            {/* Search Bar */}
            <Card>
                <CardContent className="p-4">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by keywords (e.g., 'machine learning edge caching')"
                                className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-blue/50 text-sm"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching || !query.trim()}
                            className="bg-brand-blue text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors min-w-[100px] justify-center"
                        >
                            {isSearching ? <Loader2 className="size-4 animate-spin" /> : 'Search'}
                        </button>
                    </form>
                </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-start gap-3 text-sm">
                    <AlertCircle className="size-4 mt-0.5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto min-h-[300px]">
                {!isSearching && results.length === 0 && !error && query && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3">
                        <Search className="size-8 text-muted-foreground/50" />
                        <p>No patents found matching your query.</p>
                    </div>
                )}

                {!isSearching && results.length > 0 && (
                    <div className="space-y-4 pb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Found {results.length} patents</h3>
                        {results.map((patent) => (
                            <Card key={patent.patent_number} className="hover:border-brand-blue/30 transition-colors">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 font-mono">
                                                US {patent.patent_number}
                                            </span>
                                            {patent.assignees && patent.assignees[0]?.assignee_organization && (
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Key className="size-3" />
                                                    {patent.assignees[0].assignee_organization}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="size-3" />
                                            {patent.patent_date}
                                        </div>
                                    </div>
                                    <CardTitle className="text-base text-brand-blue line-clamp-2 leading-snug">
                                        {patent.patent_title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pb-3 text-sm text-slate-300 dark:text-slate-400">
                                    <p className="line-clamp-3">
                                        {patent.patent_abstract || "No abstract available."}
                                    </p>
                                </CardContent>
                                <CardFooter className="pt-2 border-t border-border flex justify-end">
                                    <a 
                                        href={`https://patents.google.com/patent/US${patent.patent_number}/en`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs flex items-center gap-1 text-brand-blue hover:text-brand-blue/80 transition-colors"
                                    >
                                        View on Google Patents <ExternalLink className="size-3" />
                                    </a>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {!isSearching && results.length === 0 && !error && !query && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3">
                        <Search className="size-8 text-muted-foreground/30" />
                        <p className="text-sm">Enter keywords to search for technical prior art.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PriorArtSearch;
