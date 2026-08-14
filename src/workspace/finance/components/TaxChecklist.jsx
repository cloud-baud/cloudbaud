import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { Progress } from '@/shared/ui/progress';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Badge } from '@/shared/ui/badge';
import { FileText, Briefcase, Calculator, Building, Receipt, Home } from 'lucide-react';

const CHECKLIST_DATA = [
    {
        id: 'income',
        title: '1. Income Verification',
        icon: FileText,
        description: 'The "Paper Trail" for all earnings.',
        items: [
            { id: 'w2_spouse', label: 'W-2 (Bellevue School District)', subtext: 'Spouse salary & withholdings' },
            { id: '1099_nec', label: '1099-NEC / 1099-MISC (Cloud Baud LLC)', subtext: 'Software consulting receipts' },
            { id: '1099_b', label: '1099-B (National Financial Services)', subtext: 'Cost basis for trades ($360k+ proceeds history)' },
            { id: '1099_int_div', label: '1099-INT / 1099-DIV', subtext: 'Interest & dividend income from brokerage' }
        ]
    },
    {
        id: 'business',
        title: '2. Business & Expense Substantiation',
        icon: Briefcase,
        description: 'Records for LLCs (Software & Food Service).',
        items: [
            { id: 'contract_labor', label: 'Contract Labor Records', subtext: '1099-NEC copies for contractors > $600 ($47k+ history)' },
            { id: 'home_office', label: 'Home Office Logs', subtext: 'Utilities & insurance (17% business use calculation)' },
            { id: 'equipment', label: 'Equipment & Software', subtext: 'Section 179 / Bonus Depreciation records' },
            { id: 'vehicle', label: 'Vehicle Logs', subtext: 'Mileage log (2026 rate: 72.5 cents/mile)' }
        ]
    },
    {
        id: 'personal',
        title: '3. Personal Deductions & Adjustments',
        icon: Home,
        description: 'Washington state specific deductions.',
        items: [
            { id: 'mortgage', label: 'Form 1098 (Mortgage Interest)', subtext: 'Primary residence' },
            { id: 'sales_tax', label: 'Real Estate & Sales Tax', subtext: 'Receipts for large purchases (cars, boats)' },
            { id: 'retirement', label: 'Retirement Contributions', subtext: 'SEP-IRA / SIMPLE plan records' },
            { id: 'health', label: 'Health Insurance', subtext: 'Premiums paid through LLCs' }
        ]
    }
];

const TaxChecklist = () => {
    // Load state from localStorage
    const [checkedItems, setCheckedItems] = useState(() => {
        const saved = localStorage.getItem('tax_checklist_2025');
        return saved ? JSON.parse(saved) : {};
    });

    // Persistence
    useEffect(() => {
        localStorage.setItem('tax_checklist_2025', JSON.stringify(checkedItems));
    }, [checkedItems]);

    const toggleItem = (id) => {
        setCheckedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Progress Calculation
    const totalItems = CHECKLIST_DATA.reduce((acc, section) => acc + section.items.length, 0);
    const completedItems = Object.values(checkedItems).filter(Boolean).length;
    const progress = Math.round((completedItems / totalItems) * 100);

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900/50">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold text-lg">Filing Checklist (2025)</h2>
                    <Badge variant={progress === 100 ? "default" : "secondary"}>
                        {progress}% Complete
                    </Badge>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                    {CHECKLIST_DATA.map((section) => (
                        <Card key={section.id} className="border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-brand-blue/10 rounded-md">
                                        <section.icon className="size-4 text-brand-blue" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-medium">{section.title}</CardTitle>
                                        <CardDescription className="text-xs mt-0.5">{section.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                {section.items.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className="flex items-start space-x-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                        onClick={() => toggleItem(item.id)}
                                    >
                                        <Checkbox 
                                            id={item.id} 
                                            checked={checkedItems[item.id] || false}
                                            onCheckedChange={() => toggleItem(item.id)}
                                            className="mt-1"
                                        />
                                        <div className="space-y-1">
                                            <label
                                                htmlFor={item.id}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {item.label}
                                            </label>
                                            <p className="text-xs text-muted-foreground">
                                                {item.subtext}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};

export default TaxChecklist;
