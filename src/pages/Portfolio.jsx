import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, PieChart, Activity, AlertTriangle, ArrowRight, Wallet } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getPortfolio } from '../utils/portfolio';
import { triggerHaptic } from '../utils/haptics';
import Sparkline from '../components/Sparkline';

const Portfolio = () => {
  const [loading, setLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState([]);
  const [history, setHistory] = useState([]);
  const [lastClaimTime, setLastClaimTime] = useState(0);
  const [optionsPortfolio, setOptionsPortfolio] = useState([]);
  const [exercisingId, setExercisingId] = useState(null);
  const [stats, setStats] = useState({
      totalEquity: 0,
      totalCostBasis: 0,
      totalGainLoss: 0,
      assetCount: 0,
      cashBalance: 0
  });

  const fetchPortfolio = async () => {
      try {
        const holdings = getPortfolio(); // [{id, shares, avgPrice}, ...]
        const cashBalance = parseFloat(localStorage.getItem('cash_balance') || '0');
        const lastClaim = parseInt(localStorage.getItem('last_claim_ts') || '0');
        setLastClaimTime(lastClaim);

        if (holdings.length === 0) {
            setStats(prev => ({ ...prev, cashBalance }));
            setLoading(false);
            return;
        }

        const res = await fetch('/api/features');
        const json = await res.json();

        // Map holdings to current market data
        const enriched = holdings.map(h => {
            const marketData = json.data.find(f => f.id === h.id);
            if (!marketData) return null;

            const positionType = h.type || 'long';
            const costBasis = h.shares * h.avgPrice;
            let currentValue = 0;
            let unrealizedGain = 0;

            if (positionType === 'short') {
                currentValue = (2 * h.avgPrice - (marketData.current_price || 0)) * h.shares;
                unrealizedGain = (h.avgPrice - (marketData.current_price || 0)) * h.shares;
            } else {
                currentValue = h.shares * (marketData.current_price || 0);
                unrealizedGain = currentValue - costBasis;
            }

            return {
                ...marketData,
                sharesOwned: h.shares,
                avgCost: h.avgPrice,
                currentValue,
                costBasis,
                unrealizedGain,
                positionType
            };
        }).filter(Boolean);

        // Fetch Options Portfolio
        const optRes = await fetch('/api/options/portfolio');
        const optJson = await optRes.json();
        setOptionsPortfolio(optJson.data || []);

        // Calculate Stats
        const totalEquity = enriched.reduce((acc, curr) => acc + curr.currentValue, 0);
        const totalCostBasis = enriched.reduce((acc, curr) => acc + curr.costBasis, 0);
        const totalGainLoss = totalEquity - totalCostBasis;
        const assetCount = enriched.length;

        // Generate fake history for the sparkline (since we don't store portfolio snapshots)
        const fakeHistory = [];
        let val = totalEquity * 0.9;
        for(let i=0; i<20; i++) {
            fakeHistory.push(val);
            val += (Math.random() - 0.4) * (totalEquity * 0.05); // Random walk
        }
        fakeHistory.push(totalEquity);
        setHistory(fakeHistory);

        setPortfolioData(enriched);
        setStats({ totalEquity, totalCostBasis, totalGainLoss, assetCount, cashBalance });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleExercise = async (id) => {
      setExercisingId(id);
      triggerHaptic('notification');
      try {
          const res = await fetch(`/api/options/exercise/${id}`, { method: 'POST' });
          const json = await res.json();
          if (res.ok) {
              // Add net payout to cash balance
              const currentCash = parseFloat(localStorage.getItem('cash_balance') || '0');
              const newCash = currentCash + json.net_payout;
              localStorage.setItem('cash_balance', newCash.toString());

              setStats(prev => ({ ...prev, cashBalance: newCash }));

              triggerHaptic('success');
              confetti({
                  particleCount: 150,
                  spread: 80,
                  origin: { y: 0.6 },
                  colors: ['#10B981', '#34D399', '#FFD700']
              });
              alert(`Exercised! Gross: $${json.gross_payout}, Fee: $${json.fee}, Net: $${json.net_payout}`);
              fetchPortfolio(); // Refresh
          } else {
              alert(`Error: ${json.error}`);
          }
      } catch (err) {
          console.error(err);
          alert("Failed to exercise");
      } finally {
          setExercisingId(null);
      }
  };

  const handleClaimDividend = () => {
      const now = Date.now();

      if (now - lastClaimTime < 86400000) {
          triggerHaptic('error');
          alert("Dividends are paid every 24 hours. Check back later.");
          return;
      }

      // 1% daily yield on Total Equity (min $10 if no equity)
      const dividend = Math.max(10, stats.totalEquity * 0.01);

      const newBalance = (stats.cashBalance || 0) + dividend;
      localStorage.setItem('cash_balance', newBalance.toString());
      localStorage.setItem('last_claim_ts', now.toString());

      setStats(prev => ({ ...prev, cashBalance: newBalance }));
      setLastClaimTime(now);

      triggerHaptic('success');
      confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#FFD700']
      });
  };

  const timeUntilClaim = Math.max(0, 86400000 - (Date.now() - lastClaimTime));
  const hours = Math.floor(timeUntilClaim / (1000 * 60 * 60));
  const minutes = Math.floor((timeUntilClaim % (1000 * 60 * 60)) / (1000 * 60));
  const canClaim = timeUntilClaim === 0;

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
            <p className="text-gray-500">Track your equity in the CodeStreet ecosystem.</p>
        </div>
        <div className="flex items-center gap-4">
             <button
                onClick={handleClaimDividend}
                disabled={!canClaim}
                className={`px-4 py-2 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2 transition-all ${
                    canClaim
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 hover:scale-105 animate-pulse'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
             >
                 <Wallet className="w-4 h-4" />
                 {canClaim ? 'Claim Daily Dividend' : `Next Payout: ${hours}h ${minutes}m`}
             </button>
            <div className="bg-emerald-50 text-emerald-800 px-4 py-2 rounded-full text-xs font-bold border border-emerald-100 flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                MARKET OPEN
            </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-xl p-6 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/30 transition-all"></div>
              <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Equity</p>
                    <h2 className="text-4xl font-bold flex items-baseline gap-1">
                        <span className="text-emerald-400">$</span>
                        {stats.totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                  </div>
                  <div className="w-24">
                      <Sparkline data={history} />
                  </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-emerald-400 relative z-10">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>Current Market Value</span>
              </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                   <DollarSign className="w-24 h-24 text-emerald-600" />
               </div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Liquid Cash</p>
              <h2 className="text-4xl font-bold text-gray-900 flex items-baseline gap-1">
                  ${stats.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
               <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Unrealized P&L:</span>
                  <span className={`font-bold ${stats.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                       {stats.totalGainLoss >= 0 ? '+' : ''}{stats.totalGainLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
              </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
               <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Positions Held</p>
               <div className="flex justify-between items-end">
                   <h2 className="text-4xl font-bold text-gray-900">{stats.assetCount}</h2>
                   <div className="text-right">
                       <p className="text-xs text-gray-400 uppercase">Cost Basis</p>
                       <p className="font-bold text-lg text-gray-700">${stats.totalCostBasis.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                   </div>
               </div>
          </div>
      </div>

      {/* Asset List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Your Holdings</h3>
          </div>

          {portfolioData.length === 0 ? (
              <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <DollarSign className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Assets Found</h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">You haven't invested in any features yet. Go to the Board to start building your portfolio.</p>
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
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Cost</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Market Value</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
                          <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">View</span>
                          </th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {portfolioData.map((feature, idx) => (
                          <tr key={`${feature.id}-${feature.positionType}-${idx}`} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                      <div>
                                          <div className="text-sm font-bold text-gray-900">{feature.title}</div>
                                          <div className="text-xs text-gray-500">{feature.ticker || '---'}</div>
                                      </div>
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${feature.positionType === 'short' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                          {feature.positionType}
                                      </span>
                                  </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-mono">
                                  {feature.sharesOwned.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 font-mono">
                                  ${feature.avgCost.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-mono font-bold">
                                  ${(feature.current_price || 0).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-mono font-bold">
                                  ${feature.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-mono font-bold ${feature.unrealizedGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {feature.unrealizedGain >= 0 ? '+' : ''}{feature.unrealizedGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <Link to={`/feature/${feature.id}`} className="text-emerald-600 hover:text-emerald-900 inline-flex items-center">
                                      Trade <ArrowRight className="w-4 h-4 ml-1" />
                                  </Link>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            </div>
          )}
      </div>

      {/* Options Portfolio List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Active Options Contracts
              </h3>
          </div>

          {optionsPortfolio.length === 0 ? (
              <div className="p-12 text-center">
                  <p className="text-gray-500 max-w-sm mx-auto">No active options contracts. Visit a feature page to trade options.</p>
              </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                      <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Strike Price</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Premium Paid</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {optionsPortfolio.map((contract) => {
                          const isCallInMoney = contract.type === 'call' && contract.current_price > contract.strike_price;
                          const isPutInMoney = contract.type === 'put' && contract.current_price < contract.strike_price;
                          const isInMoney = isCallInMoney || isPutInMoney;

                          return (
                          <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <Link to={`/feature/${contract.feature_id}`} className="text-sm font-bold text-emerald-600 hover:text-emerald-900">
                                      {contract.feature_title}
                                  </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                      contract.type === 'call' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                      {contract.type.toUpperCase()}
                                  </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-gray-900">
                                  ${contract.strike_price.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-gray-500">
                                  ${contract.current_price.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-gray-500">
                                  ${contract.premium_paid.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      contract.status === 'exercised' ? 'bg-gray-100 text-gray-800' :
                                      isInMoney ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                      {contract.status === 'exercised' ? 'EXERCISED' : isInMoney ? 'ITM' : 'OTM'}
                                  </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                  {contract.status === 'active' && (
                                      <button
                                          onClick={() => handleExercise(contract.id)}
                                          disabled={exercisingId === contract.id || !isInMoney}
                                          className={`px-3 py-1 rounded text-xs font-bold shadow-sm transition-colors ${
                                              isInMoney
                                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                          }`}
                                          title={isInMoney ? "Exercise Contract" : "Out of the Money"}
                                      >
                                          {exercisingId === contract.id ? 'Processing...' : 'Exercise'}
                                      </button>
                                  )}
                              </td>
                          </tr>
                      )})}
                  </tbody>
              </table>
            </div>
          )}
      </div>

      {/* Risk Disclosure */}
      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start gap-3 mt-8">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
              <h4 className="text-sm font-bold text-yellow-800">CodeStreet Ventures Risk Disclosure</h4>
              <p className="text-xs text-yellow-700 mt-1">
                  This portfolio represents virtual equity in feature requests. "Shares" allow you to vote and influence the roadmap.
                  Financial metrics (Gains, Price) are simulated based on community demand (votes) and capital interest.
              </p>
          </div>
      </div>
    </div>
  );
};

export default Portfolio;
