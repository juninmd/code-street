import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Briefcase, Clock, CheckCircle, Trophy } from 'lucide-react';

const TOP_HUNTERS = [
    { name: 'AlexTheDev', earnings: 12500, solved: 8 },
    { name: 'CodeNinja_99', earnings: 8200, solved: 5 },
    { name: 'SarahBuilds', earnings: 6400, solved: 4 },
];

const HunterProfile = () => {
  const [claimedBounties, setClaimedBounties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBounties = async () => {
      try {
        const res = await fetch('/api/features');
        const json = await res.json();
        // Filter for 'in_progress' to simulate claimed bounties
        const claimed = json.data.filter(f => f.status === 'in_progress');
        setClaimedBounties(claimed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBounties();
  }, []);

  const totalEarnings = claimedBounties.reduce((sum, f) => sum + (f.pledged_amount || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Hunter Dashboard</h1>

      {/* Earnings Card */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Potential Earnings</p>
          <div className="flex items-center">
              <span className="text-4xl font-extrabold tracking-tight text-white">${totalEarnings.toLocaleString()}</span>
              {claimedBounties.length > 0 && <span className="ml-3 px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30">Active</span>}
          </div>
          <p className="text-gray-400 text-sm mt-4">You have {claimedBounties.length} active bounties.</p>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
              Top Hunters
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
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mt-8">My Active Hunts</h2>

      {loading ? (
          <div className="py-12 text-center">Loading...</div>
      ) : claimedBounties.length === 0 ? (
          <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Active Hunts</h3>
              <p className="text-gray-500 mb-6">Go to the board and claim a bounty to start earning.</p>
              <Link to="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700">
                  Find Bounties
              </Link>
          </div>
      ) : (
          <div className="grid gap-4 sm:grid-cols-2">
              {claimedBounties.map(bounty => (
                  <Link key={bounty.id} to={`/feature/${bounty.id}`} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow block">
                      <div className="flex justify-between items-start mb-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              In Progress
                          </span>
                          <span className="flex items-center text-emerald-600 font-bold">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {bounty.pledged_amount}
                          </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{bounty.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4">{bounty.description}</p>
                      <div className="flex items-center text-xs text-gray-400">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>Started recently</span>
                      </div>
                  </Link>
              ))}
          </div>
      )}
    </div>
  );
};

export default HunterProfile;
