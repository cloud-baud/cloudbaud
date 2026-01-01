import React from 'react';
import { Search, Code, Rocket, Settings, HeadphonesIcon } from 'lucide-react';

const ProcessTimeline = () => {
    const steps = [
        {
            id: 1,
            icon: Search,
            title: 'Discovery',
            description: 'Understanding your business goals, technical requirements, and project constraints',
            details: [
                'Stakeholder interviews',
                'Technical assessment',
                'Requirements gathering',
                'Feasibility analysis'
            ]
        },
        {
            id: 2,
            icon: Code,
            title: 'Design',
            description: 'Architecting the solution with scalability, security, and maintainability in mind',
            details: [
                'System architecture',
                'Database design',
                'API specifications',
                'Security planning'
            ]
        },
        {
            id: 3,
            icon: Rocket,
            title: 'Development',
            description: 'Building your solution using agile methodologies with continuous feedback',
            details: [
                'Sprint planning',
                'Code development',
                'Automated testing',
                'Regular demos'
            ]
        },
        {
            id: 4,
            icon: Settings,
            title: 'Deployment',
            description: 'Launching your solution with comprehensive testing and smooth migration',
            details: [
                'Production setup',
                'Data migration',
                'Performance testing',
                'Go-live support'
            ]
        },
        {
            id: 5,
            icon: HeadphonesIcon,
            title: 'Support',
            description: 'Ongoing maintenance, monitoring, and optimization to ensure continued success',
            details: [
                '24/7 monitoring',
                'Performance optimization',
                'Feature enhancements',
                'Technical support'
            ]
        }
    ];

    return (
        <div className="space-y-8">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    Our{' '}
                    <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Process
                    </span>
                </h2>
                <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                    A proven methodology that delivers results through collaboration,
                    transparency, and technical excellence.
                </p>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical Line - Desktop */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-purple-600 to-blue-600 transform -translate-x-1/2" />

                {/* Steps */}
                <div className="space-y-12">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`relative grid md:grid-cols-2 gap-8 items-center ${index % 2 === 0 ? '' : 'md:grid-flow-dense'
                                }`}
                        >
                            {/* Content */}
                            <div className={`${index % 2 === 0 ? 'md:text-right' : 'md:col-start-2'}`}>
                                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-blue-500 transition-all duration-300">
                                    <div className={`flex items-center gap-3 mb-4 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                            <step.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-blue-400 text-sm font-medium">Step {step.id}</div>
                                            <h3 className="text-xl font-bold text-white">{step.title}</h3>
                                        </div>
                                    </div>

                                    <p className="text-gray-400 mb-4">{step.description}</p>

                                    <ul className={`space-y-2 ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                                        {step.details.map((detail, detailIndex) => (
                                            <li
                                                key={detailIndex}
                                                className="text-gray-300 text-sm flex items-center gap-2"
                                                style={{ flexDirection: index % 2 === 0 ? 'row-reverse' : 'row' }}
                                            >
                                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Timeline Node - Desktop */}
                            <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-slate-900 border-4 border-blue-600 rounded-full items-center justify-center z-10">
                                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Timeline Indicator */}
            <div className="md:hidden absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-purple-600 to-blue-600" />
        </div>
    );
};

export default ProcessTimeline;
