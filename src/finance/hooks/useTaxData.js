import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';

// ─── Section metadata (UI-only, not stored in DB) ───────────
const SECTION_META = {
    income:      { title: 'INCOME',                      color: '#0f5132' },
    adjustments: { title: 'ADJUSTMENTS TO INCOME',       color: '#1a4971' },
    deductions:  { title: 'ITEMIZED DEDUCTIONS (Schedule A)', color: '#6a3d0a' },
    retirement:  { title: 'RETIREMENT & EDUCATION',      color: '#4a1a6b' },
    computation: { title: 'TAX COMPUTATION',             color: '#8b0000' },
    payments:    { title: 'PAYMENTS & AMOUNT OWED',      color: '#1a1a2e' },
};

// Subtotal definitions per section (UI-only, could also be stored as computed items)
const SECTION_SUBTOTALS = {
    income:      { label: 'Total Income',              formLine: 'Line 22' },
    adjustments: { label: 'Adjusted Gross Income (AGI)', formLine: 'Line 37' },
    deductions:  { label: 'Total Itemized Deductions', formLine: 'Line 40' },
    computation: { label: 'Total Tax',                 formLine: 'Line 63' },
    payments:    { label: 'Amount Owed',               formLine: 'Line 78' },
};

/**
 * Hook to load tax data from Supabase.
 * Transforms DB rows into the same shape as the old TAX_DATA_BY_YEAR object.
 * Falls back to hardcoded data if Supabase is unreachable.
 * 
 * @param {number} year - Tax year (e.g. 2017)
 * @param {object} fallbackData - Static TAX_DATA_BY_YEAR[year] object for fallback
 */
export function useTaxData(year, fallbackData = null) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [yearData, setYearData] = useState(fallbackData);
    const [carryforwards, setCarryforwards] = useState([]);
    const [source, setSource] = useState('static'); // 'supabase' | 'static'
    const pendingUpdates = useRef(new Map());

    // ─── Load from Supabase ─────────────────────────────
    const loadFromSupabase = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch line items (COA + entries joined)
            const { data: lineItems, error: itemsErr } = await supabase
                .rpc('api_get_tax_line_items', { p_year: year });

            if (itemsErr) throw itemsErr;

            // If no data returned, fall back to static
            if (!lineItems || lineItems.length === 0) {
                console.warn(`[useTaxData] No Supabase data for ${year}, using fallback`);
                setSource('static');
                setYearData(fallbackData);
                setLoading(false);
                return;
            }

            // Fetch carryforwards
            const { data: cfs } = await supabase
                .rpc('api_get_carryforwards', { p_year: year });
            setCarryforwards(cfs || []);

            // Transform DB rows → TAX_DATA_BY_YEAR shape
            const transformed = transformToViewerShape(lineItems, year);
            setYearData(transformed);
            setSource('supabase');
            setError(null);
        } catch (err) {
            console.error('[useTaxData] Supabase load failed, using fallback:', err);
            setError(err.message);
            setSource('static');
            setYearData(fallbackData);
        } finally {
            setLoading(false);
        }
    }, [year, fallbackData]);

    useEffect(() => {
        loadFromSupabase();
    }, [loadFromSupabase]);

    // ─── Update a single amount ────────────────────────
    const updateAmount = useCallback(async (accountId, newAmount, notes = null) => {
        try {
            const { data, error: updateErr } = await supabase
                .rpc('api_update_tax_cell', {
                    p_account_id: accountId,
                    p_year: year,
                    p_amount: newAmount,
                    p_notes: notes,
                });

            if (updateErr) throw updateErr;

            // Optimistic update: patch local state
            setYearData(prev => {
                if (!prev) return prev;
                const updated = { ...prev };
                updated.sections = prev.sections.map(section => ({
                    ...section,
                    items: section.items.map(item => {
                        if (item.accountId === accountId) {
                            return { ...item, amount: newAmount, verified: true };
                        }
                        // Also check children
                        if (item.children) {
                            return {
                                ...item,
                                children: item.children.map(child =>
                                    child.accountId === accountId
                                        ? { ...child, amount: newAmount, verified: true }
                                        : child
                                ),
                            };
                        }
                        return item;
                    }),
                }));
                return updated;
            });

            return data;
        } catch (err) {
            console.error('[useTaxData] Update failed:', err);
            throw err;
        }
    }, [year]);

    // ─── Toggle verified status ────────────────────────
    const toggleVerified = useCallback(async (accountId) => {
        // Find current verified state
        let currentVerified = false;
        yearData?.sections?.forEach(s => {
            s.items.forEach(item => {
                if (item.accountId === accountId) currentVerified = item.verified;
                item.children?.forEach(child => {
                    if (child.accountId === accountId) currentVerified = child.verified;
                });
            });
        });

        // For now, just toggle locally — full persistence would need a new API
        setYearData(prev => {
            if (!prev) return prev;
            const updated = { ...prev };
            updated.sections = prev.sections.map(section => ({
                ...section,
                items: section.items.map(item => {
                    if (item.accountId === accountId) {
                        return { ...item, verified: !currentVerified };
                    }
                    if (item.children) {
                        return {
                            ...item,
                            children: item.children.map(child =>
                                child.accountId === accountId
                                    ? { ...child, verified: !currentVerified }
                                    : child
                            ),
                        };
                    }
                    return item;
                }),
            }));
            return updated;
        });
    }, [yearData]);

    return {
        loading,
        error,
        yearData,
        carryforwards,
        source,         // 'supabase' or 'static'
        updateAmount,
        toggleVerified,
        reload: loadFromSupabase,
    };
}

// ─────────────────────────────────────────────────────────────
// Transform Supabase rows → TAX_DATA_BY_YEAR viewer shape
// ─────────────────────────────────────────────────────────────
function transformToViewerShape(dbRows, year) {
    // Group by section
    const sectionMap = {};
    const childRows = [];

    for (const row of dbRows) {
        if (row.parent_id) {
            childRows.push(row);
            continue;
        }

        const section = row.section || 'other';
        if (!sectionMap[section]) {
            sectionMap[section] = [];
        }

        sectionMap[section].push({
            id: row.code || row.id,
            accountId: row.id,
            label: row.label,
            formLine: row.form_line,
            amount: row.amount,
            verified: row.verified || false,
            computed: row.is_computed || false,
            expandable: row.is_expandable || false,
            returnSchedule: row.return_schedule,
            category: row.category,
            docs: (row.docs || []).map(d => d.filename),
            source: row.source,
            status: row.status,
            children: [],
        });
    }

    // Attach children to parents
    for (const child of childRows) {
        for (const section of Object.values(sectionMap)) {
            for (const item of section) {
                if (item.accountId === child.parent_id) {
                    item.children.push({
                        id: child.code || child.id,
                        accountId: child.id,
                        label: child.label,
                        amount: child.amount,
                        verified: child.verified || false,
                        returnSchedule: child.return_schedule,
                        category: child.category,
                        docs: (child.docs || []).map(d => d.filename),
                    });
                }
            }
        }
    }

    // Build sections array in correct order
    const sectionOrder = ['income', 'adjustments', 'deductions', 'retirement', 'computation', 'payments'];
    const sections = sectionOrder
        .filter(key => sectionMap[key]?.length > 0)
        .map(key => ({
            id: key,
            title: SECTION_META[key]?.title || key.toUpperCase(),
            color: SECTION_META[key]?.color || '#333',
            items: sectionMap[key],
            subtotal: SECTION_SUBTOTALS[key]
                ? { ...SECTION_SUBTOTALS[key], amount: null } // Could compute from items
                : null,
        }));

    return {
        filing: {
            status: 'Married Filing Jointly',  // Could also come from DB
            taxpayer: 'Jishnu & Deepika Nath',
            dependents: ['Suhavi Nath'],
            preparer: 'David Rumsey CPA',
            returnDoc: `Nath${year}Form1040.pdf`,
        },
        sections,
    };
}

export default useTaxData;
