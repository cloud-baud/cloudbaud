import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { cn } from '@/shared/lib/utils';
import { AlertCircle } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * HighlightablePdfViewer — Headless PDF canvas renderer with redline highlighting.
 * Exposes controls via ref so the parent can provide its own toolbar.
 *
 * Props:
 *  - url: string            PDF file URL
 *  - searchTerm: string     The amount/text to find and highlight
 *  - className: string
 *  - onStateChange: (state) => void   Called when page/zoom/match state changes
 *
 * Ref API:
 *  - zoomIn()
 *  - zoomOut()
 *  - nextPage()
 *  - prevPage()
 *  - getState() => { currentPage, numPages, scale, matchCount }
 */
const HighlightablePdfViewer = forwardRef(({ url, searchTerm, className, onStateChange }, ref) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const pdfDocRef = useRef(null);

    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1.3);
    const [highlights, setHighlights] = useState([]); // PDF-space coords
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Notify parent of state changes
    useEffect(() => {
        onStateChange?.({ currentPage, numPages, scale, matchCount: highlights.length, loading, error });
    }, [currentPage, numPages, scale, highlights.length, loading, error]); // eslint-disable-line react-hooks/exhaustive-deps

    // Expose controls to parent via ref
    useImperativeHandle(ref, () => ({
        zoomIn: () => setScale(s => Math.min(3, s + 0.2)),
        zoomOut: () => setScale(s => Math.max(0.5, s - 0.2)),
        nextPage: () => setCurrentPage(p => Math.min(numPages, p + 1)),
        prevPage: () => setCurrentPage(p => Math.max(1, p - 1)),
        getState: () => ({ currentPage, numPages, scale, matchCount: highlights.length })
    }), [numPages, currentPage, scale, highlights.length]);

    // Load PDF document
    useEffect(() => {
        if (!url) return;

        let cancelled = false;
        setLoading(true);
        setError(null);
        setHighlights([]);

        const loadPdf = async () => {
            try {
                let loadingTask;
                const encodedUrl = encodeURI(url);

                if (url.startsWith('blob:') || url.startsWith('data:')) {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`Failed to fetch file (${response.status})`);
                    const data = await response.arrayBuffer();
                    loadingTask = pdfjsLib.getDocument({ data });
                } else {
                    // Try direct URL fetching via pdfjs
                    loadingTask = pdfjsLib.getDocument({
                        url: encodedUrl,
                        cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/',
                        cMapPacked: true,
                    });
                }

                const pdf = await loadingTask.promise;

                if (cancelled) return;
                pdfDocRef.current = pdf;
                setNumPages(pdf.numPages);
                setCurrentPage(1);

                if (searchTerm) {
                    await findTextInPdf(pdf, searchTerm);
                }

                setLoading(false);
            } catch (err) {
                console.warn('[HighlightablePdfViewer] Canvas load warning, attempting arrayBuffer fetch:', err);
                try {
                    const resp = await fetch(encodeURI(url));
                    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                    const arrayBuffer = await resp.arrayBuffer();
                    const task = pdfjsLib.getDocument({ data: arrayBuffer });
                    const pdf = await task.promise;
                    if (cancelled) return;
                    pdfDocRef.current = pdf;
                    setNumPages(pdf.numPages);
                    setCurrentPage(1);
                    setLoading(false);
                } catch (fallbackErr) {
                    console.error('[HighlightablePdfViewer] All PDF render attempts failed:', fallbackErr);
                    if (!cancelled) {
                        setError(fallbackErr.message || 'PDF Preview Unavailable');
                        setLoading(false);
                    }
                }
            }
        };

        loadPdf();
        return () => { cancelled = true; };
    }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

    // When searchTerm changes (same PDF), re-scan
    useEffect(() => {
        if (!pdfDocRef.current || !searchTerm) {
            setHighlights([]);
            return;
        }
        findTextInPdf(pdfDocRef.current, searchTerm);
    }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

    // Find text — stores in PDF-space coordinates (scale-independent)
    const findTextInPdf = async (pdf, term) => {
        if (!term) return;

        const normalizedTerm = term.replace(/[$,\s]/g, '').trim();
        const found = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();

            for (const item of textContent.items) {
                if (!item.str) continue;
                const normalizedText = item.str.replace(/[$,\s]/g, '').trim();

                if (normalizedText && normalizedTerm && normalizedText.includes(normalizedTerm)) {
                    const tx = item.transform;
                    const pdfX = tx[4];
                    const pdfY = tx[5];
                    const fontSize = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]);
                    const textWidth = item.width || (item.str.length * fontSize * 0.55);

                    found.push({
                        page: pageNum,
                        pdfX,
                        pdfY,
                        pdfW: textWidth,
                        pdfH: fontSize
                    });
                }
            }
        }

        setHighlights(found);

        // Jump to first match
        if (found.length > 0) {
            setCurrentPage(found[0].page);
        }
    };

    // Render current page
    useEffect(() => {
        if (!pdfDocRef.current || !canvasRef.current) return;

        let cancelled = false;

        const renderPage = async () => {
            const pdf = pdfDocRef.current;
            const page = await pdf.getPage(currentPage);
            const viewport = page.getViewport({ scale });

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: ctx, viewport }).promise;

            if (cancelled) return;

            drawHighlights(ctx, viewport, currentPage);
        };

        renderPage();
        return () => { cancelled = true; };
    }, [currentPage, scale, highlights]); // eslint-disable-line react-hooks/exhaustive-deps

    // roundRect fallback
    const safeRoundRect = (ctx, x, y, w, h, r) => {
        if (ctx.roundRect) {
            ctx.roundRect(x, y, w, h, r);
        } else {
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        }
    };

    // Draw highlights — converts PDF coords to current viewport pixels
    const drawHighlights = (ctx, viewport, pageNum) => {
        const pageHighlights = highlights.filter(h => h.page === pageNum);

        pageHighlights.forEach(hl => {
            const [vx1, vy1] = viewport.convertToViewportPoint(hl.pdfX, hl.pdfY);
            const [vx2, vy2] = viewport.convertToViewportPoint(hl.pdfX + hl.pdfW, hl.pdfY + hl.pdfH);

            const pad = 6;
            const x = Math.min(vx1, vx2) - pad;
            const y = Math.min(vy1, vy2) - pad;
            const w = Math.abs(vx2 - vx1) + pad * 2;
            const h = Math.abs(vy2 - vy1) + pad * 2;

            // Red glow
            ctx.save();
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            safeRoundRect(ctx, x - 2, y - 2, w + 4, h + 4, 6);
            ctx.fill();
            ctx.restore();

            // Red border
            ctx.save();
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            safeRoundRect(ctx, x, y, w, h, 4);
            ctx.stroke();
            ctx.restore();

            // Red dot
            ctx.save();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(x + w + 2, y - 2, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    };

    return (
        <div ref={containerRef} className={cn("overflow-auto flex justify-center items-start p-4 bg-transparent min-h-[300px] w-full", className)}>
            {error ? (
                <div className="w-full h-full flex flex-col items-center gap-2">
                    <div className="w-full flex items-center justify-between px-3 py-1.5 bg-[#12192c] border border-white/10 rounded-t text-xs">
                        <span className="text-amber-300 font-medium flex items-center gap-1.5">
                            <AlertCircle className="size-3.5" />
                            <span>Rendering via browser native PDF viewer</span>
                        </span>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-semibold transition"
                        >
                            Open in New Tab
                        </a>
                    </div>
                    <iframe
                        src={encodeURI(url)}
                        title="PDF Viewer Fallback"
                        className="w-full h-[650px] rounded-b border border-white/10 bg-white"
                    />
                </div>
            ) : loading ? (
                <div className="flex items-center justify-center h-full min-h-[200px] text-slate-400 text-sm">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                        <span className="text-xs text-white/60">Rendering PDF...</span>
                    </div>
                </div>
            ) : (
                <canvas
                    ref={canvasRef}
                    className="shadow-2xl rounded bg-white max-w-full"
                    style={{ imageRendering: 'auto' }}
                />
            )}
        </div>
    );
});

HighlightablePdfViewer.displayName = 'HighlightablePdfViewer';

export default HighlightablePdfViewer;
