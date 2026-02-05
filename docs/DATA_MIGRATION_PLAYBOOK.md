# CloudBaud Data Migration Playbook

This document outlines the standard operating procedures for managing database schema and content migrations between Development and Production environments for the CloudBaud platform.

## 🏗 Architecture Overview

We utilize a **Code-First** migration strategy.

- **Source of Truth**: The Git repository (SQL files for schema, JS definitions for assessment content).
- **Development (DEV)**: Used for prototyping, testing new assessment flows, and verifying schema changes.
- **Production (PROD)**: The live environment. Changes are only applied here after validation in Dev.

---

## 🚀 Workflow 1: Promoting Assessment Content

When you update questions in `src/components/assessments/definitions.js`, follow this process to release them.

### Phase 1: Local Development & Verification

1. Edit the definitions file locally.
2. Publish to the **Development** database:

   ```bash
   node scripts/seed_assessment_templates.js --dev
   ```

   *This creates a new version (e.g., v2) in the Dev DB and marks it active.*

3. Verify on Localhost:
   - Ensure your `.env` is NOT forcing Prod mode (Comment out `VITE_USE_PROD_ON_LOCALHOST`).
   - Run the app: `npm run dev`.
   - Navigate to the assessment and verify the questions, logic, and flow.

### Phase 2: Production Release

Once verified in Dev, promote the **exact same code** to Production.

1. Commit your changes to Git.
2. Run the publisher script targeting **Production**:

   ```bash
   node scripts/seed_assessment_templates.js --prod
   ```

   *This creates a new version in the Prod DB and marks it active immediately.*

3. Verify:
   - Check the live site (or Localhost forced to Prod mode).

---

## 🛠 Workflow 2: Database Schema Changes

When modifying tables (e.g., adding user columns, changing RLS policies).

### Phase 1: Create & Test Migration

1. Create/Update a SQL file (e.g., `updates_v2.sql`).
2. Run the migration against **Development**:

   ```bash
   node scripts/migrate_sql.js --dev
   ```

   *Note: Ensure `updates_v2.sql` is referenced in the script or modify the script to point to your new file.*

3. Verify the schema changes in the Supabase Dashboard (Dev Project).

### Phase 2: Production Apply

1. Run the migration against **Production**:

   ```bash
   node scripts/migrate_sql.js --prod
   ```

---

## ⚠️ Troubleshooting & Safety

- **Safety Lock**: The seed scripts now require explicit `--dev` or `--prod` flags. Running without flags will error out to prevent accidental Prod deployment.
- **Version Rollback**: If a bad assessment version is deployed:
  1. Go to Supabase Dashboard > Table Editor > `assessment_templates`.
  2. Find the previous version (e.g., v1).
  3. Set `is_active = TRUE`.
  4. Set the bad version (e.g., v2) `is_active = FALSE`.
  5. The frontend will immediately revert (no code deploy needed).

## 🔑 Environment Variables

Ensure your `.env` matches this structure:

```ini
# --- PRODUCTION ---
VITE_SUPABASE_URL_PROD=...
VITE_SUPABASE_SERVICE_ROLE_KEY_PROD=...
VITE_SUPABASE_DB_PASSWORD_PROD=...

# --- DEVELOPMENT ---
VITE_SUPABASE_URL_TEST=...
VITE_SUPABASE_SERVICE_ROLE_KEY_TEST=...
VITE_SUPABASE_DB_PASSWORD_TEST=...
```
