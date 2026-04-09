import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Layers, Briefcase, Zap } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export default function ETFDashboard() {
    const [etfs, setEtfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [investAmount, setInvestAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        fetchEtfs();
    }, []);

    const fetchEtfs = async () => {
        try {
            const res = await fetch('/api/etfs');
            const json = await res.json();
            setEtfs(json.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching ETFs:', error);
            setLoading(false);
        }
    };

    const handleInvest = async (category) => {
        const amount = parseFloat(investAmount);
        if (isNaN(amount) || amount <= 0) return alert('Enter a valid amount');

        // Deduct from local cash
        const currentCash = parseFloat(localStorage.getItem('cash_balance') || '0');
        if (amount > currentCash) {
            alert('Insufficient funds in portfolio.');
            return;
        }

        try {
            const res = await fetch('/api/etfs/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, amount, is_dark_pool: false })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('cash_balance', (currentCash - amount).toFixed(2));

                // Add ETF to portfolio locally
                let portfolio = JSON.parse(localStorage.getItem('my_portfolio') || '[]');
                const etfId = `etf-${category}`;
                const existing = portfolio.find(p => p.id === etfId);
                const etfData = etfs.find(e => e.category === category);

                if (existing) {
                    existing.shares += amount; // abstract shares
                } else {
                    portfolio.push({
                        id: etfId,
                        title: `${category.toUpperCase()} Index Fund`,
                        ticker: etfData?.ticker || 'IDX',
                        shares: amount,
                        avgPrice: 1.0, // Abstract price
                        type: 'etf'
                    });
                }
                localStorage.setItem('my_portfolio', JSON.stringify(portfolio));

                triggerHaptic('success');
                alert(`Successfully invested $${amount} into ${category} Index!`);
                setInvestAmount('');
                setSelectedCategory(null);
                fetchEtfs(); // refresh data
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Failed to invest in ETF');
        }
    };

    if (loading) return null;

    return (
        <div className="bg-gray-900 border-b border-gray-800 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Layers className="text-indigo-400 w-5 h-5" />
                        <h2 className="text-xl font-bold text-white">Market Indexes (ETFs)</h2>
                    </div>
                    <span className="text-xs font-mono text-gray-500">DIVERSIFY YOUR PORTFOLIO</span>
                </div>

                {etfs.length === 0 ? (
                    <div className="text-gray-400 text-sm py-4">No active features available to form market indexes yet.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {etfs.map(etf => (
                        <div key={etf.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-indigo-500/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="text-lg font-bold font-mono text-white">${etf.ticker}</div>
                                    <div className="text-xs text-gray-400">{etf.name}</div>
                                </div>
                                <div className={`flex items-center text-sm ${etf.day_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {etf.day_change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                    {Math.abs(etf.day_change)}%
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <div className="text-xs text-gray-500">Index Price</div>
                                    <div className="text-xl font-bold text-white">${etf.current_price.toFixed(2)}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500">AUM</div>
                                    <div className="text-sm font-mono text-gray-300">${etf.volume.toFixed(2)}</div>
                                </div>
                            </div>

                            {selectedCategory === etf.category ? (
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Amount $"
                                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                                        value={investAmount}
                                        onChange={e => setInvestAmount(e.target.value)}
                                    />
                                    <button
                                        onClick={() => handleInvest(etf.category)}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-sm font-bold"
                                    >
                                        Buy
                                    </button>
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className="text-gray-400 hover:text-white px-2"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setSelectedCategory(etf.category)}
                                    className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-bold transition-colors flex justify-center items-center gap-2"
                                >
                                    <Briefcase className="w-4 h-4" /> Invest in Index
                                </button>
                            )}
                        </div>
                    ))}
                    </div>
                )}
            </div>
        </div>
    );
}
