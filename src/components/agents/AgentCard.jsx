import React from 'react';
import { Link } from 'react-router-dom';
import { PenTool, Users, TrendingUp, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/shared/ui/button';

const iconMap = {
    PenTool,
    Users,
    TrendingUp
};

const AgentCard = ({ agent, featured = false }) => {
    const Icon = iconMap[agent.icon];

    return (
        <div
            className={`group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500 transition-all duration-300 ${featured ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
        >
            {/* Header */}
            <div className="p-8 relative">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-r from-brand-blue to-brand-aqua rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-8 w-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                    {agent.name}
                </h3>

                {/* Tagline */}
                <p className="text-gray-400 mb-6">
                    {agent.tagline}
                </p>

                {/* Primary Metric */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-6">
                    <div className="text-4xl font-bold bg-gradient-to-r from-brand-blue to-brand-aqua bg-clip-text text-transparent mb-1">
                        {agent.metrics.primary.value}
                    </div>
                    <div className="text-sm text-gray-400">{agent.metrics.primary.label}</div>
                </div>

                {/* Key Features */}
                <div className="space-y-3 mb-6">
                    {agent.features.slice(0, 4).map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                            <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <Button
                    asChild
                    className="w-full bg-gradient-to-r from-brand-blue to-brand-aqua hover:from-brand-blue hover:to-brand-aqua text-white"
                >
                    <Link to={`/agents/${agent.slug}`}>
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-3 border-t border-slate-700">
                {agent.metrics.secondary.slice(0, 3).map((metric, index) => (
                    <div
                        key={index}
                        className={`p-4 text-center ${index < 2 ? 'border-r border-slate-700' : ''
                            }`}
                    >
                        <div className="text-lg font-bold text-blue-400">{metric.value}</div>
                        <div className="text-xs text-gray-400">{metric.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AgentCard;
