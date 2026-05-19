import React, { useState, useEffect } from 'react';
import { Building2, TrendingUp, DollarSign, Cpu, Globe, Rocket, AlertCircle, ShoppingCart } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';

const ASSETS = [
    { id: 'ai_bot', name: 'AI Twitter Bot', baseCost: 500, baseIncome: 5, icon: Cpu, description: 'Generates passive income by promoting affiliate links automatically.' },
    { id: 'micro_saas', name: 'Micro-SaaS', baseCost: 5000, baseIncome: 50, icon: Globe, description: 'A small web app that solves a niche problem, generating recurring revenue.' },
    { id: 'enterprise_crm', name: 'Enterprise CRM', baseCost: 25000, baseIncome: 300, icon: Building2, description: 'B2B software suite for large corporations with massive contracts.' },
    { id: 'cloud_infra', name: 'Cloud Provider', baseCost: 100000, baseIncome: 1500, icon: Rocket, description: 'Global server infrastructure powering the internet itself.' }
];

const Empire = () => {
    const [cash, setCash] = useState(0);
    const [ownedAssets, setOwnedAssets] = useState({});
    const [incomePerSecond, setIncomePerSecond] = useState(0);

    useEffect(() => {
        const initialCash = parseFloat(localStorage.getItem('cash_balance') || '1000');
        setCash(initialCash);

        const savedAssets = JSON.parse(localStorage.getItem('empire_assets') || '{}');
        setOwnedAssets(savedAssets);

        calculateIncome(savedAssets);
    }, []);

    const calculateIncome = (assets) => {
        let totalIncome = 0;
        ASSETS.forEach(asset => {
            const count = assets[asset.id] || 0;
            totalIncome += count * asset.baseIncome;
        });
        setIncomePerSecond(totalIncome);
    };

    // Passive income generation
    useEffect(() => {
        if (incomePerSecond === 0) return;

        const interval = setInterval(() => {
            setCash(prevCash => {
                const newCash = prevCash + (incomePerSecond / 10); // Run every 100ms
                localStorage.setItem('cash_balance', newCash.toFixed(2));
                return newCash;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [incomePerSecond]);

    const getCost = (assetId, baseCost) => {
        const count = ownedAssets[assetId] || 0;
        return baseCost * Math.pow(1.15, count); // Cost increases by 15% per purchase
    };

    const buyAsset = (asset) => {
        const cost = getCost(asset.id, asset.baseCost);
        if (cash >= cost) {
            const newCash = cash - cost;
            setCash(newCash);
            localStorage.setItem('cash_balance', newCash.toFixed(2));

            const newAssets = { ...ownedAssets };
            newAssets[asset.id] = (newAssets[asset.id] || 0) + 1;
            setOwnedAssets(newAssets);
            localStorage.setItem('empire_assets', JSON.stringify(newAssets));

            calculateIncome(newAssets);
            triggerHaptic('success');

            if (newAssets[asset.id] === 1) {
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.8 }
                });
            }
        } else {
            triggerHaptic('error');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="bg-gradient-to-r from-amber-600 to-yellow-600 rounded-2xl shadow-xl overflow-hidden p-8 text-white relative">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>

                <div className="relative z-10 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">Digital Empire</h1>
                    <p className="text-amber-100 text-lg mb-6">Build passive income streams to make you infinitely wealthy.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <div className="flex items-center justify-center space-x-2 text-amber-200 mb-2">
                                <DollarSign className="w-5 h-5" />
                                <span className="text-sm font-medium uppercase tracking-wider">Total Wealth</span>
                            </div>
                            <div className="text-4xl font-black tabular-nums">${cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <div className="flex items-center justify-center space-x-2 text-amber-200 mb-2">
                                <TrendingUp className="w-5 h-5" />
                                <span className="text-sm font-medium uppercase tracking-wider">Passive Income</span>
                            </div>
                            <div className="text-4xl font-black tabular-nums text-green-400">+${incomePerSecond.toLocaleString()}/s</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <ShoppingCart className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-bold text-gray-900">Acquire Assets</h2>
                    </div>
                    <span className="text-sm text-gray-500">Buy businesses to increase cash flow</span>
                </div>

                <div className="divide-y divide-gray-200">
                    {ASSETS.map((asset) => {
                        const count = ownedAssets[asset.id] || 0;
                        const cost = getCost(asset.id, asset.baseCost);
                        const canAfford = cash >= cost;

                        return (
                            <div key={asset.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-gray-50">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                                        <asset.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-lg font-bold text-gray-900">{asset.name}</h3>
                                            {count > 0 && (
                                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                                                    Owned: {count}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1 max-w-md">{asset.description}</p>
                                        <div className="mt-2 text-sm font-medium text-green-600 flex items-center">
                                            <TrendingUp className="w-4 h-4 mr-1" />
                                            +${asset.baseIncome.toLocaleString()}/sec per unit
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-shrink-0 flex items-center">
                                    <button
                                        onClick={() => buyAsset(asset)}
                                        disabled={!canAfford}
                                        className={`w-full md:w-48 flex items-center justify-between px-4 py-3 rounded-xl font-bold shadow-sm transition-all
                                            ${canAfford
                                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                    >
                                        <span>Buy</span>
                                        <span className="tabular-nums">${cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {incomePerSecond === 0 && (
                <div className="bg-blue-50 text-blue-800 rounded-xl p-4 flex items-start space-x-3 border border-blue-100">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
                    <div>
                        <h4 className="font-bold text-sm">Getting Started</h4>
                        <p className="text-sm mt-1">You need capital to buy your first asset. Go back to the Exchange, find undervalued features, or pitch to VCs to build your initial bankroll!</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Empire;
