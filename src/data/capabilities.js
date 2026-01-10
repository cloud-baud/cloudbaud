import {
    Database,
    Cpu,
    Code,
    Cloud,
    Target,
    Smartphone,
    Shield,
    Zap
} from 'lucide-react';

export const technicalCapabilities = [
    {
        id: 'data-engineering',
        slug: 'data-engineering',
        icon: Database,
        title: 'Data Engineering',
        description: 'Databricks, Snowflake, PostgreSQL, MongoDB, SQL Server, Oracle, and cloud-native databases',
        infographic: '/infographic-database.png',
        capabilities: [
            {
                slug: 'cluster-troubleshooting',
                text: 'Cluster troubleshooting',
                title: 'Data Cluster Troubleshooting',
                description: 'Expert diagnosis and resolution of distributed computing cluster issues for Databricks and Spark environments.',
                image: '/infographic-database.png',
                features: [
                    { title: 'Root Cause Analysis', description: 'Deep dive into driver/executor logs to identify memory leaks and skew.' },
                    { title: 'Configuration Tuning', description: 'Optimization of instance types and auto-scaling policies to prevent failures.' },
                    { title: 'Recovery Strategies', description: 'Implementation of robust retry logic and checkpointing.' }
                ]
            },
            {
                slug: 'unity-catalog-governance',
                text: 'Unity Catalog governance',
                title: 'Unity Catalog Governance',
                description: 'Unified data governance for data and AI assets on the Lakehouse, ensuring security and compliance.',
                image: '/infographic-database.png',
                features: [
                    { title: 'Access Control', description: 'Fine-grained row and column level permissions across workspaces.' },
                    { title: 'Data Lineage', description: 'Automated lineage tracking to understand data flow and impact.' },
                    { title: 'Data Sharing', description: 'Secure sharing of live data sets without copying via Delta Sharing.' }
                ]
            },
            {
                slug: 'sql-delta-migration',
                text: 'SQL → Delta migration',
                title: 'SQL to Delta Lake Migration',
                description: 'Modernizing legacy SQL warehouses to the high-performance, open Delta Lake format.',
                image: '/infographic-database.png',
                features: [
                    { title: 'Schema Evolution', description: 'Adaptive schema management to handle changing data structures.' },
                    { title: 'ACID Transactions', description: 'Bringing reliability and data integrity to your data lake.' },
                    { title: 'Performance', description: 'Up to 10x faster query performance with optimization techniques like Z-Ordering.' }
                ]
            },
            {
                slug: 'foundry-coexistence',
                text: 'Foundry coexistence',
                title: 'Palantir Foundry Coexistence',
                description: 'Seamless integration strategies for running Databricks and Palantir Foundry in parallel.',
                image: '/infographic-database.png',
                features: [
                    { title: 'Bi-Directional Sync', description: 'Automated pipelines to keep data synchronized between platforms.' },
                    { title: 'Unified Governance', description: 'Strategy to maintain compliance across both ecosystems.' },
                    { title: 'Cost Optimization', description: 'Leveraging the right compute engine for the right workload.' }
                ]
            },
            {
                slug: 'cost-optimization',
                text: 'Cost optimization',
                title: 'Cloud Data Cost Optimization',
                description: 'Strategic analysis and implementation of cost-saving measures for big data workloads.',
                image: '/infographic-database.png',
                features: [
                    { title: 'Spot Instance Usage', description: 'Leveraging spot instances for non-critical batch workloads.' },
                    { title: 'Auto-Termination', description: 'Aggressive policies to shut down idle resources.' },
                    { title: 'Workload Right-Sizing', description: 'Matching compute resources precisely to job requirements.' }
                ]
            },
            {
                slug: 'spark-performance-tuning',
                text: 'Spark performance tuning',
                title: 'Spark Performance Tuning',
                description: 'Deep optimization of Apache Spark jobs to reduce runtime and resource consumption.',
                image: '/infographic-database.png',
                features: [
                    { title: 'Shuffle Optimization', description: 'Reducing expensive network I/O through broadcast joins and partitioning.' },
                    { title: 'Memory Management', description: 'Tuning GC and memory fractions to eliminate OOM errors.' },
                    { title: 'Skew Handling', description: 'Salting and repartitioning strategies to handle uneven data distribution.' }
                ]
            }
        ]
    },
    {
        id: 'ai-engineering',
        slug: 'ai-engineering',
        icon: Cpu,
        title: 'AI Engineering',
        description: 'LLM integration, machine learning, and intelligent systems',
        infographic: '/infographic-ai.png',
        capabilities: [
            'Custom AI model development',
            'LLM integration & fine-tuning',
            'ML pipeline development',
            'AI strategy consulting'
        ]
    },
    {
        id: 'custom-applications',
        slug: 'custom-applications',
        icon: Code,
        title: 'Custom Applications',
        description: 'Full-stack web and enterprise application development',
        infographic: '/infographic-custom-apps.png',
        capabilities: [
            'Modern web applications',
            'Microservices architecture',
            'API development',
            'Legacy modernization'
        ]
    },
    {
        id: 'cloud-solutions',
        slug: 'cloud-solutions',
        icon: Cloud,
        title: 'Cloud Solutions',
        description: 'AWS, Azure, and Google Cloud Platform expertise',
        infographic: '/infographic-cloud.png',
        capabilities: [
            'Cloud migration',
            'Infrastructure as Code',
            'Serverless architecture',
            'Multi-cloud strategy'
        ]
    },
    {
        id: 'microsoft-platform',
        slug: 'microsoft-platform',
        icon: Target,
        title: 'Microsoft Platform',
        description: 'SharePoint, Power Platform, and Dynamics 365 ecosystem',
        infographic: '/infographic-microsoft.png',
        capabilities: [
            'SharePoint Framework (SPFx)',
            'Microsoft Teams Development',
            'Microsoft Graph API',
            'Power Automate workflows',
            'Dynamics 365 suite',
            'Power Apps & Power BI'
        ]
    },
    {
        id: 'devops-infrastructure',
        slug: 'devops-infrastructure',
        icon: Code,
        title: 'DevOps & Infrastructure',
        description: 'Automated infrastructure provisioning and configuration management',
        infographic: '/infographic-devops.png',
        capabilities: [
            {
                slug: 'terraform',
                text: 'Terraform for IaC',
                title: 'Terraform Infrastructure as Code',
                description: 'We use Terraform to define cloud and on-premise resources in human-readable configuration files that you can version, reuse, and share.',
                image: '/infographic-devops.png',
                features: [
                    { title: 'Multi-Cloud Provisioning', description: 'Deploy infrastructure to AWS, Azure, Google Cloud, and Kubernetes from a single workflow.' },
                    { title: 'State Management', description: 'Track resource changes throughout your deployment lifecycle with robust state handling.' },
                    { title: 'Module Reusability', description: 'Create reusable components for standard infrastructure patterns to speed up development.' }
                ]
            },
            {
                slug: 'ansible',
                text: 'Ansible automation',
                title: 'Ansible Automation',
                description: 'Ansible is our tool of choice for configuration management, application deployment, and task automation. It is agentless and powerful.',
                image: '/infographic-devops.png',
                features: [
                    { title: 'Agentless Architecture', description: 'No software needed on remote nodes; uses standard SSH/WinRM.' },
                    { title: 'Playbook Automation', description: 'Define automation tasks in simple YAML, making it easy to read and version control.' },
                    { title: 'Configuration Drift', description: 'Ensure all servers remain in the desired state automatically.' }
                ]
            },
            {
                slug: 'terraform-cicd-automation',
                text: 'Terraform + CI/CD automation',
                title: 'Terraform & CI/CD Automation',
                description: 'End-to-end automation of infrastructure provisioning coupled with continuous integration and delivery.',
                image: '/infographic-devops.png',
                features: [
                    { title: 'GitOps Workflow', description: 'Infrastructure changes trigger automatic plan and apply in pipelines.' },
                    { title: 'Policy as Code', description: 'Automated compliance checks (Sentinel/OPA) before deployment.' },
                    { title: 'Drift Detection', description: 'Scheduled pipelines to detect and remediate manual changes.' }
                ]
            },
            {
                slug: 'kubernetes',
                text: 'Kubernetes orchestration',
                title: 'Kubernetes (K8s) Orchestration',
                description: 'We design and manage production-grade Kubernetes clusters for containerized application scaling and management.',
                image: '/infographic-devops.png',
                features: [
                    { title: 'Auto-Scaling', description: 'Automatically adjust the number of running pods based on CPU or memory usage.' },
                    { title: 'Self-Healing', description: 'Restart containers that fail, replace and reschedule containers when nodes die.' },
                    { title: 'Service Discovery', description: 'Automatically load balance traffic across your application containers.' }
                ]
            }
        ]
    },
    {
        id: 'mobile-development',
        slug: 'mobile-development',
        icon: Smartphone,
        title: 'Mobile Development',
        description: 'Native iOS, Android, and cross-platform solutions',
        infographic: '/infographic-mobile.png',
        capabilities: [
            'iOS (Swift) development',
            'Android (Kotlin) development',
            'React Native & Flutter',
            'Mobile CI/CD'
        ]
    },
    {
        id: 'enterprise-integration',
        slug: 'enterprise-integration',
        icon: Target,
        title: 'Enterprise Integration',
        description: 'Connect and automate across enterprise platforms',
        infographic: '/infographic-integration.png',
        capabilities: [
            'Salesforce & SAP integration',
            'Oracle & ServiceNow',
            'Datadog & Wiz monitoring',
            'Korber HighJump WMS',
            'REST & GraphQL APIs',
            'Enterprise service bus'
        ]
    },
    {
        id: 'solutions-architecture',
        slug: 'solutions-architecture',
        icon: Target,
        title: 'Solutions Architecture',
        description: 'Enterprise architecture frameworks and strategic guidance',
        infographic: '/infographic-solutions.png',
        capabilities: [
            'TOGAF architecture',
            'Zachman Framework',
            'AWS Well-Architected',
            'SAFe Agile methodology',
            'Enterprise governance',
            'Architecture consulting'
        ]
    }
];

export const deliveryModels = [
    {
        icon: Zap,
        title: 'Pre-Built AI Agents',
        description: 'Deploy ready-made AI solutions in days with proven ROI',
        benefits: ['Fastest time to value', 'Predictable pricing', 'Proven results']
    },
    {
        icon: Code,
        title: 'Custom Development',
        description: 'Tailored solutions built to your exact specifications',
        benefits: ['Complete flexibility', 'Expert team', 'Scalable architecture']
    },
    {
        icon: Shield,
        title: 'Consulting & Advisory',
        description: 'Strategic guidance for your technology initiatives',
        benefits: ['Technology strategy', 'Architecture review', 'Best practices']
    }
];
