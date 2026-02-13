import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { RefreshCw, ChevronRight } from 'lucide-react';
import { getChartOfAccounts } from '../../services/taxService';

// Helper for type colors
const getTypeColor = (type) => {
    switch (type) {
        case 'ASSET': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        case 'LIABILITY': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'EQUITY': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'INCOME': 
        case 'REVENUE': return 'bg-green-100 text-green-800 border-green-200';
        case 'EXPENSE': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-slate-100 text-slate-800';
    }
};

const MOCK_COA = [
    // 1000-1999: ASSETS
    { id: '1010', sort_order: 1010, name: 'Cash - Operating Account', type: 'ASSET', section: 'Current Assets' },
    { id: '1020', sort_order: 1020, name: 'Cash - Payroll Account', type: 'ASSET', section: 'Current Assets' },
    { id: '1030', sort_order: 1030, name: 'Cash - Savings/Reserve', type: 'ASSET', section: 'Current Assets' },
    { id: '1100', sort_order: 1100, name: 'Accounts Receivable (A/R)', type: 'ASSET', section: 'Current Assets' },
    { id: '1150', sort_order: 1150, name: 'Unbilled Receivables (WIP)', type: 'ASSET', section: 'Current Assets' },
    { id: '1200', sort_order: 1200, name: 'Prepaid Expenses', type: 'ASSET', section: 'Current Assets' },
    { id: '1300', sort_order: 1300, name: 'Employee Advances', type: 'ASSET', section: 'Current Assets' },
    { id: '1510', sort_order: 1510, name: 'Computer Equipment', type: 'ASSET', section: 'Fixed Assets' },
    { id: '1520', sort_order: 1520, name: 'Accumulated Depreciation - Computer Equipment', type: 'ASSET', section: 'Fixed Assets' },
    { id: '1530', sort_order: 1530, name: 'Office Furniture & Fixtures', type: 'ASSET', section: 'Fixed Assets' },
    { id: '1540', sort_order: 1540, name: 'Accumulated Depreciation - Furniture', type: 'ASSET', section: 'Fixed Assets' },
    { id: '1600', sort_order: 1600, name: 'Internal Software Dev (Capitalized)', type: 'ASSET', section: 'Fixed Assets' },

    // 2000-2999: LIABILITIES
    { id: '2010', sort_order: 2010, name: 'Accounts Payable (A/P)', type: 'LIABILITY', section: 'Current Liabilities' },
    { id: '2020', sort_order: 2020, name: 'Corporate Credit Cards Payable', type: 'LIABILITY', section: 'Current Liabilities' },
    { id: '2100', sort_order: 2100, name: 'Accrued Expenses', type: 'LIABILITY', section: 'Current Liabilities' },
    { id: '2200', sort_order: 2200, name: 'Deferred Revenue', type: 'LIABILITY', section: 'Current Liabilities' },
    { id: '2300', sort_order: 2300, name: 'Sales Tax Payable', type: 'LIABILITY', section: 'Current Liabilities' },
    { id: '2400', sort_order: 2400, name: 'Payroll Liabilities', type: 'LIABILITY', section: 'Current Liabilities' },
    { id: '2710', sort_order: 2710, name: 'Business Loans / Lines of Credit', type: 'LIABILITY', section: 'Long-Term Liabilities' },
    { id: '2720', sort_order: 2720, name: 'Notes Payable', type: 'LIABILITY', section: 'Long-Term Liabilities' },

    // 3000-3999: EQUITY
    { id: '3010', sort_order: 3010, name: "Owner's Capital", type: 'EQUITY', section: 'Equity' },
    { id: '3020', sort_order: 3020, name: "Owner's Draw / Distributions", type: 'EQUITY', section: 'Equity' },
    { id: '3030', sort_order: 3030, name: 'Retained Earnings', type: 'EQUITY', section: 'Equity' },

    // 4000-4999: REVENUE
    { id: '4110', sort_order: 4110, name: 'Cloud Consulting Fees (T&M)', type: 'REVENUE', section: 'Pro Services' },
    { id: '4120', sort_order: 4120, name: 'Fixed-Price Project Revenue', type: 'REVENUE', section: 'Pro Services' },
    { id: '4130', sort_order: 4130, name: 'Implementation & Migration Services', type: 'REVENUE', section: 'Pro Services' },
    { id: '4140', sort_order: 4140, name: 'AI Engineering Services', type: 'REVENUE', section: 'Pro Services' },
    { id: '4210', sort_order: 4210, name: 'MRR - Support Contracts', type: 'REVENUE', section: 'Managed Services' },
    { id: '4220', sort_order: 4220, name: 'DevOps Management Fees', type: 'REVENUE', section: 'Managed Services' },
    { id: '4310', sort_order: 4310, name: 'Software/License Resale', type: 'REVENUE', section: 'Resale & Other' },
    { id: '4900', sort_order: 4900, name: 'Reimbursable Expense Income', type: 'REVENUE', section: 'Resale & Other' },

    // 5000-5999: COGS
    { id: '5110', sort_order: 5110, name: 'Consultant Salaries (Billable)', type: 'EXPENSE', section: 'COGS - Labor' },
    { id: '5120', sort_order: 5120, name: 'Subcontractors / 1099 Contractors', type: 'EXPENSE', section: 'COGS - Labor' },
    { id: '5130', sort_order: 5130, name: 'Billable Travel Expenses', type: 'EXPENSE', section: 'COGS - Labor' },
    { id: '5210', sort_order: 5210, name: 'Client Cloud Usage (Rebilled)', type: 'EXPENSE', section: 'COGS - Software' },
    { id: '5220', sort_order: 5220, name: 'Project-Specific Software Licenses', type: 'EXPENSE', section: 'COGS - Software' },
    { id: '5230', sort_order: 5230, name: 'Third-Party Tooling', type: 'EXPENSE', section: 'COGS - Software' },

    // 6000-6999: OPERATING EXPENSES
    { id: '6110', sort_order: 6110, name: 'Advertising & Promotion', type: 'EXPENSE', section: 'Sales & Marketing' },
    { id: '6120', sort_order: 6120, name: 'Sales Commissions', type: 'EXPENSE', section: 'Sales & Marketing' },
    { id: '6130', sort_order: 6130, name: 'CRM & Sales Software', type: 'EXPENSE', section: 'Sales & Marketing' },
    { id: '6140', sort_order: 6140, name: 'Website & Hosting', type: 'EXPENSE', section: 'Sales & Marketing' },
    { id: '6210', sort_order: 6210, name: 'Internal Training & Certs', type: 'EXPENSE', section: 'R&D' },
    { id: '6220', sort_order: 6220, name: 'R&D Salaries (Non-billable)', type: 'EXPENSE', section: 'R&D' },
    { id: '6230', sort_order: 6230, name: 'Lab/Testing Cloud Infrastructure', type: 'EXPENSE', section: 'R&D' },
    { id: '6310', sort_order: 6310, name: 'Executive Salaries', type: 'EXPENSE', section: 'G&A' },
    { id: '6320', sort_order: 6320, name: 'Administrative Salaries', type: 'EXPENSE', section: 'G&A' },
    { id: '6330', sort_order: 6330, name: 'Rent & Utilities', type: 'EXPENSE', section: 'G&A' },
    { id: '6340', sort_order: 6340, name: 'Legal & Professional Fees', type: 'EXPENSE', section: 'G&A' },
    { id: '6350', sort_order: 6350, name: 'Accounting & Tax Services', type: 'EXPENSE', section: 'G&A' },
    { id: '6360', sort_order: 6360, name: 'Insurance', type: 'EXPENSE', section: 'G&A' },
    { id: '6370', sort_order: 6370, name: 'Bank Fees & Interest', type: 'EXPENSE', section: 'G&A' },
    { id: '6380', sort_order: 6380, name: 'Office Supplies & Software', type: 'EXPENSE', section: 'G&A' },

    // 8000-8999: OTHER
    { id: '8010', sort_order: 8010, name: 'Interest Income', type: 'REVENUE', section: 'Other Income' },
    { id: '8020', sort_order: 8020, name: 'Other Income', type: 'REVENUE', section: 'Other Income' },
    { id: '8100', sort_order: 8100, name: 'Income Tax Expense', type: 'EXPENSE', section: 'Other Expense' },
];

const AccountingDashboard = () => {
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await getChartOfAccounts();
                let sorted = (data || []).sort((a, b) => {
                    const typeOrder = { 'ASSET': 1, 'LIABILITY': 2, 'EQUITY': 3, 'INCOME': 4, 'REVENUE': 4, 'EXPENSE': 5 };
                    const tA = typeOrder[a.type] || 99;
                    const tB = typeOrder[b.type] || 99;
                    if (tA !== tB) return tA - tB;
                    return (a.sort_order || 9999) - (b.sort_order || 9999);
                });
                
                if (!sorted || sorted.length === 0) {
                    setAccounts(MOCK_COA);
                } else {
                    setAccounts(sorted);
                }
            } catch (error) {
                console.error("Failed to load COA, using mock data", error);
                setAccounts(MOCK_COA);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filterAccounts = (type) => {
        if (type === 'ALL') return accounts;
        if (type === 'REVENUE') return accounts.filter(a => a.type === 'REVENUE' || a.type === 'INCOME');
        return accounts.filter(a => a.type === type);
    };

    const currentCount = filterAccounts(activeTab).length;

    const AccountTable = ({ data }) => (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[100px]">Code</TableHead>
                        <TableHead>Account Name</TableHead>
                        <TableHead className="w-[150px]">Type</TableHead>
                        <TableHead className="w-[150px]">Section</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    Loading Ledger...
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                No accounts found in this category.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((account) => (
                            <TableRow key={account.id} className="group hover:bg-muted/50 transition-colors">
                                <TableCell className="font-mono text-xs text-slate-500">
                                    {account.sort_order || '---'}
                                </TableCell>
                                <TableCell className="font-medium text-foreground">
                                    {account.name}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={getTypeColor(account.type)}>
                                        {account.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm capitalization">
                                    {account.section || 'General'}
                                </TableCell>
                                <TableCell className="text-right font-mono text-muted-foreground">
                                    ---
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );

    const AccountsTabContent = ({ data }) => {
        // Get unique sections
        const sections = Array.from(new Set(data.map(account => account.section || 'General'))).sort();
        
        // If only one section (or no sections), just show the table
        if (sections.length <= 1) {
            return (
                <div className="p-6">
                    <AccountTable data={data} />
                </div>
            );
        }

        return (
            <Tabs defaultValue="ALL_SECTIONS" className="w-full">
                <div className="px-6 py-2 border-b border-border bg-muted/30">
                    <TabsList className="bg-muted h-8 p-0.5 inline-flex w-auto justify-start">
                        <TabsTrigger value="ALL_SECTIONS" className="text-xs h-7 px-3 data-[state=active]:bg-background shadow-sm">All</TabsTrigger>
                        {sections.map(section => (
                            <TabsTrigger key={section} value={section} className="text-xs h-7 px-3 whitespace-nowrap data-[state=active]:bg-background shadow-sm">{section}</TabsTrigger>
                        ))}
                    </TabsList>
                </div>
                
                <div className="p-6">
                    <TabsContent value="ALL_SECTIONS" className="mt-0">
                        <AccountTable data={data} />
                    </TabsContent>
                    
                    {sections.map(section => (
                        <TabsContent key={section} value={section} className="mt-0">
                            <AccountTable data={data.filter(a => (a.section || 'General') === section)} />
                        </TabsContent>
                    ))}
                </div>
            </Tabs>
        );
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-4 animate-in fade-in duration-500">
            {/* Breadcrumb Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Finance</span>
                    <ChevronRight className="h-4 w-4" />
                    <span>Accounting</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="font-semibold text-foreground">Chart of Accounts</span>
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                    <span className="font-medium text-foreground">{currentCount}</span> Accounts
                </div>
            </div>

            <Tabs defaultValue="ALL" className="w-full" onValueChange={setActiveTab}>
                <Card className="border-border shadow-sm overflow-hidden min-h-[500px]">
                    <div className="px-6 pt-4 pb-2">
                        <TabsList>
                            <TabsTrigger value="ALL">All Accounts</TabsTrigger>
                            <TabsTrigger value="ASSET">Assets</TabsTrigger>
                            <TabsTrigger value="LIABILITY">Liabilities</TabsTrigger>
                            <TabsTrigger value="EQUITY">Equity</TabsTrigger>
                            <TabsTrigger value="REVENUE">Revenue</TabsTrigger>
                            <TabsTrigger value="EXPENSE">Expenses</TabsTrigger>
                        </TabsList>
                    </div>
                    <CardContent className="p-0">
                        <TabsContent value="ALL" className="mt-0 p-6">
                            <AccountTable data={filterAccounts('ALL')} />
                        </TabsContent>
                        <TabsContent value="ASSET" className="mt-0">
                            <AccountsTabContent data={filterAccounts('ASSET')} />
                        </TabsContent>
                        <TabsContent value="LIABILITY" className="mt-0">
                            <AccountsTabContent data={filterAccounts('LIABILITY')} />
                        </TabsContent>
                        <TabsContent value="EQUITY" className="mt-0">
                            <AccountsTabContent data={filterAccounts('EQUITY')} />
                        </TabsContent>
                        <TabsContent value="REVENUE" className="mt-0">
                            <AccountsTabContent data={filterAccounts('REVENUE')} />
                        </TabsContent>
                        <TabsContent value="EXPENSE" className="mt-0">
                            <AccountsTabContent data={filterAccounts('EXPENSE')} />
                        </TabsContent>
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    );
};

export default AccountingDashboard;
