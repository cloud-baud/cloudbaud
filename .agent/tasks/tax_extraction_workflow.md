---
description: Tax Dashboard Data Extraction Workflow
---

# Tax Dashboard Data Extraction & Import Workflow

This workflow tracks the implementation status of the "Agentic Data Extraction" user story for the Tax Dashboard.

## User Story
As a user, I want to upload a tax document (PDF) for a specific line item, have a local AI agent extract the data, verify it, and then automatically import the values into the tax grid, locking the cells and updating the checklist.

## Implementation Steps

- [ ] **1. UI: Ribbond-Based Upload**
  - [ ] Add "Upload" button to `Ribbon.jsx` (File Tab).
  - [ ] Triggers file selection dialog.
  - [ ] Requires user to select a target row/cell in the grid first (or select it during upload?). *Decision: Select row first in grid, then click Upload in Ribbon.*

- [ ] **2. UI: File Preview Pane**
  - [ ] Display uploaded PDF in the right-hand `FilePreview` pane.
  - [ ] Pane should persist/show when a row with an attachment is selected.

- [ ] **3. Agent: Extraction Trigger & Logic**
  - [ ] Add "Run Extraction" button in the Ribbon or File Pane.
  - [ ] **Integration**: Use `OLLAMA` (local model) for extraction.
  - [ ] **Prompt Engineering**: System prompt to extract structured data (Line Item Amount, Year, Category) from the PDF text.

- [ ] **4. UI: Agentic Chat Interface**
  - [ ] Display extracted fields in the "Team Chat" / "Agent" tab on the right.
  - [ ] Present data as a "Draft Import" card (e.g., "Found $1,200 for 2024 W2 Wages. Import?").
  - [ ] Buttons for "Confirm Import" and "Reject/Edit".

- [ ] **5. Backend: Data Persistence**
  - [ ] **Save Values**: Update `finance.tax_entries` table with extracted amounts.
  - [ ] **Save Document**: Store PDF in `storage.objects` (or `tax-docs` bucket).
  - [ ] **Link Document**: Create record in `finance.entry_evidence` linking the `entry_id` to the `document_id`.

- [ ] **6. UI: Post-Import Updates**
  - [ ] **Lock Cells**: Grey out the updated cells (read-only) to indicate "Final" status.
  - [ ] **Checklist**: Automatically check the corresponding item in the "Filing Checklist".
  - [ ] **Attachment Icon**: Show an attachment/paperclip icon next to the row label.

## Technical Notes
- **Ollama Integration**: Ensure local Ollama instance is reachable (default port 11434).
- **State Management**: Need to track `selectedRow` state in `TaxDashboard` to know where to attach the uploaded file.
- **Security**: Uploaded files should be associated with the current user/tenant.
