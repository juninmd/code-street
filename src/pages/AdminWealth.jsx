import React, { useState, useEffect } from 'react';
import { DollarSign, Activity, Building, PieChart, ArrowUpRight, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';

const AdminWealth = () => {
  const [stats, setStats] = useState(null);
  const [recentPledges, setRecentPledges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [transferred, setTransferred] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, pledgesRes] = await Promise.all([
            fetch('/api/stats'),
            fetch('/api/pledges/recent')
        ]);
        const statsJson = await statsRes.json();
        const pledgesJson = await pledgesRes.json();

        setStats(statsJson);
        setRecentPledges(pledgesJson.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCashOut = () => {
    if (stats?.platform_revenue <= 0) return;
    setProcessing(true);
    setTimeout(() => {
        setProcessing(false);
        setTransferred(true);
        setStats(prev => ({ ...prev, platform_revenue: 0 }));
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }, 2000);
  };

  if (loading) return <div className="p-12 text-center text-gray-500 font-mono">Loading Financial Data...</div>;

  const revenue = stats?.platform_revenue || 0;
  const volume = (stats?.total_payout || 0) + (stats?.active_bounty || 0);

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
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Net Platform Revenue (5%)</p>
              <h2 className="text-4xl font-mono font-bold text-emerald-400">
                ${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleCashOut}
                    disabled={processing || revenue <= 0 || transferred}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                  >
                      {processing ? 'Processing...' : transferred ? 'Transferred' : 'Payout to Bank'}
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
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Volume (GMV)</p>
            <h2 className="text-3xl font-bold text-gray-900">
              ${volume.toLocaleString()}
            </h2>
          </div>
          <p className="text-xs text-gray-400">All-time pledge volume processed.</p>
        </div>

        {/* Active Deals */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <PieChart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mb-2">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Bounties</p>
            <h2 className="text-3xl font-bold text-gray-900">
              ${(stats?.active_bounty || 0).toLocaleString()}
            </h2>
          </div>
           <p className="text-xs text-gray-400">Currently held in escrow.</p>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-gray-500" />
                  Recent Inflows
              </h3>
              <span className="text-xs font-mono text-gray-400">LIVE FEED</span>
          </div>
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                      <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Asset (Feature)</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
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
                                  <div className="text-xs text-gray-500">ID: #{pledge.feature_id}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      Captured
                                  </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 font-mono">
                                  {pledge.created_at ? format(new Date(pledge.created_at), 'HH:mm:ss') : '-'}
                              </td>
                          </tr>
                      ))}
                      {recentPledges.length === 0 && (
                          <tr>
                              <td colSpan="4" className="px-6 py-12 text-center text-gray-500 text-sm">
                                  No recent transactions found.
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default AdminWealth;
