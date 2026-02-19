import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react';

const LiveTicker = () => {
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/features');
                const json = await res.json();
                setFeatures(json.data || []);
            } catch (err) {
                console.error("Failed to fetch market data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="h-9 bg-gray-900 border-b border-gray-800"></div>;

    // Filter for active/interesting items
    const tickerItems = features.map(f => {
        const price = f.current_price || 1.00;
        const change = f.day_change || 0;
        const symbol = f.ticker || f.title.substring(0, 3).toUpperCase();
        return {
            id: f.id,
            symbol,
            price,
            change
        };
    });

    // Add some "Index" items
    const marketIndex = {
        id: 'index',
        symbol: 'MKT_IDX',
        price: tickerItems.length ? tickerItems.reduce((acc, i) => acc + i.price, 0) / tickerItems.length * 100 : 100,
        change: tickerItems.length ? tickerItems.reduce((acc, i) => acc + i.change, 0) / tickerItems.length : 0
    };

    const baseList = [marketIndex, ...tickerItems];
    // Duplicate exactly once for seamless loop (0 -> -50%)
    const allItems = [...baseList, ...baseList];

    return (
        <div className="bg-gray-900 text-white text-xs font-mono py-2 overflow-hidden sticky top-0 z-50 border-b border-emerald-900/50 flex items-center relative h-9 w-full">
            {/* Static Label */}
            <div className="absolute left-0 top-0 bottom-0 bg-gray-900 z-20 px-3 flex items-center border-r border-gray-800 shadow-[5px_0_15px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-2 text-emerald-500 font-bold tracking-wider">
                    <Activity className="w-3 h-3 animate-pulse" />
                    LIVE
                </div>
            </div>

            {/* Marquee Content */}
            <div className="flex items-center gap-8 animate-marquee whitespace-nowrap pl-4 hover:[animation-play-state:paused] w-max">
                {allItems.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-bold text-gray-300">{item.symbol}</span>
                        <span className={item.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                            ${item.price.toFixed(2)}
                        </span>
                        <span className={`flex items-center ${item.change >= 0 ? 'text-green-500' : 'text-red-500'} text-[10px]`}>
                            {item.change >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                            {Math.abs(item.change).toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>

            {/* Fade Right */}
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none z-20"></div>
        </div>
    );
};

export default LiveTicker;
