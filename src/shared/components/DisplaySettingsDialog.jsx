import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import { useFontSize, FONT_SIZE_OPTIONS } from '@/shared/contexts/FontSizeContext';
import { useTheme } from 'next-themes';
import { Type, Sun, Moon, Check, Sparkles, Sliders, Layout, Monitor } from 'lucide-react';
import { toast } from 'sonner';

export const DisplaySettingsDialog = ({ open, onOpenChange }) => {
    const { fontSize, setFontSize } = useFontSize();
    const { theme, setTheme } = useTheme();

    const handleFontSizeChange = (size) => {
        setFontSize(size);
        const opt = FONT_SIZE_OPTIONS.find(o => o.id === size);
        toast.success(`Font size changed to ${opt?.label || size}`, {
            description: `Display density updated across all panels and dashboards.`
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[540px] bg-slate-950 border-slate-800 text-slate-100 p-0 overflow-hidden shadow-2xl">
                {/* Modal Header */}
                <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800">
                    <DialogHeader>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                                <Sliders className="size-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold text-white tracking-tight">
                                    Display & Typography Settings
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-400 mt-0.5">
                                    Configure font sizing, workspace density, and visual theme.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
                    {/* Section 1: Font Size / Display Density */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                                <Type className="size-3.5 text-brand-blue" />
                                <span>Font Size & Workspace Density</span>
                            </label>
                            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono font-medium">
                                Active: {FONT_SIZE_OPTIONS.find(o => o.id === fontSize)?.label}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {FONT_SIZE_OPTIONS.map((opt) => {
                                const isSelected = fontSize === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => handleFontSizeChange(opt.id)}
                                        className={`relative flex flex-col p-3 rounded-lg border text-left transition-all cursor-pointer ${
                                            isSelected
                                                ? 'bg-brand-blue/15 border-brand-blue text-white shadow-sm ring-1 ring-brand-blue/50'
                                                : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/80 text-slate-300 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between w-full mb-1.5">
                                            <span className="text-base">{opt.icon}</span>
                                            {opt.badge && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                                                    {opt.badge}
                                                </span>
                                            )}
                                            {isSelected && !opt.badge && (
                                                <Check className="size-3.5 text-brand-blue font-bold" />
                                            )}
                                        </div>
                                        <div className="font-bold text-xs text-white">
                                            {opt.label}
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                                            {opt.sublabel}
                                        </div>
                                        <div className="mt-2 text-[10px] font-mono text-slate-500">
                                            Scale: {opt.scale}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Live Preview Card */}
                    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                                <Sparkles className="size-3 text-amber-400" /> Live Density Preview
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                                Applies instantly across all tabs
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                                <div className="text-[10px] uppercase font-bold text-slate-400">Sample Tax Metric</div>
                                <div className="text-base font-bold text-emerald-400 font-mono">$351,520.00</div>
                                <div className="text-[10px] text-slate-400">1099-NEC Consulting Gross</div>
                            </div>
                            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                                <div className="text-[10px] uppercase font-bold text-slate-400">Dashboard Status</div>
                                <div className="text-base font-bold text-white">Tax Filing (2022–2025)</div>
                                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                                    <Check className="size-2.5" /> High-Density Synchronized
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Theme Preference */}
                    <div className="space-y-3 pt-2 border-t border-slate-800/80">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                            <Monitor className="size-3.5 text-brand-blue" />
                            <span>Color Theme</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => {
                                    setTheme('dark');
                                    toast.success('Theme set to Dark Mode');
                                }}
                                className={`flex items-center gap-2.5 p-3 rounded-lg border transition-all cursor-pointer ${
                                    theme === 'dark'
                                        ? 'bg-brand-blue/15 border-brand-blue text-white shadow-sm ring-1 ring-brand-blue/50'
                                        : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/80 text-slate-300 hover:text-white'
                                }`}
                            >
                                <Moon className="size-4 text-brand-blue" />
                                <div className="text-left">
                                    <div className="font-bold text-xs">Dark Mode</div>
                                    <div className="text-[10px] text-slate-400">Deep Slate & High Contrast</div>
                                </div>
                                {theme === 'dark' && <Check className="size-3.5 text-brand-blue ml-auto" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setTheme('light');
                                    toast.success('Theme set to Light Mode');
                                }}
                                className={`flex items-center gap-2.5 p-3 rounded-lg border transition-all cursor-pointer ${
                                    theme === 'light'
                                        ? 'bg-brand-blue/15 border-brand-blue text-white shadow-sm ring-1 ring-brand-blue/50'
                                        : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/80 text-slate-300 hover:text-white'
                                }`}
                            >
                                <Sun className="size-4 text-amber-400" />
                                <div className="text-left">
                                    <div className="font-bold text-xs">Light Mode</div>
                                    <div className="text-[10px] text-slate-400">Steel & Clean White</div>
                                </div>
                                {theme === 'light' && <Check className="size-3.5 text-brand-blue ml-auto" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                        Preferences saved automatically to local storage
                    </span>
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="px-4 py-1.5 rounded-md bg-brand-blue text-slate-950 font-bold text-xs hover:bg-brand-blue/90 transition shadow cursor-pointer"
                    >
                        Done
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DisplaySettingsDialog;
