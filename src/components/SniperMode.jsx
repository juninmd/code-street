import React, { useEffect, useState } from 'react';
import { Target, Crosshair, TrendingUp, X } from 'lucide-react';

const SniperMode = ({ features, onClose }) => {
  const [target, setTarget] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [isPro, setIsPro] = useState(localStorage.getItem('codestreet_pro') === 'true');
  const [buyingPro, setBuyingPro] = useState(false);

  useEffect(() => {
    if (!isPro) return;
    // Find the "best" target: Highest Vote/Price ratio (Value for Money)
    // Filter out 0 price items to avoid division by zero
    const candidates = features.filter(f => (f.pledged_amount || 0) > 0);

    if (candidates.length === 0) {
        // Fallback to highest votes if no money pledged yet
        const top = [...features].sort((a,b) => b.votes - a.votes)[0];
        setTimeout(() => {
            setTarget(top);
            setScanning(false);
        }, 2000);
        return;
    }

    const sorted = [...candidates].sort((a, b) => {
        const ratioA = a.votes / (a.pledged_amount || 1);
        const ratioB = b.votes / (b.pledged_amount || 1);
        return ratioB - ratioA;
    });

    const best = sorted[0];

    setTimeout(() => {
        setTarget(best);
        setScanning(false);
    }, 2000); // Dramatic pause
  }, [features]);

  const handleBuyPro = async () => {
    setBuyingPro(true);
    try {
      const res = await fetch('/api/market/pro-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        localStorage.setItem('codestreet_pro', 'true');
        setIsPro(true);
        // Trigger a re-render of useEffect
        setTarget(null);
        setScanning(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBuyingPro(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in font-mono">
      <div className="absolute top-4 right-4 z-50">
          <button onClick={onClose} className="text-red-500 hover:text-red-400">
              <X className="w-8 h-8" />
          </button>
      </div>

      {!isPro ? (
        <div className="max-w-md w-full text-center relative z-10 bg-gray-900 border-2 border-emerald-500 p-8 rounded-xl shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-bounce-in">
            <h2 className="text-3xl font-black text-emerald-500 mb-4">CodeStreet PRO</h2>
            <p className="text-gray-300 mb-6 font-sans">Sniper Mode is a premium feature. Upgrade to CodeStreet PRO to instantly identify undervalued assets with high momentum before the rest of the market.</p>
            <div className="text-5xl font-bold text-white mb-8 font-sans">$99<span className="text-lg text-gray-500">/mo</span></div>
            <button
                onClick={handleBuyPro}
                disabled={buyingPro}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-lg shadow-lg transform transition-all active:scale-95 disabled:opacity-50"
            >
                {buyingPro ? 'Processing...' : 'Upgrade Now'}
            </button>
        </div>
      ) : (
          <>

      {/* Crosshair Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-0 w-full h-px bg-red-500"></div>
          <div className="absolute left-1/2 top-0 h-full w-px bg-red-500"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-red-500 rounded-full"></div>
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
          {scanning ? (
              <div className="space-y-4">
                  <Target className="w-16 h-16 text-red-500 animate-ping mx-auto" />
                  <h2 className="text-2xl font-bold text-red-500 tracking-widest animate-pulse">SCANNING MARKET DATA...</h2>
                  <p className="text-red-400 text-sm">Identifying undervalued assets with high momentum.</p>
              </div>
          ) : target ? (
              <div className="bg-gray-900 border-2 border-red-500 p-8 rounded-xl shadow-[0_0_50px_rgba(239,68,68,0.3)] animate-bounce-in">
                  <div className="inline-flex items-center gap-2 bg-red-500/20 px-4 py-1 rounded-full text-red-500 font-bold text-xs uppercase tracking-widest mb-6 border border-red-500/50">
                      <Crosshair className="w-4 h-4" />
                      Target Acquired
                  </div>

                  <h1 className="text-4xl font-black text-white mb-2">{target.title}</h1>
                  <p className="text-gray-400 mb-8 max-w-lg mx-auto">{target.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-gray-800 p-4 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase">Current Momentum</p>
                          <p className="text-2xl font-bold text-emerald-400 flex items-center justify-center gap-2">
                              <TrendingUp className="w-5 h-5" />
                              {target.votes} Votes
                          </p>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase">Entry Price</p>
                          <p className="text-2xl font-bold text-white">${(target.current_price || 1).toFixed(2)}</p>
                      </div>
                  </div>

                  <a
                    href={`/feature/${target.id}`}
                    className="inline-block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg text-lg uppercase tracking-wider transition-all hover:scale-105 shadow-lg shadow-red-900/50"
                  >
                      Execute Trade
                  </a>
              </div>
          ) : (
             <div className="text-red-500">No targets found. Market is dormant.</div>
          )}
      </div>
      </>
      )}
    </div>
  );
};

export default SniperMode;
