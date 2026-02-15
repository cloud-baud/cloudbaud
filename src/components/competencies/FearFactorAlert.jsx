import React from 'react';
import { AlertTriangle, TrendingDown, DollarSign, Clock } from 'lucide-react';

/**
 * FearFactorAlert - Eye-catching component that reveals the cost of status quo
 * Uses specific statistics and dollar amounts to create urgency
 */
const FearFactorAlert = ({ fearFactor }) => {
  if (!fearFactor || !fearFactor.stat) {
    return null;
  }

  const { stat, cost, consequence } = fearFactor;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-red-500/30 bg-gradient-to-br from-red-950/40 to-slate-900/60 p-8 shadow-2xl">
      {/* Animated background pulse */}
      <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Icon and Title */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-red-400 mb-2">The Cost of Status Quo</h3>
            <p className="text-lg text-white leading-relaxed">{stat}</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Financial Impact */}
          {cost && (
            <div className="bg-slate-900/60 border border-red-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-5 h-5 text-red-400" />
                <span className="text-sm font-semibold text-red-400 uppercase tracking-wider">Financial Impact</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{cost}</p>
            </div>
          )}

          {/* Operational Consequence */}
          {consequence && (
            <div className="bg-slate-900/60 border border-red-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-red-400" />
                <span className="text-sm font-semibold text-red-400 uppercase tracking-wider">What This Means</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{consequence}</p>
            </div>
          )}
        </div>

        {/* CTA Strip */}
        <div className="mt-8 pt-6 border-t border-red-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-5 h-5 text-green-500" />
            <span className="text-slate-300">
              CloudBaud clients <span className="text-green-400 font-bold">eliminate 85-95%</span> of this waste
            </span>
          </div>
          <div className="text-sm text-slate-500">
            See how below ↓
          </div>
        </div>
      </div>
    </div>
  );
};

export default FearFactorAlert;
