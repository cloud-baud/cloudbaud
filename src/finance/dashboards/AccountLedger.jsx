import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/table';
import { Button } from '@/shared/components/button';
import { ArrowLeft, Download, Filter, Calendar, PlusCircle, AlertCircle, CheckCircle2, FileText, Upload } from 'lucide-react';
import { Badge } from '@/shared/components/badge';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/dialog';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/select';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/shared/components/tabs'; // Added this import as it was missing but used
import { Progress } from '@/shared/components/progress';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/shared/components/resizable";
import DocumentPreviewPanel from '@/finance/components/DocumentPreviewPanel';

const MOCK_TRANSACTIONS = [
    { id: 1, date: '2025-01-15', description: 'Consulting Retainer - Jan', reference: 'DEP-001', debit: 12500.00, credit: 0, balance: 12500.00 },
    { id: 2, date: '2025-02-15', description: 'Consulting Retainer - Feb', reference: 'DEP-002', debit: 12500.00, credit: 0, balance: 25000.00 },
    { id: 3, date: '2025-03-15', description: 'Consulting Retainer - Mar', reference: 'DEP-003', debit: 12500.00, credit: 0, balance: 37500.00 },
    // Imagine entries for the rest of the year...
    { id: 11, date: '2025-11-15', description: 'Consulting Retainer - Nov', reference: 'DEP-011', debit: 12500.00, credit: 0, balance: 137500.00 },
    // Missing December!
];

const AccountLedger = () => {
    const { accountId } = useParams();
    const navigate = useNavigate();
    const [account, setAccount] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentYear, setCurrentYear] = useState('2025');
    const [isAddTxOpen, setIsAddTxOpen] = useState(false);
    const [reconciliationTarget] = useState(150000.00); // Mocking a 1099 Total of $150k
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = React.useRef(null);

    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const years = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];

    // ... useEffect ...
    useEffect(() => {
        // Simulate fetching account details
        setTimeout(() => {
            setAccount({
                id: accountId,
                name: 'Business Checking',
                type: 'Asset',
                balance: 150000.00,
                currency: 'USD',
            });
            setIsLoading(false);
        }, 500);
    }, [accountId]);

    const getTransactionsForYear = (year) => {
        // In a real app, this would fetch data based on the year
        // For now, filter mock data
        return MOCK_TRANSACTIONS.filter(tx => tx.date.startsWith(year));
    };

    // Calculate totals for the current view
    const currentTxns = getTransactionsForYear(currentYear);
    const totalDebits = currentTxns.reduce((sum, t) => sum + t.debit, 0);
    const difference = totalDebits - reconciliationTarget;
    const progress = Math.min((totalDebits / reconciliationTarget) * 100, 100);
    
    const discrepancyText = difference === 0 
        ? "MATCHED" 
        : `DISCREPANCY: ${difference < 0 ? '-' : '+'}$${Math.abs(difference).toFixed(2)}`;

    return (
        <div className="h-[calc(100vh-64px)] w-full bg-background animate-in fade-in duration-500">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={60} minSize={30} className="bg-background">
                    <div className="h-full overflow-y-auto p-8 space-y-6">
             {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            General Ledger
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Transaction history and details
                        </p>
                    </div>
                </div>
            </div>

            {/* Reconciliation Widget (Fiscal Year Context) */}
            {currentYear === '2025' && (
                <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/20">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                                <FileText className="h-4 w-4" /> 2025 Tax Reconciliation (1099 Match)
                            </CardTitle>
                            <Badge variant={difference === 0 ? "default" : "destructive"} className="font-mono">
                                {discrepancyText}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-slate-500 uppercase">My Ledger (Actual)</span>
                                <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                                    ${totalDebits.toFixed(2)}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {currentTxns.length} transactions recorded
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium text-slate-600">
                                    <span>Progress to Target</span>
                                    <span>{progress.toFixed(1)}%</span>
                                </div>
                                <Progress value={progress} className="h-2 w-full bg-slate-200" indicatorClassName={difference === 0 ? 'bg-emerald-500' : 'bg-blue-500'} />
                                <div className="text-center text-xs text-slate-500">
                                    Target Source: <strong>1099-NEC (Client A)</strong>
                                </div>
                            </div>

                            <div className="space-y-1 text-right">
                                <span className="text-xs font-semibold text-slate-500 uppercase">1099 Total (Target)</span>
                                <div className="text-2xl font-mono font-bold text-blue-700 dark:text-blue-300">
                                    ${reconciliationTarget.toFixed(2)}
                                </div>
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs text-blue-600">
                                    Update Target Amount
                                </Button>
                            </div>
                        </div>
                        
                        {difference !== 0 && (
                            <div className="mt-4 flex items-start gap-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100 dark:bg-red-900/20 dark:border-red-900/50">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <div>
                                    <strong>Action Required:</strong> You are short by <strong>${Math.abs(difference).toFixed(2)}</strong> compared to the 1099. 
                                    Did you miss a deposit? Check your December bank statement.
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Account Info Card ... */}
            {isLoading ? (
                <Card className="w-full animate-pulse">
                    <CardHeader>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {account.name}
                        </CardTitle>
                        <Badge variant="outline">{account.type}</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: account.currency }).format(account.balance)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Current Balance
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Transactions Area with Year Tabs */}
            <Tabs defaultValue="2025" className="w-full" onValueChange={setCurrentYear}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <TabsList>
                        {years.map(year => (
                            <TabsTrigger key={year} value={year}>{year}</TabsTrigger>
                        ))}
                    </TabsList>
                    
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Calendar className="h-4 w-4" /> Range
                        </Button>
                        
                         {/* Import Button (Opens Transaction Dialog) */}
                        <Dialog open={isAddTxOpen} onOpenChange={setIsAddTxOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 bg-brand-blue hover:bg-blue-700 text-white">
                                    <Download className="h-4 w-4" /> Import
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Record / Import Transaction</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Date</Label>
                                            <Input id="date" type="date" defaultValue="2025-12-31" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ref">Reference #</Label>
                                            <Input id="ref" placeholder="e.g. 1099-NEC" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="desc">Payee / Description</Label>
                                        <Input id="desc" placeholder="Client Name or Summary Description" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="amount">Amount</Label>
                                            <Input id="amount" type="number" placeholder="0.00" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="type">Type</Label>
                                            <Select defaultValue="debit">
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="debit">Increase (Debit)</SelectItem>
                                                    <SelectItem value="credit">Decrease (Credit)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    
                                    {/* Evidence Upload Section */}
                                    <div className="space-y-2">
                                        <Label htmlFor="evidence">Evidence / Attachment</Label>
                                        <div 
                                            className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                                accept=".pdf,.png,.jpg,.jpeg,.csv"
                                            />
                                            {selectedFile ? (
                                                <div className="flex items-center justify-center gap-2 text-sm text-blue-600 font-medium">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    {selectedFile.name}
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-sm text-slate-500">
                                                        Click to upload statement (PDF, PNG)
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        Recommended for Annual Summaries
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select defaultValue="cleared">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="cleared">Cleared (Bank/Stmt)</SelectItem>
                                                <SelectItem value="reconciled">Reconciled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button variant="outline" onClick={() => setIsAddTxOpen(false)}>Cancel</Button>
                                    <Button onClick={() => setIsAddTxOpen(false)}>Save Transaction</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* ... existing tabs content ... */}

                {years.map(year => (
                    <TabsContent key={year} value={year} className="mt-0">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">{year} Transactions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[120px]">Date</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Reference</TableHead>
                                            <TableHead className="text-right">Debit</TableHead>
                                            <TableHead className="text-right">Credit</TableHead>
                                            <TableHead className="text-right">Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {getTransactionsForYear(year).length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                    No transactions recorded in {year}.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            getTransactionsForYear(year).map((tx) => (
                                                <TableRow key={tx.id}>
                                                    <TableCell className="font-mono text-xs">{tx.date}</TableCell>
                                                    <TableCell>{tx.description}</TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">{tx.reference}</TableCell>
                                                    <TableCell className="text-right font-mono text-xs">
                                                        {tx.debit > 0 ? tx.debit.toFixed(2) : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono text-xs">
                                                        {tx.credit > 0 ? tx.credit.toFixed(2) : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono text-xs font-bold">
                                                        {tx.balance.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
                    </div>
                </ResizablePanel>
                
                <ResizableHandle />
                
                <ResizablePanel defaultSize={40} minSize={20} className="bg-slate-50 dark:bg-slate-900 border-l">
                    <DocumentPreviewPanel 
                        url={previewUrl}
                        onExtract={() => console.log('Extracting...')}
                        onUpload={() => setIsAddTxOpen(true)} // Open the Import Dialog instead of direct file trigger for now
                        onClose={() => setPreviewUrl(null)}
                        className="h-full border-0"
                    />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};

export default AccountLedger;
