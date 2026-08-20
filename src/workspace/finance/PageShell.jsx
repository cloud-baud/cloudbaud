import React from 'react';
import { cn } from '@/shared/lib/utils';

/**
 * PageShell - A standardized "Master Page" container for Portal content.
 * 
 * Enforces consistent distinct padding, max-width, and header typography 
 * across all portal pages (Dashboard, Settings, Finance, etc.).
 */
const PageShell = ({
    children,
    className,
    title,
    subtitle,
    actions,
    maxWidth = "max-w-6xl" // Default width, can be overridden (e.g. "max-w-full", "max-w-7xl")
}) => {
    return (
        <div className={cn(`${maxWidth} mx-auto p-4 md:p-6 pt-5 min-h-screen animate-in fade-in duration-500`, className)}>
            {/* Standardized Page Header */}
            {(title || subtitle || actions) && (
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-5">
                    <div>
                        {title && (
                            <h1 className="text-xl font-bold tracking-tight text-foreground">
                                {title}
                            </h1>
                        )}
                        {subtitle && (
                            <p className="text-muted-foreground mt-1 text-xs">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {actions && (
                        <div className="flex items-center gap-2.5">
                            {actions}
                        </div>
                    )}
                </div>
            )}

            {/* Page Content */}
            {children}
        </div>
    );
};

export default PageShell;
