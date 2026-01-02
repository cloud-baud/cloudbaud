import React from 'react';
import {
    Database,
    Cloud,
    Cpu,
    Code2,
    Server,
    Layers,
    Workflow,
    GitBranch,
} from 'lucide-react';

const TechnologyStack = () => {
    const technologies = {
        'Databases': {
            icon: Database,
            items: ['PostgreSQL', 'MongoDB', 'Redis', 'Snowflake', 'DynamoDB', 'Neo4j']
        },
        'Cloud Platforms': {
            icon: Cloud,
            items: ['AWS', 'Azure', 'Google Cloud (GCP)', 'DigitalOcean']
        },
        'AI & Engineering': {
            icon: Cpu,
            items: ['OpenAI', 'LangChain', 'Vector DBs', 'Graph Databases', 'Azure OpenAI']
        },
        'Enterprise Stack': {
            icon: Server,
            items: ['Microsoft Dynamics 365', 'Salesforce', 'SAP', 'ServiceNow', 'SharePoint']
        },
        'Modern Backend': {
            icon: Code2,
            items: ['Node.js', 'Python', 'Go', '.NET Core', 'Spring Boot']
        },
        'Infastructure': {
            icon: GitBranch,
            items: ['Terraform', 'Kubernetes', 'Docker', 'Ansible', 'GitHub Actions']
        },
        'Data Engineering': {
            icon: Layers,
            items: ['Apache Kafka', 'Spark', 'Airflow', 'dbt', 'Datadog']
        },
        'Architecture': {
            icon: Workflow,
            items: ['TOGAF', 'Zachman', 'AWS Well-Architected', 'SAFe Agile']
        }
    };

    return (
        <div className="space-y-12">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                    Our Specialized <span className="text-blue-500">Technology Stack</span>
                </h2>
                <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
                <p className="text-slate-400 text-xl max-w-3xl mx-auto">
                    We leverage best-in-class technologies and frameworks to architect
                    high-performance, intelligent systems for the modern enterprise.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {Object.entries(technologies).map(([category, { icon: Icon, items }]) => (
                    <div
                        key={category}
                        className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl hover:bg-slate-900/60 hover:border-blue-500/30 transition-all duration-300"
                    >
                        {/* Icon & Title */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                <Icon className="h-6 w-6 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">{category}</h3>
                        </div>

                        {/* Technologies List */}
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 text-slate-400 text-sm font-medium"
                                >
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div className="text-center pt-12">
                <p className="text-gray-500 text-lg">
                    Have a specific technology in mind?{' '}
                    <a href="/contact" className="text-blue-500 hover:text-blue-400 transition-colors font-bold underline decoration-blue-900 underline-offset-4">
                        Consult with our architects →
                    </a>
                </p>
            </div>
        </div>
    );
};

export default TechnologyStack;
