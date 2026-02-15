import React from 'react';
import { ArrowRight, TrendingDown, TrendingUp, Clock, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * BeforeAfterComparison - Split-screen comparison component
 * Shows metrics before and after CloudBaud implementation
 */
const BeforeAfterComparison = ({ metrics }) => {
  if (!metrics || !metrics.before || !metrics.after) {
    return null;
  }

  const { before, after } = metrics;
  
  // Extract metric keys (assume same keys in both before and after)
  const metricKeys = Object.keys(before).filter(key => key !== 'label');
  
  // Determine improvement direction for each metric
  const getImprovement = (key, beforeVal, afterVal) => {
    // Normalize values for comparison
    const normalizeValue = (val) => {
      if (typeof val === 'string') {
        // Extract numbers from strings like "40 hrs/month", "$156K", "42%"
        const match = val.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
      }
      return parseFloat(val) || 0;
    };

    const beforeNum = normalizeValue(beforeVal);
    const afterNum = normalizeValue(afterVal);
    
    // Metrics where lower is better
    const lowerIsBetter = ['time', 'cost', 'error', 'hours', 'minutes', 'failure'];
    const isLowerBetter = lowerIsBetter.some(term => key.toLowerCase().includes(term));
    
    if (isLowerBetter) {
      return afterNum < beforeNum ? 'positive' : 'negative';
    } else {
      return afterNum > beforeNum ? 'positive' : 'negative';
    }
  };

  const formatMetricKey = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900/40 to-slate-800/20 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <h3 className="text-2xl font-bold text-white mb-2">Before & After Comparison</h3>
        <p className="text-slate-400">See the measurable impact of CloudBaud implementation</p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-slate-800">
        {/* BEFORE Column */}
        <div className="bg-slate-900/60 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">{before.label || 'Before'}</h4>
              <p className="text-sm text-slate-500">Current State</p>
            </div>
          </div>

          <div className="space-y-4">
            {metricKeys.map(key => (
              <div key={key} className="flex justify-between items-center py-3 border-b border-slate-800/50">
                <span className="text-slate-400 text-sm">{formatMetricKey(key)}</span>
                <span className="text-red-400 font-bold text-lg font-mono">{before[key]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AFTER Column */}
        <div className="bg-slate-900/60 p-8 relative">
          {/* Improvement Badge */}
          <div className="absolute top-4 right-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-500 text-xs font-bold">OPTIMIZED</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">{after.label || 'After'}</h4>
              <p className="text-sm text-slate-500">With CloudBaud</p>
            </div>
          </div>

          <div className="space-y-4">
            {metricKeys.map(key => {
              const improvement = getImprovement(key, before[key], after[key]);
              return (
                <div key={key} className="flex justify-between items-center py-3 border-b border-slate-800/50 group">
                  <span className="text-slate-400 text-sm">{formatMetricKey(key)}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg font-mono ${
                      improvement === 'positive' ? 'text-green-400' : 'text-amber-400'
                    }`}>
                      {after[key]}
                    </span>
                    {improvement === 'positive' && (
                      <TrendingDown className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="p-6 bg-slate-900/80 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span className="text-slate-300">Average implementation ROI: <span className="text-green-400 font-bold">320%</span> in first year</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="text-slate-300">Typical deployment: <span className="text-blue-400 font-bold">2-4 weeks</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterComparison;
