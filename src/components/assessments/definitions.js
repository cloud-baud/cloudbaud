export const assessmentConfigs = {
    'data-engineering': {
        id: 'data-engineering',
        title: 'Data Platform Modernization Assessment',
        description: 'Analyze your current data infrastructure to design a scalable, high-performance Data Mesh or Lakehouse architecture.',
        steps: [
            {
                id: 'context',
                title: 'Data Landscape',
                description: 'Understand the scale and complexity of your data.',
                icon: 'Database',
                fields: [
                    { id: 'data_volume', label: 'Approximate Data Volume', type: 'radio-group', options: ['< 1TB', '1TB - 50TB', '50TB - 1PB', '1PB+'] },
                    { id: 'data_sources', label: 'Key Data Sources', type: 'checkbox-group', options: ['SQL Databases', 'NoSQL / Mongo', 'SaaS APIs (Salesforce, etc)', 'IoT / Streaming', 'Mainframe / Legacy', 'Flat Files / FTP'] },
                    { id: 'current_platform', label: 'Current Platform', type: 'radio-group', options: ['On-Premise SQL', 'Snowflake', 'Databricks', 'AWS Redshift', 'Azure Synapse', 'Google BigQuery'] }
                ]
            },
            {
                id: 'challenges',
                title: 'Pain Points & Goals',
                description: 'Identify bottlenecks in your current pipeline.',
                icon: 'TrendingUp',
                fields: [
                    { id: 'pain_points', label: 'Primary Challenges', type: 'checkbox-group', options: ['Slow Query Performance', 'Data Quality Issues', 'Lack of Governance', 'High Costs', 'Pipeline Failures', 'Siloed Data'] },
                    { id: 'goals', label: 'Key Objectives', type: 'checkbox-group', options: ['Real-time Analytics', 'Self-Service BI', 'Cost Reduction', 'AI/ML Readiness', 'Regulatory Compliance'] }
                ]
            }
        ]
    },
    'ai-engineering': {
        id: 'ai-engineering',
        title: 'AI Readiness & Strategy Assessment',
        description: 'Evaluate your organization\'s preparedness for Generative AI and Machine Learning initiatives.',
        steps: [
            {
                id: 'strategy',
                title: 'AI Strategy Profile',
                description: 'Define your ambition and current maturity.',
                icon: 'BrainCircuit',
                fields: [
                    { id: 'ai_ambition', label: 'Primary Goal', type: 'radio-group', options: ['Internal Productivity', 'Customer-Facing Chatbots', 'Product Enhancement', 'New Revenue Streams', 'Operational Automation'] },
                    { id: 'current_maturity', label: 'Current AI Maturity', type: 'radio-group', options: ['Exploratory / No AI', 'PoC Phase', 'Production (Basic ML)', 'Production (GenAI)', 'Advanced / AI-First'] }
                ]
            },
            {
                id: 'data_readiness',
                title: 'Data Readiness',
                description: 'AI is only as good as the data feeding it.',
                icon: 'Database',
                fields: [
                    { id: 'data_structure', label: 'Data State', type: 'radio-group', options: ['Mostly Unstructured (Docs/PDFs)', 'Structured (SQL/Tables)', 'Hybrid', 'Siloed / Inaccessible'] },
                    { id: 'security', label: 'Security & Privacy Constraints', type: 'checkbox-group', options: ['PII/PHI Sensitivity', 'Data Residency Req.', 'On-Premise Only', 'Public Cloud Allowed'] }
                ]
            }
        ]
    },
    'custom-applications': {
        id: 'custom-applications',
        title: 'Application Modernization Discovery',
        description: 'Plan the architecture for your next custom web or mobile application.',
        steps: [
            {
                id: 'requirements',
                title: 'Project Scope',
                description: 'Define the core parameters of the application.',
                icon: 'Code',
                fields: [
                    { id: 'platform', label: 'Target Platforms', type: 'checkbox-group', options: ['Web (React/Next.js)', 'Mobile (iOS/Android)', 'Desktop (Windows/Mac)', 'Cross-Platform'] },
                    { id: 'user_base', label: 'Target Audience', type: 'radio-group', options: ['Internal Employees (B2E)', 'Business Clients (B2B)', 'Consumers (B2C)', 'Start-up MVP'] }
                ]
            },
            {
                id: 'tech_stack',
                title: 'Technical Preferences',
                description: 'Align with your existing ecosystem.',
                icon: 'Settings',
                fields: [
                    { id: 'cloud_preference', label: 'Cloud Provider', type: 'radio-group', options: ['Azure', 'AWS', 'Google Cloud', 'On-Premise', 'No Preference'] },
                    { id: 'integrations', label: 'Required Integrations', type: 'textarea', placeholder: 'e.g., Salesforce, SAP, Stripe, Auth0...' }
                ]
            }
        ]
    },
    'cloud-solutions': {
        id: 'cloud-solutions',
        title: 'Cloud Architecture & FinOps Review',
        description: 'Analyze your cloud footprint for optimization, security, and scalability.',
        steps: [
            {
                id: 'infrastructure',
                title: 'Infrastructure Profile',
                icon: 'Cloud',
                fields: [
                    { id: 'primary_cloud', label: 'Primary Cloud', type: 'radio-group', options: ['AWS', 'Azure', 'GCP', 'Multi-Cloud', 'Hybrid'] },
                    { id: 'spend', label: 'Monthly Cloud Spend', type: 'radio-group', options: ['< $10k', '$10k - $50k', '$50k - $200k', '$200k+'] }
                ]
            },
            {
                id: 'objectives',
                title: 'Optimization Goals',
                icon: 'Target',
                fields: [
                    { id: 'priorities', label: 'Top Priorities', type: 'checkbox-group', options: ['Cost Reduction (FinOps)', 'Security Hardening', 'Performance/Scaling', 'Migration from On-Prem', 'Disaster Recovery'] }
                ]
            }
        ]
    },
    'microsoft-platform': {
        id: 'microsoft-platform',
        title: 'M365 & Power Platform Discovery',
        description: 'Identify opportunities to automate workflows and enhance collaboration.',
        steps: [
            {
                id: 'ecosystem',
                title: 'Current Ecosystem',
                icon: 'LayoutGrid',
                fields: [
                    { id: 'licenses', label: 'License Level', type: 'radio-group', options: ['E3/E5 Enterprise', 'Business Standard', 'Government (GCC)', 'Not Sure'] },
                    { id: 'focus_area', label: 'Focus Area', type: 'checkbox-group', options: ['Power BI Analytics', 'Power Apps / Automate', 'Teams Development', 'SharePoint Intranet', 'Dynamics 365'] }
                ]
            }
        ]
    },
    'devops-infrastructure': {
        id: 'devops-infrastructure',
        title: 'DevOps Maturity Assessment',
        description: 'Benchmark your CI/CD pipelines and infrastructure automation.',
        steps: [
            {
                id: 'tooling',
                title: 'Current Tooling',
                icon: 'Wrench',
                fields: [
                    { id: 'iac', label: 'Infrastructure as Code', type: 'radio-group', options: ['Terraform', 'Pulumi', 'ARM/Bicep', 'CloudFormation', 'Manual / ClickOps'] },
                    { id: 'cicd', label: 'CI/CD Platform', type: 'radio-group', options: ['GitHub Actions', 'Azure DevOps', 'Jenkins', 'GitLab CI', 'CircleCI'] }
                ]
            }
        ]
    },
    'mobile-development': {
        id: 'mobile-development',
        title: 'Mobile App Strategy Session',
        description: 'Define the roadmap for your native or cross-platform mobile initiative.',
        steps: [
            {
                id: 'mobile_scope',
                title: 'App Details',
                icon: 'Smartphone',
                fields: [
                    { id: 'app_type', label: 'App Capability', type: 'radio-group', options: ['Data Driven / Dashboard', 'Commerce / Marketplace', 'Social / Community', 'Utility / Hardware IoT'] },
                    { id: 'platforms', label: 'Target OS', type: 'checkbox-group', options: ['iOS (Native)', 'Android (Native)', 'Both (React Native/Flutter)'] }
                ]
            }
        ]
    },
    'enterprise-integration': {
        id: 'enterprise-integration',
        title: 'Enterprise Integration Planning',
        description: 'Architect a robust connectivity layer for your business systems.',
        steps: [
            {
                id: 'endpoints',
                title: 'System Landscape',
                icon: 'Network',
                fields: [
                    { id: 'core_systems', label: 'Core Systems to Connect', type: 'textarea', placeholder: 'e.g., SAP S/4HANA, Salesforce, Workday, Custom Oracle DB...' },
                    { id: 'pattern', label: 'Preferred Pattern', type: 'radio-group', options: ['API-Led Connectivity', 'Event-Driven (Kafka/EventHub)', 'Batch ETL', 'Not Sure / Hybrid'] }
                ]
            }
        ]
    },
    'solutions-architecture': {
        id: 'solutions-architecture',
        title: 'Enterprise Architecture Review',
        description: 'Align your technology strategy with long-term business goals.',
        steps: [
            {
                id: 'scope',
                title: 'Review Scope',
                icon: 'Map',
                fields: [
                    { id: 'domain', label: 'Architecture Domain', type: 'checkbox-group', options: ['Application Arch.', 'Data Arch.', 'Security Arch.', 'Cloud Infrastructure', 'Digital Transformation Strategy'] },
                    { id: 'timeline', label: 'Planning Horizon', type: 'radio-group', options: ['Current Quarter', '1-Year Roadmap', '3-5 Year Strategy'] }
                ]
            }
        ]
    }
};
