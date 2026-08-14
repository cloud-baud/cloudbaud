import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/ui/card';
import { FileText, Lightbulb, Clock, CheckCircle2, Plus, Search, Loader2 } from 'lucide-react';
import PriorArtSearch from './PriorArtSearch'; // Import the new search component
import { supabase } from '@/shared/lib/supabase';

const ProvisionalPatentsDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [patents, setPatents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatents = async () => {
            if (activeTab !== 'dashboard') return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('provisional_patents')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error("Error fetching patents:", error);
                } else if (data) {
                    setPatents(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPatents();
    }, [activeTab]);

    const totalDrafts = patents.length;
    const pendingReview = patents.filter(p => p.status === 'In Review').length;
    const filedCount = patents.filter(p => p.status === 'Filed Provisional').length;

    return (
        <div className="p-6 h-full flex flex-col space-y-6 overflow-y-auto w-full max-w-[1200px] mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Lightbulb className="size-6 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Provisional Patents</h1>
                        <p className="text-sm text-muted-foreground">Drafts, filings, and prior art IP discovery.</p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors border border-border">
                        <FileText className="size-4" />
                        Generate New Draft
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white hover:bg-brand-blue/90 rounded-md text-sm font-medium transition-colors shadow-sm">
                        <Plus className="size-4" />
                        Log Application
                    </button>
                </div>
            </div>

            {/* Custom Tabs */}
            <div className="flex items-center gap-4 border-b border-border">
                <button
                    className={`pb-2 text-sm font-medium transition-colors relative ${activeTab === 'dashboard' ? 'text-brand-blue' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <div className="flex items-center gap-2 px-1">
                        <FileText className="size-4" />
                        My Filings
                    </div>
                    {activeTab === 'dashboard' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-blue rounded-t-full" />}
                </button>
                <button
                    className={`pb-2 text-sm font-medium transition-colors relative ${activeTab === 'search' ? 'text-brand-blue' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setActiveTab('search')}
                >
                    <div className="flex items-center gap-2 px-1">
                        <Search className="size-4" />
                        Prior Art Search (USPTO)
                    </div>
                    {activeTab === 'search' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-blue rounded-t-full" />}
                </button>
            </div>

            {activeTab === 'dashboard' ? (
                <>
                    {/* Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Drafts</CardTitle>
                                <FileText className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalDrafts}</div>
                                <p className="text-xs text-muted-foreground mt-1">Stored in database</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
                                <Clock className="size-4 text-amber-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{pendingReview}</div>
                                <p className="text-xs text-muted-foreground mt-1">Awaiting legal review</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Filed Provisionals</CardTitle>
                                <CheckCircle2 className="size-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{filedCount}</div>
                                <p className="text-xs text-muted-foreground mt-1">Pending full utility</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Applications List */}
                    <div className="space-y-4 flex-1">
                        <h3 className="text-lg font-semibold tracking-tight">Recent Applications</h3>
                        
                        {loading ? (
                            <div className="flex items-center justify-center p-12">
                                <Loader2 className="size-8 text-brand-blue animate-spin" />
                            </div>
                        ) : patents.length === 0 ? (
                            <div className="p-8 text-center bg-secondary/20 rounded-lg border border-border border-dashed">
                                <p className="text-muted-foreground">No patent drafts found. Use the AI chat to generate one!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {patents.map((patent) => (
                                    <Card key={patent.id} className="flex flex-col h-full hover:border-brand-blue/50 transition-colors cursor-pointer group">
                                        <CardHeader className="pb-3 flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap
                                                    ${patent.status === 'Draft generated' ? 'bg-slate-500/10 text-slate-500' :
                                                    patent.status === 'In Review' ? 'bg-amber-500/10 text-amber-500' :
                                                    'bg-emerald-500/10 text-emerald-500'}`}
                                                >
                                                    {patent.status}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(patent.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <CardTitle className="text-base leading-tight group-hover:text-brand-blue transition-colors">
                                                {patent.title}
                                            </CardTitle>
                                            <CardDescription className="text-sm mt-3 line-clamp-3">
                                                {patent.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardFooter className="pt-3 border-t border-border mt-auto flex justify-between text-xs text-muted-foreground bg-secondary/20">
                                            <span>{patent.claims_count} Claims</span>
                                            <span className="flex items-center gap-1 font-mono uppercase">
                                                {patent.security_tier}
                                            </span>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="rounded-lg border border-border bg-card overflow-hidden mt-4">
                        <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center space-y-3">
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-2">
                                <Lightbulb className="size-5 text-slate-400" />
                            </div>
                            <p className="text-sm max-w-md">
                                Use the <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">generate_patent_provisional</code> skill in AI chat to convert your architectural designs into strict USPTO-compliant drafts.
                            </p>
                        </div>
                    </div>
                </>
            ) : (
                <PriorArtSearch />
            )}
        </div>
    );
};

export default ProvisionalPatentsDashboard;
