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
  Loader2,
  ListChecks,
  Files,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import SpreadsheetPreview from './SpreadsheetPreview';
import { uploadTaxDocument } from '../api/taxService';
import TaxChecklist from './TaxChecklist';
import { saveTaxDocumentBlob, resolveDocumentUrl } from '../utils/taxDocumentStorage';

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
    { id: 'doc_2023_nri', name: 'NRI_Essentials_2023072100482718_AnnualReport_PaymentReceipt.pdf', category: 'Professional Services / CPA', payer: 'NRI Essentials', amount: 3500.00, type: 'PDF', status: 'verified', hasFile: true, pages: 2 },
  ],
  2022: [
    { id: 'doc_2022_w2', name: 'Deepika W2 2022.pdf', category: 'W2 Wages', payer: 'Bellevue School District 405', amount: 37995.76, withholding: 4063.44, type: 'PDF', status: 'verified', hasFile: true, pages: 2 },
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
  year = 2022,
  onYearChange,
  selectedCat,
  setSelectedCat,
  selectedDoc,
  setSelectedDoc,
  threads = {},
  openReviewPanel,
  isDocsCollapsed,
  setIsDocsCollapsed,
  onSelectAndSwitch,
  onTransferValue
}) {
  const [viewMode, setViewMode] = useState('checklist'); // 'checklist' | 'viewer'
  const [activeDocUrl, setActiveDocUrl] = useState(null);
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTargetDoc, setUploadTargetDoc] = useState(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');
  const fileInputRef = useRef(null);
  const activeBlobUrlRef = useRef(null);

  // Custom uploaded docs stored locally (cleaned of dead blob URLs)
  const [customDocs, setCustomDocs] = useState(() => {
    try {
      const saved = localStorage.getItem(`cloudbaud_tax_custom_docs_${year}`);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return parsed.map(d => {
        const { localUrl, ...rest } = d;
        return rest;
      });
    } catch {
      return [];
    }
  });

  // Reload custom docs whenever active year changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`cloudbaud_tax_custom_docs_${year}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCustomDocs(parsed.map(d => {
          const { localUrl, ...rest } = d;
          return rest;
        }));
      } else {
        setCustomDocs([]);
      }
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

      const docId = uploadTargetDoc?.id || `doc_custom_${Date.now()}`;
      const newDoc = {
        id: docId,
        name: file.name,
        category: uploadTargetDoc?.category || selectedCat?.name || 'Supporting Document',
        payer: uploadTargetDoc?.payer || 'Uploaded Document',
        amount: uploadTargetDoc?.amount,
        withholding: uploadTargetDoc?.withholding,
        type: docType,
        status: 'verified',
        hasFile: true,
        pages: 1,
        inIndexedDb: true
      };

      // 1. Permanently persist file Blob into IndexedDB
      await saveTaxDocumentBlob(year, docId, file);
      await saveTaxDocumentBlob(year, file.name, file);

      // 2. Persist metadata into localStorage (without dead blob strings)
      setCustomDocs(prev => {
        const filtered = prev.filter(d => d.id !== newDoc.id && d.name !== newDoc.name);
        const next = [newDoc, ...filtered];
        try {
          localStorage.setItem(`cloudbaud_tax_custom_docs_${year}`, JSON.stringify(next));
        } catch (err) {
          console.debug('Storage error:', err);
        }
        return next;
      });

      // 3. Optional remote sync
      try {
        await uploadTaxDocument(file, year, selectedCat?.id);
      } catch (cloudErr) {
        console.warn('Cloud storage upload skipped, file cached in IndexedDB:', cloudErr);
      }

      if (activeBlobUrlRef.current && activeBlobUrlRef.current.startsWith('blob:')) {
        try { URL.revokeObjectURL(activeBlobUrlRef.current); } catch {}
      }
      activeBlobUrlRef.current = localUrl;
      setSelectedDoc(newDoc);
      setActiveDocUrl(localUrl);
      setViewMode('viewer');
      setUploadSuccessMessage(`Attached & Saved ${file.name}`);
      setTimeout(() => setUploadSuccessMessage(''), 4500);
    } catch (err) {
      console.error('File upload error:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const defaultDocs = useMemo(() => {
    return TAX_DOCUMENTS_BY_YEAR[year] || [];
  }, [year]);

  const allAvailableDocs = useMemo(() => {
    const combined = [...customDocs];
    defaultDocs.forEach(d => {
      if (!combined.some(c => c.id === d.id || c.name === d.name)) {
        combined.push(d);
      }
    });
    return combined;
  }, [customDocs, defaultDocs]);

  // Sync and resolve active doc URL whenever selectedDoc or year changes
  useEffect(() => {
    let isCancelled = false;

    async function syncUrl() {
      if (!selectedDoc) {
        setActiveDocUrl(null);
        return;
      }

      setIsUrlLoading(true);
      try {
        const resolved = await resolveDocumentUrl(year, selectedDoc);
        if (!isCancelled) {
          if (activeBlobUrlRef.current && activeBlobUrlRef.current !== resolved && activeBlobUrlRef.current.startsWith('blob:')) {
            try { URL.revokeObjectURL(activeBlobUrlRef.current); } catch {}
          }
          if (resolved && resolved.startsWith('blob:')) {
            activeBlobUrlRef.current = resolved;
          }
          setActiveDocUrl(resolved);
        }
      } catch (err) {
        console.warn('Error resolving document URL:', err);
      } finally {
        if (!isCancelled) setIsUrlLoading(false);
      }
    }

    syncUrl();

    return () => {
      isCancelled = true;
    };
  }, [selectedDoc, year]);

  const handleOpenDoc = async (doc) => {
    setSelectedDoc(doc);
    setViewMode('viewer');
  };

  // Render Slim Collapsed Strip
  if (isDocsCollapsed) {
    return (
      <div 
        onClick={() => setIsDocsCollapsed(false)}
        className="w-11 h-full border-r border-white/10 bg-[#0a0f1d] hover:bg-[#11192e] cursor-pointer flex flex-col items-center py-4 justify-between transition group select-none shrink-0"
        title="Click to expand Checklist Panel"
      >
        <div className="flex flex-col items-center gap-3">
          <button className="p-1 rounded hover:bg-white/10 text-blue-400 group-hover:scale-110 transition">
            <PanelLeftOpen className="size-4" />
          </button>
          <ListChecks className="size-4 text-blue-400/80" />
        </div>

        <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-semibold text-white/60 tracking-wider whitespace-nowrap">
          Checklist Panel • {year}
        </span>

        <span className="text-[10px] text-blue-400 font-bold bg-blue-500/20 px-1.5 py-0.5 rounded">
          65
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
      <div className="bg-[#121829] p-2 px-3 font-semibold border-b border-white/10 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          {viewMode === 'viewer' ? (
            <button
              onClick={() => setViewMode('checklist')}
              className="p-1 px-2 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white flex items-center gap-1.5 transition text-xs font-semibold border border-blue-500/30"
              title="Return to Master Checklist"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Checklist</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <ListChecks className="size-4 text-blue-400" />
              <span className="font-bold text-sm tracking-tight">Checklist Panel</span>
              <span className="text-[10px] text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-mono">
                {year}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {viewMode === 'viewer' && selectedDoc?.hasFile && (
            <a
              href={activeDocUrl}
              download={selectedDoc.name}
              className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition shadow-sm"
              title={`Download ${selectedDoc.name}`}
            >
              <Download className="size-3" />
              <span className="hidden sm:inline">Download</span>
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
              <span className="hidden sm:inline">Annotate</span>
            </button>
          )}

          <button 
            onClick={() => triggerUpload()}
            disabled={isUploading}
            className="flex items-center gap-1 px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-[11px] font-semibold transition shadow-sm"
            title="Upload document"
          >
            {isUploading ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
            <span>{isUploading ? 'Uploading...' : 'Attach Doc'}</span>
          </button>

          {/* Collapse Button */}
          <button
            onClick={() => setIsDocsCollapsed(true)}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
            title="Collapse Checklist Panel"
          >
            <PanelLeftClose className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT: CHECKLIST vs DOCUMENT VIEWER ── */}
      <div className="flex-1 min-h-0 h-full w-full overflow-hidden flex flex-col">
        {viewMode === 'viewer' && selectedDoc ? (
          <div className="h-full flex flex-col bg-[#050811] overflow-hidden">
            {/* Viewer Sub-Header */}
            <div className="bg-[#0b101c] px-3 py-1.5 border-b border-white/10 flex items-center justify-between text-xs gap-2 flex-wrap">
              <div className="flex items-center gap-2 truncate max-w-[60%]">
                <FileText className="size-3.5 text-blue-400 shrink-0" />
                <span className="font-semibold text-white truncate" title={selectedDoc.name}>
                  {selectedDoc.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white/50 shrink-0 font-mono">
                  {selectedDoc.type || 'PDF'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {activeDocUrl && selectedDoc.hasFile && (
                  <a
                    href={activeDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    title="Open in external browser window"
                  >
                    <ExternalLink className="size-3" />
                    <span>New Tab</span>
                  </a>
                )}
                <button
                  onClick={() => setViewMode('checklist')}
                  className="text-[11px] text-white/60 hover:text-white underline shrink-0"
                >
                  Back to Checklist
                </button>
              </div>
            </div>

            {/* Document Render (Native PDF Frame / Spreadsheet / Upload Prompt) */}
            <div className="flex-1 overflow-hidden p-2 flex flex-col items-center justify-center bg-[#03060d] relative min-h-0">
              {isUrlLoading ? (
                <div className="flex flex-col items-center justify-center gap-2 text-white/60">
                  <Loader2 className="size-6 text-blue-400 animate-spin" />
                  <span className="text-xs">Loading document preview...</span>
                </div>
              ) : !selectedDoc.hasFile && !activeDocUrl ? (
                /* Missing Document Upload Prompt */
                <div className="bg-[#0b101c] border border-amber-500/30 rounded-xl p-6 text-center max-w-[420px] text-white shadow-2xl m-auto">
                  <div className="size-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="size-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Physical File Not Uploaded Yet</h3>
                  <p className="text-xs text-white/60 leading-relaxed mb-4">
                    No physical document has been attached for <b>{selectedDoc.name}</b> ({year}) yet. You can attach it directly from your computer or copy from Google Drive.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => triggerUpload(selectedDoc)}
                      disabled={isUploading}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold text-xs shadow transition"
                    >
                      {isUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                      <span>{isUploading ? 'Uploading...' : `Upload ${selectedDoc.name}`}</span>
                    </button>
                    <a
                      href="https://drive.google.com/drive/folders/1bsHTGlWMp1j0fp_d2eDqiho1Ol0cMnzG?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <ExternalLink className="size-3" />
                      <span>Google Drive</span>
                    </a>
                  </div>
                </div>
              ) : selectedDoc.type === 'XLSX' || selectedDoc.name?.toLowerCase().endsWith('.xlsx') ? (
                <SpreadsheetPreview url={activeDocUrl} name={selectedDoc.name} className="w-full h-full" />
              ) : (
                /* Direct Native PDF / Document Frame */
                <div className="w-full h-full flex flex-col rounded-lg overflow-hidden border border-white/10 bg-slate-950 shadow-2xl relative">
                  <iframe
                    key={activeDocUrl}
                    src={activeDocUrl}
                    title={selectedDoc.name}
                    className="w-full h-full border-0 bg-slate-900 rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Viewer Footer */}
            <div className="bg-[#0e1424] px-3 py-1.5 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60 shrink-0">
              <span className="truncate">
                Source: <b>{selectedDoc.inIndexedDb || activeDocUrl?.startsWith('blob:') ? 'Locally Stored Document (Persistent)' : selectedDoc.hasFile ? `/Documents - Taxes/${year}/${selectedDoc.name}` : 'Not Uploaded Yet'}</b>
              </span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1 shrink-0">
                <CheckCircle2 className="size-3" />
                <span>Linked to Worksheet</span>
              </span>
            </div>
          </div>
        ) : (
          <TaxChecklist
            year={year}
            onYearChange={onYearChange}
            availableDocs={allAvailableDocs}
            onViewDocument={handleOpenDoc}
            onTriggerUpload={(item) => triggerUpload({ id: item.id, name: `${item.label}.pdf`, category: item.label })}
            onTransferValue={onTransferValue}
          />
        )}
      </div>
    </div>
  );
}
