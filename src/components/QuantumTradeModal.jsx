import React, { useState } from 'react';
import { Cpu, X, Zap, ArrowRight, DollarSign, Activity, Terminal } from 'lucide-react';
import confetti from 'canvas-confetti';
import { triggerHaptic } from '../utils/haptics';
import { getCashBalance, updateCashBalance } from '../utils/portfolio';

const QuantumTradeModal = ({ onClose }) => {
    const [investment, setInvestment] = useState(100);
    const [status, setStatus] = useState('idle'); // idle, executing, result
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const cash = getCashBalance();

    const handleExecute = async () => {
        if (investment > cash) {
            setError('Insufficient liquidity. Deposit more cash.');
            return;
        }
        if (investment < 10) {
            setError('Minimum investment is $10.');
            return;
        }

        setError('');
        setStatus('executing');
        triggerHaptic('notification');

        // Simulate matrix calculations
        setTimeout(async () => {
            try {
                const res = await fetch('/api/market/quantum-trade', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ investment: parseFloat(investment) })
                });

                if (!res.ok) {
                    throw new Error('Quantum Engine Overload');
                }

                const data = await res.json();

                // Update local cash balance
                updateCashBalance(data.net_profit); // Can be positive or negative

                setResult(data);
                setStatus('result');

                if (data.net_profit > 0) {
                    triggerHaptic('success');
                    confetti({
                        particleCount: 150,
                        spread: 80,
                        origin: { y: 0.6 },
                        colors: ['#10B981', '#34D399', '#059669', '#A855F7']
                    });
                } else {
                    triggerHaptic('error');
                    // Red flash effect could be added here via class toggle on body
                }

            } catch (err) {
                setStatus('idle');
                setError(err.message);
            }
        }, 2000); // 2 seconds of "calculating"
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-900 bg-opacity-80 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-gray-900 border border-indigo-500/50 rounded-lg text-left overflow-hidden shadow-2xl shadow-indigo-500/20 transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full relative">

                    {/* Glowing background effect */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>

                    <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 relative z-10">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center text-indigo-400">
                                <Cpu className="w-8 h-8 mr-3" />
                                <div>
                                    <h3 className="text-xl leading-6 font-bold text-white" id="modal-title">Quantum Trade Algo</h3>
                                    <p className="text-xs text-indigo-300 font-mono tracking-widest mt-1">EXPERIMENTAL</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {status === 'idle' && (
                            <div className="mt-6 space-y-4">
                                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                                    <p className="text-sm text-gray-300 leading-relaxed mb-4">
                                        Deploy our experimental High-Frequency Trading AI. The algorithm executes micro-trades on random market features in milliseconds.
                                    </p>
                                    <ul className="text-xs text-gray-400 space-y-2 font-mono">
                                        <li className="flex items-center"><Activity className="w-3 h-3 mr-2 text-indigo-400" /> Uses predictive sentiment analysis</li>
                                        <li className="flex items-center"><Activity className="w-3 h-3 mr-2 text-indigo-400" /> High Risk, High Volatility</li>
                                        <li className="flex items-center"><Activity className="w-3 h-3 mr-2 text-red-400" /> 5% Computation Fee applies</li>
                                    </ul>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Capital Allocation</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="number"
                                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-lg border-gray-700 rounded-md bg-gray-800 text-white p-3 font-mono"
                                            value={investment}
                                            onChange={(e) => setInvestment(e.target.value)}
                                            min="10"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 text-right">Available Liquidity: <span className="text-emerald-400 font-mono">${cash.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></p>
                                </div>

                                {error && <p className="text-red-400 text-xs font-bold">{error}</p>}
                            </div>
                        )}

                        {status === 'executing' && (
                            <div className="mt-8 text-center py-8">
                                <div className="inline-block animate-spin text-indigo-500 mb-4">
                                    <Zap className="w-12 h-12" />
                                </div>
                                <h4 className="text-lg font-bold text-white mb-2">Executing Quantum Trades</h4>
                                <div className="font-mono text-xs text-indigo-400 text-left bg-black p-4 rounded border border-indigo-900/50 h-32 overflow-hidden flex flex-col justify-end">
                                    <p className="animate-pulse">&gt; Initializing neural network...</p>
                                    <p className="animate-pulse animation-delay-200">&gt; Scanning market features...</p>
                                    <p className="animate-pulse animation-delay-400">&gt; Executing high-frequency shorts...</p>
                                    <p className="animate-pulse animation-delay-600">&gt; Calculating arbitrage...</p>
                                </div>
                            </div>
                        )}

                        {status === 'result' && result && (
                            <div className="mt-6 space-y-4">
                                <div className={`p-4 rounded border text-center ${result.net_profit >= 0 ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                                    <p className="text-sm text-gray-400 font-mono mb-1">NET RESULT</p>
                                    <p className={`text-4xl font-bold font-mono ${result.net_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {result.net_profit >= 0 ? '+' : ''}{result.net_profit.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}
                                    </p>
                                </div>

                                <div className="bg-black p-4 rounded border border-gray-800">
                                    <h5 className="text-xs text-gray-500 font-bold mb-3 uppercase tracking-wider flex items-center">
                                        <Terminal className="w-3 h-3 mr-1" /> Trade Log
                                    </h5>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                        {result.trades.map((t, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs font-mono border-b border-gray-800 pb-2">
                                                <div>
                                                    <span className={`px-1 rounded mr-2 ${t.type === 'long' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                                        {t.type.toUpperCase()}
                                                    </span>
                                                    <span className="text-gray-300 truncate max-w-[100px] inline-block align-bottom">{t.feature_title}</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-gray-500">${t.invested}</span>
                                                    <span className={t.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                                        {t.profit >= 0 ? '+' : ''}{t.profit}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between text-xs text-gray-500 font-mono">
                                        <span>Computation Fee:</span>
                                        <span>${result.fee}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-700">
                        {status === 'idle' ? (
                            <button
                                type="button"
                                onClick={handleExecute}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm shadow-indigo-500/30 transition-all font-bold"
                            >
                                Execute Algo <ArrowRight className="w-4 h-4 ml-2" />
                            </button>
                        ) : status === 'result' ? (
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm transition-all"
                            >
                                Close Terminal
                            </button>
                        ) : null}

                        {status === 'idle' && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-transparent text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuantumTradeModal;
