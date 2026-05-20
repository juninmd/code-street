import React, { useState, useEffect } from 'react';
import { Building, TrendingUp, DollarSign, Activity, Cpu, Mail, Briefcase, Plus, Coins } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';

const ASSETS = [
    { id: 'micro_saas', name: 'Micro-SaaS', icon: Building, baseCost: 1000, incomePerSecond: 5, description: 'A small but steady MRR generator.' },
    { id: 'ai_wrapper', name: 'AI Wrapper', icon: Cpu, baseCost: 5000, incomePerSecond: 30, description: 'Riding the hype wave for solid cash flow.' },
    { id: 'newsletter', name: 'Newsletter', icon: Mail, baseCost: 10000, incomePerSecond: 75, description: 'Monetizing an engaged audience.' },
    { id: 'trading_bot', name: 'Trading Bot', icon: Activity, baseCost: 50000, incomePerSecond: 400, description: 'Algorithmic alpha generation.' },
    { id: 'venture_fund', name: 'Venture Fund', icon: Briefcase, baseCost: 250000, incomePerSecond: 2500, description: 'Investing in the next generation of unicorns.' },
];

const Empire = () => {
    const [cash, setCash] = useState(0);
    const [ownedAssets, setOwnedAssets] = useState({});
    const [incomeRate, setIncomeRate] = useState(0);

    // Load initial state
    useEffect(() => {
        const savedCash = parseFloat(localStorage.getItem('cash_balance') || '0');
        setCash(savedCash);

        const savedAssets = JSON.parse(localStorage.getItem('empire_assets') || '{}');
        setOwnedAssets(savedAssets);
    }, []);

    // Calculate total income rate
    useEffect(() => {
        let rate = 0;
        ASSETS.forEach(asset => {
            const count = ownedAssets[asset.id] || 0;
            rate += count * asset.incomePerSecond;
        });
        setIncomeRate(rate);
    }, [ownedAssets]);

    // Passive income tick
    useEffect(() => {
        if (incomeRate === 0) return;

        const interval = setInterval(() => {
            setCash(prevCash => {
                // We add incomeRate per second, so per 100ms it's incomeRate / 10
                const newCash = prevCash + (incomeRate / 10);
                localStorage.setItem('cash_balance', newCash.toFixed(2));
                return newCash;
            });
        }, 100); // 10 times a second for smooth visual

        return () => clearInterval(interval);
    }, [incomeRate]);

    const getCost = (asset) => {
        const count = ownedAssets[asset.id] || 0;
        return asset.baseCost * Math.pow(1.15, count); // 15% price increase per purchase
    };

    const handleBuy = (asset) => {
        const cost = getCost(asset);
        if (cash >= cost) {
            triggerHaptic('success');

            const newCash = cash - cost;
            setCash(newCash);
            localStorage.setItem('cash_balance', newCash.toFixed(2));

            const newAssets = {
                ...ownedAssets,
                [asset.id]: (ownedAssets[asset.id] || 0) + 1
            };
            setOwnedAssets(newAssets);
            localStorage.setItem('empire_assets', JSON.stringify(newAssets));

            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.8 },
                colors: ['#10B981', '#34D399']
            });
        } else {
            triggerHaptic('error');
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gradient-to-br from-slate-900 to-emerald-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <TrendingUp className="w-48 h-48" />
                </div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/30 text-emerald-200 px-4 py-2 rounded-full font-bold text-sm mb-6 border border-emerald-400/30">
                        <Coins className="w-4 h-4" /> Idle Tycoon Mode
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black mb-4 tracking-tight leading-tight">
                        SaaS <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Empire</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-emerald-100 max-w-2xl font-medium leading-relaxed mb-8">
                        Build your portfolio of cash-flowing digital assets. Earn passive income while you sleep and become a digital mogul.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                            <p className="text-emerald-200 font-bold mb-1 text-sm uppercase tracking-wider">Available Cash</p>
                            <p className="text-4xl font-black font-mono">
                                ${cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                            <p className="text-emerald-200 font-bold mb-1 text-sm uppercase tracking-wider">Passive Income</p>
                            <p className="text-4xl font-black text-emerald-400 font-mono flex items-center gap-2">
                                +${incomeRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span className="text-lg text-emerald-200/50">/s</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {ASSETS.map(asset => {
                    const Icon = asset.icon;
                    const count = ownedAssets[asset.id] || 0;
                    const cost = getCost(asset);
                    const canAfford = cash >= cost;

                    return (
                        <div key={asset.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 hover:shadow-md transition-shadow">
                            <div className="bg-emerald-50 w-20 h-20 rounded-2xl flex items-center justify-center shrink-0">
                                <Icon className="w-10 h-10 text-emerald-600" />
                            </div>

                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{asset.name}</h3>
                                <p className="text-sm text-gray-500 mb-2">{asset.description}</p>
                                <div className="flex items-center justify-center sm:justify-start gap-4">
                                    <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                        +${asset.incomePerSecond}/s
                                    </span>
                                    <span className="inline-flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                        Owned: {count}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleBuy(asset)}
                                disabled={!canAfford}
                                className={`shrink-0 w-full sm:w-auto px-6 py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                                    canAfford
                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:-translate-y-0.5 shadow-lg hover:shadow-emerald-500/25'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <span className="flex items-center gap-1 text-sm">
                                    <Plus className="w-4 h-4" /> Buy
                                </span>
                                <span className="text-lg font-black font-mono">
                                    ${cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Empire;
