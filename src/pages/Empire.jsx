import React, { useState, useEffect, useRef } from 'react';
import { Crown, Server, Users, Bot, Rocket, Briefcase, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';

const ASSETS = [
    { id: 'cloud', name: 'Cloud Server Node', icon: Server, baseCost: 50, rate: 1, desc: 'Generates $1/sec.' },
    { id: 'dev', name: 'Junior Dev Intern', icon: Users, baseCost: 250, rate: 6, desc: 'Generates $6/sec.' },
    { id: 'ai', name: 'AI Code Assistant', icon: Bot, baseCost: 1500, rate: 45, desc: 'Generates $45/sec.' },
    { id: 'marketing', name: 'Viral Marketing Campaign', icon: Rocket, baseCost: 10000, rate: 350, desc: 'Generates $350/sec.' },
    { id: 'startup', name: 'Acquired Startup', icon: Briefcase, baseCost: 100000, rate: 4000, desc: 'Generates $4000/sec.' }
];

const Empire = () => {
    const [cash, setCash] = useState(parseFloat(localStorage.getItem('cash_balance') || '0'));
    const [inventory, setInventory] = useState(() => {
        const defaultInventory = ASSETS.reduce((acc, a) => ({ ...acc, [a.id]: 0 }), {});
        const saved = localStorage.getItem('empire_inventory');
        return saved ? { ...defaultInventory, ...JSON.parse(saved) } : defaultInventory;
    });

    // Calculate total MRR (per second rate)
    const mrr = ASSETS.reduce((total, asset) => total + (inventory[asset.id] * asset.rate), 0);

    const cashRef = useRef(cash);
    cashRef.current = cash;

    const mrrRef = useRef(mrr);
    mrrRef.current = mrr;

    useEffect(() => {
        // Compute "offline" progress since last visit
        const lastVisit = localStorage.getItem('empire_last_visit');
        const now = Date.now();
        if (lastVisit && mrr > 0) {
            const timeDiffSeconds = Math.floor((now - parseInt(lastVisit, 10)) / 1000);
            if (timeDiffSeconds > 0) {
                const offlineEarnings = timeDiffSeconds * mrr;
                const newCash = cash + offlineEarnings;
                setCash(newCash);
                localStorage.setItem('cash_balance', newCash.toFixed(2));
                window.dispatchEvent(new Event('storage'));
            }
        }

        const interval = setInterval(() => {
            if (mrrRef.current > 0) {
                // Add income per second. Update state and localStorage.
                const newCash = cashRef.current + mrrRef.current;
                setCash(newCash);
                localStorage.setItem('cash_balance', newCash.toFixed(2));

                // Dispatch event so other components (like header) update if needed
                window.dispatchEvent(new Event('storage'));
            }
            // Update last visit time continuously while on the page
            localStorage.setItem('empire_last_visit', Date.now().toString());
        }, 1000);

        return () => {
            clearInterval(interval);
            localStorage.setItem('empire_last_visit', Date.now().toString());
        };
    }, []);

    const calculateCost = (assetId) => {
        const count = inventory[assetId];
        const asset = ASSETS.find(a => a.id === assetId);
        // Cost scaling formula: baseCost * 1.15^count
        return asset.baseCost * Math.pow(1.15, count);
    };

    const buyAsset = (assetId) => {
        const cost = calculateCost(assetId);
        if (cash >= cost) {
            triggerHaptic('success');
            const newCash = cash - cost;
            setCash(newCash);
            localStorage.setItem('cash_balance', newCash.toFixed(2));

            const newInventory = { ...inventory, [assetId]: inventory[assetId] + 1 };
            setInventory(newInventory);
            localStorage.setItem('empire_inventory', JSON.stringify(newInventory));

            window.dispatchEvent(new Event('storage'));

            if (newInventory[assetId] === 1 || newInventory[assetId] % 10 === 0) {
                 confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.8 },
                    colors: ['#3B82F6', '#10B981']
                });
            }
        } else {
            triggerHaptic('error');
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden border border-indigo-500/30">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Crown className="w-64 h-64 text-indigo-300" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-sm font-semibold mb-4">
                            <TrendingUp className="w-4 h-4" />
                            Passive Income
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-2 tracking-tight">
                            SaaS <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Empire</span>
                        </h1>
                        <p className="text-lg text-indigo-200/80 max-w-xl">
                            Build your tech conglomerate. Buy revenue-generating assets and watch your cash pile grow automatically, even while you trade.
                        </p>
                    </div>

                    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col items-end min-w-[250px]">
                        <p className="text-sm font-semibold text-indigo-300 mb-1 flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Current MRR
                        </p>
                        <p className="text-4xl font-black text-emerald-400">
                            +${mrr.toLocaleString()}<span className="text-lg text-emerald-400/60 font-bold">/sec</span>
                        </p>
                        <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden relative">
                             {mrr > 0 && (
                                 <div className="absolute top-0 bottom-0 left-0 bg-emerald-500 animate-[pulse_1s_linear_infinite]" style={{width: '100%'}}></div>
                             )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ASSETS.map((asset) => {
                    const count = inventory[asset.id];
                    const cost = calculateCost(asset.id);
                    const canAfford = cash >= cost;
                    const AssetIcon = asset.icon;

                    return (
                        <div key={asset.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col transition-all hover:shadow-md">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400`}>
                                    <AssetIcon className="w-8 h-8" />
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-gray-900 dark:text-white">{count}</span>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Owned</p>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{asset.name}</h3>
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-1">
                                <DollarSign className="w-4 h-4" /> {asset.desc}
                            </p>

                            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={() => buyAsset(asset.id)}
                                    disabled={!canAfford}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${
                                        canAfford
                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                                    }`}
                                >
                                    <span>Buy 1</span>
                                    <span>${cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Empire;
