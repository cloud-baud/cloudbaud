import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card';
import { Scale, FileText, FileSignature, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LegalDashboard = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: 'Provisional Patents',
            description: 'Manage IP filings and drafts generated from architecture discussions.',
            icon: FileText,
            href: '/workspace/legal/patents',
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            stats: '3 active drafts'
        },
        {
            title: 'Contracts & NDAs',
            description: 'Review and manage vendor agreements, client contracts, and NDAs.',
            icon: FileSignature,
            href: '/workspace/legal/contracts',
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            stats: '15 documents'
        },
        {
            title: 'Compliance & Audits',
            description: 'Corporate policies, SOC2 compliance, and regulatory audits.',
            icon: AlertCircle,
            href: '/workspace/legal/compliance',
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            stats: '100% compliant'
        }
    ];

    return (
        <div className="p-6 h-full flex flex-col space-y-6 overflow-y-auto">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="p-2 bg-brand-blue/10 rounded-lg">
                    <Scale className="size-6 text-brand-blue" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Legal & IP</h1>
                    <p className="text-sm text-muted-foreground">Manage your company's intellectual property, filings, and contracts.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section, idx) => {
                    const Icon = section.icon;
                    return (
                        <Card 
                            key={idx}
                            className="hover:border-brand-blue/50 cursor-pointer transition-colors"
                            onClick={() => navigate(section.href)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`p-2 rounded-lg ${section.bg}`}>
                                        <Icon className={`size-5 ${section.color}`} />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                                        {section.stats}
                                    </span>
                                </div>
                                <CardTitle className="text-lg">{section.title}</CardTitle>
                                <CardDescription>{section.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default LegalDashboard;
