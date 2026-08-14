export const careers = {
    benefits: [
        {
            title: 'Competitive Compensation',
            description: 'Market-leading salaries with equity options and performance bonuses',
            icon: 'DollarSign'
        },
        {
            title: 'Remote First',
            description: 'Work from anywhere with flexible hours and async collaboration',
            icon: 'Home'
        },
        {
            title: 'Health & Wellness',
            description: 'Comprehensive health, dental, vision insurance plus wellness stipend',
            icon: 'Heart'
        },
        {
            title: 'Learning Budget',
            description: '$3,000 annual budget for courses, conferences, and certifications',
            icon: 'BookOpen'
        },
        {
            title: 'Latest Technology',
            description: 'Work with cutting-edge tools, frameworks, and platforms',
            icon: 'Cpu'
        },
        {
            title: 'Unlimited PTO',
            description: 'Take the time you need to recharge and maintain work-life balance',
            icon: 'Calendar'
        }
    ],

    openPositions: [
        {
            id: 1,
            title: 'Senior AI/ML Engineer',
            department: 'Engineering',
            location: 'Remote',
            type: 'Full-time',
            description: 'Build production-grade AI systems for enterprise clients using modern ML frameworks and MLOps practices.',
            responsibilities: [
                'Design and implement ML models for real-world business problems',
                'Build scalable ML infrastructure and deployment pipelines',
                'Collaborate with clients to understand requirements and deliver solutions',
                'Mentor junior engineers and contribute to technical architecture'
            ],
            requirements: [
                '5+ years of experience in ML/AI engineering',
                'Strong Python skills with TensorFlow, PyTorch, or similar',
                'Experience with MLOps tools (MLflow, Kubeflow, etc.)',
                'Track record of deploying ML models to production',
                'Excellent communication and client-facing skills'
            ],
            niceToHave: [
                'Experience with LLMs and prompt engineering',
                'Cloud certifications (AWS, Azure, GCP)',
                'Contributions to open-source ML projects',
                'Healthcare or finance domain experience'
            ]
        },
        {
            id: 2,
            title: 'Database Architect',
            department: 'Engineering',
            location: 'Remote',
            type: 'Full-time',
            description: 'Lead database modernization projects, designing scalable solutions for enterprise clients.',
            responsibilities: [
                'Architect database solutions for complex enterprise systems',
                'Lead database migration and modernization projects',
                'Performance tuning and optimization of large-scale databases',
                'Provide technical leadership and mentorship'
            ],
            requirements: [
                '7+ years of database engineering experience',
                'Expert-level knowledge of PostgreSQL, MySQL, or SQL Server',
                'Experience with cloud database services (RDS, Cloud SQL, etc.)',
                'Strong understanding of database internals and optimization',
                'Proven track record of successful large-scale migrations'
            ],
            niceToHave: [
                'NoSQL database experience (MongoDB, Cassandra)',
                'Experience with data warehousing (Snowflake, BigQuery)',
                'Database certification (Oracle, Microsoft, PostgreSQL)',
                'Knowledge of database security and compliance'
            ]
        },
        {
            id: 3,
            title: 'Full Stack Engineer',
            department: 'Engineering',
            location: 'Remote',
            type: 'Full-time',
            description: 'Build modern web applications using React, Node.js, and cloud technologies for diverse clients.',
            responsibilities: [
                'Develop full-stack applications from concept to deployment',
                'Write clean, maintainable, and well-tested code',
                'Collaborate with designers and product managers',
                'Participate in code reviews and technical discussions'
            ],
            requirements: [
                '4+ years of full-stack development experience',
                'Strong proficiency in React and Node.js',
                'Experience with SQL and NoSQL databases',
                'Understanding of RESTful APIs and microservices',
                'DevOps knowledge (Docker, CI/CD)'
            ],
            niceToHave: [
                'TypeScript expertise',
                'Experience with Next.js or similar frameworks',
                'Cloud platform experience (AWS, Azure, GCP)',
                'UI/UX design skills'
            ]
        },
        {
            id: 4,
            title: 'DevOps Engineer',
            department: 'Engineering',
            location: 'Remote',
            type: 'Full-time',
            description: 'Build and maintain cloud infrastructure, CI/CD pipelines, and observability systems for client projects.',
            responsibilities: [
                'Design and implement cloud infrastructure using IaC',
                'Build and maintain CI/CD pipelines',
                'Implement monitoring, logging, and alerting solutions',
                'Optimize cloud costs and performance'
            ],
            requirements: [
                '4+ years of DevOps/infrastructure experience',
                'Strong knowledge of AWS, Azure, or GCP',
                'Experience with Kubernetes and Docker',
                'Proficiency in Terraform or similar IaC tools',
                'Scripting skills (Python, Bash, Go)'
            ],
            niceToHave: [
                'Kubernetes certifications (CKA, CKAD)',
                'Experience with service mesh (Istio, Linkerd)',
                'Security and compliance expertise',
                'FinOps knowledge for cloud cost optimization'
            ]
        },
        {
            id: 5,
            title: 'Data Engineer',
            department: 'Engineering',
            location: 'Remote',
            type: 'Full-time',
            description: 'Build robust data pipelines and analytics platforms that process millions of events daily.',
            responsibilities: [
                'Design and implement scalable data pipelines',
                'Build ETL/ELT processes for diverse data sources',
                'Optimize data warehouse performance',
                'Collaborate with data scientists and analysts'
            ],
            requirements: [
                '4+ years of data engineering experience',
                'Strong SQL and Python skills',
                'Experience with Spark, Kafka, or Airflow',
                'Knowledge of data warehousing concepts',
                'Understanding of data modeling and optimization'
            ],
            niceToHave: [
                'Experience with dbt or similar transformation tools',
                'Real-time streaming expertise',
                'Data governance and quality frameworks',
                'Cloud data platform experience (Snowflake, BigQuery)'
            ]
        }
    ],

    culture: {
        title: 'Our Culture',
        description: 'We believe in building a culture of excellence, innovation, and continuous learning. Our team is passionate about solving complex technical challenges while maintaining a healthy work-life balance.',
        values: [
            'Technical Excellence',
            'Client Success',
            'Continuous Learning',
            'Collaborative Spirit',
            'Work-Life Balance',
            'Innovation Mindset'
        ]
    },

    hiringProcess: [
        {
            step: 1,
            title: 'Application Review',
            description: 'We review all applications within 5 business days',
            duration: '3-5 days'
        },
        {
            step: 2,
            title: 'Initial Screen',
            description: '30-minute conversation with our recruiting team',
            duration: '30 mins'
        },
        {
            step: 3,
            title: 'Technical Interview',
            description: 'Deep dive into your technical skills and experience',
            duration: '60 mins'
        },
        {
            step: 4,
            title: 'System Design',
            description: 'Collaborate on architecting a real-world system',
            duration: '90 mins'
        },
        {
            step: 5,
            title: 'Team Fit',
            description: 'Meet the team and discuss culture and collaboration',
            duration: '45 mins'
        },
        {
            step: 6,
            title: 'Offer',
            description: 'Receive and review your offer package',
            duration: '1-2 days'
        }
    ]
};
