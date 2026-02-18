import React from 'react';

const Sparkline = ({ data }) => {
    if (!data || data.length < 2) return <div className="h-8 w-24 bg-gray-50 rounded animate-pulse"></div>;

    // Determine trend
    const start = data[0];
    const end = data[data.length - 1];
    const isPositive = end >= start;
    const color = isPositive ? '#10B981' : '#EF4444'; // Emerald-500 or Red-500

    // Normalize
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    // Generate points for <polyline>
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        // Invert Y because SVG 0 is top
        const y = 100 - ((d - min) / range) * 80 - 10; // Keep 10% padding
        return `${x},${y}`;
    }).join(' ');

    // Fill area (optional, let's keep it simple line for now)

    return (
        <div className="flex flex-col items-end">
             <svg width="80" height="24" viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    points={points}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
        </div>
    );
};

export default Sparkline;
