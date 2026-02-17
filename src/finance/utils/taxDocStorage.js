import { supabase } from '../../lib/supabase';

const BUCKET = 'tax-docs';

/**
 * Get the Supabase Storage base URL for a file in the tax-docs bucket.
 * Uses public URL if bucket is public, signed URL otherwise.
 * 
 * @param {string} storagePath - Path within the bucket (e.g., "{uid}/2017/W2.pdf")
 */
export function getDocUrl(storagePath) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    return data?.publicUrl || '';
}

/**
 * Get a signed (time-limited) URL for private bucket access.
 * @param {string} storagePath 
 * @param {number} expiresIn - Seconds until expiry (default 1 hour)
 */
export async function getSignedDocUrl(storagePath, expiresIn = 3600) {
    const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(storagePath, expiresIn);
    if (error) throw error;
    return data.signedUrl;
}

/**
 * Upload a file to Supabase Storage and register it in the tax_documents table.
 * 
 * @param {File} file - The file to upload
 * @param {number} year - Tax year
 * @param {string} docType - 'RETURN' | 'SUPPORTING' | 'W2' | 'SCHEDULE' | 'ROW_ATTACHMENT'
 */
export async function uploadTaxDocument(file, year, docType = 'SUPPORTING') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const storagePath = `${user.id}/${year}/${file.name}`;

    // Upload to storage
    const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: true,  // Overwrite if exists
        });

    if (uploadErr) throw uploadErr;

    // Register in tax_documents table
    const { data: doc, error: regErr } = await supabase
        .rpc('api_register_tax_document', {
            p_filename: file.name,
            p_storage_path: storagePath,
            p_year: year,
            p_doc_type: docType,
        });

    if (regErr) throw regErr;

    return {
        ...doc,
        publicUrl: getDocUrl(storagePath),
    };
}

/**
 * Batch upload all files from a directory listing.
 * Used by the admin seed flow to upload the 2017 split PDFs.
 * 
 * @param {FileList|File[]} files - Array of File objects
 * @param {number} year 
 * @param {function} onProgress - Callback: (current, total, filename) => void
 */
export async function batchUploadTaxDocuments(files, year, onProgress) {
    const results = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Determine doc type from filename
        let docType = 'SUPPORTING';
        const name = file.name.toLowerCase();
        if (name.includes('form_1040') && !name.includes('1040v')) docType = 'RETURN';
        else if (name.includes('schedule_')) docType = 'SCHEDULE';
        else if (name.includes('w2')) docType = 'W2';
        else if (name.includes('1099')) docType = 'SUPPORTING';
        else if (name.includes('cover_letter')) docType = 'COVER';
        else if (name.includes('voucher')) docType = 'VOUCHER';

        try {
            onProgress?.(i + 1, files.length, file.name);
            const result = await uploadTaxDocument(file, year, docType);
            results.push({ success: true, filename: file.name, ...result });
        } catch (err) {
            results.push({ success: false, filename: file.name, error: err.message });
        }
    }
    return results;
}

/**
 * List all documents for a tax year from Supabase.
 * @param {number} year 
 */
export async function listTaxDocuments(year) {
    const { data, error } = await supabase
        .rpc('api_get_tax_documents', { p_year: year });
    if (error) throw error;
    return data || [];
}
