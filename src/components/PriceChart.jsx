import React, { useMemo } from 'react';
import { format } from 'date-fns';

const PriceChart = ({ history = [] }) => {
  const data = useMemo(() => {
    if (!history || history.length === 0) return [];

    // Sort by date just in case
    const sorted = [...history].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    let runningTotal = 0;
    return sorted.map(item => {
      runningTotal += item.amount;
      return {
        date: new Date(item.created_at),
        value: runningTotal
      };
    });
  }, [history]);

  if (data.length === 0) {
    return (
      <div className="h-48 w-full bg-emerald-50/50 rounded-lg flex items-center justify-center border border-emerald-100 border-dashed">
        <p className="text-emerald-800/40 text-sm font-mono uppercase">Waiting for market data...</p>
      </div>
    );
  }

  // Dimensions
  const width = 600;
  const height = 200;
  const padding = 20;

  // Scales
  const maxVal = Math.max(...data.map(d => d.value)) * 1.1; // 10% headroom
  const minVal = 0;

  const minTime = data[0].date.getTime();
  const maxTime = data[data.length - 1].date.getTime(); // Use last point

  // If only one point, fake a time range to show a dot/line
  const timeRange = maxTime - minTime || 1000 * 60 * 60; // Default 1 hour if single point

  const getX = (date) => {
    if (data.length === 1) return width / 2;
    return padding + ((date.getTime() - minTime) / timeRange) * (width - 2 * padding);
  };

  const getY = (val) => {
    return height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);
  };

  // Generate Path
  let d = `M ${getX(data[0].date)} ${getY(data[0].value)}`;
  data.forEach((point) => {
    d += ` L ${getX(point.date)} ${getY(point.value)}`;
  });

  // Area Path (for gradient fill)
  const dArea = `${d} L ${getX(data[data.length-1].date)} ${height - padding} L ${getX(data[0].date)} ${height - padding} Z`;

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
      <div className="flex justify-between items-end mb-4">
          <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Market Depth</h4>
              <div className="text-2xl font-mono font-bold text-gray-900 flex items-center gap-2">
                  ${data[data.length - 1].value.toLocaleString()}
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-sans font-bold">LIVE</span>
              </div>
          </div>
          <div className="text-right">
             <div className="text-emerald-500 text-sm font-bold flex items-center justify-end">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {data.length} Transactions
             </div>
             <div className="text-xs text-gray-400">Since {format(data[0].date, 'MMM d')}</div>
          </div>
      </div>

      <div className="relative w-full aspect-[3/1] overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#f3f4f6" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4" />

          {/* Area Fill */}
          <path d={dArea} fill="url(#gradient)" stroke="none" />

          {/* Main Line */}
          <path d={d} fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {data.map((point, i) => (
             <circle
                key={i}
                cx={getX(point.date)}
                cy={getY(point.value)}
                r="3"
                fill="white"
                stroke="#059669"
                strokeWidth="2"
                className="hover:r-5 transition-all cursor-crosshair"
             >
                <title>${point.value} on {format(point.date, 'MMM d, H:mm')}</title>
             </circle>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default PriceChart;
