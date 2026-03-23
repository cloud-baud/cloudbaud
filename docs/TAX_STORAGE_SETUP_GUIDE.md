# Tax Dashboard Storage Setup Guide

## Problem
When uploading files in the Tax Dashboard, you're getting the error: **"Upload failed: Bucket not found"**

## Solution
The Supabase storage bucket `tax-docs` needs to be created. Follow these steps:

---

## Step 1: Access Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)

---

## Step 2: Run the Setup Script

1. Open the file: `supabase/sql/supabase_tax_storage_setup.sql`
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

---

## Step 3: Verify the Bucket Was Created

1. In Supabase dashboard, go to **Storage** (in the left sidebar)
2. You should now see a bucket named **`tax-docs`**
3. Click on it to verify it's accessible

---

## What This Script Does

### Storage Bucket
- Creates the `tax-docs` storage bucket (set to public for now)
- Sets up RLS policies so users can only access their own files
- Files are organized by user ID: `{user_id}/{year}/{timestamp}_{filename}`

### Database Tables
- **`tax_documents`**: Stores metadata about uploaded files
  - Links to storage paths
  - Tracks document type (RETURN, SUPPORTING, W2, etc.)
  - Associates documents with tax years
  
- **`tax_cell_references`**: Links spreadsheet cells to documents
  - Enables the "click cell to view document" feature
  - Tracks which page of a document is relevant

### Security
- All tables have Row Level Security (RLS) enabled
- Users can only see/modify their own data
- File access is restricted to the user who uploaded them

---

## Alternative: Quick Setup via Supabase UI

If you prefer not to run SQL:

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name it: `tax-docs`
4. Set to **Public** (or Private if you want to use signed URLs)
5. Click **Create bucket**

Then run just the database table portion of the SQL script.

---

## Testing

After setup, try uploading a file again in the Tax Dashboard:
1. Click "Open Return" or "Link Doc" in the ribbon
2. Select a PDF file
3. The file should upload successfully
4. You should see it in the file preview panel

---

## Troubleshooting

### If you still get "Bucket not found":
- Verify the bucket name is exactly `tax-docs` (no spaces, lowercase)
- Check that your Supabase environment variables are correct in `.env`
- Make sure you're logged in (authenticated) when uploading

### If you get "Permission denied":
- Verify the RLS policies were created correctly
- Check that you're authenticated (logged in)
- Verify your user ID matches the folder structure

### To check if bucket exists:
Run this query in SQL Editor:
```sql
SELECT * FROM storage.buckets WHERE id = 'tax-docs';
```

---

## Production Considerations

For production deployment, consider:

1. **Make bucket private**:
   ```sql
   UPDATE storage.buckets SET public = false WHERE id = 'tax-docs';
   ```
   Then update `taxService.js` to use signed URLs instead of public URLs

2. **Add file size limits** in storage bucket settings

3. **Enable versioning** if you want to keep file history

4. **Set up automated backups** for the storage bucket
