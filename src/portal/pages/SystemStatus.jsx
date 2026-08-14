import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Activity, Database, Cloud, Cpu, Zap } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { supabase } from '@/shared/lib/supabase';

const SystemStatus = () => {
    const [statuses, setStatuses] = useState({
        supabase: { status: 'checking', message: '', latency: null },
        ollama: { status: 'checking', message: '', latency: null },
        pdfWorker: { status: 'checking', message: '', latency: null },
        netlify: { status: 'checking', message: '', latency: null },
        localStorage: { status: 'checking', message: '', latency: null }
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastCheck, setLastCheck] = useState(null);

    const checkSupabase = async () => {
        const start = Date.now();
        try {
            const { data, error } = await supabase.from('assessments').select('count', { count: 'exact', head: true });
            const latency = Date.now() - start;
            
            if (error) throw error;
            
            return {
                status: 'healthy',
                message: `Connected to ${supabase.supabaseUrl.includes('knhrygguhgfpimaogfkw') ? 'TEST' : 'PROD'} database`,
                latency
            };
        } catch (error) {
            return {
                status: 'error',
                message: `Connection failed: ${error.message}`,
                latency: Date.now() - start
            };
        }
    };

    const checkOllama = async () => {
        const start = Date.now();
        const endpoint = localStorage.getItem('ai_endpoint') || 'http://localhost:11434/api/tags';
        
        try {
            const response = await fetch(endpoint, { 
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            const latency = Date.now() - start;
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            const modelCount = data.models?.length || 0;
            
            return {
                status: 'healthy',
                message: `${modelCount} model(s) available`,
                latency
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.name === 'TimeoutError' ? 'Connection timeout' : `Not running: ${error.message}`,
                latency: Date.now() - start
            };
        }
    };

    const checkPdfWorker = async () => {
        const start = Date.now();
        const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        try {
            const response = await fetch(workerUrl, { 
                method: 'HEAD',
                signal: AbortSignal.timeout(5000)
            });
            const latency = Date.now() - start;
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            return {
                status: 'healthy',
                message: 'PDF.js worker accessible',
                latency
            };
        } catch (error) {
            return {
                status: 'error',
                message: `Worker unavailable: ${error.message}`,
                latency: Date.now() - start
            };
        }
    };

    const checkNetlify = async () => {
        const start = Date.now();
        
        try {
            // Check if we're running on Netlify or localhost
            const isNetlify = window.location.hostname.includes('netlify.app');
            const latency = Date.now() - start;
            
            return {
                status: 'healthy',
                message: isNetlify ? 'Running on Netlify' : 'Running locally',
                latency
            };
        } catch (error) {
            return {
                status: 'warning',
                message: 'Could not determine hosting',
                latency: Date.now() - start
            };
        }
    };

    const checkLocalStorage = async () => {
        const start = Date.now();
        
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            const latency = Date.now() - start;
            
            const itemCount = Object.keys(localStorage).length;
            
            return {
                status: 'healthy',
                message: `${itemCount} items stored`,
                latency
            };
        } catch (error) {
            return {
                status: 'error',
                message: `Storage unavailable: ${error.message}`,
                latency: Date.now() - start
            };
        }
    };

    const runAllChecks = async () => {
        setIsRefreshing(true);
        setStatuses({
            supabase: { status: 'checking', message: 'Checking...', latency: null },
            ollama: { status: 'checking', message: 'Checking...', latency: null },
            pdfWorker: { status: 'checking', message: 'Checking...', latency: null },
            netlify: { status: 'checking', message: 'Checking...', latency: null },
            localStorage: { status: 'checking', message: 'Checking...', latency: null }
        });

        const [supabaseResult, ollamaResult, pdfWorkerResult, netlifyResult, localStorageResult] = await Promise.all([
            checkSupabase(),
            checkOllama(),
            checkPdfWorker(),
            checkNetlify(),
            checkLocalStorage()
        ]);

        setStatuses({
            supabase: supabaseResult,
            ollama: ollamaResult,
            pdfWorker: pdfWorkerResult,
            netlify: netlifyResult,
            localStorage: localStorageResult
        });

        setLastCheck(new Date());
        setIsRefreshing(false);
    };

    useEffect(() => {
        runAllChecks();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle2 className="size-5 text-emerald-500" />;
            case 'warning':
                return <AlertCircle className="size-5 text-amber-500" />;
            case 'error':
                return <XCircle className="size-5 text-red-500" />;
            default:
                return <RefreshCw className="size-5 text-slate-400 animate-spin" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy':
                return 'border-emerald-500/20 bg-emerald-500/5';
            case 'warning':
                return 'border-amber-500/20 bg-amber-500/5';
            case 'error':
                return 'border-red-500/20 bg-red-500/5';
            default:
                return 'border-slate-300 bg-slate-50';
        }
    };

    const services = [
        { 
            key: 'supabase', 
            name: 'Supabase Database', 
            icon: Database,
            description: 'PostgreSQL database and authentication'
        },
        { 
            key: 'ollama', 
            name: 'Ollama AI', 
            icon: Cpu,
            description: 'Local AI model for document extraction'
        },
        { 
            key: 'pdfWorker', 
            name: 'PDF.js Worker', 
            icon: Activity,
            description: 'PDF text extraction engine'
        },
        { 
            key: 'netlify', 
            name: 'Hosting Platform', 
            icon: Cloud,
            description: 'Application hosting and deployment'
        },
        { 
            key: 'localStorage', 
            name: 'Browser Storage', 
            icon: Zap,
            description: 'Local settings and preferences'
        }
    ];

    const overallHealth = Object.values(statuses).every(s => s.status === 'healthy') ? 'healthy' :
                          Object.values(statuses).some(s => s.status === 'error') ? 'degraded' : 'warning';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                                System Status
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                Real-time health monitoring of all platform dependencies
                            </p>
                        </div>
                        <Button 
                            onClick={runAllChecks} 
                            disabled={isRefreshing}
                            className="gap-2"
                        >
                            <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
                            Refresh
                        </Button>
                    </div>

                    {/* Overall Status Banner */}
                    <div className={cn(
                        "p-6 rounded-xl border-2 transition-all",
                        overallHealth === 'healthy' && "border-emerald-500/30 bg-emerald-500/10",
                        overallHealth === 'warning' && "border-amber-500/30 bg-amber-500/10",
                        overallHealth === 'degraded' && "border-red-500/30 bg-red-500/10"
                    )}>
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "p-3 rounded-full",
                                overallHealth === 'healthy' && "bg-emerald-500/20",
                                overallHealth === 'warning' && "bg-amber-500/20",
                                overallHealth === 'degraded' && "bg-red-500/20"
                            )}>
                                {overallHealth === 'healthy' && <CheckCircle2 className="size-8 text-emerald-600" />}
                                {overallHealth === 'warning' && <AlertCircle className="size-8 text-amber-600" />}
                                {overallHealth === 'degraded' && <XCircle className="size-8 text-red-600" />}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {overallHealth === 'healthy' && 'All Systems Operational'}
                                    {overallHealth === 'warning' && 'Some Services Degraded'}
                                    {overallHealth === 'degraded' && 'System Issues Detected'}
                                </h2>
                                {lastCheck && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        Last checked: {lastCheck.toLocaleTimeString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Service Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map(service => {
                        const status = statuses[service.key];
                        const Icon = service.icon;

                        return (
                            <div
                                key={service.key}
                                className={cn(
                                    "p-6 rounded-xl border-2 transition-all hover:shadow-lg",
                                    getStatusColor(status.status)
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                        <Icon className="size-6 text-slate-700 dark:text-slate-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                                                {service.name}
                                            </h3>
                                            {getStatusIcon(status.status)}
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                            {service.description}
                                        </p>
                                        <div className="space-y-1">
                                            <p className={cn(
                                                "text-sm font-medium",
                                                status.status === 'healthy' && "text-emerald-700 dark:text-emerald-400",
                                                status.status === 'warning' && "text-amber-700 dark:text-amber-400",
                                                status.status === 'error' && "text-red-700 dark:text-red-400",
                                                status.status === 'checking' && "text-slate-600 dark:text-slate-400"
                                            )}>
                                                {status.message}
                                            </p>
                                            {status.latency !== null && (
                                                <p className="text-xs text-slate-500 dark:text-slate-500">
                                                    Response time: {status.latency}ms
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Environment Info */}
                <div className="mt-8 p-6 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <h3 className="font-semibold text-lg mb-4 text-slate-900 dark:text-white">Environment Information</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400">Hostname</p>
                            <p className="font-mono text-slate-900 dark:text-white">{window.location.hostname}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400">Protocol</p>
                            <p className="font-mono text-slate-900 dark:text-white">{window.location.protocol}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400">User Agent</p>
                            <p className="font-mono text-slate-900 dark:text-white truncate">{navigator.userAgent.split(' ')[0]}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400">Online Status</p>
                            <p className="font-mono text-slate-900 dark:text-white">{navigator.onLine ? 'Online' : 'Offline'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemStatus;

