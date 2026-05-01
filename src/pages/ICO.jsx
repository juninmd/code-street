import React, { useState, useEffect } from 'react';
import { Rocket, AlertTriangle, DollarSign, Activity, Coins, TrendingUp } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';

const ICO = () => {
    const [tokenName, setTokenName] = useState('');
    const [tokenTicker, setTokenTicker] = useState('');
    const [phase, setPhase] = useState('setup'); // setup, presale, hype, public, rugpull
    const [liquidityPool, setLiquidityPool] = useState(0);
    const [investorCount, setInvestorCount] = useState(0);
    const [progress, setProgress] = useState(0);

    const generateToken = () => {
        const adjectives = ['Safe', 'Elon', 'Moon', 'Doge', 'Pepe', 'Quantum', 'AI', 'Neural'];
        const nouns = ['Coin', 'Token', 'Inu', 'Rocket', 'Mars', 'Floki'];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        setTokenName(`${adj} ${noun}`);
        setTokenTicker(`${adj.substring(0, 3).toUpperCase()}${noun.substring(0, 1).toUpperCase()}`);
        setPhase('presale');
        setLiquidityPool(0);
        setInvestorCount(0);
        setProgress(0);
        triggerHaptic('medium');
    };

    useEffect(() => {
        let interval;
        if (phase === 'presale' || phase === 'hype' || phase === 'public') {
            interval = setInterval(() => {
                setProgress(p => {
                    const next = p + (Math.random() * 5);
                    if (next >= 100) {
                        if (phase === 'presale') setPhase('hype');
                        else if (phase === 'hype') setPhase('public');
                        return 0;
                    }
                    return next;
                });

                // Simulate ape-ins
                const newLiquidity = Math.floor(Math.random() * (phase === 'public' ? 100000 : 10000));
                setLiquidityPool(prev => prev + newLiquidity);
                setInvestorCount(prev => prev + Math.floor(Math.random() * 10));

            }, 500);
        }
        return () => clearInterval(interval);
    }, [phase]);

    const executeRugPull = () => {
        triggerHaptic('heavy');
        confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#10b981', '#047857', '#059669']
        });

        // Make the user RICH
        const currentCash = parseFloat(localStorage.getItem('cash_balance') || '0');
        const payout = liquidityPool;
        localStorage.setItem('cash_balance', (currentCash + payout).toFixed(2));

        // Update user stats
        const currentXp = parseInt(localStorage.getItem('xp') || '0');
        localStorage.setItem('xp', (currentXp + 5000).toString());

        setPhase('rugpull');
    };

    const reset = () => {
        setPhase('setup');
        setTokenName('');
        setTokenTicker('');
        setLiquidityPool(0);
        setInvestorCount(0);
        setProgress(0);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Coins className="w-8 h-8 text-yellow-500 mr-2" />
                        ICO Launcher (Degens Only)
                    </h1>
                    <p className="text-gray-500 mt-1">Launch a useless token, build fake hype, and steal the liquidity. Financial advice.</p>
                </div>
            </div>

            {phase === 'setup' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center space-y-6 animate-fade-in-up">
                    <Rocket className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                    <h2 className="text-2xl font-bold">Ready to become a crypto billionaire?</h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Our AI will generate a highly-investable, completely utility-free token.
                        Once it launches, watch the retail investors pour their life savings into the liquidity pool.
                    </p>
                    <button
                        onClick={generateToken}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center mx-auto"
                    >
                        <Rocket className="w-5 h-5 mr-2" />
                        Deploy Smart Contract
                    </button>
                </div>
            )}

            {(phase === 'presale' || phase === 'hype' || phase === 'public') && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-8 animate-fade-in-up">
                    <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-6 rounded-lg border border-gray-100">
                        <div>
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Token Name</span>
                            <div className="text-3xl font-black text-gray-900">{tokenName}</div>
                        </div>
                        <div className="text-right mt-4 md:mt-0">
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Ticker</span>
                            <div className="text-3xl font-black text-emerald-600">${tokenTicker}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 flex flex-col items-center justify-center">
                            <span className="text-emerald-800 font-medium mb-2">Total Liquidity Pool</span>
                            <div className="text-4xl font-bold text-emerald-600 flex items-center">
                                <DollarSign className="w-8 h-8" />
                                {liquidityPool.toLocaleString()}
                            </div>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col items-center justify-center">
                            <span className="text-blue-800 font-medium mb-2">Retail Investors (Bagholders)</span>
                            <div className="text-4xl font-bold text-blue-600 flex items-center">
                                <Activity className="w-8 h-8 mr-2" />
                                {investorCount.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-gray-500 uppercase tracking-wider">
                                Current Phase: <span className="text-emerald-600 font-bold">{phase.toUpperCase()}</span>
                            </span>
                            <span className="text-gray-500">{Math.floor(progress)}% Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                                className={`h-4 rounded-full transition-all duration-500 ${
                                    phase === 'presale' ? 'bg-blue-500' :
                                    phase === 'hype' ? 'bg-purple-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex flex-col items-center">
                        <AlertTriangle className="w-12 h-12 text-red-500 mb-4 animate-pulse" />
                        <button
                            onClick={executeRugPull}
                            className="bg-red-600 hover:bg-red-700 text-white font-black text-2xl py-6 px-12 rounded-xl shadow-2xl hover:shadow-red-500/50 transition-all transform hover:scale-105 active:scale-95 w-full md:w-auto border-b-8 border-red-800 active:border-b-0 active:mt-8"
                        >
                            EXECUTE RUG PULL
                        </button>
                        <p className="text-xs text-gray-400 mt-4 max-w-sm text-center">
                            Warning: Clicking this will drain the entire liquidity pool directly into your personal balance. The SEC is not watching.
                        </p>
                    </div>
                </div>
            )}

            {phase === 'rugpull' && (
                <div className="bg-red-50 rounded-xl shadow-lg border-2 border-red-500 p-8 text-center space-y-6 animate-fade-in-up">
                    <TrendingUp className="w-20 h-20 text-red-600 mx-auto" />
                    <h2 className="text-4xl font-black text-red-700">RUG PULLED!</h2>
                    <p className="text-xl text-red-900">
                        You successfully drained <span className="font-bold text-green-600">${liquidityPool.toLocaleString()}</span> from {investorCount} unsuspecting retail investors.
                    </p>
                    <p className="text-gray-600">
                        The funds have been transferred directly to your CodeStreet cash balance. Enjoy the yacht!
                    </p>

                    <button
                        onClick={reset}
                        className="mt-8 bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                        Launch Another Scam
                    </button>
                </div>
            )}

        </div>
    );
};

export default ICO;