import React, { useState, useEffect } from 'react';
import { DollarSign, Zap, Star, Activity } from 'lucide-react';

const MESSAGES = [
    { type: 'pledge', text: 'Someone pledged $50 to "Dark Mode Support"' },
    { type: 'pledge', text: 'New pledge: $100 for "Mobile App v2"' },
    { type: 'boost', text: '"AI Image Gen" was just Boosted to the top!' },
    { type: 'new', text: 'New Bounty: "Integrate Stripe Payments"' },
    { type: 'claim', text: 'Hunter @dev_alex claimed "Fix Login Bug"' },
    { type: 'pledge', text: 'Anonymous pledged $25 to "Export to PDF"' },
    { type: 'revenue', text: 'Platform just earned $12.50 in fees' },
];

const LiveTicker = () => {
    const [current, setCurrent] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisible(false);
            setTimeout(() => {
                setCurrent(prev => (prev + 1) % MESSAGES.length);
                setVisible(true);
            }, 500); // Wait for fade out
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const msg = MESSAGES[current];

    return (
        <div className="bg-emerald-950 text-emerald-50 text-xs font-medium py-2 overflow-hidden sticky top-0 z-50 shadow-sm border-b border-emerald-900">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-center sm:justify-start gap-3">
                <div className="flex items-center gap-1.5 bg-emerald-900/50 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-emerald-400 border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                    MARKET
                </div>

                <div
                    className={`flex items-center transition-all duration-500 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                >
                    {msg.type === 'pledge' && <DollarSign className="w-3.5 h-3.5 mr-1.5 text-green-400" />}
                    {msg.type === 'boost' && <Zap className="w-3.5 h-3.5 mr-1.5 text-yellow-400" />}
                    {msg.type === 'new' && <Star className="w-3.5 h-3.5 mr-1.5 text-blue-400" />}
                    {msg.type === 'claim' && <Activity className="w-3.5 h-3.5 mr-1.5 text-purple-400" />}
                    {msg.type === 'revenue' && <DollarSign className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />}
                    <span className="truncate">{msg.text}</span>
                </div>
            </div>
        </div>
    );
};

export default LiveTicker;
