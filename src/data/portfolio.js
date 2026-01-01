export const portfolioProjects = [
    {
        id: 1,
        title: 'Enterprise Database Modernization',
        client: 'FinanceCore Systems',
        category: 'Database Development',
        tags: ['PostgreSQL', 'Cloud Migration', 'Performance Optimization'],
        image: '/portfolio/database-modernization.jpg',
        description: 'Migrated legacy Oracle database to cloud-native PostgreSQL with zero downtime, achieving 60% performance improvement.',
        challenge: 'A financial services company was running on a 15-year-old Oracle database that was expensive to maintain and couldn\'t scale with modern demands. They needed to migrate to a cloud-native solution without any downtime.',
        solution: 'We designed and executed a phased migration strategy using PostgreSQL with advanced replication. Implemented automated data validation, optimized queries, and built a comprehensive monitoring system.',
        results: [
            '60% improvement in query performance',
            'Zero downtime during migration',
            '70% reduction in database licensing costs',
            'Scalable architecture supporting 10x growth'
        ],
        technologies: ['PostgreSQL', 'AWS RDS', 'Python', 'Apache Kafka', 'Terraform'],
        duration: '4 months',
        year: '2024'
    },
    {
        id: 2,
        title: 'AI-Powered Healthcare Analytics',
        client: 'HealthTech Solutions',
        category: 'AI Engineering',
        tags: ['Machine Learning', 'NLP', 'Real-time Analytics'],
        image: '/portfolio/healthcare-ai.jpg',
        description: 'Built an AI platform that processes patient data to predict health risks and recommend preventive care interventions.',
        challenge: 'Healthcare provider needed to analyze millions of patient records to identify at-risk patients and provide personalized care recommendations while maintaining HIPAA compliance.',
        solution: 'Developed a machine learning pipeline using advanced NLP to extract insights from unstructured medical records. Built real-time prediction models and integrated with existing EMR systems.',
        results: [
            '85% accuracy in risk prediction',
            '40% reduction in hospital readmissions',
            'Processed 2M+ patient records',
            'Full HIPAA compliance achieved'
        ],
        technologies: ['Python', 'TensorFlow', 'BERT', 'FastAPI', 'Azure ML', 'MongoDB'],
        duration: '6 months',
        year: '2024'
    },
    {
        id: 3,
        title: 'Custom Retail CRM Platform',
        client: 'RetailHub Inc',
        category: 'Custom Applications',
        tags: ['Full Stack', 'CRM', 'E-commerce Integration'],
        image: '/portfolio/retail-crm.jpg',
        description: 'Enterprise CRM system with omnichannel customer engagement, inventory management, and advanced analytics.',
        challenge: 'Growing retail chain needed a unified system to manage customer relationships across online and physical stores, with real-time inventory synchronization.',
        solution: 'Built a custom CRM platform with React frontend, Node.js backend, and microservices architecture. Integrated with existing e-commerce, POS, and logistics systems.',
        results: [
            '300% increase in customer retention',
            'Real-time inventory across 50+ stores',
            '25% boost in sales conversion',
            'Reduced customer service response time by 60%'
        ],
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
        duration: '5 months',
        year: '2023'
    },
    {
        id: 4,
        title: 'Cloud Infrastructure Transformation',
        client: 'LogisticsPro',
        category: 'Architecture',
        tags: ['Cloud Native', 'Kubernetes', 'DevOps'],
        image: '/portfolio/cloud-infrastructure.jpg',
        description: 'Complete cloud infrastructure redesign enabling global scale and 99.99% uptime for logistics platform.',
        challenge: 'Logistics company experiencing downtime during peak periods and struggling to scale globally with on-premise infrastructure.',
        solution: 'Architected cloud-native infrastructure using Kubernetes, implemented CI/CD pipelines, and built comprehensive observability platform. Executed seamless migration from on-premise to AWS.',
        results: [
            '99.99% uptime achieved',
            '80% reduction in infrastructure costs',
            'Global deployment in 12 regions',
            'Deployment time reduced from days to minutes'
        ],
        technologies: ['AWS', 'Kubernetes', 'Terraform', 'Prometheus', 'Grafana', 'GitLab CI/CD'],
        duration: '7 months',
        year: '2024'
    },
    {
        id: 5,
        title: 'Educational Mobile App Platform',
        client: 'EduLearn Platform',
        category: 'Mobile Development',
        tags: ['React Native', 'Mobile First', 'Offline Support'],
        image: '/portfolio/education-mobile.jpg',
        description: 'Cross-platform mobile learning app with offline capabilities, gamification, and AI-driven personalized learning paths.',
        challenge: 'Education startup needed a mobile app that works in low-connectivity areas and adapts to individual student learning styles.',
        solution: 'Developed React Native app with robust offline-first architecture, AI-powered content recommendation engine, and engaging gamification features.',
        results: [
            '500K+ active students',
            '4.8 star rating on app stores',
            '90% student engagement rate',
            'Works seamlessly offline in 20+ countries'
        ],
        technologies: ['React Native', 'Python', 'Firebase', 'TensorFlow Lite', 'GraphQL'],
        duration: '4 months',
        year: '2023'
    },
    {
        id: 6,
        title: 'Real-time Data Pipeline Platform',
        client: 'StreamData Corp',
        category: 'Data & Platforms',
        tags: ['Data Engineering', 'Real-time Processing', 'Analytics'],
        image: '/portfolio/data-pipeline.jpg',
        description: 'High-throughput data pipeline processing millions of events per second with real-time analytics and ML inference.',
        challenge: 'IoT company needed to process and analyze sensor data from millions of devices in real-time to detect anomalies and trigger alerts.',
        solution: 'Built scalable data pipeline using Apache Kafka and Spark Streaming, implemented real-time ML inference, and created interactive analytics dashboard.',
        results: [
            '10M+ events processed per second',
            'Sub-100ms latency for critical alerts',
            '99.9% data accuracy maintained',
            'Reduced infrastructure costs by 50%'
        ],
        technologies: ['Apache Kafka', 'Spark', 'Python', 'ClickHouse', 'dbt', 'Airflow'],
        duration: '5 months',
        year: '2024'
    }
];

export const categories = [
    'All Projects',
    'Database Development',
    'AI Engineering',
    'Custom Applications',
    'Architecture',
    'Mobile Development',
    'Data & Platforms'
];
