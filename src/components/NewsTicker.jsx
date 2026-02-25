import React, { useState, useEffect } from 'react';

const STATIC_NEWS = [
  "BREAKING: 'Dark Mode' IPO Oversubscribed by 500%",
  "RUMOR: Admin planning 20% dividend payout next week",
  "WHALE ALERT: Unknown entity just pledged $500 to 'AI Chatbot'",
  "EARNINGS: 'Dev Tools' reports record engagement metrics"
];

const NewsTicker = () => {
  const [tickerItems, setTickerItems] = useState(STATIC_NEWS);

  useEffect(() => {
    const fetchFeatures = async () => {
        try {
            const res = await fetch('/api/features');
            const json = await res.json();
            const features = json.data || [];

            // Format: TICKER: $PRICE (CHANGE%)
            const marketUpdates = features.map(f => {
                const change = f.day_change || 0;
                const sign = change >= 0 ? '+' : '';
                const ticker = f.ticker || f.title.substring(0, 3).toUpperCase();
                return `${ticker}: $${(f.current_price || 1).toFixed(2)} (${sign}${change}%)`;
            });

            // Interleave news (Market updates first, then static news mixed in)
            const combined = [...marketUpdates, ...STATIC_NEWS];
            // Shuffle slightly
            for (let i = combined.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [combined[i], combined[j]] = [combined[j], combined[i]];
            }

            setTickerItems(combined);
        } catch (err) {
            console.error("Ticker fetch failed", err);
        }
    };

    fetchFeatures();

    // Poll every 30s
    const interval = setInterval(fetchFeatures, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-emerald-950 border-b border-emerald-900 text-emerald-400 text-xs font-mono py-1 overflow-hidden whitespace-nowrap relative z-50">
      <div className="inline-block animate-marquee">
        {tickerItems.map((item, i) => (
          <span key={i} className="mx-8 inline-flex items-center">
            <span className={`w-1.5 h-1.5 rounded-full mr-2 animate-pulse ${item.includes('(-') ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
            {item}
          </span>
        ))}
        {/* Duplicate for seamless loop */}
        {tickerItems.map((item, i) => (
          <span key={`dup-${i}`} className="mx-8 inline-flex items-center">
             <span className={`w-1.5 h-1.5 rounded-full mr-2 animate-pulse ${item.includes('(-') ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
            {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee ${Math.max(60, tickerItems.length * 4)}s linear infinite;
          white-space: nowrap;
        }
        .animate-marquee:hover {
            animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default NewsTicker;
