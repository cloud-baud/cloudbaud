import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import PageShell from './PageShell';
import { getChartOfAccounts, createAccount, deleteAccount, getViewAs } from './api/taxService';

export default function Accounting() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('EXPENSE');
  const [viewAs] = useState(getViewAs() || '');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getChartOfAccounts();
      setAccounts(data || []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = filter === 'ALL' ? accounts : accounts.filter(a => a.type === filter);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await createAccount({ name: newName, type: newType, section: newType === 'INCOME' ? 'revenue' : newType === 'EXPENSE' ? 'expense' : null });
      setNewName('');
      load();
    } catch (e) { alert(e.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete account?')) return;
    try {
      await deleteAccount(id);
      load();
    } catch (e) { alert(e.message); }
  };

  const groups = {
    ASSET: filtered.filter(a => a.type === 'ASSET'),
    LIABILITY: filtered.filter(a => a.type === 'LIABILITY'),
    INCOME: filtered.filter(a => a.type === 'INCOME' || a.type === 'REVENUE'),
    EXPENSE: filtered.filter(a => a.type === 'EXPENSE'),
    OTHER: filtered.filter(a => !['ASSET','LIABILITY','INCOME','REVENUE','EXPENSE'].includes(a.type))
  };

  const isViewingAs = !!viewAs;

  return (
    <PageShell
      title="Chart of Accounts"
      subtitle={isViewingAs ? `Viewing as ${viewAs.slice(0,8)}... (org_id lookup) - ${accounts.length} accounts` : `Universal COA - ${accounts.length} accounts - org_id based`}
      actions={
        <div className="flex gap-2 items-center flex-wrap">
          <select value={filter} onChange={e=>setFilter(e.target.value)} className="border rounded-md px-3 py-1.5 text-sm bg-white">
            <option value="ALL">All Types</option>
            <option value="ASSET">Assets</option>
            <option value="LIABILITY">Liabilities</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expenses</option>
          </select>
          <Button onClick={load} variant="outline" size="sm">Refresh</Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Add new */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Add New Account</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. 5010 Office Supplies" className="flex-1 border rounded-md px-3 py-2 text-sm" />
            <select value={newType} onChange={e=>setNewType(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
              <option value="EXPENSE">EXPENSE</option>
              <option value="INCOME">INCOME</option>
              <option value="ASSET">ASSET</option>
              <option value="LIABILITY">LIABILITY</option>
            </select>
            <Button onClick={handleAdd} size="sm" className="gap-1"><Plus className="w-4 h-4"/> Add</Button>
          </CardContent>
        </Card>

        {loading ? <div className="text-sm text-slate-500 p-8">Loading COA from Supabase (org_id: 4a7a11bc-0840-4d2d-a4fd-fc2ec0b0468c)...</div> :
        Object.entries(groups).map(([type, list]) => list.length > 0 && (
          <Card key={type}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">{type} ({list.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-y"><tr className="text-left text-xs text-slate-500"><th className="px-4 py-2">Name / Code</th><th className="px-4 py-2">Type</th><th className="px-4 py-2">Section</th><th className="px-4 py-2">Org</th><th className="px-4 py-2 text-right">Actions</th></tr></thead>
                <tbody>
                {list.map(acc => (
                  <tr key={acc.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium">{acc.name}</td>
                    <td className="px-4 py-2"><span className="text-xs bg-slate-100 border px-2 py-0.5 rounded">{acc.type}</span></td>
                    <td className="px-4 py-2 text-xs text-slate-500">{acc.section || '-'}</td>
                    <td className="px-4 py-2 text-[10px] text-slate-400">{acc.org_id?.slice(0,8)}</td>
                    <td className="px-4 py-2 text-right"><button onClick={()=>handleDelete(acc.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4"/></button></td>
                  </tr>
                ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

