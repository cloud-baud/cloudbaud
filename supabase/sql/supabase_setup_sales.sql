-- ============================================================
-- Sales Schema Migration — CloudBaud ERP
-- Schema: sales  (isolated ERP module namespace)
--
-- Tables:    sales.pipeline_templates
--            sales.pipeline_stage_templates
--            sales.deals
--            sales.deal_activities
--            sales.deal_contacts  (FK → public.contacts)
--
-- Objects:   sales.convert_template_to_deal()  RPC
--            sales.deals_with_stage_info        view
--            sales.seed_demo_data()             dev seed
--
-- Permissions: authenticated role gets USAGE on sales schema
--              + SELECT/INSERT/UPDATE/DELETE on all tables
--
-- Safe to re-run (IF NOT EXISTS / OR REPLACE throughout)
-- ============================================================
-- ─────────────────────────────────────────────────────────────
-- 0. CREATE SCHEMA + GRANT ACCESS
-- ─────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS sales;
-- Allow Supabase authenticated users to see the schema
GRANT USAGE ON SCHEMA sales TO authenticated;
GRANT USAGE ON SCHEMA sales TO anon;
-- Allow PostgREST to expose the schema via the API
-- (Add 'sales' to your Supabase exposed schemas in API settings)
-- ─────────────────────────────────────────────────────────────
-- SHARED TRIGGER: auto-stamp updated_at
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sales.set_updated_at() RETURNS trigger AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- ============================================================
-- 1. PIPELINE TEMPLATES
--    Named, reusable pipeline configurations.
--    e.g. "Standard B2B 7-Stage", "Fast-Track SaaS"
-- ============================================================
CREATE TABLE IF NOT EXISTS sales.pipeline_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE sales.pipeline_templates ENABLE ROW LEVEL SECURITY;
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON sales.pipeline_templates TO authenticated;
DROP POLICY IF EXISTS "Users see own pipeline templates" ON sales.pipeline_templates;
DROP POLICY IF EXISTS "Users insert own pipeline templates" ON sales.pipeline_templates;
DROP POLICY IF EXISTS "Users update own pipeline templates" ON sales.pipeline_templates;
DROP POLICY IF EXISTS "Users delete own pipeline templates" ON sales.pipeline_templates;
CREATE POLICY "Users see own pipeline templates" ON sales.pipeline_templates FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own pipeline templates" ON sales.pipeline_templates FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own pipeline templates" ON sales.pipeline_templates FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own pipeline templates" ON sales.pipeline_templates FOR DELETE USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS trig_pipeline_templates_updated_at ON sales.pipeline_templates;
CREATE TRIGGER trig_pipeline_templates_updated_at BEFORE
UPDATE ON sales.pipeline_templates FOR EACH ROW EXECUTE FUNCTION sales.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_pipeline_templates_user ON sales.pipeline_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_templates_default ON sales.pipeline_templates(user_id, is_default);
-- ============================================================
-- 2. PIPELINE STAGE TEMPLATES
--    Ordered stages within a pipeline template.
-- ============================================================
CREATE TABLE IF NOT EXISTS sales.pipeline_stage_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id uuid NOT NULL REFERENCES sales.pipeline_templates(id) ON DELETE CASCADE,
    stage_key text NOT NULL,
    -- 'prospect' | 'qualify' | 'develop' | ...
    label text NOT NULL,
    -- Display label
    sort_order int NOT NULL DEFAULT 0,
    default_probability int NOT NULL DEFAULT 50 CHECK (
        default_probability BETWEEN 0 AND 100
    ),
    color_accent text,
    -- hex: '#3b82f6'
    default_actions jsonb NOT NULL DEFAULT '[]'::jsonb,
    UNIQUE (template_id, stage_key)
);
ALTER TABLE sales.pipeline_stage_templates ENABLE ROW LEVEL SECURITY;
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON sales.pipeline_stage_templates TO authenticated;
DROP POLICY IF EXISTS "Users see own stage templates" ON sales.pipeline_stage_templates;
DROP POLICY IF EXISTS "Users insert own stage templates" ON sales.pipeline_stage_templates;
DROP POLICY IF EXISTS "Users update own stage templates" ON sales.pipeline_stage_templates;
DROP POLICY IF EXISTS "Users delete own stage templates" ON sales.pipeline_stage_templates;
CREATE POLICY "Users see own stage templates" ON sales.pipeline_stage_templates FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM sales.pipeline_templates t
            WHERE t.id = template_id
                AND t.user_id = auth.uid()
        )
    );
CREATE POLICY "Users insert own stage templates" ON sales.pipeline_stage_templates FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM sales.pipeline_templates t
            WHERE t.id = template_id
                AND t.user_id = auth.uid()
        )
    );
CREATE POLICY "Users update own stage templates" ON sales.pipeline_stage_templates FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM sales.pipeline_templates t
            WHERE t.id = template_id
                AND t.user_id = auth.uid()
        )
    );
CREATE POLICY "Users delete own stage templates" ON sales.pipeline_stage_templates FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM sales.pipeline_templates t
        WHERE t.id = template_id
            AND t.user_id = auth.uid()
    )
);
CREATE INDEX IF NOT EXISTS idx_stage_templates_template ON sales.pipeline_stage_templates(template_id);
CREATE INDEX IF NOT EXISTS idx_stage_templates_order ON sales.pipeline_stage_templates(template_id, sort_order);
-- ============================================================
-- 3. DEALS  (live transaction / opportunity)
--    Spawned from a pipeline template via convert_template_to_deal().
-- ============================================================
CREATE TABLE IF NOT EXISTS sales.deals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id uuid REFERENCES sales.pipeline_templates(id) ON DELETE
    SET NULL,
        -- Core identifiers
        name text NOT NULL,
        company text,
        contact_name text,
        contact_email text,
        -- Financials
        value numeric(15, 2) NOT NULL DEFAULT 0,
        currency text NOT NULL DEFAULT 'USD',
        -- Pipeline position
        stage_key text NOT NULL DEFAULT 'prospect',
        probability int NOT NULL DEFAULT 10 CHECK (
            probability BETWEEN 0 AND 100
        ),
        priority text NOT NULL DEFAULT 'medium' CHECK (
            priority IN ('low', 'medium', 'high', 'critical')
        ),
        -- Lifecycle status
        status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'on_hold')),
        -- Dates
        expected_close_date date,
        closed_at timestamptz,
        -- Ownership & metadata
        owner_name text,
        source text,
        -- 'cold-call' | 'referral' | 'inbound' | 'partner'
        tags text [] NOT NULL DEFAULT '{}',
        custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
        notes text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE sales.deals ENABLE ROW LEVEL SECURITY;
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON sales.deals TO authenticated;
DROP POLICY IF EXISTS "Users see own deals" ON sales.deals;
DROP POLICY IF EXISTS "Users insert own deals" ON sales.deals;
DROP POLICY IF EXISTS "Users update own deals" ON sales.deals;
DROP POLICY IF EXISTS "Users delete own deals" ON sales.deals;
CREATE POLICY "Users see own deals" ON sales.deals FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own deals" ON sales.deals FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own deals" ON sales.deals FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own deals" ON sales.deals FOR DELETE USING (auth.uid() = user_id);
-- Auto-stamp updated_at
DROP TRIGGER IF EXISTS trig_deals_updated_at ON sales.deals;
CREATE TRIGGER trig_deals_updated_at BEFORE
UPDATE ON sales.deals FOR EACH ROW EXECUTE FUNCTION sales.set_updated_at();
-- Auto-stamp closed_at when status transitions to won/lost
CREATE OR REPLACE FUNCTION sales.stamp_closed_at() RETURNS trigger AS $$ BEGIN IF NEW.status IN ('won', 'lost')
    AND OLD.status = 'open' THEN NEW.closed_at = now();
ELSIF NEW.status = 'open' THEN NEW.closed_at = NULL;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trig_deals_closed_at ON sales.deals;
CREATE TRIGGER trig_deals_closed_at BEFORE
UPDATE ON sales.deals FOR EACH ROW EXECUTE FUNCTION sales.stamp_closed_at();
CREATE INDEX IF NOT EXISTS idx_deals_user ON sales.deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON sales.deals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON sales.deals(user_id, stage_key);
CREATE INDEX IF NOT EXISTS idx_deals_priority ON sales.deals(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_deals_template ON sales.deals(template_id);
CREATE INDEX IF NOT EXISTS idx_deals_close_date ON sales.deals(expected_close_date);
-- ============================================================
-- 4. DEAL ACTIVITIES
--    Timestamped event log per deal: calls, emails, meetings,
--    tasks, demos, proposals, notes.
-- ============================================================
CREATE TABLE IF NOT EXISTS sales.deal_activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id uuid NOT NULL REFERENCES sales.deals(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type text NOT NULL DEFAULT 'note' CHECK (
        activity_type IN (
            'call',
            'email',
            'meeting',
            'note',
            'task',
            'demo',
            'proposal'
        )
    ),
    title text NOT NULL,
    notes text,
    activity_date timestamptz NOT NULL DEFAULT now(),
    is_completed boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE sales.deal_activities ENABLE ROW LEVEL SECURITY;
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON sales.deal_activities TO authenticated;
DROP POLICY IF EXISTS "Users see own deal activities" ON sales.deal_activities;
DROP POLICY IF EXISTS "Users insert own deal activities" ON sales.deal_activities;
DROP POLICY IF EXISTS "Users update own deal activities" ON sales.deal_activities;
DROP POLICY IF EXISTS "Users delete own deal activities" ON sales.deal_activities;
CREATE POLICY "Users see own deal activities" ON sales.deal_activities FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own deal activities" ON sales.deal_activities FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own deal activities" ON sales.deal_activities FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own deal activities" ON sales.deal_activities FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_deal_activities_deal ON sales.deal_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_activities_user ON sales.deal_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_deal_activities_type ON sales.deal_activities(deal_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_deal_activities_date ON sales.deal_activities(activity_date DESC);
-- ============================================================
-- 5. DEAL CONTACTS  (many-to-many: deals ↔ public.contacts)
--    Cross-schema FK: deal stakeholders are stored in the
--    shared public.contacts table (CRM module).
-- ============================================================
CREATE TABLE IF NOT EXISTS sales.deal_contacts (
    deal_id uuid NOT NULL REFERENCES sales.deals(id) ON DELETE CASCADE,
    contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'stakeholder' CHECK (
        role IN (
            'decision-maker',
            'champion',
            'stakeholder',
            'influencer',
            'blocker'
        )
    ),
    PRIMARY KEY (deal_id, contact_id)
);
ALTER TABLE sales.deal_contacts ENABLE ROW LEVEL SECURITY;
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON sales.deal_contacts TO authenticated;
DROP POLICY IF EXISTS "Users see own deal contacts" ON sales.deal_contacts;
DROP POLICY IF EXISTS "Users manage own deal contacts" ON sales.deal_contacts;
CREATE POLICY "Users see own deal contacts" ON sales.deal_contacts FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM sales.deals d
            WHERE d.id = deal_id
                AND d.user_id = auth.uid()
        )
    );
CREATE POLICY "Users manage own deal contacts" ON sales.deal_contacts FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM sales.deals d
        WHERE d.id = deal_id
            AND d.user_id = auth.uid()
    )
);
CREATE INDEX IF NOT EXISTS idx_deal_contacts_deal ON sales.deal_contacts(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_contacts_contact ON sales.deal_contacts(contact_id);
-- ============================================================
-- 6. RPC: sales.convert_template_to_deal()
--    Atomically promotes a pipeline template into a live deal.
--    Returns the new deal's UUID.
-- ============================================================
CREATE OR REPLACE FUNCTION sales.convert_template_to_deal(
        p_template_id uuid,
        p_deal_name text,
        p_company text DEFAULT NULL,
        p_value numeric DEFAULT 0,
        p_owner_name text DEFAULT NULL,
        p_contact_name text DEFAULT NULL,
        p_contact_email text DEFAULT NULL,
        p_source text DEFAULT NULL,
        p_close_date date DEFAULT NULL
    ) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = sales,
    public AS $$
DECLARE v_uid uuid := auth.uid();
v_deal_id uuid;
v_first_stage text;
v_prob int;
v_tmpl_name text;
BEGIN -- Verify the template belongs to the calling user
SELECT name INTO v_tmpl_name
FROM sales.pipeline_templates
WHERE id = p_template_id
    AND user_id = v_uid;
IF NOT FOUND THEN RAISE EXCEPTION 'Template not found or access denied (id=%)',
p_template_id;
END IF;
-- Get the first stage from the template (lowest sort_order)
SELECT stage_key,
    default_probability INTO v_first_stage,
    v_prob
FROM sales.pipeline_stage_templates
WHERE template_id = p_template_id
ORDER BY sort_order ASC
LIMIT 1;
v_first_stage := COALESCE(v_first_stage, 'prospect');
v_prob := COALESCE(v_prob, 10);
-- Insert the new deal
INSERT INTO sales.deals (
        user_id,
        template_id,
        name,
        company,
        contact_name,
        contact_email,
        value,
        stage_key,
        probability,
        owner_name,
        source,
        expected_close_date
    )
VALUES (
        v_uid,
        p_template_id,
        p_deal_name,
        p_company,
        p_contact_name,
        p_contact_email,
        p_value,
        v_first_stage,
        v_prob,
        p_owner_name,
        p_source,
        p_close_date
    )
RETURNING id INTO v_deal_id;
-- Auto-log the creation event
INSERT INTO sales.deal_activities (deal_id, user_id, activity_type, title, notes)
VALUES (
        v_deal_id,
        v_uid,
        'note',
        'Deal created from template',
        'Converted from template: ' || v_tmpl_name
    );
RETURN v_deal_id;
END;
$$;
-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION sales.convert_template_to_deal(uuid, text, text, numeric, text, text, text, text, date) TO authenticated;
-- ============================================================
-- 7. VIEW: sales.deals_with_stage_info
--    Enriches deals with their current stage label & metadata.
-- ============================================================
CREATE OR REPLACE VIEW sales.deals_with_stage_info AS
SELECT d.*,
    st.label AS stage_label,
    st.color_accent AS stage_color,
    st.sort_order AS stage_sort_order,
    st.default_actions AS stage_actions
FROM sales.deals d
    LEFT JOIN sales.pipeline_stage_templates st ON st.template_id = d.template_id
    AND st.stage_key = d.stage_key;
GRANT SELECT ON sales.deals_with_stage_info TO authenticated;
-- ============================================================
-- 8. SEED FUNCTION: sales.seed_demo_data()
--    Creates the Standard B2B 7-Stage template + Battery Network
--    featured deal + 6 sample pipeline deals.
--    No-op if the user already has templates.
-- ============================================================
CREATE OR REPLACE FUNCTION sales.seed_demo_data() RETURNS text LANGUAGE plpgsql SECURITY DEFINER
SET search_path = sales,
    public AS $$
DECLARE v_uid uuid := auth.uid();
v_tmpl uuid;
v_deal uuid;
BEGIN -- Guard: skip if user already has data
IF EXISTS (
    SELECT 1
    FROM sales.pipeline_templates
    WHERE user_id = v_uid
    LIMIT 1
) THEN RETURN 'skipped — sales data already exists for this user';
END IF;
-- ── 1. Create Standard B2B 7-Stage Template ───────────
INSERT INTO sales.pipeline_templates (user_id, name, description, is_default)
VALUES (
        v_uid,
        'Standard B2B 7-Stage',
        'Prospect → Qualify → Develop → Solution → Proof → Close → Post-Sale',
        true
    )
RETURNING id INTO v_tmpl;
INSERT INTO sales.pipeline_stage_templates (
        template_id,
        stage_key,
        label,
        sort_order,
        default_probability,
        color_accent,
        default_actions
    )
VALUES (
        v_tmpl,
        'prospect',
        'Prospect',
        1,
        10,
        '#3b82f6',
        '["Research target accounts","Cold outreach via email/call","Nurture via content & events","Add to CRM and assign owner"]'::jsonb
    ),
    (
        v_tmpl,
        'qualify',
        'Qualify',
        2,
        25,
        '#6366f1',
        '["Run BANT/MEDDIC discovery call","Identify economic buyer","Score and rank opportunities","Disqualify poor-fit leads"]'::jsonb
    ),
    (
        v_tmpl,
        'develop',
        'Develop',
        3,
        40,
        '#8b5cf6',
        '["Multi-stakeholder discovery sessions","Document pain points","Map feature-to-benefit alignment","Draft proposal outline"]'::jsonb
    ),
    (
        v_tmpl,
        'solution',
        'Solution',
        4,
        55,
        '#f59e0b',
        '["Custom-build demo environment","Tie each slide to a pain point","Include ROI calculator","Involve all stakeholders"]'::jsonb
    ),
    (
        v_tmpl,
        'proof',
        'Proof',
        5,
        70,
        '#06b6d4',
        '["Share industry case studies","Offer time-boxed pilot/POC","Address price & competitor objections","Deliver quantified ROI report"]'::jsonb
    ),
    (
        v_tmpl,
        'close',
        'Close',
        6,
        85,
        '#10b981',
        '["Negotiate pricing & contract terms","Use assumptive/urgency close","Get procurement & legal buy-in","Confirm kick-off date"]'::jsonb
    ),
    (
        v_tmpl,
        'postsale',
        'Post-Sale',
        7,
        100,
        '#f43f5e',
        '["30/60/90-day check-ins","Identify upsell/cross-sell","Collect NPS & testimonial","Request referrals from champions"]'::jsonb
    );
-- ── 2. Battery Network — Featured Deal ────────────────
INSERT INTO sales.deals (
        user_id,
        template_id,
        name,
        company,
        contact_name,
        contact_email,
        value,
        stage_key,
        probability,
        priority,
        owner_name,
        source,
        expected_close_date,
        notes
    )
VALUES (
        v_uid,
        v_tmpl,
        'Battery Network – MSP Engagement',
        'Battery Network',
        'Rob',
        'rob@batterynetwork.com',
        180000,
        'develop',
        40,
        'high',
        'Jish',
        'referral',
        now()::date + 60,
        'Meeting 2026-02-25. Key pain: infrastructure modernisation + AI readiness.'
    )
RETURNING id INTO v_deal;
INSERT INTO sales.deal_activities (
        deal_id,
        user_id,
        activity_type,
        title,
        notes,
        activity_date
    )
VALUES (
        v_deal,
        v_uid,
        'meeting',
        'Intro call with Rob',
        'Discussed infrastructure pain points: manual processes, no AI layer.',
        now() - interval '14 days'
    ),
    (
        v_deal,
        v_uid,
        'email',
        'Sent CloudBaud capabilities deck',
        'Sent overview deck + Microsoft Fabric readiness assessment PDF.',
        now() - interval '10 days'
    ),
    (
        v_deal,
        v_uid,
        'meeting',
        'Deep dive — TODAY',
        'Agenda: live demo, ROI model walkthrough, next steps.',
        now() + interval '30 minutes'
    );
-- ── 3. Pipeline sample deals ──────────────────────────
INSERT INTO sales.deals (
        user_id,
        template_id,
        name,
        company,
        value,
        stage_key,
        probability,
        priority,
        owner_name,
        source,
        expected_close_date
    )
VALUES (
        v_uid,
        v_tmpl,
        'Grid Dynamics – Cloud Migration',
        'Grid Dynamics',
        250000,
        'solution',
        55,
        'high',
        'Sarah J.',
        'inbound',
        now()::date + 45
    ),
    (
        v_uid,
        v_tmpl,
        'NovaPower – AI Analytics',
        'NovaPower',
        95000,
        'qualify',
        25,
        'medium',
        'Mike T.',
        'cold-call',
        now()::date + 90
    ),
    (
        v_uid,
        v_tmpl,
        'VoltEdge – Fabric Platform',
        'VoltEdge',
        320000,
        'proof',
        70,
        'high',
        'Sarah J.',
        'referral',
        now()::date + 30
    ),
    (
        v_uid,
        v_tmpl,
        'EnergyCorp – Security Audit',
        'EnergyCorp',
        60000,
        'prospect',
        10,
        'low',
        'David R.',
        'cold-call',
        now()::date + 120
    ),
    (
        v_uid,
        v_tmpl,
        'SolarTech – Data Warehouse',
        'SolarTech',
        410000,
        'close',
        85,
        'high',
        'Jessica L.',
        'referral',
        now()::date + 14
    ),
    (
        v_uid,
        v_tmpl,
        'AmperaBio – Digital Ops',
        'AmperaBio',
        130000,
        'postsale',
        100,
        'medium',
        'Mike T.',
        'inbound',
        now()::date - 30
    );
RETURN 'seeded — Standard B2B 7-Stage template + 7 deals created';
END;
$$;
GRANT EXECUTE ON FUNCTION sales.seed_demo_data() TO authenticated;
-- ============================================================
-- IMPORTANT — PostgREST / Supabase API Access
-- ============================================================
-- After running this migration, go to:
--   Supabase Dashboard → Settings → API → Exposed schemas
-- Add "sales" to the list so the PostgREST API exposes it.
--
-- Then your frontend client queries become:
--   supabase.schema('sales').from('deals').select('*')
--   supabase.schema('sales').rpc('convert_template_to_deal', { ... })
--   supabase.schema('sales').rpc('seed_demo_data')
-- ============================================================