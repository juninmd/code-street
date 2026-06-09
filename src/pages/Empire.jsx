import React, { useState, useEffect, useRef } from 'react';
import { triggerHaptic } from '../utils/haptics';
import { addXP } from '../utils/leveling';
import {
    Building2, Server, Cpu, Database, Cloud,
    Wifi, Globe, Zap, Shield, Rocket, DollarSign,
    TrendingUp, Activity, Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

const EMPIRE_ASSETS = [
    { id: 'jr_dev', name: 'Junior Dev', baseCost: 10, income: 1, icon: Users, description: 'Writes bugs, but also code.' },
    { id: 'cloud_instance', name: 'Cloud Instance', baseCost: 100, income: 10, icon: Cloud, description: 'Basic compute power.' },
    { id: 'ai_generator', name: 'AI Code Generator', baseCost: 500, income: 50, icon: Cpu, description: 'Writes code while you sleep.' },
    { id: 'data_center', name: 'Data Center', baseCost: 2000, income: 250, icon: Database, description: 'Massive infrastructure.' },
    { id: 'quantum_server', name: 'Quantum Server', baseCost: 10000, income: 1500, icon: Server, description: 'Bends reality to compute.' },
    { id: 'tech_hub', name: 'Global Tech Hub', baseCost: 50000, income: 8000, icon: Globe, description: 'A network of engineers.' },
    { id: 'skynet', name: 'Sentient AI', baseCost: 500000, income: 100000, icon: Rocket, description: 'It controls everything.' },
];

const COST_MULTIPLIER = 1.15;

const Empire = () => {
    const [cashBalance, setCashBalance] = useState(() => parseFloat(localStorage.getItem('cash_balance') || '0'));
    const [assets, setAssets] = useState(() => {
        const saved = localStorage.getItem('empire_assets');
        return saved ? JSON.parse(saved) : {};
    });
    const [totalIncomePerSecond, setTotalIncomePerSecond] = useState(0);

    const cashRef = useRef(cashBalance);
    cashRef.current = cashBalance;

    const incomeRef = useRef(totalIncomePerSecond);
    incomeRef.current = totalIncomePerSecond;

    useEffect(() => {
        const calculateIncome = () => {
            let income = 0;
            for (const asset of EMPIRE_ASSETS) {
                const count = assets[asset.id] || 0;
                income += count * asset.income;
            }
            return income;
        };

        const currentIncome = calculateIncome();
        setTotalIncomePerSecond(currentIncome);

        const lastVisit = localStorage.getItem('empire_last_visit');
        const now = Date.now();
        if (lastVisit && currentIncome > 0) {
            const timeDiffSeconds = Math.floor((now - parseInt(lastVisit, 10)) / 1000);
            if (timeDiffSeconds > 0) {
                const offlineEarnings = timeDiffSeconds * currentIncome;
                setCashBalance(prev => {
                    const newBalance = prev + offlineEarnings;
                    localStorage.setItem('cash_balance', newBalance.toFixed(2));
                    return newBalance;
                });
            }
        }

        if (currentIncome > 0) {
            const interval = setInterval(() => {
                if (incomeRef.current > 0) {
                    setCashBalance(prev => {
                        const newBalance = prev + incomeRef.current;
                        localStorage.setItem('cash_balance', newBalance.toFixed(2));
                        return newBalance;
                    });
                }
                localStorage.setItem('empire_last_visit', Date.now().toString());
            }, 1000);
            return () => {
                clearInterval(interval);
                localStorage.setItem('empire_last_visit', Date.now().toString());
            };
        }
    }, [assets]);

    const getCost = (assetId, baseCost) => {
        const count = assets[assetId] || 0;
        return Math.floor(baseCost * Math.pow(COST_MULTIPLIER, count));
    };

    const buyAsset = (assetId, baseCost) => {
        const cost = getCost(assetId, baseCost);

        if (cashBalance >= cost) {
            triggerHaptic('success');

            const newBalance = cashBalance - cost;
            setCashBalance(newBalance);
            localStorage.setItem('cash_balance', newBalance.toFixed(2));

            const newCount = (assets[assetId] || 0) + 1;

            setAssets(prev => {
                const newAssets = { ...prev, [assetId]: newCount };
                localStorage.setItem('empire_assets', JSON.stringify(newAssets));
                return newAssets;
            });

            addXP(10);

            if (cost > 1000 || newCount === 1 || newCount % 10 === 0) {
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.8 },
                    colors: ['#8B5CF6', '#10B981']
                });
            }
        } else {
            triggerHaptic('error');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden border border-purple-800">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Building2 className="w-48 h-48 text-purple-400" />
                </div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-sm font-semibold mb-4">
                        <TrendingUp className="w-4 h-4" />
                        SaaS Empire Builder
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
                        Passive <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Income</span> Machine.
                    </h1>
                    <p className="text-lg text-purple-200 max-w-2xl mb-6">
                        Buy digital assets to automatically generate simulated cash. Build your infrastructure, scale your operations, and become a Silicon Valley tycoon without lifting a finger.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 flex items-center gap-4">
                            <div className="bg-emerald-500/20 p-3 rounded-lg">
                                <DollarSign className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-purple-200 text-sm font-bold uppercase tracking-wider">Liquid Net Worth</p>
                                <p className="text-3xl font-black text-white">${cashBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                            </div>
                        </div>

                        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 flex items-center gap-4">
                            <div className="bg-cyan-500/20 p-3 rounded-lg">
                                <Activity className="w-8 h-8 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-purple-200 text-sm font-bold uppercase tracking-wider">Idle Income Rate</p>
                                <p className="text-3xl font-black text-cyan-400">+${totalIncomePerSecond.toLocaleString()}/sec</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                    <Server className="w-6 h-6 text-indigo-600" />
                    Infrastructure Store
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {EMPIRE_ASSETS.map((asset) => {
                        const count = assets[asset.id] || 0;
                        const currentCost = getCost(asset.id, asset.baseCost);
                        const canAfford = cashBalance >= currentCost;
                        const Icon = asset.icon;

                        return (
                            <div key={asset.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-indigo-300 transition-all group flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-100 p-2.5 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{asset.name}</h4>
                                            <p className="text-xs text-gray-500">{asset.description}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white px-3 py-1 rounded-full border border-gray-200 text-sm font-bold text-gray-700 shadow-sm">
                                        x{count}
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-sm">
                                            <span className="text-gray-500 font-medium">Yield:</span>
                                            <span className="ml-1 font-bold text-emerald-600">+${asset.income}/s</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-gray-500 font-medium">Cost:</span>
                                            <span className={`ml-1 font-bold ${canAfford ? 'text-gray-900' : 'text-red-500'}`}>
                                                ${currentCost.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => buyAsset(asset.id, asset.baseCost)}
                                        disabled={!canAfford}
                                        className={`w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                            canAfford
                                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg active:scale-95'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        <Zap className="w-4 h-4" />
                                        {canAfford ? 'Purchase Asset' : 'Insufficient Funds'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Empire;