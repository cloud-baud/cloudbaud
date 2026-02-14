
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
        // Secure API Call
        const { data, error } = await supabase.rpc('api_get_user_tax_state');

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
        // Secure API Call
        const { error } = await supabase
            .rpc('api_save_user_tax_state', {
                p_years: state.years, 
                p_tax_data: state.taxData, 
                p_col_widths: state.colWidths, 
                p_row_heights: state.rowHeights
            });

        if (error) throw error;
        return true;
    } catch (err) {
        console.error("Error saving tax state:", err);
        return false;
    }
};


// --- V2 API: MULTI-SCHEMA ARCHITECTURE ---

// 1. Client Input Categories (Your personal categories - stable across years)
// 1a. Chart of Accounts (General Ledger)
export const getChartOfAccounts = async () => {
    try {
        const user = await getUser();
        // Secure API Call
        const { data, error } = await supabase.rpc('api_get_chart_of_accounts');
        
        if (error) {
            console.warn("COA fetch failed, falling back", error);
            return [];
        }
        return data;
    } catch (err) {
        console.error("Error fetching COA:", err);
        return [];
    }
};

// 1b. Client Input Categories (Legacy Tax)
export const getClientCategories = async () => {
    try {
        const user = await getUser();
        // Secure API Call
        const { data, error } = await supabase.rpc('api_get_client_categories');
        
        if (error) {
            // Table might not exist in Prod yet, return empty to trigger fallback
            return [];
        }
        return data;
    } catch (err) {
        return [];
    }
};

// 2. Tax Entries for a specific year (from year-specific schema)
export const getTaxEntries = async (year) => {
    if (!year) return [];
    
    const user = await getUser();
    
    // Query from finance schema with year filter
    // Secure API Call
    const { data, error } = await supabase.rpc('api_get_tax_entries', { p_year: year });
    
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
            .rpc('api_update_tax_cell', {
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
        // 2. Create Database Record via Secure API
        const { data: docRecord, error: dbError } = await supabase
            .rpc('api_register_tax_document', {
                p_filename: file.name,
                p_storage_path: uploadData.path,
                p_year: meta.year,
                p_doc_type: meta.type || 'SUPPORTING'
            });

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
    await getUser();
    const { data, error } = await supabase.rpc('api_get_tax_documents', { p_year: year || null });
    
    if (error) throw error;
    return data;
};

// V2 Link: Using Normalized Entry ID instead of generic cell string
export const linkDocumentToEntry = async (entryId, docId, page = 1) => {
    const { error } = await supabase
        .schema('finance')
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
        .rpc('api_link_document_to_cell', {
            p_section_id: sectionId,
            p_row_index: rowIndex,
            p_col_key: colKey,
            p_doc_id: docId,
            p_page: page
        });

    if (error) throw error;
};

export const getCellLinks = async () => {
    await getUser();
    const { data, error } = await supabase.rpc('api_get_cell_links');

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
        await getUser();
        // Use generic doc fetch, then filter in memory if API doesn't support specific type filter yet
        // Or update API to support it. For now, client-side filter is fine for small count.
        const { data, error } = await supabase.rpc('api_get_tax_documents', { p_year: null });

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
