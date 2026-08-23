import React, { useState, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';
import {
    Save, FileDown, Upload, Printer, Bold, Italic,
    AlignLeft, AlignCenter, AlignRight,
    Columns, Rows, Eraser, Lock, LockOpen, Filter, Undo, Redo,
    FileText, ChevronLeft, FileSpreadsheet, ListChecks,
    PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen,
    ExternalLink, CheckCircle2, AlertCircle, ShieldCheck,
    Globe, Car, Home, Sliders, RotateCcw, Link2, MessageSquare, Table, Sparkles
} from 'lucide-react';
import { Ribbon, RibbonButton, RibbonSeparator, RibbonGroup } from 'synolic.core';
import TaxAssumptionsModal from './TaxAssumptionsModal';
import {
    DEFAULT_TAX_ASSUMPTIONS,
    loadTaxAssumptions,
    saveTaxAssumptions,
    getAssumptionsForYear
} from '../data/taxAssumptions';
import { CONNECTED_TAX_NODES } from '../data/taxNamedRanges';

const DOC_BASE = '/src/workspace/data/Documents - Taxes';
const GDRIVE_URL = "https://drive.google.com/drive/folders/1bsHTGlWMp1j0fp_d2eDqiho1Ol0cMnzG?usp=sharing";

const YEAR_DOCUMENTS = {
    2025: { docs: [] },
    2024: {
        docs: [
            { id: 'w2', short: 'W-2 Dolly', label: 'Dolly W2 2024.pdf', status: 'tracked', file: 'Dolly W2 2024.pdf' },
            { id: '1099nec', short: '1099-NEC', label: 'Sankara Jish Nath 1099 Year 24.docx', status: 'tracked', file: 'Sankara Jish Nath 1099 Year 24.docx' },
            { id: '1099b', short: '1099-B Fidelity', label: 'Fidelity 9414 1099-B', status: 'empty', file: null },
            { id: 'schc', short: 'Sched C P&L', label: 'CloudBaud LLC 2024 P&L', status: 'empty', file: null },
        ]
    },
    2023: {
        docs: [
            { id: 'w2', short: 'W-2 Deepika', label: 'Deepika W2 2023.pdf', status: 'tracked', file: 'Deepika W2 2023.pdf' },
            { id: 'schc', short: 'Sched C', label: 'CloudBaud LLC 2023 P&L', status: 'empty', file: null },
            { id: 'health', short: 'Health Ins', label: 'NRI Essentials Payment Receipt', status: 'tracked', file: 'NRI_Essentials_AnnualReport_PaymentReceipt.pdf' },
        ]
    },
    2022: {
        docs: [
            { id: 'w2', short: 'W-2 Jishnu/Deepika', label: 'W-2 Wages ($95k)', status: 'empty', file: null },
            { id: '1099nec', short: '1099-NEC ($351k)', label: 'CloudBaud LLC Consulting', status: 'empty', file: null },
            { id: '1098_wr', short: '1098 Woodridge', label: 'Form 1098 Mortgage Interest', status: 'empty', file: null },
            { id: 'proptax_wr', short: 'Prop Tax Woodridge', label: 'King County Tax Statement', status: 'empty', file: null },
            { id: 'rental_oc', short: 'Rental Olympic Ct', label: 'CAD 17,520 Lease + CAD Expenses', status: 'empty', file: null },
            { id: 'rental_cc', short: 'Rental Cherry Crest', label: '$26,760 Lease + HOA ($5,012)', status: 'empty', file: null },
        ]
    },
    2021: {
        docs: [
            { id: 'w2', short: 'W-2', label: 'W-2 from employer', status: 'empty', file: null },
            { id: 'schc', short: 'Sched C', label: 'Schedule C P&L', status: 'tracked', file: 'business expenses CloudBaud 2021.xlsx' },
            { id: '1098', short: '1098', label: '1098 (mortgage interest)', status: 'tracked', file: 'GetDocument.pdf' },
            { id: 'rental', short: 'Rental', label: 'Rental income/expenses', status: 'tracked', file: 'CherryCrest_1099_2021.pdf' },
        ]
    },
    2020: {
        consolidated: { label: 'Tax Items', file: '2020 Consolidated Tax Items Jishnu & Deepika Nath.xlsx' },
        docs: [
            { id: 'schc', short: 'Sched C', label: 'Schedule C P&L', status: 'tracked', file: 'business expenses CloudBaud 2020.xlsx' },
            { id: '1098', short: '1098', label: '1098 mortgage interest', status: 'tracked', file: 'Mortgage.pdf' },
            { id: 'proptax', short: 'Prop Tax', label: 'Property tax statement', status: 'tracked', file: 'Condo real estate tax.docx' },
            { id: 'rental', short: 'Rental', label: 'Rental income', status: 'tracked', file: 'CherryCrest_1099_2020.pdf' },
        ]
    },
    2019: {
        consolidated: { label: 'Tax Items', file: '2019 Consolidated Tax Items Jishnu & Deepika Nath.xlsx' },
        docs: [
            { id: 'w2', short: 'W-2', label: '2019 W2.pdf', status: 'tracked', file: '2019 W2.pdf' },
            { id: '1099b', short: '1099-B', label: 'Fidelity 1099', status: 'tracked', file: '2019-Fidelity-9414-Consolidated-Form-1099.pdf' },
            { id: '1098', short: '1098', label: 'Mortgage 1098', status: 'tracked', file: 'Mortgage_1098.pdf' },
            { id: 'rental', short: 'Rental', label: 'Cherry Crest 1099', status: 'tracked', file: 'CherryCrest_1099_2019.pdf' },
        ]
    },
    2018: {
        consolidated: { label: 'Tax Items', file: '2018 Consolidated Tax Items Jishnu & Deepika Nath.xlsx' },
        docs: [
            { id: 'w2', short: 'W-2', label: '2018 W2.pdf', status: 'tracked', file: '2018 W2.pdf' },
            { id: '1099b', short: '1099-B', label: '1099-B Woodridge', status: 'tracked', file: '2018-Woodridge-7692-Consolidated-Form-1099.pdf' },
            { id: 'schc', short: 'Sched C', label: 'Schedule C P&L', status: 'tracked', file: 'business expenses CloudBaud 2018.xlsx' },
            { id: '1098', short: '1098', label: 'Mortgage 1098', status: 'tracked', file: 'Mortgage.pdf' },
        ]
    },
    2017: {
        consolidated: { label: 'Form 1040', file: 'Nath2017Form1040.pdf' },
        docs: [
            { id: 'w2', short: 'W-2', label: '2017 W2.pdf', status: 'tracked', file: '2017 W2.pdf' },
            { id: '1098', short: '1098', label: 'Mortgage 1098', status: 'tracked', file: '2017_1098_Mortgage Interest.pdf' },
            { id: 'ira', short: 'SEP-IRA', label: 'Form 5498', status: 'tracked', file: '2017-SEP-IRA-OLD-5224-Form-5498.pdf' },
        ]
    }
};

export { DOC_BASE, YEAR_DOCUMENTS };

/**
 * Common Master Tax Ribbon — full-width common component spanning across
 * Pane 1 (Worksheet) + Pane 2 (Supporting Docs) + Pane 3 (Form 1040 Return).
 */
export default function TaxRibbon({
    activeYear = 2022,
    years = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017],
    viewMode = 'three_pane',
    activeSheet = 'googlesheet',
    onActiveSheetChange,
    onYearChange,
    onDocPreview,
    onSave,
    onOpenReturn,
    onUpload,
    isDocsCollapsed = false,
    setIsDocsCollapsed,
    isFormCollapsed = false,
    setIsFormCollapsed,
    activeConnectedNode,
    setActiveConnectedNode,
    hoveredConnectedNode,
    setHoveredConnectedNode,
    entries = [],
    accounts = [],
    googleSheetUrl = "https://docs.google.com/spreadsheets/d/1QubZfLE5OC8RuhhljIBvj7dUeWN3UwefYxrtH0HSiGY/edit?usp=sharing"
}) {
    const [activeRibbonTab, setActiveRibbonTab] = useState('home');
    const [isAssumptionsModalOpen, setIsAssumptionsModalOpen] = useState(false);
    const [assumptionsMatrix, setAssumptionsMatrix] = useState(() => loadTaxAssumptions());
    const [activeYearAssumptions, setActiveYearAssumptions] = useState(() => getAssumptionsForYear(activeYear));

    // Sync active year assumptions
    useEffect(() => {
        setActiveYearAssumptions(getAssumptionsForYear(activeYear, assumptionsMatrix));
    }, [activeYear, assumptionsMatrix]);

    // Cross-tab / update listener
    useEffect(() => {
        const handler = (e) => {
            if (e.detail) {
                setAssumptionsMatrix(e.detail);
                setActiveYearAssumptions(getAssumptionsForYear(activeYear, e.detail));
            }
        };
        window.addEventListener('tax-assumptions-updated', handler);
        return () => window.removeEventListener('tax-assumptions-updated', handler);
    }, [activeYear]);

    const handleInlineAssumptionChange = (field, value) => {
        const num = parseFloat(value);
        const updated = {
            ...activeYearAssumptions,
            [field]: isNaN(num) ? value : num
        };

        if (field === 'cadToUsd' || field === 'inrToUsd') {
            const cad = field === 'cadToUsd' ? num : updated.cadToUsd;
            const inr = field === 'inrToUsd' ? num : updated.inrToUsd;
            if (cad > 0 && inr > 0) {
                updated.inrToCad = parseFloat((inr / cad).toFixed(6));
            }
        }

        setActiveYearAssumptions(updated);
        const nextMatrix = {
            ...assumptionsMatrix,
            [activeYear]: updated
        };
        setAssumptionsMatrix(nextMatrix);
        saveTaxAssumptions(nextMatrix);
    };

    const yearDocs = YEAR_DOCUMENTS[activeYear] || { docs: [] };
    const tracked = yearDocs.docs?.filter(d => d.status === 'tracked') || [];
    const empty = yearDocs.docs?.filter(d => d.status !== 'tracked') || [];

    const renderChip = (doc) => (
        <button
            key={doc.id}
            className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border transition-all whitespace-nowrap",
                doc.status === 'tracked'
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20",
                doc.file ? "cursor-pointer" : "cursor-pointer opacity-80"
            )}
            title={`${doc.label}${doc.file ? ` — Click to view ${doc.file}` : ' — Needs Upload'}`}
            onClick={() => {
                if (doc.file) {
                    onDocPreview?.(`${DOC_BASE}/${activeYear}/${doc.file}`);
                }
            }}
        >
            <span className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                doc.status === 'tracked' ? "bg-emerald-400" : "bg-amber-400"
            )} />
            {doc.short}
        </button>
    );

    return (
        <div className="w-full bg-[#0d1424] text-white border-b border-white/15 select-none shrink-0 shadow-md">
            {/* Modal */}
            <TaxAssumptionsModal
                isOpen={isAssumptionsModalOpen}
                onClose={() => setIsAssumptionsModalOpen(false)}
                activeYear={activeYear}
                onAssumptionsSaved={(updated) => {
                    setAssumptionsMatrix(updated);
                    setActiveYearAssumptions(getAssumptionsForYear(activeYear, updated));
                }}
            />

            {/* Top Bar: Office-style Tabs + Sheet Switcher + Global Year Switcher */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-2 sm:px-3 pt-1.5 border-b border-white/10 bg-[#090d18] text-xs gap-1.5">
                {/* Ribbon Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar whitespace-nowrap">
                    <button
                        onClick={() => setActiveRibbonTab('file')}
                        className={`px-3 py-1 sm:px-3.5 sm:py-1.5 font-bold rounded-t flex items-center gap-1.5 transition text-xs shrink-0 ${
                            activeRibbonTab === 'file'
                                ? 'bg-emerald-700 text-white border-t-2 border-emerald-300 shadow-sm'
                                : 'bg-emerald-800/80 hover:bg-emerald-700 text-white/90'
                        }`}
                        title="File Menu (Save, Upload, Export, Print)"
                    >
                        <FileSpreadsheet className="size-3.5" />
                        <span>File</span>
                    </button>

                    {[
                        { id: 'home', label: 'Home / Worksheet' },
                        { id: 'assumptions', label: '⚙️ Assumptions & FX' },
                        { id: 'docs', label: 'Checklist (65 Docs)' },
                        { id: 'form1040', label: 'Form 1040 Return' },
                        { id: 'view', label: 'View & Panes' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveRibbonTab(tab.id)}
                            className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-t transition text-xs font-semibold shrink-0 ${
                                activeRibbonTab === tab.id
                                    ? 'bg-[#141e33] text-white border-t-2 border-blue-400 font-bold shadow-sm'
                                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Right Side: Worksheet View Mode Selector + Assumptions Pill + Year Selector */}
                <div className="flex items-center gap-1.5 sm:gap-2 pb-1 overflow-x-auto no-scrollbar justify-between sm:justify-end shrink-0">
                    {/* Integrated Sheet Mode Switcher */}
                    <div className="flex items-center gap-0.5 bg-[#060a14] p-0.5 rounded-lg border border-white/15 text-xs shrink-0">
                        <button
                            onClick={() => onActiveSheetChange?.('googlesheet')}
                            className={`px-2 py-0.5 rounded font-semibold flex items-center gap-1 transition text-[11px] ${
                                activeSheet === 'googlesheet'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                            title="Live Connected Google Sheet shared with David Rumsey (CPA)"
                        >
                            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="hidden sm:inline">Live Google Sheet</span>
                            <span className="sm:hidden">Sheet</span>
                        </button>
                        <button
                            onClick={() => onActiveSheetChange?.('worksheet')}
                            className={`px-2 py-0.5 rounded font-semibold flex items-center gap-1 transition text-[11px] ${
                                activeSheet === 'worksheet'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                            title="High-density interactive calculation grid linked to Form 1040"
                        >
                            <Table className="size-3" />
                            <span className="hidden sm:inline">Calculation Grid</span>
                            <span className="sm:hidden">Grid</span>
                        </button>
                        <button
                            onClick={() => onActiveSheetChange?.('xlsx_master')}
                            className={`px-2 py-0.5 rounded font-semibold flex items-center gap-1 transition text-[11px] ${
                                activeSheet === 'xlsx_master'
                                    ? 'bg-purple-600 text-white shadow-sm'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                            title="Preview Consolidated Tax Items Excel workbook"
                        >
                            <FileSpreadsheet className="size-3" />
                            <span className="hidden sm:inline">Consolidated XLSX</span>
                            <span className="sm:hidden">XLSX</span>
                        </button>
                    </div>

                    {/* Live Tax Assumptions Quick Pill Bar */}
                    <button
                        onClick={() => setIsAssumptionsModalOpen(true)}
                        className="hidden xl:flex items-center gap-2 px-2 py-0.5 bg-[#10192e] hover:bg-[#16223e] border border-blue-500/30 rounded text-[11px] font-mono transition shadow-sm shrink-0"
                        title="Click to view & edit full 9-Year Tax Assumptions Matrix (2017–2025)"
                    >
                        <span className="text-blue-300 font-semibold flex items-center gap-1">
                            <span>🇨🇦</span>
                            <span>{activeYearAssumptions.cadToUsd}</span>
                        </span>
                        <span className="text-white/20">|</span>
                        <span className="text-orange-300 font-semibold flex items-center gap-1">
                            <span>🇮🇳</span>
                            <span>{activeYearAssumptions.inrToUsd}</span>
                        </span>
                    </button>

                    {/* Tax Year Picker Dropdown */}
                    <div className="flex items-center gap-1 bg-[#060a14] px-2 py-0.5 rounded border border-white/15 shrink-0">
                        <span className="text-[10px] text-white/50 font-semibold uppercase hidden sm:inline">Year:</span>
                        <select
                            value={activeYear}
                            onChange={(e) => onYearChange?.(parseInt(e.target.value, 10))}
                            className="bg-transparent text-xs font-bold text-blue-300 outline-none cursor-pointer"
                        >
                            {years.map(y => (
                                <option key={y} value={y} className="bg-[#0b101c] text-white">
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Lower Ribbon Content Bar */}
            <div className="px-2 sm:px-3 py-1.5 bg-[#121b2d] flex items-center justify-start sm:justify-between gap-2 sm:gap-4 overflow-x-auto no-scrollbar min-h-[44px] whitespace-nowrap">
                {/* ── FILE TAB ── */}
                {activeRibbonTab === 'file' && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onSave}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                            title="Save all changes to Worksheet and Document cache"
                        >
                            <Save className="size-3.5" />
                            <span>Save Changes</span>
                        </button>

                        <button
                            onClick={onUpload}
                            className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white rounded text-xs font-medium flex items-center gap-1.5 transition border border-white/10"
                            title="Upload Supporting Document or Spreadsheet"
                        >
                            <Upload className="size-3.5 text-blue-400" />
                            <span>Upload File</span>
                        </button>

                        <div className="h-5 w-px bg-white/10" />

                        <button
                            onClick={() => window.print()}
                            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/80 rounded text-xs font-medium flex items-center gap-1.5 transition"
                            title="Print active worksheet or return"
                        >
                            <Printer className="size-3.5 text-slate-400" />
                            <span>Print</span>
                        </button>

                        <a
                            href={GDRIVE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded text-xs font-medium flex items-center gap-1.5 transition"
                        >
                            <ExternalLink className="size-3.5" />
                            <span>Google Drive Tax Folder</span>
                        </a>
                    </div>
                )}

                {/* ── HOME / WORKSHEET TAB ── */}
                {activeRibbonTab === 'home' && (
                    <div className="flex items-center justify-between gap-3 w-full overflow-x-auto no-scrollbar">
                        {/* Section 1: Live Google Sheet Controls or Standard Worksheet Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                            {activeSheet === 'googlesheet' ? (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 bg-[#080e1a] px-2 py-1 rounded border border-emerald-500/30">
                                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                        <span className="text-[10px] text-emerald-300 font-mono font-semibold">Shared CPA Master</span>
                                        <span className="text-white/20">|</span>
                                        <span className="text-[10px] text-amber-300 font-mono flex items-center gap-1">
                                            <span className="size-1 rounded-full bg-amber-400"></span>
                                            <span>Range Sync</span>
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => window.dispatchEvent(new CustomEvent('tax_ribbon_toggle_comments'))}
                                        className="text-[11px] px-2 py-1 rounded flex items-center gap-1.5 font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/15 shadow-sm transition"
                                        title="Toggle Google Sheets Comments & Discussion Sidebar"
                                    >
                                        <MessageSquare className="size-3 text-blue-400" />
                                        <span>Comments</span>
                                        <span className="px-1 py-0.2 rounded bg-blue-500/30 text-[9px] font-mono text-blue-200">146</span>
                                    </button>

                                    <button
                                        onClick={() => window.dispatchEvent(new CustomEvent('tax_ribbon_edit_sheet_url'))}
                                        className="text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/15 px-2 py-1 rounded flex items-center gap-1 font-medium transition"
                                        title="Update Google Sheet URL"
                                    >
                                        <span>Change URL</span>
                                    </button>

                                    <button
                                        onClick={() => onActiveSheetChange?.('worksheet')}
                                        className="text-[11px] text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 px-2 py-1 rounded flex items-center gap-1 font-semibold transition"
                                        title="View cell highlights in calculation matrix"
                                    >
                                        <Table className="size-3" />
                                        <span>Show Highlights</span>
                                    </button>

                                    <a
                                        href={googleSheetUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[11px] px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded flex items-center gap-1 font-semibold transition"
                                        title="Open live Google Spreadsheet in new tab"
                                    >
                                        <ExternalLink className="size-3" />
                                        <span>Open Sheet</span>
                                    </a>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    {/* Font / Text Styling */}
                                    <div className="flex items-center gap-1 bg-[#090e18] p-0.5 rounded border border-white/10">
                                        <button className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white" title="Bold">
                                            <Bold className="size-3.5" />
                                        </button>
                                        <button className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white" title="Italic">
                                            <Italic className="size-3.5" />
                                        </button>
                                        <div className="h-3.5 w-px bg-white/10 mx-0.5" />
                                        <button className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white" title="Align Left">
                                            <AlignLeft className="size-3.5" />
                                        </button>
                                        <button className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white" title="Align Center">
                                            <AlignCenter className="size-3.5" />
                                        </button>
                                        <button className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white" title="Align Right">
                                            <AlignRight className="size-3.5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-1 bg-[#090e18] px-2 py-1 rounded border border-white/10">
                                        <Lock className="size-3.5 text-amber-400" />
                                        <span className="text-[11px] text-white/70 font-medium">Protect</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-5 w-px bg-white/15 hidden md:block" />

                        {/* Section 2: Integrated 3-Panel Trace Nodes & Breadcrumb */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold text-[11px] shrink-0">
                                <Link2 className="size-3.5 text-cyan-400 animate-pulse" />
                                <span className="hidden sm:inline">3-Panel Trace:</span>
                                <span className="sm:hidden">Trace:</span>
                            </div>

                            {/* Quick Connection Node Selectors */}
                            <div className="flex items-center gap-1 shrink-0">
                                {Object.values(CONNECTED_TAX_NODES).map(node => {
                                    const isActive = activeConnectedNode === node.id;
                                    const cellCoord = node.yearCoords[activeYear] || node.cellCoord2022;
                                    return (
                                        <button
                                            key={node.id}
                                            onClick={() => setActiveConnectedNode?.(isActive ? null : node.id)}
                                            onMouseEnter={() => setHoveredConnectedNode?.(node.id)}
                                            onMouseLeave={() => setHoveredConnectedNode?.(null)}
                                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition flex items-center gap-1 border shadow-sm ${
                                                isActive
                                                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 font-bold ring-1 ring-cyan-400'
                                                    : 'bg-slate-900/80 hover:bg-slate-800 text-white/70 hover:text-white border-white/10'
                                            }`}
                                            title={node.description}
                                        >
                                            <span className="font-mono text-[9px] text-amber-300 bg-amber-950/80 px-1 rounded border border-amber-400/30 font-bold">
                                                {cellCoord}
                                            </span>
                                            <span className="truncate max-w-[90px]">{node.title.split('(')[0]}</span>
                                            {isActive && <span className="size-1 rounded-full bg-cyan-400 animate-ping" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Active Breadcrumb Flow Indicator */}
                            {activeConnectedNode && (() => {
                                const node = CONNECTED_TAX_NODES[activeConnectedNode];
                                if (!node) return null;
                                const cellCoord = node.yearCoords[activeYear] || node.cellCoord2022;
                                const entryVal = entries.find(e => {
                                    const acc = accounts.find(a => a.name === node.accountName);
                                    return acc && e.category_id === acc.id;
                                })?.amount || node.amount2022;

                                return (
                                    <div className="flex items-center gap-1.5 text-[10px] shrink-0">
                                        <div className="flex items-center gap-1 text-slate-200 bg-slate-950/90 border border-cyan-500/40 rounded px-2 py-0.5 font-mono shadow-sm">
                                            <span className="text-amber-300 font-bold">[{cellCoord}: ${Number(entryVal).toLocaleString(undefined, { minimumFractionDigits: 2 })}]</span>
                                            <span className="text-cyan-400 font-bold">⟷</span>
                                            <span className="text-blue-300 font-semibold">Checklist [{node.checklistNum}]</span>
                                            <span className="text-cyan-400 font-bold">⟷</span>
                                            <span className="text-purple-300 font-semibold">1040 [{node.form1040LineLabel}]</span>
                                        </div>
                                        <button
                                            onClick={() => setActiveConnectedNode?.(null)}
                                            className="text-white/40 hover:text-white text-[10px] underline"
                                            title="Clear active 3-panel highlight"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {/* ── ASSUMPTIONS & FX TAB ── */}
                {activeRibbonTab === 'assumptions' && (
                    <div className="flex items-center gap-4 flex-wrap text-xs">
                        <div className="flex items-center gap-3">
                            {/* CAD to USD */}
                            <div className="flex items-center gap-1.5 bg-[#090e18] px-2 py-1 rounded border border-blue-500/30">
                                <span className="text-[11px] font-semibold text-blue-300">🇨🇦 CAD/USD:</span>
                                <input
                                    type="number"
                                    step="0.000001"
                                    value={activeYearAssumptions.cadToUsd ?? ''}
                                    onChange={(e) => handleInlineAssumptionChange('cadToUsd', e.target.value)}
                                    className="w-20 bg-black/40 border border-white/15 rounded px-1.5 py-0.5 font-mono text-white text-right outline-none text-xs focus:border-blue-400"
                                />
                            </div>

                            {/* INR to USD */}
                            <div className="flex items-center gap-1.5 bg-[#090e18] px-2 py-1 rounded border border-orange-500/30">
                                <span className="text-[11px] font-semibold text-orange-300">🇮🇳 INR/USD:</span>
                                <input
                                    type="number"
                                    step="0.0000001"
                                    value={activeYearAssumptions.inrToUsd ?? ''}
                                    onChange={(e) => handleInlineAssumptionChange('inrToUsd', e.target.value)}
                                    className="w-24 bg-black/40 border border-white/15 rounded px-1.5 py-0.5 font-mono text-white text-right outline-none text-xs focus:border-orange-400"
                                />
                            </div>

                            {/* Mileage */}
                            <div className="flex items-center gap-1.5 bg-[#090e18] px-2 py-1 rounded border border-emerald-500/30">
                                <span className="text-[11px] font-semibold text-emerald-300">🚗 Mileage:</span>
                                <span className="text-white/50">$</span>
                                <input
                                    type="number"
                                    step="0.005"
                                    value={activeYearAssumptions.mileageRate ?? ''}
                                    onChange={(e) => handleInlineAssumptionChange('mileageRate', e.target.value)}
                                    className="w-16 bg-black/40 border border-white/15 rounded px-1.5 py-0.5 font-mono text-white text-right outline-none text-xs focus:border-emerald-400"
                                />
                            </div>

                            {/* Home Office % */}
                            <div className="flex items-center gap-1.5 bg-[#090e18] px-2 py-1 rounded border border-cyan-500/30">
                                <span className="text-[11px] font-semibold text-cyan-300">🏠 Home Use:</span>
                                <input
                                    type="number"
                                    step="1"
                                    value={activeYearAssumptions.homeUsePercent ?? ''}
                                    onChange={(e) => handleInlineAssumptionChange('homeUsePercent', e.target.value)}
                                    className="w-14 bg-black/40 border border-white/15 rounded px-1.5 py-0.5 font-mono text-white text-right outline-none text-xs focus:border-cyan-400"
                                />
                                <span className="text-white/50">%</span>
                            </div>
                        </div>

                        <div className="h-6 w-px bg-white/10" />

                        {/* Open Full Matrix Modal */}
                        <button
                            onClick={() => setIsAssumptionsModalOpen(true)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 shadow-sm transition"
                        >
                            <Sliders className="size-3.5" />
                            <span>Open 9-Year Assumptions Matrix (2017–2025)</span>
                        </button>
                    </div>
                )}

                {/* ── SUPPORTING DOCS TAB ── */}
                {activeRibbonTab === 'docs' && (
                    <div className="flex items-center gap-3 flex-1 overflow-x-auto">
                        <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[11px] font-semibold text-white/70">
                                {activeYear} Document Repository:
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                                {tracked.length} Attached
                            </span>
                            {empty.length > 0 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                                    {empty.length} Needed
                                </span>
                            )}
                        </div>

                        <div className="h-6 w-px bg-white/10 shrink-0" />

                        {/* Quick Document Chips */}
                        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                            {yearDocs.docs?.length > 0 ? (
                                yearDocs.docs.map(renderChip)
                            ) : (
                                <span className="text-[11px] text-white/40 italic">
                                    Use the Master Checklist or upload docs directly for {activeYear}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* ── FORM 1040 RETURN TAB ── */}
                {activeRibbonTab === 'form1040' && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="size-4 text-emerald-400" />
                            <span className="font-bold text-xs text-white">
                                {activeYear} Form 1040 & Schedules Return
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                                Interactive IRS 1040 Reconciliation
                            </span>
                        </div>

                        <div className="h-6 w-px bg-white/10" />

                        <button
                            onClick={() => onDocPreview?.(`/src/workspace/data/Documents - Taxes/${activeYear}/Nath${activeYear}Form1040.pdf`)}
                            className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition border border-white/10"
                        >
                            <FileText className="size-3.5 text-blue-400" />
                            <span>Preview Filed 1040 PDF</span>
                        </button>
                    </div>
                )}

                {/* ── VIEW & PANES TAB ── */}
                {activeRibbonTab === 'view' && (
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] text-white/50 font-medium">Panel Visibility:</span>

                        <button
                            onClick={() => setIsDocsCollapsed?.(!isDocsCollapsed)}
                            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition border ${
                                isDocsCollapsed
                                    ? 'bg-white/5 text-white/50 border-white/10 hover:text-white'
                                    : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30 font-semibold'
                            }`}
                        >
                            {isDocsCollapsed ? <PanelLeftOpen className="size-3.5" /> : <PanelLeftClose className="size-3.5" />}
                            <span>Supporting Docs Panel: {isDocsCollapsed ? 'Collapsed' : 'Expanded'}</span>
                        </button>

                        <button
                            onClick={() => setIsFormCollapsed?.(!isFormCollapsed)}
                            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition border ${
                                isFormCollapsed
                                    ? 'bg-white/5 text-white/50 border-white/10 hover:text-white'
                                    : 'bg-blue-600/20 text-blue-300 border-blue-500/30 font-semibold'
                            }`}
                        >
                            {isFormCollapsed ? <PanelRightOpen className="size-3.5" /> : <PanelRightClose className="size-3.5" />}
                            <span>Form 1040 Panel: {isFormCollapsed ? 'Collapsed' : 'Expanded'}</span>
                        </button>

                        <div className="h-6 w-px bg-white/10" />

                        <button
                            onClick={() => {
                                setIsDocsCollapsed?.(false);
                                setIsFormCollapsed?.(false);
                            }}
                            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs transition"
                        >
                            Reset 3-Pane Layout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
