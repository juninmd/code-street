import React, { useState } from 'react';
import { Mic, DollarSign, Activity, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';

const VCPitch = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPitching, setIsPitching] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [dealAccepted, setDealAccepted] = useState(false);

    const handlePitch = async (e) => {
        e.preventDefault();
        if (!title || !description) return;

        setIsPitching(true);
        setResult(null);
        setError('');
        setDealAccepted(false);
        triggerHaptic('medium');

        try {
            const res = await fetch('/api/foundry/pitch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description })
            });

            if (!res.ok) throw new Error('Pitch evaluation failed or AI overloaded.');

            const data = await res.json();
            setResult(data);
            triggerHaptic(data.is_funded ? 'success' : 'error');
        } catch (err) {
            console.error(err);
            setError(err.message || 'The Sharks are currently unavailable.');
            triggerHaptic('error');
        } finally {
            setIsPitching(false);
        }
    };

    const handleAcceptDeal = () => {
        if (!result || !result.is_funded || dealAccepted) return;

        const currentCash = parseFloat(localStorage.getItem('cash_balance') || '0');
        const newBalance = currentCash + result.investment_amount;
        localStorage.setItem('cash_balance', newBalance.toFixed(2));

        setDealAccepted(true);
        triggerHaptic('success');

        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#10B981', '#34D399', '#059669']
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Mic className="w-48 h-48" />
                </div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-indigo-500/30 text-indigo-200 px-4 py-2 rounded-full font-bold text-sm mb-6 border border-indigo-400/30">
                        <DollarSign className="w-4 h-4" /> Venture Capital Simulator
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black mb-6 tracking-tight leading-tight">
                        Enter the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Shark Tank</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-indigo-200 max-w-2xl font-medium leading-relaxed mb-8">
                        Pitch your SaaS idea to our panel of elite AI investors. If they like it, they'll inject real (simulated) capital into your CodeStreet account.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Mic className="w-6 h-6 text-indigo-600" />
                        Your Pitch
                    </h2>

                    <form onSubmit={handlePitch} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Startup Name</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="e.g., QuantumDB"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">The Pitch (Elevator Pitch)</label>
                            <textarea
                                required
                                rows="5"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                                placeholder="Explain the problem, your solution, and why it's going to make millions..."
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPitching}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 text-lg shadow-lg"
                        >
                            {isPitching ? (
                                <>
                                    <Activity className="w-5 h-5 animate-spin" />
                                    Sharks are evaluating...
                                </>
                            ) : (
                                'Pitch to Investors'
                            )}
                        </button>
                    </form>
                </div>

                {/* Result Section */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-emerald-600" />
                        The Verdict
                    </h2>

                    {result ? (
                        <div className="flex-1 flex flex-col space-y-6 animate-in fade-in slide-in-from-right-4">

                            <div className={`p-6 rounded-2xl border-2 ${result.is_funded ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    {result.is_funded ? (
                                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                                    ) : (
                                        <XCircle className="w-8 h-8 text-red-600" />
                                    )}
                                    <h3 className={`text-2xl font-black ${result.is_funded ? 'text-emerald-800' : 'text-red-800'}`}>
                                        {result.is_funded ? 'WE HAVE A DEAL' : 'NO DEAL'}
                                    </h3>
                                </div>
                                <p className={`text-sm font-medium ${result.is_funded ? 'text-emerald-700' : 'text-red-700'}`}>
                                    {result.reasoning}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Shark Feedback</h4>
                                {result.sharks_feedback.map((quote, idx) => (
                                    <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-xl relative">
                                        <div className="absolute top-4 left-4 text-4xl text-slate-200 font-serif leading-none">"</div>
                                        <p className="text-slate-700 italic font-medium pl-8 relative z-10">{quote}</p>
                                    </div>
                                ))}
                            </div>

                            {result.is_funded && (
                                <div className="mt-auto pt-6 border-t border-gray-100">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="text-sm font-bold text-gray-500">Offer on the table</p>
                                            <p className="text-4xl font-black text-emerald-600">
                                                ${(result.investment_amount).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {dealAccepted ? (
                                        <div className="bg-emerald-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 w-full text-lg shadow-lg opacity-90 cursor-default">
                                            <CheckCircle className="w-6 h-6" />
                                            Funds Deposited!
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleAcceptDeal}
                                            className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                        >
                                            Accept Deal & Take Money
                                        </button>
                                    )}
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-12">
                            <Mic className="w-16 h-16 mb-4 text-gray-200" />
                            <p className="text-lg font-medium text-gray-500">Waiting for pitch...</p>
                            <p className="text-sm max-w-xs mt-2">Submit your idea on the left to face the sharks.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VCPitch;
