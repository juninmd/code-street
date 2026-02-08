import React, { useMemo } from 'react';
import { X, TrendingUp, AlertTriangle, Activity, Terminal } from 'lucide-react';

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

  const analystTip = useMemo(() => {
      if (!features.length) return null;
      // Deterministic "Tip of the Day" based on date
      const day = new Date().getDate();
      const index = day % features.length;
      const feature = features[index];
      const ratings = ['STRONG BUY', 'OUTPERFORM', 'ACCUMULATE'];
      const rating = ratings[day % ratings.length];
      const reasons = [
          "High vote velocity detected.",
          "Undervalued relative to sector.",
          "Insider accumulation pattern."
      ];
      const reason = reasons[day % reasons.length];

      return { feature, rating, reason };
  }, [features]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 font-mono">
      <div className="bg-black rounded-sm w-full max-w-2xl border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-emerald-900/50 flex justify-between items-center bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-sm border border-emerald-500/50">
              <Terminal className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-400 tracking-tight uppercase">CodeStreet Terminal_</h2>
              <p className="text-emerald-700 text-xs uppercase tracking-wider">v2.4.0 [CONNECTED]</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-700 hover:text-emerald-400 transition-colors p-2 hover:bg-emerald-900/30 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar bg-black">

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-emerald-900/10 p-4 border border-emerald-800/50">
              <p className="text-emerald-600 text-xs uppercase font-medium mb-1">Market Vol</p>
              <p className="text-xl font-bold text-emerald-400">${stats.totalVolume.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-900/10 p-4 border border-emerald-800/50">
              <p className="text-emerald-600 text-xs uppercase font-medium mb-1">Sentiment</p>
              <p className={`text-xl font-bold ${stats.sentiment === 'Bullish' ? 'text-green-400' : 'text-yellow-600'}`}>
                {stats.sentiment}
              </p>
            </div>
            <div className="bg-emerald-900/10 p-4 border border-emerald-800/50">
              <p className="text-emerald-600 text-xs uppercase font-medium mb-1">Active Assets</p>
              <p className="text-xl font-bold text-emerald-400">{stats.activeFeatures}</p>
            </div>
            <div className="bg-emerald-900/10 p-4 border border-emerald-800/50">
              <p className="text-emerald-600 text-xs uppercase font-medium mb-1">APY</p>
              <p className="text-xl font-bold text-emerald-400">+5.2%</p>
            </div>
          </div>

          {/* Analyst Rating of the Day */}
          {analystTip && (
              <div className="border border-emerald-500/50 bg-emerald-900/10 p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-600 text-black text-xs font-bold px-2 py-1">
                      TIP OF THE DAY
                  </div>
                  <h3 className="text-emerald-400 font-bold text-lg mb-1">{analystTip.feature.title}</h3>
                  <div className="flex items-center gap-4 mb-2">
                      <span className="text-emerald-300 text-xs">{analystTip.feature.category}</span>
                      <span className="bg-emerald-500 text-black text-xs font-bold px-2 py-0.5 rounded-sm">
                          {analystTip.rating}
                      </span>
                  </div>
                  <p className="text-emerald-600/80 text-sm italic">
                      "Analysis: {analystTip.reason}"
                  </p>
              </div>
          )}

          {/* Undervalued Gems */}
          <div>
            <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-emerald-900 pb-1">
              <AlertTriangle className="w-3 h-3 text-emerald-600" />
              Undervalued Opportunities
            </h3>
            <div className="space-y-3">
              {stats.undervalued.length > 0 ? stats.undervalued.map(feature => (
                <div key={feature.id} className="bg-emerald-900/5 p-3 border border-emerald-900/50 hover:border-emerald-500/50 transition-colors group cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-emerald-500 group-hover:text-emerald-300 transition-colors text-sm">{feature.title}</h4>
                      <p className="text-xs text-emerald-800 mt-1">{feature.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold text-sm">${feature.pledged_amount || 0}</div>
                      <div className="text-emerald-700 text-xs">{feature.votes} Votes</div>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-emerald-900/30 h-1">
                    <div className="bg-emerald-600 h-full" style={{ width: `${Math.min(feature.votes * 10, 100)}%` }}></div>
                  </div>
                </div>
              )) : (
                <p className="text-emerald-800 text-sm italic">No undervalued assets found.</p>
              )}
            </div>
          </div>

          {/* Top Movers */}
          <div>
            <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-emerald-900 pb-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              Market Movers
            </h3>
            <div className="space-y-2">
              {stats.topMovers.map((feature, idx) => (
                <div key={feature.id} className="flex items-center justify-between p-2 border-b border-emerald-900/30 last:border-0 hover:bg-emerald-900/10">
                   <div className="flex items-center gap-3">
                     <span className="font-mono text-emerald-800 text-sm">{String(idx + 1).padStart(2, '0')}</span>
                     <span className="text-emerald-500 text-sm truncate max-w-[200px]">{feature.title}</span>
                   </div>
                   <div className="flex items-center gap-4">
                     <span className="text-emerald-400 text-xs">
                       +{feature.votes} Vol
                     </span>
                     <span className="text-emerald-300 font-bold text-sm">
                       ${feature.pledged_amount || 0}
                     </span>
                   </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-black p-3 border-t border-emerald-900 text-center">
            <p className="text-emerald-800 text-xs animate-pulse">
                SYSTEM STATUS: ONLINE // EXECUTING TRADES...
            </p>
        </div>
      </div>
    </div>
  );
};

export default MarketInsider;
