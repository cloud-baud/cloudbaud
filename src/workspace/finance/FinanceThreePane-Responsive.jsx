import React, { useEffect, useState, createContext, useContext } from 'react';
import { getChartOfAccounts, getTaxEntries, getMyDocuments, getViewAs, setViewAs } from './api/taxService';

const WorkbenchContext = createContext(null);
const useWorkbench = () => useContext(WorkbenchContext);

function WorksheetPane({ onSelectAndSwitch }) {
  const { year, accounts, entries, selectedCat, setSelectedCat, setSelectedDoc, setSelectedFormLine, setYear } = useWorkbench();
  return (
    <div className="h-full flex flex-col bg-[#0f172a] text-white text-xs">
      <div className="bg-[#1e293b] p-2.5 font-bold flex justify-between items-center shrink-0">
        <span>Worksheet</span>
        <select value={year} onChange={e=>setYear(Number(e.target.value))} className="bg-slate-800 border border-white/10 rounded px-2 py-1 text-[11px]">
          {[2025,2024,2023,2022,2021,2020,2019,2018,2017].map(y=><option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-[#1e293b]/80 sticky top-0"><tr><th className="text-left p-2">Label</th><th className="text-right p-2">{year}</th></tr></thead>
          <tbody>
            {accounts.map(acc => {
              const entry = entries.find(e => e.category_id === acc.id);
              const isSelected = selectedCat?.id === acc.id;
              return (
                <tr key={acc.id} 
                  onClick={()=>{ setSelectedCat(acc); setSelectedDoc(null); setSelectedFormLine(acc.name); onSelectAndSwitch?.('docs'); }} 
                  className={`cursor-pointer border-b border-white/5 active:bg-white/20 ${isSelected ? 'bg-blue-600/30' : 'hover:bg-white/10'}`}>
                  <td className="p-3 md:p-2">{acc.name}</td>
                  <td className="p-3 md:p-2 text-right">{entry?.amount ? `$${Number(entry.amount).toLocaleString()}` : '-'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DocsPane({ onSelectAndSwitch }) {
  const { year, docs, selectedCat, selectedDoc, setSelectedDoc, setSelectedCat } = useWorkbench();
  const filtered = selectedCat ? docs.filter(d => !d.category_id || d.category_id === selectedCat.id) : docs;
  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] text-white text-xs md:border-x border-white/10">
      <div className="bg-[#1e293b] p-2.5 font-bold flex justify-between shrink-0">
        <span>Supporting Docs</span>
        <span className="text-[10px] opacity-70">{filtered.length}/{docs.length}</span>
      </div>
      {selectedCat && (
        <div className="bg-blue-600/20 border-b border-blue-500/30 p-2 flex justify-between items-center">
          <span className="text-[11px] truncate">Filtered: {selectedCat.name}</span>
          <button onClick={()=>setSelectedCat(null)} className="text-[10px] underline ml-2">Clear</button>
        </div>
      )}
      <div className="flex-1 overflow-auto p-2 space-y-2">
        {filtered.map(doc => (
          <div key={doc.id} onClick={()=>{ setSelectedDoc(doc); onSelectAndSwitch?.('form'); }}
            className={`border rounded p-3 cursor-pointer ${selectedDoc?.id === doc.id ? 'bg-white/15 ring-1' : 'bg-white/5 border-white/10'}`}>
            <div className="font-medium truncate text-sm md:text-xs">{doc.file_name || doc.name || 'Document'}</div>
            <div className="text-[11px] md:text-[10px] opacity-60 mt-1">{doc.type || 'pdf'} • {new Date(doc.created_at).toLocaleDateString()}</div>
          </div>
        ))}
        <button className="w-full border border-dashed border-white/20 rounded p-3 opacity-60 text-sm">+ Upload</button>
      </div>
    </div>
  );
}

function WIPFormPane() {
  const { selectedCat, selectedFormLine, setSelectedFormLine, setSelectedCat, accounts } = useWorkbench();
  const formLines = [
    { line: 'W2 Wages', amount: 69549.66, cat: 'W2 Wages' },
    { line: 'Biz Income - Comfort Foods', amount: -44581.92, cat: 'Comfort Foods' },
    { line: 'CloudBaud LLC', amount: 365772.34, cat: 'CloudBaud LLC' },
    { line: 'Estimated Refund', amount: 4000, cat: null, total: true },
  ];
  return (
    <div className="h-full flex flex-col bg-white text-black text-xs">
      <div className="bg-slate-100 p-2.5 font-bold border-b shrink-0">WIP Federal 1040 (Draft)</div>
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {selectedCat && <div className="bg-blue-50 border border-blue-200 rounded p-2 text-[11px]">📌 {selectedCat.name}</div>}
        <div className="border rounded divide-y">
          {formLines.map((fl,i)=>{
            const hl = selectedCat && fl.cat && selectedCat.name.includes(fl.cat.split(' ')[0]);
            return <div key={i} onClick={()=>{ setSelectedFormLine(fl.cat); const m=accounts.find(a=>a.name.includes(fl.cat)); if(m) setSelectedCat(m); }}
              className={`p-3 flex justify-between cursor-pointer ${hl ? 'bg-yellow-100' : ''} ${fl.total ? 'font-bold bg-slate-50' : ''}`}>
              <span className="text-sm md:text-xs">{fl.line}</span><span className="text-sm md:text-xs">${fl.amount.toLocaleString()}</span>
            </div>
          })}
        </div>
        <div className="border rounded h-48 md:h-64 flex items-center justify-center bg-slate-50 text-center text-[11px] p-4">PDF Preview</div>
        <textarea placeholder="Comment for David..." className="w-full border rounded p-2 h-20 text-sm" />
        <button className="w-full bg-blue-600 text-white rounded p-3 text-sm">Send to David</button>
      </div>
    </div>
  );
}

export default function FinanceThreePaneResponsive() {
  const [year, setYear] = useState(2020);
  const [accounts, setAccounts] = useState([]);
  const [entries, setEntries] = useState([]);
  const [docs, setDocs] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedFormLine, setSelectedFormLine] = useState(null);
  const [activeTab, setActiveTab] = useState('worksheet'); // mobile
  
  useEffect(() => {
    (async () => {
      setAccounts(await getChartOfAccounts());
      setEntries(await getTaxEntries(year));
      setDocs(await getMyDocuments(year));
    })();
  }, [year]);
  
  const ctx = { year, setYear, accounts, entries, docs, selectedCat, setSelectedCat, selectedDoc, setSelectedDoc, selectedFormLine, setSelectedFormLine };
  
  const switchTab = (tab) => setActiveTab(tab);
  
  return (
    <WorkbenchContext.Provider value={ctx}>
      <div className="h-[100dvh] flex flex-col bg-[#020617]">
        {/* Header */}
        <div className="bg-[#0f172a] border-b border-white/10 px-3 py-2 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Finance</span>
            <span className="hidden md:inline text-[10px] px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded">Connected</span>
            {selectedCat && <span className="text-[10px] bg-blue-500/30 px-2 py-0.5 rounded truncate max-w-[120px]">🔗 {selectedCat.name}</span>}
          </div>
          <div className="flex gap-2">
            <select value={getViewAs()||''} onChange={e=>{ setViewAs(e.target.value); location.reload() }} className="bg-slate-800 border border-white/10 rounded px-2 py-1 text-[11px]">
              <option value="">Me</option>
              <option value="b7d03f67-d8df-47cb-8b69-70863c5009fb">David</option>
            </select>
          </div>
        </div>

        {/* MOBILE TABS */}
        <div className="md:hidden flex border-b border-white/10 bg-[#0f172a] text-white text-[13px] shrink-0">
          {[
            {id:'worksheet', label:'Worksheet', count: accounts.length},
            {id:'docs', label:'Docs', count: docs.length},
            {id:'form', label:'1040 Draft', count: null},
          ].map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`flex-1 py-3 relative ${activeTab===t.id ? 'font-bold border-b-2 border-blue-400' : 'opacity-60'}`}>
              {t.label} {t.count !== null && <span className="text-[10px] ml-1 opacity-70">({t.count})</span>}
              {selectedCat && t.id==='docs' && <span className="absolute top-1 right-2 w-2 h-2 bg-blue-400 rounded-full" />}
            </button>
          ))}
        </div>

        {/* DESKTOP: 3 columns */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          <div className="flex-[1.2] min-w-[280px]"><WorksheetPane /></div>
          <div className="flex-[0.8] min-w-[240px]"><DocsPane /></div>
          <div className="flex-[1] min-w-[320px]"><WIPFormPane /></div>
        </div>

        {/* MOBILE: tab content */}
        <div className="md:hidden flex-1 overflow-hidden">
          {activeTab==='worksheet' && <WorksheetPane onSelectAndSwitch={switchTab} />}
          {activeTab==='docs' && <DocsPane onSelectAndSwitch={switchTab} />}
          {activeTab==='form' && <WIPFormPane />}
        </div>

        {/* Mobile bottom hint */}
        <div className="md:hidden bg-[#0f172a] border-t border-white/10 p-2 text-[10px] text-white/50 text-center shrink-0">
          {activeTab==='worksheet' && 'Tap row → filters Docs + 1040'}
          {activeTab==='docs' && 'Tap doc → jumps to 1040 line'}
          {activeTab==='form' && 'Tap line → filters Worksheet'}
        </div>
      </div>
    </WorkbenchContext.Provider>
  );
}

