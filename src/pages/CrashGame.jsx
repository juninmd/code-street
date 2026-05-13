import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, AlertTriangle, DollarSign, Activity, Zap, Play } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';

const CrashGame = () => {
    const [gameState, setGameState] = useState('betting'); // 'betting', 'running', 'crashed'
    const [multiplier, setMultiplier] = useState(1.00);
    const [betAmount, setBetAmount] = useState('');
    const [cashOutAmount, setCashOutAmount] = useState(null);
    const [crashPoint, setCrashPoint] = useState(1.00);
    const [history, setHistory] = useState([]);

    const multiplierRef = useRef(1.00);
    const requestRef = useRef();
    const startTimeRef = useRef();

    // Reset and start game
    const startGame = (e) => {
        e.preventDefault();
        const currentCash = parseFloat(localStorage.getItem('cash_balance') || '0');
        const bet = parseFloat(betAmount);

        if (isNaN(bet) || bet <= 0) {
            alert('Please enter a valid bet amount.');
            return;
        }

        if (bet > currentCash) {
            alert('Insufficient funds. Check your profile cash balance.');
            return;
        }

        // Deduct bet
        localStorage.setItem('cash_balance', (currentCash - bet).toFixed(2));

        // Generate crash point using inverse transform sampling for crash mechanics
        // e = 1 / (1 - random) with a house edge (e.g., 5% instant crash)
        const rand = Math.random();
        let targetCrash = 1.00;
        if (rand > 0.05) {
             targetCrash = 1.00 / (1.00 - Math.random());
             // Cap it to prevent infinite loops, max 1000x for fun
             if (targetCrash > 1000) targetCrash = 1000;
        }

        setCrashPoint(targetCrash);
        setMultiplier(1.00);
        multiplierRef.current = 1.00;
        setCashOutAmount(null);
        setGameState('running');
        triggerHaptic('medium');

        startTimeRef.current = performance.now();
        requestRef.current = requestAnimationFrame(updateMultiplier);
    };

    const updateMultiplier = (time) => {
        const elapsed = time - startTimeRef.current;
        // Curve: 1.0024 ^ (elapsed / 20)
        const newMulti = Math.pow(1.0024, elapsed / 20);

        if (newMulti >= crashPoint) {
            // Crash!
            multiplierRef.current = crashPoint;
            setMultiplier(crashPoint);
            handleCrash();
            return;
        }

        multiplierRef.current = newMulti;
        setMultiplier(newMulti);
        requestRef.current = requestAnimationFrame(updateMultiplier);
    };

    const handleCrash = () => {
        cancelAnimationFrame(requestRef.current);
        setGameState('crashed');
        triggerHaptic('heavy');

        // Add to history
        setHistory(prev => [crashPoint, ...prev].slice(0, 10));
    };

    const cashOut = () => {
        if (gameState !== 'running') return;

        cancelAnimationFrame(requestRef.current);
        const currentCash = parseFloat(localStorage.getItem('cash_balance') || '0');
        const bet = parseFloat(betAmount);
        const currentMulti = multiplierRef.current;

        const winAmount = bet * currentMulti;
        localStorage.setItem('cash_balance', (currentCash + winAmount).toFixed(2));

        setCashOutAmount(winAmount);
        setGameState('crashed'); // End the game
        triggerHaptic('success');

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10B981', '#34D399']
        });

        // Add to history
        setHistory(prev => [currentMulti, ...prev].slice(0, 10));
    };

    useEffect(() => {
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-8 text-white shadow-xl relative overflow-hidden border border-gray-800">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Activity className="w-48 h-48 text-emerald-500" />
                </div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-semibold mb-4">
                        <TrendingUp className="w-4 h-4" />
                        Startup Valuation Crash
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
                        Ride the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Bubble</span>.
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mb-2">
                        Bet on a SaaS startup's valuation skyrocketing. Cash out before the VCs pull funding and the startup goes bankrupt!
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Game Area */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
                    {/* Multiplier Display */}
                    <div className="relative z-10 text-center">
                        <div className={`text-7xl md:text-9xl font-black font-mono tracking-tighter ${
                            gameState === 'crashed' && !cashOutAmount ? 'text-red-500' :
                            gameState === 'crashed' && cashOutAmount ? 'text-emerald-500' :
                            'text-gray-900'
                        }`}>
                            {multiplier.toFixed(2)}x
                        </div>

                        {gameState === 'crashed' && !cashOutAmount && (
                            <div className="mt-4 flex items-center justify-center gap-2 text-red-500 font-bold text-xl animate-bounce">
                                <AlertTriangle className="w-6 h-6" /> BANKRUPT
                            </div>
                        )}

                        {gameState === 'crashed' && cashOutAmount && (
                            <div className="mt-4 text-emerald-600 font-bold text-2xl animate-in slide-in-from-bottom-2">
                                Cashed out +${cashOutAmount.toFixed(2)}!
                            </div>
                        )}
                    </div>

                    {/* Graph Visual (Simulated) */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-20 pointer-events-none">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                            {gameState !== 'betting' && (
                                <path
                                    d={`M 0,100 Q 50,${100 - (multiplier > 10 ? 90 : multiplier * 9)} 100,${100 - (multiplier > 10 ? 100 : multiplier * 10)}`}
                                    fill="none"
                                    stroke={gameState === 'crashed' && !cashOutAmount ? '#ef4444' : '#10b981'}
                                    strokeWidth="2"
                                />
                            )}
                        </svg>
                    </div>
                </div>

                {/* Control Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
                    <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-600" /> Control Panel
                    </h3>

                    {gameState === 'betting' || gameState === 'crashed' ? (
                        <form onSubmit={startGame} className="space-y-6 flex-1 flex flex-col justify-center">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Bet Amount ($)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-gray-500 font-bold">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        required
                                        value={betAmount}
                                        onChange={(e) => setBetAmount(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-4 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                        placeholder="10.00"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setBetAmount((parseFloat(localStorage.getItem('cash_balance') || '0')).toFixed(2))}
                                        className="absolute right-2 top-2 bottom-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold px-3 rounded-lg transition-colors"
                                    >
                                        MAX
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-right">
                                    Available: ${(parseFloat(localStorage.getItem('cash_balance') || '0')).toFixed(2)}
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl py-5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Play className="w-6 h-6 fill-current" />
                                PLACE BET
                            </button>
                        </form>
                    ) : (
                        <div className="flex-1 flex flex-col justify-center items-center space-y-4">
                            <div className="text-center w-full">
                                <p className="text-sm font-bold text-gray-500 mb-1">Current Value</p>
                                <p className="text-3xl font-black text-emerald-600">
                                    ${((parseFloat(betAmount) || 0) * multiplier).toFixed(2)}
                                </p>
                            </div>
                            <button
                                onClick={cashOut}
                                className="w-full bg-amber-500 hover:bg-amber-400 text-white font-black text-2xl py-6 rounded-xl shadow-lg shadow-amber-500/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Zap className="w-6 h-6" />
                                CASH OUT
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* History */}
            {history.length > 0 && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-2 overflow-x-auto">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-2">History:</span>
                    {history.map((h, i) => (
                        <span
                            key={i}
                            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${h >= 2.0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
                        >
                            {h.toFixed(2)}x
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CrashGame;
