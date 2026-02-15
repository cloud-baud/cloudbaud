import React from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Separator } from '@/shared/ui/separator';

export const Ribbon = ({ 
    tabs = [], 
    defaultTab, 
    rightAction, 
    className 
}) => {
    const validDefaultTab = defaultTab || (tabs.length > 0 ? tabs[0].id : undefined);

    return (
        <div className={cn(
            "bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200",
            className
        )}>
            <Tabs defaultValue={validDefaultTab} className="w-full">
                <div className="flex items-center justify-between px-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <TabsList className="h-10 bg-transparent p-0 gap-2">
                        {tabs.map(tab => (
                            <TabsTrigger 
                                key={tab.id} 
                                value={tab.id}
                                className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#1a1a1a] data-[state=active]:shadow-sm rounded-t-lg border-x border-t border-transparent data-[state=active]:border-slate-200 dark:data-[state=active]:border-slate-700 px-4"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    
                    {rightAction && (
                        <div className="flex items-center gap-2 mr-4">
                            {rightAction}
                        </div>
                    )}
                </div>

                <div className="p-2 h-20 bg-white dark:bg-[#1a1a1a]">
                    {tabs.map(tab => (
                        <TabsContent 
                            key={tab.id} 
                            value={tab.id} 
                            className="mt-0 h-full flex items-center gap-2"
                        >
                            {tab.content}
                        </TabsContent>
                    ))}
                </div>
            </Tabs>
        </div>
    );
};

export const RibbonButton = ({ icon: Icon, label, onClick, className, disabled, active }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex flex-col items-center justify-center p-2 h-16 min-w-[64px] rounded-md transition-colors gap-1",
                "hover:bg-accent hover:text-accent-foreground",
                active && "bg-accent text-accent-foreground",
                disabled && "opacity-50 cursor-not-allowed",
                "text-muted-foreground",
                className
            )}
        >
            {Icon && <Icon className="size-5" />}
            <span className="text-[10px] font-medium leading-none">{label}</span>
        </button>
    );
};

export const RibbonSeparator = ({ className }) => {
    return (
        <Separator orientation="vertical" className={cn("h-10 mx-1", className)} />
    );
};

export const RibbonGroup = ({ children, className }) => {
    return (
        <div className={cn("flex gap-1", className)}>
            {children}
        </div>
    );
};
