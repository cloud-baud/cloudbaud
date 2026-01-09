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
        description: 'PostgreSQL, MongoDB, SQL Server, Oracle, and cloud-native databases',
        infographic: '/infographic-database.png',
        capabilities: [
            'Database design & architecture',
            'Performance optimization',
            'Migration & modernization',
            'Data modeling'
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
            'Terraform for IaC',
            'Ansible automation',
            'CI/CD pipelines',
            'Kubernetes orchestration'
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
