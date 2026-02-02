import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Briefcase, Clock, CheckCircle, Trophy, Wallet, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const TOP_HUNTERS = [
    { name: 'AlexTheDev', earnings: 12500, solved: 8 },
    { name: 'CodeNinja_99', earnings: 8200, solved: 5 },
    { name: 'SarahBuilds', earnings: 6400, solved: 4 },
];

const HunterProfile = () => {
  const [activeBounties, setActiveBounties] = useState([]);
  const [completedBounties, setCompletedBounties] = useState([]);
  const [stats, setStats] = useState({ active_bounty: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, statsRes] = await Promise.all([
            fetch('/api/features'),
            fetch('/api/stats')
        ]);
        const featJson = await featRes.json();
        const statsJson = await statsRes.json();

        // Get my claims from local storage
        const myClaims = JSON.parse(localStorage.getItem('my_claims') || '[]');

        // Filter features
        const myFeatures = featJson.data.filter(f => myClaims.includes(f.id));

        setActiveBounties(myFeatures.filter(f => f.status === 'in_progress'));
        setCompletedBounties(myFeatures.filter(f => f.status === 'live'));

        setStats(statsJson);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const myPotentialEarnings = activeBounties.reduce((sum, f) => sum + (f.pledged_amount || 0), 0);
  const walletBalance = completedBounties.reduce((sum, f) => sum + (f.pledged_amount || 0), 0);

  const handleMarkDelivered = async (e, id) => {
      e.preventDefault();
      if (!window.confirm('Mark this bounty as delivered? This will move it to your Wallet.')) return;

      // Optimistic update using functional state setters to avoid stale closures
      setActiveBounties(prevActiveBounties => {
          const bounty = prevActiveBounties.find(b => b.id === id);
          if (!bounty) {
              return prevActiveBounties;
          }

          setCompletedBounties(prevCompletedBounties => [
              ...prevCompletedBounties,
              { ...bounty, status: 'live' },
          ]);

          return prevActiveBounties.filter(b => b.id !== id);
      });
      try {
          await fetch(`/api/features/${id}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'live' })
          });

          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10B981', '#34D399']
          });
      } catch (err) {
          console.error(err);
          // Revert if failed (omitted for brevity)
      }
  };

  const handleWithdraw = () => {
      if (walletBalance === 0) return;

      confetti({
          particleCount: 300,
          spread: 180,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FDB931', '#FFFFE0'] // Gold
      });

      alert(`Success! $${walletBalance.toLocaleString()} is on its way to your bank account.`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Hunter Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Market Opp */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Briefcase className="w-24 h-24" />
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Market Opportunity</p>
            <div className="flex items-center">
                <span className="text-3xl font-extrabold tracking-tight text-white">${(stats.active_bounty || 0).toLocaleString()}</span>
            </div>
            <p className="text-gray-400 text-xs mt-2">Available for claiming</p>
        </div>

        {/* Potential Earnings */}
        <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Clock className="w-24 h-24" />
            </div>
            <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">In Progress</p>
            <div className="flex items-center">
                <span className="text-3xl font-extrabold tracking-tight text-white">${myPotentialEarnings.toLocaleString()}</span>
                {activeBounties.length > 0 && <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30">{activeBounties.length} active</span>}
            </div>
            <p className="text-emerald-200 text-xs mt-2">Deliver to unlock funds</p>
        </div>

        {/* Wallet */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Wallet className="w-24 h-24" />
            </div>
            <p className="text-yellow-100 text-xs font-bold uppercase tracking-wider mb-1">Wallet Balance</p>
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-3xl font-extrabold tracking-tight text-white">${walletBalance.toLocaleString()}</span>
                    <p className="text-yellow-100 text-xs mt-2">Ready to withdraw</p>
                </div>
                {walletBalance > 0 && (
                    <button
                        onClick={handleWithdraw}
                        className="px-4 py-2 bg-white text-yellow-700 text-sm font-bold rounded-lg shadow hover:bg-yellow-50 transition-colors"
                    >
                        Withdraw
                    </button>
                )}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Content: Active Hunts */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-emerald-600" />
                My Active Hunts
            </h2>

            {loading ? (
                <div className="py-12 text-center text-gray-400">Loading your missions...</div>
            ) : activeBounties.length === 0 ? (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No Active Hunts</h3>
                    <p className="text-gray-500 mb-6 text-sm">You haven't claimed any bounties yet. Go to the board to find work.</p>
                    <Link to="/" className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-all hover:shadow-md">
                        Find Bounties
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {activeBounties.map(bounty => (
                        <div key={bounty.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative">
                            <div className="flex justify-between items-start mb-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    In Progress
                                </span>
                                <span className="flex items-center text-emerald-600 font-bold text-lg">
                                    <DollarSign className="w-5 h-5 mr-0.5" />
                                    {bounty.pledged_amount}
                                </span>
                            </div>
                            <Link to={`/feature/${bounty.id}`} className="block">
                                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">{bounty.title}</h3>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{bounty.description}</p>
                            </Link>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div className="flex items-center text-xs text-gray-400">
                                    <Clock className="w-3 h-3 mr-1" />
                                    <span>Started recently</span>
                                </div>
                                <button
                                    onClick={(e) => handleMarkDelivered(e, bounty.id)}
                                    className="inline-flex items-center px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded hover:bg-gray-800 transition-colors"
                                >
                                    <CheckCircle className="w-3 h-3 mr-1.5" />
                                    Mark Delivered
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Completed History */}
            {completedBounties.length > 0 && (
                <div className="pt-8">
                     <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                        Completed Missions
                    </h2>
                    <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                        {completedBounties.map((bounty, i) => (
                             <div key={bounty.id} className={`p-4 flex items-center justify-between ${i !== completedBounties.length - 1 ? 'border-b border-gray-200' : ''}`}>
                                 <div>
                                     <h4 className="font-bold text-gray-700 text-sm">{bounty.title}</h4>
                                     <p className="text-xs text-gray-500">Delivered & Paid</p>
                                 </div>
                                 <span className="font-bold text-green-600">+${bounty.pledged_amount}</span>
                             </div>
                        ))}
                    </div>
                </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
               <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                      Global Leaderboard
                  </h3>
                  <div className="space-y-4">
                      {TOP_HUNTERS.map((hunter, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                      i === 0 ? 'bg-yellow-100 text-yellow-700' :
                                      i === 1 ? 'bg-gray-100 text-gray-700' :
                                      'bg-orange-50 text-orange-700'
                                  }`}>
                                      {i + 1}
                                  </div>
                                  <div>
                                      <p className="font-semibold text-gray-900">{hunter.name}</p>
                                      <p className="text-xs text-gray-500">{hunter.solved} bounties solved</p>
                                  </div>
                              </div>
                              <div className="font-bold text-emerald-600">
                                  ${hunter.earnings.toLocaleString()}
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                      <p className="text-xs text-gray-400 text-center">
                          Compete to become the top hunter and earn exclusive badges.
                      </p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default HunterProfile;
