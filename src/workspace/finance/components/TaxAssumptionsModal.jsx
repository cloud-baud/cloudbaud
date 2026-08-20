import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Globe,
  Car,
  Home,
  ShieldCheck,
  ExternalLink,
  History,
  Lock
} from 'lucide-react';
import {
  DEFAULT_TAX_ASSUMPTIONS,
  loadTaxAssumptions,
  saveTaxAssumptions
} from '../data/taxAssumptions';
import { useViewAs } from '../ViewAsContext';

export default function TaxAssumptionsModal({ isOpen, onClose, activeYear = 2022, onAssumptionsSaved }) {
  const [matrix, setMatrix] = useState(() => loadTaxAssumptions());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const { activePersona } = useViewAs();

  useEffect(() => {
    if (isOpen) {
      setMatrix(loadTaxAssumptions());
      setHasUnsavedChanges(false);
      setSaveSuccessMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const years = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];

  const handleCellChange = (year, field, value) => {
    const num = parseFloat(value);
    setMatrix(prev => {
      const yearData = { ...(prev[year] || DEFAULT_TAX_ASSUMPTIONS[year]) };
      yearData[field] = isNaN(num) ? value : num;

      // Auto-recalculate INR to CAD when CAD/USD or INR/USD change
      if (field === 'cadToUsd' || field === 'inrToUsd') {
        const cad = field === 'cadToUsd' ? num : yearData.cadToUsd;
        const inr = field === 'inrToUsd' ? num : yearData.inrToUsd;
        if (cad > 0 && inr > 0) {
          yearData.inrToCad = parseFloat((inr / cad).toFixed(6));
        }
      }

      return {
        ...prev,
        [year]: yearData
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    saveTaxAssumptions(matrix);
    setHasUnsavedChanges(false);
    setSaveSuccessMessage('Assumptions updated and synchronized across all tax views');
    onAssumptionsSaved?.(matrix);
    setTimeout(() => {
      setSaveSuccessMessage('');
    }, 4000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all assumption rates to official Bank of Canada and IRS benchmarks?')) {
      setMatrix({ ...DEFAULT_TAX_ASSUMPTIONS });
      setHasUnsavedChanges(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-[#0b101d] border border-white/15 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-white/10 bg-[#0f172a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Globe className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Tax Assumptions & Macroeconomic Parameters Matrix
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  2017–2025 (9 Years)
                </span>
              </div>
              <p className="text-xs text-white/50">
                Bank of Canada FX, IRS Treasury Rates, Standard Mileage, and Form 8829 Home Office allocations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Success Alert */}
        {saveSuccessMessage && (
          <div className="bg-emerald-600/90 text-white text-xs font-semibold px-4 py-2 flex items-center gap-2 border-b border-emerald-400/30 animate-in slide-in-from-top-1">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* Matrix Table */}
        <div className="flex-1 overflow-auto p-4 bg-[#070b14]">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/15 bg-[#0e1628] text-white/70 uppercase text-[10px] tracking-wider sticky top-0 z-10 font-semibold font-mono">
                <th className="p-2.5 px-3">Tax Year</th>
                <th className="p-2.5 px-3">
                  <div className="flex items-center gap-1.5 text-blue-300">
                    <span>🇨🇦 CAD → USD</span>
                    <span className="text-[9px] text-white/40 normal-case">(Bank of CA)</span>
                  </div>
                </th>
                <th className="p-2.5 px-3">
                  <div className="flex items-center gap-1.5 text-orange-300">
                    <span>🇮🇳 INR → USD</span>
                    <span className="text-[9px] text-white/40 normal-case">(IRS/Treasury)</span>
                  </div>
                </th>
                <th className="p-2.5 px-3">
                  <div className="flex items-center gap-1.5 text-purple-300">
                    <span>INR → CAD</span>
                    <span className="text-[9px] text-white/40 normal-case">(Calculated)</span>
                  </div>
                </th>
                <th className="p-2.5 px-3">
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <Car className="size-3" />
                    <span>IRS Mileage Rate</span>
                  </div>
                </th>
                <th className="p-2.5 px-3">
                  <div className="flex items-center gap-1.5 text-cyan-300">
                    <Home className="size-3" />
                    <span>Home Office %</span>
                  </div>
                </th>
                <th className="p-2.5 px-3 text-white/40">Notes / Benchmark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {years.map(yr => {
                const data = matrix[yr] || DEFAULT_TAX_ASSUMPTIONS[yr];
                const isActive = yr === activeYear;

                return (
                  <tr
                    key={yr}
                    className={`transition-colors ${
                      isActive
                        ? 'bg-blue-950/30 border-l-2 border-l-blue-400'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Tax Year */}
                    <td className="p-2.5 px-3 font-bold text-white flex items-center gap-2">
                      <span className="text-xs">{yr}</span>
                      {isActive && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[9px] font-sans font-semibold">
                          Active
                        </span>
                      )}
                    </td>

                    {/* CAD to USD */}
                    <td className="p-2 px-3">
                      <input
                        type="number"
                        step="0.000001"
                        value={data.cadToUsd ?? ''}
                        onChange={(e) => handleCellChange(yr, 'cadToUsd', e.target.value)}
                        className="w-28 bg-[#090f1e] border border-white/15 focus:border-blue-400 rounded px-2 py-1 text-xs text-blue-200 outline-none text-right font-mono"
                      />
                    </td>

                    {/* INR to USD */}
                    <td className="p-2 px-3">
                      <input
                        type="number"
                        step="0.0000001"
                        value={data.inrToUsd ?? ''}
                        onChange={(e) => handleCellChange(yr, 'inrToUsd', e.target.value)}
                        className="w-28 bg-[#090f1e] border border-white/15 focus:border-orange-400 rounded px-2 py-1 text-xs text-orange-200 outline-none text-right font-mono"
                      />
                    </td>

                    {/* INR to CAD */}
                    <td className="p-2 px-3">
                      <span className="text-purple-300 font-semibold px-2 py-1 bg-purple-500/10 rounded border border-purple-500/20 inline-block w-28 text-right">
                        {data.inrToCad?.toFixed(6) || '-'}
                      </span>
                    </td>

                    {/* Mileage */}
                    <td className="p-2 px-3">
                      <div className="flex items-center gap-1 w-24">
                        <span className="text-white/40 text-xs">$</span>
                        <input
                          type="number"
                          step="0.005"
                          value={data.mileageRate ?? ''}
                          onChange={(e) => handleCellChange(yr, 'mileageRate', e.target.value)}
                          className="w-full bg-[#090f1e] border border-white/15 focus:border-emerald-400 rounded px-2 py-1 text-xs text-emerald-200 outline-none text-right font-mono"
                        />
                      </div>
                    </td>

                    {/* Home Office % */}
                    <td className="p-2 px-3">
                      <div className="flex items-center gap-1 w-20">
                        <input
                          type="number"
                          step="1"
                          value={data.homeUsePercent ?? ''}
                          onChange={(e) => handleCellChange(yr, 'homeUsePercent', e.target.value)}
                          className="w-full bg-[#090f1e] border border-white/15 focus:border-cyan-400 rounded px-2 py-1 text-xs text-cyan-200 outline-none text-right font-mono"
                        />
                        <span className="text-white/40 text-xs">%</span>
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="p-2 px-3 font-sans text-xs text-white/50 truncate max-w-xs">
                      {data.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-[#0e1628] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 text-xs text-white/50">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span>Version Controlled & Synchronized via Supabase</span>
            </span>
            <span className="text-white/20">•</span>
            <span>Edited by: <b>{activePersona?.name || 'Jishnu Nath'}</b></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset to Benchmarks</span>
            </button>

            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Save className="size-3.5" />
              <span>Save & Apply Assumptions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
