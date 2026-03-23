-- =====================================================
-- COMPETENCIES & INTERACTIVE DEMOS SCHEMA
-- Visual-first platform for demonstrating technical expertise
-- =====================================================

-- Main competencies table
CREATE TABLE IF NOT EXISTS public.competencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Core Identity
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  category text NOT NULL, -- 'Core Platform', 'Cloud Ecosystem', 'DevOps & Automation', etc.
  icon text, -- Lucide icon name
  
  -- Minimal Text Content
  tagline text, -- Single sentence: "See your data lineage in real-time"
  key_benefit text, -- One-liner value prop
  
  -- Visual/Interactive Content
  architecture_diagram_type text, -- 'react_flow', 'mermaid', 'code_sandbox', 'live_dashboard'
  architecture_config jsonb DEFAULT '{}'::jsonb, -- Nodes, edges, or demo config
  demo_embed_url text, -- External sandbox URL (CodeSandbox, StackBlitz)
  
  -- Before/After Comparison Data
  metrics jsonb DEFAULT '{}'::jsonb,
  /* Example:
  {
    "before": {
      "label": "Without Unity Catalog",
      "time_hours": 40,
      "cost_monthly": 15000,
      "error_rate": 23,
      "compliance_score": 42
    },
    "after": {
      "label": "With Unity Catalog",
      "time_hours": 2,
      "cost_monthly": 1200,
      "error_rate": 0,
      "compliance_score": 99
    }
  }
  */
  
  -- Interactive Challenge Configuration
  challenge_type text, -- 'sandbox', 'decision_tree', 'calculator', 'scenario_simulator'
  challenge_config jsonb DEFAULT '{}'::jsonb,
  challenge_time_estimate text, -- '3 min', '5 min', '10 min'
  
  -- Fear Factor Data
  fear_factor jsonb DEFAULT '{}'::jsonb,
  /* Example:
  {
    "stat": "Organizations without real-time monitoring discover failures 6.4 hours late",
    "cost": "$12K per hour in healthcare analytics downtime",
    "consequence": "Average incident cost: $76,800"
  }
  */
  
  -- CTAs
  primary_cta_text text DEFAULT 'Try Interactive Demo',
  primary_cta_action text, -- 'demo', 'challenge', 'calculator'
  secondary_cta_text text DEFAULT 'Talk to Specialist',
  secondary_cta_url text DEFAULT '/contact',
  
  -- Access & Display
  requires_auth boolean DEFAULT false, -- Some demos public, challenges may require login
  display_order integer,
  is_active boolean DEFAULT true,
  
  -- SEO
  meta_description text,
  meta_keywords text[]
);

-- Analytics tracking for demos
CREATE TABLE IF NOT EXISTS public.demo_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competency_id uuid REFERENCES public.competencies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for anonymous
  session_id text, -- Track anonymous users
  
  created_at timestamptz DEFAULT now() NOT NULL,
  
  -- Engagement Metrics
  demo_opened boolean DEFAULT true,
  interaction_type text, -- 'view', 'click', 'toggle', 'run_code', 'complete'
  time_spent_seconds integer,
  completed boolean DEFAULT false,
  
  -- Conversion Signals
  cta_clicked text, -- Which CTA they clicked
  converted_to_contact boolean DEFAULT false,
  
  -- Context
  user_agent text,
  referrer text
);

-- User challenge results (for authenticated users)
CREATE TABLE IF NOT EXISTS public.user_challenge_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  competency_id uuid REFERENCES public.competencies(id) ON DELETE CASCADE NOT NULL,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz,
  
  -- Results
  score integer, -- 0-100 or time-based metric
  metrics jsonb, -- Challenge-specific metrics
  gap_analysis jsonb, -- Identified improvements
  
  -- Engagement
  time_spent_seconds integer,
  contacted_sales boolean DEFAULT false,
  contact_requested_at timestamptz,
  
  UNIQUE(user_id, competency_id, created_at)
);

-- RLS Policies
ALTER TABLE public.competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_results ENABLE ROW LEVEL SECURITY;

-- Public read access for active competencies
DROP POLICY IF EXISTS "Anyone can view active competencies" ON public.competencies;
CREATE POLICY "Anyone can view active competencies"
  ON public.competencies FOR SELECT
  USING (is_active = true);

-- Authenticated users can manage competencies
DROP POLICY IF EXISTS "Authenticated users can manage competencies" ON public.competencies;
CREATE POLICY "Authenticated users can manage competencies"
  ON public.competencies FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Anyone can insert analytics (for tracking)
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.demo_analytics;
CREATE POLICY "Anyone can insert analytics"
  ON public.demo_analytics FOR INSERT
  WITH CHECK (true);

-- Users can view their own analytics
DROP POLICY IF EXISTS "Users can view own analytics" ON public.demo_analytics;
CREATE POLICY "Users can view own analytics"
  ON public.demo_analytics FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can view/insert their own challenge results
DROP POLICY IF EXISTS "Users manage own challenge results" ON public.user_challenge_results;
CREATE POLICY "Users manage own challenge results"
  ON public.user_challenge_results FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_competencies_category ON public.competencies(category);
CREATE INDEX IF NOT EXISTS idx_competencies_slug ON public.competencies(slug);
CREATE INDEX IF NOT EXISTS idx_competencies_active ON public.competencies(is_active);
CREATE INDEX IF NOT EXISTS idx_demo_analytics_competency ON public.demo_analytics(competency_id);
CREATE INDEX IF NOT EXISTS idx_demo_analytics_user ON public.demo_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_results_user ON public.user_challenge_results(user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_competencies_updated_at ON public.competencies;
CREATE TRIGGER update_competencies_updated_at
    BEFORE UPDATE ON public.competencies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
