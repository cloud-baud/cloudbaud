import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
    Check, Paperclip, FileText, ChevronLeft, ChevronDown, ChevronRight,
    Upload, ExternalLink, X, Download, Eye, Lock, LockOpen, Filter, Undo, Redo,
    Save, Printer, FileDown, Bold, Italic, AlignLeft, AlignCenter, AlignRight,
    ZoomIn, ZoomOut, Sparkles, MessageSquare, Bot, Activity
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Ribbon, RibbonButton, RibbonSeparator, RibbonGroup, RibbonFontSizeSelector, RibbonColorPicker } from '@/components/layout/Ribbon';
import DocumentPreviewPanel from '../components/DocumentPreviewPanel';
import HighlightablePdfViewer from '../components/HighlightablePdfViewer';
import SpreadsheetPreview from '../components/SpreadsheetPreview';
import OllamaChatPanel from '../../workspace/OllamaChatPanel';
import { buildTaxSystemPrompt } from '../ai/taxTrainingData';

// ──────────────────────────────────────────────────────────────
// 2017 TAX DATA — Full 1040 Structure with Supporting Documents
// ──────────────────────────────────────────────────────────────
// Document base path for 2017
const DOC_BASE = '/src/data/Documents - Taxes/2017/';

const TAX_DATA_BY_YEAR = {
    2017: {
        filing: {
            status: 'Married Filing Jointly',
            taxpayer: 'Jishnu & Deepika Nath',
            dependents: ['Suhavi Nath'],
            preparer: 'David Rumsey CPA',
            returnDoc: 'Nath2017Form1040.pdf',
        },
        sections: [
            // ── SECTION 1: INCOME ──────────────────────────
            {
                id: 'income',
                title: 'INCOME',
                color: '#0f5132',
                items: [
                    { 
                        id: 'wages', 
                        label: 'Wages, Salaries, Tips', 
                        formLine: 'Line 7',
                        amount: 63132.46, 
                        verified: true, 
                        docs: ['2017 W2.pdf', 'Wage and Tax Statement.pdf'],
                        category: 'W-2',
                        returnSchedule: '2017_Form_1040.pdf'
                    },
                    { 
                        id: 'interest', 
                        label: 'Taxable Interest', 
                        formLine: 'Line 8a',
                        amount: 31.00,
                        verified: true,
                        docs: ['2017-Fidelity-7692-Consolidated-Form-1099.pdf'],
                        category: '1099-INT',
                        returnSchedule: '2017-Fidelity-7692-Consolidated-Form-1099.pdf'
                    },
                    { 
                        id: 'tax_exempt_interest', 
                        label: 'Tax-Exempt Interest', 
                        formLine: 'Line 8b',
                        amount: 0,
                        verified: true,
                        docs: [],
                        category: '1099-INT',
                        returnSchedule: null
                    },
                    { 
                        id: 'dividends', 
                        label: 'Ordinary Dividends', 
                        formLine: 'Line 9a',
                        amount: 0,
                        verified: true,
                        docs: ['2017-Fidelity-7692-Consolidated-Form-1099.pdf'],
                        category: '1099-DIV',
                        returnSchedule: '2017-Fidelity-7692-Consolidated-Form-1099.pdf'
                    },
                    { 
                        id: 'qualified_dividends', 
                        label: 'Qualified Dividends', 
                        formLine: 'Line 9b',
                        amount: 0,
                        verified: true,
                        docs: [],
                        category: '1099-DIV',
                        returnSchedule: null
                    },
                    { 
                        id: 'taxable_refunds', 
                        label: 'Taxable Refunds of State/Local Taxes', 
                        formLine: 'Line 10',
                        amount: 0,
                        verified: true,
                        docs: [],
                        category: '',
                        returnSchedule: null
                    },
                    { 
                        id: 'alimony', 
                        label: 'Alimony Received', 
                        formLine: 'Line 11',
                        amount: 0,
                        verified: true,
                        docs: [],
                        category: '',
                        returnSchedule: null
                    },
                    { 
                        id: 'biz_income', 
                        label: 'Business Income (Schedule C)', 
                        formLine: 'Line 12',
                        amount: 202410.00,
                        computed: true,
                        verified: true,
                        docs: ['1099-MISC.pdf'],
                        category: 'Schedule C',
                        returnSchedule: '2017_Schedule_C_CloudBaud.pdf',
                        expandable: true,
                        children: [
                            { 
                                id: 'cloudbaud_gross', 
                                label: 'CloudBaud LLC — Gross Revenue', 
                                amount: 334565.42, 
                                docs: ['1099-MISC.pdf'],
                                category: '1099-MISC',
                                returnSchedule: '2017_Schedule_C_CloudBaud.pdf'
                            },
                            { 
                                id: 'cloudbaud_expenses', 
                                label: 'CloudBaud LLC — Business Expenses', 
                                amount: -132155.42,
                                docs: ['2017 bizex CloudBaud Updated.xlsx'],
                                category: 'Schedule C Pt II',
                                returnSchedule: '2017_Schedule_C_CloudBaud.pdf'
                            },
                            { 
                                id: 'comfort_gross', 
                                label: 'Comfort Foods (dba Robertos) — Net Loss', 
                                amount: -44581.92,
                                docs: ['7712-Comfort Foods, LLC.-20170428.pdf', 'business expenses Robertos 2017.xlsx'],
                                category: 'Schedule C',
                                returnSchedule: '2017_Schedule_C_Robertos.pdf'
                            },
                        ]
                    },
                    { 
                        id: 'cap_gains', 
                        label: 'Capital Gains (Schedule D)', 
                        formLine: 'Line 13',
                        amount: -3000.00,
                        verified: true,
                        docs: ['2017-Fidelity-7692-Consolidated-Form-1099.pdf', '2017_Realized_Gain_Loss_Account_X86337692.csv'],
                        category: '1099-B / Schedule D',
                        returnSchedule: '2017_Schedule_D_Capital_Gains.pdf'
                    },
                    { 
                        id: 'other_gains', 
                        label: 'Other Gains or Losses', 
                        formLine: 'Line 14',
                        amount: 0,
                        verified: true,
                        docs: [],
                        category: 'Form 4797',
                        returnSchedule: null
                    },
                    { 
                        id: 'ira_dist', 
                        label: 'IRA Distributions', 
                        formLine: 'Line 15a/15b',
                        amount: 0,
                        verified: true,
                        docs: [],
                        category: '1099-R',
                        returnSchedule: null
                    },
                    { 
                        id: 'pensions', 
                        label: 'Pensions and Annuities', 
                        formLine: 'Line 16a/16b',
                        amount: 0,
                        verified: true,
                        docs: [],
                        category: '1099-R',
                        returnSchedule: null
                    },
                    { 
                        id: 'rental_income', 
                        label: 'Rental Real Estate, Royalties, Partnerships', 
                        formLine: 'Line 17',
                        amount: 0,
                        verified: true,
                        docs: [],
                        category: 'Schedule E',
                        returnSchedule: null
                    },
                    { 
                        id: 'farm_income', 
                        label: 'Farm Income or Loss', 
                        formLine: 'Line 18',
                        amount: 0,
                        verified: true,
                        docs: [],
                        category: 'Schedule F',
                        returnSchedule: null
                    },
                    { 
                        id: 'unemployment', 
                        label: 'Unemployment Compensation', 
                        formLine: 'Line 19',
                        amount: 0,
                        verified: true,
                        docs: [],
                        category: '1099-G',
                        returnSchedule: null
                    },
                    { 
                        id: 'social_security', 
                        label: 'Social Security Benefits', 
                        formLine: 'Line 20a/20b',
                        amount: 0,
                        verified: true,
                        docs: [],
                        category: 'SSA-1099',
                        returnSchedule: null
                    },
                    { 
                        id: 'other_income', 
                        label: 'Other Income', 
                        formLine: 'Line 21',
                        amount: -37037.00,
                        verified: true,
                        docs: [],
                        category: '',
                        returnSchedule: '2017_Form_1040.pdf'
                    },
                ],
                subtotal: { label: 'Total Income', formLine: 'Line 22', amount: 225536.46 }
            },

            // ── SECTION 2: ADJUSTMENTS (Above-the-Line) ───
            {
                id: 'adjustments',
                title: 'ADJUSTMENTS TO INCOME',
                color: '#1a4971',
                items: [
                    { 
                        id: 'se_tax_ded', 
                        label: 'Deductible Self-Employment Tax (50%)', 
                        formLine: 'Line 27',
                        amount: 10597.00,
                        computed: true,
                        verified: true,
                        docs: [],
                        category: 'Computed'
                    },
                    { 
                        id: 'sep_ira', 
                        label: 'SEP IRA Contribution', 
                        formLine: 'Line 28',
                        amount: 5244.90,
                        verified: true,
                        docs: ['2017-SEP-IRA-OLD-5224-Form-5498.pdf'],
                        category: 'Form 5498'
                    },
                    { 
                        id: 'se_health', 
                        label: 'Self-Employed Health Insurance', 
                        formLine: 'Line 29',
                        amount: null,
                        verified: false,
                        docs: ['Form 1095-B.pdf'],
                        category: '1095-B'
                    },
                ],
                subtotal: { label: 'Adjusted Gross Income (AGI)', formLine: 'Line 37', amount: 209694.00 }
            },

            // ── SECTION 3: ITEMIZED DEDUCTIONS ────────────
            {
                id: 'deductions',
                title: 'ITEMIZED DEDUCTIONS (Schedule A)',
                color: '#6a3d0a',
                items: [
                    { 
                        id: 'mortgage_int', 
                        label: 'Mortgage Interest — Woodridge', 
                        formLine: 'Sched A, Line 10',
                        amount: 17619.67,
                        verified: true,
                        docs: ['2017_1098_Mortgage Interest.pdf', 'Mortgage.pdf'],
                        category: 'Form 1098',
                        returnSchedule: '2017_Schedule_A_Itemized_Deductions.pdf'
                    },
                    { 
                        id: 're_taxes_woodridge', 
                        label: 'Real Estate Taxes — Woodridge', 
                        formLine: 'Sched A, Line 6',
                        amount: 5009.22,
                        verified: true,
                        docs: [],
                        category: 'Property Tax Statement',
                        returnSchedule: '2017_Schedule_A_Itemized_Deductions.pdf'
                    },
                    { 
                        id: 'state_local', 
                        label: 'State & Local Taxes Paid', 
                        formLine: 'Sched A, Line 5',
                        amount: null,
                        verified: false,
                        docs: [],
                        category: 'W-2 Box 17 / Estimates',
                        returnSchedule: '2017_Schedule_A_Itemized_Deductions.pdf'
                    },
                    { 
                        id: 'charity', 
                        label: 'Charitable Contributions', 
                        formLine: 'Sched A, Line 16',
                        amount: null,
                        verified: false,
                        docs: ['Charity Salvation Army.pdf'],
                        category: 'Receipts',
                        returnSchedule: '2017_Schedule_A_Itemized_Deductions.pdf'
                    },
                    { 
                        id: 'medical', 
                        label: 'Medical & Dental Expenses', 
                        formLine: 'Sched A, Line 1',
                        amount: null,
                        verified: false,
                        docs: ['Form 1099-SA.pdf', 'Form 5498-SA.pdf'],
                        category: 'HSA / 1099-SA',
                        returnSchedule: '2017_Schedule_A_Itemized_Deductions.pdf'
                    },
                ],
                subtotal: { label: 'Total Itemized Deductions', formLine: 'Line 40', amount: 21746.00 }
            },

            // ── SECTION 4: RETIREMENT & SAVINGS ───────────
            {
                id: 'retirement',
                title: 'RETIREMENT & EDUCATION',
                color: '#4a1a6b',
                items: [
                    { 
                        id: 'jishnu_roth', 
                        label: 'Jishnu Roth IRA', 
                        amount: 5500.00,
                        verified: true,
                        docs: [],
                        category: 'Form 5498'
                    },
                    { 
                        id: 'deepika_roth', 
                        label: 'Deepika Roth IRA', 
                        amount: 5500.00,
                        verified: true,
                        docs: [],
                        category: 'Form 5498'
                    },
                    { 
                        id: 'k401', 
                        label: '401(k) Contributions', 
                        amount: 3428.48,
                        verified: true,
                        docs: ['XXXX6410-12_2017-edj-statement.pdf'],
                        category: 'W-2 Box 12'
                    },
                    { 
                        id: 'child_ed', 
                        label: 'Child Education Fund (529)', 
                        amount: 4000.00,
                        verified: true,
                        docs: [],
                        category: 'Form 5498-ESA'
                    },
                ],
                subtotal: null
            },

            // ── SECTION 5: TAX COMPUTATION ────────────────
            {
                id: 'computation',
                title: 'TAX COMPUTATION',
                color: '#8b0000',
                items: [
                    { 
                        id: 'taxable_income', 
                        label: 'Taxable Income', 
                        formLine: 'Line 43',
                        amount: 175798.00,
                        computed: true,
                        verified: true,
                        docs: [],
                        category: 'AGI − Deductions − Exemptions',
                        returnSchedule: '2017_Form_1040.pdf'
                    },
                    { 
                        id: 'income_tax', 
                        label: 'Income Tax', 
                        formLine: 'Line 44',
                        amount: 36108.00,
                        computed: true,
                        verified: true,
                        docs: [],
                        category: 'Tax Tables',
                        returnSchedule: '2017_Form_1040.pdf'
                    },
                    { 
                        id: 'se_tax', 
                        label: 'Self-Employment Tax', 
                        formLine: 'Line 57',
                        amount: 21194.00,
                        computed: true,
                        verified: true,
                        docs: [],
                        category: 'Schedule SE',
                        returnSchedule: '2017_Schedule_SE_Self_Employment.pdf'
                    },
                ],
                subtotal: { label: 'Total Tax', formLine: 'Line 63', amount: 57303.00 }
            },

            // ── SECTION 6: PAYMENTS & AMOUNT OWED ─────────
            {
                id: 'payments',
                title: 'PAYMENTS & AMOUNT OWED',
                color: '#1a1a2e',
                items: [
                    { 
                        id: 'fed_withheld', 
                        label: 'Federal Income Tax Withheld', 
                        formLine: 'Line 64',
                        amount: 7909.36,
                        verified: true,
                        docs: ['2017 W2.pdf'],
                        category: 'W-2 Box 2'
                    },
                    { 
                        id: 'est_payments', 
                        label: 'Estimated Tax Payments', 
                        formLine: 'Line 65',
                        amount: null,
                        verified: false,
                        docs: [],
                        category: 'Form 1040-ES'
                    },
                ],
                subtotal: { label: 'Amount Owed', formLine: 'Line 78', amount: 49394.00, isOwed: true }
            },
        ]
    }
};

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return <span className="text-slate-400 italic text-xs">— not entered —</span>;
    const isNegative = amount < 0;
    const formatted = Math.abs(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    if (isNegative) {
        return <span className="text-red-500 dark:text-red-400 font-medium">({formatted})</span>;
    }
    return <span>{formatted}</span>;
};

// ──────────────────────────────────────────────────────────────
// DOCUMENT ICON — file-type-aware icon
// ──────────────────────────────────────────────────────────────
const DocIcon = ({ name, className = "size-5" }) => {
    const ext = name?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
        return (
            <div className={cn("relative shrink-0", className)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-red-500">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="absolute bottom-[2px] left-1/2 -translate-x-1/2 text-[6px] font-black text-red-600 leading-none">PDF</span>
            </div>
        );
    }
    if (['xls', 'xlsx'].includes(ext)) {
        return (
            <div className={cn("relative shrink-0", className)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-green-600">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="3" y1="15" x2="21" y2="15" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                    <line x1="15" y1="3" x2="15" y2="21" />
                </svg>
            </div>
        );
    }
    if (ext === 'csv') {
        return (
            <div className={cn("relative shrink-0", className)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-cyan-500">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="8" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="16" y2="17" />
                    <circle cx="8" cy="13" r="0.5" fill="currentColor" />
                    <circle cx="12" cy="13" r="0.5" fill="currentColor" />
                    <circle cx="16" cy="13" r="0.5" fill="currentColor" />
                    <circle cx="8" cy="17" r="0.5" fill="currentColor" />
                    <circle cx="12" cy="17" r="0.5" fill="currentColor" />
                    <circle cx="16" cy="17" r="0.5" fill="currentColor" />
                </svg>
                <span className="absolute bottom-[2px] left-1/2 -translate-x-1/2 text-[6px] font-black text-cyan-600 leading-none">CSV</span>
            </div>
        );
    }
    return <FileText className={cn("shrink-0 text-blue-500", className)} />;
};

// ──────────────────────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────────────────────
const TaxSingleYear = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const year = searchParams.get('year') || '2017';
    const yearNum = parseInt(year);

    // State
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewName, setPreviewName] = useState('');
    const [expandedSections, setExpandedSections] = useState({ biz_income: true });
    const [collapsedSections, setCollapsedSections] = useState({});
    const [showPanel, setShowPanel] = useState(false);
    const [verified, setVerified] = useState({});
    const [highlightAmount, setHighlightAmount] = useState(null); // { amount, label, formLine, searchTerm }
    const pdfViewerRef = useRef(null);
    const [pdfViewerState, setPdfViewerState] = useState({ currentPage: 1, numPages: 0, scale: 1.3, matchCount: 0, loading: true });
    const [fontSize, setFontSize] = useState(28);
    const [fontColor, setFontColor] = useState('#000000');
    const [activeSection, setActiveSection] = useState(null); // which section tab is active
    const [collapsedDocSections, setCollapsedDocSections] = useState({}); // collapsed state for right panel doc categories
    const [rightPanelTab, setRightPanelTab] = useState('docs'); // 'docs' | 'agent'

    // Splitter state
    const [splitPct, setSplitPct] = useState(55);
    const containerRef = useRef(null);
    const isDraggingRef = useRef(false);
    const leftPaneRef = useRef(null);
    const leftContentRef = useRef(null);

    // ── Auto-fit font size to fill available height ──
    const autoFitFontSize = useCallback(() => {
        const pane = leftPaneRef.current;
        const content = leftContentRef.current;
        if (!pane || !content) return;

        // Temporarily set a baseline font size to measure
        const baseFontSize = 20;
        content.style.fontSize = `${baseFontSize}px`;

        // Wait one frame for layout recalc
        requestAnimationFrame(() => {
            const availableH = pane.clientHeight;
            const contentH = content.scrollHeight;
            if (contentH <= 0 || availableH <= 0) return;

            // Scale proportionally, clamp between 10 and 28
            const ratio = availableH / contentH;
            let newSize = Math.floor(baseFontSize * ratio);
            newSize = Math.max(8, Math.min(28, newSize));

            setFontSize(newSize);
            content.style.fontSize = `${newSize}px`;
        });
    }, []);

    // Re-fit when active section, split, or collapsed sections change
    useEffect(() => {
        // Small delay to let DOM settle after tab switch
        const timer = setTimeout(autoFitFontSize, 50);
        return () => clearTimeout(timer);
    }, [activeSection, splitPct, collapsedSections, autoFitFontSize]);

    const yearData = TAX_DATA_BY_YEAR[yearNum];

    // ── Document Preview Handler ──
    const handleDocClick = useCallback((docName) => {
        const url = `${DOC_BASE}${docName}`;
        setPreviewUrl(url);
        setPreviewName(docName);
        setShowPanel(true);
        setHighlightAmount(null); // Clear highlight when manually opening a doc
    }, []);

    // ── Row Click — Source Tracing ──
    // Opens the TAX RETURN (1040) so you can view the relevant schedule/line.
    // If the item has an amount, it also highlights that value in the PDF.
    // Supporting docs are only opened via the file attachment icons.
    const handleAmountClick = useCallback((item) => {
        // Open the specific schedule PDF if available, otherwise the main 1040
        const scheduleDoc = item.returnSchedule || yearData?.filing?.returnDoc;
        if (scheduleDoc) {
            const url = `${DOC_BASE}${scheduleDoc}`;
            setPreviewUrl(url);
            setPreviewName(scheduleDoc);
            setShowPanel(true);
        } else {
            // No document available — show empty state in preview pane
            setPreviewUrl(null);
            setPreviewName(item.label);
            setShowPanel(true);
        }

        // If the item has an amount, set up highlighting
        if (item.amount !== null && item.amount !== undefined) {
            const absAmount = Math.abs(item.amount);
            const searchTerm = absAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            setHighlightAmount({
                amount: item.amount,
                label: item.label,
                formLine: item.formLine,
                searchTerm,
                itemId: item.id
            });
        } else {
            setHighlightAmount(null);
        }
    }, [yearData]);

    // ── Splitter Drag ──
    const handleSplitterMouseDown = useCallback((e) => {
        e.preventDefault();
        isDraggingRef.current = true;

        const onMove = (e) => {
            if (!isDraggingRef.current || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const pct = ((e.clientX - rect.left) / rect.width) * 100;
            setSplitPct(Math.max(30, Math.min(70, pct)));
        };

        const onUp = () => {
            isDraggingRef.current = false;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }, []);

    // ── Toggle Verified ──
    const toggleVerified = useCallback((itemId) => {
        setVerified(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    }, []);

    const toggleExpand = useCallback((itemId) => {
        setExpandedSections(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    }, []);

    // ── Toggle Section Collapse ──
    const toggleSection = useCallback((sectionId) => {
        setCollapsedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    }, []);

    if (!yearData) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                    <p className="text-lg font-medium">No detailed data for {year}</p>
                    <p className="text-sm mt-2">Detailed 1040 breakdown is currently available for 2017.</p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate('/workspace/finance/taxes')}>
                        <ChevronLeft className="size-4 mr-2" /> Back to Tax Grid
                    </Button>
                </div>
            </div>
        );
    }

    const { filing, sections } = yearData;

    // ── Render a single line item ──
    const renderItem = (item, sectionColor, depth = 0) => {
        const isExpanded = expandedSections[item.id];
        const isVerified = item.verified || verified[item.id];
        const hasDocs = item.docs && item.docs.length > 0;
        const isComputed = item.computed;
        const isMissing = item.amount === null;

        return (
            <React.Fragment key={item.id}>
                <tr className={cn(
                    "group border-b border-slate-200/60 dark:border-white/5 transition-colors",
                    depth > 0 ? "bg-slate-50/50 dark:bg-white/[0.02]" : "hover:bg-slate-50 dark:hover:bg-white/[0.04]",
                    isMissing && "bg-amber-50/30 dark:bg-amber-500/5"
                )}>
                    {/* Verified Column */}
                    <td className="w-8 py-1 px-1.5 text-center">
                        <div 
                            className={cn(
                                "w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all mx-auto",
                                isVerified 
                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" 
                                    : "border-slate-300 dark:border-slate-600 hover:border-emerald-400"
                            )}
                            onClick={() => toggleVerified(item.id)}
                            title={isVerified ? 'Verified' : 'Click to verify'}
                        >
                            {isVerified && <Check className="size-3" />}
                        </div>
                    </td>

                    {/* Documents Column */}
                    <td className="w-20 py-1 px-1 text-center">
                        {hasDocs ? (
                            <div className="flex items-center justify-center gap-1">
                                {item.docs.map((doc, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleDocClick(doc)}
                                        className={cn(
                                            "p-1.5 rounded-md transition-all",
                                            previewName === doc 
                                                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300" 
                                                : "text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                        )}
                                        title={doc}
                                    >
                                        <DocIcon name={doc} className="size-6" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <Paperclip className="size-3.5 text-slate-300 dark:text-slate-600 mx-auto" title="No documents attached" />
                        )}
                    </td>

                    {/* Form Line Column */}
                    <td className="w-28 py-1 px-1.5 text-center whitespace-nowrap">
                        {item.formLine && (
                            <span className="font-mono text-slate-400 dark:text-slate-500" style={{ fontSize: '0.8em' }}>
                                {item.formLine}
                            </span>
                        )}
                    </td>

                    {/* Label Column — click opens the tax return */}
                    <td 
                        className="py-1 px-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
                        onClick={() => handleAmountClick(item)}
                        title={`View ${item.formLine || item.label} in the tax return`}
                    >
                        <div className={cn("flex items-center", depth > 0 && "pl-6")}>
                            <div className="relative flex items-center">
                                {item.expandable && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleExpand(item.id); }}
                                        className="absolute -left-5 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        {isExpanded 
                                            ? <ChevronDown className="size-3.5 text-slate-500" /> 
                                            : <ChevronRight className="size-3.5 text-slate-500" />
                                        }
                                    </button>
                                )}
                            </div>
                            <span className={cn(
                                "font-medium",
                                depth > 0 ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-slate-50",
                                isComputed && "italic"
                            )} style={{ fontSize: 'inherit' }}>
                                {item.label}
                                {isComputed && <span className="ml-1.5 text-blue-500 font-normal" style={{ fontSize: '0.8em' }}>(computed)</span>}
                                {item.category && <span className="ml-2 text-slate-400 dark:text-slate-500/80 font-normal" style={{ fontSize: '0.8em' }}>{item.category}</span>}
                            </span>
                        </div>
                    </td>

                    {/* Amount Column — Clickable for Source Tracing */}
                    <td 
                        className={cn(
                            "py-1 px-2 text-right font-mono",
                            isMissing && "opacity-60",
                            !isMissing && hasDocs && "cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group/amount",
                            highlightAmount?.itemId === item.id && "bg-red-100 dark:bg-red-900/30 ring-2 ring-red-400 ring-inset"
                        )}
                        onClick={() => !isMissing && hasDocs && handleAmountClick(item)}
                        title={!isMissing && hasDocs ? `Click to trace ${item.amount} in the tax return` : undefined}
                    >
                        <div className="flex items-center justify-end gap-1">
                            {!isMissing && hasDocs && (
                                <Eye className="size-3 text-red-400 opacity-0 group-hover/amount:opacity-100 transition-opacity shrink-0" />
                            )}
                            {formatCurrency(item.amount)}
                        </div>
                    </td>
                </tr>

                {/* Expanded Children */}
                {item.expandable && isExpanded && item.children?.map(child => 
                    renderItem(child, sectionColor, depth + 1)
                )}
            </React.Fragment>
        );
    };

    // ── Render a Section ──
    const renderSection = (section) => {
        const isCollapsed = collapsedSections[section.id];

        return (
            <div key={section.id} className="mb-2">
                {/* Section Header — Clickable to Expand/Collapse */}
                <div 
                    className={cn(
                        "px-3 py-1.5 flex items-center justify-between cursor-pointer select-none transition-all hover:brightness-110",
                        isCollapsed ? "rounded-lg" : "rounded-t-lg"
                    )}
                    style={{ backgroundColor: section.color }}
                    onClick={() => toggleSection(section.id)}
                >
                    <div className="flex items-center gap-2">
                        {isCollapsed 
                            ? <ChevronRight className="size-4 text-white/80" />
                            : <ChevronDown className="size-4 text-white/80" />
                        }
                        <h2 className="font-bold text-white tracking-wide uppercase" style={{ fontSize: 'inherit' }}>
                            {section.title}
                        </h2>
                    </div>
                    <span className="text-white/60 font-mono" style={{ fontSize: '0.85em' }}>
                        {section.items.filter(i => i.verified || verified[i.id]).length}/{section.items.length} verified
                    </span>
                </div>

                {/* Table — Hidden when collapsed */}
                {!isCollapsed && (
                    <div className="border border-slate-200 dark:border-white/10 border-t-0 rounded-b-lg overflow-hidden dark:bg-white/[0.02]">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-100/80 dark:bg-white/[0.06] border-b border-slate-200 dark:border-white/10">
                                    <th className="w-8 py-1 px-1.5 text-center">
                                        <Check className="size-3.5 mx-auto text-slate-400" />
                                    </th>
                                    <th className="w-20 py-1 px-1 text-center">
                                        <FileText className="size-3.5 mx-auto text-slate-400" />
                                    </th>
                                    <th className="w-28 py-1 px-1.5 text-center font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap" style={{ fontSize: '0.8em' }}>
                                        Line
                                    </th>
                                    <th className="py-1 px-2 text-left font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider" style={{ fontSize: '0.85em' }}>
                                        Tax Item
                                    </th>
                                    <th className="py-1 px-2 text-right font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider w-32" style={{ fontSize: '0.85em' }}>
                                        Amount ($)
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {section.items.map(item => renderItem(item, section.color))}
                            </tbody>

                            {/* Section Subtotal */}
                            {section.subtotal && (
                                <tfoot>
                                    <tr className={cn(
                                        "font-bold border-t-2",
                                        section.subtotal.isOwed 
                                            ? "bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30" 
                                            : "bg-slate-100 dark:bg-white/[0.06] border-slate-300 dark:border-white/10"
                                    )}>
                                        <td colSpan="3"></td>
                                        <td className="py-1.5 px-2 text-right">
                                            <span className={cn(
                                                section.subtotal.isOwed ? "text-red-700 dark:text-red-400" : "text-slate-800 dark:text-slate-200"
                                            )}>
                                                {section.subtotal.label}
                                            </span>
                                            {section.subtotal.formLine && (
                                                <span className="ml-2 font-mono text-slate-400" style={{ fontSize: '0.8em' }}>
                                                    {section.subtotal.formLine}
                                                </span>
                                            )}
                                        </td>
                                        <td className={cn(
                                            "py-1.5 px-2 text-right font-mono",
                                            section.subtotal.isOwed ? "text-red-700 dark:text-red-400" : ""
                                        )}>
                                            {formatCurrency(section.subtotal.amount)}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                )}
            </div>
        );
    };

    // ── Missing Items Count ──
    const allItems = sections.flatMap(s => s.items);
    const missingCount = allItems.filter(i => i.amount === null).length;
    const verifiedCount = allItems.filter(i => i.verified || verified[i.id]).length;
    const totalDocs = allItems.reduce((sum, i) => sum + (i.docs?.length || 0), 0);

    return (
        <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-[#0f172a]" ref={containerRef}>
            {/* ── Ribbon ── */}
            <Ribbon
                tabs={[
                    {
                        id: 'file',
                        label: 'File',
                        content: (
                            <>
                                <RibbonButton icon={Save} label="Save" />
                                <RibbonButton icon={FileDown} label="Open Return" onClick={() => filing.returnDoc && handleDocClick(filing.returnDoc)} />
                                <RibbonButton icon={Upload} label="Upload" />
                                <RibbonSeparator />
                                <RibbonButton icon={Upload} label="Export" />
                                <RibbonButton icon={Printer} label="Print" />
                                <RibbonSeparator />
                                <RibbonGroup>
                                    <RibbonButton icon={Bold} label="Bold" />
                                    <RibbonButton icon={Italic} label="Italic" />
                                </RibbonGroup>
                                <RibbonFontSizeSelector value={fontSize} onChange={setFontSize} />
                                <RibbonColorPicker value={fontColor} onChange={setFontColor} />
                                <RibbonSeparator />
                                <RibbonGroup>
                                    <RibbonButton icon={AlignLeft} label="Left" />
                                    <RibbonButton icon={AlignCenter} label="Center" />
                                    <RibbonButton icon={AlignRight} label="Right" />
                                </RibbonGroup>
                            </>
                        )
                    },
                    {
                        id: 'table',
                        label: 'Table',
                        content: (
                            <>
                                <RibbonButton icon={Lock} label="Lock" />
                                <RibbonButton icon={LockOpen} label="Unlock" />
                                <RibbonSeparator />
                                <RibbonButton icon={Filter} label="Filter" />
                                <RibbonButton icon={Undo} label="Undo" />
                                <RibbonButton icon={Redo} label="Redo" />
                            </>
                        )
                    },
                    {
                        id: 'view',
                        label: 'View',
                        content: (() => {
                            const yearDocs = yearData;
                            const allDocNames = new Set();
                            sections.forEach(s => s.items.forEach(i => {
                                i.docs?.forEach(d => allDocNames.add(d));
                                i.children?.forEach(c => c.docs?.forEach(d => allDocNames.add(d)));
                            }));
                            const trackedDocs = Array.from(allDocNames).sort();
                            
                            // Build chip data from items
                            const chipData = sections.flatMap(s => s.items).map(item => ({
                                id: item.id,
                                short: item.category || item.label.split(' ')[0],
                                label: item.label,
                                formLine: item.formLine,
                                amount: item.amount,
                                returnSchedule: item.returnSchedule,
                                status: item.verified ? 'tracked' : item.amount !== null ? 'empty' : 'missing',
                                file: item.docs?.[0] || null
                            }));
                            // Dedupe by short name
                            const seen = new Set();
                            const uniqueChips = chipData.filter(c => {
                                if (seen.has(c.short)) return false;
                                seen.add(c.short);
                                return true;
                            });
                            const tracked = uniqueChips.filter(d => d.status === 'tracked');
                            const rest = uniqueChips.filter(d => d.status !== 'tracked');

                            const renderChip = (doc) => (
                                <button
                                    key={doc.id}
                                    className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[13px] font-medium border transition-all whitespace-nowrap",
                                        doc.status === 'tracked'
                                            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                                            : doc.status === 'empty'
                                            ? "bg-amber-50 dark:bg-amber-900/10 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                                            : "bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30",
                                        "cursor-pointer"
                                    )}
                                    title={`View ${doc.formLine || doc.label} in the tax return`}
                                    onClick={() => handleAmountClick(doc)}
                                >
                                    <span className={cn(
                                        "w-2 h-2 rounded-full shrink-0",
                                        doc.status === 'tracked' ? "bg-emerald-500"
                                            : doc.status === 'empty' ? "bg-amber-400"
                                            : "bg-red-500"
                                    )} />
                                    {doc.short}
                                </button>
                            );

                            return (
                                <>
                                    {/* Consolidated Return */}
                                    {filing.returnDoc && (
                                        <button
                                            className="flex flex-col items-center justify-center px-4 h-[88px] rounded-md transition-all hover:bg-brand-blue/10 border border-brand-blue/30 bg-brand-blue/5 gap-2 min-w-[80px]"
                                            title={`Open ${year} Form 1040`}
                                            onClick={() => handleDocClick(filing.returnDoc)}
                                        >
                                            <FileText className="size-8 text-brand-blue" />
                                            <span className="text-sm font-bold text-brand-blue leading-none">{year} Return</span>
                                        </button>
                                    )}
                                    <RibbonSeparator />

                                    {/* Source Documents - Two Rows */}
                                    <div className="flex flex-col gap-1.5 h-[88px] justify-center px-2">
                                        <div className="flex gap-1.5 items-center">
                                            {tracked.map(renderChip)}
                                        </div>
                                        <div className="flex gap-1.5 items-center overflow-x-auto">
                                            {rest.map(renderChip)}
                                        </div>
                                    </div>
                                </>
                            );
                        })()
                    }
                ]}
                rightAction={
                    <div className="flex items-center gap-3 text-xs text-slate-500 pr-2">
                        <span className="flex items-center gap-1 text-emerald-600">
                            <Check className="size-3.5" /> {verifiedCount}/{allItems.length}
                        </span>
                        <span className="flex items-center gap-1 text-blue-500">
                            <FileText className="size-3.5" /> {totalDocs} docs
                        </span>
                        {missingCount > 0 && (
                            <span className="flex items-center gap-1 text-amber-600 font-medium">
                                ⚠ {missingCount} missing
                            </span>
                        )}
                    </div>
                }
            />

            {/* ── Filing Info Bar ── */}
            <div className="flex-none border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-6 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                        {year} Tax Return
                    </h1>
                    <span className="text-xs text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                        {filing.status}
                    </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {filing.taxpayer} • Prepared by {filing.preparer} 
                    • {filing.dependents.length} dependent{filing.dependents.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* ── Main Content (Split Pane) ── */}
            <div className="flex-1 flex overflow-hidden">
                {/* ── Left: Tax Breakdown ── */}
                <div 
                    ref={leftPaneRef}
                    className="overflow-hidden"
                    style={{ width: `${splitPct}%` }}
                >
                    <div ref={leftContentRef} className="p-4" style={{ fontSize: `${fontSize}px`, color: fontColor }}>
                        {/* ── Section Tab Bar ── */}
                        <div className="flex items-center gap-1 mb-4 flex-wrap">
                            {sections.map(section => {
                                const isActive = (activeSection || sections[0]?.id) === section.id;
                                const sectionVerified = section.items.filter(i => i.verified || verified[i.id]).length;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all border",
                                            isActive
                                                ? "text-white shadow-md scale-[1.02] border-transparent"
                                                : "bg-white dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20"
                                        )}
                                        style={isActive ? { backgroundColor: section.color } : {}}
                                    >
                                        {section.title}
                                        <span className={cn(
                                            "text-[10px] font-mono rounded-full px-1.5 py-0.5 min-w-[20px] text-center",
                                            isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                                        )}>
                                            {sectionVerified}/{section.items.length}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* ── Active Section Content ── */}
                        {sections
                            .filter(s => s.id === (activeSection || sections[0]?.id))
                            .map(renderSection)
                        }
                    </div>
                </div>

                {/* ── Splitter ── */}
                <div 
                    className="w-1.5 cursor-col-resize bg-slate-200 dark:bg-white/10 hover:bg-blue-400 dark:hover:bg-blue-500 transition-colors flex-none relative group"
                    onMouseDown={handleSplitterMouseDown}
                >
                    <div className="absolute inset-y-0 -left-1 -right-1" /> {/* Wider hit target */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded bg-slate-400 dark:bg-white/20 group-hover:bg-blue-500 transition-colors" />
                </div>

                {/* ── Right: Content Pane + Vertical Tab Strip ── */}
                <div 
                    className="flex overflow-hidden"
                    style={{ width: `${100 - splitPct}%` }}
                >
                    {/* Content Area */}
                    <div className="flex-1 flex flex-col overflow-hidden border-l border-slate-200 dark:border-white/10" style={{ fontSize: `${fontSize}px` }}>
                        {/* Preview Header */}
                        <div className="flex-none flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-white/[0.04] border-b border-slate-200 dark:border-white/10">
                            <div className="flex items-center gap-2 min-w-0">
                                {rightPanelTab === 'docs' && <FileText className="size-4 text-blue-500 shrink-0" />}
                                {rightPanelTab === 'agent' && <Sparkles className="size-4 text-purple-500 shrink-0" />}
                                {rightPanelTab === 'chat' && <MessageSquare className="size-4 text-brand-blue shrink-0" />}
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                                    {rightPanelTab === 'docs' && (previewName || 'Supporting Documents')}
                                    {rightPanelTab === 'agent' && 'AI Tax Agent'}
                                    {rightPanelTab === 'chat' && 'Team Chat'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                {/* PDF Controls — page nav + zoom (only when using canvas viewer) */}
                                {highlightAmount && pdfViewerState.numPages > 0 && (
                                    <>
                                        {pdfViewerState.matchCount > 0 && (
                                            <span className="text-[10px] text-red-500 font-semibold bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded-full mr-1">
                                                {pdfViewerState.matchCount} match{pdfViewerState.matchCount !== 1 ? 'es' : ''}
                                            </span>
                                        )}
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => pdfViewerRef.current?.prevPage()} disabled={pdfViewerState.currentPage <= 1} title="Previous page">
                                            <ChevronLeft className="size-3.5" />
                                        </Button>
                                        <span className="text-[10px] text-slate-500 font-mono min-w-[40px] text-center">
                                            {pdfViewerState.currentPage}/{pdfViewerState.numPages}
                                        </span>
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => pdfViewerRef.current?.nextPage()} disabled={pdfViewerState.currentPage >= pdfViewerState.numPages} title="Next page">
                                            <ChevronRight className="size-3.5" />
                                        </Button>
                                        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => pdfViewerRef.current?.zoomOut()} title="Zoom out">
                                            <ZoomOut className="size-3.5" />
                                        </Button>
                                        <span className="text-[10px] text-slate-500 font-mono min-w-[32px] text-center">
                                            {Math.round(pdfViewerState.scale * 100)}%
                                        </span>
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => pdfViewerRef.current?.zoomIn()} title="Zoom in">
                                            <ZoomIn className="size-3.5" />
                                        </Button>
                                        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
                                    </>
                                )}
                                {previewUrl && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={() => window.open(previewUrl, '_blank')}
                                        title="Open in new tab"
                                    >
                                        <ExternalLink className="size-3.5" />
                                    </Button>
                                )}
                                {previewUrl && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={() => { setPreviewUrl(null); setPreviewName(''); setHighlightAmount(null); }}
                                        title="Back to documents"
                                    >
                                        <X className="size-3.5" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* ── Tab Content ── */}
                        {rightPanelTab === 'docs' && (
                            <>
                        {/* Redline Indicator Bar */}
                        {highlightAmount && (
                            <div className="flex-none flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800">
                                <div className="w-1 h-6 bg-red-500 rounded-full shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-red-700 dark:text-red-300 truncate">
                                        Tracing: {formatCurrency(highlightAmount.amount)}
                                    </p>
                                    <p className="text-[10px] text-red-500 dark:text-red-400 truncate">
                                        {highlightAmount.label} {highlightAmount.formLine ? `• ${highlightAmount.formLine}` : ''}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
                                    onClick={() => setHighlightAmount(null)}
                                    title="Clear highlight"
                                >
                                    <X className="size-3" />
                                </Button>
                            </div>
                        )}
                        {/* Document Viewer — type-aware rendering */}
                        <div className="flex-1 bg-slate-100 dark:bg-[#0c1222] overflow-hidden">
                            {previewUrl ? (() => {
                                const ext = previewName?.split('.').pop()?.toLowerCase();
                                const isSpreadsheet = ['xls', 'xlsx', 'csv'].includes(ext);

                                if (isSpreadsheet) {
                                    return (
                                        <SpreadsheetPreview
                                            url={previewUrl}
                                            name={previewName}
                                            className="h-full"
                                        />
                                    );
                                }

                                // PDF rendering
                                return highlightAmount ? (
                                    <HighlightablePdfViewer
                                        ref={pdfViewerRef}
                                        url={previewUrl}
                                        searchTerm={highlightAmount.searchTerm}
                                        onStateChange={setPdfViewerState}
                                        className="h-full"
                                    />
                                ) : (
                                    <iframe
                                        src={previewUrl}
                                        className="w-full h-full border-0"
                                        title={`Preview: ${previewName}`}
                                    />
                                );
                            })() : previewName && showPanel ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <FileText className="size-16 text-slate-300 dark:text-slate-600 mb-4" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mb-1">
                                        No file to preview
                                    </p>
                                    <p className="text-slate-400 dark:text-slate-500 text-sm">
                                        No supporting document is associated with <strong>{previewName}</strong> for this tax year.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full overflow-auto p-3">
                                    <h3 className="font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-3 px-1">
                                        📎 Supporting Documents ({totalDocs})
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        {(() => {
                                            const seenDocs = new Set();
                                            return sections.map(section => {
                                            const sectionDocs = new Set();
                                            section.items.forEach(i => {
                                                i.docs?.forEach(d => { if (!seenDocs.has(d)) sectionDocs.add(d); });
                                                i.children?.forEach(c => c.docs?.forEach(d => { if (!seenDocs.has(d)) sectionDocs.add(d); }));
                                            });
                                            const docs = Array.from(sectionDocs).sort();
                                            docs.forEach(d => seenDocs.add(d));
                                            if (docs.length === 0) return null;

                                            return (
                                                <div key={section.id} className="rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden">
                                                    {/* Section Header — clickable to collapse/expand */}
                                                    <button
                                                        onClick={() => setCollapsedDocSections(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                                                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:opacity-80 transition-opacity cursor-pointer"
                                                        style={{ backgroundColor: section.color + '18' }}
                                                    >
                                                        {collapsedDocSections[section.id]
                                                            ? <ChevronRight className="size-4 shrink-0" style={{ color: section.color }} />
                                                            : <ChevronDown className="size-4 shrink-0" style={{ color: section.color }} />
                                                        }
                                                        <div className="w-1 h-4 rounded-full" style={{ backgroundColor: section.color }} />
                                                        <span className="font-bold uppercase tracking-wide" style={{ color: section.color }}>
                                                            {section.title}
                                                        </span>
                                                        <span className="text-slate-400 font-mono ml-auto" style={{ fontSize: '0.75em' }}>{docs.length}</span>
                                                    </button>
                                                    {/* Document List — collapsible */}
                                                    {!collapsedDocSections[section.id] && (
                                                        <div className="flex flex-col">
                                                            {docs.map(doc => (
                                                                <button
                                                                    key={doc}
                                                                    onClick={() => handleDocClick(doc)}
                                                                    className={cn(
                                                                        "flex items-center gap-2 px-3 py-1.5 text-left transition-all border-t border-slate-100 dark:border-white/5",
                                                                        previewName === doc
                                                                            ? "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300"
                                                                            : "hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-600 dark:text-slate-300"
                                                                    )}
                                                                >
                                                                    <DocIcon name={doc} className="size-5" />
                                                                    <span className="truncate">{doc}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        });
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                            </>
                        )}

                        {/* ── Agent Tab ── */}
                        {rightPanelTab === 'agent' && (
                            <div className="flex-1 overflow-hidden" style={{ fontSize: '14px' }}>
                                <OllamaChatPanel
                                    contextData={{
                                        text: buildTaxSystemPrompt(yearData, activeSection),
                                        taxYear: year,
                                        sections: sections?.map(s => ({ id: s.id, title: s.title, items: s.items.length })),
                                    }}
                                />
                            </div>
                        )}

                        {/* ── Chat Tab (placeholder) ── */}
                        {rightPanelTab === 'chat' && (
                            <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                                <div className="text-center space-y-2">
                                    <MessageSquare className="size-8 mx-auto opacity-50" />
                                    <p>Team Chat coming soon</p>
                                </div>
                            </div>
                        )}

                        {/* ── Activity Tab (placeholder) ── */}
                        {rightPanelTab === 'activity' && (
                            <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                                <div className="text-center space-y-2">
                                    <Activity className="size-8 mx-auto opacity-50" />
                                    <p>Activity Log coming soon</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Vertical Tab Strip (Right Edge) ── */}
                    <div className="w-10 flex flex-col items-center py-4 gap-3 bg-slate-100 dark:bg-white/[0.03] border-l border-slate-200 dark:border-white/10 shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 rounded-full", rightPanelTab === 'docs' ? "bg-white dark:bg-white/10 shadow-sm text-blue-600" : "text-slate-400 dark:text-slate-500 hover:text-slate-600")}
                            onClick={() => setRightPanelTab('docs')}
                            title="Documents"
                        >
                            <FileText className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 rounded-full", rightPanelTab === 'agent' ? "bg-white dark:bg-white/10 shadow-sm text-purple-600" : "text-slate-400 dark:text-slate-500 hover:text-slate-600")}
                            onClick={() => setRightPanelTab('agent')}
                            title="AI Tax Agent"
                        >
                            <Bot className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 rounded-full", rightPanelTab === 'chat' ? "bg-white dark:bg-white/10 shadow-sm text-brand-blue" : "text-slate-400 dark:text-slate-500 hover:text-slate-600")}
                            onClick={() => setRightPanelTab('chat')}
                            title="Team Chat"
                        >
                            <MessageSquare className="size-4" />
                        </Button>

                        <div className="w-5 border-t border-slate-300 dark:border-white/10" />

                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 rounded-full", rightPanelTab === 'activity' ? "bg-white dark:bg-white/10 shadow-sm text-green-600" : "text-slate-400 dark:text-slate-500 hover:text-slate-600")}
                            onClick={() => setRightPanelTab(rightPanelTab === 'activity' ? 'docs' : 'activity')}
                            title="Activity Log"
                        >
                            <Activity className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxSingleYear;
