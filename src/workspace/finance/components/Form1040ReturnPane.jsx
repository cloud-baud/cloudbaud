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
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import HighlightablePdfViewer from './HighlightablePdfViewer';
import { useViewAs } from '../ViewAsContext';

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
  setIsFormCollapsed
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
    const withholding = year === 2023 ? 8005.09 : year === 2020 ? 10423.75 : year === 2017 ? 7909.36 : 0;
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

  // Official IRS Forms Structure
  const irsForms = [
    {
      id: 'form_1040',
      number: 'Form 1040',
      title: 'U.S. Individual Income Tax Return',
      cpaStatus: 'Reviewed by David Ramsey',
      lines: [
        { label: 'Line 1a — Total amount from Form(s) W-2, box 1', value: amounts.w2Wages, cat: 'W2 Wages' },
        { label: 'Line 8 — Additional income from Schedule 1, line 10', value: amounts.scheduleCNet, cat: 'CloudBaud LLC' },
        { label: 'Line 9 — Total Income (Add lines 1z, 7, and 8)', value: amounts.w2Wages + amounts.scheduleCNet, isTotal: true },
        { label: 'Line 10 — Adjustments to income from Schedule 1, line 26', value: amounts.seTaxDeduction },
        { label: 'Line 11 — Adjusted Gross Income (AGI)', value: amounts.agi, isHighlight: true },
        { label: 'Line 12 — Standard deduction or itemized deductions', value: amounts.standardDeduction },
        { label: 'Line 13 — Qualified business income deduction (Form 8995)', value: amounts.qbiDeduction },
        { label: 'Line 15 — Taxable Income (Subtract lines 12 and 13 from line 11)', value: amounts.taxableIncome, isTotal: true },
        { label: 'Line 16 — Tax Liability (Tax computation)', value: amounts.estTaxLiability },
        { label: 'Line 23 — Other taxes, including self-employment tax (Schedule 2)', value: amounts.seTax },
        { label: 'Line 24 — Total Tax (Add line 22 and line 23)', value: amounts.estTaxLiability + amounts.seTax, isTotal: true },
        { label: 'Line 25d — Federal income tax withheld from Form(s) W-2 / 1099', value: amounts.withholding },
        { 
          label: amounts.refundOrDue >= 0 ? 'Line 34 — Amount OVERPAID / REFUND' : 'Line 37 — Amount You OWE', 
          value: Math.abs(amounts.refundOrDue), 
          isRefund: amounts.refundOrDue >= 0,
          isOwed: amounts.refundOrDue < 0,
          isHighlight: true 
        },
      ]
    },
    {
      id: 'schedule_1',
      number: 'Schedule 1',
      title: 'Additional Income and Adjustments to Income',
      cpaStatus: 'Reconciled',
      lines: [
        { label: 'Line 3 — Business income or (loss) (Attach Schedule C)', value: amounts.scheduleCNet, cat: 'CloudBaud LLC' },
        { label: 'Line 5 — Rental real estate, royalties, partnerships (Schedule E)', value: 0 },
        { label: 'Line 10 — Total Additional Income (Combine lines 1 through 9)', value: amounts.scheduleCNet, isTotal: true },
        { label: 'Line 15 — Deductible part of self-employment tax (Attach Schedule SE)', value: amounts.seTaxDeduction },
        { label: 'Line 26 — Total Adjustments to Income (Combine lines 11 through 25)', value: amounts.seTaxDeduction, isTotal: true },
      ]
    },
    {
      id: 'schedule_c',
      number: 'Schedule C',
      title: 'Profit or Loss From Business (CloudBaud LLC)',
      cpaStatus: 'Reviewed by David Ramsey',
      lines: [
        { label: 'Line 1 — Gross receipts or sales (1099-NEC / Direct client revenue)', value: amounts.cloudbaud, cat: 'CloudBaud LLC' },
        { label: 'Line 7 — Gross income', value: amounts.cloudbaud, isTotal: true },
        { label: 'Line 9 — Car and truck expenses', value: 0 },
        { label: 'Line 17 — Legal and professional services (CPA fees)', value: amounts.profServices, cat: 'Professional Services / CPA' },
        { label: 'Line 30 — Expenses for business use of your home (Home Office)', value: amounts.homeOffice, cat: 'Home Office & Utilities' },
        { label: 'Line 31 — Net profit or (loss) (Enter on Schedule 1, line 3)', value: amounts.scheduleCNet, isHighlight: true, isTotal: true }
      ]
    },
    {
      id: 'schedule_a',
      number: 'Schedule A',
      title: 'Itemized Deductions (Real Estate & State Taxes)',
      cpaStatus: 'Reconciled',
      lines: [
        { label: 'Line 5b — State and local real estate taxes (Woodridge / King County)', value: 7271.09 },
        { label: 'Line 8a — Home mortgage interest and points reported on Form 1098', value: 10516.14 },
        { label: 'Line 14 — Gifts to charity', value: 0 },
        { label: 'Line 17 — Total Itemized Deductions', value: 17787.23, isTotal: true },
        { label: 'Comparison — Standard Deduction Chosen ($25,900 > $17,787.23)', value: 25900.00, isHighlight: true }
      ]
    },
    {
      id: 'schedule_se',
      number: 'Schedule SE',
      title: 'Self-Employment Tax Computation',
      cpaStatus: 'Reconciled',
      lines: [
        { label: 'Line 2 — Net farm / business profit from Schedule C', value: amounts.scheduleCNet },
        { label: 'Line 4a — Multiply net profit by 92.35% (0.9235)', value: amounts.scheduleCNet * 0.9235 },
        { label: 'Line 10 — Self-employment tax (15.3% computation)', value: amounts.seTax, isHighlight: true },
        { label: 'Line 11 — Deduction for one-half of self-employment tax (Enter on Sch 1, line 15)', value: amounts.seTaxDeduction, isTotal: true }
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

      {/* ── HEADER ── */}
      <div className="bg-[#121829] p-3 font-semibold border-b border-white/10 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <FileCheck className="size-4 text-purple-400" />
          <span className="font-bold text-sm tracking-tight text-white">Form 1040 Return</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
            {year} Return
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* View Mode Toggle: Accordion vs Full PDF */}
          <div className="flex items-center bg-white/5 rounded p-0.5 border border-white/10 text-[10px]">
            <button
              onClick={() => setViewMode('accordion')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                viewMode === 'accordion' ? 'bg-purple-600 text-white shadow-sm' : 'text-white/60 hover:text-white'
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
              className={`px-2 py-0.5 rounded font-medium flex items-center gap-1 transition ${
                viewMode === 'pdf' ? 'bg-purple-600 text-white shadow-sm' : 'text-white/60 hover:text-white'
              }`}
            >
              <span>Full Return PDF</span>
              {!uploadedReturnUrl && <span className="text-[9px] opacity-60">(Upload)</span>}
            </button>
          </div>

          {/* Upload 1040 PDF Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1 rounded hover:bg-white/10 text-blue-400 hover:text-white transition"
            title="Upload David Ramsey 1040 Return PDF"
          >
            <Upload className="size-3.5" />
          </button>

          {/* Collapse Button */}
          <button
            onClick={() => setIsFormCollapsed(true)}
            className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
            title="Collapse Form 1040 Return Panel"
          >
            <PanelRightClose className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ── SUB-TOOLBAR / STATUS STRIP ── */}
      <div className="bg-[#0e1424] px-3 py-2 border-b border-white/10 flex justify-between items-center text-[11px] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-white/50">Preparer:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="size-3" />
              <span>David Ramsey, CPA</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-white/50 border-l border-white/10 pl-3">
            <span>Viewer:</span>
            <b className="text-white">{isViewingAs ? activePersona.name : 'Me (Owner)'}</b>
          </div>
        </div>

        {viewMode === 'accordion' && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleAllForms(true)}
              className="text-[10px] text-white/50 hover:text-white underline px-1"
            >
              Expand All
            </button>
            <span className="text-white/20">•</span>
            <button
              onClick={() => toggleAllForms(false)}
              className="text-[10px] text-white/50 hover:text-white underline px-1"
            >
              Collapse All
            </button>
          </div>
        )}
      </div>

      {/* ── MODE 1: FULL 1040 RETURN PDF AS-IS ── */}
      {viewMode === 'pdf' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#050811] p-2">
          {uploadedReturnUrl ? (
            <div className="w-full h-full flex flex-col rounded-lg overflow-hidden border border-white/10 bg-slate-950 shadow-2xl">
              <div className="bg-[#0e1424] px-3 py-1.5 border-b border-white/10 flex justify-between items-center text-xs gap-2 flex-wrap">
                <span className="font-semibold text-white truncate max-w-[200px]" title={uploadedReturnName || `Form 1040 Return (${year})`}>
                  {uploadedReturnName || `Form 1040 Return (${year})`}
                </span>

                {/* PDF Page Navigation & Zoom Toolbar */}
                <div className="flex items-center gap-1 bg-[#141b2d] px-1.5 py-0.5 rounded border border-white/10 text-white/70">
                  <button
                    type="button"
                    onClick={() => pdfViewerRef.current?.prevPage()}
                    disabled={pdfState.currentPage <= 1}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-white transition"
                    title="Previous Page"
                  >
                    <ChevronLeftIcon className="size-3" />
                  </button>
                  <span className="text-[10px] font-mono px-1">
                    {pdfState.currentPage} / {pdfState.numPages || 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => pdfViewerRef.current?.nextPage()}
                    disabled={pdfState.currentPage >= pdfState.numPages}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-white transition"
                    title="Next Page"
                  >
                    <ChevronRightIcon className="size-3" />
                  </button>
                  <span className="text-white/20 mx-0.5">|</span>
                  <button
                    type="button"
                    onClick={() => pdfViewerRef.current?.zoomOut()}
                    className="p-1 rounded hover:bg-white/10 text-white transition"
                    title="Zoom Out"
                  >
                    <ZoomOut className="size-3" />
                  </button>
                  <span className="text-[10px] font-mono px-0.5">
                    {Math.round((pdfState.scale || 1.3) * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => pdfViewerRef.current?.zoomIn()}
                    className="p-1 rounded hover:bg-white/10 text-white transition"
                    title="Zoom In"
                  >
                    <ZoomIn className="size-3" />
                  </button>
                </div>

                <a
                  href={uploadedReturnUrl}
                  download={uploadedReturnName || `Form 1040 Return (${year}).pdf`}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px] font-semibold"
                >
                  <Download className="size-3" />
                  <span>Download</span>
                </a>
              </div>
              <div className="flex-1 overflow-auto bg-[#03060c] flex justify-center items-start p-2">
                <HighlightablePdfViewer
                  ref={pdfViewerRef}
                  url={uploadedReturnUrl}
                  onStateChange={setPdfState}
                  className="bg-transparent"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#0b101c] rounded-xl border border-white/10 m-auto max-w-[420px]">
              <FileCheck className="size-12 text-purple-400/60 mb-3" />
              <h3 className="font-bold text-sm text-white mb-1">Upload 1040 Return PDF</h3>
              <p className="text-xs text-white/60 mb-4 leading-relaxed">
                Upload the complete Form 1040 PDF return package received from David Ramsey for Tax Year <b>{year}</b> to view it as-is in this panel.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition"
              >
                <Upload className="size-3.5" />
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
            <div className="bg-purple-950/40 border border-purple-500/30 rounded-lg p-2.5 text-[11px] text-purple-200 flex items-center justify-between">
              <span>📌 Focused Category: <b>{selectedCat.name}</b></span>
              <button 
                onClick={() => openReviewPanel('form_line', selectedCat.name, `Form 1040 - ${selectedCat.name}`)}
                className="text-xs font-bold text-purple-400 hover:text-purple-200 underline"
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
                className="border border-white/10 rounded-xl overflow-hidden bg-[#0e1424] shadow-md transition"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleForm(form.id)}
                  className="px-3.5 py-3 bg-[#11192e] hover:bg-[#16213c] cursor-pointer flex items-center justify-between border-b border-white/5 select-none transition"
                >
                  <div className="flex items-center gap-2.5">
                    {isExpanded ? (
                      <ChevronDown className="size-4 text-purple-400 shrink-0" />
                    ) : (
                      <ChevronRight className="size-4 text-white/50 shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{form.number}</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-medium">
                          {form.cpaStatus}
                        </span>
                      </div>
                      <div className="text-[11px] text-white/60 font-medium">{form.title}</div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openReviewPanel('form_line', form.number, `${form.number} — ${form.title}`);
                    }}
                    className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-purple-300 transition"
                    title={`Add CPA note for ${form.number}`}
                  >
                    <MessageSquare className="size-3.5" />
                  </button>
                </div>

                {/* Accordion Content — Line Items As-Is */}
                {isExpanded && (
                  <div className="divide-y divide-white/5 bg-[#090d18] text-xs font-mono">
                    {form.lines.map((line, idx) => {
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
                          }}
                          className={`p-2.5 px-3.5 flex items-center justify-between cursor-pointer transition ${
                            isCatHighlight ? 'bg-purple-950/60 text-white font-semibold' : 'hover:bg-white/5'
                          } ${line.isTotal ? 'bg-white/5 font-bold border-t border-white/10 text-white' : 'text-white/80'} ${
                            line.isHighlight ? 'bg-purple-900/20 font-bold' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 pr-3">
                            <span className={line.isRefund ? 'text-emerald-400 font-bold' : line.isOwed ? 'text-rose-400 font-bold' : ''}>
                              {line.label}
                            </span>
                            {line.cat && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openReviewPanel?.('form_line', line.cat, line.label);
                                }}
                                className={`size-4 rounded-full flex items-center justify-center text-[9px] border transition shrink-0 ${
                                  status === 'accepted' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' :
                                  status === 'rejected' ? 'bg-red-500/20 border-red-500/40 text-red-300' :
                                  commentCount > 0 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
                                  'bg-white/5 border-white/10 text-white/30 hover:text-white'
                                }`}
                                title="Line Review / Annotation Thread"
                              >
                                <MessageSquare className="size-2.5" />
                              </button>
                            )}
                          </div>

                          <span className={`font-mono text-xs shrink-0 ${
                            line.isRefund ? 'text-emerald-400 font-bold text-sm' :
                            line.isOwed ? 'text-rose-400 font-bold text-sm' :
                            line.isTotal ? 'text-white font-bold' :
                            'text-white/90'
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
