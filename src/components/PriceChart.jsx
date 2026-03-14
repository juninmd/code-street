import React, { useMemo } from 'react';
import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Cell,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { format, parseISO } from 'date-fns';

const CandlestickPath = (props) => {
  const { x, y, width, height, low, high, openClose: [open, close] } = props;
  const isGrowing = close >= open;
  const color = isGrowing ? '#10B981' : '#EF4444'; // Emerald for growth, Red for drop
  const ratio = Math.abs(height / (open - close));

  return (
    <g stroke={color} fill={color} strokeWidth="2">
      <path
        d={`
          M ${x + width / 2}, ${y + height}
          v ${(low - Math.min(open, close)) * ratio}
        `}
      />
      <path
        d={`
          M ${x + width / 2}, ${y}
          v ${(Math.max(open, close) - high) * ratio}
        `}
      />
      <rect x={x} y={y} width={width} height={height} />
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isGrowing = data.close >= data.open;
    const colorClass = isGrowing ? 'text-emerald-500' : 'text-red-500';

    return (
      <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl text-xs font-mono">
        <p className="text-gray-400 mb-2 border-b border-gray-700 pb-1">
          {data.time ? format(new Date(data.time), 'MMM d, H:mm') : label}
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-gray-500">O:</span>
          <span className="text-white font-bold">${data.open.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="text-gray-500">H:</span>
          <span className="text-white font-bold">${data.high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="text-gray-500">L:</span>
          <span className="text-white font-bold">${data.low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="text-gray-500">C:</span>
          <span className={`font-bold ${colorClass}`}>${data.close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-700">
          <span className="text-gray-500">Vol: </span>
          <span className="text-gray-300">${data.volume.toLocaleString()} ({data.transactions} trades)</span>
        </div>
      </div>
    );
  }
  return null;
};

const PriceChart = ({ history = [], candlesticks = [] }) => {
  // Use candlesticks data if available (from new endpoint), otherwise fallback to generating a line chart from history (or dummy candlesticks)
  const data = useMemo(() => {
    if (candlesticks && candlesticks.length > 0) {
      // Normalize data for Recharts
      return candlesticks.map(c => ({
         ...c,
         openClose: [c.open, c.close]
      }));
    }

    // Fallback: Generate fake candlesticks from history for backwards compatibility
    if (!history || history.length === 0) return [];

    const sorted = [...history].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // For simplicity, we just create one candle per data point if we don't have aggregated candlesticks
    let runningTotal = 0;
    return sorted.map(item => {
      const open = runningTotal;
      runningTotal += item.amount;
      const close = runningTotal;
      return {
        time: item.created_at,
        open,
        close,
        high: Math.max(open, close),
        low: Math.min(open, close),
        volume: item.amount,
        transactions: 1,
        openClose: [open, close]
      };
    });
  }, [history, candlesticks]);

  if (data.length === 0) {
    return (
      <div className="h-64 w-full bg-emerald-50/50 rounded-lg flex items-center justify-center border border-emerald-100 border-dashed">
        <p className="text-emerald-800/40 text-sm font-mono uppercase">Waiting for market data...</p>
      </div>
    );
  }

  const lastPoint = data[data.length - 1];
  const firstPoint = data[0];
  const isTotalGrowing = lastPoint.close >= firstPoint.open;

  // Calculate domains for Y axis to give some padding
  const minLow = Math.min(...data.map(d => d.low));
  const maxHigh = Math.max(...data.map(d => d.high));
  const padding = (maxHigh - minLow) * 0.1 || 10;

  return (
    <div className="w-full bg-gray-900 rounded-xl border border-gray-800 p-4 shadow-2xl mb-6 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-10 pointer-events-none"></div>

      <div className="flex justify-between items-end mb-6 relative z-10">
          <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Asset Chart</h4>
              <div className="text-2xl font-mono font-bold text-white flex items-center gap-2">
                  ${lastPoint.close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className={`text-sm ml-2 ${isTotalGrowing ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isTotalGrowing ? '+' : ''}
                      {(((lastPoint.close - firstPoint.open) / (firstPoint.open || 1)) * 100).toFixed(2)}%
                  </span>
              </div>
          </div>
          <div className="text-right">
             <div className="text-emerald-500 text-sm font-bold flex items-center justify-end">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {data.reduce((acc, curr) => acc + curr.transactions, 0)} Trades
             </div>
             <div className="text-xs text-gray-500 mt-1 uppercase">Interval: Auto</div>
          </div>
      </div>

      <div className="relative w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis
              dataKey="time"
              tickFormatter={(timeStr) => {
                  try {
                    return format(new Date(timeStr), 'HH:mm');
                  } catch(e) {
                      return '';
                  }
              }}
              stroke="#6B7280"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis
              domain={[Math.max(0, minLow - padding), maxHigh + padding]}
              stroke="#6B7280"
              fontSize={10}
              tickFormatter={(val) => `$${val}`}
              tickLine={false}
              axisLine={false}
              orientation="right"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4B5563', strokeWidth: 1, strokeDasharray: '4 4' }} />

            {/* The Candlestick Series */}
            <Bar
              dataKey="openClose"
              shape={<CandlestickPath />}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.close >= entry.open ? '#10B981' : '#EF4444'} />
              ))}
            </Bar>

            {/* Optional Volume Bars at the bottom could be added here on a secondary Y-axis */}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;