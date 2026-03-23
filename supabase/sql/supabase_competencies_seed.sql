-- =====================================================
-- SEED DATA: Core Platform Competencies
-- Visual-first interactive demos for Azure Databricks expertise
-- =====================================================

-- 1. UNITY CATALOG GOVERNANCE
INSERT INTO public.competencies (
  slug, title, category, icon, tagline, key_benefit,
  architecture_diagram_type, architecture_config,
  metrics, fear_factor,
  challenge_type, challenge_config, challenge_time_estimate,
  primary_cta_text, primary_cta_action,
  display_order, requires_auth, meta_description
) VALUES (
  'unity-catalog',
  'Unity Catalog Governance',
  'Core Platform',
  'Shield',
  'Centralized governance across 200+ workspaces in one view',
  'Answer compliance audits in 8 seconds instead of 4 hours',
  'react_flow',
  '{
    "nodes": [
      {"id": "uc", "type": "central", "label": "Unity Catalog", "metrics": {"tables": 450, "users": 200}},
      {"id": "ws1", "type": "workspace", "label": "Workspace A", "users": 47},
      {"id": "ws2", "type": "workspace", "label": "Workspace B", "users": 23},
      {"id": "ws3", "type": "workspace", "label": "Workspace C", "users": 31},
      {"id": "audit", "type": "security", "label": "Audit Logs", "coverage": "100%"}
    ],
    "edges": [
      {"source": "ws1", "target": "uc", "label": "Unified ACLs", "animated": true},
      {"source": "ws2", "target": "uc", "label": "Unified ACLs", "animated": true},
      {"source": "ws3", "target": "uc", "label": "Unified ACLs", "animated": true},
      {"source": "uc", "target": "audit", "label": "Auto-logged", "color": "green"}
    ]
  }',
  '{
    "before": {"label": "Without Unity Catalog", "permission_changes": "40 hrs/month", "audit_response": "4-6 hours", "compliance_confidence": "42%", "workspaces_managed": 3},
    "after": {"label": "With Unity Catalog", "permission_changes": "2 hrs/month", "audit_response": "8 seconds", "compliance_confidence": "99.8%", "workspaces_managed": 200}
  }',
  '{
    "stat": "Can you answer ''who accessed PHI last month?'' in 10 seconds?",
    "cost": "HIPAA fines start at $100/record for inadequate access controls",
    "consequence": "Average healthcare breach: 2.3M records = $230M in fines"
  }',
  'scenario_simulator',
  '{
    "scenario": "A regulator asks: Who accessed patient_billing table in Q4 2024?",
    "manual_steps": 15,
    "manual_time_minutes": 263,
    "unity_time_seconds": 8,
    "savings_per_audit": "$3,950"
  }',
  '3 min',
  'See Live Architecture',
  'demo',
  1, false,
  'Interactive Unity Catalog architecture demo showing centralized governance for HIPAA-compliant healthcare data platforms.'
);

-- 2. DELTA LAKE TIME TRAVEL
INSERT INTO public.competencies (
  slug, title, category, icon, tagline, key_benefit,
  architecture_diagram_type, demo_embed_url,
  metrics, fear_factor,
  challenge_type, challenge_config, challenge_time_estimate,
  primary_cta_text, primary_cta_action,
  display_order, requires_auth
) VALUES (
  'delta-lake-time-travel',
  'Delta Lake Time Travel',
  'Core Platform',
  'Database',
  'Undo any data change with one SQL command',
  'Recover from accidental deletes in 8 seconds vs 4 hours',
  'code_sandbox',
  NULL,
  '{
    "before": {"label": "Traditional Data Lake", "recovery_time": "4 hours", "data_loss_risk": "High", "version_control": "Manual snapshots"},
    "after": {"label": "Delta Lake", "recovery_time": "8 seconds", "data_loss_risk": "Zero", "version_control": "Automatic"}
  }',
  '{
    "stat": "Your analyst just deleted 2M patient records. How fast can you recover?",
    "cost": "Average data recovery project: $45K + 160 hours of engineering time",
    "consequence": "Meanwhile, analytics are down, dashboards are broken, and regulators are asking questions"
  }',
  'sandbox',
  '{
    "scenario": "Accidental DELETE command execution",
    "code_before": "DELETE FROM patient_records WHERE admitted_date < ''2024-01-01'';\\n-- Oops! Wrong year. Meant 2023. 2M records gone.",
    "code_solution": "-- With Delta Lake:\\nRESTORE TABLE patient_records TO VERSION AS OF 1;\\n-- Done. 2M records recovered in 8 seconds.",
    "traditional_recovery": "1. Identify last good backup\\n2. Restore from backup to staging\\n3. Validate data integrity\\n4. Merge with current data\\n5. Re-run downstream pipelines\\nTotal: 4-6 hours"
  }',
  '5 min',
  'Try Recovery Sandbox',
  'challenge',
  2, false
);

-- 3. TERRAFORM INFRASTRUCTURE AS CODE
INSERT INTO public.competencies (
  slug, title, category, icon, tagline, key_benefit,
  architecture_diagram_type, architecture_config,
  metrics, fear_factor,
  challenge_type, challenge_config, challenge_time_estimate,
  display_order, requires_auth
) VALUES (
  'terraform-iac',
  'Terraform Infrastructure as Code',
  'DevOps & Automation',
  'GitBranch',
  'Deploy entire Databricks environment with one command',
  'Recreate production in 8 minutes instead of 3 weeks',
  'react_flow',
  '{
    "animation": "deployment_flow",
    "steps": [
      {"id": 1, "label": "terraform apply", "duration": "2s"},
      {"id": 2, "label": "Provision Workspaces", "duration": "45s", "resources": 3},
      {"id": 3, "label": "Configure Unity Catalog", "duration": "30s"},
      {"id": 4, "label": "Deploy Clusters", "duration": "120s", "resources": 5},
      {"id": 5, "label": "Configure Networking", "duration": "60s"},
      {"id": 6, "label": "Apply Security Policies", "duration": "90s"},
      {"id": 7, "label": "Complete", "duration": "0s", "status": "success"}
    ]
  }',
  '{
    "before": {"label": "Manual Configuration", "setup_time": "3 weeks", "configuration_errors": 47, "documentation": "Outdated", "reproducibility": "0%"},
    "after": {"label": "Terraform IaC", "setup_time": "8 minutes", "configuration_errors": 0, "documentation": "Self-documenting", "reproducibility": "100%"}
  }',
  '{
    "stat": "Your senior data engineer just left. Can you explain your architecture?",
    "cost": "47 manual configurations across 12 clusters. Documentation is 6 months old.",
    "consequence": "Knowledge transfer: 3 weeks. New engineer productivity: 40% for first 2 months."
  }',
  'scenario_simulator',
  '{
    "scenario": "Disaster recovery: Recreate production environment",
    "manual_checklist": ["Step 1: Review outdated runbook", "Step 2: Manually create workspace", "Step 3-47: Configure each component", "..."],
    "terraform_command": "terraform apply -var-file=prod.tfvars",
    "manual_time_weeks": 3,
    "terraform_time_minutes": 8
  }',
  '4 min',
  3, false
);

-- 4. HL7/FHIR HEALTHCARE INTEGRATION
INSERT INTO public.competencies (
  slug, title, category, icon, tagline, key_benefit,
  architecture_diagram_type, architecture_config,
  metrics, fear_factor,
  challenge_type, challenge_config, challenge_time_estimate,
  display_order, requires_auth
) VALUES (
  'hl7-fhir-integration',
  'HL7/FHIR Healthcare Data Integration',
  'Legacy & Integration',
  'Activity',
  'Process 10K healthcare messages per day automatically',
  'Eliminate 280 hours/month of manual data parsing',
  'react_flow',
  '{
    "flow_type": "data_pipeline",
    "nodes": [
      {"id": "hl7", "type": "source", "label": "HL7 Feed", "volume": "10K msg/day"},
      {"id": "parser", "type": "transform", "label": "Auto-parser", "validation": "FHIR R4"},
      {"id": "bronze", "type": "storage", "label": "Bronze (Raw)", "format": "Delta"},
      {"id": "silver", "type": "transform", "label": "Silver (Cleaned)", "phi_masked": true},
      {"id": "gold", "type": "storage", "label": "Gold (Analytics)", "queryable": true}
    ],
    "edges": [
      {"source": "hl7", "target": "parser", "label": "Real-time"},
      {"source": "parser", "target": "bronze", "label": "Ingested"},
      {"source": "bronze", "target": "silver", "label": "Validated"},
      {"source": "silver", "target": "gold", "label": "Aggregated"}
    ]
  }',
  '{
    "before": {"label": "Manual Processing", "messages_per_day": "10000", "processing_time": "280 hrs/month", "error_rate": "12%", "cost_monthly": "$42,000"},
    "after": {"label": "Automated Pipeline", "messages_per_day": "10000", "processing_time": "2 hrs/month", "error_rate": "0.1%", "cost_monthly": "$3,200"}
  }',
  '{
    "stat": "Processing 10K HL7 messages/day manually?",
    "cost": "280 hours/month at $150/hr = $42K/month in engineering time",
    "consequence": "Plus: 12% error rate causing downstream analytics issues and compliance gaps"
  }',
  'calculator',
  '{
    "inputs": ["messages_per_day", "current_processing_method", "engineer_hourly_rate"],
    "calculation": "manual_hours_per_month * hourly_rate",
    "output": "monthly_waste_cost"
  }',
  '5 min',
  4, false
);

-- 5. DATABRICKS MONITORING & ALERTING
INSERT INTO public.competencies (
  slug, title, category, icon, tagline, key_benefit,
  architecture_diagram_type,
  metrics, fear_factor,
  challenge_type, challenge_time_estimate,
  display_order, requires_auth
) VALUES (
  'databricks-monitoring',
  'Real-Time Platform Monitoring',
  'Monitoring',
  'Activity',
  'Detect pipeline failures in 30 seconds, not 6 hours',
  'Prevent $76K average incident cost through early detection',
  'live_dashboard',
  '{
    "before": {"label": "No Monitoring", "detection_time": "6.4 hours", "incident_cost": "$76,800", "false_alarm_rate": "N/A"},
    "after": {"label": "Real-Time Monitoring", "detection_time": "30 seconds", "incident_cost": "$1,200", "false_alarm_rate": "2%"}
  }',
  '{
    "stat": "A critical job fails at 3 AM. When do you find out?",
    "cost": "Average detection time without monitoring: 6.4 hours. Cost per hour in healthcare: $12K.",
    "consequence": "That''s $76,800 per incident in missing data, broken dashboards, and angry stakeholders."
  }',
  'scenario_simulator',
  '3 min',
  5, false
);

-- 6. COST OPTIMIZATION
INSERT INTO public.competencies (
  slug, title, category, icon, tagline, key_benefit,
  architecture_diagram_type,
  metrics, fear_factor,
  challenge_type, challenge_config, challenge_time_estimate,
  display_order, requires_auth
) VALUES (
  'cost-optimization',
  'Databricks Cost Optimization',
  'Governance & Security',
  'BarChart3',
  'Reduce cloud spend by 30-50% without impacting performance',
  'Save $67K/year on a typical $156K/year Databricks deployment',
  'live_dashboard',
  '{
    "before": {"label": "Unoptimized", "annual_cost": "$156,000", "cluster_utilization": "23%", "wasted_compute": "$72,000"},
    "after": {"label": "Optimized", "annual_cost": "$89,000", "cluster_utilization": "78%", "wasted_compute": "$4,000"}
  }',
  '{
    "stat": "95% of Databricks deployments overspend by 30-50%",
    "cost": "On a $156K/year deployment, that''s $67K in preventable waste",
    "consequence": "Most waste comes from: oversized clusters (40%), idle time (35%), inefficient queries (25%)"
  }',
  'calculator',
  '{
    "inputs": ["num_clusters", "avg_cluster_size", "hours_per_day", "current_optimization"],
    "calculation": "total_annual_cost - optimized_annual_cost",
    "output": "annual_savings"
  }',
  '5 min',
  6, false
);

-- 7. PERFORMANCE TUNING
INSERT INTO public.competencies (
  slug, title, category, icon, tagline, key_benefit,
  architecture_diagram_type,
  metrics, fear_factor,
  challenge_type, challenge_time_estimate,
  display_order, requires_auth
) VALUES (
  'spark-performance-tuning',
  'Spark Performance Tuning',
  'Core Platform',
  'Zap',
  'Turn 10-minute queries into 45-second queries',
  'Save $45K/year on a single hourly job',
  'code_sandbox',
  '{
    "before": {"label": "Unoptimized Query", "execution_time": "10 minutes", "cost_per_run": "$5.40", "annual_cost": "$47,304"},
    "after": {"label": "Optimized Query", "execution_time": "45 seconds", "cost_per_run": "$0.40", "annual_cost": "$3,504"}
  }',
  '{
    "stat": "A 10-minute query running hourly costs how much per year?",
    "cost": "10 min × 24 hours × 365 days × $5.40/run = $47,304/year",
    "consequence": "Optimize to 45 seconds = $43,800/year savings on ONE query"
  }',
  'sandbox',
  '7 min',
  7, false
);

-- 8. CI/CD PIPELINES
INSERT INTO public.competencies (
  slug, title, category, icon, tagline, key_benefit,
  architecture_diagram_type, architecture_config,
  metrics, fear_factor,
  challenge_time_estimate,
  display_order, requires_auth
) VALUES (
  'cicd-pipelines',
  'CI/CD for Data Pipelines',
  'DevOps & Automation',
  'GitBranch',
  'Deploy with confidence: automated testing catches 97% of issues',
  'Reduce deployment failures from 40% to 2%',
  'react_flow',
  '{
    "pipeline_stages": [
      {"id": "commit", "label": "Git Push", "icon": "code"},
      {"id": "test", "label": "Unit Tests", "pass_rate": "100%"},
      {"id": "lint", "label": "Code Quality", "issues": 0},
      {"id": "validate", "label": "Schema Validation", "status": "pass"},
      {"id": "deploy_dev", "label": "Deploy to Dev", "duration": "2m"},
      {"id": "integration", "label": "Integration Tests", "pass_rate": "100%"},
      {"id": "deploy_prod", "label": "Deploy to Prod", "duration": "5m", "status": "success"}
    ]
  }',
  '{
    "before": {"label": "Manual Deployments", "failure_rate": "40%", "rollback_time": "2 hours", "deployments_per_month": 12},
    "after": {"label": "Automated CI/CD", "failure_rate": "2%", "rollback_time": "3 minutes", "deployments_per_month": 45}
  }',
  '{
    "stat": "Manual deployments fail 40% of the time",
    "cost": "Each failed deployment: 2 hours rollback + 4 hours debugging = $3,600",
    "consequence": "With 12 deployments/month, that''s $17,280/month in deployment overhead"
  }',
  '5 min',
  8, false
);
