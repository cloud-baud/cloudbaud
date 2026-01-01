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
    Container,
    Brain
} from 'lucide-react';

const TechnologyStack = () => {
    const technologies = {
        'Databases': {
            icon: Database,
            items: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Snowflake', 'DynamoDB']
        },
        'Cloud Platforms': {
            icon: Cloud,
            items: ['AWS', 'Azure', 'Google Cloud', 'Heroku', 'DigitalOcean']
        },
        'AI & ML': {
            icon: Brain,
            items: ['TensorFlow', 'PyTorch', 'OpenAI', 'Hugging Face', 'scikit-learn']
        },
        'Backend': {
            icon: Server,
            items: ['Node.js', 'Python', 'Go', 'Java', '.NET', 'Ruby']
        },
        'Frontend': {
            icon: Code2,
            items: ['React', 'Next.js', 'Vue', 'Angular', 'Tailwind CSS']
        },
        'DevOps': {
            icon: GitBranch,
            items: ['Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'Jenkins']
        },
        'Data Platforms': {
            icon: Layers,
            items: ['Apache Kafka', 'Spark', 'Airflow', 'dbt', 'Flink']
        },
        'Architecture': {
            icon: Workflow,
            items: ['Microservices', 'Event-Driven', 'Serverless', 'API Gateway']
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    Our Technology{' '}
                    <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Stack
                    </span>
                </h2>
                <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                    We work with industry-leading technologies and frameworks to deliver
                    cutting-edge solutions tailored to your needs.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(technologies).map(([category, { icon: Icon, items }]) => (
                    <div
                        key={category}
                        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-blue-500 transition-all duration-300"
                    >
                        {/* Icon & Title */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <Icon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">{category}</h3>
                        </div>

                        {/* Technologies List */}
                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 text-gray-400 text-sm"
                                >
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div className="text-center pt-8">
                <p className="text-gray-400 text-lg">
                    Don't see your technology?{' '}
                    <a href="/contact" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                        Let's discuss your stack →
                    </a>
                </p>
            </div>
        </div>
    );
};

export default TechnologyStack;
