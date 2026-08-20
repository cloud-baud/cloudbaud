import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Save,
  Copy,
  ClipboardPaste,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Lock,
  LockOpen,
  Sigma,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Upload,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  PanelLeftOpen,
  PanelLeftClose,
  PanelRightOpen,
  PanelRightClose,
  Maximize2,
  Minimize2,
  LayoutGrid,
  ExternalLink,
  Table,
  Sparkles,
  Search,
  Filter,
  X,
  Send
} from 'lucide-react';
import { updateTaxCell } from '../api/taxService';
import SpreadsheetPreview from './SpreadsheetPreview';
import { SUMMARY_TAB_NAMED_ROWS, SUMMARY_TAB_NAMED_RANGES, GOOGLE_SHEET_YEAR_COLUMNS, getNamedCell } from '../data/taxNamedRanges';
import { EXTRACTED_SHEET_THREADS } from '../data/extractedTaxSheetComments';

export const DEFAULT_GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1QubZfLE5OC8RuhhljIBvj7dUeWN3UwefYxrtH0HSiGY/edit?usp=sharing";

export function formatGoogleSheetEmbedUrl(rawUrl) {
  if (!rawUrl) return '';
  const cleanUrl = rawUrl.trim();
  if (cleanUrl.includes('htmlembed') || cleanUrl.includes('pubhtml')) {
    return cleanUrl;
  }
  const baseUrl = cleanUrl.split('?')[0].replace(/\/edit.*$/, '');
  return `${baseUrl}/edit?usp=sharing`;
}

export default function ExcelWorksheetGrid({
  year = 2020,
  onYearChange,
  accounts = [],
  entries = [],
  selectedCat,
  setSelectedCat,
  setSelectedDoc,
  setSelectedFormLine,
  onSelectAndSwitch,
  threads = {},
  openReviewPanel,
  onSaveCell,
  isDocsCollapsed = false,
  setIsDocsCollapsed,
  isFormCollapsed = false,
  setIsFormCollapsed,
  activeSheet: controlledActiveSheet,
  onActiveSheetChange
}) {
  const [googleSheetUrl, setGoogleSheetUrl] = useState(() => {
    try {
      const saved = localStorage.getItem('cloudbaud_google_sheet_url');
      if (saved && !saved.includes('1xiDL-_itpnVbIfufzP990O8CcyTz1h14')) {
        return saved;
      }
      return DEFAULT_GOOGLE_SHEET_URL;
    } catch {
      return DEFAULT_GOOGLE_SHEET_URL;
    }
  });
  const [isEditingSheetUrl, setIsEditingSheetUrl] = useState(false);
  const [sheetUrlInput, setSheetUrlInput] = useState(googleSheetUrl);

  const handleSaveSheetUrl = (newUrl) => {
    const trimmed = newUrl.trim();
    if (trimmed) {
      setGoogleSheetUrl(trimmed);
      try {
        localStorage.setItem('cloudbaud_google_sheet_url', trimmed);
      } catch {}
      setIsEditingSheetUrl(false);
    }
  };

  const [internalActiveSheet, setInternalActiveSheet] = useState(() => {
    try {
      return localStorage.getItem('cloudbaud_active_tax_sheet') || 'googlesheet';
    } catch {
      return 'googlesheet';
    }
  });
  const activeSheet = controlledActiveSheet !== undefined ? controlledActiveSheet : internalActiveSheet;
  const setActiveSheet = (sheet) => {
    if (onActiveSheetChange) {
      onActiveSheetChange(sheet);
    } else {
      setInternalActiveSheet(sheet);
    }
    try {
      localStorage.setItem('cloudbaud_active_tax_sheet', sheet);
    } catch {}
  };

  // Google Sheet Comments Sidebar state
  const [showCommentsSidebar, setShowCommentsSidebar] = useState(true);
  const [commentFilterTab, setCommentFilterTab] = useState('all'); // 'all' | 'for_you'
  const [commentSheetFilter, setCommentSheetFilter] = useState('all'); // 'all' | 'Summary' | 'CB' | 'OC' | 'CC' | 'Roberto'
  const [commentSearchQuery, setCommentSearchQuery] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentCell, setNewCommentCell] = useState('Summary!E6');
  const [sheetCommentsList, setSheetCommentsList] = useState(() => {
    try {
      const saved = localStorage.getItem('tax_sheet_custom_comments');
      const custom = saved ? JSON.parse(saved) : [];
      return [...custom, ...Object.values(EXTRACTED_SHEET_THREADS)];
    } catch {
      return Object.values(EXTRACTED_SHEET_THREADS);
    }
  });

  const handleAddSheetComment = () => {
    if (!newCommentText.trim()) return;
    const newThread = {
      id: `th_custom_${Date.now()}`,
      targetType: 'worksheet_row',
      targetId: newCommentCell,
      targetTitle: `[${newCommentCell}] Comment`,
      cellRef: newCommentCell.split('!')[1] || newCommentCell,
      sheetName: newCommentCell.split('!')[0] || 'Summary',
      year: year,
      status: 'pending',
      comments: [
        {
          id: `c_${Date.now()}`,
          authorName: 'Jishnu Nath',
          authorRole: 'Owner',
          authorInitials: 'JN',
          text: newCommentText.trim(),
          createdAt: new Date().toISOString(),
          decision: null
        }
      ]
    };

    const updated = [newThread, ...sheetCommentsList];
    setSheetCommentsList(updated);
    setNewCommentText('');
    try {
      const saved = localStorage.getItem('tax_sheet_custom_comments');
      const existing = saved ? JSON.parse(saved) : [];
      localStorage.setItem('tax_sheet_custom_comments', JSON.stringify([newThread, ...existing]));
    } catch {}
  };

  // Filtered comments for the sidebar
  const filteredComments = sheetCommentsList.filter(th => {
    if (commentFilterTab === 'for_you') {
      const hasDavid = th.comments?.some(c => (c.text || '').toLowerCase().includes('david') || (c.authorName || '').toLowerCase().includes('david'));
      if (!hasDavid) return false;
    }
    if (commentSheetFilter !== 'all') {
      const sName = (th.sheetName || '').toLowerCase();
      if (!sName.includes(commentSheetFilter.toLowerCase())) return false;
    }
    if (commentSearchQuery.trim()) {
      const q = commentSearchQuery.toLowerCase();
      const matchText = th.comments?.some(c => (c.text || '').toLowerCase().includes(q) || (c.authorName || '').toLowerCase().includes(q));
      const matchCell = (th.cellRef || '').toLowerCase().includes(q) || (th.sheetName || '').toLowerCase().includes(q);
      if (!matchText && !matchCell) return false;
    }
    return true;
  });
  const [activeTab, setActiveTab] = useState('home'); // 'file' | 'home' | 'insert' | 'data' | 'view'
  const [viewMode, setViewMode] = useState('focused'); // 'focused' (single year) | 'multi' (2017-2025)
  const [gridData, setGridData] = useState({});
  const [selectedCell, setSelectedCell] = useState({ rowId: 'w2_wages', colKey: year, address: 'B2' });
  const [formulaValue, setFormulaValue] = useState('');
  const [editingCell, setEditingCell] = useState(null); // { rowId, colKey }
  const [editInputValue, setEditInputValue] = useState('');
  const [clipboardValue, setClipboardValue] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [alignment, setAlignment] = useState('right');
  const uploadInputRef = useRef(null);

  // Multi-year columns list
  const multiYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];
  const columns = viewMode === 'multi' ? multiYears : [year];

  // Helper to compute canonical Google Sheet cell coordinates
  const getCellAddress = useCallback((rowIdx, colYear) => {
    const colLetter = GOOGLE_SHEET_YEAR_COLUMNS[Number(colYear)] || 'F';
    const rowNumber = rowIdx + 2; // row 1 is header
    return `${colLetter}${rowNumber}`;
  }, []);

  // Transferred items from checklist
  const [transferredItems, setTransferredItems] = useState(() => {
    try {
      const saved = localStorage.getItem(`tax_transferred_cells_${year}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`tax_transferred_cells_${year}`);
      setTransferredItems(saved ? JSON.parse(saved) : {});
    } catch {
      setTransferredItems({});
    }
  }, [year]);

  // Cell status management (WIP, Ready for CPA Review, Question for CPA, Filed with CPA, Filed with IRS)
  const [cellStatuses, setCellStatuses] = useState(() => {
    try {
      const saved = localStorage.getItem('tax_cell_statuses');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const updateCellStatus = (rowName, colYear, newStatus) => {
    const key = `${rowName}_${colYear}`;
    const updated = { ...cellStatuses, [key]: newStatus };
    setCellStatuses(updated);
    try {
      localStorage.setItem('tax_cell_statuses', JSON.stringify(updated));
    } catch {}
  };

  // Recent transfer animation flash set
  const [flashingCells, setFlashingCells] = useState({});

  const triggerCellFlash = (rowName, colYear) => {
    const key = `${rowName}_${colYear}`;
    setFlashingCells(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setFlashingCells(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 2500);
  };

  // Listen for cross-pane transfer events to auto-update cell status and flash
  useEffect(() => {
    const handleTransferEvent = (e) => {
      const { rowName, year: targetYear, status } = e.detail || {};
      if (rowName && targetYear) {
        updateCellStatus(rowName, targetYear, status || 'ready_cpa');
        triggerCellFlash(rowName, targetYear);
        try {
          const saved = localStorage.getItem(`tax_transferred_cells_${targetYear}`);
          if (saved) setTransferredItems(JSON.parse(saved));
        } catch {}
      }
    };
    window.addEventListener('tax_cell_transferred', handleTransferEvent);
    return () => window.removeEventListener('tax_cell_transferred', handleTransferEvent);
  }, []);

  // Populate grid data from props entries
  useEffect(() => {
    const map = {};
    accounts.forEach(acc => {
      map[acc.name] = map[acc.name] || {};
      const entry = entries.find(e => e.category_id === acc.id);
      if (entry?.amount !== undefined) {
        map[acc.name][year] = entry.amount;
      }
    });

    // Sample fallback accounting baseline values
    const defaults = {
      'W2 Wages': { 2024: 84200.00, 2023: 59110.59, 2022: 37995.76, 2021: 49793.32, 2020: 69549.66, 2019: 84444.89, 2018: 70399.57, 2017: 63132.46 },
      'Comfort Foods': { 2020: -44581.92, 2019: -12500.00, 2018: -8400.00, 2017: -44581.92 },
      'CloudBaud LLC': { 2024: 153952.00, 2023: 38376.00, 2022: 365772.34, 2021: 67285.01, 2020: 365772.34, 2019: 79825.51, 2018: 485019.41, 2017: 334565.42 },
      'Home Office & Utilities': { 2020: 8450.00, 2019: 7600.00, 2018: 6200.00, 2017: 5800.00 },
      'Professional Services / CPA': { 2020: 4500.00, 2019: 3800.00, 2018: 3200.00, 2017: 2900.00 }
    };

    accounts.forEach(acc => {
      if (defaults[acc.name]) {
        map[acc.name] = { ...defaults[acc.name], ...map[acc.name] };
      }
    });

    setGridData(prev => ({ ...defaults, ...prev, ...map }));
  }, [accounts, entries, year]);

  // Active cell helper
  const getCellValue = useCallback((rowName, colKey) => {
    return gridData[rowName]?.[colKey] ?? '';
  }, [gridData]);

  // Update formula bar on cell selection
  useEffect(() => {
    if (selectedCell) {
      const val = getCellValue(selectedCell.rowName || selectedCell.rowId, selectedCell.colKey);
      setFormulaValue(val !== '' && val !== null ? String(val) : '');
    }
  }, [selectedCell, getCellValue]);

  // Cell click handler
  const handleCellClick = (acc, colYear, colIdx, rowIdx) => {
    const colLetter = String.fromCharCode(66 + colIdx); // B, C, D...
    const rowNum = rowIdx + 2;
    const address = `${colLetter}${rowNum}`;

    setSelectedCell({
      rowId: acc.id,
      rowName: acc.name,
      colKey: colYear,
      address: address
    });

    // Notify parent to sync selection across other 2 panes
    setSelectedCat?.(acc);
    onSelectAndSwitch?.('worksheet', { categoryId: acc.id, categoryName: acc.name, year: colYear });
  };

  // Cell double click (start inline edit)
  const handleCellDoubleClick = (acc, colYear) => {
    if (isLocked) return;
    setEditingCell({ rowName: acc.name, colYear });
    const currentVal = getCellValue(acc.name, colYear);
    setEditInputValue(currentVal !== '' && currentVal !== null ? String(currentVal) : '');
  };

  // Save cell edit
  const handleSaveEdit = async (rowName, colYear, value) => {
    const numVal = parseFloat(value);
    const finalVal = isNaN(numVal) ? value : numVal;

    // Optimistic state update
    setGridData(prev => ({
      ...prev,
      [rowName]: {
        ...(prev[rowName] || {}),
        [colYear]: finalVal
      }
    }));

    setEditingCell(null);

    // Persist via Supabase or callback
    try {
      const cat = accounts.find(a => a.name === rowName);
      if (cat?.id && typeof finalVal === 'number') {
        await updateTaxCell(cat.id, colYear, finalVal);
      }
      onSaveCell?.({ categoryName: rowName, year: colYear, amount: finalVal });
    } catch (err) {
      console.error('Failed to save cell update:', err);
    }
  };

  // Formula bar change handler
  const handleFormulaBarChange = (e) => {
    const val = e.target.value;
    setFormulaValue(val);
    if (selectedCell?.rowName && selectedCell?.colKey) {
      handleSaveEdit(selectedCell.rowName, selectedCell.colKey, val);
    }
  };

  // Upload custom spreadsheet (CSV / XLSX)
  const handleUploadSpreadsheet = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    alert(`Importing ${file.name} to tax worksheet matrix...`);
  };

  // Column Auto-Sum calculator
  const calculateColumnTotal = (colYear) => {
    let sum = 0;
    accounts.forEach(acc => {
      const val = gridData[acc.name]?.[colYear];
      if (typeof val === 'number') {
        sum += val;
      } else if (typeof val === 'string') {
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) sum += parsed;
      }
    });
    return sum;
  };

  return (
    <div className="flex flex-col h-full bg-[#090e18] text-white text-xs select-none overflow-hidden">
      {/* Hidden File Input for Spreadsheet Upload */}
      <input
        ref={uploadInputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.txt"
        onChange={handleUploadSpreadsheet}
        className="hidden"
      />

      {/* ── WORKSHEET VIEW SWITCHER (LIVE GOOGLE SHEET vs GRID vs MASTER XLSX) ── */}
      <div className="bg-[#0b1120] border-b border-white/10 px-3 py-1.5 flex items-center justify-between gap-2 shrink-0 flex-wrap">
        <div className="flex items-center gap-1 bg-[#060a14] p-0.5 rounded-lg border border-white/10 text-xs">
          <button
            onClick={() => setActiveSheet('googlesheet')}
            className={`px-3 py-1 rounded font-semibold flex items-center gap-1.5 transition ${
              activeSheet === 'googlesheet'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            title="Live Connected Google Sheet shared with David Rumsey (CPA)"
          >
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Google Sheet</span>
          </button>

          <button
            onClick={() => setActiveSheet('worksheet')}
            className={`px-3 py-1 rounded font-semibold flex items-center gap-1.5 transition ${
              activeSheet === 'worksheet'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            title="High-density interactive calculation grid linked to Form 1040"
          >
            <Table className="size-3.5" />
            <span>Calculation Grid</span>
          </button>

          <button
            onClick={() => setActiveSheet('xlsx_master')}
            className={`px-3 py-1 rounded font-semibold flex items-center gap-1.5 transition ${
              activeSheet === 'xlsx_master'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            title="Preview Consolidated Tax Items Excel workbook"
          >
            <FileSpreadsheet className="size-3.5" />
            <span>Consolidated XLSX</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSheet === 'googlesheet' && (
            <span className="text-[10px] text-emerald-300 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 hidden md:inline-block">
              ✓ Connected to David Rumsey's Shared Sheet
            </span>
          )}

          <a
            href={googleSheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-semibold flex items-center gap-1 transition"
            title="Open Google Sheet in a new tab"
          >
            <ExternalLink className="size-3" />
            <span className="hidden sm:inline">Google Sheets</span>
          </a>
        </div>
      </div>

      {/* ── CONDITIONAL RENDER: LIVE GOOGLE SHEET vs CALCULATION GRID vs XLSX ── */}
      {activeSheet === 'googlesheet' ? (
        <div className="flex-1 w-full h-full min-h-0 bg-slate-950 relative overflow-hidden flex flex-col">
          {/* Google Sheet Live Header Bar */}
          <div className="bg-[#0e1424] px-3 py-1.5 border-b border-white/10 flex items-center justify-between text-xs shrink-0 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-white text-xs">Live Google Sheet</span>
              <span className="text-[10px] text-blue-300 font-mono bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                Shared CPA Master
              </span>
              <span className="text-[10px] text-amber-300 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-amber-400"></span>
                <span>Named Range Sync Active</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCommentsSidebar(!showCommentsSidebar)}
                className={`text-[11px] px-2.5 py-0.5 rounded flex items-center gap-1.5 font-semibold transition border ${
                  showCommentsSidebar
                    ? 'bg-blue-600/30 text-blue-300 border-blue-400/60 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-white/15'
                }`}
                title="Toggle Google Sheets Comments & Discussion Sidebar"
              >
                <MessageSquare className="size-3 text-blue-400" />
                <span>Comments</span>
                <span className="px-1 py-0.2 rounded bg-blue-500/20 text-[9px] font-mono text-blue-200">
                  {filteredComments.length}
                </span>
              </button>
              <button
                onClick={() => setIsEditingSheetUrl(!isEditingSheetUrl)}
                className="text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/15 px-2 py-0.5 rounded flex items-center gap-1 font-medium transition"
                title="Update Google Sheet share URL"
              >
                <span>{isEditingSheetUrl ? 'Close URL Bar' : 'Change Sheet URL'}</span>
              </button>
              <button
                onClick={() => setActiveSheet('worksheet')}
                className="text-[11px] text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-semibold transition"
                title="View transferred cells highlighted with glowing border in Calculation Matrix"
              >
                <Table className="size-3" />
                <span>Show Cell Highlights</span>
              </button>
              <a
                href={googleSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                title="Open live Google Spreadsheet in new tab"
              >
                <ExternalLink className="size-3" />
                <span>Open in Google Sheets</span>
              </a>
            </div>
          </div>

          {/* Quick URL Setup / Update Bar */}
          {isEditingSheetUrl && (
            <div className="bg-[#131b2e] border-b border-blue-500/30 px-3 py-2 flex items-center gap-2 text-xs shrink-0 flex-wrap animate-in fade-in slide-in-from-top-1">
              <span className="text-white/70 font-medium shrink-0 text-[11px]">Google Sheet URL:</span>
              <input
                type="url"
                value={sheetUrlInput}
                onChange={(e) => setSheetUrlInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="flex-1 min-w-[280px] bg-slate-900 border border-white/20 rounded px-2 py-1 text-xs text-white font-mono placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <button
                onClick={() => handleSaveSheetUrl(sheetUrlInput)}
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition"
              >
                Connect Sheet
              </button>
            </div>
          )}

          {/* Transferred Named Cells Ribbon */}
          {Object.keys(transferredItems).length > 0 && (
            <div className="bg-[#10172a] border-b border-amber-500/30 px-3 py-2 flex items-center justify-between gap-2 text-xs shrink-0 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/80 text-amber-300 font-bold text-[10px]">
                  <Sparkles className="size-3 text-amber-400" />
                  <span>Transferred from Checklist ({year}):</span>
                </span>
                {Object.entries(transferredItems).filter(([k]) => !k.includes('_box') && !k.includes('_amount')).map(([key, item]) => {
                  const namedRow = SUMMARY_TAB_NAMED_ROWS.find(r => r.prefix === item.namedCell?.replace(/_\d{4}$/, ''));
                  const rowIdx = namedRow ? accounts.findIndex(a => a.name === namedRow.accountName) : -1;
                  const cellCoord = rowIdx !== -1 ? getCellAddress(rowIdx, year) : 'Cell';

                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setActiveSheet('worksheet');
                        if (namedRow) {
                          const rIdx = accounts.findIndex(a => a.name === namedRow.accountName);
                          setSelectedCell({ rowName: namedRow.accountName, colKey: year, address: getCellAddress(rIdx !== -1 ? rIdx : 0, year) });
                        }
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border-2 border-amber-400/90 hover:border-amber-300 text-white text-[10px] font-mono transition hover:bg-slate-800 shadow-[0_0_8px_rgba(251,191,36,0.3)] cursor-pointer group"
                      title="Click to view & highlight in Calculation Grid"
                    >
                      <span className="px-1 py-0.5 rounded bg-amber-500/30 text-amber-200 font-bold text-[9px] border border-amber-400/60">
                        Summary!{cellCoord}
                      </span>
                      <span className="text-emerald-300 font-bold">{item.amount}</span>
                      <span className="text-blue-300 font-semibold">[{item.namedCell}]</span>
                      <span className="px-1 rounded bg-amber-500/20 text-[8px] text-amber-300 border border-amber-500/40 font-sans uppercase font-bold">
                        Ready for CPA
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Layout: Google Sheet Embed + Google Sheets Comments Sidebar */}
          <div className="flex-1 w-full h-full min-h-0 flex flex-row overflow-hidden bg-slate-950">
            <iframe
              src={formatGoogleSheetEmbedUrl(googleSheetUrl)}
              title="Live Shared Tax Google Sheet - Jishnu & Deepika Nath (David Rumsey)"
              className="flex-1 w-full h-full border-0 bg-white min-w-0"
              allow="clipboard-read; clipboard-write; fullscreen"
            />

            {/* Live Google Sheets Comments Sidebar */}
            {showCommentsSidebar && (
              <div className="w-80 md:w-88 border-l border-white/15 bg-[#0e1424] flex flex-col h-full shrink-0 text-white animate-in slide-in-from-right-2 duration-150 shadow-2xl">
                {/* Header */}
                <div className="px-3 py-2.5 border-b border-white/10 flex items-center justify-between bg-[#080d18] shrink-0">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="size-4 text-blue-400" />
                    <h3 className="font-bold text-xs text-white uppercase tracking-wider">Comments</h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {filteredComments.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowCommentsSidebar(false)}
                      className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition"
                      title="Close Comments Sidebar"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Tabs: All comments | For you */}
                <div className="px-3 pt-2 pb-1 border-b border-white/10 flex items-center gap-3 text-xs bg-[#0a0f1c] shrink-0">
                  <button
                    onClick={() => setCommentFilterTab('all')}
                    className={`pb-1.5 font-medium transition text-xs ${
                      commentFilterTab === 'all'
                        ? 'text-blue-400 font-bold border-b-2 border-blue-400'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    All comments
                  </button>
                  <button
                    onClick={() => setCommentFilterTab('for_you')}
                    className={`pb-1.5 font-medium transition text-xs ${
                      commentFilterTab === 'for_you'
                        ? 'text-blue-400 font-bold border-b-2 border-blue-400'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    For you (CPA David)
                  </button>
                </div>

                {/* Filters: Search & Sheet Selector */}
                <div className="p-2 border-b border-white/10 flex items-center gap-1.5 bg-[#090d18] text-xs shrink-0">
                  <div className="relative flex-1">
                    <Search className="size-3 text-white/40 absolute left-2 top-2" />
                    <input
                      type="text"
                      value={commentSearchQuery}
                      onChange={(e) => setCommentSearchQuery(e.target.value)}
                      placeholder="Search comments..."
                      className="w-full bg-slate-900 border border-white/10 rounded pl-7 pr-2 py-1 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <select
                    value={commentSheetFilter}
                    onChange={(e) => setCommentSheetFilter(e.target.value)}
                    className="bg-slate-900 border border-white/10 rounded px-1.5 py-1 text-[11px] text-white/80 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All sheets</option>
                    <option value="Summary">Summary</option>
                    <option value="CB">CloudBaud (CB)</option>
                    <option value="OC">Olympic Court (OC)</option>
                    <option value="CC">Cherry Crest (CC)</option>
                    <option value="Roberto">Robertos</option>
                  </select>
                </div>

                {/* Start Discussion / Add Comment Box */}
                <div className="p-2.5 border-b border-white/10 bg-[#0d1322] shrink-0">
                  <div className="flex items-center justify-between text-[10px] text-white/60 mb-1">
                    <span className="font-semibold">Start a discussion</span>
                    <input
                      type="text"
                      value={newCommentCell}
                      onChange={(e) => setNewCommentCell(e.target.value)}
                      placeholder="Cell e.g. Summary!E6"
                      className="bg-slate-900 border border-white/15 rounded px-1.5 py-0.5 text-[10px] font-mono text-emerald-300 w-28 text-right outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddSheetComment(); }}
                      placeholder="Add comment or @David..."
                      className="flex-1 bg-slate-900 border border-white/15 rounded px-2 py-1 text-xs text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <button
                      onClick={handleAddSheetComment}
                      disabled={!newCommentText.trim()}
                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                    >
                      <Send className="size-3" />
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 divide-y divide-white/5">
                  {filteredComments.length === 0 ? (
                    <div className="text-center py-8 text-white/40 text-xs">
                      No comments found matching your filter.
                    </div>
                  ) : (
                    filteredComments.map(th => (
                      <div key={th.id} className="pt-2 first:pt-0 space-y-1.5 bg-slate-900/60 p-2.5 rounded-lg border border-white/5 hover:border-blue-500/40 transition">
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="size-5 rounded-full bg-blue-600/30 border border-blue-400/50 text-blue-300 font-bold text-[9px] flex items-center justify-center">
                              {th.comments[0]?.authorInitials || 'JN'}
                            </span>
                            <span className="font-semibold text-white text-xs">
                              {th.comments[0]?.authorName || 'Jishnu Nath'}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-400/40 px-1.5 py-0.5 rounded">
                            {th.sheetName}!{th.cellRef}
                          </span>
                        </div>

                        {th.comments.map(c => (
                          <p key={c.id} className="text-xs text-white/80 leading-relaxed font-sans pl-6 whitespace-pre-wrap">
                            {c.text}
                          </p>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeSheet === 'xlsx_master' ? (
        <div className="flex-1 w-full h-full min-h-0 bg-[#03060c] overflow-hidden flex flex-col">
          <SpreadsheetPreview
            url="/src/workspace/data/Documents - Taxes/Consolidated Tax Items Jishnu & Deepika Nath.xlsx"
            name="Consolidated Tax Items Jishnu & Deepika Nath.xlsx"
            className="w-full h-full"
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* ── EXCEL FORMULA BAR (fx) ── */}
          {(() => {
            const selectedNamedRow = SUMMARY_TAB_NAMED_RANGES.find(r => r.accountName === (selectedCell?.rowName || selectedCell?.rowId));
            const activeNamedCell = selectedNamedRow ? getNamedCell(selectedNamedRow.prefix, selectedCell?.colKey || year) : null;

            return (
              <div className="bg-[#0b101c] border-b border-white/10 px-3 py-1.5 flex items-center gap-2 shrink-0">
                {/* Name / Cell Coordinate & Named Range Box */}
                <div 
                  className="bg-slate-900 border border-white/15 rounded px-2 py-1 text-center font-mono font-bold text-emerald-400 text-xs shadow-inner flex items-center gap-1.5 shrink-0" 
                  title={activeNamedCell ? `Named Cell in Google Sheets: [${activeNamedCell}]` : 'Cell Address'}
                >
                  <span>{selectedCell?.address || 'A1'}</span>
                  {activeNamedCell && (
                    <span className="text-[10px] text-blue-300 font-mono font-semibold bg-blue-500/10 px-1 rounded border border-blue-500/20">
                      {activeNamedCell}
                    </span>
                  )}
                </div>

                <div className="text-white/40 font-mono font-bold italic select-none text-xs">
                  fx
                </div>

                {/* Formula Input */}
                <input
                  type="text"
                  value={formulaValue}
                  onChange={handleFormulaBarChange}
                  placeholder="Enter formula or value (e.g. 69549.66 or =SUM(B2:B5))..."
                  className="flex-1 bg-slate-900/90 border border-white/15 rounded px-2.5 py-1 text-xs text-white font-mono placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                {/* Cell Status Selector */}
                {selectedCell && (
                  <div className="flex items-center gap-1 shrink-0 bg-slate-900 border border-white/10 rounded px-1.5 py-0.5">
                    <span className="text-[10px] text-white/40 font-medium">Status:</span>
                    <select
                      value={cellStatuses[`${selectedCell.rowName || selectedCell.rowId}_${selectedCell.colKey}`] || 'wip'}
                      onChange={(e) => updateCellStatus(selectedCell.rowName || selectedCell.rowId, selectedCell.colKey, e.target.value)}
                      className="bg-transparent text-[10px] font-semibold text-blue-300 outline-none cursor-pointer"
                    >
                      <option value="wip" className="bg-slate-900 text-amber-300">Work in Progress</option>
                      <option value="ready_cpa" className="bg-slate-900 text-amber-400 font-bold">Ready for CPA Review</option>
                      <option value="cpa_question" className="bg-slate-900 text-purple-300">Question for CPA</option>
                      <option value="filed_cpa" className="bg-slate-900 text-cyan-300">Filed with CPA</option>
                      <option value="filed_irs" className="bg-slate-900 text-emerald-300">Filed with IRS</option>
                    </select>
                  </div>
                )}

                {selectedCell?.rowName && (
                  <span className="text-[10px] text-white/40 truncate max-w-[140px]">
                    {selectedCell.rowName}
                  </span>
                )}
              </div>
            );
          })()}

          {/* ── EXCEL SPREADSHEET TABLE GRID ── */}
          <div className="flex-1 overflow-auto bg-[#070b14]">
            <table className="w-full border-collapse text-left border border-white/10">
              {/* Column Headers (A, B, C, D...) */}
              <thead>
                <tr className="bg-[#0b101c] text-white/60 text-[11px] font-mono border-b border-white/10 select-none sticky top-0 z-10">
                  <th className="w-10 p-1.5 text-center border-r border-white/10 bg-[#070c17]">#</th>
                  <th className="p-1.5 px-3 border-r border-white/10 min-w-[200px] font-semibold text-white">
                    A • Account / Category
                  </th>
                  {columns.map((colYear) => {
                    const colLetter = GOOGLE_SHEET_YEAR_COLUMNS[Number(colYear)] || 'F';
                    return (
                      <th
                        key={colYear}
                        className={`p-1.5 px-3 border-r border-white/10 text-right min-w-[130px] transition ${
                          colYear === year ? 'bg-blue-950/40 text-blue-300 font-bold border-b-2 border-b-blue-500' : ''
                        }`}
                      >
                        {colLetter} • {colYear}
                      </th>
                    );
                  })}
                  <th className="w-24 p-1.5 text-center border-r border-white/10 text-[10px] font-sans">
                    CPA Thread
                  </th>
                </tr>
              </thead>

              {/* Data Rows */}
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                {accounts.map((acc, rowIdx) => {
                  const threadId = `th_category_${acc.id}_${year}`;
                  const thread = threads[threadId];
                  const commentCount = thread?.comments?.length || 0;
                  const status = thread?.status || 'pending';

                  return (
                    <tr
                      key={acc.id}
                      className={`hover:bg-blue-600/10 transition-colors group ${
                        selectedCat?.id === acc.id ? 'bg-blue-950/20' : ''
                      }`}
                    >
                      {/* Row Index Number */}
                      <td className="p-1 text-center text-white/30 text-[10px] bg-[#070c17] select-none border-r border-white/10">
                        {rowIdx + 2}
                      </td>

                      {/* Account Label (Column A) */}
                      <td className="p-1 px-3 border-r border-white/10 font-medium truncate font-sans text-xs">
                        {acc.name}
                      </td>

                      {/* Values (Column B, C, D...) */}
                      {columns.map((colYear, colIdx) => {
                        const val = getCellValue(acc.name, colYear);
                        const isEditing = editingCell?.rowName === acc.name && editingCell?.colYear === colYear;
                        const isCellSelected = selectedCell?.rowName === acc.name && selectedCell?.colKey === colYear;
                        const numVal = typeof val === 'number' ? val : parseFloat(val);
                        const isNegative = !isNaN(numVal) && numVal < 0;
                        const cellKey = `${acc.name}_${colYear}`;
                        const cellStatus = cellStatuses[cellKey] || cellStatuses[`${acc.id}_${colYear}`];
                        const isReadyForCpa = cellStatus === 'ready_cpa';
                        const isFlashing = flashingCells[cellKey] || flashingCells[`${acc.id}_${colYear}`];
                        const namedRow = SUMMARY_TAB_NAMED_RANGES.find(r => r.accountName === acc.name);
                        const namedCell = namedRow ? getNamedCell(namedRow.prefix, colYear) : null;
                        const cellCoord = getCellAddress(rowIdx, colYear);

                        return (
                          <td
                            key={colYear}
                            onDoubleClick={() => handleCellDoubleClick(acc, colYear)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCellClick(acc, colYear, colIdx, rowIdx);
                            }}
                            className={`p-1.5 px-2.5 border-r border-white/10 text-right font-mono text-xs select-none transition-all relative ${
                              isCellSelected
                                ? 'bg-blue-600/40 ring-2 ring-blue-400 ring-inset font-bold text-white z-20'
                                : isFlashing
                                ? 'bg-amber-400/40 ring-2 ring-amber-300 ring-inset animate-pulse font-bold text-white z-20'
                                : isReadyForCpa
                                ? 'bg-amber-500/25 ring-2 ring-amber-400 border-2 border-amber-400 text-amber-100 font-bold shadow-[0_0_12px_rgba(251,191,36,0.4)] z-10'
                                : ''
                            }`}
                            title={isReadyForCpa ? `${acc.name} (${colYear}) [Summary!${cellCoord}] [${namedCell}] • Ready for CPA Review (Transferred from Source Document)` : undefined}
                          >
                            {/* CPA Review Indicator Badge & Coordinate */}
                            {isReadyForCpa && (
                              <div className="absolute top-0.5 right-0.5 flex items-center gap-0.5">
                                <span className="text-[8px] font-mono font-bold text-amber-200 bg-amber-950/90 border border-amber-400/70 px-1 rounded-sm shadow-sm">
                                  {cellCoord}
                                </span>
                                <span
                                  className="size-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,1)] animate-pulse"
                                  title="Transferred • Ready for CPA Review"
                                />
                              </div>
                            )}

                            {isEditing ? (
                              <input
                                autoFocus
                                type="text"
                                value={editInputValue}
                                onChange={(e) => setEditInputValue(e.target.value)}
                                onBlur={() => handleSaveEdit(acc.name, colYear, editInputValue)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit(acc.name, colYear, editInputValue);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                className="w-full bg-slate-900 text-right outline-none p-1 border border-blue-400 rounded text-white font-mono text-xs"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className={`${isBold ? 'font-bold' : ''} ${isItalic ? 'italic' : ''} ${isNegative ? 'text-red-400' : isReadyForCpa ? 'text-amber-100 font-bold' : 'text-emerald-300'}`}>
                                {val !== '' && !isNaN(numVal)
                                  ? `$${numVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                  : val || <span className="text-white/20 italic">-</span>}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* CPA Review Trigger */}
                      <td className="p-1 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openReviewPanel?.('worksheet_row', acc.name, `${acc.name} Excel Row`)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border transition ${
                            status === 'accepted' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' :
                            status === 'rejected' ? 'bg-red-500/15 border-red-500/30 text-red-400' :
                            commentCount > 0 ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' :
                            'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'
                          }`}
                          title="Open CPA Review & Annotation Thread"
                        >
                          {status === 'accepted' ? <CheckCircle2 className="size-2.5 text-emerald-400" /> :
                           status === 'rejected' ? <XCircle className="size-2.5 text-red-400" /> :
                           <MessageSquare className="size-2.5 text-blue-400" />}
                          <span>{commentCount > 0 ? `${commentCount} notes` : 'Review'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* Total Auto-Sum Row */}
                <tr className="bg-[#0b1222] font-bold border-t-2 border-white/20 select-none">
                  <td className="p-2 text-center text-white/40 text-[10px] bg-[#070c17]">Σ</td>
                  <td className="p-2 border-r border-white/10 text-white text-xs font-sans">
                    Net Annual Calculated Balance
                  </td>
                  {columns.map(colYear => {
                    const total = calculateColumnTotal(colYear);
                    return (
                      <td
                        key={colYear}
                        className={`p-2 border-r border-white/10 text-right font-mono text-xs ${
                          total < 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    );
                  })}
                  <td className="p-2 text-center text-[10px] text-white/40">
                    Calculated
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Excel Status Bar */}
          <div className="bg-[#0e1422] border-t border-white/10 px-3 py-1 flex items-center justify-between text-[11px] text-white/50 shrink-0">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-400 inline-block"></span>
                Ready
              </span>
              <span>Cell: <b>{selectedCell?.address || 'B2'}</b></span>
              <span>Selected: <b>{selectedCell?.rowName || 'W2 Wages'}</b></span>
            </div>
            <div className="flex items-center gap-3">
              <span>Sum: <b className="text-white">${calculateColumnTotal(year).toLocaleString(undefined, { minimumFractionDigits: 2 })}</b></span>
              <span>Accounts: <b className="text-white">{accounts.length}</b></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
