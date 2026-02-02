import React, { useState, useRef, useEffect } from 'react';
import { useContent } from '../../../context/ContentContext';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    FileDown, Printer, Filter, Plus, Columns, Rows,
    Save, Undo, Redo, Eraser, Bold, Italic,
    AlignLeft, AlignCenter, AlignRight,
    Lock, LockOpen, Upload, X, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Initial Data
const INITIAL_YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];
const INITIAL_DATA = [
    {
        id: 'w2',
        title: null,
        rows: [
            { label: 'W2 Wages', values: { 2024: 0, 2023: 0, 2022: 37995.76, 2021: 49793.32, 2020: 69549.66, 2019: 84444.89, 2018: 70399.57, 2017: 63132.46 } },
            { label: 'Taxes Withheld', values: { 2024: 0, 2023: 0, 2022: 4063.44, 2021: 5834.02, 2020: 10423.75, 2019: 12386.28, 2018: 7675.56, 2017: 7909.36 } },
        ]
    },
    {
        id: 'biz',
        title: 'Biz Income/Loss',
        rows: [
            { label: '1. Comfort Foods (dba Robertos Pizza)', values: { 2017: -44581.92 } },
            { label: '2. CloudBaud LLC', values: { 2024: 153952.00, 2023: 38376.00, 2022: 365772.34, 2021: 67285.01, 2020: -1569.85, 2019: 79825.51, 2018: 485019.41, 2017: 334565.42 } },
            { label: '3. Teaching Income', values: {} },
            { label: '4. Canada Condo Sale', values: {} },
        ]
    },
    {
        id: 'rental',
        title: 'Rental Income',
        rows: [
            { label: '1. Olympic Court', values: {} },
            { label: '2. Cherry Crest', values: {} },
            { label: '3. Woodridge', values: {} },
        ]
    },
    {
        id: 'ira',
        title: null,
        rows: [
            { label: 'Jishnu Roth IRA', values: { 2017: 5500.00 } },
            { label: 'Deepika ROTH IRA', values: { 2018: 5500.00, 2017: 5500.00 } },
            { label: 'SEP IRA', values: { 2018: 43605.60, 2017: 5244.90 } },
            { label: '1099-R', values: { 2018: 4862.99 } },
            { label: 'Child Education Fund', values: { 2017: 4000.00 } },
        ]
    },
    {
        id: 'deductions',
        title: 'Itemized deductions',
        rows: [
            { label: 'Real Estate Interest Woodridge', values: { 2021: 10516.14, 2020: 16431.02, 2019: 18719.36, 2018: 13698.52, 2017: 17619.67 } },
            { label: 'Real Estate Interest Lake Hills', values: {} },
            { label: 'Real Estate Interest Olympic Court', values: {} },
        ]
    },
    {
        id: 'taxes',
        title: null,
        rows: [
            { label: 'Real Estate Taxes Woodridge', values: { 2021: 7271.09, 2020: 7191.32, 2019: 6633.65, 2018: 6191.31, 2017: 5009.22 } },
            { label: 'Real Estate Taxes Cherry Crest', values: { 2021: 4110.17, 2020: 3186.17, 2019: 2724.69, 2018: 2761.75 } },
            { label: 'Real Estate Taxes Lake Hills', values: {} },
            { label: 'Real Estate Taxes Olympic Court', values: {} },
            { label: 'Real Estate Taxes Rudins Lounge', values: {} },
        ]
    }
];

const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return <span className="text-slate-300">-</span>;
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    });

    if (isNegative) {
        return <span className="text-red-600 font-medium">({absAmount.replace('$', '')})</span>;
    }
    return <span>{absAmount.replace('$', '')}</span>;
};

// Ribbon Button Component
const RibbonBtn = ({ icon: Icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-1 px-3 py-2 h-16 min-w-[60px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors group">
        <Icon className="size-5 text-slate-500 group-hover:text-brand-blue" />
        <span className="text-[10px] font-medium text-center leading-tight">{label}</span>
    </button>
);

const EditableCell = ({ value, onSave, type = 'text', formatter, className, isLocked }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value ?? '');

    useEffect(() => {
        setLocalValue(value ?? '');
    }, [value]);

    const handleBlur = () => {
        setIsEditing(false);
        const toSave = type === 'number' && localValue !== '' ? parseFloat(localValue) : localValue;
        // Only save if changed (and checks for NaN if number)
        if (toSave !== value) {
            onSave(toSave);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur(); // Trigger blur to save
        }
    };

    if (isLocked) {
        return (
            <div className={cn("w-full h-full flex items-center bg-slate-100 dark:bg-slate-900/50 text-slate-400 cursor-not-allowed select-none", className)}>
                <Lock className="size-3 mr-1 opacity-50" />
                {formatter ? formatter(value) : (value || '')}
            </div>
        );
    }

    if (isEditing) {
        return (
            <input
                autoFocus
                type={type === 'number' ? 'number' : 'text'}
                step="0.01"
                value={localValue}
                onChange={e => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={cn("w-full bg-transparent outline-none p-0 m-0 font-inherit text-inherit h-full", className)}
                onClick={(e) => e.stopPropagation()}
            />
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className={cn("w-full h-full cursor-text min-h-[20px] flex items-center", className)}
            title="Click to edit"
        >
            {formatter ? formatter(value) : (value || <span className="text-slate-300 italic text-xs">Empty</span>)}
        </div>
    );
};

const TaxDashboard = () => {
    const { content } = useContent();
    // --- Persistence Helper ---
    const loadState = (key, fallback) => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : fallback;
        } catch (e) {
            console.error(`Failed to load ${key}`, e);
            return fallback;
        }
    };

    // Data State
    const [years, setYears] = useState(() => loadState('tax_dashboard_v2_years', INITIAL_YEARS));
    const [taxData, setTaxData] = useState(() => loadState('tax_dashboard_v2_data', INITIAL_DATA));

    // Initial Column Widths logic properties
    const [colWidths, setColWidths] = useState(() => {
        const saved = loadState('tax_dashboard_v2_cols', null);
        if (saved) return saved;

        const widths = { label: 320 };
        INITIAL_YEARS.forEach(y => widths[y] = 120);
        return widths;
    });

    const [rowHeights, setRowHeights] = useState(() => loadState('tax_dashboard_v2_rows', {}));

    // --- Selection & Locking State ---
    const [selection, setSelection] = useState({ type: null, id: null }); // type: 'cell'|'row'|'col', id: object|string
    const [lockedState, setLockedState] = useState(() => loadState('tax_dashboard_v2_locks', { cells: {}, rows: {}, cols: {} }));

    const [isSaving, setIsSaving] = useState(false);
    const [showFilePane, setShowFilePane] = useState(false);
    const [filePreviewUrl, setFilePreviewUrl] = useState(null);

    // --- View Mode State ---
    const [searchParams, setSearchParams] = useSearchParams();
    const queryYear = searchParams.get('year');

    // transform query param to state
    const viewMode = queryYear ? 'single' : 'summary';
    const focusedYear = queryYear ? parseInt(queryYear) : null;

    // Derived Years for Rendering
    const visibleYears = React.useMemo(() => {
        if (viewMode === 'single' && focusedYear) return [focusedYear];
        return years;
    }, [viewMode, focusedYear, years]);

    // --- Auto-Save Effects ---
    useEffect(() => {
        setIsSaving(true);
        const timer = setTimeout(() => {
            localStorage.setItem('tax_dashboard_v2_years', JSON.stringify(years));
            localStorage.setItem('tax_dashboard_v2_data', JSON.stringify(taxData));
            localStorage.setItem('tax_dashboard_v2_cols', JSON.stringify(colWidths));
            localStorage.setItem('tax_dashboard_v2_rows', JSON.stringify(rowHeights));
            localStorage.setItem('tax_dashboard_v2_locks', JSON.stringify(lockedState));
            setIsSaving(false);
        }, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [years, taxData, colWidths, rowHeights, lockedState]);

    const dragRef = useRef({ active: false, type: null, id: null, startPos: 0, startSize: 0 });
    const fileInputRef = useRef(null);

    // --- Actions ---
    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            // Create object URL for preview
            const url = URL.createObjectURL(file);
            setFilePreviewUrl(url);
            setShowFilePane(true);

            // Reset input so same file can be selected again
            event.target.value = '';
        }
    };

    const handleAddYear = () => {
        const newYear = Math.max(...years) + 1;
        setYears([newYear, ...years]);
        setColWidths(prev => ({ ...prev, [newYear]: 120 }));
        // No need to update data rows specifically as accessing undefined key returns undefined, which we handle
    };

    const handleAddRow = () => {
        // Find the 'biz' section to add a row to (example logic), or current section if selected
        let targetSection = 'biz';
        if (selection.type === 'row') {
            const lastDashIndex = selection.id.lastIndexOf('-');
            targetSection = selection.id.substring(0, lastDashIndex);
        } else if (selection.type === 'cell') {
            targetSection = selection.id.sectionId;
        }

        const newRow = { label: 'New Entry', values: {} };
        setTaxData(prev => prev.map(section => {
            if (section.id === targetSection) {
                return { ...section, rows: [...section.rows, newRow] };
            }
            return section;
        }));
    };

    const handleDeleteRow = () => {
        let targetSectionId, targetRowIndex;

        if (selection.type === 'row') {
            const lastDashIndex = selection.id.lastIndexOf('-');
            targetSectionId = selection.id.substring(0, lastDashIndex);
            targetRowIndex = parseInt(selection.id.substring(lastDashIndex + 1));
        } else if (selection.type === 'cell') {
            targetSectionId = selection.id.sectionId;
            targetRowIndex = selection.id.rowIndex;
        } else {
            return;
        }

        setTaxData(prev => prev.map(section => {
            if (section.id === targetSectionId) {
                const newRows = section.rows.filter((_, index) => index !== targetRowIndex);
                return { ...section, rows: newRows };
            }
            return section;
        }));
        setSelection({ type: null, id: null });
    };

    const handleDeleteCol = () => {
        let targetColKey;
        if (selection.type === 'col') {
            targetColKey = selection.id;
        } else if (selection.type === 'cell') {
            targetColKey = selection.id.colKey.toString();
        } else {
            return;
        }

        if (targetColKey === 'label') return;

        setYears(prev => prev.filter(y => y.toString() !== targetColKey));
        setSelection({ type: null, id: null });
    };

    const handleCellUpdate = (sectionId, rowIndex, field, newValue) => {
        setTaxData(prev => prev.map(section => {
            if (section.id !== sectionId) return section;

            const newRows = [...section.rows];
            const currentRow = { ...newRows[rowIndex] };

            if (field === 'label') {
                currentRow.label = newValue;
            } else {
                // Numeric update for years
                currentRow.values = {
                    ...currentRow.values,
                    [field]: newValue === '' || isNaN(newValue) ? undefined : newValue
                };
            }

            newRows[rowIndex] = currentRow;
            return { ...section, rows: newRows };
        }));
    };

    // --- Locking Logic ---
    const toggleLock = (shouldLock) => {
        if (!selection.type) return;

        setLockedState(prev => {
            const next = { ...prev };
            const id = selection.id;

            if (selection.type === 'cell') {
                const cellId = `${id.sectionId}-${id.rowIndex}-${id.colKey}`;
                if (shouldLock) next.cells[cellId] = true;
                else delete next.cells[cellId];
            } else if (selection.type === 'row') {
                const rowId = id; // string
                if (shouldLock) next.rows[rowId] = true;
                else delete next.rows[rowId];
            } else if (selection.type === 'col') {
                const colId = id; // string (year or 'label')
                if (shouldLock) next.cols[colId] = true;
                else delete next.cols[colId];
            }
            return next;
        });
    };

    const isCellLocked = (sectionId, rowIndex, colKey) => {
        const cellId = `${sectionId}-${rowIndex}-${colKey}`;
        const rowId = `${sectionId}-${rowIndex}`;

        return (
            lockedState.cells[cellId] ||
            lockedState.rows[rowId] ||
            lockedState.cols[colKey]
        );
    };

    // --- Selection Handlers ---
    const handleSelectCell = (sectionId, rowIndex, colKey) => {
        setSelection({ type: 'cell', id: { sectionId, rowIndex, colKey } });
    };

    const handleSelectRow = (sectionId, rowIndex) => {
        setSelection({ type: 'row', id: `${sectionId}-${rowIndex}` });
    };

    const handleSelectCol = (colKey) => {
        setSelection({ type: 'col', id: colKey.toString() });
    };

    const isSelected = (type, id) => {
        if (!selection.type) return false;

        // Cell Inference Logic
        // If checking a cell, see if its parent row or col is selected
        if (type === 'cell') {
            const { sectionId, rowIndex, colKey } = id; // id is object {sectionId, rowIndex, colKey}

            if (selection.type === 'cell') {
                const s = selection.id;
                return s.sectionId === sectionId && s.rowIndex === rowIndex && s.colKey === colKey;
            }
            if (selection.type === 'row') {
                return selection.id === `${sectionId}-${rowIndex}`;
            }
            if (selection.type === 'col') {
                return selection.id === colKey.toString();
            }
        }

        // Header/Gutter Exact Match Logic
        // Only returns true if the selection type matches the element type
        if (selection.type === type) {
            if (type === 'row') return selection.id === id;
            if (type === 'col') return selection.id === id.toString();
        }

        return false;
    };

    // --- Resizing Logic (Copied from previous step) ---
    const startResize = (e, type, id) => {
        e.preventDefault();
        e.stopPropagation();
        let startSize;
        if (type === 'col') {
            const width = colWidths[id] === 'auto' ? e.target.parentElement.getBoundingClientRect().width : colWidths[id];
            startSize = width;
        } else {
            const height = rowHeights[id] || e.target.parentElement.getBoundingClientRect().height;
            startSize = height;
        }
        dragRef.current = { active: true, type, id, startPos: type === 'col' ? e.clientX : e.clientY, startSize: startSize };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = type === 'col' ? 'col-resize' : 'row-resize';
        document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e) => {
        if (!dragRef.current.active) return;
        const { type, id, startPos, startSize } = dragRef.current;
        const currentPos = type === 'col' ? e.clientX : e.clientY;
        const delta = currentPos - startPos;
        const newSize = Math.max(type === 'col' ? 50 : 30, startSize + delta);
        if (type === 'col') setColWidths(prev => ({ ...prev, [id]: newSize }));
        else setRowHeights(prev => ({ ...prev, [id]: newSize }));
    };

    const handleMouseUp = () => {
        if (dragRef.current.active) {
            dragRef.current.active = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        }
    };

    const handleDoubleClick = (type, id) => {
        if (type === 'col' && typeof id === 'number') { // It's a year
            // Update URL instead of local state
            setSearchParams({ year: id.toString() });
            return;
        }

        if (type === 'col') {
            setColWidths(prev => ({ ...prev, [id]: prev[id] === 'auto' ? (id === 'label' ? 320 : 120) : 'auto' }));
        } else if (type === 'row') {
            setRowHeights(prev => { const next = { ...prev }; delete next[id]; return next; });
        }
    };

    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const getColStyle = (id) => {
        const width = colWidths[id];
        return { width: width === 'auto' ? 'auto' : `${width}px`, minWidth: width === 'auto' ? 'auto' : `${width}px` };
    };

    // --- Ribbon Visibility ---
    const [isRibbonVisible, setIsRibbonVisible] = useState(true);

    // --- Collapsible Sections ---
    const [collapsedSections, setCollapsedSections] = useState({});

    const toggleSection = (sectionId) => {
        setCollapsedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    return (
        <div className="space-y-4">
            {/* Header / Actions - Modified to include Ribbon Toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent">
                        Tax Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Historical tracking of income, losses, and deductions.
                        <span className="text-brand-blue font-medium ml-2">Tip: Double-click or drag borders to resize.</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 hidden sm:inline-block border-r border-slate-300 dark:border-slate-700 pr-3 mr-1">
                        Select cells/rows/cols to Lock
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsRibbonVisible(!isRibbonVisible)}
                        className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                    >
                        {isRibbonVisible ? 'Hide Ribbon' : 'Show Ribbon'}
                    </Button>
                </div>
            </div>

            {/* --- Ribbon UI --- */}
            {isRibbonVisible && (
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <Tabs defaultValue="file" className="w-full">
                        <div className="flex items-center justify-between px-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                            <TabsList className="h-10 bg-transparent p-0 gap-2">
                                <TabsTrigger value="file" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#1a1a1a] data-[state=active]:shadow-sm rounded-t-lg border-x border-t border-transparent data-[state=active]:border-slate-200 dark:data-[state=active]:border-slate-700 px-4">File</TabsTrigger>
                                <TabsTrigger value="table" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#1a1a1a] data-[state=active]:shadow-sm rounded-t-lg border-x border-t border-transparent data-[state=active]:border-slate-200 dark:data-[state=active]:border-slate-700 px-4">Table</TabsTrigger>
                                <TabsTrigger value="data" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#1a1a1a] data-[state=active]:shadow-sm rounded-t-lg border-x border-t border-transparent data-[state=active]:border-slate-200 dark:data-[state=active]:border-slate-700 px-4">Data</TabsTrigger>
                                <TabsTrigger value="view" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#1a1a1a] data-[state=active]:shadow-sm rounded-t-lg border-x border-t border-transparent data-[state=active]:border-slate-200 dark:data-[state=active]:border-slate-700 px-4">View</TabsTrigger>
                            </TabsList>
                            <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                                {isSaving ? (
                                    <>
                                        <span className="animate-spin text-brand-blue">⟳</span> Saving...
                                    </>
                                ) : (
                                    <>
                                        <span className="text-green-600">✓</span> AutoSave: On
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="p-2 h-20 bg-white dark:bg-[#1a1a1a]">
                            <TabsContent value="file" className="mt-0 h-full flex items-center gap-2">
                                <RibbonBtn icon={Save} label="Save" />
                                <RibbonBtn icon={FileDown} label="Import W2" onClick={handleImportClick} />
                                <Separator orientation="vertical" className="h-10 mx-1" />
                                <RibbonBtn icon={Upload} label="Export" />
                                <RibbonBtn icon={Printer} label="Print" />
                                <Separator orientation="vertical" className="h-10 mx-1" />
                                <div className="flex gap-1">
                                    <RibbonBtn icon={Bold} label="Bold" />
                                    <RibbonBtn icon={Italic} label="Italic" />
                                </div>
                                <Separator orientation="vertical" className="h-10 mx-1" />
                                <div className="flex gap-1">
                                    <RibbonBtn icon={AlignLeft} label="Left" />
                                    <RibbonBtn icon={AlignCenter} label="Center" />
                                    <RibbonBtn icon={AlignRight} label="Right" />
                                </div>
                            </TabsContent>

                            <TabsContent value="table" className="mt-0 h-full flex items-center gap-2">
                                <RibbonBtn icon={Columns} label="Insert Column" onClick={handleAddYear} />
                                <RibbonBtn icon={Rows} label="Insert Row" onClick={handleAddRow} />
                                <Separator orientation="vertical" className="h-10 mx-1" />
                                <RibbonBtn icon={Columns} label="Delete Column" onClick={handleDeleteCol} />
                                <RibbonBtn icon={Rows} label="Delete Row" onClick={handleDeleteRow} />
                                <RibbonBtn icon={Eraser} label="Clear All" />
                            </TabsContent>

                            <TabsContent value="data" className="mt-0 h-full flex items-center gap-2">
                                <RibbonBtn icon={Lock} label="Lock" onClick={() => toggleLock(true)} />
                                <RibbonBtn icon={LockOpen} label="Unlock" onClick={() => toggleLock(false)} />
                                <Separator orientation="vertical" className="h-10 mx-1" />
                                <RibbonBtn icon={Filter} label="Filter" />
                                <RibbonBtn icon={Undo} label="Undo" />
                                <RibbonBtn icon={Redo} label="Redo" />
                            </TabsContent>

                            <TabsContent value="view" className="mt-0 h-full flex items-center gap-2">
                                <div className="flex flex-col gap-1 px-2 border-r border-slate-200 dark:border-slate-700 pr-4">
                                    <label className="text-[10px] text-slate-500 font-medium">Active View</label>
                                    <select
                                        className="h-8 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded px-2 w-32 focus:ring-1 focus:ring-brand-blue"
                                        value={viewMode === 'summary' ? 'summary' : focusedYear}
                                        onChange={(e) => {
                                            if (e.target.value === 'summary') {
                                                setSearchParams({});
                                            } else {
                                                setSearchParams({ year: e.target.value });
                                            }
                                        }}
                                    >
                                        <option value="summary">Summary View</option>
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <RibbonBtn icon={FileDown} label="File Pane" onClick={() => setShowFilePane(!showFilePane)} />
                                <div className="text-sm text-slate-500 px-4">View options (Freeze panes, etc.) would go here.</div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            )}

            {/* Content Area: Table + File Pane + Activity Log */}
            <div className="flex gap-4 items-start mt-2 h-[calc(100vh-200px)]">
                {/* Main Spreadsheet View */}
                <div className={cn(
                    "bg-white dark:bg-[#1a1a1a] border border-slate-300 dark:border-slate-700 shadow-sm overflow-auto select-none transition-all duration-300 h-full",
                    showFilePane ? "w-[50%]" : (content?.taxActivities?.showLog ? "w-[75%]" : "w-full")
                )}>
                    <table className="w-full border-collapse min-w-[1000px] table-fixed">
                        <thead>
                            {/* Column Handles Row (A, B, C...) */}
                            <tr>
                                {/* Corner Cell */}
                                <th className="w-8 min-w-[32px] h-6 bg-slate-100 dark:bg-slate-800 border-r border-b border-slate-300 dark:border-slate-700"></th>

                                {/* Label Column Handle (A) */}
                                <th
                                    className={cn(
                                        "h-6 border-r border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[10px] text-slate-500 font-mono font-medium text-center relative group select-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800",
                                        isSelected('col', 'label') && "bg-brand-blue/20 text-brand-blue font-bold"
                                    )}
                                    style={getColStyle('label')}
                                    onClick={() => handleSelectCol('label')}
                                >
                                    A
                                    <div className="absolute inset-y-0 right-0 w-1 md:w-2 cursor-col-resize hover:bg-brand-blue/50 z-20"
                                        onMouseDown={(e) => startResize(e, 'col', 'label')}
                                        onDoubleClick={() => handleDoubleClick('col', 'label')}
                                        onClick={e => e.stopPropagation()}
                                    />
                                </th>

                                {/* Year Column Handles (B, C, D...) */}
                                {visibleYears.map((year, i) => (
                                    <th
                                        key={`handle-${year}`}
                                        className={cn(
                                            "h-6 border-r border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[10px] text-slate-500 font-mono font-medium text-center relative group select-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800",
                                            isSelected('col', year) && "bg-brand-blue/20 text-brand-blue font-bold"
                                        )}
                                        style={getColStyle(year)}
                                        onClick={() => handleSelectCol(year)}
                                    >
                                        {String.fromCharCode(66 + i)}
                                        <div className="absolute inset-y-0 right-0 w-1 md:w-2 cursor-col-resize hover:bg-brand-blue/50 z-20"
                                            onMouseDown={(e) => startResize(e, 'col', year)}
                                            onDoubleClick={() => handleDoubleClick('col', year)}
                                            onClick={e => e.stopPropagation()}
                                        />
                                    </th>
                                ))}
                            </tr>

                            {/* Data Headers (Label, Indexes) - Now purely informational */}
                            <tr>
                                {/* Gutter Column Header */}
                                <th className="w-8 min-w-[32px] bg-slate-100 dark:bg-slate-800 border-r border-b border-slate-300 dark:border-slate-700"></th>

                                <th
                                    className={cn(
                                        "p-0 border border-slate-300 dark:border-slate-600 bg-[#0f2a4a] text-white relative group box-border h-10 select-none",
                                        isSelected('col', 'label') && "ring-2 ring-inset ring-brand-aqua z-10"
                                    )}
                                    style={getColStyle('label')}
                                >
                                    <div className="flex items-center justify-center h-full w-full">Label</div>
                                </th>
                                {visibleYears.map(year => (
                                    <th
                                        key={year}
                                        className={cn(
                                            "p-2 border border-slate-300 dark:border-slate-600 bg-[#0f2a4a] text-white font-bold text-center relative group box-border h-10 cursor-default",
                                            isSelected('col', year) && "ring-2 ring-inset ring-brand-aqua z-10"
                                        )}
                                        style={getColStyle(year)}
                                    >
                                        <div
                                            className="flex items-center justify-center w-full h-full overflow-hidden hover:text-brand-aqua hover:underline cursor-pointer transition-colors"
                                            onClick={() => setSearchParams({ year: year.toString() })}
                                            title="Click to focus this year"
                                        >
                                            {year}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {taxData.map((section, sectionIndex) => (
                                <React.Fragment key={section.id}>
                                    {section.title && (
                                        <tr>
                                            {/* Gutter for Section Header - Selects all rows in section? Or just placeholder */}
                                            <td className="w-8 border-r border-b border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800"></td>

                                            <td className="p-2 border border-slate-300 dark:border-slate-600 bg-[#0f2a4a] text-white font-bold text-left text-lg overflow-hidden truncate">
                                                <div className="flex items-center gap-2 cursor-pointer hover:text-brand-aqua transition-colors" onClick={() => toggleSection(section.id)}>
                                                    {collapsedSections[section.id] ? (
                                                        <span className="text-sm px-1 border border-white/30 rounded">+</span>
                                                    ) : (
                                                        <span className="text-sm px-1.5 border border-white/30 rounded">-</span>
                                                    )}
                                                    {section.title}
                                                </div>
                                            </td>
                                            {visibleYears.map(year => (
                                                <td key={year} className="border border-slate-300 dark:border-slate-600 bg-[#0f2a4a]"></td>
                                            ))}
                                        </tr>
                                    )}

                                    {!collapsedSections[section.id] && section.rows.map((row, rowIndex) => {
                                        const rowId = `${section.id}-${rowIndex}`;
                                        const h = rowHeights[rowId];
                                        return (
                                            <tr key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" style={{ height: h ? `${h}px` : 'auto' }}>
                                                {/* Gutter Row Selection */}
                                                <td
                                                    className={cn(
                                                        "w-8 text-[10px] text-center text-slate-400 font-mono bg-slate-50 dark:bg-slate-900 border-r border-b border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 select-none",
                                                        isSelected('row', rowId) && "bg-brand-blue/20 text-brand-blue border-r-brand-blue font-bold"
                                                    )}
                                                    onClick={() => handleSelectRow(section.id, rowIndex)}
                                                >
                                                    {rowIndex + 1}
                                                </td>

                                                <td
                                                    className={cn(
                                                        "p-2 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 font-medium text-sm bg-white dark:bg-[#1a1a1a] relative group overflow-hidden align-middle box-border",
                                                        isSelected('cell', { sectionId: section.id, rowIndex, colKey: 'label' }) && "bg-brand-blue/10 ring-2 ring-inset ring-brand-blue z-10"
                                                    )}
                                                    onClick={() => handleSelectCell(section.id, rowIndex, 'label')}
                                                >
                                                    <div className={cn("w-full h-full flex items-center", colWidths.label === 'auto' ? 'whitespace-nowrap' : 'truncate')}>
                                                        <EditableCell
                                                            value={row.label}
                                                            isLocked={isCellLocked(section.id, rowIndex, 'label')}
                                                            onSave={(val) => handleCellUpdate(section.id, rowIndex, 'label', val)}
                                                        />
                                                    </div>
                                                    {(row.label.includes('W2 Wages') || row.label.includes('Child Education')) && (
                                                        <span className="absolute top-0 right-0 border-t-[8px] border-r-[8px] border-t-red-500 border-r-transparent transform rotate-0 pointer-events-none" />
                                                    )}
                                                    <div className="absolute bottom-0 left-0 right-0 h-1 md:h-1.5 cursor-row-resize hover:bg-brand-blue/50 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onMouseDown={(e) => startResize(e, 'row', rowId)}
                                                        onDoubleClick={() => handleDoubleClick('row', rowId)}
                                                        onClick={e => e.stopPropagation()}
                                                    />
                                                </td>
                                                {visibleYears.map(year => (
                                                    <td
                                                        key={year}
                                                        className={cn(
                                                            "p-2 border border-slate-300 dark:border-slate-600 text-right text-slate-700 dark:text-slate-300 text-sm font-mono bg-white dark:bg-[#1a1a1a] whitespace-nowrap overflow-hidden align-middle box-border cursor-pointer",
                                                            isSelected('cell', { sectionId: section.id, rowIndex, colKey: year }) && "bg-brand-blue/10 ring-2 ring-inset ring-brand-blue z-10"
                                                        )}
                                                        onClick={() => handleSelectCell(section.id, rowIndex, year)}
                                                    >
                                                        <EditableCell
                                                            value={row.values[year]}
                                                            type="number"
                                                            formatter={formatCurrency}
                                                            isLocked={isCellLocked(section.id, rowIndex, year)}
                                                            onSave={(val) => handleCellUpdate(section.id, rowIndex, year, val)}
                                                            className="justify-end"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}

                                    {['w2', 'rental'].includes(section.id) && !collapsedSections[section.id] && (
                                        <tr>
                                            <td className="w-8 border-r border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800"></td>
                                            <td colSpan={visibleYears.length + 1} className="h-6 border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1a1a1a]"></td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* File View Pane (30%) */}
                {showFilePane && (
                    <div className="w-[30%] bg-white dark:bg-[#1a1a1a] border border-slate-300 dark:border-slate-700 h-[600px] rounded-lg shadow-sm flex flex-col animate-in slide-in-from-right duration-300 shrink-0">
                        <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                            <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <FileDown className="size-4" />
                                File Preview
                            </h3>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowFilePane(false)}>
                                <X className="size-4" />
                            </Button>
                        </div>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 overflow-hidden relative">
                            {filePreviewUrl ? (
                                <iframe
                                    src={filePreviewUrl}
                                    className="w-full h-full border rounded bg-white"
                                    title="PDF Preview"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <FileDown className="size-12 mb-2 opacity-50" />
                                    <p className="text-sm">No file selected</p>
                                    <Button variant="outline" size="sm" className="mt-4" onClick={() => document.querySelector('input[type="file"]').click()}>
                                        Select File
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Activity Log Pane (Controlled by Control Pane) */}
                {content?.taxActivities?.showLog && !showFilePane && (
                    <div className="w-[25%] bg-white dark:bg-[#1a1a1a] border border-slate-300 dark:border-slate-700 h-full rounded-lg shadow-sm flex flex-col animate-in slide-in-from-right duration-300 shrink-0">
                        <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                            <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Activity className="size-4 text-green-500" />
                                Tax Activity Log
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-0">
                            <div className="p-3 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">System</span>
                                    <span className="text-[10px] text-slate-400">Just now</span>
                                </div>
                                <p className="text-xs text-slate-500">Dashboard loaded correctly.</p>
                            </div>
                            <div className="p-3 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-brand-blue">Jishnu N.</span>
                                    <span className="text-[10px] text-slate-400">2h ago</span>
                                </div>
                                <p className="text-xs text-slate-500">Updated 2024 W2 Wages for CloudBaud LLC.</p>
                            </div>
                            <div className="p-3 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-brand-blue">Jishnu N.</span>
                                    <span className="text-[10px] text-slate-400">5h ago</span>
                                </div>
                                <p className="text-xs text-slate-500">Attached receipt: <code>server_costs_jan.pdf</code></p>
                            </div>
                            <div className="p-3 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer opacity-50">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-slate-500">AutoSave</span>
                                    <span className="text-[10px] text-slate-400">Yesterday</span>
                                </div>
                                <p className="text-xs text-slate-500">Snapshot created.</p>
                            </div>
                        </div>
                        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                            <Button size="sm" variant="outline" className="w-full text-xs h-8">View Full Audit Trail</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Hidden File Input for W2 Import */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
            />
        </div>
    );
};

export default TaxDashboard;
