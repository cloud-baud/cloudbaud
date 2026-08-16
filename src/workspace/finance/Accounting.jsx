import React, { useEffect, useState } from 'react';
import PageShell from './PageShell';
import * as taxService from './api/taxService';

export default function Accounting() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const fn = taxService.getChartOfAccounts || taxService.fetchCOA || taxService.getCOA || taxService.listAccounts || taxService.getAccounts;
      if (!fn) {
        console.log('taxService keys:', Object.keys(taxService));
        throw new Error('getChartOfAccounts not found - keys: ' + Object.keys(taxService).join(', '));
      }
      const data = await fn();
      setAccounts(data || []);
    } catch (e) { console.error(e); setAccounts([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = filter === 'ALL' ? accounts : accounts.filter(a => a.type === filter || (filter === 'INCOME' && (a.type === 'REVENUE' || a.type === 'INCOME')));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold">Chart of Accounts</h1><p className="text-sm text-slate-500">Supabase finance schema - read-only view</p></div>
        <div className="flex gap-2">
          <select value={filter} onChange={e=>setFilter(e.target.value)} className="border rounded px-3 py-1.5 text-sm bg-white"><option value="ALL">All ({accounts.length})</option><option value="ASSET">Assets</option><option value="LIABILITY">Liabilities</option><option value="INCOME">Income</option><option value="EXPENSE">Expenses</option></select>
          <button onClick={load} className="border rounded px-3 py-1.5 text-sm bg-white">Refresh</button>
        </div>
      </div>
      {loading ? <div className="text-sm text-slate-500 p-8">Loading COA...</div> :
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-slate-50 border-b"><tr className="text-left text-xs text-slate-500"><th className="px-4 py-2">Name</th><th className="px-4 py-2">Type</th><th className="px-4 py-2">Section</th></tr></thead>
        <tbody>{filtered.map(acc => (<tr key={acc.id} className="border-b hover:bg-slate-50"><td className="px-4 py-2 font-medium">{acc.name || acc.label}</td><td className="px-4 py-2"><span className="text-xs bg-slate-100 border px-2 py-0.5 rounded">{acc.type}</span></td><td className="px-4 py-2 text-xs text-slate-500">{acc.section || '-'}</td></tr>))}</tbody></table>
        {filtered.length===0 && <div className="p-8 text-center text-slate-500">No accounts. Total: {accounts.length}</div>}
      </div>}
    </div>
  );
}
