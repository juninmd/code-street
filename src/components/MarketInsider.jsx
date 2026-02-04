import React, { useMemo } from 'react';
import { X, TrendingUp, AlertTriangle, DollarSign, Activity, BarChart3 } from 'lucide-react';

const MarketInsider = ({ features, onClose }) => {
  const stats = useMemo(() => {
    const totalVolume = features.filter(f => f.status !== 'live').reduce((acc, f) => acc + (f.pledged_amount || 0), 0);
    const activeFeatures = features.filter(f => f.status !== 'live').length;
    const undervalued = features
      .filter(f => f.votes >= 2 && (f.pledged_amount || 0) < 50 && f.status !== 'live')
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 3);

    const topMovers = [...features]
        .filter(f => f.status !== 'live')
        .sort((a, b) => ((b.pledged_amount || 0) + b.votes * 10) - ((a.pledged_amount || 0) + a.votes * 10))
        .slice(0, 3);

    const sentiment = totalVolume > 500 ? 'Bullish' : 'Accumulation';

    return { totalVolume, activeFeatures, undervalued, topMovers, sentiment };
  }, [features]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl border border-emerald-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Market Insider</h2>
              <p className="text-emerald-500/60 text-xs font-mono uppercase tracking-wider">Live Trading Data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
              <p className="text-gray-400 text-xs uppercase font-medium mb-1">Market Vol</p>
              <p className="text-2xl font-mono font-bold text-white">${stats.totalVolume.toLocaleString()}</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
              <p className="text-gray-400 text-xs uppercase font-medium mb-1">Sentiment</p>
              <p className={`text-xl font-mono font-bold ${stats.sentiment === 'Bullish' ? 'text-green-400' : 'text-yellow-400'}`}>
                {stats.sentiment}
              </p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
              <p className="text-gray-400 text-xs uppercase font-medium mb-1">Active</p>
              <p className="text-2xl font-mono font-bold text-white">{stats.activeFeatures}</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
              <p className="text-gray-400 text-xs uppercase font-medium mb-1">Yield</p>
              <p className="text-2xl font-mono font-bold text-emerald-400">+5.2%</p>
            </div>
          </div>

          {/* Undervalued Gems */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Undervalued Opportunities (High Votes / Low Cap)
            </h3>
            <div className="space-y-3">
              {stats.undervalued.length > 0 ? stats.undervalued.map(feature => (
                <div key={feature.id} className="bg-gray-800/30 p-4 rounded-lg border border-gray-700 hover:border-emerald-500/50 transition-colors group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-white group-hover:text-emerald-300 transition-colors">{feature.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{feature.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-mono font-bold text-sm">${feature.pledged_amount || 0}</div>
                      <div className="text-gray-500 text-xs">{feature.votes} Votes</div>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${Math.min(feature.votes * 10, 100)}%` }}></div>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-sm italic">No undervalued assets found. Market is efficient.</p>
              )}
            </div>
          </div>

          {/* Top Movers */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Top Movers (High Activity)
            </h3>
            <div className="space-y-3">
              {stats.topMovers.map((feature, idx) => (
                <div key={feature.id} className="flex items-center justify-between p-3 border-b border-gray-800 last:border-0">
                   <div className="flex items-center gap-3">
                     <span className="font-mono text-gray-600 text-sm">0{idx + 1}</span>
                     <span className="text-gray-300 font-medium truncate max-w-[200px]">{feature.title}</span>
                   </div>
                   <div className="flex items-center gap-4">
                     <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded">
                       +{feature.votes} Votes
                     </span>
                     <span className="text-white font-mono text-sm">
                       ${feature.pledged_amount || 0}
                     </span>
                   </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-900 p-4 border-t border-gray-800 text-center">
            <p className="text-gray-600 text-xs">
                AI Prediction: <span className="text-emerald-500">Buy Tech Debt, Sell UI Polish.</span>
            </p>
        </div>
      </div>
    </div>
  );
};

export default MarketInsider;
