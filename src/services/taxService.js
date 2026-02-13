
import { supabase } from '@/lib/supabase';

// Helper to check user auth
const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    return user;
};

// --- SYNC STATE (LEGACY V1 - Will migrate to V2 Normalized) ---
// Load full dashboard state
export const loadTaxState = async () => {
    try {
        const user = await getUser();
        const { data, error } = await supabase
            .from('user_tax_state')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        if (error) throw error;
        return data || null; // Return null if no state exists yet
    } catch (err) {
        console.error("Error loading tax state:", err);
        return null;
    }
};

// Save full dashboard state (Debounced in UI)
export const saveTaxState = async (state) => {
    try {
        const user = await getUser();
        
        // Upsert based on user_id
        const { error } = await supabase
            .from('user_tax_state')
            .upsert({
                user_id: user.id,
                years: state.years,
                tax_data: state.taxData,
                col_widths: state.colWidths,
                row_heights: state.rowHeights,
                updated_at: new Date()
            }, { onConflict: 'user_id' });

        if (error) throw error;
        return true;
    } catch (err) {
        console.error("Error saving tax state:", err);
        return false;
    }
};


// --- V2 API: MULTI-SCHEMA ARCHITECTURE ---

// 1. Client Input Categories (Your personal categories - stable across years)
export const getClientCategories = async () => {
    const user = await getUser();
    const { data, error } = await supabase
        .from('client_input_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
};

// Keep for backward compatibility
export const getChartOfAccounts = getClientCategories;

// 2. Tax Entries for a specific year (from year-specific schema)
export const getTaxEntries = async (year) => {
    if (!year) return [];
    
    const user = await getUser();
    
    // Query from year-specific schema: tax_2017.client_input_values
    const { data, error } = await supabase
        .from(`tax_${year}.client_input_values`)
        .select(`
            *,
            category:client_input_categories(*)
        `)
        .eq('user_id', user.id);
    
    if (error) {
        console.error(`Error fetching tax entries for ${year}:`, error);
        return [];
    }
    return data || [];
};

// 3. TRANSACTIONAL UPDATE (The "API" Function Wrapper)
/**
 * Updates a single cell value transactionally with audit logging.
 * Uses the Supabase RPC function `update_tax_cell`.
 */
export const updateTaxCell = async (accountId, year, amount, notes = null) => {
    try {
        await getUser(); // Auth check locally first
        
        const { data, error } = await supabase
            .rpc('update_tax_cell', {
                p_account_id: accountId,
                p_year: year,
                p_amount: amount,
                p_notes: notes
            });

        if (error) throw error;
        return data; // Returns the updated entry JSON
    } catch (err) {
        console.error("Failed to update tax cell:", err);
        throw err;
    }
};

// --- DOCUMENT MANAGEMENT ---

// Upload a generic tax document
export const uploadTaxDocument = async (file, meta = {}) => {
    try {
        const user = await getUser();
        // const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${meta.year || 'general'}/${Date.now()}_${file.name}`;
        
        // 1. Upload to Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('tax-docs')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // 2. Create Database Record
        const { data: docRecord, error: dbError } = await supabase
            .from('tax_documents')
            .insert({
                user_id: user.id,
                filename: file.name,
                year: meta.year,
                doc_type: meta.type || 'SUPPORTING',
                storage_path: uploadData.path,
                created_at: new Date()
            })
            .select()
            .single();

        if (dbError) throw dbError;
        
        // Get Public URL (or Signed URL if private)
        // Assuming public bucket for now based on user request "collaborative"
        // Ideally signed URLs for tax docs.
        const { data: { publicUrl } } = supabase.storage.from('tax-docs').getPublicUrl(uploadData.path);

        return { ...docRecord, publicUrl };

    } catch (err) {
        console.error("Error uploading document:", err);
        throw err;
    }
};

// Retrieve documents for a Cell Link
export const getMyDocuments = async (year) => {
    const user = await getUser();
    let query = supabase.from('tax_documents').select('*').eq('user_id', user.id);
    if (year) query = query.eq('year', year);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
};

// V2 Link: Using Normalized Entry ID instead of generic cell string
export const linkDocumentToEntry = async (entryId, docId, page = 1) => {
    const { error } = await supabase
        .from('entry_evidence')
        .insert({
            entry_id: entryId,
            document_id: docId,
            page_number: page
        });
    if (error) throw error;
};


// Legacy V1 Link
export const linkDocumentToCell = async (cellId, docId, page = 1) => {
    const user = await getUser();
    const { sectionId, rowIndex, colKey } = cellId;

    const { error } = await supabase
        .from('tax_cell_references')
        .upsert({
            user_id: user.id,
            section_id: sectionId,
            row_index: rowIndex,
            col_key: colKey,
            document_id: docId,
            page_number: page
        }, { onConflict: 'user_id, section_id, row_index, col_key' });

    if (error) throw error;
};

export const getCellLinks = async () => {
    const user = await getUser();
    const { data, error } = await supabase
        .from('tax_cell_references')
        .select(`
            *,
            document:tax_documents(*)
        `)
        .eq('user_id', user.id);

    if (error) throw error;
    
    // Transform to map for easier UI consumption: "section-row-col" -> LinkObj
    const linkMap = {};
    data.forEach(link => {
        const key = `${link.section_id}-${link.row_index}-${link.col_key}`;
        // Generate URL for document
        const { data: { publicUrl } } = supabase.storage.from('tax-docs').getPublicUrl(link.document.storage_path);
        
        linkMap[key] = {
            fileName: link.document.filename,
            fileUrl: publicUrl,
            page: link.page_number,
            docId: link.document_id
        };
    });
    return linkMap;
};

// Retrieve Tax Returns mapped by Year
export const getYearReturns = async () => {
    try {
        const user = await getUser();
        const { data, error } = await supabase
            .from('tax_documents')
            .select('*')
            .eq('user_id', user.id)
            .eq('doc_type', 'RETURN');

        if (error) throw error;

        const returnMap = {};
        data.forEach(doc => {
            if (!doc.year) return;
            const { data: { publicUrl } } = supabase.storage.from('tax-docs').getPublicUrl(doc.storage_path);
            returnMap[doc.year] = {
                fileName: doc.filename,
                fileUrl: publicUrl,
                docId: doc.id
            };
        });
        return returnMap;
    } catch (err) {
        console.error("Error fetching year returns:", err);
        return {};
    }
};
