import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileCheck,
  ChevronDown,
  ChevronRight,
  Download,
  Upload,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Link2
} from 'lucide-react';
import HighlightablePdfViewer from './HighlightablePdfViewer';
import { useViewAs } from '../ViewAsContext';
import { CONNECTED_TAX_NODES, findConnectedNode } from '../data/taxNamedRanges';

export default function Form1040ReturnPane({
  year = 2022,
  accounts = [],
  entries = [],
  selectedCat,
  setSelectedCat,
  setSelectedFormLine,
  threads = {},
  openReviewPanel,
  isFormCollapsed = false,
  setIsFormCollapsed,
  activeConnectedNode,
  setActiveConnectedNode,
  hoveredConnectedNode,
  setHoveredConnectedNode
}) {
  const { activePersona, isViewingAs } = useViewAs();
  const [viewMode, setViewMode] = useState('accordion'); // 'accordion' | 'pdf'
  const [expandedForms, setExpandedForms] = useState({
    'form_1040': true,
    'schedule_1': true,
    'schedule_c': true,
    'schedule_a': false,
    'schedule_se': false,
    'form_8995': false
  });

  // Auto-expand form accordion when active connected node changes
  useEffect(() => {
    if (activeConnectedNode) {
      const node = CONNECTED_TAX_NODES[activeConnectedNode];
      if (node?.form1040FormId) {
        setExpandedForms(prev => ({
          ...prev,
          [node.form1040FormId]: true
        }));
      }
    }
  }, [activeConnectedNode]);

  const fileInputRef = useRef(null);
  const pdfViewerRef = useRef(null);
  const [pdfState, setPdfState] = useState({ currentPage: 1, numPages: 1, scale: 1.3, loading: false });

  // Local storage persisted uploaded 1040 Return PDF for this year
  const [uploadedReturnUrl, setUploadedReturnUrl] = useState(() => {
    try {
      const saved = localStorage.getItem(`cloudbaud_tax_1040_return_${year}`);
      if (saved) return saved;
      // Default 2017 has verified 1040 on disk
      if (year === 2017) return '/src/workspace/data/Documents - Taxes/2017/Nath2017Form1040.pdf';
      return null;
    } catch {
      return year === 2017 ? '/src/workspace/data/Documents - Taxes/2017/Nath2017Form1040.pdf' : null;
    }
  });

  const [uploadedReturnName, setUploadedReturnName] = useState(() => {
    try {
      const saved = localStorage.getItem(`cloudbaud_tax_1040_return_name_${year}`);
      if (saved) return saved;
      if (year === 2017) return 'Nath2017Form1040.pdf';
      return null;
    } catch {
      return year === 2017 ? 'Nath2017Form1040.pdf' : null;
    }
  });

  // Reload when active year changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`cloudbaud_tax_1040_return_${year}`);
      if (saved) {
        setUploadedReturnUrl(saved);
        setUploadedReturnName(localStorage.getItem(`cloudbaud_tax_1040_return_name_${year}`) || `Form 1040 Return ${year}.pdf`);
      } else if (year === 2017) {
        setUploadedReturnUrl('/src/workspace/data/Documents - Taxes/2017/Nath2017Form1040.pdf');
        setUploadedReturnName('Nath2017Form1040.pdf');
      } else {
        setUploadedReturnUrl(null);
        setUploadedReturnName(null);
      }
    } catch {
      setUploadedReturnUrl(null);
    }
  }, [year]);

  // Handle Upload 1040 Return PDF
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedReturnUrl(url);
    setUploadedReturnName(file.name);
    try {
      localStorage.setItem(`cloudbaud_tax_1040_return_${year}`, url);
      localStorage.setItem(`cloudbaud_tax_1040_return_name_${year}`, file.name);
    } catch (err) {
      console.debug('Storage error:', err);
    }
    setViewMode('pdf');
  };

  // Toggle Accordion section
  const toggleForm = (formId) => {
    setExpandedForms(prev => ({
      ...prev,
      [formId]: !prev[formId]
    }));
  };

  // Expand / Collapse all
  const toggleAllForms = (expand) => {
    setExpandedForms({
      'form_1040': expand,
      'schedule_1': expand,
      'schedule_c': expand,
      'schedule_a': expand,
      'schedule_se': expand,
      'form_8995': expand,
      'schedule_2': expand,
      'schedule_3': expand
    });
  };

  // Derive key amounts from active entries
  const amounts = useMemo(() => {
    const w2Entry = entries.find(e => e.category_id === '1')?.amount || 0;
    const comfortEntry = entries.find(e => e.category_id === '2')?.amount || 0;
    const cloudbaudEntry = entries.find(e => e.category_id === '3')?.amount || 0;
    const homeOffice = entries.find(e => e.category_id === '4')?.amount || 0;
    const profServices = entries.find(e => e.category_id === '5')?.amount || 0;

    const scheduleCNet = cloudbaudEntry + comfortEntry;
    const totalIncome = w2Entry + scheduleCNet;
    const seTax = scheduleCNet > 0 ? scheduleCNet * 0.9235 * 0.153 : 0;
    const seTaxDeduction = seTax * 0.5;
    const agi = Math.max(0, totalIncome - seTaxDeduction);
    const standardDeduction = 25900; // MFJ baseline
    const qbiDeduction = Math.max(0, scheduleCNet * 0.20);
    const taxableIncome = Math.max(0, agi - standardDeduction - qbiDeduction);
    const estTaxLiability = taxableIncome * 0.24; // Average bracket estimate
    const withholding = year === 2022 ? 4063.44 : year === 2023 ? 8005.09 : year === 2020 ? 10423.75 : year === 2017 ? 7909.36 : 0;
    const refundOrDue = withholding - estTaxLiability;

    return {
      w2Wages: w2Entry,
      comfortFoods: comfortEntry,
      cloudbaud: cloudbaudEntry,
      homeOffice,
      profServices,
      scheduleCNet,
      seTax,
      seTaxDeduction,
      agi,
      standardDeduction,
      qbiDeduction,
      taxableIncome,
      estTaxLiability,
      withholding,
      refundOrDue
    };
  }, [entries, year]);

  // Official IRS Forms Structure with Google Sheets Summary Tab Named Cell Mapping
  const irsForms = [
    {
      id: 'form_1040',
      number: 'Form 1040',
      title: 'U.S. Individual Income Tax Return',
      cpaStatus: 'Reviewed by David Ramsey',
      lines: [
        { label: 'Line 1a — Total amount from Form(s) W-2, box 1', value: amounts.w2Wages, cat: 'W2 Wages', namedCellPrefix: 'W2_WAGES' },
        { label: 'Line 8 — Additional income from Schedule 1, line 10', value: amounts.scheduleCNet, cat: 'CloudBaud LLC', namedCellPrefix: 'CLOUDBAUD_NET' },
        { label: 'Line 9 — Total Income (Add lines 1z, 7, and 8)', value: amounts.w2Wages + amounts.scheduleCNet, isTotal: true, namedCellPrefix: 'TOTAL_INCOME' },
        { label: 'Line 10 — Adjustments to income from Schedule 1, line 26', value: amounts.seTaxDeduction, namedCellPrefix: 'SE_TAX_DED' },
        { label: 'Line 11 — Adjusted Gross Income (AGI)', value: amounts.agi, isHighlight: true, namedCellPrefix: 'AGI' },
        { label: 'Line 12 — Standard deduction or itemized deductions', value: amounts.standardDeduction, namedCellPrefix: 'DEDUCTIONS' },
        { label: 'Line 13 — Qualified business income deduction (Form 8995)', value: amounts.qbiDeduction, namedCellPrefix: 'QBI_DEDUCTION' },
        { label: 'Line 15 — Taxable Income (Subtract lines 12 and 13 from line 11)', value: amounts.taxableIncome, isTotal: true, namedCellPrefix: 'TAXABLE_INCOME' },
        { label: 'Line 16 — Tax Liability (Tax computation)', value: amounts.estTaxLiability, namedCellPrefix: 'TAX_LIABILITY' },
        { label: 'Line 23 — Other taxes, including self-employment tax (Schedule 2)', value: amounts.seTax, namedCellPrefix: 'SE_TAX' },
        { label: 'Line 24 — Total Tax (Add line 22 and line 23)', value: amounts.estTaxLiability + amounts.seTax, isTotal: true, namedCellPrefix: 'TOTAL_TAX' },
        { label: 'Line 25a — Federal income tax withheld from Form(s) W-2', value: amounts.withholding, cat: 'Taxes Withheld', namedCellPrefix: 'TAX_WITHHELD' },
        { label: 'Line 25d — Total Federal income tax withheld', value: amounts.withholding, isHighlight: true, namedCellPrefix: 'TAX_WITHHELD_TOTAL' },
        { 
          label: amounts.refundOrDue >= 0 ? 'Line 34 — Amount OVERPAID / REFUND' : 'Line 37 — Amount You OWE', 
          value: Math.abs(amounts.refundOrDue), 
          isRefund: amounts.refundOrDue >= 0,
          isOwed: amounts.refundOrDue < 0,
          isHighlight: true,
          namedCellPrefix: amounts.refundOrDue >= 0 ? 'REFUND_AMOUNT' : 'AMOUNT_OWED'
        },
      ]
    },
    {
      id: 'schedule_1',
      number: 'Schedule 1',
      title: 'Additional Income and Adjustments to Income',
      cpaStatus: 'Reconciled',
      lines: [
        { label: 'Line 3 — Business income or (loss) (Attach Schedule C)', value: amounts.scheduleCNet, cat: 'CloudBaud LLC', namedCellPrefix: 'CLOUDBAUD_NET' },
        { label: 'Line 5 — Rental real estate, royalties, partnerships (Schedule E)', value: 0, namedCellPrefix: 'RENTAL_NET_TOTAL' },
        { label: 'Line 10 — Total Additional Income (Combine lines 1 through 9)', value: amounts.scheduleCNet, isTotal: true, namedCellPrefix: 'SCH1_ADDITIONAL_INC' },
        { label: 'Line 15 — Deductible part of self-employment tax (Attach Schedule SE)', value: amounts.seTaxDeduction, namedCellPrefix: 'SE_TAX_DED' },
        { label: 'Line 26 — Total Adjustments to Income (Combine lines 11 through 25)', value: amounts.seTaxDeduction, isTotal: true, namedCellPrefix: 'SCH1_ADJUSTMENTS' },
      ]
    },
    {
      id: 'schedule_c',
      number: 'Schedule C',
      title: 'Profit or Loss From Business (CloudBaud LLC)',
      cpaStatus: 'Reviewed by David Ramsey',
      lines: [
        { label: 'Line 1 — Gross receipts or sales (1099-NEC / Direct client revenue)', value: amounts.cloudbaud, cat: 'CloudBaud LLC', namedCellPrefix: 'CLOUDBAUD_GROSS' },
        { label: 'Line 7 — Gross income', value: amounts.cloudbaud, isTotal: true, namedCellPrefix: 'CLOUDBAUD_GROSS' },
        { label: 'Line 9 — Car and truck expenses', value: 0, namedCellPrefix: 'CLOUDBAUD_CAR_EXP' },
        { label: 'Line 17 — Legal and professional services (CPA fees)', value: amounts.profServices, cat: 'Professional Services / CPA', namedCellPrefix: 'CPA_FEES' },
        { label: 'Line 30 — Expenses for business use of your home (Home Office)', value: amounts.homeOffice, cat: 'Home Office & Utilities', namedCellPrefix: 'HOME_OFFICE' },
        { label: 'Line 31 — Net profit or (loss) (Enter on Schedule 1, line 3)', value: amounts.scheduleCNet, isHighlight: true, isTotal: true, namedCellPrefix: 'CLOUDBAUD_NET' }
      ]
    },
    {
      id: 'schedule_a',
      number: 'Schedule A',
      title: 'Itemized Deductions (Real Estate & State Taxes)',
      cpaStatus: 'Reconciled',
      lines: [
        { label: 'Line 5b — State and local real estate taxes (Woodridge / King County)', value: 7271.09, namedCellPrefix: 'PROPTAX_WR' },
        { label: 'Line 8a — Home mortgage interest and points reported on Form 1098', value: 10516.14, namedCellPrefix: 'MORTGAGE_WR' },
        { label: 'Line 14 — Gifts to charity', value: 0, namedCellPrefix: 'CHARITY_GIFTS' },
        { label: 'Line 17 — Total Itemized Deductions', value: 17787.23, isTotal: true, namedCellPrefix: 'ITEMIZED_TOTAL' },
        { label: 'Comparison — Standard Deduction Chosen ($25,900 > $17,787.23)', value: 25900.00, isHighlight: true, namedCellPrefix: 'STANDARD_DEDUCTION' }
      ]
    },
    {
      id: 'schedule_se',
      number: 'Schedule SE',
      title: 'Self-Employment Tax Computation',
      cpaStatus: 'Reconciled',
      lines: [
        { label: 'Line 2 — Net farm / business profit from Schedule C', value: amounts.scheduleCNet, namedCellPrefix: 'CLOUDBAUD_NET' },
        { label: 'Line 4a — Multiply net profit by 92.35% (0.9235)', value: amounts.scheduleCNet * 0.9235, namedCellPrefix: 'SE_TAXABLE_BASE' },
        { label: 'Line 10 — Self-employment tax (15.3% computation)', value: amounts.seTax, isHighlight: true, namedCellPrefix: 'SE_TAX' },
        { label: 'Line 11 — Deduction for one-half of self-employment tax (Enter on Sch 1, line 15)', value: amounts.seTaxDeduction, isTotal: true, namedCellPrefix: 'SE_TAX_DED' }
      ]
    },
    {
      id: 'form_8995',
      number: 'Form 8995',
      title: 'Qualified Business Income (QBI) Deduction Simplified Computation',
      cpaStatus: 'Reviewed by David Ramsey',
      lines: [
        { label: 'Line 1(i) — CloudBaud LLC Qualified Business Income', value: amounts.scheduleCNet },
        { label: 'Line 2 — Total qualified business income', value: amounts.scheduleCNet },
        { label: 'Line 4 — Multiply Line 2 by 20% (0.20)', value: amounts.qbiDeduction, isHighlight: true },
        { label: 'Line 15 — Section 199A QBI Deduction Allowed (Enter on Form 1040, line 13)', value: amounts.qbiDeduction, isTotal: true }
      ]
    }
  ];

  // Slim Collapsed Strip
  if (isFormCollapsed) {
    return (
      <div 
        onClick={() => setIsFormCollapsed(false)}
        className="w-11 h-full border-l border-white/10 bg-[#0a0f1d] hover:bg-[#11192e] cursor-pointer flex flex-col items-center py-4 justify-between transition group select-none shrink-0"
        title="Click to expand Form 1040 Return"
      >
        <div className="flex flex-col items-center gap-3">
          <button className="p-1 rounded hover:bg-white/10 text-purple-400 group-hover:scale-110 transition">
            <PanelRightOpen className="size-4" />
          </button>
          <FileCheck className="size-4 text-purple-400/80" />
        </div>

        <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-semibold text-white/60 tracking-wider whitespace-nowrap">
          Form 1040 Return • {year}
        </span>

        <span className="text-[10px] text-purple-400 font-bold bg-purple-500/20 px-1.5 py-0.5 rounded font-mono">
          ${Math.round(amounts.agi / 1000)}k
        </span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0b0f19] text-white text-xs overflow-hidden select-none">
      {/* Hidden File Input for 1040 Return Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* ── SINGLE CONSOLIDATED COMPACT TOP HEADER ── */}
      <div className="bg-[#121829] px-3 py-2 font-semibold border-b border-white/10 flex justify-between items-center shrink-0 flex-wrap gap-2 text-xs">
        {/* Left Side: Title, Year badge & View Mode Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <FileCheck className="size-4 text-purple-400 shrink-0" />
          <span className="font-bold text-sm tracking-tight text-white whitespace-nowrap">Form 1040</span>
          <span className="text-xs text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 font-mono font-bold whitespace-nowrap">
            {year}
          </span>

          {/* View Mode Toggle: Accordion vs Full PDF */}
          <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/15 text-xs ml-1">
            <button
              onClick={() => setViewMode('accordion')}
              className={`px-2.5 py-1 rounded font-bold transition whitespace-nowrap ${
                viewMode === 'accordion' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-200 hover:text-white'
              }`}
            >
              IRS Forms
            </button>
            <button
              onClick={() => {
                if (uploadedReturnUrl) {
                  setViewMode('pdf');
                } else {
                  fileInputRef.current?.click();
                }
              }}
              className={`px-2.5 py-1 rounded font-bold flex items-center gap-1 transition whitespace-nowrap ${
                viewMode === 'pdf' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-200 hover:text-white'
              }`}
            >
              <span>Full Return PDF</span>
              {!uploadedReturnUrl && <span className="text-[10px] opacity-75 font-normal">(Upload)</span>}
            </button>
          </div>
        </div>

        {/* Right Side: Mode-Specific Controls + Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* PDF Mode Controls (Squeezed from 3rd row) */}
          {viewMode === 'pdf' && uploadedReturnUrl && (
            <div className="flex items-center gap-1.5">
              {/* PDF Page Navigation & Zoom Toolbar */}
              <div className="flex items-center gap-1 bg-[#141b2d] px-2 py-0.5 rounded-lg border border-white/15 text-white">
                <button
                  type="button"
                  onClick={() => pdfViewerRef.current?.prevPage()}
                  disabled={pdfState.currentPage <= 1}
                  className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-white transition"
                  title="Previous Page"
                >
                  <ChevronLeftIcon className="size-3.5" />
                </button>
                <span className="text-xs font-mono font-bold px-1">
                  {pdfState.currentPage} / {pdfState.numPages || 1}
                </span>
                <button
                  type="button"
                  onClick={() => pdfViewerRef.current?.nextPage()}
                  disabled={pdfState.currentPage >= pdfState.numPages}
                  className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-white transition"
                  title="Next Page"
                >
                  <ChevronRightIcon className="size-3.5" />
                </button>
                <span className="text-white/20 mx-0.5">|</span>
                <button
                  type="button"
                  onClick={() => pdfViewerRef.current?.zoomOut()}
                  className="p-1 rounded hover:bg-white/10 text-white transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="size-3.5" />
                </button>
                <span className="text-xs font-mono font-bold px-1">
                  {Math.round((pdfState.scale || 1.3) * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => pdfViewerRef.current?.zoomIn()}
                  className="p-1 rounded hover:bg-white/10 text-white transition"
                  title="Zoom In"
                >
                  <ZoomIn className="size-3.5" />
                </button>
              </div>

              {/* Download PDF Button */}
              <a
                href={uploadedReturnUrl}
                download={uploadedReturnName || `Form 1040 Return (${year}).pdf`}
                className="text-emerald-300 hover:text-emerald-200 flex items-center gap-1 text-xs font-bold bg-emerald-950/60 border border-emerald-500/40 px-2 py-1 rounded"
                title="Download Form 1040 PDF"
              >
                <Download className="size-3.5" />
                <span className="hidden sm:inline">Download</span>
              </a>
            </div>
          )}

          {/* Accordion Mode Quick Expand/Collapse */}
          {viewMode === 'accordion' && (
            <div className="flex items-center gap-1.5 text-xs text-slate-300 mr-1">
              <button
                onClick={() => toggleAllForms(true)}
                className="hover:text-white underline font-semibold px-1"
              >
                Expand All
              </button>
              <span className="text-white/20">•</span>
              <button
                onClick={() => toggleAllForms(false)}
                className="hover:text-white underline font-semibold px-1"
              >
                Collapse All
              </button>
            </div>
          )}

          {/* Upload 1040 PDF Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg hover:bg-white/10 text-blue-300 hover:text-white border border-white/10 transition"
            title="Upload David Ramsey 1040 Return PDF"
          >
            <Upload className="size-4" />
          </button>

          {/* Collapse Panel Button */}
          <button
            onClick={() => setIsFormCollapsed(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
            title="Collapse Form 1040 Return Panel"
          >
            <PanelRightClose className="size-4" />
          </button>
        </div>
      </div>

      {/* ── MODE 1: FULL 1040 RETURN PDF AS-IS ── */}
      {viewMode === 'pdf' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#050811] p-1">
          {uploadedReturnUrl ? (
            <div className="w-full h-full flex flex-col rounded-lg overflow-hidden border border-white/10 bg-slate-950 shadow-2xl">
              <div className="flex-1 overflow-auto bg-[#03060c] flex justify-center items-start p-1">
                <HighlightablePdfViewer
                  ref={pdfViewerRef}
                  url={uploadedReturnUrl}
                  onStateChange={setPdfState}
                  className="bg-transparent"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#0b101c] rounded-xl border border-white/10 m-auto max-w-[440px] shadow-xl">
              <FileCheck className="size-14 text-purple-400/80 mb-3" />
              <h3 className="font-bold text-base text-white mb-1.5">Upload 1040 Return PDF</h3>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Upload the complete Form 1040 PDF return package received from David Ramsey for Tax Year <b className="text-white">{year}</b> to view it as-is in this panel.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
              >
                <Upload className="size-4" />
                <span>Upload Form 1040 PDF</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── MODE 2: ACCORDION OF IRS FORMS AS-IS ── */}
      {viewMode === 'accordion' && (
        <div className="flex-1 overflow-auto p-3 space-y-3">
          {/* Focused Highlight Notification */}
          {selectedCat && (
            <div className="bg-purple-950/50 border border-purple-500/40 rounded-lg p-2.5 text-xs text-purple-200 flex items-center justify-between shadow-sm">
              <span>📌 Focused Category: <b className="text-white">{selectedCat.name}</b></span>
              <button 
                onClick={() => openReviewPanel('form_line', selectedCat.name, `Form 1040 - ${selectedCat.name}`)}
                className="text-xs font-bold text-purple-300 hover:text-purple-100 underline"
              >
                CPA Review Note
              </button>
            </div>
          )}

          {/* Accordion Forms List */}
          {irsForms.map((form) => {
            const isExpanded = expandedForms[form.id];

            return (
              <div 
                key={form.id}
                className="border border-white/15 rounded-xl overflow-hidden bg-[#0e1424] shadow-md transition"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleForm(form.id)}
                  className="px-4 py-3 bg-[#11192e] hover:bg-[#16213c] cursor-pointer flex items-center justify-between border-b border-white/10 select-none transition"
                >
                  <div className="flex items-center gap-2.5">
                    {isExpanded ? (
                      <ChevronDown className="size-4 text-purple-400 shrink-0" />
                    ) : (
                      <ChevronRight className="size-4 text-slate-300 shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-white">{form.number}</span>
                        <span className="text-xs text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                          {form.cpaStatus}
                        </span>
                      </div>
                      <div className="text-xs text-slate-200 font-semibold">{form.title}</div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openReviewPanel('form_line', form.number, `${form.number} — ${form.title}`);
                    }}
                    className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-purple-300 transition"
                    title={`Add CPA note for ${form.number}`}
                  >
                    <MessageSquare className="size-4" />
                  </button>
                </div>

                {/* Accordion Content — Line Items As-Is */}
                {isExpanded && (
                  <div className="divide-y divide-white/5 bg-[#090d18] text-xs font-mono">
                    {form.lines.map((line, idx) => {
                      const activeNode = CONNECTED_TAX_NODES[activeConnectedNode];
                      const hoveredNode = CONNECTED_TAX_NODES[hoveredConnectedNode];
                      const isLineConnected = activeNode && (
                        (activeNode.id === 'w2_income' && (line.cat === 'W2 Wages' || line.label.includes('Line 1a'))) ||
                        (activeNode.form1040FormId === form.id && line.label.includes(activeNode.form1040LineLabel)) ||
                        (activeNode.accountName === line.cat)
                      );
                      const isLineHoverConnected = hoveredNode && (
                        (hoveredNode.id === 'w2_income' && (line.cat === 'W2 Wages' || line.label.includes('Line 1a'))) ||
                        (hoveredNode.form1040FormId === form.id && line.label.includes(hoveredNode.form1040LineLabel)) ||
                        (hoveredNode.accountName === line.cat)
                      );
                      const isNodeHighlighted = isLineConnected || isLineHoverConnected;
                      const nodeForBadge = activeNode || hoveredNode;

                      const isCatHighlight = selectedCat && line.cat && selectedCat.name.includes(line.cat.split(' ')[0]);
                      const threadKey = `th_form_line_${line.cat || line.label}_${year}`;
                      const lineThread = threads[threadKey];
                      const status = lineThread?.status || 'pending';
                      const commentCount = lineThread?.comments?.length || 0;

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (line.cat) {
                              setSelectedFormLine?.(line.cat);
                              const match = accounts.find(a => a.name.includes(line.cat));
                              if (match) setSelectedCat?.(match);
                            }
                            const matchedNode = Object.values(CONNECTED_TAX_NODES).find(n => 
                              (n.id === 'w2_income' && (line.cat === 'W2 Wages' || line.label.includes('Line 1a'))) ||
                              (n.accountName === line.cat)
                            );
                            if (matchedNode && setActiveConnectedNode) {
                              setActiveConnectedNode(activeConnectedNode === matchedNode.id ? null : matchedNode.id);
                            }
                          }}
                          onMouseEnter={() => {
                            const matchedNode = Object.values(CONNECTED_TAX_NODES).find(n => 
                              (n.id === 'w2_income' && (line.cat === 'W2 Wages' || line.label.includes('Line 1a'))) ||
                              (n.accountName === line.cat)
                            );
                            if (matchedNode && setHoveredConnectedNode) {
                              setHoveredConnectedNode(matchedNode.id);
                            }
                          }}
                          onMouseLeave={() => {
                            setHoveredConnectedNode?.(null);
                          }}
                          className={`p-3 px-4 flex items-center justify-between cursor-pointer transition relative ${
                            isNodeHighlighted
                              ? 'bg-cyan-950/40 ring-2 ring-cyan-400 border-2 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] z-10'
                              : isCatHighlight 
                              ? 'bg-purple-950/70 text-white font-bold' 
                              : 'hover:bg-white/5'
                          } ${line.isTotal ? 'bg-white/10 font-bold border-t border-white/15 text-white' : 'text-slate-100'} ${
                            line.isHighlight && !isNodeHighlighted ? 'bg-purple-900/30 font-bold' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 pr-3 flex-wrap">
                            <span className={`text-xs md:text-sm ${line.isRefund ? 'text-emerald-300 font-bold' : line.isOwed ? 'text-rose-400 font-bold' : isNodeHighlighted ? 'text-cyan-200 font-bold' : 'font-medium'}`}>
                              {line.label}
                            </span>

                            {/* Google Sheet Summary Tab Named Cell Tag */}
                            {line.namedCellPrefix && (
                              <span 
                                className="font-mono text-[9px] text-blue-300/90 bg-blue-500/10 border border-blue-500/25 px-1 py-0.2 rounded shrink-0 select-all" 
                                title={`Google Sheets Summary Tab Named Range: [${line.namedCellPrefix}_${year}] (Position-Invariant)`}
                              >
                                [{line.namedCellPrefix}_{year}]
                              </span>
                            )}

                            {/* 3-Panel Connected Line Badge */}
                            {isNodeHighlighted && nodeForBadge && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 font-mono font-bold animate-in fade-in shrink-0">
                                <Link2 className="size-2.5 text-cyan-300 animate-pulse" />
                                <span>Linked: Sheet [{nodeForBadge.yearCoords[year] || nodeForBadge.cellCoord2022 || 'G2'}] ↔ Checklist {nodeForBadge.checklistNum}</span>
                              </span>
                            )}

                            {line.cat && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openReviewPanel?.('form_line', line.cat, line.label);
                                }}
                                className={`size-4.5 rounded-full flex items-center justify-center text-[10px] border transition shrink-0 ${
                                  status === 'accepted' ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200' :
                                  status === 'rejected' ? 'bg-red-500/30 border-red-400 text-red-200' :
                                  commentCount > 0 ? 'bg-amber-500/30 border-amber-400 text-amber-200' :
                                  'bg-white/10 border-white/20 text-slate-300 hover:text-white'
                                }`}
                                title="Line Review / Annotation Thread"
                              >
                                <MessageSquare className="size-3" />
                              </button>
                            )}
                          </div>

                          <span className={`font-mono text-xs md:text-sm shrink-0 ${
                            line.isRefund ? 'text-emerald-300 font-bold text-sm' :
                            line.isOwed ? 'text-rose-400 font-bold text-sm' :
                            line.isTotal ? 'text-white font-bold text-sm' :
                            'text-slate-100 font-semibold'
                          }`}>
                            ${Number(line.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
