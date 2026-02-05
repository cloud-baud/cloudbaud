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
        'Core Platform': {
            icon: Database,
            items: ['Azure Databricks', 'Delta Lake', 'Unity Catalog', 'Apache Spark', 'PySpark', 'SQL']
        },
        'Cloud Ecosystem': {
            icon: Cloud,
            items: ['Azure Data Lake (ADLS)', 'Azure Active Directory', 'Azure DevOps', 'Cloud Networking']
        },
        'DevOps & Automation': {
            icon: GitBranch,
            items: ['Terraform (IaC)', 'CI/CD Pipelines', 'Shell Scripting', 'GitHub Actions', 'Monitoring & Alerting']
        },
        'Governance & Security': {
            icon: Layers,
            items: ['Data Lineage', 'Access Control (ACLs)', 'Compliance Policy', 'Cost Mgmt', 'Audit Logging']
        },
        'Legacy & Integration': {
            icon: Server,
            items: ['MS SQL Server', 'Palantir Foundry', 'Healthcare Data Feeds', 'HL7/FHIR Integration']
        },
        'Engineering Tools': {
            icon: Code2,
            items: ['Python', 'VS Code', 'Databricks CLI', 'REST APIs', 'Jupyter Notebooks']
        },
        'Architecture': {
            icon: Workflow,
            items: ['Distributed Systems', 'Lakehouse Architecture', 'Medallion Architecture', 'Scalable Design']
        },
        'Monitoring': {
            icon: Cpu,
            items: ['Platform KPIs', 'Usage Analytics', 'Cost Analysis', 'Performance Tuning']
        }
    };

    return (
        <div className="space-y-12">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                    Core <span className="text-blue-500">Platform Competencies</span>
                </h2>
                <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
                <p className="text-slate-400 text-xl max-w-3xl mx-auto">
                    Mastery of the modern data stack, specializing in Azure Databricks operational excellence,
                    governance, and scalability for mission-critical healthcare environments.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {Object.entries(technologies).map(([category, { icon: Icon, items }]) => (
                    <div
                        key={category}
                        className="bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:border-blue-500/30 transition-all duration-300 shadow-sm dark:shadow-none bg-gradient-to-br from-transparent to-blue-500/5"
                    >
                        {/* Icon & Title */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center ring-1 ring-blue-500/20">
                                <Icon className="h-6 w-6 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">{category}</h3>
                        </div>

                        {/* Technologies List */}
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm font-medium"
                                >
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
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
                    Ready to scale your data platform?{' '}
                    <a href="/contact" className="text-blue-500 hover:text-blue-400 transition-colors font-bold underline decoration-blue-900 underline-offset-4">
                        Let's discuss architecture →
                    </a>
                </p>
            </div>
        </div>
    );
};

export default TechnologyStack;
