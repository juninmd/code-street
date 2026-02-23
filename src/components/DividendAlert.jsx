import React, { useState, useEffect } from 'react';
import { DollarSign, X, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getPortfolio } from '../utils/portfolio';
import { triggerHaptic } from '../utils/haptics';

const DividendAlert = () => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const checkDividends = async () => {
      try {
        const res = await fetch('/api/market/dividends');
        if (!res.ok) return;
        const json = await res.json();
        const latest = json.data && json.data.length > 0 ? json.data[0] : null;

        if (!latest) return;

        const lastSeen = localStorage.getItem('last_dividend_id');
        if (!lastSeen || parseInt(lastSeen) < latest.id) {
            // New Dividend Found!
            processDividend(latest);
        }
      } catch (err) {
        // Silent fail
      }
    };

    const processDividend = (dividend) => {
        const portfolio = getPortfolio();
        const totalShares = portfolio.reduce((acc, curr) => acc + (curr.shares || 0), 0);

        if (totalShares > 0) {
            const payout = totalShares * dividend.amount_per_share;

            // Update Cash Balance
            const currentCash = parseFloat(localStorage.getItem('cash_balance') || '0');
            const newCash = currentCash + payout;
            localStorage.setItem('cash_balance', newCash.toString());

            // Show Notification
            setNotification({
                amount: payout,
                perShare: dividend.amount_per_share
            });

            // Effects
            triggerHaptic('success');
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10B981', '#FFD700']
            });

            // Play sound (optional, skipping for simplicity)
        }

        // Mark as seen
        localStorage.setItem('last_dividend_id', dividend.id.toString());
    };

    // Check immediately then every 30s
    checkDividends();
    const interval = setInterval(checkDividends, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!notification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
      <div className="bg-white rounded-lg shadow-xl border-l-4 border-emerald-500 p-4 max-w-sm w-full flex items-start gap-3">
        <div className="bg-emerald-100 p-2 rounded-full">
            <DollarSign className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-900">Dividend Payout Received!</h4>
            <p className="text-xs text-gray-600 mt-1">
                You received <span className="font-bold text-emerald-600">${notification.amount.toFixed(2)}</span> based on your holdings.
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
                Rate: ${notification.perShare.toFixed(2)} / share
            </p>
        </div>
        <button
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-gray-600"
        >
            <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DividendAlert;
