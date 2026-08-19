import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  MessageSquare,
  Eye,
  Download,
  AlertTriangle,
  Upload,
  Loader2
} from 'lucide-react';
import SpreadsheetPreview from './SpreadsheetPreview';
import { uploadTaxDocument } from '../api/taxService';

// ─────────────────────────────────────────────────────────────────────────────
// ACCURATE TAX DOCUMENTS REGISTRY BY YEAR
// Real files on disk vs placeholders that need uploading
// ─────────────────────────────────────────────────────────────────────────────
export const TAX_DOCUMENTS_BY_YEAR = {
  2024: [
    { id: 'doc_2024_w2', name: 'Dolly W2 2024.pdf', category: 'W2 Wages', payer: 'Dolly Inc.', amount: 84200.00, withholding: 12450.00, type: 'PDF', status: 'verified', hasFile: true, pages: 1 },
    { id: 'doc_2024_1099nec', name: 'Sankara Jish Nath 1099 Year 24.docx', category: 'CloudBaud LLC', payer: 'Sankara LLC', amount: 12300.00, type: 'DOCX', status: 'verified', hasFile: true, pages: 2 },
    { id: 'doc_2024_cb', name: 'CloudBaud LLC 2024 P&L', category: 'CloudBaud LLC', payer: 'CloudBaud LLC', amount: 153952.00, type: 'PDF', status: 'needs_upload', hasFile: false },
    { id: 'doc_2024_fidelity', name: 'Fidelity 9414 1099-B', category: '1099-B', payer: 'Fidelity Brokerage', amount: 18402.11, dividends: 2430.15, type: 'PDF', status: 'needs_upload', hasFile: false },
  ],
  2023: [
    { id: 'doc_2023_w2', name: 'Deepika W2 2023.pdf', category: 'W2 Wages', payer: 'Bellevue School District 405', amount: 59110.59, withholding: 8005.09, type: 'PDF', status: 'verified', hasFile: true, pages: 1 },
    { id: 'doc_2023_cb', name: 'CloudBaud LLC 2023 P&L', category: 'CloudBaud LLC', payer: 'CloudBaud LLC', amount: 38376.00, type: 'PDF', status: 'needs_upload', hasFile: false },
    { id: 'doc_2023_nri', name: 'NRI_Essentials_AnnualReport_PaymentReceipt.pdf', category: 'Professional Services / CPA', payer: 'NRI Essentials', amount: 3500.00, type: 'PDF', status: 'verified', hasFile: true, pages: 2 },
  ],
  2022: [
    { id: 'doc_2022_w2', name: 'Form W-2 (Deepika)', category: 'W2 Wages', payer: 'Employer', amount: 0, type: 'PDF', status: 'needs_upload', hasFile: false },
    { id: 'doc_2022_cb', name: 'CloudBaud LLC 2022 K-1', category: 'CloudBaud LLC', payer: 'CloudBaud LLC', amount: 365772.34, type: 'PDF', status: 'needs_upload', hasFile: false },
    { id: 'doc_2022_1098', name: 'Form 1098 (Mortgage Interest)', category: 'Real Estate Interest Woodridge', payer: 'Mortgage Lender', amount: 10516.14, type: 'PDF', status: 'needs_upload', hasFile: false },
    { id: 'doc_2022_tax', name: 'Property Tax Statement', category: 'Real Estate Taxes Woodridge', payer: 'King County', amount: 7271.09, type: 'PDF', status: 'needs_upload', hasFile: false },
  ],
  2021: [
    { id: 'doc_2021_w2', name: 'Form W-2 Wages 2021', category: 'W2 Wages', payer: 'Employer', amount: 49793.32, withholding: 5834.02, type: 'PDF', status: 'needs_upload', hasFile: false },
    { id: 'doc_2021_schc', name: 'business expenses CloudBaud 2021.xlsx', category: 'CloudBaud LLC', payer: 'CloudBaud LLC', amount: 67285.01, type: 'XLSX', status: 'verified', hasFile: true, pages: 1 },
    { id: 'doc_2021_1098', name: 'GetDocument.pdf', category: 'Real Estate Interest Woodridge', payer: 'Lender', amount: 10516.14, type: 'PDF', status: 'verified', hasFile: true, pages: 2 },
    { id: 'doc_2021_cherry', name: 'CherryCrest_1099_2021.pdf', category: 'Rental Income', payer: 'Property Manager', amount: 4110.17, type: 'PDF', status: 'verified', hasFile: true, pages: 2 },
  ],
  2020: [
    { id: 'doc_2020_w2', name: 'Form W-2 Wage Statement', category: 'W2 Wages', payer: 'Employer', amount: 69549.66, withholding: 10423.75, type: 'PDF', status: 'needs_upload', hasFile: false },
    { id: 'doc_2020_comfort', name: 'Comfort Foods 1099-K & Ledger', category: 'Comfort Foods', payer: 'Comfort Foods Inc', amount: -44581.92, type: 'PDF', status: 'needs_upload', hasFile: false },
    { id: 'doc_2020_cloudbaud', name: 'business expenses CloudBaud 2020.xlsx', category: 'CloudBaud LLC', payer: 'CloudBaud LLC', amount: 365772.34, type: 'XLSX', status: 'verified', hasFile: true, pages: 1 },
    { id: 'doc_2020_1098', name: 'Mortgage.pdf', category: 'Real Estate Interest Woodridge', payer: 'Mortgage Corp', amount: 16431.02, type: 'PDF', status: 'verified', hasFile: true, pages: 2 },
    { id: 'doc_2020_condo', name: 'Condo real estate tax.docx', category: 'Real Estate Taxes Woodridge', payer: 'County Tax Collector', amount: 7191.32, type: 'DOCX', status: 'verified', hasFile: true, pages: 1 },
    { id: 'doc_2020_cherry', name: 'CherryCrest_1099_2020.pdf', category: 'Rental Income', payer: 'Cherry Crest Rentals', amount: 3186.17, type: 'PDF', status: 'verified', hasFile: true, pages: 2 },
  ],
  2019: [
    { id: 'doc_2019_w2', name: '2019 W2.pdf', category: 'W2 Wages', payer: 'Employer', amount: 84444.89, withholding: 12386.28, type: 'PDF', status: 'verified', hasFile: true, pages: 1 },
    { id: 'doc_2019_fidelity', name: '2019-Fidelity-9414-Consolidated-Form-1099.pdf', category: '1099-B', payer: 'Fidelity', amount: 79825.51, type: 'PDF', status: 'verified', hasFile: true, pages: 12 },
    { id: 'doc_2019_mort', name: 'Mortgage_1098.pdf', category: 'Real Estate Interest Woodridge', payer: 'Lender', amount: 18719.36, type: 'PDF', status: 'verified', hasFile: true, pages: 2 },
    { id: 'doc_2019_sep', name: '2019-SEP IRA-3704-Form-5498.pdf', category: 'SEP IRA', payer: 'Fidelity IRA', amount: 5500.00, type: 'PDF', status: 'verified', hasFile: true, pages: 1 },
  ],
  2018: [
    { id: 'doc_2018_w2', name: '2018 W2.pdf', category: 'W2 Wages', payer: 'Employer', amount: 70399.57, withholding: 7675.56, type: 'PDF', status: 'verified', hasFile: true, pages: 1 },
    { id: 'doc_2018_ops', name: '2018-Operations-9414-Consolidated-Form-1099.pdf', category: '1099-B', payer: 'Fidelity Operations', amount: 485019.41, type: 'PDF', status: 'verified', hasFile: true, pages: 10 },
    { id: 'doc_2018_woodridge', name: '2018-Woodridge-7692-Consolidated-Form-1099.pdf', category: '1099-B', payer: 'Fidelity Woodridge', amount: 12005.50, type: 'PDF', status: 'verified', hasFile: true, pages: 6 },
    { id: 'doc_2018_sep', name: '2018-SEP-IRA-OLD-5224-Form-1099-R-.pdf', category: 'SEP IRA', payer: 'Fidelity IRA', amount: 43605.60, type: 'PDF', status: 'verified', hasFile: true, pages: 1 },
    { id: 'doc_2018_bizex', name: 'business expenses CloudBaud 2018.xlsx', category: 'CloudBaud LLC', payer: 'CloudBaud LLC', amount: 485019.41, type: 'XLSX', status: 'verified', hasFile: true, pages: 1 },
  ],
  2017: [
    { id: 'doc_2017_1040', name: 'Nath2017Form1040.pdf', category: 'Form 1040', payer: 'IRS Form 1040 Return', amount: 63132.46, type: 'PDF', status: 'verified', hasFile: true, pages: 2 },
    { id: 'doc_2017_w2', name: '2017 W2.pdf', category: 'W2 Wages', payer: 'Employer', amount: 63132.46, withholding: 7909.36, type: 'PDF', status: 'verified', hasFile: true, pages: 1 },
    { id: 'doc_2017_fidelity', name: '2017-Fidelity-7692-Consolidated-Form-1099.pdf', category: '1099-B', payer: 'Fidelity', amount: 334565.42, type: 'PDF', status: 'verified', hasFile: true, pages: 8 },
    { id: 'doc_2017_bizex', name: '2017 bizex CloudBaud Updated.xlsx', category: 'CloudBaud LLC', payer: 'CloudBaud LLC', amount: 334565.42, type: 'XLSX', status: 'verified', hasFile: true, pages: 1 },
    { id: 'doc_2017_1098', name: '2017_1098_Mortgage Interest.pdf', category: 'Real Estate Interest Woodridge', payer: 'Mortgage Corp', amount: 17619.67, type: 'PDF', status: 'verified', hasFile: true, pages: 2 },
    { id: 'doc_2017_sep', name: '2017-SEP-IRA-OLD-5224-Form-5498.pdf', category: 'SEP IRA', payer: 'Fidelity IRA', amount: 5244.90, type: 'PDF', status: 'verified', hasFile: true, pages: 1 },
  ]
};

export default function SupportingDocsViewerPane({
  year = 2020,
  selectedCat,
  setSelectedCat,
  selectedDoc,
  setSelectedDoc,
  threads = {},
  openReviewPanel,
  isDocsCollapsed,
  setIsDocsCollapsed,
  onSelectAndSwitch
}) {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'viewer'
  const [activeDocUrl, setActiveDocUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');
  const [uploadTargetDoc, setUploadTargetDoc] = useState(null);
  const fileInputRef = useRef(null);

  // Custom User Uploaded Documents for the active year with localStorage persistence
  const [customDocs, setCustomDocs] = useState(() => {
    try {
      const saved = localStorage.getItem(`cloudbaud_tax_custom_docs_${year}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Reload custom docs whenever active year changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`cloudbaud_tax_custom_docs_${year}`);
      setCustomDocs(saved ? JSON.parse(saved) : []);
    } catch {
      setCustomDocs([]);
    }
  }, [year]);

  // Trigger native file picker
  const triggerUpload = (targetDoc = null) => {
    setUploadTargetDoc(targetDoc);
    fileInputRef.current?.click();
  };

  // Handle file selection and upload
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);

    try {
      const localUrl = URL.createObjectURL(file);
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isXlsx = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls') || file.name.toLowerCase().endsWith('.csv');
      const isDocx = file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc');
      const docType = isPdf ? 'PDF' : isXlsx ? 'XLSX' : isDocx ? 'DOCX' : 'DOC';

      const newDoc = {
        id: uploadTargetDoc?.id || `doc_custom_${Date.now()}`,
        name: file.name,
        category: uploadTargetDoc?.category || selectedCat?.name || 'Supporting Document',
        payer: uploadTargetDoc?.payer || 'Uploaded Document',
        amount: uploadTargetDoc?.amount,
        withholding: uploadTargetDoc?.withholding,
        type: docType,
        status: 'verified',
        hasFile: true,
        pages: 1,
        localUrl: localUrl
      };

      // Persist to customDocs state & localStorage
      setCustomDocs(prev => {
        const filtered = prev.filter(d => d.id !== newDoc.id);
        const next = [newDoc, ...filtered];
        try {
          localStorage.setItem(`cloudbaud_tax_custom_docs_${year}`, JSON.stringify(next));
        } catch (err) {
          console.debug('Storage error:', err);
        }
        return next;
      });

      // Try background upload to Supabase storage
      try {
        await uploadTaxDocument(file, year, selectedCat?.id);
      } catch (cloudErr) {
        console.warn('Cloud storage upload skipped, file cached locally:', cloudErr);
      }

      // Immediately select and view the uploaded document
      setSelectedDoc(newDoc);
      setActiveDocUrl(localUrl);
      setViewMode('viewer');
      setUploadSuccessMessage(`Successfully attached ${file.name}`);
      setTimeout(() => setUploadSuccessMessage(''), 4500);
    } catch (err) {
      console.error('File upload error:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Retrieve actual documents for the active year (merging base registry with user uploaded docs)
  const activeYearDocs = useMemo(() => {
    const base = TAX_DOCUMENTS_BY_YEAR[year] || TAX_DOCUMENTS_BY_YEAR[2022] || [];
    const merged = base.map(b => {
      const custom = customDocs.find(c => c.id === b.id);
      return custom || b;
    });
    const uniqueCustom = customDocs.filter(c => !base.some(b => b.id === c.id));
    return [...uniqueCustom, ...merged];
  }, [year, customDocs]);

  // Filter docs if a category is selected in Excel
  const filteredDocs = useMemo(() => {
    if (!selectedCat) return activeYearDocs;
    const catName = selectedCat.name || '';
    const match = activeYearDocs.filter(d => 
      d.category === catName || 
      d.name?.toLowerCase().includes(catName.toLowerCase()) ||
      (catName.includes('W2') && d.category.includes('W2')) ||
      (catName.includes('CloudBaud') && (d.category.includes('CloudBaud') || d.name.includes('CloudBaud'))) ||
      (catName.includes('Comfort') && d.name.includes('Comfort'))
    );
    return match.length > 0 ? match : activeYearDocs;
  }, [activeYearDocs, selectedCat]);

  // Open Document in Viewer
  const handleOpenDoc = (doc) => {
    setSelectedDoc(doc);
    const url = doc.localUrl || `/src/workspace/data/Documents - Taxes/${year}/${doc.name}`;
    setActiveDocUrl(url);
    setViewMode('viewer');
    onSelectAndSwitch?.('docs');
  };

  // If selectedDoc changed from outside, sync url
  useEffect(() => {
    if (selectedDoc) {
      const url = selectedDoc.localUrl || `/src/workspace/data/Documents - Taxes/${year}/${selectedDoc.name}`;
      setActiveDocUrl(url);
    }
  }, [selectedDoc, year]);

  // Render Slim Collapsed Strip
  if (isDocsCollapsed) {
    return (
      <div 
        onClick={() => setIsDocsCollapsed(false)}
        className="w-11 h-full border-r border-white/10 bg-[#0a0f1d] hover:bg-[#11192e] cursor-pointer flex flex-col items-center py-4 justify-between transition group select-none shrink-0"
        title="Click to expand Supporting Docs"
      >
        <div className="flex flex-col items-center gap-3">
          <button className="p-1 rounded hover:bg-white/10 text-emerald-400 group-hover:scale-110 transition">
            <PanelLeftOpen className="size-4" />
          </button>
          <FileText className="size-4 text-emerald-400/80" />
        </div>

        <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-semibold text-white/60 tracking-wider whitespace-nowrap">
          Supporting Docs ({filteredDocs.length}) • {year}
        </span>

        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded">
          {filteredDocs.length}
        </span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#070b14] text-white text-xs border-r border-white/10 overflow-hidden relative">
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Success Toast */}
      {uploadSuccessMessage && (
        <div className="absolute top-12 left-4 right-4 z-50 bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-2xl flex items-center gap-2 border border-emerald-400/30 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span className="truncate">{uploadSuccessMessage}</span>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="bg-[#121829] p-3 font-semibold border-b border-white/10 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          {viewMode === 'viewer' ? (
            <button
              onClick={() => setViewMode('list')}
              className="p-1 rounded hover:bg-white/10 text-blue-400 hover:text-white flex items-center gap-1 transition text-xs font-semibold"
              title="Back to Document List"
            >
              <ArrowLeft className="size-3.5" />
              <span>Docs ({year})</span>
            </button>
          ) : (
            <>
              <FileText className="size-4 text-emerald-400" />
              <span className="font-bold text-sm tracking-tight">Supporting Docs</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                {year} ({filteredDocs.length} files)
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {viewMode === 'viewer' && selectedDoc?.hasFile && (
            <a
              href={activeDocUrl}
              download={selectedDoc.name}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition shadow-sm"
              title={`Download ${selectedDoc.name} to audit locally`}
            >
              <Download className="size-3" />
              <span>Download</span>
            </a>
          )}

          {viewMode === 'viewer' && (
            <button
              onClick={() => {
                if (selectedDoc) {
                  openReviewPanel?.('document', selectedDoc.id, `${selectedDoc.name} (${year})`);
                }
              }}
              className="flex items-center gap-1 px-2 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-[11px] font-semibold transition"
              title="Add CPA Annotation or Note to this Document"
            >
              <MessageSquare className="size-3 text-purple-300" />
              <span>Annotate</span>
            </button>
          )}

          <button 
            onClick={() => triggerUpload()}
            disabled={isUploading}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-[11px] font-semibold transition shadow-sm"
            title="Upload new document from computer or Google Drive"
          >
            {isUploading ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
            <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
          </button>

          {/* Collapse Button */}
          <button
            onClick={() => setIsDocsCollapsed(true)}
            className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
            title="Collapse Supporting Docs"
          >
            <PanelLeftClose className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ── FILTER TAG (When Excel row selected) ── */}
      {selectedCat && viewMode === 'list' && (
        <div className="bg-blue-900/30 border-b border-blue-500/30 px-3 py-2 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-blue-300 truncate">
            Excel Trace: <b>{selectedCat.name}</b> ({year})
          </span>
          <button 
            onClick={() => setSelectedCat(null)} 
            className="text-[10px] text-white/50 hover:text-white underline ml-2 shrink-0"
          >
            Show All ({activeYearDocs.length})
          </button>
        </div>
      )}

      {/* ── MODE 1: DOCUMENT LIST VIEW ── */}
      {viewMode === 'list' && (
        <div className="flex-1 overflow-auto p-3 space-y-2.5">
          {filteredDocs.map(doc => {
            const isSelected = selectedDoc?.id === doc.id;
            const threadKey = `th_document_${doc.id}_${year}`;
            const docThread = threads[threadKey];
            const commentCount = docThread?.comments?.length || 0;
            const isMissing = !doc.hasFile;

            return (
              <div 
                key={doc.id}
                onClick={() => handleOpenDoc(doc)}
                className={`p-3 rounded-lg border cursor-pointer transition flex flex-col gap-2 ${
                  isSelected 
                    ? 'bg-blue-600/20 border-blue-500/50 shadow-md ring-1 ring-blue-500/40' 
                    : isMissing 
                    ? 'bg-amber-950/10 border-amber-500/20 hover:bg-amber-950/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className={`size-4 shrink-0 ${doc.hasFile ? 'text-emerald-400' : 'text-amber-400'}`} />
                    <span className="font-semibold text-xs text-white truncate">
                      {doc.name}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                    doc.hasFile
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {doc.hasFile ? <CheckCircle2 className="size-2.5" /> : <AlertTriangle className="size-2.5" />}
                    <span>{doc.hasFile ? 'Uploaded ✅' : 'Needs Upload'}</span>
                  </span>
                </div>

                {/* Extracted Details & Payer */}
                <div className="flex items-center justify-between text-[11px] text-white/60 bg-black/30 p-2 rounded border border-white/5 font-mono">
                  <div className="truncate">
                    <span className="text-white/40">Category: </span>
                    <span className="text-white font-medium">{doc.category}</span>
                  </div>
                  {doc.amount !== undefined && (
                    <div className="text-emerald-300 font-bold ml-2 shrink-0">
                      ${Number(doc.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                  <span className="text-white/40 flex items-center gap-1">
                    <span>{doc.type}</span>
                    {doc.hasFile ? (
                      <>
                        <span>•</span>
                        <span>{doc.pages || 1} pg</span>
                      </>
                    ) : (
                      <span className="text-amber-400/80">• Unattached</span>
                    )}
                  </span>

                  <div className="flex items-center gap-2">
                    {doc.hasFile ? (
                      <>
                        <a
                          href={`/src/workspace/data/Documents - Taxes/${year}/${doc.name}`}
                          download={doc.name}
                          onClick={(e) => e.stopPropagation()}
                          className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-emerald-500/10"
                          title="Download file"
                        >
                          <Download className="size-2.5" />
                          <span>Download</span>
                        </a>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDoc(doc);
                          }}
                          className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20"
                        >
                          <Eye className="size-3" />
                          <span>View</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerUpload(doc);
                        }}
                        className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20"
                      >
                        <Upload className="size-2.5" />
                        <span>Upload</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openReviewPanel?.('document', doc.id, `${doc.name} (${year})`);
                      }}
                      className="text-white/50 hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10"
                    >
                      <MessageSquare className="size-3 text-purple-400" />
                      <span>{commentCount > 0 ? commentCount : 'Note'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODE 2: INTERACTIVE PDF / DOC VIEWER ── */}
      {viewMode === 'viewer' && selectedDoc && (
        <div className="flex-1 flex flex-col bg-[#050811] overflow-hidden">
          {/* Viewer Toolbar */}
          <div className="bg-[#0e1424] px-3 py-2 border-b border-white/10 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-white truncate max-w-[160px]">{selectedDoc.name}</span>
              {selectedDoc.amount !== undefined && (
                <span className="bg-emerald-500/20 text-emerald-300 font-mono font-bold px-1.5 py-0.5 rounded text-[11px] border border-emerald-500/30 shrink-0">
                  ${Number(selectedDoc.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedDoc.hasFile && (
                <a
                  href={activeDocUrl}
                  download={selectedDoc.name}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold transition"
                  title="Download File"
                >
                  <Download className="size-3" />
                  <span>Download</span>
                </a>
              )}
            </div>
          </div>

          {/* Document Canvas Container — Exact File As-Is */}
          <div className="flex-1 overflow-hidden p-2 flex flex-col items-center justify-center bg-[#03060d]">
            {!selectedDoc.hasFile ? (
              /* Missing Document Upload Prompt */
              <div className="bg-[#0b101c] border border-amber-500/30 rounded-xl p-6 text-center max-w-[420px] text-white shadow-2xl m-auto">
                <div className="size-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="size-6" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Physical File Not Uploaded Yet</h3>
                <p className="text-xs text-white/60 leading-relaxed mb-4">
                  This tax line item has an amount reported in your return (${Number(selectedDoc.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}), but no physical PDF/document has been attached to your vault for <b>{year}</b> yet.
                </p>
                <button 
                  onClick={() => triggerUpload(selectedDoc)}
                  disabled={isUploading}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold text-xs mx-auto shadow transition"
                >
                  {isUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  <span>{isUploading ? 'Uploading...' : `Upload ${selectedDoc.category} PDF`}</span>
                </button>
              </div>
            ) : selectedDoc.type === 'XLSX' ? (
              <SpreadsheetPreview url={activeDocUrl} name={selectedDoc.name} className="w-full h-full" />
            ) : (
              /* Direct As-Is PDF / Binary Document Frame */
              <div className="w-full h-full flex flex-col rounded-lg overflow-hidden border border-white/10 bg-slate-950 shadow-2xl">
                <iframe
                  src={activeDocUrl}
                  title={selectedDoc.name}
                  className="w-full h-full border-0 bg-slate-900"
                />
              </div>
            )}
          </div>

          {/* Viewer Footer */}
          <div className="bg-[#0e1424] px-3 py-1.5 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60 shrink-0">
            <span className="truncate">Source: <b>{selectedDoc.hasFile ? `/Documents - Taxes/${year}/${selectedDoc.name}` : 'Not Uploaded Yet'}</b></span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1 shrink-0">
              <CheckCircle2 className="size-3" />
              <span>Linked to Worksheet Cell</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
