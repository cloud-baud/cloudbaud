-- =====================================================
-- MARKETING SCHEMA: Competencies Platform
-- Version 2.0 - Multi-industry, technology-tagged demos
-- =====================================================

-- Create marketing schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS marketing;

-- =====================================================
-- 1. CORE ENTITIES
-- =====================================================

-- Technologies (Atomic building blocks)
CREATE TABLE IF NOT EXISTS marketing.technologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text,
  icon text,
  description text,
  
  display_order integer,
  is_active boolean DEFAULT true
);

-- Competencies (High-level capabilities)
CREATE TABLE IF NOT EXISTS marketing.competencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  icon text,
  
  tagline text,
  overview text,
  
  meta_description text,
  meta_keywords text[],
  
  display_order integer,
  is_active boolean DEFAULT true
);

-- =====================================================
-- 2. DEMOS (Competency × Industry)
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing.competency_demos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  competency_id uuid REFERENCES marketing.competencies(id) ON DELETE CASCADE NOT NULL,
  industry_id uuid REFERENCES public.industries(id) ON DELETE CASCADE NOT NULL,
  
  slug text UNIQUE NOT NULL,
  
  tagline text,
  key_benefit text,
  
  demo_type text,
  demo_config jsonb DEFAULT '{}'::jsonb,
  demo_embed_url text,
  
  fear_factor jsonb DEFAULT '{}'::jsonb,
  metrics jsonb DEFAULT '{}'::jsonb,
  
  challenge_type text,
  challenge_config jsonb DEFAULT '{}'::jsonb,
  challenge_time_estimate text,
  
  primary_cta_text text DEFAULT 'Try Demo',
  secondary_cta_text text DEFAULT 'Talk to Specialist',
  secondary_cta_url text DEFAULT '/contact',
  
  requires_auth boolean DEFAULT false,
  display_order integer,
  is_active boolean DEFAULT true,
  
  UNIQUE(competency_id, industry_id)
);

-- =====================================================
-- 3. TAGGING (Many-to-Many)
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing.competency_technologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competency_id uuid REFERENCES marketing.competencies(id) ON DELETE CASCADE NOT NULL,
  technology_id uuid REFERENCES marketing.technologies(id) ON DELETE CASCADE NOT NULL,
  
  is_primary boolean DEFAULT false,
  display_order integer,
  
  UNIQUE(competency_id, technology_id)
);

CREATE TABLE IF NOT EXISTS marketing.demo_technologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id uuid REFERENCES marketing.competency_demos(id) ON DELETE CASCADE NOT NULL,
  technology_id uuid REFERENCES marketing.technologies(id) ON DELETE CASCADE NOT NULL,
  
  is_featured boolean DEFAULT false,
  usage_notes text,
  
  UNIQUE(demo_id, technology_id)
);

-- =====================================================
-- 4. ANALYTICS
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing.demo_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id uuid REFERENCES marketing.competency_demos(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  
  interaction_type text,
  time_spent_seconds integer,
  completed boolean DEFAULT false,
  
  cta_clicked text,
  converted_to_contact boolean DEFAULT false,
  
  user_agent text,
  referrer text
);

CREATE TABLE IF NOT EXISTS marketing.user_challenge_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  demo_id uuid REFERENCES marketing.competency_demos(id) ON DELETE CASCADE NOT NULL,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz,
  
  score integer,
  metrics jsonb,
  gap_analysis jsonb,
  
  time_spent_seconds integer,
  contacted_sales boolean DEFAULT false,
  contact_requested_at timestamptz
);

-- =====================================================
-- 5. RLS POLICIES
-- =====================================================

ALTER TABLE marketing.technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing.competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing.competency_demos ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing.competency_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing.demo_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing.demo_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing.user_challenge_results ENABLE ROW LEVEL SECURITY;

-- Public read access
DROP POLICY IF EXISTS "Public read active technologies" ON marketing.technologies;
CREATE POLICY "Public read active technologies"
  ON marketing.technologies FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Public read active competencies" ON marketing.competencies;
CREATE POLICY "Public read active competencies"
  ON marketing.competencies FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Public read active demos" ON marketing.competency_demos;
CREATE POLICY "Public read active demos"
  ON marketing.competency_demos FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Public read competency tech" ON marketing.competency_technologies;
CREATE POLICY "Public read competency tech"
  ON marketing.competency_technologies FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public read demo tech" ON marketing.demo_technologies;
CREATE POLICY "Public read demo tech"
  ON marketing.demo_technologies FOR SELECT
  USING (true);

-- Analytics: Insert for all, read own
DROP POLICY IF EXISTS "Public insert analytics" ON marketing.demo_analytics;
CREATE POLICY "Public insert analytics"
  ON marketing.demo_analytics FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users read own analytics" ON marketing.demo_analytics;
CREATE POLICY "Users read own analytics"
  ON marketing.demo_analytics FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Challenge results: Users manage own
DROP POLICY IF EXISTS "Users manage own results" ON marketing.user_challenge_results;
CREATE POLICY "Users manage own results"
  ON marketing.user_challenge_results FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 6. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_marketing_tech_slug ON marketing.technologies(slug);
CREATE INDEX IF NOT EXISTS idx_marketing_tech_category ON marketing.technologies(category);
CREATE INDEX IF NOT EXISTS idx_marketing_comp_slug ON marketing.competencies(slug);
CREATE INDEX IF NOT EXISTS idx_marketing_comp_category ON marketing.competencies(category);
CREATE INDEX IF NOT EXISTS idx_marketing_demos_slug ON marketing.competency_demos(slug);
CREATE INDEX IF NOT EXISTS idx_marketing_demos_comp ON marketing.competency_demos(competency_id);
CREATE INDEX IF NOT EXISTS idx_marketing_demos_ind ON marketing.competency_demos(industry_id);
CREATE INDEX IF NOT EXISTS idx_marketing_comp_tech ON marketing.competency_technologies(competency_id);
CREATE INDEX IF NOT EXISTS idx_marketing_demo_tech ON marketing.demo_technologies(demo_id);
CREATE INDEX IF NOT EXISTS idx_marketing_analytics ON marketing.demo_analytics(demo_id);
CREATE INDEX IF NOT EXISTS idx_marketing_results ON marketing.user_challenge_results(user_id);

-- =====================================================
-- 7. TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION marketing.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_competencies_updated_at ON marketing.competencies;
CREATE TRIGGER update_competencies_updated_at
    BEFORE UPDATE ON marketing.competencies
    FOR EACH ROW
    EXECUTE FUNCTION marketing.update_updated_at_column();

DROP TRIGGER IF EXISTS update_demos_updated_at ON marketing.competency_demos;
CREATE TRIGGER update_demos_updated_at
    BEFORE UPDATE ON marketing.competency_demos
    FOR EACH ROW
    EXECUTE FUNCTION marketing.update_updated_at_column();

-- =====================================================
-- 8. GRANTS (Allow public schema references)
-- =====================================================

GRANT USAGE ON SCHEMA marketing TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA marketing TO anon, authenticated;
GRANT INSERT ON marketing.demo_analytics TO anon, authenticated;
GRANT ALL ON marketing.user_challenge_results TO authenticated;
