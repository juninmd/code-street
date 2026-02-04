import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Activity, Wallet, PieChart } from 'lucide-react';
import confetti from 'canvas-confetti';

const AdminWealth = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const json = await res.json();
        setStats(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleCashOut = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10B981', '#FFD700']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10B981', '#FFD700']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  if (loading) return <div className="p-8 text-center">Loading Wealth Data...</div>;

  const revenue = stats?.platform_revenue || 0;
  const volume = (stats?.total_payout || 0) + (stats?.active_bounty || 0);
  const projectedArr = revenue * 12; // Simple extrapolation

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Admin Wealth Dashboard</h1>
        <p className="mt-2 text-gray-600">Monitor your platform's financial performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Main Revenue Card */}
        <div className="bg-gradient-to-br from-emerald-900 to-emerald-700 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-800/50 rounded-lg">
              <Wallet className="w-8 h-8 text-emerald-300" />
            </div>
            <span className="bg-emerald-500/20 text-emerald-100 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              Net Profit
            </span>
          </div>
          <div className="mb-2">
            <p className="text-emerald-200 text-sm font-medium uppercase tracking-wider">Total Platform Revenue</p>
            <h2 className="text-5xl font-extrabold tracking-tight">
              ${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="mt-4 pt-4 border-t border-emerald-600/50 flex items-center text-emerald-100 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12% from last week</span>
          </div>
        </div>

        {/* Volume Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mb-2">
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Market Volume</p>
            <h2 className="text-3xl font-bold text-gray-900">
              ${volume.toLocaleString()}
            </h2>
          </div>
          <p className="text-sm text-gray-500">Gross Merchandise Value (GMV)</p>
        </div>

        {/* Projections Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <PieChart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mb-2">
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Projected ARR</p>
            <h2 className="text-3xl font-bold text-gray-900">
              ${projectedArr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
          </div>
           <p className="text-sm text-gray-500">Based on current monthly velocity</p>
        </div>
      </div>

      {/* Action Area */}
      <div className="bg-gray-900 rounded-2xl p-8 text-center relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to withdraw funds?</h3>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">Transfer your platform fees to your connected bank account. (Simulation)</p>
            <button
                onClick={handleCashOut}
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-bold rounded-full shadow-sm text-emerald-900 bg-emerald-400 hover:bg-emerald-300 focus:outline-none transform hover:-translate-y-1 transition-all"
            >
                <DollarSign className="w-6 h-6 mr-2" />
                CASH OUT NOW
            </button>
         </div>
      </div>
    </div>
  );
};

export default AdminWealth;
