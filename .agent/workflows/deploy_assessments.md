---
description: Update and publish assessment questions to the database
---

# Deploy Assessment Updates

This workflow publishes the latest questions from your local code to the Supabase database. It automatically creates a new version for each capability.

### 1. Update Definitions

Modify the questions in `src/components/assessments/definitions.js` as needed.

### 2. Run Publisher Script

Execute the command for the target environment.

**For Development (Verify first):**

```bash
node scripts/seed_assessment_templates.js --dev
```

**For Production (Live):**

```bash
node scripts/seed_assessment_templates.js --prod
```

### 3. Verification

Check the Supabase Dashboard > Table Editor > `assessment_templates` to see the new rows.

> **Note**: For detailed migration procedures, refer to `docs/DATA_MIGRATION_PLAYBOOK.md`.
