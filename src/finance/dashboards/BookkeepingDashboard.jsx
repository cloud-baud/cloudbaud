
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/table';
import { Badge } from '@/shared/components/badge';
import { Plus, Search, Filter } from 'lucide-react';

// Mock Data for Transactions
const MOCK_TRANSACTIONS = [
    { id: 'TXN-001', date: '2024-02-08', description: 'AWS Service Billing', category: 'Cloud Infrastructure', amount: -2450.00, status: 'posted' },
    { id: 'TXN-002', date: '2024-02-07', description: 'Client Retainer - TechCorp', category: 'Services Revenue', amount: 8500.00, status: 'posted' },
    { id: 'TXN-003', date: '2024-02-05', description: 'Office Supplies', category: 'General & Admin', amount: -125.50, status: 'posted' },
    { id: 'TXN-004', date: '2024-02-04', description: 'GitHub Enterprise', category: 'Software Subscriptions', amount: -450.00, status: 'pending' },
    { id: 'TXN-005', date: '2024-02-01', description: 'Consulting Project - Alpha', category: 'Services Revenue', amount: 12000.00, status: 'posted' },
];

const BookkeepingDashboard = () => {
    const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">Bookkeeping</h1>
                <p className="text-muted-foreground">Manage daily transactions, journal entries, and reconciliation.</p>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search transactions..." 
                            className="h-9 w-64 rounded-md border border-border bg-background px-9 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>
                    <Button variant="outline" size="sm" className="h-9 gap-1">
                        <Filter className="h-3.5 w-3.5" />
                        Filter
                    </Button>
                </div>
                <Button className="h-9 bg-brand-blue hover:bg-brand-blue/90 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    New Entry
                </Button>
            </div>

            {/* Transactions Table */}
            <Card className="border-border shadow-sm">
                <CardHeader>
                    <CardTitle>Journal Entries</CardTitle>
                    <CardDescription>Recent financial activity for {new Date().getFullYear()}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-[120px]">Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="w-[100px]">Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                    {transactions.map((txn) => (
                                    <TableRow key={txn.id} className="group hover:bg-muted/50">
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {txn.date}
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">
                                            {txn.description}
                                            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{txn.id}</div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            <Badge variant="secondary" className="font-normal">
                                                {txn.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant="outline" 
                                                className={txn.status === 'posted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}
                                            >
                                                {txn.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={`text-right font-mono font-medium ${txn.amount > 0 ? 'text-emerald-600' : 'text-foreground'}`}>
                                            {txn.amount > 0 ? '+' : ''}{txn.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BookkeepingDashboard;
