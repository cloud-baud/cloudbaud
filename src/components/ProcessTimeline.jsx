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
        <div className="space-y-12">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 font-serif">
                    Our <span className="text-blue-600">Methodology</span>
                </h2>
                <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
                <p className="text-gray-600 text-xl max-w-3xl mx-auto">
                    A proven, engineering-first approach that delivers results through
                    collaboration, transparency, and technical excellence.
                </p>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical Line - Desktop */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 transform -translate-x-1/2" />

                {/* Steps */}
                <div className="space-y-20">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`relative grid md:grid-cols-2 gap-12 items-center ${index % 2 === 0 ? '' : 'md:grid-flow-dense'
                                }`}
                        >
                            {/* Content */}
                            <div className={`${index % 2 === 0 ? 'md:text-right' : 'md:col-start-2'}`}>
                                <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-2xl hover:border-blue-100 transition-all duration-300 shadow-sm">
                                    <div className={`flex items-center gap-4 mb-6 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                            <step.icon className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-blue-600 text-xs font-bold uppercase tracking-widest">Phase 0{step.id}</div>
                                            <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-lg mb-6">{step.description}</p>

                                    <ul className={`space-y-3 ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                                        {step.details.map((detail, detailIndex) => (
                                            <li
                                                key={detailIndex}
                                                className="text-gray-500 text-sm font-medium flex items-center gap-3"
                                                style={{ flexDirection: index % 2 === 0 ? 'row-reverse' : 'row' }}
                                            >
                                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Timeline Node - Desktop */}
                            <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white border-2 border-gray-100 rounded-full items-center justify-center z-10 shadow-lg">
                                <div className="w-4 h-4 bg-blue-600 rounded-full shadow-lg shadow-blue-200" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Timeline Indicator */}
            <div className="md:hidden absolute left-8 top-0 bottom-0 w-px bg-gray-200" />
        </div>
    );
};

export default ProcessTimeline;
