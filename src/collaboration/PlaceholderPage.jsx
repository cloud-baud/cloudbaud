import React from 'react';
import { useLocation } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";

const PlaceholderPage = () => {
    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const title = pathSegments[pathSegments.length - 1] || 'Overview';

    // Capitalize title
    const formattedTitle = title
        .replace(/-/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{formattedTitle}</h1>
                    <p className="text-muted-foreground mt-1">This module is currently under development.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <Card className="w-full max-w-md border-dashed border-2 shadow-none bg-slate-50 dark:bg-slate-900/50">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                            <Construction className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <CardTitle>Work in Progress</CardTitle>
                        <CardDescription>
                            We are working hard to build the <strong>{formattedTitle}</strong> experience.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center text-sm text-muted-foreground">
                        Current Path: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">{location.pathname}</code>
                        <div className="mt-6 flex justify-center">
                            <Button variant="default" onClick={() => window.location.href = '/portal'}>
                                Return to Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PlaceholderPage;
