import React from 'react';
import { cn } from '@/shared/lib/utils';
import {
    Save, FileDown, Upload, Printer, Bold, Italic,
    AlignLeft, AlignCenter, AlignRight,
    Columns, Rows, Eraser,
    Lock, LockOpen, Filter, Undo, Redo,
    FileText, ChevronLeft
} from 'lucide-react';
import { Ribbon, RibbonButton, RibbonSeparator, RibbonGroup } from 'synolic.core';

// ── Document Index by Year ──
const DOC_BASE = '/src/data/Documents - Taxes';

const YEAR_DOCUMENTS = {
    2017: {
        consolidated: { label: 'Form 1040', file: 'Nath2017Form1040.pdf' },
        docs: [
            { id: 'w2',       short: 'W-2',       label: 'W-2 from employer',               status: 'tracked', file: '2017 W2.pdf' },
            { id: '1099nec',  short: '1099-NEC',   label: '1099-NEC (CloudBaud consulting)',  status: 'empty',   file: '1099-MISC.pdf' },
            { id: '1099b',    short: '1099-B',     label: '1099-B (stock/brokerage)',         status: 'empty',   file: '2017-Fidelity-7692-Consolidated-Form-1099.pdf' },
            { id: '1099int',  short: '1099-INT',   label: '1099-INT/DIV (bank interest)',     status: 'empty',   file: null },
            { id: '1099r',    short: '1099-R',     label: '1099-R (retirement distributions)',status: 'tracked', file: null },
            { id: 'schc',     short: 'Sched C',    label: 'Schedule C P&L (business)',        status: 'missing', file: '2017 bizex CloudBaud Updated.xlsx' },
            { id: '1098',     short: '1098',       label: '1098 (mortgage interest)',         status: 'tracked', file: '2017_1098_Mortgage Interest.pdf' },
            { id: 'proptax',  short: 'Prop Tax',   label: 'Property tax statements',         status: 'tracked', file: null },
            { id: 'contr',    short: '1099s Out',  label: 'Contractor 1099s issued (>$600)',  status: 'empty',   file: null },
            { id: 'ira',      short: 'IRA/SEP',    label: 'Roth/SEP IRA contributions',      status: 'tracked', file: '2017-SEP-IRA-OLD-5224-Form-5498.pdf' },
            { id: 'estpay',   short: 'Est. Pmts',  label: 'Estimated tax payment records',   status: 'missing', file: null },
            { id: 'homeoff',  short: 'Home Ofc',   label: 'Home office expenses',            status: 'empty',   file: null },
            { id: 'miles',    short: 'Mileage',    label: 'Vehicle mileage log',             status: 'empty',   file: null },
            { id: 'health',   short: 'Health Ins',  label: 'Health insurance premiums',       status: 'missing', file: 'Form 1095-B.pdf' },
            { id: 'charity',  short: 'Charity',    label: 'Charitable donations',            status: 'missing', file: 'Charity Salvation Army.pdf' },
            { id: 'rental',   short: 'Rental',     label: 'Rental income/expenses',          status: 'empty',   file: null },
        ]
    },
    2018: {
        consolidated: { label: 'Tax Items', file: '2018 Consolidated Tax Items Jishnu & Deepika Nath.xlsx' },
        docs: [
            { id: 'w2',       short: 'W-2',       label: 'W-2 from employer',               status: 'tracked', file: '2018 W2.pdf' },
            { id: '1099nec',  short: '1099-NEC',   label: '1099-NEC (Operations)',            status: 'tracked', file: '2018-Operations-9414-Consolidated-Form-1099.pdf' },
            { id: '1099b',    short: '1099-B',     label: '1099-B (Woodridge)',              status: 'tracked', file: '2018-Woodridge-7692-Consolidated-Form-1099.pdf' },
            { id: '1099int',  short: '1099-INT',   label: '1099-INT/DIV (bank interest)',     status: 'empty',   file: null },
            { id: '1099r',    short: '1099-R',     label: '1099-R (retirement distributions)',status: 'tracked', file: '2018-SEP-IRA-OLD-5224-Form-1099-R-.pdf' },
            { id: 'schc',     short: 'Sched C',    label: 'Schedule C P&L (business expenses)',status: 'tracked', file: 'business expenses CloudBaud 2018.xlsx' },
            { id: '1098',     short: '1098',       label: '1098 (mortgage interest)',         status: 'tracked', file: 'Mortgage.pdf' },
            { id: 'proptax',  short: 'Prop Tax',   label: 'Property tax statements',         status: 'tracked', file: 'Condo real estate taxes.docx' },
            { id: 'contr',    short: '1099s Out',  label: 'Contractor 1099s issued (>$600)',  status: 'empty',   file: null },
            { id: 'ira',      short: 'IRA/SEP',    label: 'Roth/SEP IRA contributions',      status: 'tracked', file: 'WA529GenerateStatementPDF.pdf' },
            { id: 'estpay',   short: 'Est. Pmts',  label: 'Estimated tax payment records',   status: 'empty',   file: null },
            { id: 'homeoff',  short: 'Home Ofc',   label: 'Home office expenses',            status: 'empty',   file: null },
            { id: 'miles',    short: 'Mileage',    label: 'Vehicle mileage log',             status: 'empty',   file: null },
            { id: 'health',   short: 'Health Ins',  label: 'Health insurance premiums',       status: 'empty',   file: null },
            { id: 'charity',  short: 'Charity',    label: 'Charitable donations',            status: 'empty',   file: null },
            { id: 'rental',   short: 'Rental',     label: 'Rental income/expenses',          status: 'empty',   file: null },
        ]
    },
    2019: {
        consolidated: { label: 'Tax Items', file: '2019 Consolidated Tax Items Jishnu & Deepika Nath.xlsx' },
        docs: [
            { id: 'w2',       short: 'W-2',       label: 'W-2 from employer',               status: 'tracked', file: '2019 W2.pdf' },
            { id: '1099nec',  short: '1099-NEC',   label: '1099-NEC (Consulting)',            status: 'empty',   file: null },
            { id: '1099b',    short: '1099-B',     label: '1099-B (Fidelity)',               status: 'tracked', file: '2019-Fidelity-9414-Consolidated-Form-1099.pdf' },
            { id: '1099int',  short: '1099-INT',   label: '1099-INT/DIV (bank interest)',     status: 'tracked', file: '2019-Fidelity-7692-Consolidated-Form-1099.pdf' },
            { id: '1099r',    short: '1099-R',     label: '1099-R (retirement distributions)',status: 'empty',   file: null },
            { id: 'schc',     short: 'Sched C',    label: 'Schedule C P&L (business)',        status: 'empty',   file: null },
            { id: '1098',     short: '1098',       label: '1098 (mortgage interest)',         status: 'tracked', file: 'Mortgage_1098.pdf' },
            { id: 'proptax',  short: 'Prop Tax',   label: 'Property tax statements',         status: 'empty',   file: null },
            { id: 'contr',    short: '1099s Out',  label: 'Contractor 1099s issued (>$600)',  status: 'empty',   file: null },
            { id: 'ira',      short: 'IRA/SEP',    label: 'Roth/SEP IRA contributions',      status: 'tracked', file: '2019-SEP IRA-3704-Form-5498.pdf' },
            { id: 'estpay',   short: 'Est. Pmts',  label: 'Estimated tax payment records',   status: 'empty',   file: null },
            { id: 'homeoff',  short: 'Home Ofc',   label: 'Home office expenses',            status: 'empty',   file: null },
            { id: 'miles',    short: 'Mileage',    label: 'Vehicle mileage log',             status: 'empty',   file: null },
            { id: 'health',   short: 'Health Ins',  label: 'Health insurance premiums',       status: 'tracked', file: 'WA529GenerateStatementPDF.pdf' },
            { id: 'charity',  short: 'Charity',    label: 'Charitable donations',            status: 'empty',   file: null },
            { id: 'rental',   short: 'Rental',     label: 'Rental income/expenses',          status: 'tracked', file: 'CherryCrest_1099_2019.pdf' },
        ]
    },
    2020: {
        consolidated: { label: 'Tax Items', file: '2020 Consolidated Tax Items Jishnu & Deepika Nath.xlsx' },
        docs: [
            { id: 'w2',       short: 'W-2',       label: 'W-2 from employer',               status: 'empty',   file: null },
            { id: '1099nec',  short: '1099-NEC',   label: '1099-NEC (Consulting)',            status: 'empty',   file: null },
            { id: '1099b',    short: '1099-B',     label: '1099-B (stock/brokerage)',         status: 'empty',   file: null },
            { id: '1099int',  short: '1099-INT',   label: '1099-INT/DIV (bank interest)',     status: 'empty',   file: null },
            { id: '1099r',    short: '1099-R',     label: '1099-R (retirement distributions)',status: 'empty',   file: null },
            { id: 'schc',     short: 'Sched C',    label: 'Schedule C P&L (business expenses)',status: 'tracked', file: 'business expenses CloudBaud 2020.xlsx' },
            { id: '1098',     short: '1098',       label: '1098 (mortgage interest)',         status: 'tracked', file: 'Mortgage.pdf' },
            { id: 'proptax',  short: 'Prop Tax',   label: 'Property tax statements',         status: 'tracked', file: 'Condo real estate tax.docx' },
            { id: 'contr',    short: '1099s Out',  label: 'Contractor 1099s issued (>$600)',  status: 'empty',   file: null },
            { id: 'ira',      short: 'IRA/SEP',    label: 'Roth/SEP IRA contributions',      status: 'empty',   file: null },
            { id: 'estpay',   short: 'Est. Pmts',  label: 'Estimated tax payment records',   status: 'empty',   file: null },
            { id: 'homeoff',  short: 'Home Ofc',   label: 'Home office expenses',            status: 'empty',   file: null },
            { id: 'miles',    short: 'Mileage',    label: 'Vehicle mileage log',             status: 'empty',   file: null },
            { id: 'health',   short: 'Health Ins',  label: 'Health insurance premiums',       status: 'empty',   file: null },
            { id: 'charity',  short: 'Charity',    label: 'Charitable donations',            status: 'empty',   file: null },
            { id: 'rental',   short: 'Rental',     label: 'Rental income/expenses',          status: 'tracked', file: 'CherryCrest_1099_2020.pdf' },
        ]
    },
    2021: {
        docs: [
            { id: 'w2',       short: 'W-2',       label: 'W-2 from employer',               status: 'empty',   file: null },
            { id: '1099nec',  short: '1099-NEC',   label: '1099-NEC (Consulting)',            status: 'empty',   file: null },
            { id: '1099b',    short: '1099-B',     label: '1099-B (stock/brokerage)',         status: 'empty',   file: null },
            { id: '1099int',  short: '1099-INT',   label: '1099-INT/DIV (bank interest)',     status: 'empty',   file: null },
            { id: '1099r',    short: '1099-R',     label: '1099-R (retirement distributions)',status: 'empty',   file: null },
            { id: 'schc',     short: 'Sched C',    label: 'Schedule C P&L (business expenses)',status: 'tracked', file: 'business expenses CloudBaud 2021.xlsx' },
            { id: '1098',     short: '1098',       label: '1098 (mortgage interest)',         status: 'tracked', file: 'GetDocument.pdf' },
            { id: 'proptax',  short: 'Prop Tax',   label: 'Property tax statements',         status: 'empty',   file: null },
            { id: 'contr',    short: '1099s Out',  label: 'Contractor 1099s issued (>$600)',  status: 'empty',   file: null },
            { id: 'ira',      short: 'IRA/SEP',    label: 'Roth/SEP IRA contributions',      status: 'empty',   file: null },
            { id: 'estpay',   short: 'Est. Pmts',  label: 'Estimated tax payment records',   status: 'empty',   file: null },
            { id: 'homeoff',  short: 'Home Ofc',   label: 'Home office expenses',            status: 'empty',   file: null },
            { id: 'miles',    short: 'Mileage',    label: 'Vehicle mileage log',             status: 'empty',   file: null },
            { id: 'health',   short: 'Health Ins',  label: 'Health insurance premiums',       status: 'empty',   file: null },
            { id: 'charity',  short: 'Charity',    label: 'Charitable donations',            status: 'empty',   file: null },
            { id: 'rental',   short: 'Rental',     label: 'Rental income/expenses',          status: 'tracked', file: 'CherryCrest_1099_2021.pdf' },
        ]
    },
    2022: {
        docs: [
            { id: 'w2',       short: 'W-2',       label: 'W-2 from employer',               status: 'tracked', file: 'Deepika W2 2022.pdf' },
            { id: '1099nec',  short: '1099-NEC',   label: '1099-NEC (Consulting)',            status: 'empty',   file: null },
            { id: '1099b',    short: '1099-B',     label: '1099-B (stock/brokerage)',         status: 'empty',   file: null },
            { id: '1099int',  short: '1099-INT',   label: '1099-INT/DIV (bank interest)',     status: 'empty',   file: null },
            { id: '1099r',    short: '1099-R',     label: '1099-R (retirement distributions)',status: 'empty',   file: null },
            { id: 'schc',     short: 'Sched C',    label: 'Schedule C P&L (business)',        status: 'empty',   file: null },
            { id: '1098',     short: '1098',       label: '1098 (mortgage interest)',         status: 'empty',   file: null },
            { id: 'proptax',  short: 'Prop Tax',   label: 'Property tax statements',         status: 'empty',   file: null },
            { id: 'contr',    short: '1099s Out',  label: 'Contractor 1099s issued (>$600)',  status: 'empty',   file: null },
            { id: 'ira',      short: 'IRA/SEP',    label: 'Roth/SEP IRA contributions',      status: 'empty',   file: null },
            { id: 'estpay',   short: 'Est. Pmts',  label: 'Estimated tax payment records',   status: 'empty',   file: null },
            { id: 'homeoff',  short: 'Home Ofc',   label: 'Home office expenses',            status: 'empty',   file: null },
            { id: 'miles',    short: 'Mileage',    label: 'Vehicle mileage log',             status: 'empty',   file: null },
            { id: 'health',   short: 'Health Ins',  label: 'Health insurance premiums',       status: 'empty',   file: null },
            { id: 'charity',  short: 'Charity',    label: 'Charitable donations',            status: 'empty',   file: null },
            { id: 'rental',   short: 'Rental',     label: 'Rental income/expenses',          status: 'empty',   file: null },
        ]
    },
    2023: {
        docs: [
            { id: 'w2',       short: 'W-2',       label: 'W-2 from employer',               status: 'tracked', file: 'Deepika W2 2023.pdf' },
            { id: '1099nec',  short: '1099-NEC',   label: '1099-NEC (Consulting)',            status: 'empty',   file: null },
            { id: '1099b',    short: '1099-B',     label: '1099-B (stock/brokerage)',         status: 'empty',   file: null },
            { id: '1099int',  short: '1099-INT',   label: '1099-INT/DIV (bank interest)',     status: 'empty',   file: null },
            { id: '1099r',    short: '1099-R',     label: '1099-R (retirement distributions)',status: 'empty',   file: null },
            { id: 'schc',     short: 'Sched C',    label: 'Schedule C P&L (business)',        status: 'empty',   file: null },
            { id: '1098',     short: '1098',       label: '1098 (mortgage interest)',         status: 'empty',   file: null },
            { id: 'proptax',  short: 'Prop Tax',   label: 'Property tax statements',         status: 'empty',   file: null },
            { id: 'contr',    short: '1099s Out',  label: 'Contractor 1099s issued (>$600)',  status: 'empty',   file: null },
            { id: 'ira',      short: 'IRA/SEP',    label: 'Roth/SEP IRA contributions',      status: 'empty',   file: null },
            { id: 'estpay',   short: 'Est. Pmts',  label: 'Estimated tax payment records',   status: 'empty',   file: null },
            { id: 'homeoff',  short: 'Home Ofc',   label: 'Home office expenses',            status: 'empty',   file: null },
            { id: 'miles',    short: 'Mileage',    label: 'Vehicle mileage log',             status: 'empty',   file: null },
            { id: 'health',   short: 'Health Ins',  label: 'Health insurance premiums',       status: 'tracked', file: 'NRI_Essentials_2023072100482718_AnnualReport_PaymentReceipt.pdf' },
            { id: 'charity',  short: 'Charity',    label: 'Charitable donations',            status: 'empty',   file: null },
            { id: 'rental',   short: 'Rental',     label: 'Rental income/expenses',          status: 'empty',   file: null },
        ]
    },
    2024: {
        docs: [
            { id: 'w2',       short: 'W-2',       label: 'W-2 from employer',               status: 'tracked', file: 'Dolly W2 2024.pdf' },
            { id: '1099nec',  short: '1099-NEC',   label: '1099-NEC (Consulting)',            status: 'tracked', file: 'Sankara Jish Nath 1099 Year 24.docx' },
            { id: '1099b',    short: '1099-B',     label: '1099-B (stock/brokerage)',         status: 'empty',   file: null },
            { id: '1099int',  short: '1099-INT',   label: '1099-INT/DIV (bank interest)',     status: 'empty',   file: null },
            { id: '1099r',    short: '1099-R',     label: '1099-R (retirement distributions)',status: 'empty',   file: null },
            { id: 'schc',     short: 'Sched C',    label: 'Schedule C P&L (business)',        status: 'empty',   file: null },
            { id: '1098',     short: '1098',       label: '1098 (mortgage interest)',         status: 'empty',   file: null },
            { id: 'proptax',  short: 'Prop Tax',   label: 'Property tax statements',         status: 'empty',   file: null },
            { id: 'contr',    short: '1099s Out',  label: 'Contractor 1099s issued (>$600)',  status: 'empty',   file: null },
            { id: 'ira',      short: 'IRA/SEP',    label: 'Roth/SEP IRA contributions',      status: 'empty',   file: null },
            { id: 'estpay',   short: 'Est. Pmts',  label: 'Estimated tax payment records',   status: 'empty',   file: null },
            { id: 'homeoff',  short: 'Home Ofc',   label: 'Home office expenses',            status: 'empty',   file: null },
            { id: 'miles',    short: 'Mileage',    label: 'Vehicle mileage log',             status: 'empty',   file: null },
            { id: 'health',   short: 'Health Ins',  label: 'Health insurance premiums',       status: 'empty',   file: null },
            { id: 'charity',  short: 'Charity',    label: 'Charitable donations',            status: 'empty',   file: null },
            { id: 'rental',   short: 'Rental',     label: 'Rental income/expenses',          status: 'empty',   file: null },
        ]
    },
    2025: {
        docs: [
            { id: 'w2',       short: 'W-2',       label: 'W-2 from employer',               status: 'empty',   file: null },
            { id: '1099nec',  short: '1099-NEC',   label: '1099-NEC (Consulting)',            status: 'empty',   file: null },
            { id: '1099b',    short: '1099-B',     label: '1099-B (stock/brokerage)',         status: 'empty',   file: null },
            { id: '1099int',  short: '1099-INT',   label: '1099-INT/DIV (bank interest)',     status: 'empty',   file: null },
            { id: '1099r',    short: '1099-R',     label: '1099-R (retirement distributions)',status: 'empty',   file: null },
            { id: 'schc',     short: 'Sched C',    label: 'Schedule C P&L (Columbia Stmts)',  status: 'tracked', file: 'Columbia Statements/PDFs/4386-Could Baud, LLC-20251231.pdf' },
            { id: '1098',     short: '1098',       label: '1098 (mortgage interest)',         status: 'empty',   file: null },
            { id: 'proptax',  short: 'Prop Tax',   label: 'Property tax statements',         status: 'empty',   file: null },
            { id: 'contr',    short: '1099s Out',  label: 'Contractor 1099s issued (>$600)',  status: 'empty',   file: null },
            { id: 'ira',      short: 'IRA/SEP',    label: 'Roth/SEP IRA contributions',      status: 'empty',   file: null },
            { id: 'estpay',   short: 'Est. Pmts',  label: 'Estimated tax payment records',   status: 'empty',   file: null },
            { id: 'homeoff',  short: 'Home Ofc',   label: 'Home office expenses',            status: 'empty',   file: null },
            { id: 'miles',    short: 'Mileage',    label: 'Vehicle mileage log',             status: 'empty',   file: null },
            { id: 'health',   short: 'Health Ins',  label: 'Health insurance premiums',       status: 'empty',   file: null },
            { id: 'charity',  short: 'Charity',    label: 'Charitable donations',            status: 'empty',   file: null },
            { id: 'rental',   short: 'Rental',     label: 'Rental income/expenses',          status: 'empty',   file: null },
        ]
    }
};

export { DOC_BASE, YEAR_DOCUMENTS };

/**
 * Shared Tax Ribbon — used by both Summary grid and Yearly drill-down.
 * 
 * Props:
 *   activeYear       - currently selected year (number)
 *   years            - array of all available years
 *   viewMode         - 'summary' | 'year'
 *   onYearChange     - (yearOrSummary: string) => void
 *   onDocPreview     - (filePath: string) => void  — opens a doc in the preview panel
 *   onNavigateYear   - (year: number) => void      — navigates to year detail view
 *   onBack           - () => void                   — back button (only shown in year view)
 *   rightAction      - ReactNode                    — right-side content (e.g. autosave indicator)
 *   
 *   // File tab callbacks
 *   onSave           - () => void
 *   onOpenReturn     - () => void
 *   onUpload         - () => void
 *   
 *   // Table tab callbacks
 *   onAddYear        - () => void
 *   onAddRow         - () => void
 *   onDeleteCol      - () => void
 *   onDeleteRow      - () => void
 *   
 *   // Data tab callbacks
 *   onLock           - () => void
 *   onUnlock         - () => void
 */
const TaxRibbon = ({
    activeYear = 2017,
    years = [],
    viewMode = 'summary',
    onYearChange,
    onDocPreview,
    onNavigateYear,
    onBack,
    rightAction,
    // File
    onSave,
    onOpenReturn,
    onUpload,
    // Table
    onAddYear,
    onAddRow,
    onDeleteCol,
    onDeleteRow,
    // Data
    onLock,
    onUnlock,
}) => {
    const yearDocs = YEAR_DOCUMENTS[activeYear];

    // ── Render a document status chip ──
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
                    onDocPreview?.(`${DOC_BASE}/${activeYear}/${doc.file}`);
                } else {
                    onNavigateYear?.(activeYear);
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

    const tracked = yearDocs?.docs?.filter(d => d.status === 'tracked') || [];
    const rest = yearDocs?.docs?.filter(d => d.status !== 'tracked') || [];

    return (
        <Ribbon
            rightAction={rightAction}
            tabs={[
                {
                    id: 'file',
                    label: 'File',
                    content: (
                        <>
                            {viewMode === 'year' && onBack && (
                                <>
                                    <RibbonButton icon={ChevronLeft} label="Back" onClick={onBack} />
                                    <RibbonSeparator />
                                </>
                            )}
                            <RibbonButton icon={Save} label="Save" onClick={onSave} />
                            <RibbonButton icon={FileDown} label="Open Return" onClick={onOpenReturn} />
                            <RibbonButton icon={Upload} label="Upload" onClick={onUpload} />
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
                            <RibbonButton icon={Columns} label="Insert Column" onClick={onAddYear} />
                            <RibbonButton icon={Rows} label="Insert Row" onClick={onAddRow} />
                            <RibbonSeparator />
                            <RibbonButton icon={Columns} label="Delete Column" onClick={onDeleteCol} />
                            <RibbonButton icon={Rows} label="Delete Row" onClick={onDeleteRow} />
                            <RibbonButton icon={Eraser} label="Clear All" />
                        </>
                    )
                },
                {
                    id: 'data',
                    label: 'Data',
                    content: (
                        <>
                            <RibbonButton icon={Lock} label="Lock" onClick={onLock} />
                            <RibbonButton icon={LockOpen} label="Unlock" onClick={onUnlock} />
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
                    content: (
                        <>
                            {/* View Selector */}
                            <div className="flex flex-col gap-1 px-2 border-r border-slate-200 dark:border-slate-700 pr-4">
                                <label className="text-[10px] text-slate-500 font-medium">Active View</label>
                                <select
                                    className="h-8 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded px-2 w-32 focus:ring-1 focus:ring-brand-blue"
                                    value={viewMode === 'summary' ? 'summary' : activeYear}
                                    onChange={(e) => onYearChange?.(e.target.value)}
                                >
                                    <option value="summary">Summary View</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                            <RibbonSeparator />

                            {/* Consolidated Return */}
                            {yearDocs?.consolidated && (
                                <button
                                    className="flex flex-col items-center justify-center px-3 h-16 rounded-md transition-all hover:bg-brand-blue/10 border border-brand-blue/30 bg-brand-blue/5 gap-1 min-w-[72px]"
                                    title={`Open ${activeYear} ${yearDocs.consolidated.label}`}
                                    onClick={() => onDocPreview?.(`${DOC_BASE}/${activeYear}/${yearDocs.consolidated.file}`)}
                                >
                                    <FileText className="size-5 text-brand-blue" />
                                    <span className="text-[10px] font-bold text-brand-blue leading-none">{activeYear} Return</span>
                                </button>
                            )}
                            <RibbonSeparator />

                            {/* Source Documents - Two Rows */}
                            {yearDocs?.docs && (
                                <div className="flex flex-col gap-1 h-16 justify-center px-1">
                                    <div className="flex gap-1 items-center">
                                        {tracked.map(renderChip)}
                                    </div>
                                    <div className="flex gap-1 items-center overflow-x-auto">
                                        {rest.map(renderChip)}
                                    </div>
                                </div>
                            )}

                            {/* Fallback */}
                            {!yearDocs && (
                                <div className="flex items-center px-4 text-xs text-slate-400 italic">
                                    No documents indexed for {activeYear}
                                </div>
                            )}
                        </>
                    )
                }
            ]}
        />
    );
};

export default TaxRibbon;
