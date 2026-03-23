-- =====================================================
-- SEED DATA: Technologies, Competencies, and Industry Demos
-- Version 2.0 - Multi-industry with correct Microsoft naming
-- =====================================================

-- =====================================================
-- 1. TECHNOLOGIES (Atomic Tags)
-- =====================================================

INSERT INTO marketing.technologies (slug, name, category, icon, description, display_order) VALUES
-- Core Platform
('azure-databricks', 'Azure Databricks', 'Core Platform', 'Database', 'Unified analytics platform', 1),
('unity-catalog', 'Unity Catalog', 'Core Platform', 'Shield', 'Centralized data governance', 2),
('delta-lake', 'Delta Lake', 'Core Platform', 'Layers', 'ACID transactions for data lakes', 3),
('apache-spark', 'Apache Spark', 'Core Platform', 'Zap', 'Distributed processing engine', 4),
('pyspark', 'PySpark', 'Core Platform', 'Code2', 'Python API for Spark', 5),
('spark-sql', 'Spark SQL', 'Core Platform', 'Database', 'SQL interface for Spark', 6),

-- Cloud Services
('azure-data-lake', 'Azure Data Lake (ADLS)', 'Cloud Services', 'Cloud', 'Scalable data storage', 10),
('microsoft-entra-id', 'Microsoft Entra ID', 'Cloud Services', 'Shield', 'Identity and access management', 11),
('azure-devops', 'Azure DevOps', 'Cloud Services', 'GitBranch', 'CI/CD and project management', 12),

-- DevOps & Automation
('terraform', 'Terraform', 'DevOps & Automation', 'Box', 'Infrastructure as Code', 20),
('github-actions', 'GitHub Actions', 'DevOps & Automation', 'GitBranch', 'CI/CD workflows', 21),
('databricks-cli', 'Databricks CLI', 'DevOps & Automation', 'Terminal', 'Command-line interface', 22),

-- Healthcare Integration
('hl7', 'HL7', 'Healthcare', 'Activity', 'Health Level 7 messaging standard', 30),
('fhir', 'FHIR', 'Healthcare', 'Activity', 'Fast Healthcare Interoperability Resources', 31),

-- Programming & Tools
('python', 'Python', 'Programming', 'Code2', 'Core programming language', 40),
('sql', 'SQL', 'Programming', 'Database', 'Structured Query Language', 41),
('rest-api', 'REST APIs', 'Programming', 'Workflow', 'RESTful service integration', 42)

ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 2. COMPETENCIES (High-level capabilities)
-- =====================================================

INSERT INTO marketing.competencies (slug, title, category, icon, tagline, overview, display_order) VALUES
('unity-catalog-governance', 'Unity Catalog Governance', 'Core Platform', 'Shield',
 'Centralized data governance across all workspaces',
 'Unified access control, audit logging, and data lineage for enterprise-scale data platforms',
 1),

('delta-lake-reliability', 'Delta Lake Data Reliability', 'Core Platform', 'Database',
 'ACID transactions and time travel for data lakes',
 'Ensure data quality and enable instant recovery with Delta Lake''s transactional capabilities',
 2),

('terraform-infrastructure', 'Terraform Infrastructure Automation', 'DevOps & Automation', 'Box',
 'Deploy entire Databricks environments as code',
 'Version-controlled, reproducible infrastructure with automated provisioning and configuration',
 3),

('healthcare-data-integration', 'Healthcare Data Integration', 'Healthcare', 'Activity',
 'HL7/FHIR message processing at scale',
 'Automated ingestion and transformation of healthcare data feeds with compliance built-in',
 4)

ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 3. COMPETENCY → TECHNOLOGY MAPPING
-- =====================================================

-- Unity Catalog uses:
INSERT INTO marketing.competency_technologies (competency_id, technology_id, is_primary, display_order)
SELECT c.id, t.id, 
  CASE WHEN t.slug IN ('unity-catalog') THEN true ELSE false END,
  CASE t.slug
    WHEN 'unity-catalog' THEN 1
    WHEN 'delta-lake' THEN 2
    WHEN 'microsoft-entra-id' THEN 3
    WHEN 'spark-sql' THEN 4
  END
FROM marketing.competencies c
CROSS JOIN marketing.technologies t
WHERE c.slug = 'unity-catalog-governance'
  AND t.slug IN ('unity-catalog', 'delta-lake', 'microsoft-entra-id', 'spark-sql')
ON CONFLICT DO NOTHING;

-- Delta Lake uses:
INSERT INTO marketing.competency_technologies (competency_id, technology_id, is_primary, display_order)
SELECT c.id, t.id,
  CASE WHEN t.slug = 'delta-lake' THEN true ELSE false END,
  CASE t.slug
    WHEN 'delta-lake' THEN 1
    WHEN 'apache-spark' THEN 2
    WHEN 'pyspark' THEN 3
    WHEN 'azure-data-lake' THEN 4
  END
FROM marketing.competencies c
CROSS JOIN marketing.technologies t
WHERE c.slug = 'delta-lake-reliability'
  AND t.slug IN ('delta-lake', 'apache-spark', 'pyspark', 'azure-data-lake')
ON CONFLICT DO NOTHING;

-- Terraform uses:
INSERT INTO marketing.competency_technologies (competency_id, technology_id, is_primary, display_order)
SELECT c.id, t.id,
  CASE WHEN t.slug = 'terraform' THEN true ELSE false END,
  CASE t.slug
    WHEN 'terraform' THEN 1
    WHEN 'azure-devops' THEN 2
    WHEN 'github-actions' THEN 3
    WHEN 'databricks-cli' THEN 4
  END
FROM marketing.competencies c
CROSS JOIN marketing.technologies t
WHERE c.slug = 'terraform-infrastructure'
  AND t.slug IN ('terraform', 'azure-devops', 'github-actions', 'databricks-cli')
ON CONFLICT DO NOTHING;

-- Healthcare Data Integration uses:
INSERT INTO marketing.competency_technologies (competency_id, technology_id, is_primary, display_order)
SELECT c.id, t.id,
  CASE WHEN t.slug IN ('hl7', 'fhir') THEN true ELSE false END,
  CASE t.slug
    WHEN 'hl7' THEN 1
    WHEN 'fhir' THEN 2
    WHEN 'delta-lake' THEN 3
    WHEN 'pyspark' THEN 4
  END
FROM marketing.competencies c
CROSS JOIN marketing.technologies t
WHERE c.slug = 'healthcare-data-integration'
  AND t.slug IN ('hl7', 'fhir', 'delta-lake', 'pyspark')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. INDUSTRY-SPECIFIC DEMOS
-- =====================================================

-- DEMO 1: Unity Catalog × Healthcare
INSERT INTO marketing.competency_demos (
  competency_id, industry_id, slug,
  tagline, key_benefit,
  demo_type, demo_config,
  fear_factor, metrics,
  challenge_type, challenge_time_estimate,
  display_order
)
SELECT 
  c.id,
  i.id,
  'unity-catalog-healthcare',
  'HIPAA-compliant data lineage in real-time',
  'Answer "who accessed PHI last month?" in 8 seconds vs 6 hours',
  'react_flow',
  '{
    "nodes": [
      {"id": "uc", "type": "central", "label": "Unity Catalog", "metrics": {"tables": 450, "phi_datasets": 89}},
      {"id": "phi", "type": "storage", "label": "patient_billing", "classification": "PHI"},
      {"id": "analytics", "type": "workspace", "label": "Analytics Workspace", "users": 47},
      {"id": "audit", "type": "security", "label": "HIPAA Audit Logs", "coverage": "100%"}
    ],
    "edges": [
      {"source": "phi", "target": "uc", "label": "Governed", "animated": true},
      {"source": "analytics", "target": "uc", "label": "Access Control"},
      {"source": "uc", "target": "audit", "label": "Auto-logged", "color": "green"}
    ]
  }'::jsonb,
  '{
    "stat": "Can you answer ''who accessed patient_billing table in Q4 2024?'' in 10 seconds?",
    "cost": "HIPAA fines start at $100/record for inadequate access controls",
    "consequence": "Average healthcare breach: 2.3M records = $230M in fines + reputation damage"
  }'::jsonb,
  '{
    "before": {"audit_response_time": "4-6 hours", "manual_log_review": "15 systems", "compliance_confidence": "42%"},
    "after": {"audit_response_time": "8 seconds", "centralized_audit": "1 query", "compliance_confidence": "99.8%"}
  }'::jsonb,
  'scenario_simulator',
  '3 min',
  1
FROM marketing.competencies c
CROSS JOIN public.industries i
WHERE c.slug = 'unity-catalog-governance'
  AND i.slug = 'healthcare'
ON CONFLICT (competency_id, industry_id) DO NOTHING;

-- DEMO 2: Unity Catalog × Finance
INSERT INTO marketing.competency_demos (
  competency_id, industry_id, slug,
  tagline, key_benefit,
  demo_type, demo_config,
  fear_factor, metrics,
  challenge_type, challenge_time_estimate,
  display_order
)
SELECT 
  c.id,
  i.id,
  'unity-catalog-finance',
  'SOX-compliant audit trails for trading data',
  'Complete audit prep in 4 hours vs 200 hours per quarter',
  'react_flow',
  '{
    "nodes": [
      {"id": "uc", "type": "central", "label": "Unity Catalog", "metrics": {"tables": 320, "sox_tables": 67}},
      {"id": "trades", "type": "storage", "label": "trading_transactions", "classification": "SOX-Material"},
      {"id": "quant", "type": "workspace", "label": "Quant Trading Desk", "users": 23},
      {"id": "audit", "type": "security", "label": "SOX Audit Logs", "coverage": "100%"}
    ],
    "edges": [
      {"source": "trades", "target": "uc", "label": "Governed", "animated": true},
      {"source": "quant", "target": "uc", "label": "Role-Based Access"},
      {"source": "uc", "target": "audit", "label": "Immutable Logs", "color": "green"}
    ]
  }'::jsonb,
  '{
    "stat": "SOX Section 404 requires complete audit trails. Can you prove data integrity?",
    "cost": "Non-compliance: Up to $5M fines + criminal charges for executives",
    "consequence": "Manual audit preparation: 200 hours/quarter × 4 quarters = 800 hours = $240K/year"
  }'::jsonb,
  '{
    "before": {"audit_prep_hours": 200, "data_lineage_gaps": "47 unknown transformations", "sox_readiness": "60%"},
    "after": {"audit_prep_hours": 4, "complete_lineage": "100% automated", "sox_readiness": "100%"}
  }'::jsonb,
  'scenario_simulator',
  '3 min',
  1
FROM marketing.competencies c
CROSS JOIN public.industries i
WHERE c.slug = 'unity-catalog-governance'
  AND i.slug = 'finance'
ON CONFLICT (competency_id, industry_id) DO NOTHING;

-- DEMO 3: Delta Lake × Healthcare
INSERT INTO marketing.competency_demos (
  competency_id, industry_id, slug,
  tagline, key_benefit,
  demo_type,
  fear_factor, metrics,
  challenge_type, challenge_config, challenge_time_estimate,
  display_order
)
SELECT 
  c.id,
  i.id,
  'delta-lake-healthcare',
  'Instant recovery from data errors in patient records',
  'Recover 2M patient records in 8 seconds vs 4 hours',
  'code_sandbox',
  '{
    "stat": "Your analyst just ran DELETE FROM patient_records WHERE year < 2024. Wrong filter. 2M records gone.",
    "cost": "Traditional data recovery: $45K project + 160 hours engineering + analytics downtime",
    "consequence": "Meanwhile: Clinical dashboards down, quality reporting frozen, regulatory deadlines missed"
  }'::jsonb,
  '{
    "before": {"recovery_time": "4-6 hours", "data_loss_risk": "High", "downtime_cost": "$12K/hour"},
    "after": {"recovery_time": "8 seconds", "data_loss_risk": "Zero", "downtime_cost": "$0"}
  }'::jsonb,
  'sandbox',
  '{
    "scenario": "Accidental bulk delete of patient records",
    "problem_code": "DELETE FROM patient_records WHERE admitted_year < ''2024'';\\n-- Oops! Meant 2020. 2M records deleted.",
    "solution_code": "-- With Delta Lake time travel:\\nRESTORE TABLE patient_records TO VERSION AS OF 1;\\n-- Done. 2M records recovered in 8 seconds."
  }'::jsonb,
  '5 min',
  1
FROM marketing.competencies c
CROSS JOIN public.industries i
WHERE c.slug = 'delta-lake-reliability'
  AND i.slug = 'healthcare'
ON CONFLICT (competency_id, industry_id) DO NOTHING;

-- DEMO 4: Healthcare Data Integration × Healthcare (HL7 Processing)
INSERT INTO marketing.competency_demos (
  competency_id, industry_id, slug,
  tagline, key_benefit,
  demo_type, demo_config,
  fear_factor, metrics,
  challenge_type, challenge_time_estimate,
  display_order
)
SELECT 
  c.id,
  i.id,
  'hl7-processing-healthcare',
  'Automated HL7 message processing at 10K messages/day',
  'Eliminate $42K/month in manual data parsing',
  'react_flow',
  '{
    "nodes": [
      {"id": "hl7_feed", "type": "source", "label": "HL7 v2.x Feed", "volume": "10K msg/day"},
      {"id": "parser", "type": "transform", "label": "Auto-parser", "validation": "FHIR R4"},
      {"id": "bronze", "type": "storage", "label": "Bronze (Raw HL7)", "format": "Delta"},
      {"id": "silver", "type": "transform", "label": "Silver (FHIR)", "phi_masked": true},
      {"id": "gold", "type": "storage", "label": "Gold (Analytics)", "queryable": true}
    ],
    "edges": [
      {"source": "hl7_feed", "target": "parser", "label": "Real-time", "animated": true},
      {"source": "parser", "target": "bronze", "label": "Raw Ingestion"},
      {"source": "bronze", "target": "silver", "label": "Validated + Cleaned"},
      {"source": "silver", "target": "gold", "label": "Aggregated"}
    ]
  }'::jsonb,
  '{
    "stat": "Processing 10K HL7 messages/day manually?",
    "cost": "280 hours/month at $150/hr = $42,000/month in engineering time",
    "consequence": "Plus: 12% error rate causing downstream analytics issues, compliance gaps, and delayed reporting"
  }'::jsonb,
  '{
    "before": {"messages_per_day": 10000, "processing_time_hours": 280, "error_rate": "12%", "cost_monthly": "$42,000"},
    "after": {"messages_per_day": 10000, "processing_time_hours": 2, "error_rate": "0.1%", "cost_monthly": "$3,200"}
  }'::jsonb,
  'calculator',
  '5 min',
  1
FROM marketing.competencies c
CROSS JOIN public.industries i  
WHERE c.slug = 'healthcare-data-integration'
  AND i.slug = 'healthcare'
ON CONFLICT (competency_id, industry_id) DO NOTHING;

-- =====================================================
-- 5. DEMO → TECHNOLOGY MAPPING
-- =====================================================

-- Unity Catalog Healthcare demo features:
INSERT INTO marketing.demo_technologies (demo_id, technology_id, is_featured)
SELECT d.id, t.id, 
  CASE WHEN t.slug IN ('unity-catalog', 'microsoft-entra-id') THEN true ELSE false END
FROM marketing.competency_demos d
CROSS JOIN marketing.technologies t
WHERE d.slug = 'unity-catalog-healthcare'
  AND t.slug IN ('unity-catalog', 'delta-lake', 'microsoft-entra-id')
ON CONFLICT DO NOTHING;

-- Unity Catalog Finance demo features:
INSERT INTO marketing.demo_technologies (demo_id, technology_id, is_featured)
SELECT d.id, t.id,
  CASE WHEN t.slug = 'unity-catalog' THEN true ELSE false END
FROM marketing.competency_demos d
CROSS JOIN marketing.technologies t
WHERE d.slug = 'unity-catalog-finance'
  AND t.slug IN ('unity-catalog', 'delta-lake', 'spark-sql')
ON CONFLICT DO NOTHING;

-- Delta Lake Healthcare demo features:
INSERT INTO marketing.demo_technologies (demo_id, technology_id, is_featured)
SELECT d.id, t.id,
  CASE WHEN t.slug = 'delta-lake' THEN true ELSE false END
FROM marketing.competency_demos d
CROSS JOIN marketing.technologies t
WHERE d.slug = 'delta-lake-healthcare'
  AND t.slug IN ('delta-lake', 'spark-sql')
ON CONFLICT DO NOTHING;

-- HL7 Processing demo features:
INSERT INTO marketing.demo_technologies (demo_id, technology_id, is_featured)
SELECT d.id, t.id,
  CASE WHEN t.slug IN ('hl7', 'fhir') THEN true ELSE false END
FROM marketing.competency_demos d
CROSS JOIN marketing.technologies t
WHERE d.slug = 'hl7-processing-healthcare'
  AND t.slug IN ('hl7', 'fhir', 'delta-lake', 'pyspark')
ON CONFLICT DO NOTHING;

