import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    PenTool,
    Users,
    TrendingUp,
    Database,
    Cloud,
    Cpu,
    Code,
    Smartphone,
    Target,
    Zap,
    Shield
} from 'lucide-react';
import { Button } from './ui/button';

const CapabilitiesPage = () => {
    const aiAgents = [
        {
            icon: PenTool,
            name: 'Copywriter Agent',
            description: 'AI-powered content creation with stunning infographics',
            metric: '10x faster',
            slug: 'copywriter'
        },
        {
            icon: Users,
            name: 'CRM Agent',
            description: 'Intelligent customer engagement, 24/7',
            metric: '95% satisfaction',
            slug: 'crm'
        },
        {
            icon: TrendingUp,
            name: 'Sales Agent',
            description: 'Qualify leads and accelerate your pipeline',
            metric: '3x more leads',
            slug: 'sales'
        }
    ];

    const technicalCapabilities = [
        {
            icon: Database,
            title: 'Database Development',
            description: 'PostgreSQL, MongoDB, SQL Server, Oracle, and cloud-native databases',
            capabilities: [
                'Database design & architecture',
                'Performance optimization',
                'Migration & modernization',
                'Data modeling'
            ]
        },
        {
            icon: Cpu,
            title: 'AI Engineering',
            description: 'LLM integration, machine learning, and intelligent systems',
            capabilities: [
                'Custom AI model development',
                'LLM integration & fine-tuning',
                'ML pipeline development',
                'AI strategy consulting'
            ]
        },
        {
            icon: Code,
            title: 'Custom Applications',
            description: 'Full-stack web and enterprise application development',
            capabilities: [
                'Modern web applications',
                'Microservices architecture',
                'API development',
                'Legacy modernization'
            ]
        },
        {
            icon: Cloud,
            title: 'Cloud Solutions',
            description: 'AWS, Azure, and Google Cloud Platform expertise',
            capabilities: [
                'Cloud migration',
                'Infrastructure as Code',
                'Serverless architecture',
                'Multi-cloud strategy'
            ]
        },
        {
            icon: Smartphone,
            title: 'Mobile Development',
            description: 'Native iOS, Android, and cross-platform solutions',
            capabilities: [
                'iOS (Swift) development',
                'Android (Kotlin) development',
                'React Native & Flutter',
                'Mobile CI/CD'
            ]
        },
        {
            icon: Target,
            title: 'Enterprise Integration',
            description: 'Dynamics 365, ServiceNow, and custom integrations',
            capabilities: [
                'Dynamics 365 implementation',
                'ServiceNow customization',
                'API integration',
                'Workflow automation'
            ]
        }
    ];

    const deliveryModels = [
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

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Hero Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Our{' '}
                        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Capabilities
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        From pre-built AI agents to custom enterprise solutions, we deliver technology that drives business value.
                    </p>
                </div>
            </section>

            {/* AI Agents Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block mb-6 px-4 py-2 rounded-full bg-purple-600/20 border border-purple-500 text-purple-300 text-sm font-semibold">
                            Ready-to-Deploy Solutions
                        </div>
                        <h2 className="text-4xl font-bold mb-4">
                            AI Agents
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Pre-built, enterprise-ready agents that integrate with your existing tools
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {aiAgents.map((agent, index) => {
                            const Icon = agent.icon;
                            return (
                                <Link
                                    key={index}
                                    to={`/agents/${agent.slug}`}
                                    className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-blue-500 transition-all duration-300"
                                >
                                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <Icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                                        {agent.name}
                                    </h3>
                                    <p className="text-gray-400 mb-4">{agent.description}</p>
                                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                        {agent.metric}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Technical Capabilities */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">
                            Technical{' '}
                            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                Expertise
                            </span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Deep expertise across databases, AI, cloud platforms, and modern application development
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {technicalCapabilities.map((capability, index) => {
                            const Icon = capability.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-blue-500 transition-all duration-300"
                                >
                                    <div className="w-14 h-14 bg-blue-600/20 rounded-xl flex items-center justify-center mb-6">
                                        <Icon className="h-7 w-7 text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">
                                        {capability.title}
                                    </h3>
                                    <p className="text-gray-400 mb-6 text-sm">
                                        {capability.description}
                                    </p>
                                    <ul className="space-y-2">
                                        {capability.capabilities.map((item, idx) => (
                                            <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                                                <span className="text-blue-400 mt-1">→</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Delivery Models */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">
                            Flexible{' '}
                            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                Delivery Models
                            </span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Choose the engagement model that best fits your needs and timeline
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {deliveryModels.map((model, index) => {
                            const Icon = model.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8"
                                >
                                    <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                                        <Icon className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">
                                        {model.title}
                                    </h3>
                                    <p className="text-gray-400 mb-6">
                                        {model.description}
                                    </p>
                                    <ul className="space-y-2">
                                        {model.benefits.map((benefit, idx) => (
                                            <li key={idx} className="text-gray-300 text-sm flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                                <span>{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to{' '}
                        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            get started
                        </span>
                        ?
                    </h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                        Let's discuss which capabilities and delivery model are the best fit for your project.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            asChild
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full"
                        >
                            <Link to="/contact">
                                Schedule Consultation
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 rounded-full"
                        >
                            <Link to="/portfolio">View Portfolio</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CapabilitiesPage;
