
// Retrieve Tax Returns mapped by Year
export const getYearReturns = async () => {
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
};
