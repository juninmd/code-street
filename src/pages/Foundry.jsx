import React, { useState } from 'react';
import { Brain, Sparkles, TrendingUp, DollarSign, FileText, ArrowRight, Activity, Loader2, Cpu, Rocket } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

const Foundry = () => {
    const [generating, setGenerating] = useState(false);
    const [generatingBlueprint, setGeneratingBlueprint] = useState(false);
    const [idea, setIdea] = useState(null);
    const [blueprint, setBlueprint] = useState(null);
    const [generatingMVP, setGeneratingMVP] = useState(false);
    const [mvpCode, setMvpCode] = useState(null);
    const [error, setError] = useState('');

    const generateIdea = async () => {
        setGenerating(true);
        setError('');
        setIdea(null);
        setBlueprint(null);
        setMvpCode(null);
        triggerHaptic('medium');

        try {
            const response = await fetch('/api/foundry/generate', {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to generate idea');
            const data = await response.json();
            setIdea(data.idea);
            triggerHaptic('success');
        } catch (err) {
            console.error(err);
            setError('The AI servers are currently overloaded with requests. Try again.');
            triggerHaptic('error');
        } finally {
            setGenerating(false);
        }
    };

    const generateBlueprint = async () => {
        if (!idea) return;
        setGeneratingBlueprint(true);
        setError('');
        triggerHaptic('light');

        try {
            const response = await fetch('/api/foundry/blueprint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: idea.title, description: idea.description }),
            });
            if (!response.ok) throw new Error('Failed to generate blueprint');
            const data = await response.json();
            setBlueprint(data.blueprint);
            triggerHaptic('success');
        } catch (err) {
            console.error(err);
            setError('Failed to construct execution blueprint. The blueprint generator is busy.');
            triggerHaptic('error');
        } finally {
            setGeneratingBlueprint(false);
        }
    };

    const generateMVP = async () => {
        if (!idea) return;
        setGeneratingMVP(true);
        setError('');
        triggerHaptic('light');

        try {
            const response = await fetch('/api/foundry/build-mvp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: idea.title, description: idea.description }),
            });
            if (!response.ok) throw new Error('Failed to generate MVP code');
            const data = await response.json();
            setMvpCode(data.code);
            triggerHaptic('success');
        } catch (err) {
            console.error(err);
            setError('Failed to generate MVP code. The builder is currently busy.');
            triggerHaptic('error');
        } finally {
            setGeneratingMVP(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden border border-purple-500/30">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Brain className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-sm font-semibold mb-4">
                        <Sparkles className="w-4 h-4" />
                        AI Millionaire Foundry
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">
                        Generate Your Next <br /> Tech Empire.
                    </h1>
                    <p className="text-lg text-purple-200 max-w-2xl mb-8 leading-relaxed">
                        The Foundry uses advanced AI to synthesize market trends and generate highly profitable micro-SaaS ideas. Once generated, we automatically file an IPO on the CodeStreet Exchange to validate market demand instantly.
                    </p>

                    <button
                        onClick={generateIdea}
                        disabled={generating}
                        className="bg-white text-purple-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-70 disabled:hover:scale-100 flex items-center gap-3"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Synthesizing Market Data...
                            </>
                        ) : (
                            <>
                                <Brain className="w-6 h-6" />
                                Generate Million-Dollar Idea
                            </>
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Generated Idea Section */}
            {idea && (
                <div className="bg-white rounded-xl shadow-lg border border-purple-100 p-6 sm:p-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl font-bold text-gray-900">{idea.title}</h2>
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm font-mono font-bold border border-gray-200">
                                    ${idea.ticker}
                                </span>
                            </div>
                            <p className="text-gray-600 text-lg leading-relaxed">{idea.description}</p>
                        </div>
                    </div>

                    {/* Market Validation Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                            <div className="flex items-center gap-2 text-emerald-700 mb-2">
                                <Activity className="w-5 h-5" />
                                <span className="font-bold text-sm uppercase tracking-wider">Initial Market Validation</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black text-emerald-600">${idea.pledged_amount?.toFixed(2) || idea.initial_price?.toFixed(2)}</span>
                                <span className="text-emerald-700 text-sm font-medium pb-1">pledged in 60s</span>
                            </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                            <div className="flex items-center gap-2 text-purple-700 mb-2">
                                <TrendingUp className="w-5 h-5" />
                                <span className="font-bold text-sm uppercase tracking-wider">Growth Potential</span>
                            </div>
                            <span className="text-3xl font-black text-purple-600">High</span>
                        </div>
                    </div>

                    {!blueprint && (
                        <div className="flex justify-center border-t border-gray-100 pt-8 mt-4">
                            <button
                                onClick={generateBlueprint}
                                disabled={generatingBlueprint}
                                className="bg-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-purple-200"
                            >
                                {generatingBlueprint ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Constructing Blueprint...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-5 h-5" />
                                        Generate Execution Blueprint
                                        <ArrowRight className="w-5 h-5 ml-1" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Blueprint Section */}
            {blueprint && (
                <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 p-6 sm:p-8 text-gray-100 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
                        <FileText className="w-6 h-6 text-purple-400" />
                        <h3 className="text-2xl font-bold text-white">Execution Blueprint</h3>
                    </div>
                    <div className="prose prose-invert prose-purple max-w-none">
                        <div className="whitespace-pre-wrap font-mono text-sm sm:text-base text-gray-300 leading-relaxed">
                            {blueprint}
                        </div>
                    </div>
                    <div className="mt-8 p-4 bg-purple-900/30 border border-purple-500/30 rounded-lg flex items-start gap-4">
                        <DollarSign className="w-8 h-8 text-purple-400 flex-shrink-0" />
                        <div>
                            <p className="font-bold text-white">Blueprint Ready. Time to Build.</p>
                            <p className="text-sm text-purple-200 mt-1">
                                The market has spoken and the plan is laid out. Your next step is to execute.
                            </p>
                        </div>
                    </div>

                    {!mvpCode && (
                        <div className="flex justify-center border-t border-gray-800 pt-8 mt-8">
                            <button
                                onClick={generateMVP}
                                disabled={generatingMVP}
                                className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-500 transition-colors flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-emerald-900/50"
                            >
                                {generatingMVP ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Coding MVP...
                                    </>
                                ) : (
                                    <>
                                        <Cpu className="w-5 h-5" />
                                        Generate MVP Landing Page
                                        <ArrowRight className="w-5 h-5 ml-1" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* MVP Code Section */}
            {mvpCode && (
                <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700 p-6 sm:p-8 text-slate-100 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <Cpu className="w-6 h-6 text-emerald-400" />
                            <h3 className="text-2xl font-bold text-white">MVP Landing Page Code</h3>
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(mvpCode);
                                triggerHaptic('success');
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700"
                        >
                            Copy HTML
                        </button>
                    </div>
                    <div className="relative">
                        <pre className="bg-slate-950 p-6 rounded-lg overflow-x-auto border border-slate-800 text-sm font-mono text-emerald-300 shadow-inner">
                            <code>{mvpCode}</code>
                        </pre>
                    </div>
                    <div className="mt-8 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg flex items-start gap-4">
                        <Rocket className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                        <div>
                            <p className="font-bold text-white">Your MVP is ready to launch.</p>
                            <p className="text-sm text-emerald-200 mt-1">
                                Save this code as <code>index.html</code> and open it in your browser. You are now a Tech Founder.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Foundry;