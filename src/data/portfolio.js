export const portfolioProjects = [
    // FINANCE: Algorithmic Risk Modeling (Fabric + Databricks)
    {
        id: 'finance-risk-modeling',
        title: 'Algorithmic Risk Analytics Platform',
        client: 'FinTech Demo',
        category: 'Data Engineering',
        tags: ['Microsoft Fabric', 'Databricks', 'PySpark', 'Power BI'],
        industry: 'Finance',
        image: '/portfolio/finance-dashboard.png', // Placeholder
        description: 'End-to-end risk modeling platform processing 1M+ transactions daily for real-time fraud detection and liquidity forecasting.',
        challenge: 'Financial institutions require sub-second risk assessment on high-velocity transaction streams. Legacy batch processing systems introduced dangerous latency in fraud detection.',
        solution: 'Architected a lakehouse solution on Microsoft Fabric using Databricks for real-time stream processing. Implemented Delta Lake for ACID transactions and Power BI for executive risk dashboards.',
        results: [
            'Sub-second fraud detection latency',
            'Unified batch and streaming architecture',
            '30% reduction in compute costs via autoscaling',
            'Regulatory compliance automated reporting'
        ],
        technologies: ['Microsoft Fabric', 'Azure Databricks', 'Delta Lake', 'PySpark', 'Power BI'],
        duration: '4 months',
        year: '2025'
    },

    // HEALTHCARE: HIPAA-Compliant Data Lake (Azure + Terraform)
    {
        id: 'healthcare-data-lake',
        title: 'Secure HIPAA-Compliant Data Lake',
        client: 'HealthCare Demo',
        category: 'Architecture',
        tags: ['Azure', 'Terraform', 'Security', 'Compliance'],
        industry: 'Healthcare',
        image: '/portfolio/healthcare-architecture.png', // Placeholder
        description: 'Zero-trust cloud infrastructure for securing sensitive patient health information (PHI) at scale.',
        challenge: 'Healthcare providers struggle to innovate with data due to strict HIPAA compliance requirements. Manual infrastructure provisioning was error-prone and unscalable.',
        solution: 'Deployed a fully automated Azure landing zone using Terraform. Implemented strict network isolation, encryption in transit/rest, and automated compliance auditing policies.',
        results: [
            '100% Infrastructure-as-Code (Terraform)',
            'Automated HIPAA compliance validation',
            'Zero-trust network architecture',
            'Secure research enclaves for data scientists'
        ],
        technologies: ['Azure', 'Terraform', 'Azure Policy', 'Key Vault', 'Sentinel'],
        duration: '3 months',
        year: '2024'
    },

    // SUPPLY CHAIN: IoT Real-time Tracking (Azure IoT + Stream Analytics)
    {
        id: 'supply-chain-iot',
        title: 'Global Supply Chain Control Tower',
        client: 'Logistics Demo',
        category: 'Custom Applications',
        tags: ['IoT Hub', 'Stream Analytics', 'Cosmos DB', 'React'],
        industry: 'Supply Chain',
        image: '/portfolio/supply-chain-map.png', // Placeholder
        description: 'Real-time visibility platform tracking shipment telemetry (location, temp, shock) across global logistics networks.',
        challenge: 'Global logistics firms lack visibility into shipment conditions in transit, leading to spoilage and lost inventory. Legacy EDI systems provided only milestone updates.',
        solution: 'Built an IoT ingestion pipeline using Azure IoT Hub and Stream Analytics. Data is visualized in a real-time React dashboard backed by Cosmos DB for low-latency geo-spatial queries.',
        results: [
            'Real-time telemetry for 50k+ active shipments',
            'Predictive delay alerts via ML',
            'Reduced spoilage by 15% via temp monitoring',
            'Global comprehensive visibility'
        ],
        technologies: ['Azure IoT Hub', 'Stream Analytics', 'Cosmos DB', 'React', 'Azure Maps'],
        duration: '5 months',
        year: '2024'
    },

    // PUBLIC SECTOR: Transparency Portal (Power BI + Fabric)
    {
        id: 'public-sector-transparency',
        title: 'State Budget Transparency Portal',
        client: 'GovTech Demo',
        category: 'Data & Platforms',
        tags: ['Power BI', 'Fabric', 'Open Data', 'Accessibility'],
        industry: 'Public Sector',
        image: '/portfolio/gov-portal.png', // Placeholder
        description: 'Citizen-facing open data portal visualizing state budget allocation, expenditure, and performance metrics.',
        challenge: 'Government agencies needed to build trust with citizens by making budget data accessible and understandable, moving away from opaque PDF reports.',
        solution: 'Developed a high-concurrency public dashboard using Power BI Embedded backed by Microsoft Fabric OneLake. Designed with strict WCAG 2.1 accessibility standards.',
        results: [
            'WCAG 2.1 AA Compliant',
            'Supports 100k+ concurrent citizen viewers',
            'Automated data refresh from ERP systems',
            'Interactive drill-down capabilities'
        ],
        technologies: ['Microsoft Fabric', 'Power BI Embedded', 'React', 'Azure CDN'],
        duration: '3 months',
        year: '2025'
    },

    // EDUCATION: Scalable LMS Infrastructure (Terraform + Kubernetes)
    {
        id: 'education-lms-scale',
        title: 'Hyper-Scale LMS Infrastructure',
        client: 'EdTech Demo',
        category: 'Architecture',
        tags: ['Kubernetes', 'AKS', 'Redis', 'Microservices'],
        industry: 'Education',
        image: '/portfolio/edtech-infra.png', // Placeholder
        description: 'Cloud-native infrastructure supporting millions of concurrent students for online learning platforms.',
        challenge: 'An EdTech platform faced crashing during exam periods due to inability to handle massive concurrent user spikes.',
        solution: 'Re-architected the monolithic application into microservices running on Azure Kubernetes Service (AKS). Implemented KEDA for event-driven autoscaling based on HTTP traffic.',
        results: [
            'Auto-scales from 10 to 1,000 pods in minutes',
            '99.99% uptime during peak exam windows',
            '50% cost reduction during off-peak hours',
            'Global content delivery acceleration'
        ],
        technologies: ['Azure Kubernetes Service', 'KEDA', 'Redis', 'Terraform', 'Helm'],
        duration: '6 months',
        year: '2024'
    },

    // E-COMMERCE: Personalization Engine (Databricks + ML)
    {
        id: 'ecommerce-personalization',
        title: 'Real-time Personalization Engine',
        client: 'Retail Demo',
        category: 'AI Engineering',
        tags: ['Databricks', 'MLflow', 'Redis', 'API'],
        industry: 'E-commerce',
        image: '/portfolio/retail-rec.png', // Placeholder
        description: 'Machine learning API delivering sub-50ms personalized product recommendations based on user behavior.',
        challenge: 'E-commerce retailer needed to increase conversion rates by showing relevant products to users in real-time, replacing static rules-based recommendations.',
        solution: 'Built a recommendation engine using PySpark on Databricks. Models are trained nightly and served via a high-performance API using Redis for feature caching.',
        results: [
            '25% increase in conversion rate',
            'Sub-50ms API response time',
            'A/B testing framework for model evaluation',
            'Scalable to millions of users'
        ],
        technologies: ['Databricks', 'MLflow', 'Python', 'Redis', 'FastAPI'],
        duration: '4 months',
        year: '2025'
    }
];

export const categories = [
    'All Projects',
    'Data Engineering',
    'Architecture',
    'AI Engineering',
    'Custom Applications',
    'Data & Platforms'
];

export const industries = [
    'Finance',
    'Healthcare',
    'Supply Chain',
    'Public Sector',
    'Education',
    'E-commerce'
];
