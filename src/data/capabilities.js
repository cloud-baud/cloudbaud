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
                text: 'Databricks governance',
                title: 'Databricks Governance',
                description: 'Unified data governance for AI and data assets, ensuring security and compliance (HIPAA/GDPR) via Unity Catalog.',
                image: '/infographic-database.png',
                features: [
                    { title: 'Access Control', description: 'Fine-grained row/column level permissions (ACLs) across workspaces.' },
                    { title: 'Data Lineage', description: 'Automated end-to-end lineage tracking for audit and impact analysis.' },
                    { title: 'Compliance Policies', description: 'Centralized policy enforcement for data discovery and access management.' }
                ]
            },
            {
                slug: 'healthcare-data-engineering',
                text: 'Healthcare Data & FHIR',
                title: 'Healthcare Data Engineering',
                description: 'Ingesting and transforming mission-critical healthcare feeds (HL7, FHIR, CCDA) into a queryable Lakehouse.',
                image: '/infographic-database.png',
                features: [
                    { title: 'HL7/FHIR Integration', description: 'Real-time ingestion of clinical data streams using PySpark and autoloader.' },
                    { title: 'Medallion Architecture', description: 'Structuring raw Bronze data into Silver/Gold tables for analytics and AI.' },
                    { title: 'PHI De-identification', description: 'Automated masking and tokenization of sensitive patient data at ingestion.' }
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
                slug: 'snowflake',
                text: 'Snowflake Data Cloud',
                title: 'Snowflake Data Cloud',
                description: 'Design and implementation of scalable, secure, and high-performance data warehousing solutions on Snowflake.',
                image: '/infographic-database.png',
                features: [
                    { title: 'Data Sharing', description: 'Seamlessly share live data across your organization and with partners without copying.' },
                    { title: 'Performance at Scale', description: 'Elastic multi-cluster warehouses that automatically scale compute to match workload demands.' },
                    { title: 'Modern Data Governance', description: 'Fine-grained access control and dynamic data masking for sensitive information.' }
                ]
            },
            {
                slug: 'microsoft-fabric',
                text: 'Microsoft Fabric',
                title: 'Microsoft Fabric Implementation',
                description: 'End-to-end data analytics platform integration unifying Data Engineering, Data Science, and Power BI.',
                image: '/infographic-fabric-neon.png',
                features: [
                    { title: 'OneLake Architecture', description: 'Implementing a single, unified logical data lake for the entire organization.' },
                    { title: 'Direct Lake Analysis', description: 'Ultra-fast reporting by loading data directly from storage into Power BI engine.' },
                    { title: 'Unified Governance', description: 'Centralized security and compliance management across all data assets.' }
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
            {
                slug: 'custom-ai-models',
                text: 'Custom AI model development',
                title: 'Custom AI Model Development',
                description: 'Building bespoke machine learning models tailored to your specific business problems.',
                image: '/infographic-ai.png',
                features: [
                    { title: 'Predictive Analytics', description: 'Forecasting trends and behaviors with high accuracy.' },
                    { title: 'Computer Vision', description: 'Image and video analysis for automation and quality control.' },
                    { title: 'NLP Solutions', description: 'Natural language processing for sentiment analysis and text classification.' }
                ]
            },
            {
                slug: 'llm-integration',
                text: 'LLM integration & fine-tuning',
                title: 'LLM Integration & Fine-Tuning',
                description: 'Leveraging Large Language Models (GPT, Claude, Llama) for enterprise applications.',
                image: '/infographic-ai.png',
                features: [
                    { title: 'RAG Architecture', description: 'Retrieval-Augmented Generation for grounded, accurate AI responses.' },
                    { title: 'Private Hosting', description: 'Deploying open-source models within your secure infrastructure.' },
                    { title: 'Fine-Tuning', description: 'Adapting foundation models to your domain-specific data and voice.' }
                ]
            },
            {
                slug: 'ml-pipelines',
                text: 'ML pipeline development',
                title: 'ML Pipeline MLOps',
                description: 'End-to-end automation for model training, deployment, and monitoring.',
                image: '/infographic-ai.png',
                features: [
                    { title: 'Automated Training', description: 'CI/CD for machine learning models ensuring reproducibility.' },
                    { title: 'Model Monitoring', description: 'Tracking drift and performance metrics in real-time production.' },
                    { title: 'Feature Stores', description: 'Centralized management of model features for consistency.' }
                ]
            },
            {
                slug: 'ai-strategy',
                text: 'AI strategy consulting',
                title: 'AI Strategy Consulting',
                description: 'Guiding your organization through the AI transformation journey.',
                image: '/infographic-ai.png',
                features: [
                    { title: 'Use Case Discovery', description: 'Identifying high-impact opportunities for AI implementation.' },
                    { title: 'Feasibility Analysis', description: 'Technical and economic assessment of proposed AI projects.' },
                    { title: 'Roadmap Planning', description: 'Phased implementation plans aligned with business goals.' }
                ]
            }
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
            // Core Competencies
            {
                slug: 'modern-web-applications',
                text: 'Modern Web Applications',
                title: 'Modern Web Application Development',
                description: 'Responsive, single-page applications (SPAs) built with React, Angular, or Vue.',
                image: '/infographic-custom-apps.png',
                features: [
                    { title: 'Responsive Design', description: 'Mobile-first interfaces that look great on any device.' },
                    { title: 'Performance Optimization', description: 'Optimized loading times and smooth interactions using modern build tools like Vite and Next.js.' },
                    { title: 'Scalable Architecture', description: 'Designed to grow with your user base and feature set from day one.' }
                ]
            },
            {
                slug: 'microservices-architecture',
                text: 'Microservices Architecture',
                title: 'Microservices & Distributed Systems',
                description: 'Decouple your monolithic applications into independently deployable, scalable services.',
                image: '/infographic-custom-apps.png',
                features: [
                    { title: 'Independent Scaling', description: 'Scale individual components based on demand rather than the entire application.' },
                    { title: 'System Resilience', description: 'Isolate failures to prevent system-wide outages; services fail gracefully.' },
                    { title: 'Development Agility', description: 'Enable smaller, autonomous teams to develop, deploy, and scale their services independently.' }
                ]
            },
            {
                slug: 'api-development',
                text: 'API Development',
                title: 'REST & GraphQL API Development',
                description: 'Robust, secure, and documented APIs to power your integrations and front-end applications.',
                image: '/infographic-custom-apps.png',
                features: [
                    { title: 'API-First Design', description: 'Defining contracts with OpenAPI (Swagger) before writing code ensures consistency.' },
                    { title: 'Enterprise Security', description: 'Implementing OAuth2, JWT, and rate limiting to protect your sensitive data.' },
                    { title: 'High Performance', description: 'Caching, compression, and efficient database queries for high-throughput endpoints.' }
                ]
            },
            {
                slug: 'legacy-modernization',
                text: 'Legacy Modernization',
                title: 'Legacy System Modernization',
                description: 'Transform outdated systems into modern, cloud-native applications without disrupting business operations.',
                image: '/infographic-custom-apps.png',
                features: [
                    { title: 'Strangler Fig Pattern', description: 'Incrementally replacing legacy functionality with new applications and services.' },
                    { title: 'Cloud Migration', description: 'Moving on-premise workloads to scalable cloud infrastructure (AWS/Azure).' },
                    { title: 'Code Refactoring', description: 'Improving code quality and maintainability while preserving critical business logic.' }
                ]
            },

            // Specific Technologies
            {
                slug: 'blazor',
                text: 'Blazor Development',
                title: 'Blazor Web Development',
                description: 'Build interactive, high-performance web UIs using C# instead of JavaScript.',
                image: '/infographic-custom-apps.png',
                features: [
                    { title: 'Full-Stack C#', description: 'Share code and logic between client and server for a unified development experience.' },
                    { title: 'WebAssembly Support', description: 'Run client-side code at near-native speed directly in the browser.' },
                    { title: 'Component Ecosystem', description: 'Leverage a rich ecosystem of reusable UI components for rapid development.' }
                ]
            },
            {
                slug: 'maui',
                text: '.NET MAUI',
                title: '.NET MAUI Cross-Platform',
                description: 'Build native apps for Android, iOS, macOS, and Windows from a single shared codebase.',
                image: '/infographic-custom-apps.png',
                features: [
                    { title: 'Single Codebase', description: 'Write once, run everywhere while maintaining native performance and look-and-feel.' },
                    { title: 'Native UI', description: 'Access native platform APIs and UI controls directly from C#.' },
                    { title: 'Enterprise Ready', description: 'Trusted by enterprises for building scalable, maintainable cross-platform solutions.' }
                ]
            },
            {
                slug: 'android',
                text: 'Android Development',
                title: 'Native Android Development',
                description: 'Create powerful, feature-rich native Android applications using Kotlin and Jetpack Compose.',
                image: '/infographic-mobile.png',
                features: [
                    { title: 'Kotlin First', description: 'Utilization of modern Kotlin features for safer, more concise code.' },
                    { title: 'Jetpack Compose', description: 'Building modern, reactive UIs with Google\'s latest toolkit.' },
                    { title: 'Performance Optimization', description: 'Deep profiling and optimization for battery life and responsiveness.' }
                ]
            },
            {
                slug: 'ios',
                text: 'iOS Development',
                title: 'Native iOS Development',
                description: 'Deliver premium native iOS experiences using Swift and SwiftUI.',
                image: '/infographic-mobile.png',
                features: [
                    { title: 'Swift & SwiftUI', description: 'Modern, declarative UI development for the Apple ecosystem.' },
                    { title: 'Human Interface Guidelines', description: 'Strict adherence to Apple\'s design principles for top-tier user experience.' },
                    { title: 'App Store Success', description: 'End-to-end support for App Store submission and compliance.' }
                ]
            }
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
            {
                slug: 'finops-optimization',
                text: 'FinOps & Cost Optimization',
                title: 'FinOps & Cloud Cost Optimization',
                description: 'Maximize business value by enabling engineering and finance teams to collaborate on cloud spending decisions.',
                image: '/infographic-cloud.png',
                features: [
                    { title: 'Visibility & Allocation', description: 'Real-time dashboards breaking down spend by business unit, application, and team.' },
                    { title: 'Rate Optimization', description: 'Strategic management of Reserved Instances, Savings Plans, and Spot potential.' },
                    { title: 'Cloud Governance', description: 'Automated policies to prevent waste and ensure budget accountability.' }
                ]
            },
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
            {
                slug: 'spfx',
                text: 'SharePoint Framework (SPFx)',
                title: 'SharePoint Framework (SPFx) Development',
                description: 'Build modern, responsive, and mobile-ready intranets with custom client-side web parts and extensions.',
                image: '/infographic-microsoft.png',
                features: [
                    { title: 'Custom Web Parts', description: 'Develop rich, responsive client-side web parts using React, Angular, or Vue that integrate seamlessly with SharePoint Modern Experience.' },
                    { title: 'Viva Connections', description: 'Extend your intranet into Microsoft Teams with Viva Connections cards and adaptive dashboard components.' },
                    { title: 'Application Customizers', description: 'Inject scripts and styling across modern site collections to deliver consistent branding and global navigation.' }
                ]
            },
            {
                slug: 'microsoft-teams',
                text: 'Microsoft Teams Development',
                title: 'Microsoft Teams App Development',
                description: 'Extend Microsoft Teams with custom tabs, bots, and messaging extensions to supercharge collaboration.',
                image: '/infographic-microsoft.png',
                features: [
                    { title: 'Collaborative Apps', description: 'Build context-aware tabs and personal apps that allow users to work together on content without leaving Teams.' },
                    { title: 'Conversational Bots', description: 'Deploy intelligent bots using the Bot Framework SDK to automate Q&A, workflows, and task management.' },
                    { title: 'Meeting Extensions', description: 'Create interactive experiences within the meeting lifecycle—pre-meeting, in-meeting side panels, and post-meeting summaries.' }
                ]
            },
            {
                slug: 'microsoft-graph-api',
                text: 'Microsoft Graph API',
                title: 'Microsoft Graph API Integration',
                description: 'Unlock the data in Microsoft 365. Connect users, mail, calendar, and documents into your custom apps.',
                image: '/infographic-microsoft.png',
                features: [
                    { title: 'Unified Data Access', description: 'Access a wealth of data across M365 (Exchange, OneDrive, SharePoint, Entra ID) through a single REST API endpoint.' },
                    { title: 'Real-time Webhooks', description: 'Subscribe to change notifications to trigger business logic instantly when emails arrive, files change, or events are updated.' },
                    { title: 'Security & Governance', description: 'Implement secure OAuth2.0 flows and granular permission scopes to ensure data is accessed safely and compliantly.' }
                ]
            },
            {
                slug: 'power-automate',
                text: 'Power Automate workflows',
                title: 'Power Automate Workflow Automation',
                description: 'Streamline repetitive tasks and paperless processes with advanced automated workflows.',
                image: '/infographic-microsoft.png',
                features: [
                    { title: 'Business Process Flows', description: 'Guide users through standard business processes with visual indicators and stage-gating logic.' },
                    { title: 'Advanced Connectors', description: 'Integrate with over 400+ services or build Custom Connectors to talk to your proprietary internal APIs.' },
                    { title: 'RPA & Desktop Flows', description: 'Automate legacy applications without APIs using UI flows and robotic process automation capabilities.' }
                ]
            },
            {
                slug: 'dynamics-365',
                text: 'Dynamics 365 suite',
                title: 'Dynamics 365 Solutions',
                description: 'Intelligent business applications that adapt to your changing needs across Sales, Service, and Operations.',
                image: '/infographic-microsoft.png',
                features: [
                    { title: 'Customer Engagement', description: 'Customize Dynamics 365 Sales and Customer Service modules to match your unique sales cycle.' },
                    { title: 'Plugin Development', description: 'Extend the platform core logic with server-side C# plugins to handle complex transaction validation.' },
                    { title: 'Power Platform Integration', description: 'Seamlessly extend D365 data with embedded Power Apps and Power BI dashboards.' }
                ]
            },
            {
                slug: 'power-platform',
                text: 'Power Apps & Power BI',
                title: 'Power Apps & Power BI Analytics',
                description: 'Empower your team with low-code apps and actionable insights through interactive data visualizations.',
                image: '/infographic-microsoft.png',
                features: [
                    { title: 'Canvas & Model-Driven Apps', description: 'Rapidly build interface-rich apps for mobile workforce or complex data-dense administration portals.' },
                    { title: 'Interactive Dashboards', description: 'Transform raw data into stunning visualizations and drill-down reports with Power BI.' },
                    { title: 'Dataverse Architecture', description: 'Leverage the secure, scalable Common Data Service (Dataverse) to model your business entities and relationships.' }
                ]
            }
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
            {
                slug: 'ios-development',
                text: 'iOS (Swift) development',
                title: 'Native iOS Development',
                description: 'Building premium, high-performance applications for the Apple ecosystem.',
                image: '/infographic-mobile.png',
                features: [
                    { title: 'Swift & SwiftUI', description: 'Modern, declarative UI development for rapid iteration.' },
                    { title: 'App Store Success', description: 'End-to-end management of the submission and review process.' },
                    { title: 'Apple Hardware', description: 'Integration with camera, lidar, and biometric sensors.' }
                ]
            },
            {
                slug: 'android-development',
                text: 'Android (Kotlin) development',
                title: 'Native Android Development',
                description: 'Creating robust, scalable applications for the diverse Android device landscape.',
                image: '/infographic-mobile.png',
                features: [
                    { title: 'Modern Kotlin', description: 'Leveraging coroutines and Flow for asynchronous operations.' },
                    { title: 'Jetpack Compose', description: 'Building beautiful, reactive UIs with Google\'s latest toolkit.' },
                    { title: 'Material Design', description: 'Adherence to latest design guidelines for intuitive UX.' }
                ]
            },
            {
                slug: 'cross-platform-mobile',
                text: 'React Native & Flutter',
                title: 'Cross-Platform Mobile Development',
                description: 'One codebase, two native apps. Efficiency without compromising quality.',
                image: '/infographic-mobile.png',
                features: [
                    { title: 'Code Reusability', description: 'Share up to 90% of code between iOS and Android platforms.' },
                    { title: 'Near-Native Speed', description: 'High-performance rendering engines for smooth 60fps animations.' },
                    { title: 'Faster Time-to-Market', description: 'Launch on both platforms simultaneously with a smaller team.' }
                ]
            },
            {
                slug: 'mobile-cicd',
                text: 'Mobile CI/CD',
                title: 'Mobile DevOps & CI/CD',
                description: 'Automated building, testing, and deployment pipelines for mobile apps.',
                image: '/infographic-mobile.png',
                features: [
                    { title: 'Automated Testing', description: 'Running unit and UI tests on real devices before every release.' },
                    { title: 'OTA Updates', description: 'Pushing critical patches instantly using CodePush or similar tools.' },
                    { title: 'Release Management', description: 'Streamlined beta distribution via TestFlight and Play Console.' }
                ]
            }
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
            {
                slug: 'salesforce-sap-integration',
                text: 'Salesforce & SAP integration',
                title: 'Salesforce & SAP Integration',
                description: 'Unifying your CRM and ERP systems for a 360-degree view of your business.',
                image: '/infographic-integration.png',
                features: [
                    { title: 'Data Synchronization', description: 'Real-time syncing of customer and order data between platforms.' },
                    { title: 'Process Automation', description: 'Triggering fulfillment in SAP automatically when deals close in Salesforce.' },
                    { title: 'Custom Connectors', description: 'Building bespoke adapters for complex business logic preservation.' }
                ]
            },
            {
                slug: 'oracle-servicenow-integration',
                text: 'Oracle & ServiceNow',
                title: 'Oracle & ServiceNow Integration',
                description: 'Streamlining IT service management and enterprise resource planning.',
                image: '/infographic-integration.png',
                features: [
                    { title: 'ITSM Automation', description: 'Automating ticket creation based on Oracle system alerts.' },
                    { title: 'Asset Management', description: 'Keeping hardware and software inventory in sync across the enterprise.' },
                    { title: 'Workflow Orchestration', description: 'Cross-platform approvals and process chaining.' }
                ]
            },
            {
                slug: 'monitoring-observability',
                text: 'Datadog & Wiz monitoring',
                title: 'Datadog & Wiz Monitoring',
                description: 'Full-stack observability and cloud security posture management.',
                image: '/infographic-integration.png',
                features: [
                    { title: 'APM Implementation', description: 'Tracing requests across microservices to pinpoint latency.' },
                    { title: 'Security Scanning', description: 'Continuous vulnerability assessment of cloud infrastructure.' },
                    { title: 'Log Aggregation', description: 'Centralized logging for rapid incident response and auditing.' }
                ]
            },
            {
                slug: 'wms-supply-chain',
                text: 'Korber HighJump WMS',
                title: 'Korber HighJump WMS Integration',
                description: 'Optimizing supply chain operations through seamless warehouse management integration.',
                image: '/infographic-integration.png',
                features: [
                    { title: 'Inventory Visibility', description: 'Real-time stock levels exposed to e-commerce and ERP systems.' },
                    { title: 'Shipping Automation', description: 'Automated label generation and carrier selection.' },
                    { title: 'EDI Compliance', description: 'Standardized electronic data interchange with trading partners.' }
                ]
            },
            {
                slug: 'api-management',
                text: 'REST & GraphQL APIs',
                title: 'Enterprise API Management',
                description: 'Design, security, and lifecycle management for your API ecosystem.',
                image: '/infographic-integration.png',
                features: [
                    { title: 'Gateway Configuration', description: 'Centralized rate limiting, authentication, and routing.' },
                    { title: 'Developer Portals', description: 'Self-service documentation and key management for consumers.' },
                    { title: 'Version Control', description: 'Strategies for evolving APIs without breaking clients.' }
                ]
            },
            {
                slug: 'esb-middleware',
                text: 'Enterprise service bus',
                title: 'ESB & Middleware Solutions',
                description: 'Decoupled communication backbones for complex enterprise architectures.',
                image: '/infographic-integration.png',
                features: [
                    { title: 'Message Queuing', description: 'Reliable asynchronous processing with RabbitMQ or Azure Service Bus.' },
                    { title: 'Protocol Transformation', description: 'Bridging modern REST services with legacy SOAP/XML systems.' },
                    { title: 'Event Sourcing', description: 'Building reactive systems based on immutable event logs.' }
                ]
            }
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
            {
                slug: 'togaf-architecture',
                text: 'TOGAF architecture',
                title: 'TOGAF Enterprise Architecture',
                description: 'Implementing the Open Group Architecture Framework for standardized enterprise design.',
                image: '/infographic-solutions.png',
                features: [
                    { title: 'ADM Cycle', description: 'Iterative Architecture Development Method for continuous improvement.' },
                    { title: 'Stakeholder Management', description: 'Aligning business goals with technical constraints across the organization.' },
                    { title: 'Governance Models', description: 'Establishing clear decision-making frameworks for IT investments.' }
                ]
            },
            {
                slug: 'zachman-framework',
                text: 'Zachman Framework',
                title: 'Zachman Framework Implementation',
                description: 'Organizing architectural artifacts using the Zachman ontology for complete enterprise visibility.',
                image: '/infographic-solutions.png',
                features: [
                    { title: 'Primitive Interrogatives', description: 'Mapping Who, What, Where, When, Why, and How across architecture layers.' },
                    { title: 'Gap Analysis', description: 'Identifying missing components or redundancies in your current IT landscape.' },
                    { title: 'Taxonomy Standardization', description: 'Creating a common vocabulary for business and IT alignment.' }
                ]
            },
            {
                slug: 'aws-well-architected',
                text: 'AWS Well-Architected',
                title: 'AWS Well-Architected Framework',
                description: 'Designing and reviewing cloud workloads against the six pillars of operational excellence.',
                image: '/infographic-solutions.png',
                features: [
                    { title: 'Operational Excellence', description: 'Running and monitoring systems to deliver business value.' },
                    { title: 'Security & Reliability', description: 'Protecting information and ensuring workload recovery.' },
                    { title: 'Cost Optimization', description: 'Avoid unnecessary costs while meeting performance requirements.' }
                ]
            },
            {
                slug: 'safe-agile',
                text: 'SAFe Agile methodology',
                title: 'SAFe Agile Methodology',
                description: 'Scaling Agile practices to the enterprise level for coordinated delivery.',
                image: '/infographic-solutions.png',
                features: [
                    { title: 'Program Increment Planning', description: 'Aligning teams to a shared mission and vision.' },
                    { title: 'Lean Portfolio Management', description: 'Connecting strategy to execution through value streams.' },
                    { title: 'Continuous Delivery', description: 'Building a pipeline for on-demand releases.' }
                ]
            },
            {
                slug: 'enterprise-governance',
                text: 'Enterprise governance',
                title: 'Enterprise Governance Strategy',
                description: 'Policies and frameworks to ensure IT delivers value while mitigating risk.',
                image: '/infographic-solutions.png',
                features: [
                    { title: 'Standardization', description: 'Defining approved technology stacks and patterns.' },
                    { title: 'Compliance Audits', description: 'Regular reviews against regulatory and internal standards.' },
                    { title: 'Risk Management', description: 'Proactive identification and mitigation of improved risks.' }
                ]
            },
            {
                slug: 'architecture-consulting',
                text: 'Architecture consulting',
                title: 'Strategic Architecture Consulting',
                description: 'Expert guidance for complex digital transformation initiatives.',
                image: '/infographic-solutions.png',
                features: [
                    { title: 'Current State Assessment', description: 'Deep analysis of existing legacy systems and technical debt.' },
                    { title: 'Target Architecture', description: 'Designing the future state ecosystem aligned with 3-5 year goals.' },
                    { title: 'Vendor Selection', description: 'Unbiased evaluation of third-party platforms and tools.' }
                ]
            }
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
