import React from 'react';
import { useNavigate } from 'react-router-dom';

const MarketHeatmap = ({ features = [] }) => {
  const navigate = useNavigate();

  // 1. Filter active features (ignore extremely small ones unless there are few)
  let activeFeatures = features
    .filter(f => f.status !== 'completed' && f.status !== 'rejected')
    .sort((a, b) => (b.pledged_amount || 0) - (a.pledged_amount || 0));

  // If we have too many, take top 25
  if (activeFeatures.length > 25) {
    activeFeatures = activeFeatures.slice(0, 25);
  }

  // Calculate Total Market Cap of displayed items
  const totalCap = activeFeatures.reduce((sum, f) => sum + (f.pledged_amount || 0), 0) || 1;

  if (activeFeatures.length === 0) return null;

  const getColor = (feature) => {
    // Simulate "Heat" based on votes (momentum) relative to others
    const maxVotes = Math.max(...activeFeatures.map(f => f.votes)) || 1;
    const intensity = feature.votes / maxVotes;

    // Green shades for positive momentum
    if (intensity > 0.8) return 'bg-emerald-500'; // Hot
    if (intensity > 0.6) return 'bg-emerald-600';
    if (intensity > 0.4) return 'bg-emerald-700';
    if (intensity > 0.2) return 'bg-emerald-800';
    return 'bg-gray-700'; // Cold
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Market Map
          </h3>
          <span className="text-xs text-gray-400">Size = Market Cap • Color = Momentum</span>
      </div>

      {/* Grid Container */}
      <div className="flex flex-wrap content-start w-full h-48 sm:h-64 rounded-lg overflow-hidden bg-gray-900 p-1 gap-1">
        {activeFeatures.map((feature) => {
          // Calculate relative size
          const percent = ((feature.pledged_amount || 0) / totalCap) * 100;
          // Minimum visibility (1% or decent pixel width)
          const width = Math.max(percent, 2);
          const colorClass = getColor(feature);

          return (
            <div
              key={feature.id}
              onClick={() => navigate(`/feature/${feature.id}`)}
              style={{
                width: `calc(${width}% - 4px)`,
                flexGrow: 1,
                minWidth: '40px'
              }}
              className={`
                relative flex flex-col items-center justify-center p-1
                cursor-pointer transition-all hover:brightness-110 hover:scale-[1.02] hover:z-10
                rounded-sm border border-black/10 shadow-sm
                ${colorClass}
              `}
              title={`${feature.title}: $${(feature.pledged_amount || 0).toLocaleString()} • ${feature.votes} Votes`}
            >
              <span className="text-white font-bold text-[10px] sm:text-xs truncate w-full text-center leading-tight">
                {feature.ticker || feature.title.substring(0, 3).toUpperCase()}
              </span>
              {(feature.pledged_amount > 0) && (
                <span className="text-white/80 text-[9px] font-mono truncate hidden sm:block">
                    ${feature.pledged_amount < 1000 ? feature.pledged_amount : (feature.pledged_amount/1000).toFixed(1) + 'k'}
                </span>
              )}
            </div>
          );
        })}
        {activeFeatures.length === 0 && (
             <div className="w-full h-full flex items-center justify-center text-gray-500">
                 Market Closed (No Active IPOs)
             </div>
        )}
      </div>
    </div>
  );
};

export default MarketHeatmap;
