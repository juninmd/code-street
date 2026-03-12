import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';
import { triggerHaptic } from '../utils/haptics';

const OptionsChain = ({ featureId, currentPrice }) => {
    const [isBuying, setIsBuying] = useState(false);

    // Generate some deterministic options based on current price
    const basePrice = currentPrice || 1.00;
    const options = [
        { type: 'call', strike: basePrice * 1.1, premium: (basePrice * 0.1).toFixed(2) },
        { type: 'call', strike: basePrice * 1.5, premium: (basePrice * 0.05).toFixed(2) },
        { type: 'put', strike: basePrice * 0.9, premium: (basePrice * 0.15).toFixed(2) },
        { type: 'put', strike: basePrice * 0.5, premium: (basePrice * 0.05).toFixed(2) },
    ];

    const handleBuy = async (option) => {
        setIsBuying(true);
        triggerHaptic('notification');

        const currentCash = parseFloat(localStorage.getItem('cash_balance') || '0');
        const totalCost = parseFloat(option.premium) * 100; // 1 contract = 100 shares

        if (currentCash < totalCost) {
            alert(`Insufficient funds. You need $${totalCost.toFixed(2)} to buy this option contract.`);
            setIsBuying(false);
            return;
        }

        try {
            // Options expire in 30 days
            const expiration = new Date();
            expiration.setDate(expiration.getDate() + 30);

            const res = await fetch('/api/options/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    feature_id: featureId,
                    type: option.type,
                    strike_price: option.strike,
                    expiration_date: expiration.toISOString(),
                    premium_paid: parseFloat(option.premium)
                })
            });

            if (res.ok) {
                // Deduct cost from cash balance
                localStorage.setItem('cash_balance', (currentCash - totalCost).toString());

                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: option.type === 'call' ? ['#10B981', '#34D399'] : ['#EF4444', '#F87171']
                });
                triggerHaptic('success');
                alert(`Successfully bought ${option.type.toUpperCase()} option at strike $${option.strike.toFixed(2)} for $${totalCost.toFixed(2)}!`);

                // Dispatch event to update portfolio if they navigate there
                window.dispatchEvent(new Event('storage'));
            } else {
                const err = await res.json();
                alert(`Error: ${err.error}`);
            }
        } catch (err) {
            console.error("Error buying option:", err);
            alert("Failed to buy option");
        } finally {
            setIsBuying(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    Options Chain
                </h3>
                <span className="text-xs font-mono text-gray-500">Exp: 30 Days</span>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Strike Price</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Premium</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total Cost</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {options.map((opt, idx) => {
                            const totalCost = parseFloat(opt.premium) * 100;
                            return (
                            <tr key={`${opt.type}-${opt.strike}`} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                        opt.type === 'call' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {opt.type === 'call' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                        {opt.type.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-gray-900">
                                    ${opt.strike.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-gray-500">
                                    ${opt.premium}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-gray-900 font-bold">
                                    ${totalCost.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button
                                        onClick={() => handleBuy(opt)}
                                        disabled={isBuying || parseFloat(opt.premium) <= 0}
                                        className={`px-3 py-1 rounded text-xs font-bold text-white shadow-sm transition-colors ${
                                            opt.type === 'call'
                                                ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300'
                                                : 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'
                                        }`}
                                    >
                                        Buy to Open
                                    </button>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 text-center">
                *Options trading carries significant risk. Premiums are subject to a 5% platform fee.
            </div>
        </div>
    );
};

export default OptionsChain;