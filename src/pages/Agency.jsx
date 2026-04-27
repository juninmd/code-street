import React, { useState, useEffect } from 'react';
import { Briefcase, Building, DollarSign, Activity, FileText, CheckCircle, Clock, Zap, Target } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

const Agency = () => {
    const [clients, setClients] = useState([]);
    const [revenue, setRevenue] = useState(0);
    const [generating, setGenerating] = useState(false);

    const [form, setForm] = useState({
        clientName: '',
        industry: '',
        problem: ''
    });

    const [currentProposal, setCurrentProposal] = useState(null);

    // Load from local storage on mount
    useEffect(() => {
        const storedClients = localStorage.getItem('agency_clients');
        if (storedClients) {
            const parsed = JSON.parse(storedClients);
            setClients(parsed);

            // Calculate revenue from won clients
            const total = parsed.filter(c => c.status === 'won').reduce((acc, c) => acc + (c.proposal?.price_quote || 0), 0);
            setRevenue(total);
        }
    }, []);

    const saveClients = (newClients) => {
        setClients(newClients);
        localStorage.setItem('agency_clients', JSON.stringify(newClients));
        const total = newClients.filter(c => c.status === 'won').reduce((acc, c) => acc + (c.proposal?.price_quote || 0), 0);
        setRevenue(total);
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!form.industry || !form.problem) return;

        setGenerating(true);
        setCurrentProposal(null);
        triggerHaptic('medium');

        try {
            const res = await fetch('/api/agency/proposal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ industry: form.industry, problem: form.problem })
            });
            const data = await res.json();

            if (data.proposal) {
                setCurrentProposal({
                    ...data.proposal,
                    clientName: form.clientName,
                    id: Date.now()
                });
                triggerHaptic('success');
            }
        } catch (err) {
            console.error(err);
            triggerHaptic('error');
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveClient = (status = 'pitched') => {
        if (!currentProposal) return;

        const newClient = {
            id: currentProposal.id,
            name: currentProposal.clientName || 'Unknown Client',
            status: status,
            proposal: currentProposal,
            date: new Date().toISOString()
        };

        saveClients([newClient, ...clients]);
        setCurrentProposal(null);
        setForm({ clientName: '', industry: '', problem: '' });
        triggerHaptic('success');
    };

    const markAsWon = (id) => {
        const updated = clients.map(c => c.id === id ? { ...c, status: 'won' } : c);
        saveClients(updated);
        triggerHaptic('success');
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex items-center justify-between border border-indigo-500/30">
                    <div>
                        <p className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-1">Agency Revenue</p>
                        <h2 className="text-4xl font-extrabold">{formatCurrency(revenue)}</h2>
                    </div>
                    <div className="bg-indigo-500/20 p-4 rounded-xl border border-indigo-400/30">
                        <DollarSign className="w-8 h-8 text-indigo-300" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Total Clients</p>
                        <h2 className="text-3xl font-extrabold text-gray-900">{clients.length}</h2>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <Briefcase className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Win Rate</p>
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            {clients.length > 0 ? Math.round((clients.filter(c => c.status === 'won').length / clients.length) * 100) : 0}%
                        </h2>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl">
                        <Target className="w-8 h-8 text-emerald-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Generator Form */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <Zap className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">AI Proposal Generator</h2>
                    </div>

                    <form onSubmit={handleGenerate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Client Name (Optional)</label>
                            <input
                                type="text"
                                value={form.clientName}
                                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="e.g., Acme Corp"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Industry</label>
                            <input
                                type="text"
                                required
                                value={form.industry}
                                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="e.g., Real Estate, Healthcare, E-commerce"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Client's Problem</label>
                            <textarea
                                required
                                rows="3"
                                value={form.problem}
                                onChange={(e) => setForm({ ...form, problem: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="Describe the inefficiency or problem they are facing..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={generating}
                            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {generating ? (
                                <>
                                    <Activity className="w-5 h-5 animate-spin" />
                                    Generating High-Ticket Proposal...
                                </>
                            ) : (
                                <>
                                    <FileText className="w-5 h-5" />
                                    Generate Proposal
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Proposal Result */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col">
                    {currentProposal ? (
                        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">{currentProposal.title}</h3>
                                    <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-lg whitespace-nowrap ml-4">
                                        {formatCurrency(currentProposal.price_quote)}
                                    </span>
                                </div>

                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                    <p className="text-sm font-bold text-indigo-800 mb-1">Marketing Hook (Email Subject)</p>
                                    <p className="text-indigo-900 italic">"{currentProposal.marketing_pitch}"</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 mb-2">Executive Summary</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">{currentProposal.executive_summary}</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 mb-2">Proposed Technical Solution</h4>
                                    <ul className="space-y-2">
                                        {currentProposal.proposed_solution.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                    <Clock className="w-4 h-4" />
                                    Estimated Timeline: {currentProposal.timeline_weeks} Weeks
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
                                <button
                                    onClick={() => handleSaveClient('pitched')}
                                    className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors"
                                >
                                    Save to Pipeline
                                </button>
                                <button
                                    onClick={() => handleSaveClient('won')}
                                    className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <DollarSign className="w-4 h-4" />
                                    Mark as WON!
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-12">
                            <Briefcase className="w-16 h-16 mb-4 text-gray-200" />
                            <p className="text-lg font-medium text-gray-500">No active proposal</p>
                            <p className="text-sm max-w-xs mt-2">Fill out the form to generate a professional, high-ticket technical proposal using AI.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pipeline List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                        <Building className="w-5 h-5 text-gray-400" />
                        Client Pipeline
                    </h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {clients.length === 0 ? (
                        <p className="p-8 text-center text-gray-500">Your pipeline is empty. Start pitching!</p>
                    ) : (
                        clients.map(client => (
                            <div key={client.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                <div>
                                    <h4 className="font-bold text-gray-900">{client.name}</h4>
                                    <p className="text-sm text-gray-500">{client.proposal?.title}</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{formatCurrency(client.proposal?.price_quote || 0)}</p>
                                        <p className="text-xs text-gray-500">{new Date(client.date).toLocaleDateString()}</p>
                                    </div>
                                    {client.status === 'won' ? (
                                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
                                            <CheckCircle className="w-3 h-3" /> WON
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => markAsWon(client.id)}
                                            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            Mark Won
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Agency;
