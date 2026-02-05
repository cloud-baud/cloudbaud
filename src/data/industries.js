export const industries = [
    {
        id: 'healthcare',
        name: 'Healthcare & Life Sciences',
        slug: 'healthcare',
        icon: 'Heart',
        description: 'Transform patient care with AI-powered solutions and modern data platforms',
        challenges: [
            'Fragmented patient data across systems',
            'Regulatory compliance (HIPAA, GDPR)',
            'Inefficient administrative workflows',
            'Legacy EHR system limitations'
        ],
        solutions: [
            {
                title: 'Patient Data Integration',
                description: 'Unified patient views across disparate systems with FHIR-compliant APIs'
            },
            {
                title: 'AI-Powered Diagnostics',
                description: 'Machine learning models for predictive diagnostics and treatment recommendations'
            },
            {
                title: 'Telehealth Platforms',
                description: 'HIPAA-compliant mobile and web applications for remote patient monitoring'
            }
        ],
        technologies: ['Azure Health Data Services', 'HL7 FHIR', 'SQL Server', 'React Native'],
        caseStudy: {
            client: 'Regional Health Network',
            challenge: 'Disconnected patient data across 15 facilities',
            solution: 'Built unified data platform with AI-powered patient insights',
            results: ['40% reduction in duplicate tests', '30% faster diagnoses', '95% physician adoption']
        }
    },
    {
        id: 'financial-services',
        name: 'Financial Services',
        slug: 'financial-services',
        icon: 'TrendingUp',
        description: 'Modernize banking and fintech with secure, scalable platforms',
        challenges: [
            'Legacy core banking systems',
            'Real-time fraud detection',
            'Regulatory reporting complexity',
            'Customer experience expectations'
        ],
        solutions: [
            {
                title: 'Core Banking Modernization',
                description: 'Migrate legacy systems to cloud-native microservices architecture'
            },
            {
                title: 'AI Fraud Detection',
                description: 'Real-time transaction monitoring with machine learning anomaly detection'
            },
            {
                title: 'Mobile Banking Apps',
                description: 'Native iOS and Android apps with biometric authentication'
            }
        ],
        technologies: ['AWS Financial Services', 'PostgreSQL', 'Kafka', 'Swift', 'Kotlin'],
        caseStudy: {
            client: 'Community Bank',
            challenge: 'Outdated core banking system hindering growth',
            solution: 'Migrated to cloud-native platform with modern APIs',
            results: ['60% faster transaction processing', '10x API throughput', '50% cost reduction']
        }
    },
    {
        id: 'retail-ecommerce',
        name: 'Retail & E-commerce',
        slug: 'retail',
        icon: 'ShoppingCart',
        description: 'Build omnichannel experiences and optimize operations with AI',
        challenges: [
            'Inventory management across channels',
            'Personalization at scale',
            'Supply chain visibility',
            'Customer data fragmentation'
        ],
        solutions: [
            {
                title: 'Unified Commerce Platform',
                description: 'Single platform for online, mobile, and in-store experiences'
            },
            {
                title: 'AI Recommendations',
                description: 'Personalized product recommendations using collaborative filtering'
            },
            {
                title: 'Inventory Optimization',
                description: 'ML-powered demand forecasting and stock optimization'
            }
        ],
        technologies: ['Shopify Plus', 'Dynamics 365 Commerce', 'MongoDB', 'React', 'TensorFlow'],
        caseStudy: {
            client: 'Fashion Retailer',
            challenge: 'Disconnected online and in-store inventory',
            solution: 'Built unified commerce platform with real-time inventory sync',
            results: ['25% increase in sales', '90% inventory accuracy', '35% reduction in stockouts']
        }
    },
    {
        id: 'manufacturing',
        name: 'Manufacturing & Industrial',
        slug: 'manufacturing',
        icon: 'Factory',
        description: 'Drive Industry 4.0 with IoT, AI, and advanced analytics',
        challenges: [
            'Equipment downtime and maintenance',
            'Supply chain disruptions',
            'Quality control inefficiencies',
            'Legacy MES/ERP systems'
        ],
        solutions: [
            {
                title: 'Predictive Maintenance',
                description: 'IoT sensor data analysis for equipment failure prediction'
            },
            {
                title: 'Digital Twin',
                description: 'Virtual factory simulations for process optimization'
            },
            {
                title: 'MES/ERP Integration',
                description: 'Modern APIs connecting shop floor to enterprise systems'
            }
        ],
        technologies: ['Azure IoT', 'SAP S/4HANA', 'Time Series Databases', 'Power BI'],
        caseStudy: {
            client: 'Auto Parts Manufacturer',
            challenge: 'Unexpected equipment failures causing costly downtime',
            solution: 'Deployed IoT sensors with ML-powered predictive maintenance',
            results: ['45% reduction in downtime', '30% lower maintenance costs', '$2M annual savings']
        }
    },
    {
        id: 'education',
        name: 'Education & EdTech',
        slug: 'education',
        icon: 'GraduationCap',
        description: 'Enhance learning outcomes with personalized, data-driven platforms',
        challenges: [
            'Personalized learning at scale',
            'Student engagement and retention',
            'Administrative burden',
            'Accessibility requirements'
        ],
        solutions: [
            {
                title: 'Adaptive Learning Platform',
                description: 'AI-powered personalized learning paths based on student performance'
            },
            {
                title: 'Student Information System',
                description: 'Modern SIS with mobile apps for students, parents, and faculty'
            },
            {
                title: 'Learning Analytics',
                description: 'Dashboards tracking student progress and intervention opportunities'
            }
        ],
        technologies: ['Canvas LMS', 'MongoDB', 'React', 'Python', 'D3.js'],
        caseStudy: {
            client: 'Online University',
            challenge: 'Low student engagement and completion rates',
            solution: 'Built adaptive learning platform with AI-powered recommendations',
            results: ['40% increase in completion rates', '60% higher engagement', '4.8/5 student satisfaction']
        }
    },
    {
        id: 'technology',
        name: 'Technology & SaaS',
        slug: 'technology',
        icon: 'Cpu',
        description: 'Scale your SaaS platform with modern architecture and AI features',
        challenges: [
            'Scaling to millions of users',
            'Multi-tenancy complexity',
            'Feature velocity vs. stability',
            'Technical debt accumulation'
        ],
        solutions: [
            {
                title: 'Microservices Migration',
                description: 'Break monolith into scalable, independently deployable services'
            },
            {
                title: 'AI Feature Integration',
                description: 'Add intelligent features using LLMs and machine learning'
            },
            {
                title: 'Multi-Tenant Architecture',
                description: 'Secure, scalable data isolation for enterprise customers'
            }
        ],
        technologies: ['Kubernetes', 'PostgreSQL', 'Redis', 'GraphQL', 'OpenAI API'],
        caseStudy: {
            client: 'B2B SaaS Platform',
            challenge: 'Monolithic architecture limiting growth and deployment speed',
            solution: 'Refactored to microservices with CI/CD automation',
            results: ['10x deployment frequency', '99.99% uptime', '5x faster feature delivery']
        }
    },
    {
        id: 'public-sector',
        name: 'Public Sector & Government',
        slug: 'public-sector',
        icon: 'Landmark',
        description: 'Secure, compliant modernization for Federal (IRS, DOJ, US Army) and State agencies.',
        challenges: [
            'Legacy Mainframe Modernization',
            'Strict Compliance (FedRAMP/FISMA)',
            'Citizen Trust & Experience',
            'Siloed Inter-Agency Data'
        ],
        solutions: [
            {
                title: 'GovCloud Migration',
                description: 'Secure workloads on Azure Government & AWS GovCloud (IL4/IL5)'
            },
            {
                title: 'Citizen Service Portals',
                description: 'Accessible, mobile-friendly digital services for taxpayers and veterans'
            },
            {
                title: 'Fraud Detection AI',
                description: 'Advanced analytics to prevent tax and benefits fraud'
            }
        ],
        technologies: ['Azure Government (GCC High)', 'Salesforce Public Sector', 'Power Platform', 'Snowflake Gov'],
        caseStudy: {
            client: 'State Revenue Agency',
            challenge: 'Manual processing of tax returns creating 6-month backlog',
            solution: 'Implemented automated document processing pipeline with AI',
            results: ['90% reduction in backlog', '24h turnaround time', '$50M recovered revenue']
        }
    }
];

export const industryStats = {
    clientsServed: '50+',
    industriesCovered: '6+',
    avgROI: '250%',
    projectSuccessRate: '98%'
};
