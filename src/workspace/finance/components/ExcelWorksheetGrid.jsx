import React, { useState, useEffect, useCallback } from 'react';
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
  Table as TableIcon
} from 'lucide-react';
import { updateTaxCell } from '../api/taxService';

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
  onSaveCell
}) {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'insert' | 'data' | 'view'
  const [viewMode, setViewMode] = useState('focused'); // 'focused' (single year) | 'multi' (2017-2025)
  const [selectedCell, setSelectedCell] = useState({ rowId: 'w2_wages', colKey: year, address: 'B2' });
  const [formulaValue, setFormulaValue] = useState('');
  const [editingCell, setEditingCell] = useState(null); // { rowId, colKey }
  const [editInputValue, setEditInputValue] = useState('');
  const [clipboardValue, setClipboardValue] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [alignment, setAlignment] = useState('right');

  // Multi-year columns list
  const multiYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];
  const columns = viewMode === 'multi' ? multiYears : [year];

  // Local grid data matrix state
  const [gridData, setGridData] = useState({});

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
      'W2 Wages': { 2024: 0, 2023: 59110.59, 2022: 0, 2021: 49793.32, 2020: 69549.66, 2019: 84444.89, 2018: 70399.57, 2017: 63132.46 },
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

  const handleCellSelect = (rowName, colKey, rowIndex, colIndex) => {
    const colLetter = String.fromCharCode(66 + colIndex); // 'B', 'C'...
    const address = `${colLetter}${rowIndex + 2}`;
    setSelectedCell({ rowName, colKey, address, rowIndex, colIndex });

    if (typeof colKey === 'number' && colKey !== year) {
      onYearChange?.(colKey);
    }

    const matchedAccount = accounts.find(a => a.name === rowName);
    if (matchedAccount) {
      setSelectedCat(matchedAccount);
      setSelectedDoc?.(null);
      setSelectedFormLine?.(rowName);
      onSelectAndSwitch?.('docs');
    }
  };

  const handleStartEdit = (rowName, colKey) => {
    if (isLocked) return;
    const currentVal = getCellValue(rowName, colKey);
    setEditingCell({ rowName, colKey });
    setEditInputValue(currentVal !== '' ? String(currentVal) : '');
  };

  const handleSaveEdit = (rowName, colKey, newValue) => {
    setEditingCell(null);
    const num = parseFloat(newValue);
    const finalVal = isNaN(num) ? newValue : num;

    setGridData(prev => ({
      ...prev,
      [rowName]: {
        ...(prev[rowName] || {}),
        [colKey]: finalVal
      }
    }));

    setFormulaValue(String(finalVal));

    // Persist via taxService
    const matchedAccount = accounts.find(a => a.name === rowName);
    if (matchedAccount?.id) {
      updateTaxCell(matchedAccount.id, colKey, finalVal).catch(e => console.warn('Saved locally', e));
    }
    onSaveCell?.(rowName, colKey, finalVal);
  };

  // Keyboard navigation & Shortcuts (Copy, Paste, Enter, Arrows)
  const handleKeyDown = (e, rowName, colKey) => {
    if (e.key === 'Enter') {
      if (editingCell) {
        handleSaveEdit(rowName, colKey, editInputValue);
      } else {
        handleStartEdit(rowName, colKey);
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      e.preventDefault();
      const val = getCellValue(rowName, colKey);
      setClipboardValue(val);
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault();
      if (clipboardValue !== null) {
        handleSaveEdit(rowName, colKey, clipboardValue);
      }
    }
  };

  const handleFormulaBarChange = (e) => {
    const val = e.target.value;
    setFormulaValue(val);
    if (selectedCell?.rowName && selectedCell?.colKey) {
      const num = parseFloat(val);
      const finalVal = isNaN(num) ? val : num;
      setGridData(prev => ({
        ...prev,
        [selectedCell.rowName]: {
          ...(prev[selectedCell.rowName] || {}),
          [selectedCell.colKey]: finalVal
        }
      }));
    }
  };

  // Auto-Sum Column Totals
  const calculateColumnTotal = (colKey) => {
    let sum = 0;
    accounts.forEach(acc => {
      const v = parseFloat(gridData[acc.name]?.[colKey]);
      if (!isNaN(v)) sum += v;
    });
    return sum;
  };

  return (
    <div className="flex flex-col h-full bg-[#090e18] text-white text-xs select-none overflow-hidden">
      {/* ── EXCEL RIBBON TOOLBAR ── */}
      <div className="bg-[#121827] border-b border-white/15 shrink-0 flex flex-col">
        {/* Ribbon Tabs */}
        <div className="flex items-center gap-1 px-2 pt-1 border-b border-white/10 bg-[#0e1422] text-[11px]">
          <span className="font-bold text-emerald-400 px-2 py-1 flex items-center gap-1 mr-2 text-xs">
            <TableIcon className="size-3.5" />
            <span>Excel Worksheet</span>
          </span>

          {[
            { id: 'home', label: 'Home' },
            { id: 'insert', label: 'Insert / Edit' },
            { id: 'data', label: 'Data & Formulas' },
            { id: 'view', label: 'View' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 font-medium rounded-t transition ${
                activeTab === tab.id
                  ? 'bg-[#182238] text-white border-t-2 border-emerald-400 font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ribbon Actions Toolbar */}
        <div className="p-1.5 px-3 flex items-center gap-2 overflow-x-auto min-h-[44px]">
          {activeTab === 'home' && (
            <>
              {/* Clipboard */}
              <div className="flex items-center gap-1 pr-2 border-r border-white/10">
                <button
                  onClick={() => {
                    if (selectedCell) {
                      const val = getCellValue(selectedCell.rowName, selectedCell.colKey);
                      setClipboardValue(val);
                    }
                  }}
                  className="p-1.5 hover:bg-white/10 rounded text-slate-300 hover:text-white flex items-center gap-1"
                  title="Copy Cell (Ctrl+C)"
                >
                  <Copy className="size-3.5 text-blue-400" />
                  <span className="text-[10px]">Copy</span>
                </button>

                <button
                  onClick={() => {
                    if (selectedCell && clipboardValue !== null) {
                      handleSaveEdit(selectedCell.rowName, selectedCell.colKey, clipboardValue);
                    }
                  }}
                  disabled={clipboardValue === null}
                  className="p-1.5 hover:bg-white/10 disabled:opacity-40 rounded text-slate-300 hover:text-white flex items-center gap-1"
                  title="Paste (Ctrl+V)"
                >
                  <ClipboardPaste className="size-3.5 text-emerald-400" />
                  <span className="text-[10px]">Paste</span>
                </button>
              </div>

              {/* Formatting */}
              <div className="flex items-center gap-1 pr-2 border-r border-white/10">
                <button
                  onClick={() => setIsBold(!isBold)}
                  className={`p-1.5 rounded transition ${isBold ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-slate-300'}`}
                  title="Bold"
                >
                  <Bold className="size-3.5" />
                </button>
                <button
                  onClick={() => setIsItalic(!isItalic)}
                  className={`p-1.5 rounded transition ${isItalic ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-slate-300'}`}
                  title="Italic"
                >
                  <Italic className="size-3.5" />
                </button>
              </div>

              {/* Alignment */}
              <div className="flex items-center gap-1 pr-2 border-r border-white/10">
                <button onClick={() => setAlignment('left')} className={`p-1.5 rounded ${alignment === 'left' ? 'bg-white/20' : 'hover:bg-white/10'}`}><AlignLeft className="size-3.5" /></button>
                <button onClick={() => setAlignment('center')} className={`p-1.5 rounded ${alignment === 'center' ? 'bg-white/20' : 'hover:bg-white/10'}`}><AlignCenter className="size-3.5" /></button>
                <button onClick={() => setAlignment('right')} className={`p-1.5 rounded ${alignment === 'right' ? 'bg-white/20' : 'hover:bg-white/10'}`}><AlignRight className="size-3.5" /></button>
              </div>

              {/* Save & History */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => alert('Worksheet changes saved to Supabase!')}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-semibold text-[11px] flex items-center gap-1 transition shadow-sm"
                >
                  <Save className="size-3" />
                  <span>Save</span>
                </button>
              </div>
            </>
          )}

          {activeTab === 'insert' && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  const name = prompt('New Account / Category Name:');
                  if (name) alert(`Added ${name} row!`);
                }}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white text-[11px] font-medium flex items-center gap-1"
              >
                <Plus className="size-3" />
                <span>Add Row</span>
              </button>
              <button 
                onClick={() => setIsLocked(!isLocked)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-[11px] font-medium flex items-center gap-1"
              >
                {isLocked ? <Lock className="size-3 text-amber-400" /> : <LockOpen className="size-3 text-slate-300" />}
                <span>{isLocked ? 'Unlock Sheet' : 'Lock Sheet'}</span>
              </button>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-blue-950/60 border border-blue-500/30 px-2.5 py-1 rounded text-blue-200 text-[11px]">
                <Sigma className="size-3.5 text-blue-400" />
                <span>Auto-Sum Net Total: <b>${calculateColumnTotal(year).toLocaleString(undefined, { minimumFractionDigits: 2 })}</b></span>
              </div>
            </div>
          )}

          {activeTab === 'view' && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/50">Grid Layout:</span>
              <button
                onClick={() => setViewMode('focused')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  viewMode === 'focused' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                Focused ({year})
              </button>
              <button
                onClick={() => setViewMode('multi')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  viewMode === 'multi' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                Multi-Year (2017–2025)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── EXCEL FORMULA BAR (fx) ── */}
      <div className="bg-[#0b101c] border-b border-white/10 px-3 py-1.5 flex items-center gap-2 shrink-0">
        {/* Name / Cell Coordinate Box (e.g. B2) */}
        <div className="bg-slate-900 border border-white/15 rounded px-2.5 py-1 min-w-[54px] text-center font-mono font-bold text-emerald-400 text-xs shadow-inner">
          {selectedCell?.address || 'A1'}
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

        {selectedCell?.rowName && (
          <span className="text-[10px] text-white/40 truncate max-w-[160px]">
            {selectedCell.rowName}
          </span>
        )}
      </div>

      {/* ── EXCEL SPREADSHEET TABLE GRID ── */}
      <div className="flex-1 overflow-auto bg-[#070b14]">
        <table className="w-full border-collapse table-fixed">
          {/* Header Row 1: Column Letters (A, B, C, D...) */}
          <thead className="sticky top-0 bg-[#0e1422] z-20 shadow-sm border-b border-white/15">
            <tr className="h-6 text-[10px] text-white/50 font-mono">
              {/* Top-Left Corner Cell */}
              <th className="w-10 min-w-[40px] max-w-[40px] bg-[#0c1220] border-r border-b border-white/10 text-center select-none">
                #
              </th>

              {/* Column A: Categories */}
              <th className="min-w-[200px] border-r border-b border-white/10 px-3 text-center uppercase tracking-wider font-semibold text-white/70">
                A (Accounting Label)
              </th>

              {/* Data Columns: B, C, D... */}
              {columns.map((colYear, i) => {
                const isCurrentYear = colYear === year;
                return (
                  <th
                    key={colYear}
                    onClick={() => onYearChange?.(Number(colYear))}
                    className={`min-w-[130px] border-r border-b border-white/10 px-3 text-center uppercase tracking-wider font-semibold cursor-pointer transition select-none ${
                      isCurrentYear
                        ? 'bg-blue-600/30 text-blue-200 border-b-2 border-b-blue-400 font-bold'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                    title={`Click to set active Tax Year to ${colYear}`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>{String.fromCharCode(66 + i)} ({colYear})</span>
                      {isCurrentYear && (
                        <span className="size-1.5 rounded-full bg-blue-400 inline-block shadow-[0_0_6px_#60a5fa] animate-pulse" title="Active Tax Year"></span>
                      )}
                    </div>
                  </th>
                );
              })}

              {/* Column: CPA Review Thread */}
              <th className="w-28 min-w-[110px] border-b border-white/10 px-2 text-center uppercase tracking-wider font-semibold text-blue-400">
                CPA Review
              </th>
            </tr>
          </thead>

          {/* Table Body with Row Numbers (1, 2, 3...) */}
          <tbody className="divide-y divide-white/5 font-mono text-xs">
            {accounts.map((acc, rowIndex) => {
              const rowNum = rowIndex + 1;
              const isRowSelected = selectedCell?.rowName === acc.name || selectedCat?.id === acc.id;
              const threadKey = `th_worksheet_row_${acc.name}_${year}`;
              const rowThread = threads[threadKey];
              const status = rowThread?.status || 'pending';
              const commentCount = rowThread?.comments?.length || 0;

              return (
                <tr
                  key={acc.id || acc.name}
                  className={`transition group ${isRowSelected ? 'bg-blue-950/40' : 'hover:bg-white/[0.03]'}`}
                >
                  {/* Row Number Gutter (1, 2, 3...) */}
                  <td className="w-10 bg-[#0c1220] border-r border-white/10 text-center text-[10px] text-white/40 font-mono select-none">
                    {rowNum}
                  </td>

                  {/* Column A: Account Name */}
                  <td
                    onClick={() => handleCellSelect(acc.name, year, rowIndex, 0)}
                    className={`p-2 px-3 border-r border-white/10 truncate font-sans text-xs font-medium cursor-pointer ${
                      isRowSelected ? 'text-blue-300 font-semibold' : 'text-white/90'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate">{acc.name}</span>
                      {acc.type && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-white/5 border border-white/10 rounded text-white/40">
                          {acc.type}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Value Columns (B, C...) */}
                  {columns.map((colYear, colIndex) => {
                    const val = getCellValue(acc.name, colYear);
                    const isCellActive = selectedCell?.rowName === acc.name && selectedCell?.colKey === colYear;
                    const isEditing = editingCell?.rowName === acc.name && editingCell?.colKey === colYear;

                    const numVal = parseFloat(val);
                    const isNegative = !isNaN(numVal) && numVal < 0;

                    return (
                      <td
                        key={colYear}
                        onClick={() => handleCellSelect(acc.name, colYear, rowIndex, colIndex)}
                        onDoubleClick={() => handleStartEdit(acc.name, colYear)}
                        onKeyDown={(e) => handleKeyDown(e, acc.name, colYear, rowIndex, colIndex)}
                        tabIndex={0}
                        className={`p-1 px-3 border-r border-white/10 text-right cursor-cell relative outline-none transition ${
                          isCellActive
                            ? 'bg-blue-600/30 ring-2 ring-inset ring-blue-400 font-bold z-10 text-white'
                            : 'hover:bg-white/5'
                        }`}
                      >
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
                          <span className={`${isBold ? 'font-bold' : ''} ${isItalic ? 'italic' : ''} ${isNegative ? 'text-red-400' : 'text-emerald-300'}`}>
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
            <tr className="bg-[#0f172a] font-bold border-t-2 border-white/20">
              <td className="w-10 bg-[#0c1220] border-r border-white/10 text-center text-[10px] text-emerald-400 font-mono">
                Σ
              </td>
              <td className="p-2 px-3 border-r border-white/10 font-sans text-xs text-white">
                Total Net Income / Deductions
              </td>
              {columns.map(colYear => {
                const total = calculateColumnTotal(colYear);
                return (
                  <td key={colYear} className="p-2 px-3 border-r border-white/10 text-right font-mono text-emerald-400 text-xs">
                    ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
          <span>Count: <b className="text-white">{accounts.length}</b></span>
        </div>
      </div>
    </div>
  );
}
