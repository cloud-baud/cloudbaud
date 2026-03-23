# Making Attachments Year-Aware

## Problem
Currently, row attachments are NOT year-specific. They use key format:
```
rowId = `${sectionId}-${rowIndex}`  // e.g., "w2-0"
```

This means a W2 attachment for 2024 shows for ALL years (2017, 2018, etc.)

## Solution
Make attachments year-specific by changing the key format to:
```
rowId = `${sectionId}-${rowIndex}-${year}`  // e.g., "w2-0-2024"
```

## Changes Required

### 1. Update TaxDashboard.jsx - Attachment Click Handler
**Current (Line 594-597):**
```javascript
const handleAttachmentClick = (sectionId, rowIndex) => {
    setPendingAttachmentRow({ sectionId, rowIndex });
    if (attachmentInputRef.current) attachmentInputRef.current.click();
};
```

**New:**
```javascript
const handleAttachmentClick = (sectionId, rowIndex, year) => {
    setPendingAttachmentRow({ sectionId, rowIndex, year });
    if (attachmentInputRef.current) attachmentInputRef.current.click();
};
```

### 2. Update TaxDashboard.jsx - File Upload Handler
**Current (Line 600-633):**
```javascript
const handleAttachmentFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file && pendingAttachmentRow) {
        const { sectionId, rowIndex } = pendingAttachmentRow;
        const rowId = `${sectionId}-${rowIndex}`;  // ❌ MISSING YEAR
        
        // ... rest of upload logic
    }
};
```

**New:**
```javascript
const handleAttachmentFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file && pendingAttachmentRow) {
        const { sectionId, rowIndex, year } = pendingAttachmentRow;
        const rowId = `${sectionId}-${rowIndex}-${year}`;  // ✅ INCLUDES YEAR
        
        // Upload with year metadata
        const doc = await uploadTaxDocument(file, { 
            type: 'ROW_ATTACHMENT', 
            rowId,
            year  // ✅ Pass year to backend
        });
        
        // ... rest of upload logic
    }
};
```

### 3. Update TaxDashboard.jsx - Attachment Cell Rendering
**Current (Lines 1463-1475):**
```javascript
onClick={(e) => {
    e.stopPropagation();
    const rowId = `${section.id}-${rowIndex}`;  // ❌ MISSING YEAR
    const attachment = rowAttachments[rowId];
    if (attachment) {
        setFilePreviewUrl(attachment.fileUrl);
        setShowFilePanel(true);
    } else {
        handleAttachmentClick(section.id, rowIndex);  // ❌ MISSING YEAR
    }
}}
```

**New:**
```javascript
onClick={(e) => {
    e.stopPropagation();
    // Get the selected year from URL params or first visible year
    const selectedYear = searchParams.get('year') || visibleYears[0];
    const rowId = `${section.id}-${rowIndex}-${selectedYear}`;  // ✅ INCLUDES YEAR
    const attachment = rowAttachments[rowId];
    if (attachment) {
        setFilePreviewUrl(attachment.fileUrl);
        setShowFilePanel(true);
    } else {
        handleAttachmentClick(section.id, rowIndex, selectedYear);  // ✅ PASS YEAR
    }
}}
```

### 4. Update taxService.js - uploadTaxDocument
**Current:**
```javascript
if (meta.type === 'ROW_ATTACHMENT' && meta.rowId) {
    fileName = `${user.id}/general/${Date.now()}_${meta.rowId}_${file.name}`;
}
```

**New:**
```javascript
if (meta.type === 'ROW_ATTACHMENT' && meta.rowId) {
    fileName = `${user.id}/general/${Date.now()}_${meta.rowId}_${file.name}`;
    // Register with year
    const { data: doc, error: docError } = await supabase.rpc('api_register_tax_document', {
        p_filename: file.name,
        p_storage_path: fileName,
        p_year: meta.year,  // ✅ Include year in database
        p_doc_type: meta.type
    });
}
```

### 5. Update taxService.js - getRowAttachments
**Current:**
Parses rowId from filename and creates map without year consideration

**New:**
```javascript
export const getRowAttachments = async () => {
    try {
        await getUser();
        const { data, error } = await supabase.rpc('api_get_row_attachments');
        if (error) throw error;

        const attachmentMap = {};
        data.forEach(doc => {
            // Extract rowId from storage path
            const pathParts = doc.storage_path.split('/');
            const filenamePart = pathParts[pathParts.length - 1];
            const match = filenamePart.match(/_([^_]+)_/);
            
            if (match) {
                const rowId = match[1];  // Now includes year: "w2-0-2024"
                const { data: { publicUrl } } = supabase.storage
                    .from('tax-docs')
                    .getPublicUrl(doc.storage_path);
                
                attachmentMap[rowId] = {
                    fileName: doc.filename,
                    fileUrl: publicUrl,
                    docId: doc.id,
                    year: doc.year  // ✅ Include year in attachment data
                };
            }
        });
        return attachmentMap;
    } catch (err) {
        console.error("Error fetching row attachments:", err);
        return {};
    }
};
```

## Testing Checklist
- [ ] Upload W2 for 2024 → Should ONLY show blue icon in 2024 column
- [ ] Switch to 2023 → Icon should be GREY (no attachment)
- [ ] Upload same row for 2023 → Should show blue for 2023, still blue for 2024
- [ ] Refresh page → Both attachments should persist correctly
- [ ] Click attachment → Should open correct year's PDF

## Database Consideration
The `year` column already exists in `finance.tax_documents`, so no schema changes needed!
