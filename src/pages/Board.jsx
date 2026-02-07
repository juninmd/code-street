import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronUp, MessageSquare, Plus, DollarSign, Sparkles, Zap, Share2, BarChart2, Clock, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import MarketInsider from '../components/MarketInsider';
import ShareBountyModal from '../components/ShareBountyModal';

const CATEGORIES = ['All', 'Frontend', 'Backend', 'Mobile', 'AI', 'Design'];

const Board = () => {
  const navigate = useNavigate();
  const [showInsider, setShowInsider] = useState(false);
  const [shareModalFeature, setShareModalFeature] = useState(null);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('value'); // Default to value for bounties
  const [showForm, setShowForm] = useState(false);
  const [newFeature, setNewFeature] = useState({ title: '', description: '', category: 'Frontend', deadline: '' });
  const [initialPledge, setInitialPledge] = useState('');
  const [stats, setStats] = useState({ total_payout: 0, active_bounty: 0 });
  const [submitting, setSubmitting] = useState(false);

  const fetchStats = async () => {
      try {
          const res = await fetch('/api/stats');
          const json = await res.json();
          setStats(json);
      } catch (err) {
          console.error(err);
      }
  };

  const fetchFeatures = async () => {
    setLoading(true);
    try {
      let url = '/api/features';
      if (selectedCategory !== 'All') {
        url += `?category=${selectedCategory.toLowerCase()}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      setFeatures(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
    fetchStats();
  }, [selectedCategory]);

  const simulateAiEstimation = () => {
      const text = newFeature.description || '';
      const title = newFeature.title || '';
      let estimate = 50; // Base cost
      estimate += text.length * 0.1; // Complexity factor

      const keywords = ['AI', 'Mobile', 'Crypto', 'Data', 'Blockchain', '3D', 'App'];
      keywords.forEach(k => {
          if ((title + text).toLowerCase().includes(k.toLowerCase())) estimate += 200;
      });

      setInitialPledge(Math.ceil(estimate).toString());
  };

  const handleVote = async (e, id) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    // Celebration
    confetti({
        particleCount: 30,
        startVelocity: 15,
        spread: 360,
        origin: {
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight
        },
        colors: ['#10B981', '#34D399', '#059669'] // Emerald shades
    });

    // Optimistic UI
    setFeatures(features.map(f => f.id === id ? { ...f, votes: f.votes + 1 } : f));

    try {
      await fetch(`/api/features/${id}/vote`, { method: 'POST' });
    } catch (err) {
      setFeatures(features.map(f => f.id === id ? { ...f, votes: f.votes - 1 } : f));
    }
  };

  const handleBoost = async (e, id) => {
      e.preventDefault();
      e.stopPropagation();

      // Simulation of payment
      if(!window.confirm("Boost this bounty for $10? This makes it stick to the top!")) return;

      try {
          const res = await fetch(`/api/features/${id}/boost`, { method: 'POST' });
          if(res.ok) {
              confetti({
                  particleCount: 150,
                  spread: 60,
                  colors: ['#FFD700', '#FDB931'] // Gold
              });
              // Optimistic update
              setFeatures(features.map(f => f.id === id ? { ...f, is_boosted: 1 } : f));
              // Refresh to get correct order
              fetchFeatures();
              fetchStats(); // Update revenue
          }
      } catch (err) {
          alert("Failed to boost");
      }
  };

  const handlePanic = async (e, id) => {
      e.preventDefault();
      e.stopPropagation();

      if(!window.confirm("PANIC MODE: Extend deadline by 24h for $5 fee?")) return;

      try {
          const res = await fetch(`/api/features/${id}/panic`, { method: 'POST' });
          if(res.ok) {
              const json = await res.json();
              confetti({
                  particleCount: 50,
                  spread: 180,
                  colors: ['#EF4444', '#F87171'] // Red
              });
              // Optimistic update
              setFeatures(features.map(f => f.id === id ? {
                  ...f,
                  deadline: json.new_deadline,
                  pledged_amount: (f.pledged_amount || 0) + 5
              } : f));
              fetchStats();
          }
      } catch (err) {
          alert("Panic failed. You are doomed.");
      }
  };

  const handleMysteryBounty = () => {
      const available = features.filter(f => f.status === 'under_review' || f.status === 'planned');
      if (available.length === 0) return;

      const random = available[Math.floor(Math.random() * available.length)];

      confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500'] // Gold colors
      });

      setTimeout(() => {
          navigate(`/feature/${random.id}`);
      }, 800);
  };

  const handleReferral = () => {
      // Simulation of referral link generation
      const code = Math.random().toString(36).substring(7).toUpperCase();
      navigator.clipboard.writeText(`https://codebounty.app?ref=${code}`);

      confetti({
          particleCount: 50,
          spread: 40,
          origin: { x: 0.9, y: 0.1 },
          colors: ['#A855F7', '#D8B4FE'] // Purple
      });

      alert(`Link copied! Share to earn 1% commissions.\nRef Code: ${code}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newFeature.title.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...newFeature,
            category: newFeature.category.toLowerCase(),
            initial_pledge: initialPledge
        }),
      });
      const json = await res.json();
      // If the current view matches the new feature's category, prepend it
      if (selectedCategory === 'All' || selectedCategory.toLowerCase() === json.data.category) {
          setFeatures([json.data, ...features]);
      }
      setNewFeature({ title: '', description: '', category: 'Frontend', deadline: '' });
      setInitialPledge('');
      setShowForm(false);
      fetchStats();
    } catch (err) {
      alert('Error creating wager');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Global Stats Banner */}
      <div className="bg-emerald-900 rounded-2xl p-6 mb-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -mr-16 -mt-16"></div>
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
                <p className="text-emerald-300 text-sm font-medium uppercase tracking-wider mb-1">Market Volume (Paid Out)</p>
                <p className="text-4xl font-extrabold tracking-tight">${(stats.total_payout || 0).toLocaleString()}</p>
            </div>
            <div>
                <p className="text-emerald-300 text-sm font-medium uppercase tracking-wider mb-1">Active Bounty Pool</p>
                <p className="text-4xl font-extrabold tracking-tight">${(stats.active_bounty || 0).toLocaleString()}</p>
            </div>
            <div>
                <p className="text-yellow-300 text-sm font-medium uppercase tracking-wider mb-1">Platform Revenue</p>
                <p className="text-4xl font-extrabold tracking-tight text-yellow-400">${(stats.platform_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Wagers</h1>
          <p className="text-gray-500">Bet on your focus. Ship before the deadline or burn your pledge.</p>
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <button
            onClick={handleReferral}
            className="inline-flex items-center px-4 py-2 border border-purple-200 shadow-sm text-sm font-bold rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none"
            >
            <Share2 className="w-4 h-4 mr-2" />
            Refer & Earn
            </button>
            <button
            onClick={() => setShowInsider(true)}
            className="inline-flex items-center px-4 py-2 border border-emerald-200 shadow-sm text-sm font-bold rounded-md text-emerald-800 bg-emerald-50 hover:bg-emerald-100 focus:outline-none"
            >
            <BarChart2 className="w-4 h-4 mr-2 text-emerald-600" />
            Insider Intel
            </button>
            <button
            onClick={handleMysteryBounty}
            className="inline-flex items-center px-4 py-2 border border-emerald-200 shadow-sm text-sm font-bold rounded-md text-emerald-700 bg-emerald-50 hover:bg-emerald-100 focus:outline-none animate-pulse-gold"
            >
            <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
            Mystery Bounty
            </button>
            <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none"
            >
            <Plus className="w-4 h-4 mr-2" />
            Place Wager
            </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 border-b border-gray-200 pb-1">
          {/* Category Tabs */}
          <nav className="-mb-px flex space-x-8 overflow-x-auto pb-2 sm:pb-0" aria-label="Tabs">
            {CATEGORIES.map((cat) => (
                <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`${
                    selectedCategory === cat
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                {cat}
                </button>
            ))}
          </nav>

          {/* Sort Control */}
          <div className="flex items-center space-x-2 text-sm pb-2">
              <span className="text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border-none bg-gray-50 rounded-md text-gray-700 py-1 pl-2 pr-8 focus:ring-0 focus:outline-none cursor-pointer"
              >
                  <option value="value">Highest Bounty ($)</option>
                  <option value="votes">Most Voted</option>
              </select>
          </div>
      </div>

      {showInsider && <MarketInsider features={features} onClose={() => setShowInsider(false)} />}
      {shareModalFeature && <ShareBountyModal feature={shareModalFeature} onClose={() => setShareModalFeature(null)} />}

      {/* Suggestion Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 animate-fade-in-down">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Place New Wager</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Goal Title</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                placeholder="What will you ship?"
                value={newFeature.title}
                onChange={e => setNewFeature({...newFeature, title: e.target.value})}
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                    value={newFeature.category}
                    onChange={e => setNewFeature({...newFeature, category: e.target.value})}
                >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

             <div>
                <label className="block text-sm font-medium text-gray-700">Deadline</label>
                <input
                    type="datetime-local"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                    value={newFeature.deadline}
                    onChange={e => setNewFeature({...newFeature, deadline: e.target.value})}
                />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                rows={3}
                placeholder="Definition of Done..."
                value={newFeature.description}
                onChange={e => setNewFeature({...newFeature, description: e.target.value})}
              />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Wager Amount ($)</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                    <div className="relative flex-grow focus-within:z-10">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                        type="number"
                        min="0"
                        className="focus:ring-emerald-500 focus:border-emerald-500 block w-full rounded-none rounded-l-md pl-7 sm:text-sm border-gray-300 border p-2"
                        placeholder="0"
                        value={initialPledge}
                        onChange={e => setInitialPledge(e.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={simulateAiEstimation}
                        className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span>Ask AI Estimate</span>
                    </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">You lose this if you miss the deadline.</p>
            </div>

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50"
                >
                    {submitting ? 'Place Wager' : 'Place Wager'}
                </button>
            </div>
          </form>
        </div>
      )}

      {/* Feature List */}
      <div className="space-y-4">
        {loading ? (
           <div className="space-y-4">
               {[1,2,3].map(i => (
                   <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse h-24"></div>
               ))}
           </div>
        ) : features.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No active bounties in this category.</p>
            </div>
        ) : (
          features
            .sort((a, b) => {
                if (sortBy === 'value') {
                    // Sort by pledged amount (desc), then votes
                    return (b.pledged_amount || 0) - (a.pledged_amount || 0) || b.votes - a.votes;
                }
                // Default: Sort by votes (desc), then pledged amount
                return b.votes - a.votes || (b.pledged_amount || 0) - (a.pledged_amount || 0);
            })
            .map((feature) => (
            <Link
              key={feature.id}
              to={`/feature/${feature.id}`}
              className={`block bg-white hover:bg-gray-50 transition-all shadow-sm hover:shadow-md rounded-lg p-6 border ${feature.is_boosted ? 'border-yellow-400 ring-1 ring-yellow-400 bg-yellow-50/30' : 'border-gray-100'}`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={(e) => handleVote(e, feature.id)}
                  className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-14 bg-emerald-50 rounded border border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
                >
                  <ChevronUp className="w-5 h-5" />
                  <span className="text-sm font-bold">{feature.votes}</span>
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {feature.is_boosted ? <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" /> : null}
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{feature.title}</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                            {feature.category}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            feature.status === 'live' ? 'bg-green-100 text-green-800' :
                            feature.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            feature.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {feature.status.replace('_', ' ')}
                        </span>
                        {(feature.pledged_amount || 0) > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                <DollarSign className="w-3 h-3 mr-0.5" />
                                {feature.pledged_amount}
                            </span>
                        )}
                        {feature.deadline && feature.status !== 'live' && (() => {
                            const diff = new Date(feature.deadline) - new Date();
                            const isBurned = diff <= 0;
                            const isLow = diff < 24 * 60 * 60 * 1000;

                            if (isBurned) {
                                return (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white animate-pulse">
                                        🔥 BURNED
                                    </span>
                                );
                            }

                            const hours = Math.floor(diff / (1000 * 60 * 60));
                            return (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${isLow ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                    <Clock className="w-3 h-3 mr-1" />
                                    {hours}h left
                                </span>
                            );
                        })()}
                    </div>
                  <p className="text-gray-500 line-clamp-2">{feature.description}</p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-2">
                    {feature.deadline && new Date(feature.deadline) > new Date() && new Date(feature.deadline) - new Date() < 24 * 60 * 60 * 1000 && feature.status !== 'live' && (
                        <button
                            onClick={(e) => handlePanic(e, feature.id)}
                            className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded border border-red-200 hover:border-red-300 transition-colors flex items-center animate-pulse"
                        >
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            PANIC ($5)
                        </button>
                    )}
                    {!feature.is_boosted && (
                        <button
                            onClick={(e) => handleBoost(e, feature.id)}
                            className="text-xs font-bold text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 px-2 py-1 rounded border border-transparent hover:border-yellow-200 transition-colors flex items-center"
                        >
                            <Zap className="w-3 h-3 mr-1" />
                            Boost $10
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                         <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShareModalFeature(feature);
                            }}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="Share Asset Card"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center text-gray-400">
                            <MessageSquare className="w-5 h-5 mr-1" />
                        </div>
                    </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Board;
