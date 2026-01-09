import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
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
import SEO from './SEO';

const CapabilitiesPage = () => {
    const technicalCapabilities = [
        {
            icon: Database,
            title: 'Database Development',
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
        <div className="min-h-screen bg-white text-gray-900">
            <SEO
                title="Our Capabilities"
                description="Comprehensive technology capabilities including database development, AI engineering, cloud solutions, Microsoft platform, DevOps, mobile development, enterprise integration, and solutions architecture using TOGAF and AWS Well-Architected frameworks."
                keywords="database development, PostgreSQL, MongoDB, vector databases, graph databases, Neo4j, AI engineering, cloud migration, AWS, Azure, Google Cloud Platform, GCP, Microsoft Dynamics 365, Microsoft Teams development, SharePoint development, DevOps automation, Terraform, Ansible, Kubernetes, mobile development, Salesforce integration, SAP, Oracle, ServiceNow, TOGAF architecture, Zachman framework, AWS Well-Architected, SAFe Agile"
                canonical="/capabilities"
            />
            {/* Hero Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 tracking-tight">
                            Our Capabilities
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            From pre-built solutions to custom enterprise applications, we deliver technology that drives measurable business value.
                        </p>
                    </div>
                </div>
            </section>

            {/* Technical Capabilities */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {technicalCapabilities.map((capability, index) => {
                            const Icon = capability.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
                                >
                                    {/* Infographic Image */}
                                    <div className="relative h-48 bg-gray-100 border-b border-gray-200">
                                        <img
                                            src={capability.infographic}
                                            alt={`${capability.title} infographic`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center mb-4">
                                            {Icon && <Icon className="h-6 w-6 text-white" />}
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            {capability.title}
                                        </h3>
                                        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                            {capability.description}
                                        </p>
                                        <ul className="space-y-2">
                                            {capability.capabilities.map((item, idx) => (
                                                <li key={idx} className="text-gray-700 text-sm flex items-start gap-2">
                                                    <span className="text-blue-600 font-medium">•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Delivery Models */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl mb-16">
                        <h2 className="text-4xl font-bold mb-4 text-gray-900">
                            Flexible Delivery Models
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Choose the engagement approach that best fits your needs and timeline
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {deliveryModels.map((model, index) => {
                            const Icon = model.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-white border border-gray-200 rounded-lg p-8"
                                >
                                    <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center mb-6">
                                        {Icon && <Icon className="h-6 w-6 text-white" />}
                                    </div>
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                                        {model.title}
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {model.description}
                                    </p>
                                    <ul className="space-y-2">
                                        {model.benefits.map((benefit, idx) => (
                                            <li key={idx} className="text-gray-700 text-sm flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
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
            <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                        Ready to get started?
                    </h2>
                    <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
                        Let's discuss which capabilities and delivery model are the best fit for your project.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            asChild
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base"
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
                            className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-6 text-base"
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
