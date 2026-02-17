import React, { useState, useEffect } from 'react';
import { DollarSign, Activity, Building, PieChart, ArrowUpRight, TrendingUp, Zap, Crosshair, Play, Pause, Target, CreditCard, History } from 'lucide-react';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';

const AdminWealth = () => {
  const [stats, setStats] = useState(null);
  const [recentPledges, setRecentPledges] = useState([]);
  const [features, setFeatures] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [transferred, setTransferred] = useState(false);
  const [botActive, setBotActive] = useState(false);
  const [marketAction, setMarketAction] = useState(null);

  const fetchData = async () => {
    try {
      const [statsRes, pledgesRes, featuresRes, payoutsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/pledges/recent'),
          fetch('/api/features'),
          fetch('/api/admin/payouts')
      ]);
      const statsJson = await statsRes.json();
      const pledgesJson = await pledgesRes.json();
      const featuresJson = await featuresRes.json();
      const payoutsJson = await payoutsRes.json();

      setStats(statsJson);
      setRecentPledges(pledgesJson.data || []);
      setFeatures(featuresJson.data || []);
      setPayouts(payoutsJson.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Market Maker Bot
  useEffect(() => {
      let interval;
      if (botActive) {
          interval = setInterval(() => {
              handleInjectLiquidity(true);
          }, 3000); // Trade every 3 seconds
      }
      return () => clearInterval(interval);
  }, [botActive]);

  const handleInjectLiquidity = async (silent = false) => {
      try {
          const res = await fetch('/api/market/simulate', { method: 'POST' });
          if (res.ok) {
              const json = await res.json();
              setMarketAction(json.data);
              fetchData(); // Refresh data
              if (!silent) {
                  confetti({
                      particleCount: 50,
                      spread: 60,
                      origin: { x: 0.9, y: 0.1 },
                      colors: ['#10B981', '#34D399']
                  });
              }
          }
      } catch (err) {
          console.error("Market Maker failed", err);
      }
  };

  const handleCashOut = async () => {
    const amount = stats?.available_balance || 0;
    if (amount <= 0) return;

    setProcessing(true);
    try {
        const res = await fetch('/api/admin/payout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        });

        if (res.ok) {
            setTransferred(true);
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            await fetchData();
            setTimeout(() => {
                setTransferred(false);
            }, 3000);
        }
    } catch (err) {
        alert("Transfer failed");
    } finally {
        setProcessing(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500 font-mono">Loading Financial Data...</div>;

  const revenue = stats?.available_balance || 0;
  const totalRevenue = stats?.total_revenue || 0;
  const totalWithdrawn = stats?.total_withdrawn || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <Building className="w-8 h-8 text-gray-700" />
                Executive Dashboard
            </h1>
            <p className="mt-2 text-gray-500 font-medium">Real-time revenue monitoring and clearing house.</p>
          </div>
          <div className="text-right">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">System Status</span>
              <span className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  ONLINE
              </span>
          </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Revenue Card (Dark Theme) */}
        <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign className="w-24 h-24" />
          </div>
          <div className="relative z-10">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Liquid Assets (Available)</p>
              <h2 className="text-4xl font-mono font-bold text-emerald-400">
                ${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleCashOut}
                    disabled={processing || revenue <= 0 || transferred}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                  >
                      {processing ? 'Processing...' : transferred ? 'Funds Transferred' : 'Payout to Bank'}
                      {!processing && !transferred && <ArrowUpRight className="w-3 h-3" />}
                  </button>
              </div>
          </div>
        </div>

        {/* Volume Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mb-2">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Lifetime Revenue</p>
            <h2 className="text-3xl font-bold text-gray-900">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <p className="text-xs text-gray-400">Total fees + seizures collected.</p>
        </div>

        {/* Withdrawn Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mb-2">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Withdrawn</p>
            <h2 className="text-3xl font-bold text-gray-900">
              ${totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
          </div>
           <p className="text-xs text-gray-400">Paid out to bank account.</p>
        </div>
      </div>

      {/* Insider & Market Maker Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Market Maker Controls */}
          <div className="bg-gray-800 rounded-xl p-6 text-white border border-gray-700 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
                      <Zap className="w-5 h-5" />
                      Market Maker Algo
                  </h3>
                  <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${botActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                      <span className="text-xs font-mono uppercase text-gray-400">{botActive ? 'HFT ACTIVE' : 'OFFLINE'}</span>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                 <button
                    onClick={() => handleInjectLiquidity(false)}
                    className="bg-gray-700 hover:bg-gray-600 border border-gray-600 p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-all hover:scale-105"
                 >
                     <Activity className="w-6 h-6 text-blue-400" />
                     <span className="font-bold text-sm">Inject Liquidity</span>
                 </button>
                 <button
                    onClick={() => setBotActive(!botActive)}
                    className={`${botActive ? 'bg-red-900/50 border-red-500/50' : 'bg-emerald-900/50 border-emerald-500/50'} border p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-all hover:scale-105`}
                 >
                     {botActive ? <Pause className="w-6 h-6 text-red-400" /> : <Play className="w-6 h-6 text-emerald-400" />}
                     <span className="font-bold text-sm">{botActive ? 'Stop Bot' : 'Start Auto-Bot'}</span>
                 </button>
              </div>

              <div className="bg-black/50 rounded-lg p-4 font-mono text-xs h-32 overflow-hidden relative">
                  <div className="absolute top-2 right-2 text-gray-600">TERMINAL_OUTPUT</div>
                  {marketAction ? (
                      <div className="space-y-1 animate-fade-in">
                          <p className="text-emerald-400">&gt; ORDER EXECUTED</p>
                          <p className="text-gray-300">ASSET: {marketAction.feature}</p>
                          <p className="text-gray-300">CAPITAL: ${marketAction.amount_invested}</p>
                          <p className="text-gray-300">VOTES: +{marketAction.votes_added}</p>
                          <p className="text-gray-500">------------------</p>
                      </div>
                  ) : (
                      <p className="text-gray-500">&gt; Waiting for orders...</p>
                  )}
              </div>
          </div>

          {/* Insider Trading / Undervalued Assets */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 mb-6">
                  <Crosshair className="w-5 h-5 text-red-600" />
                  Insider Analytics
              </h3>
              <p className="text-sm text-gray-500 mb-4">Top undervalued assets. High demand (Votes), low capitalization.</p>

              <div className="space-y-3">
                  {features
                      .filter(f => f.votes > 0)
                      .map(f => ({ ...f, ratio: f.votes / ((f.pledged_amount || 0) + 1) }))
                      .sort((a, b) => b.ratio - a.ratio)
                      .slice(0, 3)
                      .map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-gray-400">#{idx + 1}</span>
                              <div>
                                  <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                                  <p className="text-xs text-gray-500">{item.votes} Votes / ${item.pledged_amount || 0}</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <span className="block text-xs font-bold text-emerald-600 uppercase tracking-wider">Strong Buy</span>
                              <span className="text-xs text-gray-400">Ratio: {item.ratio.toFixed(1)}</span>
                          </div>
                      </div>
                  ))}
                  {features.length === 0 && <p className="text-gray-400 text-sm">Not enough market data.</p>}
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-gray-500" />
                    Market Inflows
                </h3>
                <span className="text-xs font-mono text-gray-400">LIVE FEED</span>
            </div>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Asset</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {recentPledges.map((pledge) => (
                            <tr key={pledge.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-emerald-600 font-mono font-bold">+${pledge.amount.toFixed(2)}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{pledge.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 font-mono">
                                    {pledge.created_at ? format(new Date(pledge.created_at), 'HH:mm:ss') : '-'}
                                </td>
                            </tr>
                        ))}
                        {recentPledges.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-gray-500 text-sm">
                                    No recent transactions found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Payout History Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-500" />
                    Withdrawal History
                </h3>
                <span className="text-xs font-mono text-gray-400">LEDGER</span>
            </div>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {payouts.map((payout) => (
                            <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                    {payout.created_at ? format(new Date(payout.created_at), 'MMM dd, HH:mm') : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className="text-red-600 font-mono font-bold">-${payout.amount.toFixed(2)}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Processed
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {payouts.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-gray-500 text-sm">
                                    No withdrawals yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWealth;
