import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    HardDrive, FolderOpen, Folder, FileText, Upload, RefreshCw,
    UserPlus, Check, X, ChevronRight, Plus, Loader2, Share2,
    ExternalLink, Trash2, AlertCircle, CheckCircle2, File,
    FileSpreadsheet, Image, Archive, LogOut, Cloud
} from 'lucide-react';
import { googleDriveService } from '@/workspace/services/googleDriveService';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';

// ─── Constants ───────────────────────────────────────────────────────────────
const CPA_NAME = import.meta.env.VITE_CPA_NAME ?? 'David Rumsey';
const CPA_EMAIL = import.meta.env.VITE_CPA_EMAIL_GOOGLE ?? 'davidr8415@gmail.com';
const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_YEAR_RANGE = [CURRENT_YEAR - 4, CURRENT_YEAR]; // show 5 years by default

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getMimeIcon(mimeType) {
    if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel'))
        return <FileSpreadsheet className="size-5 text-emerald-500" />;
    if (mimeType?.includes('document') || mimeType?.includes('word'))
        return <FileText className="size-5 text-blue-500" />;
    if (mimeType?.includes('presentation'))
        return <FileText className="size-5 text-amber-500" />;
    if (mimeType?.includes('pdf'))
        return <FileText className="size-5 text-red-500" />;
    if (mimeType?.includes('image'))
        return <Image className="size-5 text-purple-500" />;
    if (mimeType?.includes('zip') || mimeType?.includes('archive'))
        return <Archive className="size-5 text-slate-400" />;
    if (mimeType?.includes('folder'))
        return <Folder className="size-5 text-yellow-400" />;
    return <File className="size-5 text-slate-400" />;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ConnectScreen({ onConnect, isInitialising }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
            {/* Animated Drive Icon */}
            <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 via-green-400 to-yellow-400 flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-pulse">
                    <HardDrive className="size-12 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-background flex items-center justify-center">
                    <Cloud className="size-4 text-white" />
                </div>
            </div>

            <div className="space-y-2 max-w-sm">
                <h2 className="text-2xl font-bold text-foreground">Google Drive</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    Connect your <strong>jish.nath@cloudbaud.com</strong> Google account to browse
                    and manage your Drive files, organised by year.
                </p>
            </div>

            <button
                onClick={onConnect}
                disabled={isInitialising}
                className="flex items-center gap-3 px-6 py-3 bg-white text-slate-800 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200"
            >
                {isInitialising ? (
                    <Loader2 className="size-5 animate-spin text-slate-500" />
                ) : (
                    <svg className="size-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                )}
                {isInitialising ? 'Initialising...' : 'Sign in with Google'}
            </button>

            <p className="text-xs text-muted-foreground max-w-xs">
                Your files stay on Google Drive. CloudBaud only reads and organises them within this workspace.
            </p>
        </div>
    );
}

function YearSidebar({ years, selectedYear, onSelectYear, onCreateYear, isCreating }) {
    const displayYears = [];
    for (let y = CURRENT_YEAR; y >= CURRENT_YEAR - 6; y--) {
        displayYears.push(y);
    }

    return (
        <aside className="w-48 flex-shrink-0 flex flex-col border-r border-border bg-muted/30 h-full">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Years</span>
                <button
                    onClick={onCreateYear}
                    disabled={isCreating}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title={`Create ${CURRENT_YEAR} folder`}
                >
                    {isCreating ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
                {displayYears.map(year => {
                    const exists = years.find(f => f.name === String(year));
                    const isSelected = selectedYear?.name === String(year);

                    return (
                        <button
                            key={year}
                            onClick={() => exists && onSelectYear(exists)}
                            className={cn(
                                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group text-left',
                                isSelected
                                    ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/20'
                                    : exists
                                        ? 'text-foreground hover:bg-muted'
                                        : 'text-muted-foreground/40 cursor-not-allowed'
                            )}
                            disabled={!exists}
                            title={!exists ? `Click + to create ${year} folder` : undefined}
                        >
                            {exists ? (
                                isSelected
                                    ? <FolderOpen className="size-4 shrink-0" />
                                    : <Folder className="size-4 shrink-0 text-yellow-400" />
                            ) : (
                                <Folder className="size-4 shrink-0 opacity-30" />
                            )}
                            <span>{year}</span>
                            {!exists && (
                                <span className="ml-auto text-[10px] opacity-50">missing</span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Setup all years button */}
            <div className="p-3 border-t border-border">
                <button
                    onClick={onCreateYear}
                    className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 justify-center py-1.5 rounded hover:bg-muted transition-colors"
                >
                    <Plus className="size-3" />
                    Create missing years
                </button>
            </div>
        </aside>
    );
}

function FileGrid({ files, isLoading, selectedYear }) {
    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="size-8 animate-spin text-brand-blue" />
                    <span className="text-sm">Loading files...</span>
                </div>
            </div>
        );
    }

    if (!selectedYear) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
                <FolderOpen className="size-16 text-muted-foreground/20" />
                <div>
                    <h3 className="font-semibold text-foreground mb-1">Select a year</h3>
                    <p className="text-sm text-muted-foreground">Choose a year folder from the left panel to browse its contents.</p>
                </div>
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                    <FolderOpen className="size-8 text-muted-foreground/40" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground mb-1">No files in {selectedYear.name}</h3>
                    <p className="text-sm text-muted-foreground">Upload files using the button above to get started.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 gap-2">
                {files.map(file => (
                    <div
                        key={file.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-brand-blue/40 hover:shadow-sm transition-all duration-150 group"
                    >
                        <div className="shrink-0">
                            {getMimeIcon(file.mimeType)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {googleDriveService.constructor.mimeLabel(file.mimeType)} ·{' '}
                                {googleDriveService.constructor.formatSize(file.size)} ·{' '}
                                {file.modifiedTime
                                    ? new Date(file.modifiedTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                    : '—'}
                            </p>
                        </div>
                        {file.webViewLink && (
                            <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                                title="Open in Drive"
                            >
                                <ExternalLink className="size-4" />
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function ShareDialog({ year, onClose, onShare, isSharing, alreadyShared }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold">Share {year} Folder</h3>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                            <X className="size-4" />
                        </button>
                    </div>
                    <p className="text-sm text-muted-foreground">Grant access to your CPA for tax review.</p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* CPA Card */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {CPA_NAME[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-foreground">{CPA_NAME}</div>
                            <div className="text-sm text-muted-foreground truncate">{CPA_EMAIL}</div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">CPA · Tax Preparer</div>
                        </div>
                        {alreadyShared && (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                <Check className="size-3" />
                                Shared
                            </div>
                        )}
                    </div>

                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                        <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>
                            {CPA_NAME} will receive <strong>read-only</strong> access to your <strong>{year}</strong> folder.
                            They will be notified via Google Drive.
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-border rounded-xl font-medium text-sm hover:bg-muted transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onShare}
                        disabled={isSharing}
                        className="flex-1 px-4 py-2.5 bg-brand-blue text-white rounded-xl font-semibold text-sm hover:bg-brand-blue/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-brand-blue/20"
                    >
                        {isSharing ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Share2 className="size-4" />
                        )}
                        {isSharing ? 'Sharing...' : alreadyShared ? 'Re-share' : `Share with ${CPA_NAME.split(' ')[0]}`}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GoogleDrivePage() {
    const [isInitialising, setIsInitialising] = useState(false);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [yearFolders, setYearFolders] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [files, setFiles] = useState([]);
    const [isLoadingFolders, setIsLoadingFolders] = useState(false);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [isCreatingYear, setIsCreatingYear] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [sharedYears, setSharedYears] = useState(() => {
        try { return JSON.parse(localStorage.getItem('gdrive_shared_years') ?? '[]'); } catch { return []; }
    });
    const fileInputRef = useRef(null);

    // ── Auth status listener ──
    useEffect(() => {
        const connectedBefore = localStorage.getItem('google_drive_connected') === 'true';

        const init = async () => {
            try {
                setIsInitialising(true);
                await googleDriveService.init();
                if (connectedBefore) {
                    // Auto-prompt silently
                    googleDriveService.signIn();
                }
            } catch (e) {
                console.error('[GoogleDrive] Init error:', e);
                toast.error('Failed to initialise Google Drive.');
            } finally {
                setIsInitialising(false);
            }
        };

        const unsubscribe = googleDriveService.onStatusChange((status) => {
            const connected = status === 'connected';
            setIsSignedIn(connected);
            if (connected) loadYearFolders();
        });

        init();
        return unsubscribe;
    }, []);

    // ── Load year folders ──
    const loadYearFolders = useCallback(async () => {
        setIsLoadingFolders(true);
        try {
            const folders = await googleDriveService.listYearFolders();
            setYearFolders(folders);

            // Auto-select current year if it exists
            const current = folders.find(f => f.name === String(CURRENT_YEAR));
            if (current && !selectedYear) {
                setSelectedYear(current);
            }
        } catch (e) {
            toast.error(`Failed to load year folders: ${e.message}`);
        } finally {
            setIsLoadingFolders(false);
        }
    }, [selectedYear]);

    // ── Load files when year changes ──
    useEffect(() => {
        if (!selectedYear || !isSignedIn) return;

        let cancelled = false;
        setIsLoadingFiles(true);
        setFiles([]);

        googleDriveService.listFolderContents(selectedYear.id)
            .then(f => { if (!cancelled) setFiles(f); })
            .catch(e => { if (!cancelled) toast.error(`Failed to load files: ${e.message}`); })
            .finally(() => { if (!cancelled) setIsLoadingFiles(false); });

        return () => { cancelled = true; };
    }, [selectedYear, isSignedIn]);

    // ── Handlers ──
    const handleConnect = async () => {
        if (!googleDriveService._tokenClient) {
            setIsInitialising(true);
            await googleDriveService.init().catch(e => toast.error(e.message));
            setIsInitialising(false);
        }
        googleDriveService.signIn();
    };

    const handleDisconnect = async () => {
        await googleDriveService.signOut();
        setIsSignedIn(false);
        setYearFolders([]);
        setSelectedYear(null);
        setFiles([]);
        toast.info('Disconnected from Google Drive.');
    };

    const handleCreateMissingYears = async () => {
        setIsCreatingYear(true);
        try {
            const [from, to] = DEFAULT_YEAR_RANGE;
            await googleDriveService.ensureYearFolders(from, to);
            await loadYearFolders();
            toast.success(`Year folders ${from}–${to} are ready.`);
        } catch (e) {
            toast.error(`Failed to create year folders: ${e.message}`);
        } finally {
            setIsCreatingYear(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !selectedYear) return;
        e.target.value = '';

        const toastId = toast.loading(`Uploading ${file.name}...`);
        try {
            const uploaded = await googleDriveService.uploadFile(selectedYear.id, file);
            setFiles(prev => [uploaded, ...prev]);
            toast.success(`${file.name} uploaded.`, { id: toastId });
        } catch (err) {
            toast.error(`Upload failed: ${err.message}`, { id: toastId });
        }
    };

    const handleShare = async () => {
        if (!selectedYear) return;
        setIsSharing(true);
        try {
            await googleDriveService.shareYearFolderWithCpa(selectedYear.id, 'reader');
            const updated = [...new Set([...sharedYears, selectedYear.name])];
            setSharedYears(updated);
            localStorage.setItem('gdrive_shared_years', JSON.stringify(updated));
            toast.success(`${selectedYear.name} folder shared with ${CPA_NAME}.`);
            setShowShareDialog(false);
        } catch (e) {
            toast.error(`Share failed: ${e.message}`);
        } finally {
            setIsSharing(false);
        }
    };

    const isCurrentYearShared = selectedYear && sharedYears.includes(selectedYear.name);

    // ─────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* ── Top Bar ── */}
            <div className="flex-none flex items-center justify-between px-5 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-green-400 to-yellow-400 flex items-center justify-center shadow-md">
                        <HardDrive className="size-4 text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-foreground leading-none">Google Drive</h1>
                        {isSignedIn && (
                            <p className="text-xs text-muted-foreground mt-0.5">jish.nath@cloudbaud.com</p>
                        )}
                    </div>
                    {isSignedIn && (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 ml-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Connected
                        </span>
                    )}
                </div>

                {/* Actions */}
                {isSignedIn && (
                    <div className="flex items-center gap-2">
                        {/* Upload */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={!selectedYear}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-brand-blue/20"
                            title={!selectedYear ? 'Select a year first' : `Upload to ${selectedYear?.name}`}
                        >
                            <Upload className="size-4" />
                            Upload
                        </button>
                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />

                        {/* Share with David */}
                        <button
                            onClick={() => setShowShareDialog(true)}
                            disabled={!selectedYear}
                            className={cn(
                                'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                                isCurrentYearShared
                                    ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10'
                                    : 'border-border text-foreground hover:bg-muted'
                            )}
                            title={`Share ${selectedYear?.name} with ${CPA_NAME}`}
                        >
                            {isCurrentYearShared
                                ? <CheckCircle2 className="size-4" />
                                : <UserPlus className="size-4" />}
                            {isCurrentYearShared ? 'Shared with David' : 'Share with David'}
                        </button>

                        {/* Refresh */}
                        <button
                            onClick={loadYearFolders}
                            disabled={isLoadingFolders}
                            className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className={cn('size-4', isLoadingFolders && 'animate-spin')} />
                        </button>

                        {/* Disconnect */}
                        <button
                            onClick={handleDisconnect}
                            className="p-2 rounded-lg border border-border hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-500 transition-colors"
                            title="Disconnect Google Account"
                        >
                            <LogOut className="size-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* ── Body ── */}
            {!isSignedIn ? (
                <ConnectScreen onConnect={handleConnect} isInitialising={isInitialising} />
            ) : (
                <div className="flex flex-1 overflow-hidden">
                    {/* Year sidebar */}
                    <YearSidebar
                        years={yearFolders}
                        selectedYear={selectedYear}
                        onSelectYear={setSelectedYear}
                        onCreateYear={handleCreateMissingYears}
                        isCreating={isCreatingYear}
                    />

                    {/* File area */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Breadcrumb */}
                        {selectedYear && (
                            <div className="flex-none flex items-center gap-2 px-4 py-2.5 border-b border-border text-sm text-muted-foreground bg-muted/20">
                                <HardDrive className="size-3.5" />
                                <span>CloudBaud</span>
                                <ChevronRight className="size-3.5" />
                                <span className="font-medium text-foreground">{selectedYear.name}</span>
                                <span className="ml-auto text-xs">{files.length} item{files.length !== 1 ? 's' : ''}</span>
                            </div>
                        )}

                        <FileGrid
                            files={files}
                            isLoading={isLoadingFiles}
                            selectedYear={selectedYear}
                        />
                    </div>
                </div>
            )}

            {/* ── Share Dialog ── */}
            {showShareDialog && selectedYear && (
                <ShareDialog
                    year={selectedYear.name}
                    onClose={() => setShowShareDialog(false)}
                    onShare={handleShare}
                    isSharing={isSharing}
                    alreadyShared={isCurrentYearShared}
                />
            )}
        </div>
    );
}
