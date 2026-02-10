import React from 'react';

const SECTOR_COLORS = {
  'Frontend': 'bg-emerald-600',
  'Backend': 'bg-blue-600',
  'Mobile': 'bg-purple-600',
  'AI': 'bg-indigo-600',
  'Design': 'bg-pink-600',
  'Other': 'bg-gray-600'
};

const MarketHeatmap = ({ features = [] }) => {
  // Aggregate data
  const sectors = features.reduce((acc, feature) => {
    // Capitalize first letter for consistency with CATEGORIES
    const rawCat = feature.category || 'Other';
    const cat = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
    const amount = feature.pledged_amount || 0;

    if (!acc[cat]) {
      acc[cat] = { name: cat, value: 0, count: 0 };
    }
    acc[cat].value += amount;
    acc[cat].count += 1;
    return acc;
  }, {});

  const data = Object.values(sectors).sort((a, b) => b.value - a.value);
  const totalValue = data.reduce((sum, item) => sum + item.value, 0) || 1; // Avoid divide by zero

  if (data.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Market Heatmap</h3>
          <span className="text-xs text-gray-400">Size = Cap</span>
      </div>
      <div className="flex w-full h-32 rounded-lg overflow-hidden gap-0.5 bg-gray-100">
        {data.map((sector) => {
          const percent = (sector.value / totalValue) * 100;
          // Ensure tiny sectors show at least a sliver if they have value, else 0
          const width = sector.value > 0 ? Math.max(percent, 2) : 0;

          if (width === 0) return null;

          return (
            <div
              key={sector.name}
              style={{ width: `${width}%` }}
              className={`relative flex flex-col items-center justify-center p-1 transition-all hover:opacity-90 cursor-help group ${SECTOR_COLORS[sector.name] || 'bg-gray-500'}`}
              title={`${sector.name}: $${sector.value.toLocaleString()} (${sector.count} IPOs)`}
            >
              <span className="text-white font-bold text-xs sm:text-sm truncate w-full text-center drop-shadow-md">
                {sector.name}
              </span>
              <span className="text-white/90 text-[10px] font-mono hidden sm:block group-hover:block">
                ${sector.value.toLocaleString()}
              </span>
            </div>
          );
        })}
         {totalValue === 0 && (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                No Market Capitalization
            </div>
         )}
      </div>
    </div>
  );
};

export default MarketHeatmap;
