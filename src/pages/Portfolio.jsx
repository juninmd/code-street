import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, PieChart, Activity, AlertTriangle, ArrowRight } from 'lucide-react';

const Portfolio = () => {
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState([]);
  const [stats, setStats] = useState({
      totalValue: 0,
      totalVotes: 0,
      projectedYield: 0,
      assetCount: 0
  });

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem('my_portfolio') || '[]');
        if (stored.length === 0) {
            setLoading(false);
            return;
        }

        const res = await fetch('/api/features');
        const json = await res.json();

        const myAssets = json.data.filter(f => stored.includes(f.id));

        // Calculate Stats
        const totalValue = myAssets.reduce((acc, curr) => acc + (curr.pledged_amount || 0), 0);
        const totalVotes = myAssets.reduce((acc, curr) => acc + curr.votes, 0);
        const assetCount = myAssets.length;

        // Fake "Yield" calculation: 20% of value if status is live, else 5%
        const projectedYield = myAssets.reduce((acc, curr) => {
            const rate = curr.status === 'live' ? 0.20 : 0.05;
            return acc + ((curr.pledged_amount || 0) * rate);
        }, 0);

        setPortfolio(myAssets);
        setStats({ totalValue, totalVotes, projectedYield, assetCount });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-[50vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
      );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <PieChart className="w-8 h-8 text-emerald-600" />
                Wealth Portfolio
            </h1>
            <p className="text-gray-500">Track your venture capital investments and feature assets.</p>
        </div>
        <div className="bg-emerald-50 text-emerald-800 px-4 py-2 rounded-full text-xs font-bold border border-emerald-100 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            MARKET STATUS: OPEN
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-xl p-6 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/30 transition-all"></div>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Asset Value</p>
              <h2 className="text-4xl font-bold flex items-baseline gap-1">
                  <span className="text-emerald-400">$</span>
                  {stats.totalValue.toLocaleString()}
              </h2>
              <div className="mt-4 flex items-center text-sm text-emerald-400">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+12.5% vs last week</span>
              </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Projected Yield (APY)</p>
              <h2 className="text-4xl font-bold text-gray-900 flex items-baseline gap-1">
                  <span className="text-gray-400">$</span>
                  {stats.projectedYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
               <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span>Based on delivery probability</span>
              </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
               <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Assets Held</p>
               <div className="flex justify-between items-end">
                   <h2 className="text-4xl font-bold text-gray-900">{stats.assetCount}</h2>
                   <div className="text-right">
                       <p className="text-xs text-gray-400 uppercase">Voting Power</p>
                       <p className="font-bold text-lg text-emerald-600">{stats.totalVotes}</p>
                   </div>
               </div>
          </div>
      </div>

      {/* Asset List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Your Holdings</h3>
          </div>

          {portfolio.length === 0 ? (
              <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <DollarSign className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Assets Found</h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">You haven't backed any features yet. Go to the Board to start building your portfolio.</p>
                  <Link to="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700">
                      Explore Market
                  </Link>
              </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                      <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset / Feature</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hype Score</th>
                          <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">View</span>
                          </th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {portfolio.map((feature) => (
                          <tr key={feature.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                      <div>
                                          <div className="text-sm font-medium text-gray-900">{feature.title}</div>
                                          <div className="text-xs text-gray-500 truncate max-w-xs">{feature.description}</div>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      feature.status === 'live' ? 'bg-green-100 text-green-800' :
                                      feature.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                  }`}>
                                      {feature.status.replace('_', ' ')}
                                  </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {feature.category}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono font-bold">
                                  ${(feature.pledged_amount || 0).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                  <div className="flex items-center justify-end gap-1 text-orange-600 font-bold">
                                      {feature.hype_score > 50 && <span className="text-lg">🔥</span>}
                                      {feature.hype_score ? Math.round(feature.hype_score) : 0}
                                  </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <Link to={`/feature/${feature.id}`} className="text-emerald-600 hover:text-emerald-900 inline-flex items-center">
                                      View <ArrowRight className="w-4 h-4 ml-1" />
                                  </Link>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            </div>
          )}
      </div>

      {/* Risk Disclosure */}
      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
              <h4 className="text-sm font-bold text-yellow-800">Investment Risk Disclosure</h4>
              <p className="text-xs text-yellow-700 mt-1">
                  All pledges on CodeStreet are non-binding wagers on feature delivery. "Projected Yield" is a simulated metric for gamification purposes only.
                  Past performance of a developer does not guarantee future shipping.
              </p>
          </div>
      </div>
    </div>
  );
};

export default Portfolio;
