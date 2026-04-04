import React, { useState, useEffect } from 'react';
import { Terminal, Lock, Unlock, X, Skull, AlertTriangle, ShieldAlert } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

const HackerLeakModal = ({ feature, onClose }) => {
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cashBalance, setCashBalance] = useState(0);
  const INTEL_COST = 25.00;

  useEffect(() => {
    const balance = parseFloat(localStorage.getItem('cash_balance') || '0');
    setCashBalance(balance);
  }, []);

  const generateIntel = async () => {
    try {
      const response = await fetch('/api/market/hacker-leak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: feature.title,
          ticker: feature.ticker
        })
      });
      if (response.ok) {
        const data = await response.json();
        return data.intel;
      }
    } catch (e) {
      console.error('Failed to fetch intel:', e);
    }

    // Fallback if network fails
    const hints = [
      `[DECRYPTED_COMMS]: Whale wallets accumulating $${feature.ticker || 'ASSET'} in dark pools. Upward volatility expected.`,
      `[LEAKED_SLACK]: Dev team struggling with $${feature.ticker || 'ASSET'} implementation. Delivery likely delayed. Short interest rising.`,
      `[INSIDER_DUMP]: Major stakeholder preparing to offload shares. Support levels at risk.`
    ];
    return hints[Math.floor(Math.random() * hints.length)];
  };

  const handlePurchase = async () => {
    if (cashBalance < INTEL_COST) {
      setError("INSUFFICIENT FUNDS. ACQUISITION FAILED.");
      triggerHaptic('error');
      return;
    }

    setLoading(true);
    setError(null);
    triggerHaptic('heavy');

    // Deduct cash
    const newBalance = cashBalance - INTEL_COST;
    localStorage.setItem('cash_balance', newBalance.toString());
    setCashBalance(newBalance);

    // We keep a small minimum timeout just for the UI simulation effect,
    // but we also await the real API call.
    const start = Date.now();
    const newIntel = await generateIntel();
    const elapsed = Date.now() - start;
    const remainingTime = Math.max(0, 2500 - elapsed);

    setTimeout(() => {
      setLoading(false);
      setIntel(newIntel);
      triggerHaptic('success');
    }, remainingTime);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md font-mono animate-fade-in">
      <div className="bg-black rounded-lg border border-green-500/30 max-w-md w-full overflow-hidden shadow-[0_0_30px_rgba(0,255,0,0.15)] relative">
        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-20"></div>

        {/* Header */}
        <div className="bg-green-950/50 px-4 py-3 border-b border-green-500/30 flex justify-between items-center relative z-20">
          <h3 className="text-sm font-bold text-green-400 flex items-center gap-2">
            <Skull className="w-4 h-4 text-green-500" />
            DARK_WEB_INTEL_MARKET
          </h3>
          <button onClick={onClose} className="text-green-600 hover:text-green-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 relative z-20 space-y-6">
          {!intel && !loading && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-start gap-3 text-green-500 bg-green-950/30 p-3 rounded border border-green-900">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  WARNING: Purchasing illicit market intel violates SEC guidelines. Use this information at your own risk. Unverified data.
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-green-600 uppercase">Target Asset</p>
                <p className="text-sm text-green-400 font-bold truncate">{feature.title}</p>
              </div>

              <div className="flex justify-between items-center border-t border-b border-green-900/50 py-3">
                <div>
                  <p className="text-xs text-green-600 uppercase">Intel Cost</p>
                  <p className="text-lg text-green-400 font-bold">${INTEL_COST.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-600 uppercase">Available Funds</p>
                  <p className={`text-sm font-bold ${cashBalance >= INTEL_COST ? 'text-green-400' : 'text-red-500'}`}>
                    ${cashBalance.toFixed(2)}
                  </p>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-xs font-bold flex items-center gap-2 animate-pulse">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                onClick={handlePurchase}
                className="w-full py-3 bg-green-900/50 hover:bg-green-800/80 text-green-400 border border-green-500/50 rounded text-sm font-bold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(0,255,0,0.3)]"
              >
                <Lock className="w-4 h-4" />
                ACQUIRE DECRYPTED INTEL
              </button>
            </div>
          )}

          {loading && (
            <div className="py-8 text-center space-y-4">
              <Terminal className="w-8 h-8 text-green-500 mx-auto animate-pulse" />
              <div className="text-green-500 text-xs space-y-1 text-left max-w-[200px] mx-auto overflow-hidden">
                <p className="animate-typing whitespace-nowrap overflow-hidden">&gt; INITIATING BRUTE FORCE...</p>
                <p className="animate-typing whitespace-nowrap overflow-hidden animation-delay-500">&gt; BYPASSING FIREWALLS...</p>
                <p className="animate-typing whitespace-nowrap overflow-hidden animation-delay-1000">&gt; DOWNLOADING LOGS...</p>
                <p className="animate-typing whitespace-nowrap overflow-hidden animation-delay-1500 text-green-400 font-bold">&gt; DECRYPTING PAYLOAD...</p>
              </div>
            </div>
          )}

          {intel && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-2">
                <Unlock className="w-8 h-8 text-green-400 mx-auto mb-2 drop-shadow-[0_0_8px_rgba(0,255,0,0.8)]" />
                <h4 className="text-green-400 font-bold text-sm tracking-widest">INTEL DECRYPTED</h4>
              </div>

              <div className="bg-black border border-green-500 p-4 rounded relative overflow-hidden">
                {/* Glitch Overlay */}
                <div className="absolute inset-0 bg-green-500/5 mix-blend-overlay animate-pulse pointer-events-none"></div>

                <p className="text-green-400 text-sm leading-relaxed typing-effect">
                  {intel}
                </p>
              </div>

              <div className="text-xs text-green-600 text-center">
                <p>Connection Terminated.</p>
                <p>No logs preserved.</p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2 bg-transparent hover:bg-green-950/50 text-green-500 border border-green-900 rounded text-xs font-bold transition-colors"
              >
                CLOSE TERMINAL
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-1000 { animation-delay: 1000ms; }
        .animation-delay-1500 { animation-delay: 1500ms; }
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        .animate-typing {
          display: inline-block;
          animation: typing 0.5s steps(20, end) forwards;
        }
        .typing-effect {
          overflow: hidden;
          border-right: .15em solid #4ade80;
          white-space: normal;
          margin: 0 auto;
          animation: typing-text 2s steps(40, end), blink-caret .75s step-end infinite;
        }
        @keyframes typing-text {
          from { width: 0 }
          to { width: 100% }
        }
        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: #4ade80; }
        }
      `}</style>
    </div>
  );
};

export default HackerLeakModal;
