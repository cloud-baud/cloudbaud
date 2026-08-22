import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    FileText, Briefcase, Building, TrendingUp, PiggyBank,
    HeartPulse, Users, Home, CreditCard, Globe, ExternalLink,
    AlertTriangle, CheckCircle2, RotateCcw, ChevronDown, ChevronRight,
    CheckSquare, Square, ShieldCheck, Calendar, Upload, Eye, FileSpreadsheet, Lock,
    Sparkles, Cpu, Send, ArrowRight, Table, Check, Loader2, ArrowRightCircle, Link2
} from 'lucide-react';
import { useViewAs } from '../ViewAsContext';
import { extractDocumentValues, getNamedCell, SUMMARY_TAB_NAMED_RANGES, CONNECTED_TAX_NODES, findConnectedNode } from '../data/taxNamedRanges';

const GDRIVE_URL = "https://drive.google.com/drive/folders/1bsHTGlWMp1j0fp_d2eDqiho1Ol0cMnzG?usp=sharing";

// ─────────────────────────────────────────────────────────────────────────────
// 1. PERMANENT IDENTITY & HOUSEHOLD PROFILE (COLLECT ONCE — GLOBAL)
// ─────────────────────────────────────────────────────────────────────────────
export const PERMANENT_PROFILE_CHECKLIST = {
    id: 'permanent_personal',
    title: '1. Permanent Household & Identity Profile',
    icon: ShieldCheck,
    folder: '00-Profile-Permanent',
    isPermanent: true,
    description: 'Collected ONCE for family record — applies across all filing years (2022–2025)',
    items: [
        { num: '1.1', id: 'perm_photo_ids_ssns', label: 'Photo IDs + SSNs (Jishnu, Deepika, Suhavi)', subtext: 'Government issued photo IDs and SSN cards for all 3 household members', isSensitive: true },
        { num: '1.2', id: 'perm_dobs', label: 'Dates of Birth (All 3)', subtext: 'Required for Child Tax Credit qualifying child age test & IRS identity verification', isSensitive: true },
        { num: '1.3', id: 'perm_primary_address', label: 'Primary Residence Address & History', subtext: '2455 130th Ave SE + previous residence addresses' },
        { num: '1.4', id: 'perm_marriage_cert', label: 'Marriage Certificate', subtext: 'Permanent copy on file for Married Filing Jointly (MFJ) substantiation if requested by CPA' },
        { num: '1.5', id: 'perm_prior_returns', label: 'Historical Prior Filed Tax Returns', subtext: '2021 Form 1040, 2022 filed return baseline for AGI verification & carryovers', docMatch: '1040' }
    ]
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. ANNUAL TAX YEAR SPECIFIC DOCUMENTS (COLLECTED PER YEAR: 2022–2025)
// ─────────────────────────────────────────────────────────────────────────────
export const ANNUAL_TAX_CHECKLIST = [
    {
        id: 'income',
        title: '2. Income — W-2 & Business Consulting',
        icon: Briefcase,
        folder: '02-Income',
        description: 'Wages, consulting 1099s, business bank deposits & client invoices',
        items: [
            { num: '2.1', id: 'w2_jishnu_deepika', label: 'W-2s (Jishnu & Deepika)', subtext: 'Box 1 Taxable Wages & Withholding for Jishnu (Form W-2) + Deepika W-2 (Use Box 1 Taxable Wages, not Box 3/5 Social Security)', docMatch: 'W2', isSensitive: true },
            { num: '2.2', id: '1099_nec_misc', label: '1099-NEC / 1099-MISC (Consulting)', subtext: '$351,520 business gross income in 2022', docMatch: '1099', isSensitive: true },
            { num: '2.3', id: 'bank_statements_deposits', label: 'Business Bank Statements', subtext: 'All monthly statements with deposit records', isSensitive: true },
            { num: '2.4', id: 'invoices_issued', label: 'Invoices Issued', subtext: 'Complete invoice copies sent to consulting clients' },
            { num: '2.5', id: '1099_k', label: '1099-K (Payment Processors)', subtext: 'Stripe / PayPal / merchant accounts if any', docMatch: '1099-K', isSensitive: true }
        ]
    },
    {
        id: 'rentals_olympic',
        title: '3A. Rental — Olympic Court (Canada CAD)',
        icon: Building,
        badge: 'Real Estate • Canada',
        folder: '03-Rentals/A-Olympic-Court-Canada',
        description: 'Canadian property income & deductions (CAD converted with Bank of Canada FX)',
        items: [
            { num: '3A.1', id: 'oc_lease_rent', label: 'Lease Agreement + CAD Rent Deposits', subtext: '2022: CAD 17,520 gross rent' },
            { num: '3A.2', id: 'oc_1099_manager', label: '1099-MISC / Statement from CA Manager', subtext: 'Canadian property manager year-end statement' },
            { num: '3A.3', id: 'oc_hoa', label: 'HOA Statements (Strata Fees)', subtext: '2022: CAD 3,190.56 annual strata dues' },
            { num: '3A.4', id: 'oc_insurance', label: 'Landlord Hazard Insurance Receipt', subtext: '2022: CAD 1,200 premium' },
            { num: '3A.5', id: 'oc_mgmt_invoices', label: 'Property Management Invoices', subtext: '2022: CAD 1,920 management fees' },
            { num: '3A.6', id: 'oc_repairs', label: 'Repairs Invoices & Receipts', subtext: '2022: CAD 2,000 + maintenance proof' },
            { num: '3A.7', id: 'oc_mortgage_1098', label: 'Mortgage Interest Statement (1098 equiv.)', subtext: 'Canadian lender annual mortgage interest', docMatch: 'Mortgage' },
            { num: '3A.8', id: 'oc_fx_rates', label: 'Bank of Canada FX Rate Documentation', subtext: '2022: 0.798008 | 2023: 0.769107 | 2024: 0.741166' },
            { num: '3A.9', id: 'oc_cra_t776_fbar', label: 'Canadian T776 + CRA Filing + FBAR / 8833', subtext: 'CRA tax return + FBAR if CA account > $10k + Form 8833 treaty', isSensitive: true }
        ]
    },
    {
        id: 'rentals_cherry',
        title: '3B. Rental — Cherry Crest (12517 NE 23rd Pl, Bellevue USD)',
        icon: Building,
        badge: 'Real Estate • Bellevue',
        folder: '03-Rentals/B-Cherry-Crest',
        description: 'Bellevue rental property income, HOA, taxes, mortgage interest',
        items: [
            { num: '3B.1', id: 'cc_lease_rent', label: 'Lease + Rent Received + 1099-MISC', subtext: '2022: $26,760 rent received (on hand)', docMatch: 'CherryCrest' },
            { num: '3B.2', id: 'cc_hoa', label: 'HOA Statements', subtext: '2022: $5,012.04 — David had only this doc' },
            { num: '3B.3', id: 'cc_re_taxes', label: 'RE Taxes (King County Parcel Statement)', subtext: '2022: $6,762.94', warning: 'MISSING from 2022 filed return' },
            { num: '3B.4', id: 'cc_insurance', label: 'Hazard / Landlord Insurance Receipt', subtext: 'Annual premium proof', warning: 'MISSING from 2022 return' },
            { num: '3B.5', id: 'cc_mortgage_1098', label: 'Mortgage Interest Form 1098', subtext: 'Lender year-end 1098 statement', warning: 'MISSING in return', docMatch: '1098' },
            { num: '3B.6', id: 'cc_repairs_mgmt', label: 'Management & Repair Invoices', subtext: 'Contractor / handyman receipts' },
            { num: '3B.7', id: 'cc_depreciation_basis', label: 'Depreciation Schedule & Settlement Docs', subtext: 'Purchase price basis + structural allocation' }
        ]
    },
    {
        id: 'rentals_woodridge',
        title: '3C. Rental — Woodridge (3rd Rental Property)',
        icon: Building,
        badge: 'Real Estate • Woodridge',
        folder: '03-Rentals/C-Woodridge',
        description: 'Rental deposits from tenants Zhan Shi & Patrick Graham',
        items: [
            { num: '3C.1', id: 'wr_lease_rent', label: 'Lease + Chase Bank Rent Deposits', subtext: 'Tenant deposits from Zhan Shi / Patrick Graham', warning: 'WR-22 and WR-23 rent was BLANK' },
            { num: '3C.2', id: 'wr_hoa', label: 'HOA Dues Statements', subtext: 'Monthly / annual dues statements' },
            { num: '3C.3', id: 'wr_re_taxes', label: 'King County Real Estate Taxes', subtext: 'Property tax parcel statement', docMatch: 'Condo real estate' },
            { num: '3C.4', id: 'wr_insurance', label: 'Landlord Insurance Policy', subtext: '2022: $1,667 (in Home Insurance tab)' },
            { num: '3C.5', id: 'wr_mortgage_1098', label: 'Chase Mortgage Interest 1098', subtext: 'Chase annual form 1098', docMatch: 'Mortgage' },
            { num: '3C.6', id: 'wr_repairs_lawn', label: 'Repairs, Lawn Care & Handyman', subtext: 'Service receipts & invoices' }
        ]
    },
    {
        id: 'real_estate_residence',
        title: '4. Primary Residence — 2455 130th Ave SE',
        icon: Home,
        folder: '04-Primary-Residence',
        description: 'Mortgage interest, property taxes, home office allocation',
        items: [
            { num: '4.1', id: 'pr_1098_mortgage', label: 'Form 1098 Mortgage Interest Statement', subtext: '2022: $10,516.14 reported on Schedule A line 8a', docMatch: '1098' },
            { num: '4.2', id: 'pr_property_tax', label: 'Property Tax Statement (King County)', subtext: '2022: $7,271.09 reported on Schedule A line 5b', docMatch: 'tax' },
            { num: '4.3', id: 'pr_home_office', label: 'Home Office Measurement & Square Footage', subtext: 'Required for Form 8829 / Schedule C home office deduction' },
            { num: '4.4', id: 'pr_utilities', label: 'Annual Utilities (Electric, Gas, Internet, Water)', subtext: 'Prorated for home office business use %' }
        ]
    },
    {
        id: 'investments',
        title: '5. Investments & Brokerage',
        icon: TrendingUp,
        folder: '05-Investments',
        description: 'Brokerage 1099-B/DIV/INT, capital gains, crypto transactions',
        items: [
            { num: '5.1', id: 'inv_1099_consolidated', label: '1099 Consolidated Statements (1099-B / DIV / INT)', subtext: 'Fidelity, Schwab, E*Trade year-end tax packages', docMatch: 'Fidelity', isSensitive: true },
            { num: '5.2', id: 'inv_crypto', label: 'Cryptocurrency Form 8949 / Tax Report', subtext: 'Coinbase / exchange gain/loss summary if traded' },
            { num: '5.3', id: 'inv_foreign_assets', label: 'Foreign Asset Statements (Form 8938 / FBAR)', subtext: 'Foreign bank & investment accounts exceeding $10k/$50k threshold', isSensitive: true }
        ]
    },
    {
        id: 'retirement',
        title: '6. Retirement & Health Savings',
        icon: PiggyBank,
        folder: '06-Retirement',
        description: 'IRA contributions/distributions, Form 5498, 1099-R, HSA Form 1099-SA',
        items: [
            { num: '6.1', id: 'ret_sep_ira', label: 'SEP-IRA / Traditional IRA Contribution Receipts', subtext: 'Form 5498 or contribution confirmation for above-the-line deduction', docMatch: 'SEP' },
            { num: '6.2', id: 'ret_1099_r', label: 'Form 1099-R (Distributions / Rollovers)', subtext: 'If any IRA / 401(k) rollover or distribution took place', docMatch: '1099-R', isSensitive: true },
            { num: '6.3', id: 'ret_hsa_1099_sa', label: 'HSA Form 1099-SA & 5498-SA', subtext: 'Health Savings Account distributions & contributions' }
        ]
    },
    {
        id: 'business_expenses',
        title: '7. Business Deductions (CloudBaud LLC)',
        icon: CreditCard,
        folder: '07-Business-Expenses',
        description: 'Schedule C expense receipts, CPA fees, cloud hosting, software',
        items: [
            { num: '7.1', id: 'biz_cpa_fees', label: 'CPA / Professional Tax Prep Invoices', subtext: '2022: $3,500 NRI Essentials / CPA fee deduction receipt' },
            { num: '7.2', id: 'biz_software_cloud', label: 'Software, Cloud Hosting & SaaS Receipts', subtext: 'AWS, GCP, domain registrar, dev tools receipts', docMatch: 'expenses' },
            { num: '7.3', id: 'biz_travel_meals', label: 'Business Travel, Mileage & Meals Logs', subtext: 'Vehicle mileage log & qualifying client meal receipts' },
            { num: '7.4', id: 'biz_telecom', label: 'Cell Phone & Business Internet Bills', subtext: 'Business allocation percentage' }
        ]
    },
    {
        id: 'estimated_taxes',
        title: '8. Estimated Tax Payments (State & Federal)',
        icon: Users,
        folder: '08-Tax-Payments',
        description: 'IRS EFTPS & WA state DOR quarterly estimated tax payments',
        items: [
            { num: '8.1', id: 'est_irs_1040es', label: 'IRS Form 1040-ES Quarterly Payment Confirmations', subtext: 'Q1, Q2, Q3, Q4 estimated payments made for the year', isSensitive: true },
            { num: '8.2', id: 'est_wa_dor', label: 'WA State Department of Revenue Filings / B&O', subtext: 'Quarterly excise / B&O tax returns & payment receipts', docMatch: 'DOR' }
        ]
    },
    {
        id: 'cpa_deliverables',
        title: '9. CPA Drafts & Final Filed Return',
        icon: FileText,
        folder: '09-CPA-Deliverables',
        description: 'David Ramsey draft 1040, e-file authorization 8879, final signed returns',
        items: [
            { num: '9.1', id: 'cpa_draft_1040', label: 'CPA Draft Form 1040 Return Package', subtext: 'Draft federal return for client review & worksheet reconciliation', docMatch: '1040', isSensitive: true },
            { num: '9.2', id: 'cpa_form_8879', label: 'Form 8879 IRS e-file Signature Authorization', subtext: 'Signed electronic filing authorization for David Ramsey', isSensitive: true },
            { num: '9.3', id: 'cpa_final_filed', label: 'Final Accepted IRS Form 1040 Return', subtext: 'Archived official filed tax return with IRS acceptance timestamp', docMatch: '1040', isSensitive: true }
        ]
    }
];

const YEARS = [2022, 2023, 2024, 2025];

export default function TaxChecklist({ 
    year = 2022,
    onYearChange,
    onViewDocument,
    onTriggerUpload,
    onTransferValue,
    availableDocs = [],
    activeConnectedNode,
    setActiveConnectedNode,
    hoveredConnectedNode,
    setHoveredConnectedNode
}) {
    const activeYear = String(year);
    const { activePersona, isViewingAs } = useViewAs();
    const isSecurityTrimmed = isViewingAs && activePersona?.role?.includes('CPA');
    const scrollContainerRef = useRef(null);

    // Extraction preview state (itemId -> boolean)
    const [expandedExtracts, setExpandedExtracts] = useState({});
    const [extractingMap, setExtractingMap] = useState({});
    // Transferred status map (itemId -> { namedCell, amount, timestamp })
    const [transferredMap, setTransferredMap] = useState(() => {
        try {
            const saved = localStorage.getItem(`tax_transferred_cells_${year}`);
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    // Global transfer toast message
    const [transferToast, setTransferToast] = useState(null);
    // Custom user adjustments to extracted values before transfer
    const [customFieldValues, setCustomFieldValues] = useState({});

    // Persisted accordion collapse state so it never resets when switching views
    const [collapsedSections, setCollapsedSections] = useState(() => {
        try {
            const saved = localStorage.getItem('tax_checklist_collapsed_sections');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    // Auto-expand and scroll to section when active connected node changes
    useEffect(() => {
        if (activeConnectedNode) {
            const node = CONNECTED_TAX_NODES[activeConnectedNode];
            if (node?.checklistSectionId) {
                setCollapsedSections(prev => ({
                    ...prev,
                    [node.checklistSectionId]: false
                }));
            }
        }
    }, [activeConnectedNode]);

    // Last active section the user worked in
    const [lastActiveSectionId, setLastActiveSectionId] = useState(() => {
        try {
            return localStorage.getItem('tax_checklist_last_active_section') || null;
        } catch {
            return null;
        }
    });

    // 1. Permanent Profile State (Collected ONCE, shared across all years)
    const [permCheckedState, setPermCheckedState] = useState(() => {
        try {
            const saved = localStorage.getItem('tax_checklist_permanent_profile');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    // 2. Annual Tax Checklist State (Per Year: 2022, 2023, 2024, 2025)
    const [checkedStateByYear, setCheckedStateByYear] = useState(() => {
        const initial = {};
        YEARS.forEach(yr => {
            try {
                const saved = localStorage.getItem(`tax_checklist_${yr}`);
                initial[yr] = saved ? JSON.parse(saved) : {};
            } catch {
                initial[yr] = {};
            }
        });
        return initial;
    });

    // Persist accordion collapsed state
    useEffect(() => {
        try {
            localStorage.setItem('tax_checklist_collapsed_sections', JSON.stringify(collapsedSections));
        } catch (err) {
            console.debug("Failed to save collapsed sections:", err);
        }
    }, [collapsedSections]);

    // Restore scroll to the section the user was working on
    useEffect(() => {
        if (lastActiveSectionId) {
            const timer = setTimeout(() => {
                const el = document.getElementById(`checklist-sec-${lastActiveSectionId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 120);
            return () => clearTimeout(timer);
        }
    }, [lastActiveSectionId, activeYear]);

    // Save permanent profile state
    useEffect(() => {
        try {
            localStorage.setItem('tax_checklist_permanent_profile', JSON.stringify(permCheckedState));
        } catch (err) {
            console.error("Failed to save permanent profile checklist:", err);
        }
    }, [permCheckedState]);

    // Save annual checklist state
    useEffect(() => {
        if (checkedStateByYear[activeYear]) {
            try {
                localStorage.setItem(`tax_checklist_${activeYear}`, JSON.stringify(checkedStateByYear[activeYear]));
            } catch (err) {
                console.error("Failed to save annual checklist state:", err);
            }
        }
    }, [checkedStateByYear, activeYear]);

    const togglePermItem = (itemId) => {
        setLastActiveSectionId('permanent_personal');
        try { localStorage.setItem('tax_checklist_last_active_section', 'permanent_personal'); } catch {}
        setPermCheckedState(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const toggleAnnualItem = (itemId, sectionId) => {
        if (sectionId) {
            setLastActiveSectionId(sectionId);
            try { localStorage.setItem('tax_checklist_last_active_section', sectionId); } catch {}
        }
        setCheckedStateByYear(prev => ({
            ...prev,
            [activeYear]: {
                ...prev[activeYear],
                [itemId]: !prev[activeYear]?.[itemId]
            }
        }));
    };

    const toggleSectionCollapse = (sectionId) => {
        setLastActiveSectionId(sectionId);
        try { localStorage.setItem('tax_checklist_last_active_section', sectionId); } catch {}
        setCollapsedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const expandAllSections = () => {
        setCollapsedSections({});
    };

    const collapseAllSections = () => {
        const allSecIds = [PERMANENT_PROFILE_CHECKLIST.id, ...ANNUAL_TAX_CHECKLIST.map(s => s.id)];
        const next = {};
        allSecIds.forEach(id => { next[id] = true; });
        setCollapsedSections(next);
    };

    const resetCurrentYear = () => {
        if (window.confirm(`Reset annual checklist progress for tax year ${activeYear}? (Permanent profile items will NOT be reset)`)) {
            setCheckedStateByYear(prev => ({
                ...prev,
                [activeYear]: {}
            }));
            try {
                localStorage.removeItem(`tax_checklist_${activeYear}`);
            } catch {}
        }
    };

    // Calculate permanent items count
    const permItemIds = useMemo(() => PERMANENT_PROFILE_CHECKLIST.items.map(it => it.id), []);
    const permCompletedCount = permItemIds.filter(id => permCheckedState[id]).length;
    const permTotalCount = permItemIds.length;

    // Calculate annual items count for active year
    const annualItemIds = useMemo(() => {
        const ids = [];
        ANNUAL_TAX_CHECKLIST.forEach(sec => sec.items.forEach(it => ids.push(it.id)));
        return ids;
    }, []);
    const currentYearChecked = checkedStateByYear[activeYear] || {};
    const annualCompletedCount = annualItemIds.filter(id => currentYearChecked[id]).length;
    const annualTotalCount = annualItemIds.length;

    // Combined counts
    const totalItems = permTotalCount + annualTotalCount;
    const totalCompleted = permCompletedCount + annualCompletedCount;
    const progressPercent = Math.round((totalCompleted / totalItems) * 100);

    // Handle toggle Parse / Extraction preview
    const handleToggleExtract = (e, item, attachedDoc) => {
        e?.stopPropagation();
        const itemId = item.id;
        if (expandedExtracts[itemId]) {
            setExpandedExtracts(prev => ({ ...prev, [itemId]: false }));
            return;
        }

        // Show brief 250ms extracting feedback
        setExtractingMap(prev => ({ ...prev, [itemId]: true }));
        setTimeout(() => {
            setExtractingMap(prev => ({ ...prev, [itemId]: false }));
            setExpandedExtracts(prev => ({ ...prev, [itemId]: true }));
        }, 250);
    };

    // Handle Transfer to Named Cell on Worksheet
    const handleTransfer = (e, field, item, attachedDoc) => {
        e?.stopPropagation();
        const extraction = extractDocumentValues(item, attachedDoc, activeYear);
        const targetField = field || extraction.fields.find(f => f.isPrimary) || extraction.fields[0];
        if (!targetField) return;

        const targetNamedCell = targetField.targetNamedCell || getNamedCell('W2_WAGES', activeYear);
        const amount = targetField.value;
        const targetAccount = targetField.targetAccount || 'W2 Wages';

        onTransferValue?.({
            namedCell: targetNamedCell,
            targetAccount: targetAccount,
            amount: amount,
            year: Number(activeYear),
            docName: attachedDoc?.name || item.label,
            label: targetField.label
        });

        // Automatically mark as checked in the checklist
        if (!currentYearChecked[item.id]) {
            toggleAnnualItem(item.id);
        }

        // Record transfer status
        const fieldKey = field?.key || targetField.key || 'primary';
        const formattedAmount = targetField.formatted || `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        const updated = {
            ...transferredMap,
            [item.id]: {
                namedCell: targetNamedCell,
                amount: formattedAmount,
                rawValue: amount,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            [`${item.id}_${fieldKey}`]: {
                namedCell: targetNamedCell,
                amount: formattedAmount,
                rawValue: amount,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        };
        setTransferredMap(updated);
        try {
            localStorage.setItem(`tax_transferred_cells_${activeYear}`, JSON.stringify(updated));
        } catch {}

        setTransferToast(`Transferred ${formattedAmount} ➔ [${targetNamedCell}] • Ready for CPA Review`);
        setTimeout(() => setTransferToast(null), 4500);
    };

    // Helper: find attached doc in availableDocs (ALWAYS preserved when checked)
    const getAttachedDoc = (item) => {
        if (!availableDocs || availableDocs.length === 0) return null;
        if (item.docMatch) {
            return availableDocs.find(d => d.name?.toLowerCase().includes(item.docMatch.toLowerCase())) || null;
        }
        return availableDocs.find(d => d.name?.toLowerCase().includes(item.id.toLowerCase())) || null;
    };

    return (
        <div className="h-full w-full flex flex-col bg-[#070b14] text-white text-xs overflow-hidden select-none relative">
            {/* Transfer Toast Banner */}
            {transferToast && (
                <div className="absolute top-11 left-3 right-3 z-50 bg-emerald-600/95 text-white px-3 py-2 rounded-lg shadow-2xl flex items-center justify-between gap-2 border border-emerald-400/40 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-emerald-200 shrink-0" />
                        <span>{transferToast}</span>
                    </div>
                    <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded text-white/90 font-mono">Worksheet Updated</span>
                </div>
            )}

            {/* Sleek Minimal Toolbar with Security Trimming & Zero Duplication */}
            <div className="p-2 px-3 border-b border-white/10 bg-[#0b1120] shrink-0 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">Filing Requirements</span>
                    <span className="text-[10px] text-blue-300 font-mono bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                        {activeYear}
                    </span>
                    {isSecurityTrimmed && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[9px] font-semibold" title="Security Trimming Active: PII and sensitive taxpayer identifiers masked">
                            <Lock className="size-2.5" />
                            <span>Security Trimmed</span>
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center bg-[#070b14] rounded border border-white/10 p-0.5 text-[10px]">
                        <button
                            type="button"
                            onClick={expandAllSections}
                            className="px-1.5 py-0.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition"
                            title="Expand all sections"
                        >
                            Expand All
                        </button>
                        <span className="text-white/20">|</span>
                        <button
                            type="button"
                            onClick={collapseAllSections}
                            className="px-1.5 py-0.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition"
                            title="Collapse all sections"
                        >
                            Collapse All
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={resetCurrentYear}
                        title={`Reset ${activeYear} annual checked items`}
                        className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-red-400 text-[10px] flex items-center gap-1 transition"
                    >
                        <RotateCcw className="size-2.5" />
                        <span className="hidden sm:inline">Reset</span>
                    </button>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        progressPercent === 100 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                            : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                    }`} title={`${totalCompleted} of ${totalItems} items completed across permanent profile and ${activeYear}`}>
                        {totalCompleted}/{totalItems} ({progressPercent}%)
                    </span>

                    <a
                        href={GDRIVE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 px-2 rounded bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm flex items-center gap-1 text-[10px] font-semibold"
                        title="Open Shared CPA Google Drive Folder"
                    >
                        <ExternalLink className="size-3" />
                        <span className="hidden sm:inline">GDrive</span>
                    </a>
                </div>
            </div>

            {/* Checklist Scroll Area */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* ───────────────────────────────────────────────────────────── */}
                {/* SECTION 1: PERMANENT HOUSEHOLD PROFILE (COLLECT ONCE)       */}
                {/* ───────────────────────────────────────────────────────────── */}
                <div 
                    id={`checklist-sec-${PERMANENT_PROFILE_CHECKLIST.id}`}
                    className="rounded-lg border-2 border-emerald-500/30 bg-[#0c1626] overflow-hidden shadow-sm transition scroll-mt-4"
                >
                    <div
                        onClick={() => toggleSectionCollapse(PERMANENT_PROFILE_CHECKLIST.id)}
                        className="py-2 px-3 bg-[#102038] border-b border-emerald-500/20 flex items-center justify-between cursor-pointer hover:bg-[#142848] transition select-none"
                    >
                        <div className="flex items-center gap-2">
                            {collapsedSections[PERMANENT_PROFILE_CHECKLIST.id] ? (
                                <ChevronRight className="size-3.5 text-white/40" />
                            ) : (
                                <ChevronDown className="size-3.5 text-white/40" />
                            )}
                            <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                                <ShieldCheck className="size-3.5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-white">
                                        {PERMANENT_PROFILE_CHECKLIST.title}
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold uppercase tracking-wider">
                                        Permanent (Collect Once)
                                    </span>
                                </div>
                                <span className="text-[10px] text-white/50">
                                    {PERMANENT_PROFILE_CHECKLIST.description}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                permCompletedCount === permTotalCount
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-white/5 text-white/60 border border-white/10'
                            }`}>
                                {permCompletedCount} / {permTotalCount}
                            </span>
                        </div>
                    </div>

                    {!collapsedSections[PERMANENT_PROFILE_CHECKLIST.id] && (
                        <div className="p-1 divide-y divide-white/5 bg-[#08101e]">
                            {PERMANENT_PROFILE_CHECKLIST.items.map((item) => {
                                const isChecked = !!permCheckedState[item.id];
                                const attachedDoc = getAttachedDoc(item);

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => togglePermItem(item.id)}
                                        className={`flex items-start gap-2.5 p-2 rounded cursor-pointer transition ${
                                            isChecked
                                                ? 'bg-emerald-950/15 text-white'
                                                : 'hover:bg-white/5 text-white'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                togglePermItem(item.id);
                                            }}
                                            className="mt-0.5 text-slate-400 hover:text-white transition shrink-0"
                                        >
                                            {isChecked ? (
                                                <CheckSquare className="size-4 text-emerald-400" />
                                            ) : (
                                                <Square className="size-4 text-white/30 hover:text-white/60" />
                                            )}
                                        </button>

                                        <div className="space-y-0.5 flex-1">
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono text-emerald-400 font-bold text-[11px]">
                                                        [{item.num}]
                                                    </span>
                                                    <span className="font-semibold text-xs text-white">
                                                        {item.label}
                                                    </span>
                                                    {item.isSensitive && isSecurityTrimmed && (
                                                        <span className="inline-flex items-center gap-1 px-1 py-0.2 rounded text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                            <Lock className="size-2" />
                                                            <span>Masked PII</span>
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Document Action Button */}
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {attachedDoc ? (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setLastActiveSectionId('permanent_personal');
                                                                try { localStorage.setItem('tax_checklist_last_active_section', 'permanent_personal'); } catch {}
                                                                onViewDocument?.(attachedDoc);
                                                            }}
                                                            className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1 transition"
                                                            title={`View ${attachedDoc.name}`}
                                                        >
                                                            <Eye className="size-2.5" />
                                                            <span>View Doc</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setLastActiveSectionId('permanent_personal');
                                                                try { localStorage.setItem('tax_checklist_last_active_section', 'permanent_personal'); } catch {}
                                                                onTriggerUpload?.(item);
                                                            }}
                                                            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 text-[10px] flex items-center gap-1 transition"
                                                            title="Attach document"
                                                        >
                                                            <Upload className="size-2.5 text-blue-400" />
                                                            <span>Attach</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-[11px] text-white/50 leading-relaxed">
                                                {item.subtext}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ───────────────────────────────────────────────────────────── */}
                {/* SECTION 2-10: ANNUAL TAX YEAR DOCUMENTS (PER YEAR)          */}
                {/* ───────────────────────────────────────────────────────────── */}
                <div className="pt-1 pb-0.5 flex items-center gap-2 text-white/40">
                    <Calendar className="size-3.5 text-blue-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                        Annual Tax Documents for {activeYear}
                    </span>
                    <div className="h-px bg-white/10 flex-1" />
                </div>

                {ANNUAL_TAX_CHECKLIST.map((section) => {
                    const isCollapsed = collapsedSections[section.id];
                    const secCheckedCount = section.items.filter(it => currentYearChecked[it.id]).length;
                    const secTotal = section.items.length;
                    const secAllDone = secCheckedCount === secTotal;
                    const isRealEstate = section.id.startsWith('rentals');

                    return (
                        <div
                            key={section.id}
                            id={`checklist-sec-${section.id}`}
                            className={`rounded-lg border overflow-hidden shadow-sm transition scroll-mt-4 ${
                                isRealEstate 
                                    ? 'border-blue-500/30 bg-[#0d1629]' 
                                    : 'border-white/10 bg-[#0e1424]'
                            }`}
                        >
                            {/* Section Header */}
                            <div
                                onClick={() => toggleSectionCollapse(section.id)}
                                className={`py-2 px-3 border-b flex items-center justify-between cursor-pointer transition select-none ${
                                    isRealEstate
                                        ? 'bg-[#14223d] hover:bg-[#1a2c50] border-blue-500/30'
                                        : 'bg-[#131b2e] hover:bg-[#18233c] border-white/10'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    {isCollapsed ? (
                                        <ChevronRight className="size-3.5 text-white/40" />
                                    ) : (
                                        <ChevronDown className="size-3.5 text-white/40" />
                                    )}
                                    <div className={`p-1 rounded ${isRealEstate ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-blue-400'}`}>
                                        <section.icon className="size-3.5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-xs text-white">
                                                {section.title}
                                            </span>
                                            {section.badge && (
                                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                                    {section.badge}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-white/40 font-mono">
                                            📁 {activeYear}/{section.folder}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                        secAllDone
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                            : 'bg-white/5 text-white/60 border border-white/10'
                                    }`}>
                                        {secCheckedCount} / {secTotal}
                                    </span>
                                </div>
                            </div>

                            {/* Section Items */}
                            {!isCollapsed && (
                                <div className="p-1 divide-y divide-white/5 bg-[#0a0f1c]">
                                    {section.items.map((item) => {
                                        const isChecked = !!currentYearChecked[item.id];
                                        const attachedDoc = getAttachedDoc(item);
                                        const activeNode = CONNECTED_TAX_NODES[activeConnectedNode];
                                        const hoveredNode = CONNECTED_TAX_NODES[hoveredConnectedNode];
                                        const isItemConnected = activeNode && (activeNode.checklistId === item.id || (activeNode.id === 'w2_income' && (item.id === 'w2_jishnu_deepika' || item.num === '2.1')));
                                        const isItemHoverConnected = hoveredNode && (hoveredNode.checklistId === item.id || (hoveredNode.id === 'w2_income' && (item.id === 'w2_jishnu_deepika' || item.num === '2.1')));
                                        const isNodeHighlighted = isItemConnected || isItemHoverConnected;
                                        const nodeForBadge = activeNode || hoveredNode;

                                        return (
                                            <div
                                                key={item.id}
                                                id={`checklist-item-${item.id}`}
                                                onClick={() => {
                                                    toggleAnnualItem(item.id, section.id);
                                                    const matched = Object.values(CONNECTED_TAX_NODES).find(n => n.checklistId === item.id || (n.id === 'w2_income' && (item.id === 'w2_jishnu_deepika' || item.num === '2.1')));
                                                    if (matched && setActiveConnectedNode) {
                                                        setActiveConnectedNode(matched.id);
                                                    }
                                                }}
                                                onMouseEnter={() => {
                                                    const matched = Object.values(CONNECTED_TAX_NODES).find(n => n.checklistId === item.id || (n.id === 'w2_income' && (item.id === 'w2_jishnu_deepika' || item.num === '2.1')));
                                                    if (matched && setHoveredConnectedNode) {
                                                        setHoveredConnectedNode(matched.id);
                                                    }
                                                }}
                                                onMouseLeave={() => {
                                                    setHoveredConnectedNode?.(null);
                                                }}
                                                className={`flex items-start gap-2.5 p-2 rounded cursor-pointer transition relative ${
                                                    isNodeHighlighted
                                                        ? 'bg-cyan-950/40 ring-2 ring-cyan-400 border-2 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] z-10'
                                                        : isChecked
                                                        ? 'bg-emerald-950/15 text-white'
                                                        : 'hover:bg-white/5 text-white'
                                                }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleAnnualItem(item.id, section.id);
                                                    }}
                                                    className="mt-0.5 text-slate-400 hover:text-white transition shrink-0"
                                                >
                                                    {isChecked ? (
                                                        <CheckSquare className="size-4 text-emerald-400" />
                                                    ) : (
                                                        <Square className="size-4 text-white/30 hover:text-white/60" />
                                                    )}
                                                </button>

                                                <div className="space-y-1.5 flex-1">
                                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="font-mono text-blue-400 font-bold text-[11px]">
                                                                [{item.num}]
                                                            </span>
                                                            <span className={`font-semibold text-xs ${isNodeHighlighted ? 'text-cyan-200 font-bold' : 'text-white'}`}>
                                                                {item.label}
                                                            </span>

                                                            {/* 3-Panel Connected Item Badge */}
                                                            {isNodeHighlighted && nodeForBadge && (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/20 text-cyan-200 border border-cyan-400/60 font-mono font-bold animate-in fade-in">
                                                                    <Link2 className="size-2.5 text-cyan-300 animate-pulse" />
                                                                    <span>Linked: Sheet [{nodeForBadge.yearCoords[activeYear] || nodeForBadge.cellCoord2022 || 'G2'}] ↔ 1040 {nodeForBadge.form1040LineLabel}</span>
                                                                </span>
                                                            )}

                                                            {item.isSensitive && isSecurityTrimmed && (
                                                                <span className="inline-flex items-center gap-1 px-1 py-0.2 rounded text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                                                                    <Lock className="size-2" />
                                                                    <span>PII Masked</span>
                                                                </span>
                                                            )}
                                                            {item.warning && (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                                    <AlertTriangle className="size-2.5 text-amber-400" />
                                                                    {item.warning}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Attached File Actions: View Doc, Parse / Extract, Transfer */}
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            {attachedDoc ? (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setLastActiveSectionId(section.id);
                                                                            try { localStorage.setItem('tax_checklist_last_active_section', section.id); } catch {}
                                                                            onViewDocument?.(attachedDoc);
                                                                        }}
                                                                        className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                                                                        title={`View ${attachedDoc.name}`}
                                                                    >
                                                                        <Eye className="size-3.5" />
                                                                        <span>View Doc</span>
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => handleToggleExtract(e, item, attachedDoc)}
                                                                        className={`px-2.5 py-1 rounded border text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                                                                            expandedExtracts[item.id]
                                                                                ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                                                                                : 'bg-purple-500/20 hover:bg-purple-500/35 text-purple-200 border-purple-500/40'
                                                                        }`}
                                                                        title="Extract and preview key tax values"
                                                                    >
                                                                        {extractingMap[item.id] ? (
                                                                            <Loader2 className="size-3.5 animate-spin" />
                                                                        ) : (
                                                                            <Sparkles className="size-3.5 text-purple-300" />
                                                                        )}
                                                                        <span>{expandedExtracts[item.id] ? 'Hide Extract' : 'Parse'}</span>
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => handleTransfer(e, null, item, attachedDoc)}
                                                                        className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                                                                            transferredMap[item.id]
                                                                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/80 shadow-md'
                                                                                : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/80'
                                                                        }`}
                                                                        title={transferredMap[item.id] ? `Transferred to [${transferredMap[item.id]?.namedCell}] (Click to re-transfer)` : "Transfer parsed amount directly to worksheet named cell"}
                                                                    >
                                                                        {transferredMap[item.id] ? (
                                                                            <>
                                                                                <Check className="size-3.5 text-white" />
                                                                                <span>Transferred</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <ArrowRightCircle className="size-3.5 text-white" />
                                                                                <span>Transfer</span>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setLastActiveSectionId(section.id);
                                                                        try { localStorage.setItem('tax_checklist_last_active_section', section.id); } catch {}
                                                                        onTriggerUpload?.(item);
                                                                    }}
                                                                    className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition"
                                                                    title="Attach document"
                                                                >
                                                                    <Upload className="size-3.5 text-blue-400" />
                                                                    <span>Attach</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-slate-200 leading-relaxed font-normal">
                                                        {item.subtext}
                                                    </p>

                                                    {/* Transferred Badge if already applied */}
                                                    {transferredMap[item.id] && (
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-mono font-medium mt-1">
                                                            <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                                                            <span>Transferred {transferredMap[item.id].amount} ➔ <b className="text-white">[{transferredMap[item.id].namedCell}]</b></span>
                                                            <span className="text-slate-400 text-[10px]">({transferredMap[item.id].timestamp})</span>
                                                        </div>
                                                    )}

                                                    {/* Inline Extracted Key-Value Preview Panel */}
                                                    {expandedExtracts[item.id] && (() => {
                                                        const extraction = extractDocumentValues(item, attachedDoc, activeYear);
                                                        return (
                                                            <div 
                                                                className="mt-2 p-3 rounded-lg border border-purple-500/40 bg-[#120d24] text-white space-y-2.5 animate-in fade-in slide-in-from-top-1 shadow-xl"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <div className="flex items-center justify-between border-b border-purple-500/30 pb-2 text-xs flex-wrap gap-1">
                                                                    <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                                                                        <Cpu className="size-4 text-purple-400 shrink-0" />
                                                                        <span>Extracted {extraction.formType}</span>
                                                                        <span className="text-purple-200 font-mono text-xs">({extraction.year})</span>
                                                                    </div>
                                                                    <span className="text-slate-300 text-xs font-medium truncate max-w-[220px]" title={extraction.employer}>
                                                                        {extraction.employer}
                                                                    </span>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    {extraction.fields.map((field) => {
                                                                        const fieldCustomKey = `${item.id}_${field.key}`;
                                                                        const currentVal = customFieldValues[fieldCustomKey] !== undefined 
                                                                            ? customFieldValues[fieldCustomKey] 
                                                                            : field.value;
                                                                        const numCurrentVal = parseFloat(currentVal) || 0;
                                                                        const transferredRecord = transferredMap[fieldCustomKey] || (field.isPrimary ? transferredMap[item.id] : null);
                                                                        const isFieldTransferred = transferredRecord && transferredRecord.rawValue === numCurrentVal;
                                                                        const isFieldModified = transferredRecord && transferredRecord.rawValue !== numCurrentVal;

                                                                        const isBox2 = field.key === 'box2' || field.label.toLowerCase().includes('withheld') || field.label.toLowerCase().includes('federal');
                                                                        const isBox1 = field.key === 'box1' || field.isPrimary;
                                                                        const isFieldActive = (isBox2 && activeConnectedNode === 'w2_tax_withheld') || (isBox1 && activeConnectedNode === 'w2_income');
                                                                        const isFieldHovered = (isBox2 && hoveredConnectedNode === 'w2_tax_withheld') || (isBox1 && hoveredConnectedNode === 'w2_income');
                                                                        const isFieldHighlighted = isFieldActive || isFieldHovered;
                                                                        const activeNodeForField = isBox2 ? CONNECTED_TAX_NODES['w2_tax_withheld'] : isBox1 ? CONNECTED_TAX_NODES['w2_income'] : null;

                                                                        return (
                                                                            <div 
                                                                                key={field.key}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (isBox2 && setActiveConnectedNode) {
                                                                                        setActiveConnectedNode(activeConnectedNode === 'w2_tax_withheld' ? null : 'w2_tax_withheld');
                                                                                    } else if (isBox1 && setActiveConnectedNode) {
                                                                                        setActiveConnectedNode(activeConnectedNode === 'w2_income' ? null : 'w2_income');
                                                                                    }
                                                                                }}
                                                                                onMouseEnter={() => {
                                                                                    if (isBox2 && setHoveredConnectedNode) {
                                                                                        setHoveredConnectedNode('w2_tax_withheld');
                                                                                    } else if (isBox1 && setHoveredConnectedNode) {
                                                                                        setHoveredConnectedNode('w2_income');
                                                                                    }
                                                                                }}
                                                                                onMouseLeave={() => {
                                                                                    setHoveredConnectedNode?.(null);
                                                                                }}
                                                                                className={`flex items-center justify-between gap-2 p-2.5 rounded transition cursor-pointer relative ${
                                                                                    isFieldHighlighted
                                                                                        ? 'bg-cyan-950/70 border-2 border-cyan-400 ring-2 ring-cyan-400/60 text-white shadow-[0_0_18px_rgba(6,182,212,0.45)] z-10'
                                                                                        : 'bg-black/50 border border-white/10 text-xs hover:border-purple-500/40'
                                                                                }`}
                                                                            >
                                                                                <div className="space-y-0.5 flex-1 min-w-0">
                                                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                                                        <div className={`font-semibold text-xs truncate ${isFieldHighlighted ? 'text-cyan-200 font-bold' : 'text-slate-200'}`}>
                                                                                            {field.label}
                                                                                        </div>
                                                                                        {isFieldHighlighted && activeNodeForField && (
                                                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 font-mono font-bold animate-in fade-in">
                                                                                                <Link2 className="size-2.5 text-cyan-300 animate-pulse" />
                                                                                                <span>Linked: Sheet [{activeNodeForField.yearCoords[activeYear] || activeNodeForField.cellCoord2022}] ↔ 1040 {activeNodeForField.form1040LineLabel}</span>
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                                                        <span className="text-emerald-400 font-mono text-sm font-bold">$</span>
                                                                                        <input
                                                                                            type="number"
                                                                                            step="0.01"
                                                                                            value={currentVal}
                                                                                            onClick={(e) => e.stopPropagation()}
                                                                                            onChange={(e) => {
                                                                                                const nextVal = e.target.value;
                                                                                                setCustomFieldValues(prev => ({
                                                                                                    ...prev,
                                                                                                    [fieldCustomKey]: nextVal
                                                                                                }));
                                                                                            }}
                                                                                            className="bg-slate-900 border border-white/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 rounded px-2 py-1 text-sm font-mono font-bold text-emerald-300 w-32 outline-none"
                                                                                        />
                                                                                    </div>
                                                                                </div>

                                                                                <div className="flex items-center gap-2 shrink-0">
                                                                                    {field.targetNamedCell && (
                                                                                        <span className="px-2 py-1 rounded bg-blue-500/20 border border-blue-500/40 text-[11px] font-mono font-bold text-blue-200" title={`Named Cell target: ${field.targetNamedCell}`}>
                                                                                            [{field.targetNamedCell}]
                                                                                        </span>
                                                                                    )}
                                                                                    {field.targetNamedCell && (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={(e) => handleTransfer(e, { ...field, key: field.key, value: numCurrentVal, formatted: `$${numCurrentVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}` }, item, attachedDoc)}
                                                                                            className={`px-3 py-1 rounded font-bold text-xs flex items-center gap-1.5 transition shadow-sm ${
                                                                                                isFieldTransferred
                                                                                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                                                                                    : isFieldModified
                                                                                                    ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                                                                                                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                                                                                            }`}
                                                                                            title={isFieldTransferred ? `Transferred $${numCurrentVal} into ${field.targetNamedCell}` : isFieldModified ? `Value changed — click to Update Transfer into ${field.targetNamedCell}` : `Transfer $${numCurrentVal} into ${field.targetNamedCell}`}
                                                                                        >
                                                                                            {isFieldTransferred ? (
                                                                                                <>
                                                                                                    <Check className="size-3.5 text-white" />
                                                                                                    <span>Transferred</span>
                                                                                                </>
                                                                                            ) : isFieldModified ? (
                                                                                                <>
                                                                                                    <Send className="size-3.5" />
                                                                                                    <span>Update Transfer</span>
                                                                                                </>
                                                                                            ) : (
                                                                                                <>
                                                                                                    <Send className="size-3.5" />
                                                                                                    <span>Transfer</span>
                                                                                                </>
                                                                                            )}
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
