# 🚀 DEPLOYMENT GUIDE - Marketing Schema Competency Platform

## ✅ What Changed (V2 - Multi-Industry)

### Schema Organization
- ✅ **All tables moved to `marketing` schema** (proper separation of concerns)
- ✅ **Normalized multi-industry design** (Unity Catalog × Healthcare, × Finance, etc.)
- ✅ **Technology tagging** (Microsoft Entra ID, Unity Catalog, HL7, FHIR, etc.)
- ✅ **Cross-schema references** (marketing → public.industries)

### Database Structure
```
marketing/
├── technologies         -- Atomic tech tags (Unity Catalog, Entra ID, etc.)
├── competencies        -- High-level capabilities (Unity Catalog Governance)
├── competency_demos    -- Industry-specific demos (UC × Healthcare, UC × Finance)
├── competency_technologies  -- Many-to-many: Competency → Technology
├── demo_technologies   -- Many-to-many: Demo → Technology
├── demo_analytics      -- User interaction tracking
└── user_challenge_results  -- Assessment scores for authenticated users
```

---

## 📋 STEP 1: Deploy Schema (5 minutes)

### A. Copy Schema SQL
The schema SQL is **already in your clipboard**.

### B. Paste into Supabase
1. **Supabase tab should be open** at: `https://app.supabase.com/project/mvyavzjzdinelcufpzek/sql/new`
2. **Clear editor**: Press `Ctrl+A`
3. **Paste schema**: Press `Ctrl+V`
4. **Run**: Click green "RUN" button (bottom right)
5. **Verify success**: Green checkmark appears

### C. What Gets Created
- ✅ `marketing` schema
- ✅ 7 tables (technologies, competencies, demos, analytics, etc.)
- ✅ RLS policies (public read, authenticated write)
- ✅ Indexes for performance
- ✅ Triggers for updated_at timestamps

---

## 📋 STEP 2: Deploy Seed Data (3 minutes)

### A. Prepare Clipboard
Run this command to copy seed data:
```powershell
Get-Content supabase_competencies_v2_seed.sql -Raw | Set-Clipboard
```

### B. Paste into Supabase
1. **Same SQL editor** (clear previous query)
2. **Press** `Ctrl+A` then `Ctrl+V`
3. **Run**: Click "RUN" button
4. **Verify success**: Green checkmark

### C. What Gets Seeded
- ✅ **22 Technologies** (Azure Databricks, Unity Catalog, Microsoft Entra ID, HL7, FHIR, Terraform, etc.)
- ✅ **4 Competencies** (Unity Catalog, Delta Lake, Terraform, Healthcare Integration)
- ✅ **4 Industry Demos**:
  - Unity Catalog × Healthcare (HIPAA compliance)
  - Unity Catalog × Finance (SOX compliance)
  - Delta Lake × Healthcare (instant recovery)
  - HL7 Processing × Healthcare (10K msg/day automation)

---

## 📋 STEP 3: Verify Deployment (2 minutes)

### Option A: Supabase Table Editor
1. Go to: `https://app.supabase.com/project/mvyavzjzdinelcufpzek/editor`
2. Look for `marketing` schema in left sidebar
3. Open `competency_demos` table
4. **Should see 4 rows**:
   - `unity-catalog-healthcare`
   - `unity-catalog-finance`
   - `delta-lake-healthcare`
   - `hl7-processing-healthcare`

### Option B: SQL Query
Run this in SQL Editor:
```sql
SELECT 
  cd.slug as demo_slug,
  c.title as competency,
  i.name as industry,
  cd.tagline
FROM marketing.competency_demos cd
JOIN marketing.competencies c ON cd.competency_id = c.id
JOIN public.industries i ON cd.industry_id = i.id;
```

**Expected output**: 4 rows with industry-specific taglines

---

## 📋 STEP 4: Test Frontend ( ongoing - auto-reloading)

### Dev server is already running!
Check these URLs:

#### Healthcare Demos:
- http://localhost:5173/competencies/unity-catalog-healthcare
- http://localhost:5173/competencies/delta-lake-healthcare
- http://localhost:5173/competencies/hl7-processing-healthcare

#### Finance Demo:
- http://localhost:5173/competencies/unity-catalog-finance

### What to Look For:
1. ✅ **Hero section** loads with competency title
2. ✅ **Industry badge** shows (e.g., "Core Platform • Healthcare")
3. ✅ **Fear factor alert** displays (HIPAA fines or SOX penalties)
4. ✅ **Interactive demo** renders (React Flow diagram)
5. ✅ **Before/After metrics** show industry-specific ROI
6. ✅ **No console errors** in browser DevTools

---

## 🔍 Troubleshooting

### Issue: "relation does not exist"
**Problem**: RLS policies might not recognize the schema  
**Solution**: Ensure grants were applied:
```sql
GRANT USAGE ON SCHEMA marketing TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA marketing TO anon, authenticated;
```

### Issue: "No demo found"
**Problem**: Seed data didn't insert (foreign key constraint)  
**Check**: Do you have `healthcare` and `finance` in `public.industries`?  
**Solution**: Insert industries first if missing:
```sql
INSERT INTO public.industries (slug, name, icon) VALUES
('healthcare', 'Healthcare', 'Activity'),
('finance', 'Finance', 'TrendingUp')
ON CONFLICT DO NOTHING;
```

### Issue: Frontend shows nested null errors
**Problem**: Supabase query needs explicit schema prefix  
**Check**: Ensure frontend uses `.from('competency_demos')` (Supabase auto-detects marketing schema)

---

## 📊 Analytics Verification

After testing, check if analytics are being tracked:
```sql
SELECT 
  cd.slug,
  da.interaction_type,
  da.created_at
FROM marketing.demo_analytics da
JOIN marketing.competency_demos cd ON da.demo_id = cd.id
ORDER BY da.created_at DESC
LIMIT 10;
```

You should see `view` and interaction events.

---

## 🎯 Next Steps (Phase 2)

Once V2 is deployed and tested:

### 1. Add More Industry Demos
- Unity Catalog × Retail (PCI compliance)
- Delta Lake × Finance (trading data recovery)
- Terraform × Healthcare (production rebuild scenarios)

### 2. Build Interactive Calculators
- Cost Optimization: "How much are you wasting?"
- HL7 Processing: "Manual vs automated ROI"

### 3. Create Admin Dashboard
- View top-performing demos by industry
- Track conversion rates (view → contact)
- Identify high-intent prospects

### 4. Email Drip Campaigns
- Segment by viewed demo (healthcare vs finance)
- Target users who viewed but didn't convert
- Personalized follow-ups with specific ROI

---

## ✅ Deployment Checklist

- [ ] Schema deployed to `marketing` schema
- [ ] Seed data inserted (4 demos visible)
- [ ] `marketing.competency_demos` table has 4 rows
- [ ] `marketing.technologies` has 22 rows
- [ ] Frontend loads `/competencies/unity-catalog-healthcare`
- [ ] Interactive React Flow diagram renders
- [ ] Fear factor alert shows industry-specific messaging
- [ ] Before/After metrics display correctly
- [ ] Analytics tracking verified (check `demo_analytics`)
- [ ] No browser console errors

---

**Status**: Ready to deploy! Schema is in clipboard, frontend is updated, dev server is running.

**Next**: Paste SQL into Supabase and test the first demo! 🚀
