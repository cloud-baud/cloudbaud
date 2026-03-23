# Tax Dashboard Attachment Implementation

## Overview
This document describes the implementation of the PDF attachment functionality for the Tax Dashboard, allowing users to attach PDF files to individual rows and store them in Supabase.

## Features Implemented

### 1. **Initial State (NULL)**
- All attachments start with no data
- State managed in `rowAttachments` object: `{}`

### 2. **Click to Attach**
- Clicking the paperclip icon opens a file picker
- Only PDF files are accepted
- User selects a file to attach to the specific row

### 3. **Storage in Database & Supabase Storage**
- File is uploaded to Supabase Storage bucket: `tax-docs`
- Database record created in `public.tax_documents` table
- Storage path includes rowId for easy retrieval: `{userId}/general/{timestamp}_{rowId}_{filename}.pdf`

### 4. **Blue Icon Indicator**
- **No attachment**: Grey color (`text-slate-300`)
- **Has attachment**: Blue color (`text-brand-blue`)
- Tooltip shows filename when hovering
- Clicking existing attachment opens file preview panel

## Database Schema

### Tables Used
1. **`public.tax_documents`** - Stores document metadata
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key to auth.users)
   - `filename` (TEXT)
   - `storage_path` (TEXT)
   - `year` (INTEGER, nullable)
   - `doc_type` (TEXT) - e.g., 'ROW_ATTACHMENT', 'RETURN', 'SUPPORTING'
   - `created_at` (TIMESTAMPTZ)

2. **Storage Bucket**: `tax-docs` (in `storage.objects`)

## API Functions Created

### File: `supabase/sql/tax_document_api.sql`

1. **`api_register_tax_document()`** - Register document after upload
   - Parameters: `p_filename`, `p_storage_path`, `p_year`, `p_doc_type`
   - Returns: JSONB document record
   - Security: SECURITY DEFINER with auth check

2. **`api_get_tax_documents()`** - Get all documents
   - Parameters: `p_year` (optional filter)
   - Returns: JSONB array of documents
   - Security: SECURITY DEFINER with auth check

3. **`api_get_row_attachments()`** - Get row attachments specifically
   - Returns: JSONB array of documents where `doc_type = 'ROW_ATTACHMENT'`
   - Security: SECURITY DEFINER with auth check

4. **`api_link_document_to_cell()`** - Link document to cell (legacy)
   - Parameters: `p_section_id`, `p_row_index`, `p_col_key`, `p_doc_id`, `p_page`
   - Returns: JSONB link record

5. **`api_get_cell_links()`** - Get cell links with joined document info
   - Returns: JSONB array with document details

## Frontend Implementation

### Files Modified

#### 1. `TaxDashboard.jsx`
**Added State:**
```javascript
const [rowAttachments, setRowAttachments] = useState({}) // Map: "section-row" -> { fileName, fileUrl, docId }
const [pendingAttachmentRow, setPendingAttachmentRow] = useState(null)
const attachmentInputRef = useRef(null)
```

**Added Functions:**
- `handleAttachmentClick(sectionId, rowIndex)` - Opens file picker
- `handleAttachmentFileChange(e)` - Handles file upload and storage

**Modified:**
- Load row attachments on mount via `getRowAttachments()`
- Attachment cell now interactive with conditional styling
- Added hidden file input for PDF selection

#### 2. `taxService.js`
**Added Functions:**
- `getRowAttachments()` - Retrieve row attachments from database
  - Calls `api_get_row_attachments` RPC function
  - Parses rowId from storage path
  - Returns map: `{rowId: {fileName, fileUrl, docId}}`

**Modified Functions:**
- `uploadTaxDocument()` - Updated to include rowId in filename for ROW_ATTACHMENT types
  - Format: `{userId}/general/{timestamp}_{rowId}_{filename}.pdf`

## Deployment Steps

### 1. Deploy SQL Functions to Supabase
```bash
# Run the following in Supabase SQL Editor:
# Execute: supabase/sql/tax_document_api.sql
```

### 2. Verify Storage Bucket Exists
Ensure the `tax-docs` storage bucket exists with proper policies:
- Users can upload to their own folder (user_id)
- Users can read their own files
- RLS enabled

### 3. Test the Feature
1. Navigate to Tax Dashboard
2. Click a paperclip icon in column B
3. Select a PDF file
4. Verify:
   - Icon turns blue
   - File appears in Supabase Storage
   - Record created in `tax_documents` table
   - Clicking blue icon opens preview panel

## File Structure
```
d:\repos\cloudbaud.com\
├── supabase\
│   └── sql\
│       ├── tax_document_api.sql            # SQL API functions (NEW)
│       └── supabase_tax_storage_setup.sql  # Storage bucket setup (existing)
├── src/
│   ├── finance/
│   │   ├── api/
│   │   │   └── taxService.js               # Updated with getRowAttachments()
│   │   └── dashboards/
│   │       └── TaxDashboard.jsx            # Updated with attachment UI
│   └── ...
```

## Testing Checklist

- [ ] Deploy `supabase/sql/tax_document_api.sql` to Supabase
- [ ] Verify `tax-docs` storage bucket exists
- [ ] Test attachment upload from UI
- [ ] Verify file in Supabase Storage
- [ ] Verify database record created
- [ ] Test attachment retrieval on page reload
- [ ] Test viewing attachment (preview panel)
- [ ] Test multiple attachments on different rows

## Known Limitations

1. **RowId Extraction**: Currently parses rowId from filename pattern. Future improvement: store rowId as metadata in `tax_documents` table.
2. **No Delete**: Delete attachment functionality not yet implemented.
3. **Single Attachment**: Only one attachment per row currently supported.

## Future Enhancements

1. Add metadata column to `tax_documents` for structured row associations
2. Implement delete attachment functionality
3. Support multiple attachments per row
4. Add attachment preview thumbnails
5. Support additional file types (images, etc.)
