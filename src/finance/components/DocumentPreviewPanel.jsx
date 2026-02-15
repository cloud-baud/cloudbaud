import React, { useState } from 'react';
import { FileDown, Sparkles, X, Upload } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/lib/utils';

/**
 * A reusable Document Preview Panel that displays PDFs/Images.
 * It includes an optional "Run Extraction" action for AI processing.
 * 
 * Props:
 * - url: string | null (The file URL to display)
 * - onClose: () => void (Optional close handler)
 * - onExtract: () => void (Optional extraction handler)
 * - onUpload: () => void (Optional upload trigger if empty)
 * - className: string
 */
const DocumentPreviewPanel = ({ 
    url, 
    onClose, 
    onExtract, 
    onUpload,
    className 
}) => {
    const isDragging = false; // Placeholder for future drag logic

    return (
        <div className={cn("h-full flex flex-col bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800", className)}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <FileDown className="h-4 w-4" />
                    File Preview
                </h3>
                <div className="flex items-center gap-2">
                    {url && onExtract && (
                        <Button
                            type="button"
                            size="sm"
                            className="h-8 bg-brand-blue hover:bg-brand-blue/90 text-white shadow-sm flex items-center gap-2 px-3 transition-all"
                            onClick={onExtract}
                            title="Extract data from this document"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Run Extraction</span>
                        </Button>
                    )}
                    {onClose && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" 
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 overflow-hidden relative flex flex-col">
                {url ? (
                    <iframe
                        src={url}
                        className={cn("w-full h-full border rounded bg-white flex-1", isDragging && "pointer-events-none select-none")}
                        title="PDF Preview"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm mb-4">
                            <FileDown className="h-8 w-8 opacity-50" />
                        </div>
                        <p className="text-sm">No file selected</p>
                        {onUpload && (
                            <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={onUpload}>
                                <Upload className="h-4 w-4" /> Upload Document
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentPreviewPanel;
