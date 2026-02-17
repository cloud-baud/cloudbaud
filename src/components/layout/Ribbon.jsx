import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Separator } from '@/shared/ui/separator';
import { ChevronUp, ChevronDown, Type } from 'lucide-react';

export const Ribbon = ({ 
    tabs = [], 
    defaultTab, 
    rightAction, 
    className 
}) => {
    const validDefaultTab = defaultTab || (tabs.length > 0 ? tabs[0].id : undefined);
    const [collapsed, setCollapsed] = useState(false);

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
                    
                    <div className="flex items-center gap-2">
                        {rightAction && (
                            <div className="flex items-center gap-2 mr-2">
                                {rightAction}
                            </div>
                        )}
                        <button
                            onClick={() => setCollapsed(c => !c)}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            title={collapsed ? 'Show Ribbon' : 'Hide Ribbon'}
                        >
                            {collapsed 
                                ? <ChevronDown className="size-4" />
                                : <ChevronUp className="size-4" />
                            }
                        </button>
                    </div>
                </div>

                <div 
                    className={cn(
                        "bg-white dark:bg-[#1a1a1a] transition-all duration-200 ease-in-out overflow-hidden",
                        collapsed ? "h-0 p-0" : "h-24 p-2"
                    )}
                >
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
                "flex flex-col items-center justify-center px-3 py-2 h-[88px] min-w-[80px] rounded-md transition-colors gap-2",
                "hover:bg-accent hover:text-accent-foreground",
                active && "bg-accent text-accent-foreground",
                disabled && "opacity-50 cursor-not-allowed",
                "text-muted-foreground",
                className
            )}
        >
            {Icon && <Icon className="size-8" />}
            <span className="text-base font-medium leading-tight text-center">{label}</span>
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

// ── Font Size Selector ──
const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72];

export const RibbonFontSizeSelector = ({ value = 11, onChange, className }) => {
    return (
        <div className={cn("flex flex-col items-center justify-center h-16 gap-1", className)}>
            <div className="flex items-center gap-0.5">
                <button
                    type="button"
                    className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-muted-foreground"
                    onClick={() => {
                        const idx = FONT_SIZES.indexOf(value);
                        if (idx > 0) onChange?.(FONT_SIZES[idx - 1]);
                    }}
                    title="Decrease font size"
                >
                    <ChevronDown className="size-3" />
                </button>
                <select
                    value={value}
                    onChange={(e) => onChange?.(Number(e.target.value))}
                    className="w-14 h-7 text-center text-xs font-mono border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400 appearance-none"
                    title="Font size"
                >
                    {FONT_SIZES.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <button
                    type="button"
                    className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-muted-foreground"
                    onClick={() => {
                        const idx = FONT_SIZES.indexOf(value);
                        if (idx < FONT_SIZES.length - 1) onChange?.(FONT_SIZES[idx + 1]);
                    }}
                    title="Increase font size"
                >
                    <ChevronUp className="size-3" />
                </button>
            </div>
            <span className="text-xs font-medium text-muted-foreground leading-none">Size</span>
        </div>
    );
};

// ── Font Color Picker ──
const PRESET_COLORS = [
    '#000000', '#434343', '#666666', '#999999', '#cccccc', '#ffffff',
    '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff',
    '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#6fa8dc', '#8e7cc3',
    '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#3d85c6', '#674ea7',
    '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#351c75',
];

export const RibbonColorPicker = ({ value = '#000000', onChange, className }) => {
    const [open, setOpen] = useState(false);
    const pickerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        if (!open) return;
        const handleClick = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    return (
        <div className={cn("relative flex flex-col items-center justify-center h-16 gap-1", className)} ref={pickerRef}>
            <button
                type="button"
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-md hover:bg-accent transition-colors"
                onClick={() => setOpen(o => !o)}
                title="Font color"
            >
                <Type className="size-5 text-muted-foreground" />
                <div 
                    className="w-5 h-1.5 rounded-sm border border-slate-300 dark:border-slate-600" 
                    style={{ backgroundColor: value }} 
                />
            </button>
            <span className="text-xs font-medium text-muted-foreground leading-none">Color</span>

            {/* Popover Grid */}
            {open && (
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150">
                    <div className="grid grid-cols-6 gap-1 mb-2">
                        {PRESET_COLORS.map(color => (
                            <button
                                key={color}
                                type="button"
                                className={cn(
                                    "w-6 h-6 rounded border transition-all hover:scale-110",
                                    value === color 
                                        ? "ring-2 ring-blue-500 ring-offset-1 border-blue-400" 
                                        : "border-slate-300 dark:border-slate-600 hover:border-slate-500"
                                )}
                                style={{ backgroundColor: color }}
                                onClick={() => { onChange?.(color); setOpen(false); }}
                                title={color}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                        <label className="text-xs text-slate-500 font-medium">Custom:</label>
                        <input
                            type="color"
                            value={value}
                            onChange={(e) => { onChange?.(e.target.value); setOpen(false); }}
                            className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600 cursor-pointer p-0"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
