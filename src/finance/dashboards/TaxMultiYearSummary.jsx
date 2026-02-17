import React, { useState, useRef, useEffect, useMemo } from 'react';

import { useSearchParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    FileDown, Printer, Filter, Plus, Columns, Rows,
    Save, Undo, Redo, Eraser, Bold, Italic,
    AlignLeft, AlignCenter, AlignRight,
    Lock, LockOpen, Upload, X, Activity, MessageSquare, Bot, Sparkles, FileText, ListTodo, Check, Paperclip
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';

import TaxRibbon from '../components/TaxRibbon';
import WorkspaceChat from '../../collaboration/WorkspaceChat';
import OllamaChatPanel from '../../collaboration/OllamaChatPanel';
import { 
    updateTaxCell, 
} from '../api/taxService';


// Initial Data
const INITIAL_YEARS = [2026,2025,2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];
const INITIAL_DATA = [
    {
        id: 'checklist',
        title: 'Filing Checklist (Verify Per Year)',
        rows: [

        ]
    },
    {
        id: 'w2',
        title: 'INCOME',
        rows: [
            { code: 'w2_wages', label: 'W2 Wages', values: { 2024: 0, 2023: 0, 2022: 37995.76, 2021: 49793.32, 2020: 69549.66, 2019: 84444.89, 2018: 70399.57, 2017: 63132.46 } },
            { code: 'w2_withheld', label: 'Taxes Withheld', values: { 2024: 0, 2023: 0, 2022: 4063.44, 2021: 5834.02, 2020: 10423.75, 2019: 12386.28, 2018: 7675.56, 2017: 7909.36 } },
            { label: '2. Income: 1099-NEC (CloudBaud Consulting)', values: {} },
            { label: '3. Income: 1099-B (Stock Sales/Cost Basis)', values: {} },
            { label: '4. Income: 1099-INT/DIV (Interest/Dividends)', values: {} },
            { label: '5. Biz: Contractor 1099s Issued (> $600)', values: {} },
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
            { code: 'w2_401k', label: '401k Contributions', values: { 2017: 3428.48 } },
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
            { label: '6. Biz: Home Office Deduction (Utilities/Ins)', values: {} },
            { label: '7. Biz: Equipment/Software (Section 179)', values: {} },
            { label: '8. Biz: Vehicle Mileage Log', values: {} },
            { label: '9. Personal: Mortgage Interest (1098)', values: {} },
            { label: '10. Personal: RE/Sales Tax (Big Purchases)', values: {} },
            { label: '11. Retirement: SEP-IRA/401k Maxed', values: {} },
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
    if (amount === undefined || amount === null) return <span className="text-muted-foreground/50">-</span>;
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    });

    if (isNegative) {
        return <span className="text-destructive font-medium">({absAmount.replace('$', '')})</span>;
    }
    return <span>{absAmount.replace('$', '')}</span>;
};



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
            <div className={cn("w-full h-full flex items-center bg-muted/50 text-muted-foreground cursor-not-allowed select-none", className)}>
                <Lock className="size-3 mr-1 opacity-50" />
                {formatter ? formatter(value) : (value || '')}
            </div>
        );
    }

    if (type === 'checkbox') {
        const isChecked = Boolean(value);
        return (
            <div 
                className={cn("w-full h-full flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors", className)}
                onClick={() => onSave(isChecked ? 0 : 1)} // Toggle 0/1 for DB compatibility
            >
                <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    isChecked 
                        ? "bg-brand-blue border-brand-blue text-white" 
                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                )}>
                    {isChecked && <Check className="w-3 h-3" />}
                </div>
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
            {formatter ? formatter(value) : (value || <span className="text-muted-foreground/50 italic text-xs">Empty</span>)}
        </div>
    );
};



const TaxMultiYearSummary = () => {
    console.log("TaxMultiYearSummary: Mounting/Rendering");
    const navigate = useNavigate();



    // --- Persistence Helper (Supabase) ---
    // We now load from taxService directly via ESM imports


    const populateCoa = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase.rpc('populate_default_coa');
            if (error) throw error;
            // Reload data
            window.location.reload(); 
        } catch (err) {
            console.error("Failed to populate COA:", err);
            alert("Failed to populate accounts: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };
    // Functions are imported at module level: getChartOfAccounts, etc.

    // Helper functions are now async service calls. 
    // We need to manage loading state.
    const [isLoading, setIsLoading] = useState(true); 
    // Just suppressing the unused var warning by using it in effect
    useEffect(() => { if (isLoading) console.log("Dashboard loading..."); }, [isLoading]);

    // --- V2 State: Normalized Data ---
    const [coa, setCoa] = useState([]); // List of Account Objects
    const [entries, setEntries] = useState({}); // Map: "accountId-year" -> value
    const [years, setYears] = useState(INITIAL_YEARS); // Still keep years configurable or derived?
    const [legacyTaxData, setLegacyTaxData] = useState(INITIAL_DATA); // Legacy holder, replaced by 'sections' usage
    
    // --- View Mode State ---
    const [searchParams, setSearchParams] = useSearchParams();
    const queryYear = searchParams.get('year');

    // transform query param to state
    // Default to 'summary' view (all years) if no specific year is selected
    const viewMode = queryYear ? 'single' : 'summary'; 
    const focusedYear = queryYear ? parseInt(queryYear) : null;
    
    // Derived for UI Rendering (Group by Section)
    const sections = useMemo(() => {
        // Expanded Grouping System to support Universal COA types
        const groups = { 
            checklist: [],
            w2: [], 
            biz: [], 
            rental: [], 
            ira: [], 
            deductions: [], 
            taxes: [],
            // New Universal Buckets if 'section' is null/other
            assets: [],
            liabilities: [], 
            revenue: [],
            expense: []
        };
        
        if (coa.length === 0) return legacyTaxData;

        coa.forEach(account => {
            let sectionKey = account.section;
            
            // If no explicit section, map by TYPE (Universal COA fallback)
            if (!sectionKey) {
                if (account.type === 'ASSET') sectionKey = 'assets';
                else if (account.type === 'LIABILITY') sectionKey = 'liabilities';
                else if (account.type === 'INCOME' || account.type === 'REVENUE') sectionKey = 'revenue';
                else if (account.type === 'EXPENSE') sectionKey = 'expense';
                else sectionKey = 'biz'; // Fallback
            }

            if (!groups[sectionKey]) groups[sectionKey] = [];
            
            // Transform to UI Row format
            const row = {
                id: account.id, // UUID
                label: account.name, // e.g. "4110 Cloud Consulting Fees"
                values: {} 
            };
            
            // Hydrate values from entries map
            years.forEach(year => {
                const key = `${account.id}-${year}`;
                if (entries[key]) {
                    row.values[year] = entries[key];
                }
            });
            groups[sectionKey].push(row);
        });

        // Explicitly get checklist from INITIAL_DATA if not in COA (Legacy Fallback)
        let checklistRows = groups.checklist;
        if (checklistRows.length === 0) {
            const initialChecklist = INITIAL_DATA.find(s => s.id === 'checklist');
            if (initialChecklist) {
                checklistRows = initialChecklist.rows.map((r, i) => ({
                    ...r,
                    id: `checklist-item-${i}`, // Virtual ID for keying
                    values: {} // Virtual values (won't persist without DB backing)
                }));
            }
        }

        // Merge checklist items from INITIAL_DATA into other sections (e.g., w2)
        // This ensures UI-only checklist items remain visible even when COA loads
        const initialW2Section = INITIAL_DATA.find(s => s.id === 'w2');
        if (initialW2Section) {
            initialW2Section.rows.forEach((row, i) => {
                if (row.isChecklist || !row.code) {
                    // This is a checklist item or label-only row, add it
                    groups.w2.push({
                        ...row,
                        id: row.id || `w2-checklist-${i}`,
                        values: row.values || {}
                    });
                }
            });
        }

        // Merge checklist items from INITIAL_DATA into deductions section
        const initialDeductionsSection = INITIAL_DATA.find(s => s.id === 'deductions');
        if (initialDeductionsSection) {
            initialDeductionsSection.rows.forEach((row, i) => {
                if (!row.code) {
                    // This is a checklist item or label-only row, add it
                    groups.deductions.push({
                        ...row,
                        id: row.id || `deductions-checklist-${i}`,
                        values: row.values || {}
                    });
                }
            });
        }

        // Convert groupsMap to Array format expected by Renderer
        return [
            // 0. Checklist (Only visible in Single Year View)
            { id: 'checklist', title: null, rows: checklistRows },

            // 1. Personal Basic
            { id: 'w2', title: 'INCOME', rows: groups.w2 },
            
            // 2. Business / Universal Structure
            { id: 'revenue', title: 'Consulting Revenue', rows: groups.revenue },
            { id: 'expense', title: 'Operating Expenses', rows: groups.expense },
            
            // 3. Investing / Assets
            { id: 'rental', title: 'Real Estate / Rental', rows: groups.rental },
            { id: 'assets', title: 'Assets & Equipment', rows: groups.assets },
            { id: 'ira', title: 'Retirement / Investments', rows: groups.ira },
            
            // 4. Deductions
            { id: 'deductions', title: 'Itemized Deductions', rows: groups.deductions },
            
            // 5. Legacy & Other
            { id: 'biz', title: 'Business Structure (Legacy)', rows: groups.biz }, /* Keep for legacy mapping */
            { id: 'taxes', title: 'Taxes Paid', rows: groups.taxes },
            { id: 'liabilities', title: 'Liabilities', rows: groups.liabilities }

        ].filter(s => {
            // Hide checklist if not in single view
            if (s.id === 'checklist') {
                 if (viewMode !== 'single') return false;
                 return true; // Always show checklist in single view
            }
            // Otherwise show if it has data or if we are in initial state
            return s.rows.length > 0 || coa.length === 0;
        }); 
    }, [coa, entries, years, legacyTaxData, viewMode]);



    const [colWidths, setColWidths] = useState(() => {
        const widths = { label: 200 };
        INITIAL_YEARS.forEach(y => widths[y] = 120);
        return widths;
    });

    const [rowHeights, setRowHeights] = useState({});

    // --- Selection & Locking State ---
    const [selection, setSelection] = useState({ type: null, id: null }); // type: 'cell'|'row'|'col', id: object|string
    const [lockedState, setLockedState] = useState({ cells: {}, rows: {}, cols: {} });

    // --- Document Linking State ---
    const [cellLinks, setCellLinks] = useState({}); // Map: "section-row-col" -> { fileName, fileUrl, page }
    const [yearReturns, setYearReturns] = useState({}); // Map: "year" -> { fileName, fileUrl }
    const [rowAttachments, setRowAttachments] = useState({}); // Map: "section-row" -> { fileName, fileUrl, docId }
    
    // --- Persistence for Links ---
    useEffect(() => {
        localStorage.setItem('tax_dashboard_v2_links', JSON.stringify(cellLinks));
        localStorage.setItem('tax_dashboard_v2_returns', JSON.stringify(yearReturns));
    }, [cellLinks, yearReturns]);

    const [isSaving, setIsSaving] = useState(false);
    const [activeRightTab, setActiveRightTab] = useState('agent'); // 'chat' | 'agent' | 'activity' | null
    const [showFilePanel, setShowFilePanel] = useState(false);
    const [filePreviewUrl, setFilePreviewUrl] = useState(null);
    const [cpaChecklistOpen, setCpaChecklistOpen] = useState(false);



    // Derived Years for Rendering
    const visibleYears = useMemo(() => {
        if (viewMode === 'single' && focusedYear) return [focusedYear];
        return years;
    }, [viewMode, focusedYear, years]);

    // --- Load Initial State from Supabase ---
    // --- Load V2 State from Supabase ---
    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch Chart of Accounts & Returns
                const { getChartOfAccounts, getTaxEntries, getYearReturns, getRowAttachments } = await import('@/finance/api/taxService');
                const accounts = await getChartOfAccounts();
                const returns = await getYearReturns();
                const attachments = await getRowAttachments();
                
                setYearReturns(returns || {});
                setRowAttachments(attachments || {});
                
                // 2. Fetch Entries
                const entryData = await getTaxEntries();
                
                if (accounts && accounts.length > 0) {
                    setCoa(accounts);
                    
                    // Transform entries to efficient Map
                    const entryMap = {};
                    entryData.forEach(e => {
                        entryMap[`${e.account_id}-${e.year}`] = e.amount;
                    });
                    setEntries(entryMap);
                } else {
                    // Fallback / Auto-Initialize COA if empty (Migration Logic could go here)
                    console.warn("No COA found. Using default local data.");
                    // In a real app, we might auto-seed the COA here for the user.
                }

            } catch (error) {
                console.error("Failed to load V2 tax state", error);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    // --- Auto-Save to Supabase ---
    // Remove old Auto-Save Effect (V1)
    /*
    useEffect(() => {
        // ... (removed)
    }, ...);
    */

    const dragRef = useRef({ active: false, type: null, id: null, startPos: 0, startSize: 0 });

    const fileInputRef = useRef(null); // General file upload ref

    const [extractedText, setExtractedText] = useState(null);
    const [extractedData, setExtractedData] = useState(null); // { amount, year, category, relatedCell }
    const [agentStatus, setAgentStatus] = useState({ isLoading: false, error: null });
    const [agentTrigger, setAgentTrigger] = useState(null);

    // File Input Refs
    // File Input Refs
    const returnInputRef = useRef(null);
    const supportingDocInputRef = useRef(null); // For linking supporting docs to cells
    const attachmentInputRef = useRef(null); // For row attachments
    const [pendingAttachmentRow, setPendingAttachmentRow] = useState(null); // {sectionId, rowIndex}

    // --- Panel Resizing State ---
    const [filePanelWidthPct, setFilePanelWidthPct] = useState(50);
    const [rightPanelWidth, setRightPanelWidth] = useState(320);
    const containerRef = useRef(null);

    // --- Actions ---
    const handleRunExtraction = async () => {
        // 1. Open the Agent Panel
        setActiveRightTab('agent');

        let textToAnalyze = extractedText;

        // 2. If no text extracted yet, try to fetch from current preview URL
        if (!textToAnalyze && filePreviewUrl) {
            try {
                // Dynamically import to avoid load issues
                const { extractTextFromPdf } = await import('@/lib/pdfUtils');
                
                // Fetch the blob from the ObjectURL
                const response = await fetch(filePreviewUrl);
                const blob = await response.blob();
                
                // Extract
                textToAnalyze = await extractTextFromPdf(blob);
                setExtractedText(textToAnalyze);
                console.log("Lazy Extracted Text:", textToAnalyze.substring(0, 100) + "...");
            } catch (err) {
                console.error("Lazy extraction failed", err);
                // Continue with null, agent will complain
            }
        }

        // 3. Send Signal
        setAgentTrigger({
            type: 'extract',
            context: 'current_file',
            data: textToAnalyze, 
            timestamp: Date.now()
        });
    };



    // handle "Open Tax Return"
    const handleOpenReturn_Click = () => {
        if (!focusedYear) {
            alert("Please select a Year column first to attach a Tax Return.");
            return;
        }
        if (returnInputRef.current) returnInputRef.current.click();
    };

    const handleReturnFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (file && focusedYear) {
            // Optimistic Update
            const url = URL.createObjectURL(file);
            setYearReturns(prev => ({
                ...prev,
                [focusedYear]: { fileName: file.name, fileUrl: url }
            }));
            setFilePreviewUrl(url);
            setShowFilePanel(true);
            
            // Upload to Supabase
            try {
                const { uploadTaxDocument } = await import('@/finance/api/taxService');
                const doc = await uploadTaxDocument(file, { year: focusedYear, type: 'RETURN' });
                // We'd ideally store the remote URL or doc ID now
                console.log("Uploaded Return:", doc);
            } catch (err) {
                console.error("Upload failed", err);
                alert("Upload failed: " + err.message);
            }
            e.target.value = ''; 
        }
    };

    // handle "Link Supporting Doc" to Cell - (Removed unused handleLinkDoc_Click)

    const handleSupportingDocChange = async (e) => {
        const file = e.target.files?.[0];
        if (file && selection.type === 'cell') {
            const url = URL.createObjectURL(file); // Optimistic URL
            const cellId = `${selection.id.sectionId}-${selection.id.rowIndex}-${selection.id.colKey}`;
            
            setCellLinks(prev => ({
                ...prev,
                [cellId]: { fileName: file.name, fileUrl: url, page: 1 }
            }));
            setFilePreviewUrl(url);
            setShowFilePanel(true);

            // Upload & Link in Supabase
            try {
                const { uploadTaxDocument, linkDocumentToCell } = await import('@/finance/api/taxService');
                // 1. Upload
                const doc = await uploadTaxDocument(file, { type: 'SUPPORTING' });
                // 2. Link
                // const { sectionId, rowIndex, colKey } = selection.id;
                await linkDocumentToCell(selection.id, doc.id); // Assuming doc.id is returned
                console.log("Linked Doc:", doc);
            } catch (err) {
                console.error("Link failed", err);
            }

            e.target.value = '';
        }
    };

    // Handle attachment icon click - open file picker
    const handleAttachmentClick = (sectionId, rowIndex) => {
        setPendingAttachmentRow({ sectionId, rowIndex });
        if (attachmentInputRef.current) attachmentInputRef.current.click();
    };

    // Handle attachment file selection
    const handleAttachmentFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (file && pendingAttachmentRow) {
            const { sectionId, rowIndex } = pendingAttachmentRow;
            const rowId = `${sectionId}-${rowIndex}`;
            
            // Optimistic Update
            const url = URL.createObjectURL(file);
            setRowAttachments(prev => ({
                ...prev,
                [rowId]: { fileName: file.name, fileUrl: url }
            }));
            
            // Upload to Supabase
            try {
                const { uploadTaxDocument } = await import('@/finance/api/taxService');
                const doc = await uploadTaxDocument(file, { type: 'ROW_ATTACHMENT', rowId });
                
                // Update with actual doc ID
                setRowAttachments(prev => ({
                    ...prev,
                    [rowId]: { fileName: file.name, fileUrl: url, docId: doc.id }
                }));
                
                console.log("Uploaded Row Attachment:", doc);
            } catch (err) {
                console.error("Attachment upload failed", err);
                alert("Upload failed: " + err.message);
            }
            
            e.target.value = '';
            setPendingAttachmentRow(null);
        }
    };




    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (file) {
            // Create object URL for preview
            const url = URL.createObjectURL(file);
            setFilePreviewUrl(url);
            setExtractedText(null); // Clear previous
            setShowFilePanel(true);
            setFilePanelWidthPct(50); // Reset to 50% split on file load


            // Compact columns to fit
            setColWidths(prev => {
                const next = { ...prev };
                next['label'] = 200;
                years.forEach(y => next[y] = 100);
                return next;
            });

            // AUTO-EXTRACT TEXT (Prepare for AI)
            try {
                const { extractTextFromPdf } = await import('@/lib/pdfUtils');
                const text = await extractTextFromPdf(file);
                setExtractedText(text);
                console.log("PDF Text Extracted:", text.substring(0, 100) + "...");
            } catch (err) {
                console.error("Extraction failed", err);
            }

            // Reset input so same file can be selected again
            event.target.value = '';
        }
    };

    const confirmImport = async () => {
        if (!extractedData) return;
        
        const { amount, year } = extractedData;
        if (!amount || !year) return;

        // 1. Update W-2 Wages (Hardcoded Logic for Demo)
        // Find W-2 section and row
        const w2SectionId = 'w2';
        // Assuming first row is wages. 
        // In a real app, we'd use the AI's 'relatedCell' or 'category' mapping.
        await handleCellUpdate(w2SectionId, 0, year, amount);

        // 2. Mark Checklist as Done
        // Find Checkist item for W-2
        // Assuming Checklist is Section 0 or specific ID 'checklist'
        // And Row 0 is "W-2".
        // Use 'checklist' section ID if it exists in data, else fallback logic.
        // For strictly demo purposes:
        // Attempt to find 'checklist' section and update the cell for 'year' (or boolean flag).
        // Since checklist implementation is visual, we might need to find the specific row.
        
        // 3. Close Agent, Open Activity
        setExtractedData(null);
        setActiveRightTab('activity');
        
        // Log Success
        console.log(`Imported ${amount} for ${year}`);
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
        setLegacyTaxData(prev => prev.map(section => {
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

        setLegacyTaxData(prev => prev.map(section => {
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

    const handleCellUpdate = async (sectionId, rowIndex, colKey, newValue) => {
        if (colKey === 'label') {
             // Handle Renaming Account (COA Update) - Needs new API method
             // For now, let's just focus on values
             console.log("Renaming account not fully wired to V2 yet");
             return;
        }

        // Optimistic UI Update
        const accountId = sections.find(s => s.id === sectionId).rows[rowIndex].id;
        const year = parseInt(colKey);
        const entryKey = `${accountId}-${year}`;

        setEntries(prev => ({
            ...prev,
            [entryKey]: newValue
        }));

        // Live Transactional Update
        setIsSaving(true);
        try {
            await updateTaxCell(accountId, year, newValue);
            setIsSaving(false);
        } catch (err) {
            console.error("Save failed", err);
            setIsSaving(false);
            // Revert optimism?
        }
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
        const cellIdFull = `${sectionId}-${rowIndex}-${colKey}`;
        setSelection({ type: 'cell', id: { sectionId, rowIndex, colKey } });

        // Check if there is a linked doc
        const link = cellLinks[cellIdFull];
        if (link) {
            setFilePreviewUrl(link.fileUrl);
            setShowFilePanel(true);
        } else {
            // Fallback: If no cell link, show the Tax Return for this year if available
            // colKey might be a year string/int via props
            const yearStr = colKey.toString();
            const yearReturn = yearReturns[yearStr];
            if (yearReturn) {
                 setFilePreviewUrl(yearReturn.fileUrl);
                 // Optional: Don't auto-open for year return if user closed panel, 
                 // but user asked "when clicked... I want file preview panel to load"
                 setShowFilePanel(true); 
            }
        }
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
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseMove = React.useCallback((e) => {
        if (!dragRef.current.active) return;
        const { type, id, startPos, startSize } = dragRef.current;
        
        if (type === 'filePanel') {
            const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
            const deltaPx = startPos - e.clientX; 
            const deltaPct = (deltaPx / containerWidth) * 100;
            const newPct = Math.min(80, Math.max(20, startSize + deltaPct));
            setFilePanelWidthPct(newPct);
            return;
        }

        if (type === 'rightPanel') {
            const delta = startPos - e.clientX;
            setRightPanelWidth(Math.max(250, Math.min(800, startSize + delta)));
            return;
        }

        const currentPos = type === 'col' ? e.clientX : e.clientY;
        const delta = currentPos - startPos;
        const newSize = Math.max(type === 'col' ? 50 : 30, startSize + delta);
        if (type === 'col') setColWidths(prev => ({ ...prev, [id]: newSize }));
        else setRowHeights(prev => ({ ...prev, [id]: newSize }));
    }, []);

    const handleMouseUp = React.useCallback(() => {
        if (dragRef.current.active) {
            dragRef.current.active = false;
            setIsDragging(false); // Disable overlay
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        }
    }, [handleMouseMove]);


    const startResize = (e, type, id) => {

        e.preventDefault();
        e.stopPropagation();
        let startSize;
        let startPos;

        if (type === 'filePanel') {
            startSize = filePanelWidthPct;
            startPos = e.clientX;
            document.body.style.cursor = 'col-resize';
        } else if (type === 'rightPanel') {
            startSize = rightPanelWidth;
            startPos = e.clientX;
            document.body.style.cursor = 'col-resize';
        } else if (type === 'col') {
            const width = colWidths[id] === 'auto' ? e.target.parentElement.getBoundingClientRect().width : colWidths[id];
            startSize = width;
            startPos = e.clientX;
            document.body.style.cursor = 'col-resize';
        } else {
            const height = rowHeights[id] || e.target.parentElement.getBoundingClientRect().height;
            startSize = height;
            startPos = e.clientY;
            document.body.style.cursor = 'row-resize';
        }

        dragRef.current = { active: true, type, id, startPos, startSize };
        setIsDragging(true); // Enable overlay/disable iframe
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = 'none';
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
    }, [handleMouseMove, handleMouseUp]);

    const getColStyle = (id) => {
        // Dynamic resizing when Split View is active to ensure visibility
        if (showFilePanel && viewMode === 'single') {
            if (id === 'label') return { width: '60%', minWidth: '60%', maxWidth: '60%' };
            if (id == focusedYear) return { width: '40%', minWidth: '40%', maxWidth: '40%' };
        }

        const width = colWidths[id];
        if (width === 'auto') {
            return { width: 'auto' };
        }
        return { 
            width: `${width}px`, 
            minWidth: `${width}px`, 
            maxWidth: `${width}px` 
        };
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

    // --- Row Numbering Calculation ---
    // Calculate continuous row numbering outside of JSX
    let rowCounter = 1; // Start at 1 (Header Row is 1)
    const headerRowNumber = rowCounter;
    
    // Determine which sections to use
    const sectionsToRender = coa.length > 0 ? sections : legacyTaxData;
    const rowMap = {};
    
    // Compute the map
    sectionsToRender.forEach(section => {
        if (section.title) {
            rowCounter++;
            rowMap[`section-${section.id}`] = rowCounter;
        }
        if (!collapsedSections[section.id]) {
            section.rows.forEach((_, idx) => {
                rowCounter++;
                rowMap[`row-${section.id}-${idx}`] = rowCounter;
            });
            if (['w2', 'rental'].includes(section.id)) {
                    rowCounter++;
                    rowMap[`spacer-${section.id}`] = rowCounter;
            }
        }
    });

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Hidden Inputs for File Loading */}
            <input type="file" ref={returnInputRef} className="hidden" accept=".pdf" onChange={handleReturnFileChange} />
            <input type="file" ref={supportingDocInputRef} className="hidden" accept=".pdf,.png,.jpg" onChange={handleSupportingDocChange} />
            <input type="file" ref={attachmentInputRef} className="hidden" accept=".pdf" onChange={handleAttachmentFileChange} />

            {/* Header / Actions - Modified to include Ribbon Toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="pl-12">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent">
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
            {/* --- Ribbon UI --- */}
            {isRibbonVisible && (
                <Ribbon 
                    className="mb-2"
                    defaultTab="file"
                    rightAction={(
                        <div className="flex items-center gap-2">
                             {viewMode === 'single' && (
                                <Button 
                                     variant="outline" 
                                     size="sm" 
                                     onClick={() => setSearchParams({})}
                                     className="h-8 text-xs flex items-center gap-1"
                                 >
                                     ← Back to Summary
                                 </Button>
                            )}
                             <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 onClick={populateCoa}
                                 title="Populate Default Accounts"
                                 className="h-8 w-8 p-0 text-slate-400 hover:text-brand-blue"
                             >
                                 <Sparkles className="size-4" />
                             </Button>
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
                    )}
                    tabs={[
                        {
                            id: 'file',
                            label: 'File',
                            content: (
                                <>
                                    <RibbonButton icon={Save} label="Save" />
                                    <RibbonButton icon={FileDown} label="Open Return" onClick={handleOpenReturn_Click} />
                                    <RibbonButton icon={Save} label="Save" />
                                    <RibbonButton icon={FileDown} label="Open Return" onClick={handleOpenReturn_Click} />
                                    <RibbonButton icon={Upload} label="Upload" onClick={() => fileInputRef.current?.click()} />
                                    <RibbonSeparator />
                                    <RibbonButton icon={Upload} label="Export" />
                                    <RibbonButton icon={Printer} label="Print" />
                                    <RibbonSeparator />
                                    <RibbonGroup>
                                        <RibbonButton icon={Bold} label="Bold" />
                                        <RibbonButton icon={Italic} label="Italic" />
                                    </RibbonGroup>
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
                                    <RibbonButton icon={Columns} label="Insert Column" onClick={handleAddYear} />
                                    <RibbonButton icon={Rows} label="Insert Row" onClick={handleAddRow} />
                                    <RibbonSeparator />
                                    <RibbonButton icon={Columns} label="Delete Column" onClick={handleDeleteCol} />
                                    <RibbonButton icon={Rows} label="Delete Row" onClick={handleDeleteRow} />
                                    <RibbonButton icon={Eraser} label="Clear All" />
                                </>
                            )
                        },
                        {
                            id: 'data',
                            label: 'Data',
                            content: (
                                <>
                                    <RibbonButton icon={Lock} label="Lock" onClick={() => toggleLock(true)} />
                                    <RibbonButton icon={LockOpen} label="Unlock" onClick={() => toggleLock(false)} />
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
                                const activeYear = focusedYear || years[0] || 2017;
                                const yearDocs = YEAR_DOCUMENTS[activeYear];
                                return (
                                    <>
                                        {/* View Selector */}
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
                                        <RibbonSeparator />

                                        {/* Consolidated Return - Prominent */}
                                        {yearDocs?.consolidated && (
                                            <button
                                                className="flex flex-col items-center justify-center px-3 h-16 rounded-md transition-all hover:bg-brand-blue/10 border border-brand-blue/30 bg-brand-blue/5 gap-1 min-w-[72px]"
                                                title={`Open ${activeYear} ${yearDocs.consolidated.label}`}
                                                onClick={() => {
                                                    setFilePreviewUrl(`${DOC_BASE}/${activeYear}/${yearDocs.consolidated.file}`);
                                                    setShowFilePanel(true);
                                                }}
                                            >
                                                <FileText className="size-5 text-brand-blue" />
                                                <span className="text-[10px] font-bold text-brand-blue leading-none">{activeYear} Return</span>
                                            </button>
                                        )}
                                        <RibbonSeparator />

                                        {/* Source Documents - Two Rows */}
                                        {yearDocs?.docs && (() => {
                                            const tracked = yearDocs.docs.filter(d => d.status === 'tracked');
                                            const rest = yearDocs.docs.filter(d => d.status !== 'tracked');
                                            const renderChip = (doc) => (
                                                <button
                                                    key={doc.id}
                                                    className={cn(
                                                        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border transition-all whitespace-nowrap",
                                                        doc.status === 'tracked'
                                                            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                                                            : doc.status === 'empty'
                                                            ? "bg-amber-50 dark:bg-amber-900/10 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                                                            : "bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30",
                                                        doc.file ? "cursor-pointer" : "cursor-pointer opacity-75"
                                                    )}
                                                    title={`${doc.label}${doc.file ? ` — Click to preview ${doc.file}` : ' — No file yet'}`}
                                                    onClick={() => {
                                                        if (doc.file) {
                                                            setFilePreviewUrl(`${DOC_BASE}/${activeYear}/${doc.file}`);
                                                            setShowFilePanel(true);
                                                        } else {
                                                            navigate(`/collaboration/finance/taxes/year?year=${activeYear}`);
                                                        }
                                                    }}
                                                >
                                                    <span className={cn(
                                                        "w-1.5 h-1.5 rounded-full shrink-0",
                                                        doc.status === 'tracked' ? "bg-emerald-500"
                                                            : doc.status === 'empty' ? "bg-amber-400"
                                                            : "bg-red-500"
                                                    )} />
                                                    {doc.short}
                                                </button>
                                            );
                                            return (
                                                <div className="flex flex-col gap-1 h-16 justify-center px-1">
                                                    {/* Top row: Tracked (green) */}
                                                    <div className="flex gap-1 items-center">
                                                        {tracked.map(renderChip)}
                                                    </div>
                                                    {/* Bottom row: Empty + Missing */}
                                                    <div className="flex gap-1 items-center overflow-x-auto">
                                                        {rest.map(renderChip)}
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Fallback when no docs for this year */}
                                        {!yearDocs && (
                                            <div className="flex items-center px-4 text-xs text-slate-400 italic">
                                                No documents indexed for {activeYear}
                                            </div>
                                        )}
                                    </>
                                );
                            })()
                        }
                    ]}
                />
            )}

            {/* Content Area: Table + Right Panel (Tabs) */}
            <div ref={containerRef} className="flex-1 flex items-start mt-2 min-h-0 overflow-hidden relative">
                {/* Main Spreadsheet View */}
                <div className="flex-1 flex h-full overflow-hidden mr-2">
                    {/* Main Spreadsheet View */}
                    <div 
                        className={cn(
                        "bg-white dark:bg-[#1a1a1a] border border-slate-300 dark:border-slate-700 shadow-sm overflow-auto select-none transition-all duration-75 h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
                        showFilePanel ? "hidden lg:block rounded-r-none border-r-0" : "flex-1 rounded-lg"
                        )}
                        style={{ 
                            width: showFilePanel ? `${100 - filePanelWidthPct}%` : '100%',
                            flex: showFilePanel ? 'none' : '1 1 0%'
                        }}
                    >
                        <table className="w-full border-collapse min-w-[600px] table-fixed">
                            <thead>
                                {/* Column Handles Row (A, B, C...) - Row 0 equivalent (unumbered) */}
                                <tr style={{ height: '20px', minHeight: '20px', maxHeight: '20px' }}>
                                    {/* Corner Cell */}
                                    <th className="w-[10px] min-w-[10px] max-w-[10px] h-5 min-h-[20px] max-h-[20px] bg-slate-100 dark:bg-slate-800 border-r border-b border-slate-300 dark:border-slate-700" style={{ width: '10px', minWidth: '10px', maxWidth: '10px', height: '20px', minHeight: '20px', maxHeight: '20px' }}></th>

                                    {/* Checkbox Column Handle (A) - NEW */}
                                    <th
                                        className={cn(
                                            "h-5 min-h-[20px] max-h-[20px] border-r border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[10px] text-slate-500 font-mono font-medium text-center relative group select-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 w-[40px]",
                                            isSelected('col', 'checkbox') && "bg-brand-blue/20 text-brand-blue font-bold"
                                        )}
                                        style={{ width: '40px', minWidth: '40px', maxWidth: '40px', height: '20px', minHeight: '20px', maxHeight: '20px' }}
                                        onClick={() => handleSelectCol('checkbox')}
                                    >
                                        A
                                    </th>

                                    {/* Attachment Column Handle (B) - NEW */}
                                    <th
                                        className={cn(
                                            "h-5 min-h-[20px] max-h-[20px] border-r border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[10px] text-slate-500 font-mono font-medium text-center relative group select-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 w-[40px]",
                                            isSelected('col', 'attachment') && "bg-brand-blue/20 text-brand-blue font-bold"
                                        )}
                                        style={{ width: '40px', minWidth: '40px', maxWidth: '40px', height: '20px', minHeight: '20px', maxHeight: '20px' }}
                                        onClick={() => handleSelectCol('attachment')}
                                    >
                                        B
                                    </th>

                                    {/* Label Column Handle (C) - was B */}
                                    <th
                                        className={cn(
                                            "h-5 min-h-[20px] max-h-[20px] border-r border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[10px] text-slate-500 font-mono font-medium text-center relative group select-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800",
                                            isSelected('col', 'label') && "bg-brand-blue/20 text-brand-blue font-bold"
                                        )}
                                        style={{ ...getColStyle('label'), height: '20px', minHeight: '20px', maxHeight: '20px' }}
                                        onClick={() => handleSelectCol('label')}
                                    >
                                        C
                                    </th>

                                    {/* Year Column Handles (D, E, F...) - was C, D, E... */}
                                    {visibleYears.map((year, i) => (
                                        <th
                                            key={`handle-${year}`}
                                            className={cn(
                                                "h-5 min-h-[20px] max-h-[20px] border-r border-b border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[10px] text-slate-500 font-mono font-medium text-center relative group select-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800",
                                                isSelected('col', year) && "bg-brand-blue/20 text-brand-blue font-bold"
                                            )}
                                            style={{ ...getColStyle(year), height: '20px', minHeight: '20px', maxHeight: '20px' }}
                                            onClick={() => handleSelectCol(year)}
                                        >
                                            {String.fromCharCode(68 + i)}
                                        </th>
                                    ))}
                                </tr>

                                {/* Data Headers (Label, Indexes) - Row 1 in Excel terms */}
                                <tr style={{ height: '32px', minHeight: '32px', maxHeight: '32px' }}>
                                    {/* Gutter Column Header - SHOW ROW 1 */}
                                    <th className="w-[10px] min-w-[10px] max-w-[10px] h-8 min-h-[32px] max-h-[32px] bg-slate-100 dark:bg-slate-800 border-r border-b border-slate-300 dark:border-slate-700 text-[10px] text-slate-400 font-normal font-mono" style={{ width: '10px', minWidth: '10px', maxWidth: '10px', height: '32px', minHeight: '32px', maxHeight: '32px' }}>
                                        {headerRowNumber}
                                    </th>

                                    {/* Checkbox Column Header - NEW */}
                                    <th
                                        className={cn(
                                            "p-0 border border-slate-300 dark:border-slate-600 bg-[#0f2a4a] text-white relative group box-border h-8 min-h-[32px] max-h-[32px] select-none text-center text-xs w-[40px]",
                                            isSelected('col', 'checkbox') && "ring-2 ring-inset ring-brand-aqua z-10"
                                        )}
                                        style={{ width: '40px', minWidth: '40px', maxWidth: '40px', height: '32px', minHeight: '32px', maxHeight: '32px' }}
                                    >
                                        <div className="flex items-center justify-center h-full w-full"><Check className="size-3" /></div>
                                    </th>

                                    {/* Attachment Column Header - NEW */}
                                    <th
                                        className={cn(
                                            "p-0 border border-slate-300 dark:border-slate-600 bg-[#0f2a4a] text-white relative group box-border h-8 min-h-[32px] max-h-[32px] select-none text-center text-xs w-[40px]",
                                            isSelected('col', 'attachment') && "ring-2 ring-inset ring-brand-aqua z-10"
                                        )}
                                        style={{ width: '40px', minWidth: '40px', maxWidth: '40px', height: '32px', minHeight: '32px', maxHeight: '32px' }}
                                    >
                                        <div className="flex items-center justify-center h-full w-full"><Paperclip className="size-3" /></div>
                                    </th>

                                    <th
                                        className={cn(
                                            "p-0 border border-slate-300 dark:border-slate-600 bg-[#0f2a4a] text-white relative group box-border h-8 min-h-[32px] max-h-[32px] select-none text-center text-xs",
                                            isSelected('col', 'label') && "ring-2 ring-inset ring-brand-aqua z-10"
                                        )}
                                        style={{ ...getColStyle('label'), height: '32px', minHeight: '32px', maxHeight: '32px' }}
                                    >
                                        <div className="flex items-center justify-center h-full w-full">Label</div>
                                    </th>
                                    {visibleYears.map(year => (
                                        <th
                                            key={year}
                                            className={cn(
                                                "p-1 border border-slate-300 dark:border-slate-600 bg-[#0f2a4a] text-white font-bold text-center relative group box-border h-8 min-h-[32px] max-h-[32px] cursor-default text-xs",
                                                isSelected('col', year) && "ring-2 ring-inset ring-brand-aqua z-10"
                                            )}
                                            style={{ ...getColStyle(year), height: '32px', minHeight: '32px', maxHeight: '32px' }}
                                        >
                                            <div className="flex items-center justify-center w-full h-full overflow-hidden gap-1">
                                                <span
                                                    className="hover:text-brand-aqua hover:underline cursor-pointer transition-colors"
                                                    onClick={() => navigate(`/collaboration/finance/taxes/year?year=${year}`)}
                                                    title="Click to view detailed 1040 breakdown"
                                                >
                                                    {year}
                                                </span>
                                                {yearReturns[year] && (
                                                    <FileText 
                                                        className="size-3 text-brand-aqua/80 hover:text-white cursor-pointer transition-colors" 
                                                        title={`View Return: ${yearReturns[year].fileName}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFilePreviewUrl(yearReturns[year].fileUrl);
                                                            setShowFilePanel(true);
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(coa.length > 0 ? sections : legacyTaxData).map((section) => (
                                    <React.Fragment key={section.id}>
                                        {section.title && (
                                            <tr>
                                                {/* Gutter for Section Header */}
                                                <td className="w-[10px] min-w-[10px] max-w-[10px] border-r border-b border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-[10px] text-center text-slate-400 font-mono" style={{ width: '10px', minWidth: '10px', maxWidth: '10px' }}>
                                                    {rowMap[`section-${section.id}`]}
                                                </td>

                                                {/* Empty Checkbox Cell for Section Header */}
                                                <td className="border border-slate-300 dark:border-slate-600 bg-[#0f2a4a] w-[40px]" style={{ width: '40px', minWidth: '40px', maxWidth: '40px' }}></td>

                                                {/* Empty Attachment Cell for Section Header */}
                                                <td className="border border-slate-300 dark:border-slate-600 bg-[#0f2a4a] w-[40px]" style={{ width: '40px', minWidth: '40px', maxWidth: '40px' }}></td>

                                                {/* SECTION HEADER - NOW CENTERED & COMPACT */}
                                                <td className="py-1 px-2 border border-slate-300 dark:border-slate-600 bg-[#0f2a4a] text-white font-bold text-center text-sm overflow-hidden truncate">
                                                    <div className="flex items-center justify-center gap-2 cursor-pointer hover:text-brand-aqua transition-colors" onClick={() => toggleSection(section.id)}>
                                                        {collapsedSections[section.id] ? (
                                                            <span className="text-[10px] px-1 border border-white/30 rounded">+</span>
                                                        ) : (
                                                            <span className="text-[10px] px-1 border border-white/30 rounded">-</span>
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
                                            const isChecklist = section.id === 'checklist' || row.isChecklist;

                                            return (
                                                <tr key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" style={{ height: h ? `${h}px` : 'auto' }}>
                                                    {/* Gutter Row Selection */}
                                                    <td
                                                        className={cn(
                                                            "w-[10px] min-w-[10px] max-w-[10px] text-[10px] text-center text-slate-400 font-mono bg-slate-50 dark:bg-slate-900 border-r border-b border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 select-none relative group",
                                                            isSelected('row', rowId) && "bg-brand-blue/20 text-brand-blue border-r-brand-blue font-bold"
                                                        )}
                                                        style={{ width: '10px', minWidth: '10px', maxWidth: '10px' }}
                                                        onClick={() => handleSelectRow(section.id, rowIndex)}
                                                    >
                                                        {rowMap[`row-${section.id}-${rowIndex}`]}
                                                    </td>

                                                    {/* FOR CHECKLIST: SWAP ORDER (Checkbox First, Then Text) */}
                                                    {/* FOR CHECKLIST: SINGLE CELL COLSPAN (Flex Layout) */}
                                                    {isChecklist ? (
                                                        <td
                                                            colSpan={visibleYears.length + 1}
                                                            className={cn(
                                                                "py-0.5 px-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1a1a1a] relative group align-middle box-border",
                                                                isSelected('cell', { sectionId: section.id, rowIndex, colKey: visibleYears[0] }) && "bg-brand-blue/10 ring-2 ring-inset ring-brand-blue z-10"
                                                            )}
                                                            onClick={() => handleSelectCell(section.id, rowIndex, visibleYears[0])}
                                                        >
                                                            <div className="flex items-center gap-3 w-full h-full">
                                                                {/* Checkbox */}
                                                                <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
                                                                    <EditableCell
                                                                        value={row.values[visibleYears[0]]}
                                                                        type="checkbox"
                                                                        onSave={(val) => handleCellUpdate(section.id, rowIndex, visibleYears[0], val)}
                                                                        className="justify-center w-6 h-6 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                                    />
                                                                </div>
                                                                {/* Label */}
                                                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                                                                    {row.label}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    ) : (
                                                        /* STANDARD RENDER: Checkbox First, Then Label, Then Values */
                                                        <>
                                                            {/* Checkbox Cell - NEW */}
                                                            <td
                                                                className={cn(
                                                                    "py-0.5 px-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1a1a1a] relative group align-middle box-border text-center w-[40px]",
                                                                    isSelected('cell', { sectionId: section.id, rowIndex, colKey: 'checkbox' }) && "bg-brand-blue/10 ring-2 ring-inset ring-brand-blue z-10"
                                                                )}
                                                                style={{ width: '40px', minWidth: '40px', maxWidth: '40px' }}
                                                                onClick={() => handleSelectCell(section.id, rowIndex, 'checkbox')}
                                                            >
                                                                <EditableCell
                                                                    value={row.values?.verified || 0}
                                                                    type="checkbox"
                                                                    onSave={(val) => handleCellUpdate(section.id, rowIndex, 'checkbox', val)}
                                                                    className="justify-center w-full h-full"
                                                                />
                                                            </td>

                                                            {/* Attachment Cell - Interactive */}
                                                            <td
                                                                className={cn(
                                                                    "py-0.5 px-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1a1a1a] relative group align-middle box-border text-center w-[40px] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                                                                    isSelected('cell', { sectionId: section.id, rowIndex, colKey: 'attachment' }) && "bg-brand-blue/10 ring-2 ring-inset ring-brand-blue z-10"
                                                                )}
                                                                style={{ width: '40px', minWidth: '40px', maxWidth: '40px' }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const rowId = `${section.id}-${rowIndex}`;
                                                                    const attachment = rowAttachments[rowId];
                                                                    if (attachment) {
                                                                        // If attachment exists, show it in preview
                                                                        setFilePreviewUrl(attachment.fileUrl);
                                                                        setShowFilePanel(true);
                                                                    } else {
                                                                        // If no attachment, open file picker
                                                                        handleAttachmentClick(section.id, rowIndex);
                                                                    }
                                                                }}
                                                            >
                                                                {(() => {
                                                                    const rowId = `${section.id}-${rowIndex}`;
                                                                    const hasAttachment = rowAttachments[rowId];
                                                                    return (
                                                                        <Paperclip 
                                                                            className={cn(
                                                                                "size-3 mx-auto transition-colors",
                                                                                hasAttachment 
                                                                                    ? "text-brand-blue hover:text-brand-aqua" 
                                                                                    : "text-slate-300 dark:text-slate-700 hover:text-slate-400 dark:hover:text-slate-600"
                                                                            )} 
                                                                            title={hasAttachment ? `View: ${hasAttachment.fileName}` : "Attach document"}
                                                                        />
                                                                    );
                                                                })()}
                                                            </td>

                                                            {/* Label Cell */}
                                                            <td
                                                                className={cn(
                                                                    "py-0.5 px-1 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 font-medium text-xs bg-white dark:bg-[#1a1a1a] relative group overflow-hidden align-middle box-border",
                                                                    isSelected('cell', { sectionId: section.id, rowIndex, colKey: 'label' }) && "bg-brand-blue/10 ring-2 ring-inset ring-brand-blue z-10"
                                                                )}
                                                                onClick={() => handleSelectCell(section.id, rowIndex, 'label')}
                                                            >
                                                                {/* ROW LABEL CELL - LEFT ALIGNED */}
                                                                <div className={cn("w-full h-full flex items-center pl-2", colWidths.label === 'auto' ? 'whitespace-nowrap' : 'truncate')}>
                                                                    <EditableCell
                                                                        value={row.label}
                                                                        isLocked={isCellLocked(section.id, rowIndex, 'label')}
                                                                        onSave={(val) => handleCellUpdate(section.id, rowIndex, 'label', val)}
                                                                    />
                                                                </div>
                                                                {(row.label.includes('W2 Wages') || row.label.includes('Child Education')) && (
                                                                    <span className="absolute top-0 right-0 border-t-[6px] border-r-[6px] border-t-red-500 border-r-transparent transform rotate-0 pointer-events-none" />
                                                                )}
                                                                {/* Row resize handle (bottom) */}
                                                                <div className="absolute bottom-0 left-0 right-0 h-1 md:h-1 cursor-row-resize hover:bg-brand-blue/50 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    onMouseDown={(e) => startResize(e, 'row', rowId)}
                                                                    onDoubleClick={() => handleDoubleClick('row', rowId)}
                                                                    onClick={e => e.stopPropagation()}
                                                                />
                                                                {/* Column resize handle (right edge) */}
                                                                <div className="absolute inset-y-0 right-0 w-2 cursor-col-resize hover:bg-brand-blue z-20 opacity-50 group-hover:opacity-100 transition-opacity bg-slate-300/30 dark:bg-slate-600/30"
                                                                    onMouseDown={(e) => startResize(e, 'col', 'label')}
                                                                    onDoubleClick={() => handleDoubleClick('col', 'label')}
                                                                    onClick={e => e.stopPropagation()}
                                                                />
                                                            </td>
                                                            {visibleYears.map(year => (
                                                                <td
                                                                    key={year}
                                                                    className={cn(
                                                                        "py-0.5 px-1 border border-slate-300 dark:border-slate-600 text-right text-slate-700 dark:text-slate-300 text-xs font-mono bg-white dark:bg-[#1a1a1a] whitespace-nowrap overflow-hidden align-middle box-border cursor-pointer relative group",
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
                                                                    {/* Column resize handle (right edge) */}
                                                                    <div className="absolute inset-y-0 right-0 w-2 cursor-col-resize hover:bg-brand-blue z-20 opacity-50 group-hover:opacity-100 transition-opacity bg-slate-300/30 dark:bg-slate-600/30"
                                                                        onMouseDown={(e) => startResize(e, 'col', year)}
                                                                        onDoubleClick={() => handleDoubleClick('col', year)}
                                                                        onClick={e => e.stopPropagation()}
                                                                    />
                                                                </td>
                                                            ))}
                                                        </>
                                                    )}
                                                </tr>
                                            );
                                        })}

                                        {['w2', 'rental'].includes(section.id) && !collapsedSections[section.id] && (
                                            <tr>
                                                <td className="w-[10px] min-w-[10px] max-w-[10px] border-r border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-[10px] text-center text-slate-400 font-mono" style={{ width: '10px', minWidth: '10px', maxWidth: '10px' }}>
                                                    {rowMap[`spacer-${section.id}`]}
                                                </td>
                                                <td colSpan={visibleYears.length + 3} className="h-6 border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1a1a1a]"></td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* R2 Pane: File View (Resizable) */}
                    {showFilePanel && (
                        <div 
                            className="bg-white dark:bg-[#1a1a1a] border border-slate-300 dark:border-slate-700 h-full rounded-r-lg shadow-sm flex flex-col shrink-0 border-l-0 relative"
                            style={{ width: `${filePanelWidthPct}%` }}
                        >
                            {/* Resize Handle */}
                            <div 
                                className="absolute left-0 top-0 bottom-0 w-2 -ml-1 cursor-col-resize hover:bg-brand-blue/50 z-50 transition-colors bg-transparent"
                                onMouseDown={(e) => startResize(e, 'filePanel')}
                            />
                            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <FileDown className="size-4" />
                                    File Preview
                                </h3>
                                <div className="flex items-center gap-2">
                                    {filePreviewUrl && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="h-8 bg-brand-blue hover:bg-brand-blue/90 text-white shadow-sm flex items-center gap-2 px-3 transition-all"
                                            onClick={handleRunExtraction}
                                            title="Extract data from this document to the spreadsheet"
                                        >
                                            <Sparkles className="size-3.5" />
                                            <span className="hidden sm:inline">Run Extraction</span>
                                        </Button>
                                    )}
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" 
                                        onClick={() => {
                                            setShowFilePanel(false);
                                            setFilePreviewUrl(null);
                                            setExtractedText(null);
                                        }}
                                    >
                                        <X className="size-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 overflow-hidden relative">
                                {filePreviewUrl ? (
                                    <iframe
                                        src={filePreviewUrl}
                                        className={cn("w-full h-full border rounded bg-white", isDragging && "pointer-events-none select-none")}
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
                </div>

                {/* Right Tabbed Panel System (R1) */}
                <div className="h-full shrink-0 flex">
                    {/* Content Panel (Slide Out) */}
                    {activeRightTab && (
                        <div 
                            className="absolute top-0 bottom-0 right-10 z-50 lg:static lg:z-auto lg:h-full bg-white dark:bg-[#1a1a1a] border border-slate-300 dark:border-slate-700 border-r-0 rounded-l-lg shadow-2xl lg:shadow-sm flex flex-col relative"
                            style={{ width: `${rightPanelWidth}px` }}
                        >
                             {/* Resize Handle */}
                             <div 
                                className="absolute left-0 top-0 bottom-0 w-2 -ml-1 cursor-col-resize hover:bg-brand-blue/50 z-50 transition-colors bg-transparent"
                                onMouseDown={(e) => startResize(e, 'rightPanel')}
                            />
                            {/* Header per Tab */}
                            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-tl-lg">
                                <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    {activeRightTab === 'chat' && <><MessageSquare className="size-4 text-brand-blue" /> Team Chat </>}
                                    {activeRightTab === 'agent' && (
                                        <div className={cn("flex items-center gap-2",
                                            agentStatus.error ? "text-destructive" : (agentStatus.isLoading ? "text-amber-600" : "text-emerald-600")
                                        )}>
                                            <Bot className="size-4" />
                                            AI Agent
                                            <span className="text-[10px] uppercase font-mono bg-black/5 dark:bg-white/10 px-1 rounded ml-1">
                                                {agentStatus.error ? 'Offline' : (agentStatus.isLoading ? 'Working' : 'Ready')}
                                            </span>
                                        </div>
                                    )}
                                    {activeRightTab === 'activity' && <><Activity className="size-4 text-green-500" /> Activity Log </>}
                                </h3>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setActiveRightTab(null)}>
                                    <X className="size-3" />
                                </Button>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-hidden relative">
                                {activeRightTab === 'chat' && <WorkspaceChat />}
                                {activeRightTab === 'agent' && (
                                    <div className="flex flex-col h-full">
                                        <OllamaChatPanel
                                            trigger={agentTrigger}
                                            contextData={{
                                                text: extractedText,
                                                calculator: () => {
                                                    const currentData = coa.length > 0 ? sections : legacyTaxData;
                                                    let globalRowCounter = 2; // Start after headers
                                                    
                                                    // Build row maps for context
                                                    const rowMap = {};
                                                    const codeRowMap = {};
                                                    const availableCodes = [];
                                                    
                                                    currentData.forEach(section => {
                                                        if(section.title) globalRowCounter++; // Header
                                                        section.rows.forEach(row => {
                                                            globalRowCounter++;
                                                            rowMap[row.label] = globalRowCounter;
                                                            if (row.code) {
                                                                codeRowMap[row.code] = globalRowCounter;
                                                                availableCodes.push({ code: row.code, description: row.label });
                                                            }
                                                        });
                                                    });
                                                    
                                                    const targetYearProp = (viewMode === 'single' && focusedYear) ? focusedYear : Math.max(...years);
                                                    const colIndex = visibleYears.indexOf(Number(targetYearProp));
                                                
                                                    const colLetter = colIndex >= 0 ? String.fromCharCode(66 + colIndex) : 'B';
                                                    
                                                    return { rows: currentData.length, rowMap, codeRowMap, availableCodes, colLetter, targetYear: targetYearProp };
                                                }
                                            }}
                                            onStatusChange={setAgentStatus}
                                        />
                                        {/* Draft Import Card (Mock) */}
                                        {extractedData && (
                                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                                <div className="bg-white dark:bg-slate-800 border border-brand-blue/30 rounded p-3 shadow-sm">
                                                    <h4 className="text-xs font-bold text-brand-blue uppercase mb-2 flex items-center gap-1">
                                                        <Sparkles className="size-3" /> Extraction Result
                                                    </h4>
                                                    <div className="text-sm space-y-1 mb-3">
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-500">Amount:</span>
                                                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatCurrency(extractedData.amount)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-500">Year:</span>
                                                            <span>{extractedData.year}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-500">Category:</span>
                                                            <span className="truncate max-w-[150px]">{extractedData.category}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs"
                                                            onClick={confirmImport}
                                                        >
                                                            Confirm Import
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="w-full h-7 text-xs"
                                                            onClick={() => setExtractedData(null)}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {activeRightTab === 'activity' && (
                                    <div className="h-full bg-white dark:bg-[#1a1a1a] p-3 text-sm text-slate-500">
                                        Activity log content placeholder...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Edge Tab Strip */}
                <div className={cn(
                    "w-10 h-full flex flex-col items-center py-4 gap-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-r-lg",
                    activeRightTab ? "rounded-none border-l-0" : "rounded-l-lg"
                )}>

                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-8 w-8 rounded-full", activeRightTab === 'chat' ? "bg-white dark:bg-slate-800 shadow-sm text-brand-blue" : "text-slate-500")}
                        onClick={() => setActiveRightTab(activeRightTab === 'chat' ? null : 'chat')}
                        title="Team Chat"
                    >
                        <MessageSquare className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-8 w-8 rounded-full", activeRightTab === 'agent' ? "bg-white dark:bg-slate-800 shadow-sm text-purple-600" : "text-slate-500")}
                        onClick={() => setActiveRightTab(activeRightTab === 'agent' ? null : 'agent')}
                        title="AI Agent"
                    >
                        <Bot className="size-4" />
                    </Button>
                    {/* File Pane Button (Toggles R2, distinct from R1) */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-8 w-8 rounded-full", showFilePanel ? "bg-white dark:bg-slate-800 shadow-sm text-brand-blue" : "text-slate-500")}
                        onClick={() => setShowFilePanel(!showFilePanel)}
                        title="File Pane (50%)"
                    >
                        <FileDown className="size-4" />
                    </Button>

                    <Separator className="w-4" />

                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-8 w-8 rounded-full", activeRightTab === 'activity' ? "bg-white dark:bg-slate-800 shadow-sm text-brand-blue" : "text-slate-500")}
                        onClick={() => setActiveRightTab(activeRightTab === 'activity' ? null : 'activity')}
                        title="Activity Log"
                    >
                        <Activity className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Hidden File Input for Ribbon Trigger */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
            />
        </div>
    );
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("TaxMultiYearSummary Error Boundary Caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded m-4">
                    <h2 className="text-lg font-bold mb-2">Something went wrong in TaxMultiYearSummary</h2>
                    <details className="whitespace-pre-wrap font-mono text-xs">
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                </div>
            );
        }
        return this.props.children;
    }
}

const TaxMultiYearSummaryWithBoundary = (props) => (
    <ErrorBoundary>
        <TaxMultiYearSummary {...props} />
    </ErrorBoundary>
);

export default TaxMultiYearSummaryWithBoundary;
