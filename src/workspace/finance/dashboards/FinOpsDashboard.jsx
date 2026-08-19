
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import { Plus, Download, RefreshCw, ArrowUpRight, TrendingUp, TrendingDown, DollarSign, Edit, Trash2 } from 'lucide-react';
import { getChartOfAccounts, populateChartOfAccounts } from '../api/taxService';

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

const FinOpsDashboard = () => {
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            let data = await getChartOfAccounts();

            // Auto-populate if empty
            if (!data || data.length === 0) {
                console.log("No accounts found. Auto-populating defaults...");
                try {
                    await populateChartOfAccounts();
                    // Refetch after population
                    data = await getChartOfAccounts();
                } catch (popError) {
                    console.error("Failed to auto-populate", popError);
                }
            }

            // Sort by Type then Code/Name
            const sorted = (data || []).sort((a, b) => {
                const typeOrder = { 'ASSET': 1, 'LIABILITY': 2, 'EQUITY': 3, 'INCOME': 4, 'REVENUE': 4, 'EXPENSE': 5 };
                const tA = typeOrder[a.type] || 99;
                const tB = typeOrder[b.type] || 99;
                if (tA !== tB) return tA - tB;
                return (a.sort_order || 9999) - (b.sort_order || 9999);
            });
            setAccounts(sorted);
        } catch (error) {
            console.error("Failed to load COA", error);
        } finally {
            setIsLoading(false);
        }
    };

    // removed handlePopulate

    useEffect(() => {
        fetchData();
    }, []);
    
    const navigate = useNavigate();

    // summary stats
    const stats = useMemo(() => {
        return {
            totalAssets: accounts.filter(a => a.type === 'ASSET').length,
            totalRevenue: accounts.filter(a => a.type === 'INCOME' || a.type === 'REVENUE').length,
            totalExpense: accounts.filter(a => a.type === 'EXPENSE').length,
        };
    }, [accounts]);

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Financial Operations</h1>
                <p className="text-slate-500 dark:text-slate-400">Master Chart of Accounts & General Ledger Overview</p>
            </div>

            {/* Quick Stats Rows */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue Streams</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRevenue}</div>
                        <p className="text-xs text-muted-foreground">Active Income Categories</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Asset Accounts</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalAssets}</div>
                        <p className="text-xs text-muted-foreground">Tracked Asset Classes</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expense Controls</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalExpense}</div>
                        <p className="text-xs text-muted-foreground">Cost Categories</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabbed Interface */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="all">All Accounts ({accounts.length})</TabsTrigger>
                    <TabsTrigger value="ASSET">Assets</TabsTrigger>
                    <TabsTrigger value="LIABILITY">Liabilities</TabsTrigger>
                    <TabsTrigger value="EQUITY">Equity</TabsTrigger>
                    <TabsTrigger value="INCOME">Revenue & Income</TabsTrigger>
                    <TabsTrigger value="EXPENSE">Expenses & Costs</TabsTrigger>
                </TabsList>

                {/* Content for each tab */}
                {['all', 'ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'].map(tabValue => {
                    // Filter logic
                    const filteredAccounts = accounts.filter(a => {
                        if (tabValue === 'all') return true;
                        if (tabValue === 'INCOME') return a.type === 'INCOME' || a.type === 'REVENUE';
                        return a.type === tabValue;
                    });

                    return (
                        <TabsContent key={tabValue} value={tabValue}>
                            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>{tabValue === 'all' ? 'Master Chart of Accounts' : `${tabValue} Accounts`}</CardTitle>
                                        <CardDescription>
                                            {filteredAccounts.length} active codes found
                                        </CardDescription>
                                    </div>
                                    <Button size="sm" variant="outline" className="gap-2">
                                        <Plus className="h-4 w-4" /> Add Account
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                                                    <TableHead className="w-[80px]" />
                                                    <TableHead className="w-[100px]">Code</TableHead>
                                                    <TableHead>Account Name</TableHead>
                                                    <TableHead className="w-[120px]">Type</TableHead>
                                                    <TableHead className="w-[150px]">Section</TableHead>
                                                    <TableHead className="text-right">Balance</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {isLoading ? (
                                                     <TableRow>
                                                        <TableCell colSpan={6} className="h-24 text-center">
                                                            <div className="flex items-center justify-center gap-2 text-slate-500">
                                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                                Loading...
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : filteredAccounts.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                            No accounts found in this section.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredAccounts.map((account) => (
                                                        <TableRow key={account.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                                            <TableCell>
                                                                <div className="flex items-center justify-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs text-slate-500 font-bold">
                                                                {account.code || account.sort_order || '---'}
                                                            </TableCell>
                                                            <TableCell 
                                                                className="font-medium text-slate-700 dark:text-slate-200 cursor-pointer hover:text-blue-600 hover:underline"
                                                                onClick={() => navigate(`/workspace/finance/accounting/${account.id}`)}
                                                            >
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
                                                            <TableCell className="text-right font-mono text-slate-600">
                                                                ---
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    );
                })}
            </Tabs>
        </div>
    );
};

export default FinOpsDashboard;

