import React, { useState, useEffect, useCallback } from 'react';
import {
    Cpu, Download, Trash2, Check, AlertCircle, RefreshCw, Server,
    HardDrive, Zap, Code, MessageSquare, BookOpen, Shield, Smartphone,
    Layers, Brain, ArrowLeft, X, Activity, Settings
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

const OLLAMA_BASE = 'http://localhost:11434';

// ── Curated Model Library ──────────────────────────────────────────
const MODEL_LIBRARY = [
    {
        name: 'smollm2:1.7b',
        displayName: 'SmolLM2',
        params: '1.7B',
        size: '~1.0 GB',
        family: 'HuggingFace',
        color: 'bg-purple-500',
        specialty: 'Rapid Prototyping',
        icon: Zap,
        tags: ['lightweight', 'fast', 'prototyping'],
        description: 'Ultra-compact model optimized for on-device use. Great for quick iterations and prototyping.',
        ram: '4 GB',
        vram: '2 GB',
    },
    {
        name: 'llama3.2:1b',
        displayName: 'Llama 3.2',
        params: '1B',
        size: '~0.7 GB',
        family: 'Meta',
        color: 'bg-blue-500',
        specialty: 'Mobile / Edge',
        icon: Smartphone,
        tags: ['edge', 'mobile', 'lightweight'],
        description: 'Meta\'s smallest Llama model, designed for mobile and edge deployments with minimal resources.',
        ram: '4 GB',
        vram: '2 GB',
    },
    {
        name: 'llama3.2:3b',
        displayName: 'Llama 3.2',
        params: '3B',
        size: '~2.0 GB',
        family: 'Meta',
        color: 'bg-blue-600',
        specialty: 'All-Rounder',
        icon: Layers,
        tags: ['general', 'balanced', 'chat'],
        description: 'Versatile mid-size model. Strong general performance across chat, reasoning, and instruction following.',
        ram: '8 GB',
        vram: '4 GB',
    },
    {
        name: 'phi3.5:3.8b',
        displayName: 'Phi-3.5 Mini',
        params: '3.8B',
        size: '~2.2 GB',
        family: 'Microsoft',
        color: 'bg-orange-500',
        specialty: 'Long-Context / RAG',
        icon: BookOpen,
        tags: ['rag', 'long-context', 'reasoning'],
        description: 'Microsoft\'s powerhouse for RAG systems. Handles book-length prompts with exceptional context retention.',
        ram: '8 GB',
        vram: '4 GB',
    },
    {
        name: 'qwen2.5:7b',
        displayName: 'Qwen 2.5',
        params: '7B',
        size: '~4.7 GB',
        family: 'Alibaba',
        color: 'bg-teal-500',
        specialty: 'Coding Specialist',
        icon: Code,
        tags: ['coding', 'reasoning', 'multilingual'],
        description: 'Leading code-generation model with strong reasoning and multilingual capabilities.',
        ram: '16 GB',
        vram: '6 GB',
    },
    {
        name: 'ministral:8b',
        displayName: 'Ministral 3',
        params: '8B',
        size: '~4.9 GB',
        family: 'Mistral AI',
        color: 'bg-amber-500',
        specialty: 'High Performance Edge',
        icon: Zap,
        tags: ['performance', 'edge', 'reasoning'],
        description: 'Mistral\'s edge-optimized model. Maximum performance in minimal space with strong reasoning.',
        ram: '16 GB',
        vram: '6 GB',
    },
    {
        name: 'gemma2:9b',
        displayName: 'Gemma 2',
        params: '9B',
        size: '~5.4 GB',
        family: 'Google',
        color: 'bg-yellow-500',
        specialty: 'Complex Instructions / Safety',
        icon: Shield,
        tags: ['safety', 'instructions', 'complex'],
        description: 'Google\'s safety-aligned model for complex instruction following and nuanced task execution.',
        ram: '16 GB',
        vram: '8 GB',
    },
];

// ── Helper: Parse model details ────────────────────────────────────
const parseModelInfo = (model) => {
    const sizeGB = (model.size / (1024 ** 3)).toFixed(1);
    const family = model.details?.family || 'Unknown';
    const paramSize = model.details?.parameter_size || '?';
    const quant = model.details?.quantization_level || 'N/A';
    return { sizeGB, family, paramSize, quant };
};

const getFamilyColor = (family) => {
    const map = {
        'llama': 'bg-blue-500',
        'gemma': 'bg-yellow-500',
        'phi': 'bg-orange-500',
        'qwen': 'bg-teal-500',
        'mistral': 'bg-amber-500',
        'deepseek': 'bg-indigo-500',
        'codellama': 'bg-emerald-500',
        'tinyllama': 'bg-pink-400',
        'smollm': 'bg-purple-500',
    };
    const key = Object.keys(map).find(k => family.toLowerCase().includes(k));
    return key ? map[key] : 'bg-slate-500';
};

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
const AiControlPlane = ({ activeModel, onModelChange, onClose }) => {
    const [tab, setTab] = useState('installed');
    const [installedModels, setInstalledModels] = useState([]);
    const [runningModels, setRunningModels] = useState([]);
    const [ollamaVersion, setOllamaVersion] = useState(null);
    const [isOnline, setIsOnline] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pullProgress, setPullProgress] = useState({}); // { modelName: { status, percent, total, completed } }
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // ── Fetch all data ─────────────────────────────────────────────
    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const [tagsRes, versionRes] = await Promise.all([
                fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(4000) }),
                fetch(`${OLLAMA_BASE}/api/version`, { signal: AbortSignal.timeout(4000) }),
            ]);

            if (tagsRes.ok) {
                const data = await tagsRes.json();
                setInstalledModels(data.models || []);
            }
            if (versionRes.ok) {
                const data = await versionRes.json();
                setOllamaVersion(data.version);
            }
            setIsOnline(true);

            // Running models (may not exist on older Ollama)
            try {
                const runRes = await fetch(`${OLLAMA_BASE}/api/ps`, { signal: AbortSignal.timeout(3000) });
                if (runRes.ok) {
                    const data = await runRes.json();
                    setRunningModels(data.models || []);
                }
            } catch { /* older Ollama versions may not support this */ }

        } catch {
            setIsOnline(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    // ── Pull a model ───────────────────────────────────────────────
    const pullModel = async (modelName) => {
        setPullProgress(prev => ({ ...prev, [modelName]: { status: 'Starting...', percent: 0 } }));

        try {
            const res = await fetch(`${OLLAMA_BASE}/api/pull`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: modelName }),
            });

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const lines = decoder.decode(value, { stream: true }).split('\n');
                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const json = JSON.parse(line);
                        const percent = json.total
                            ? Math.round((json.completed / json.total) * 100)
                            : 0;
                        setPullProgress(prev => ({
                            ...prev,
                            [modelName]: {
                                status: json.status || 'Downloading...',
                                percent,
                                total: json.total,
                                completed: json.completed,
                            }
                        }));
                    } catch { /* skip malformed lines */ }
                }
            }

            // Done
            setPullProgress(prev => {
                const next = { ...prev };
                delete next[modelName];
                return next;
            });
            refresh();
        } catch (err) {
            setPullProgress(prev => ({
                ...prev,
                [modelName]: { status: `Error: ${err.message}`, percent: 0 }
            }));
        }
    };

    // ── Delete a model ─────────────────────────────────────────────
    const deleteModel = async (modelName) => {
        try {
            await fetch(`${OLLAMA_BASE}/api/delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: modelName }),
            });
            setDeleteConfirm(null);
            refresh();
        } catch (err) {
            console.error('Failed to delete model', err);
        }
    };

    // ── Tab definitions ────────────────────────────────────────────
    const TABS = [
        { id: 'installed', label: 'Installed', icon: HardDrive },
        { id: 'library', label: 'Model Library', icon: Download },
        { id: 'status', label: 'Server', icon: Server },
    ];

    const installedNames = installedModels.map(m => m.name);
    const runningNames = runningModels.map(m => m.name);

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-brand-blue/10">
                        <Brain className="size-5 text-brand-blue" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold">AI Control Plane</h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={cn("size-2 rounded-full",
                                isOnline === null ? "bg-amber-500 animate-pulse" :
                                isOnline ? "bg-emerald-500" : "bg-red-500"
                            )} />
                            <span className="text-[10px] text-muted-foreground font-mono uppercase">
                                {isOnline === null ? 'Checking...' : isOnline ? `Ollama ${ollamaVersion || ''}` : 'Offline'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={refresh} className="h-8 w-8" title="Refresh">
                        <RefreshCw className={cn("size-4", loading && "animate-spin")} />
                    </Button>
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8" title="Back to Chat">
                            <X className="size-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border shrink-0">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 flex-1 justify-center",
                            tab === t.id
                                ? "text-brand-blue border-brand-blue"
                                : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                        )}
                    >
                        <t.icon className="size-3.5" />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                {/* ─── INSTALLED TAB ─────────────────────────────── */}
                {tab === 'installed' && (
                    <>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <RefreshCw className="size-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : !isOnline ? (
                            <OfflineMessage />
                        ) : installedModels.length === 0 ? (
                            <div className="text-center py-12 space-y-2">
                                <HardDrive className="size-10 text-slate-500 mx-auto" />
                                <p className="text-sm text-muted-foreground">No models installed.</p>
                                <Button variant="outline" size="sm" onClick={() => setTab('library')}>
                                    Browse Model Library
                                </Button>
                            </div>
                        ) : (
                            installedModels.map(model => {
                                const { sizeGB, family, paramSize, quant } = parseModelInfo(model);
                                const isActive = activeModel === model.name;
                                const isRunning = runningNames.includes(model.name);

                                return (
                                    <div key={model.name} className={cn(
                                        "rounded-lg border p-3 transition-all",
                                        isActive
                                            ? "border-brand-blue/50 bg-brand-blue/5"
                                            : "border-border bg-card hover:border-slate-600"
                                    )}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className={cn("size-9 rounded-lg flex items-center justify-center shrink-0 text-white text-[10px] font-bold",
                                                    getFamilyColor(family)
                                                )}>
                                                    {family.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm truncate">{model.name}</span>
                                                        {isActive && (
                                                            <span className="text-[9px] font-bold text-brand-blue bg-brand-blue/10 px-1.5 py-0.5 rounded uppercase">Active</span>
                                                        )}
                                                        {isRunning && (
                                                            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5">
                                                                <Activity className="size-2.5" /> Loaded
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground font-mono">
                                                        <span>{paramSize}</span>
                                                        <span className="text-slate-600">•</span>
                                                        <span>{sizeGB} GB</span>
                                                        <span className="text-slate-600">•</span>
                                                        <span>{quant}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                {!isActive && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 text-[10px] px-2"
                                                        onClick={() => onModelChange?.(model.name)}
                                                    >
                                                        <Check className="size-3 mr-1" /> Select
                                                    </Button>
                                                )}
                                                {deleteConfirm === model.name ? (
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="h-7 text-[10px] px-2"
                                                            onClick={() => deleteModel(model.name)}
                                                        >
                                                            Confirm
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 text-[10px] px-2"
                                                            onClick={() => setDeleteConfirm(null)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => setDeleteConfirm(model.name)}
                                                        title="Delete model"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </>
                )}

                {/* ─── LIBRARY TAB ──────────────────────────────── */}
                {tab === 'library' && (
                    <>
                        <p className="text-[11px] text-muted-foreground font-medium mb-2">
                            Top Small Language Models — click Pull to download via Ollama
                        </p>
                        {MODEL_LIBRARY.map(model => {
                            const isInstalled = installedNames.some(n => n.startsWith(model.name.split(':')[0]));
                            const progress = pullProgress[model.name];
                            const IconComp = model.icon;

                            return (
                                <div key={model.name} className="rounded-lg border border-border bg-card p-3 transition-all hover:border-slate-600">
                                    <div className="flex items-start gap-3">
                                        <div className={cn("size-10 rounded-lg flex items-center justify-center shrink-0 text-white", model.color)}>
                                            <IconComp className="size-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="font-semibold text-sm">{model.displayName}</span>
                                                    <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                        {model.params}
                                                    </span>
                                                </div>
                                                {isInstalled ? (
                                                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded shrink-0">
                                                        ✓ Installed
                                                    </span>
                                                ) : progress ? (
                                                    <span className="text-[10px] font-mono text-brand-blue shrink-0">
                                                        {progress.percent}%
                                                    </span>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 text-[10px] px-2 shrink-0"
                                                        onClick={() => pullModel(model.name)}
                                                        disabled={!isOnline}
                                                    >
                                                        <Download className="size-3 mr-1" /> Pull
                                                    </Button>
                                                )}
                                            </div>

                                            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{model.specialty}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{model.description}</p>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {model.tags.map(tag => (
                                                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Hardware Reqs */}
                                            <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-mono">
                                                <span>💾 {model.size}</span>
                                                <span>🖥️ RAM: {model.ram}</span>
                                                <span>🎮 VRAM: {model.vram}</span>
                                            </div>

                                            {/* Pull Progress Bar */}
                                            {progress && (
                                                <div className="mt-2 space-y-1">
                                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-brand-blue rounded-full transition-all duration-300"
                                                            style={{ width: `${progress.percent}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[9px] text-muted-foreground font-mono truncate">
                                                        {progress.status}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}

                {/* ─── SERVER STATUS TAB ─────────────────────────── */}
                {tab === 'status' && (
                    <>
                        {/* Connection Card */}
                        <div className="rounded-lg border border-border bg-card p-4">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Connection</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Status</span>
                                    <div className="flex items-center gap-2">
                                        <span className={cn("size-2.5 rounded-full",
                                            isOnline === null ? "bg-amber-500 animate-pulse" :
                                            isOnline ? "bg-emerald-500" : "bg-red-500"
                                        )} />
                                        <span className="text-sm font-medium">
                                            {isOnline === null ? 'Checking...' : isOnline ? 'Connected' : 'Offline'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Version</span>
                                    <span className="text-sm font-mono text-muted-foreground">{ollamaVersion || '—'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Endpoint</span>
                                    <span className="text-[11px] font-mono text-muted-foreground">{OLLAMA_BASE}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Models Installed</span>
                                    <span className="text-sm font-semibold">{installedModels.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Active Model</span>
                                    <span className="text-sm font-mono text-brand-blue">{activeModel || '—'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Running Models */}
                        <div className="rounded-lg border border-border bg-card p-4">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Running Models</h3>
                            {runningModels.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No models currently loaded in memory.</p>
                            ) : (
                                <div className="space-y-2">
                                    {runningModels.map(m => (
                                        <div key={m.name} className="flex items-center justify-between p-2 rounded bg-muted/50">
                                            <div className="flex items-center gap-2">
                                                <Activity className="size-3.5 text-emerald-500" />
                                                <span className="text-sm font-mono">{m.name}</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                {m.size ? `${(m.size / (1024**3)).toFixed(1)} GB` : ''}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Start */}
                        {!isOnline && <OfflineMessage />}
                    </>
                )}
            </div>
        </div>
    );
};

// ── Offline Help Message ───────────────────────────────────────────
const OfflineMessage = () => (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-amber-500" />
            <h4 className="text-sm font-semibold text-amber-400">Ollama is Offline</h4>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
            Start Ollama to use local AI models. Run one of these commands:
        </p>
        <div className="space-y-1.5">
            <code className="block text-[11px] bg-black/30 p-2 rounded font-mono text-slate-300">
                ollama serve
            </code>
            <code className="block text-[11px] bg-black/30 p-2 rounded font-mono text-slate-300">
                OLLAMA_ORIGINS="*" ollama serve
            </code>
        </div>
        <p className="text-[10px] text-slate-500">
            The second command enables CORS for browser access. Ollama listens on port 11434 by default.
        </p>
    </div>
);

export default AiControlPlane;
