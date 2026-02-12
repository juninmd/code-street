import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronUp, ArrowLeft, MessageSquare, Send, DollarSign, Briefcase, Share2, FileText, X } from 'lucide-react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import ShareBountyModal from '../components/ShareBountyModal';
import PriceChart from '../components/PriceChart';
import AnalystRating from '../components/AnalystRating';
import { addToPortfolio } from '../utils/portfolio';

const FeatureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feature, setFeature] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [isPledging, setIsPledging] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Simple client-side toggle for demo
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBusinessPlan, setShowBusinessPlan] = useState(false);

  useEffect(() => {
    // Parallel fetch feature and comments
    const fetchData = async () => {
      try {
        setLoading(true);
        const [featRes, commRes, histRes] = await Promise.all([
          fetch('/api/features'),
          fetch(`/api/features/${id}/comments`),
          fetch(`/api/features/${id}/history`)
        ]);

        const featJson = await featRes.json();
        const commJson = await commRes.json();
        const histJson = await histRes.json();

        const found = featJson.data.find(f => f.id === parseInt(id));
        if (found) {
            setFeature(found);
        } else {
            // Handle 404
        }
        setComments(commJson.data);
        setHistory(histJson.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const showToast = (msg) => {
      const div = document.createElement('div');
      div.className = 'fixed bottom-20 right-4 sm:bottom-4 bg-emerald-900 text-white px-4 py-2 rounded shadow-lg animate-fade-in-up z-50 text-sm font-bold flex items-center gap-2 border border-emerald-700';
      div.innerHTML = `<span>${msg}</span>`;
      document.body.appendChild(div);
      setTimeout(() => div.remove(), 3000);
  };

  const handleVote = async () => {
    if (!feature) return;
    // For voting, we just add 0 shares to track it
    addToPortfolio(id, 0, feature.current_price || 0);
    showToast('💼 Added to Watchlist');
    // Optimistic
    setFeature({ ...feature, votes: feature.votes + 1 });
    try {
      await fetch(`/api/features/${id}/vote`, { method: 'POST' });
    } catch (err) {
       setFeature({ ...feature, votes: feature.votes - 1 });
    }
  };

  const handleStatusChange = async (newStatus) => {
      setFeature(prev => ({ ...prev, status: newStatus }));
      try {
          await fetch(`/api/features/${id}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
          });
      } catch(err) {
          console.error(err);
      }
  }

  const handleClaim = async () => {
      if (!window.confirm('Are you sure you want to claim this bounty? This will mark it as In Progress.')) return;

      // Save to local claims
      const myClaims = JSON.parse(localStorage.getItem('my_claims') || '[]');
      const featureId = parseInt(id);
      if (!myClaims.includes(featureId)) {
          myClaims.push(featureId);
          localStorage.setItem('my_claims', JSON.stringify(myClaims));
      }

      await handleStatusChange('in_progress');
  };

  const handleCommentSubmit = async (e) => {
      e.preventDefault();
      if (!newComment.trim()) return;

      try {
          const res = await fetch(`/api/features/${id}/comments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: newComment })
          });
          const json = await res.json();
          setComments([...comments, json.data]);
          setNewComment('');
      } catch(err) {
          console.error(err);
      }
  }

  const handlePledge = async (e) => {
      e.preventDefault();
      if (!pledgeAmount || isNaN(pledgeAmount) || pledgeAmount <= 0) return;

      setIsPledging(true);
      try {
          const res = await fetch(`/api/features/${id}/pledge`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount: parseFloat(pledgeAmount) })
          });
          if (res.ok) {
              confetti({
                  particleCount: 150,
                  spread: 100,
                  origin: { y: 0.6 },
                  colors: ['#10B981', '#FFD700'] // Emerald and Gold
              });
              setFeature(prev => ({ ...prev, pledged_amount: (prev.pledged_amount || 0) + parseFloat(pledgeAmount) }));

              // Optimistically update history (optional, or just refetch)
              const newPledge = {
                  id: Date.now(), // temporary ID
                  amount: parseFloat(pledgeAmount),
                  created_at: new Date().toISOString()
              };
              setHistory(prev => [...prev, newPledge]);

              setPledgeAmount('');
              // addToPortfolio called in onSubmit
          }
      } catch (err) {
          console.error(err);
      } finally {
          setIsPledging(false);
      }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!feature) return <div className="text-center py-12">Feature not found.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-8">
              <div className="flex items-start gap-6">
                  <button
                    onClick={handleVote}
                    className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors group"
                  >
                    <ChevronUp className="w-6 h-6 group-hover:-translate-y-0.5 transition-transform" />
                    <span className="text-lg font-bold">{feature.votes}</span>
                  </button>
                  <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{feature.title}</h1>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    feature.status === 'live' ? 'bg-green-100 text-green-800' :
                                    feature.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                    feature.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {feature.status.replace('_', ' ')}
                            </span>
                        </div>
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="inline-flex items-center px-3 py-1.5 border border-emerald-200 shadow-sm text-xs font-bold rounded-md text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                        >
                            <Share2 className="w-4 h-4 mr-1.5" />
                            Share Asset Card
                        </button>
                      </div>
                      <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>

                      {/* Wealth Tools */}
                      <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setShowBusinessPlan(true)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        >
                            <FileText className="w-4 h-4 mr-2 text-emerald-600" />
                            Generate Business Plan
                        </button>
                      </div>

                      {/* Analyst Rating */}
                      <AnalystRating title={feature.title} description={feature.description} currentPrice={feature.pledged_amount} />

                      {/* Price History Chart */}
                      <div className="mt-6">
                        <PriceChart history={history} />
                      </div>

                      {/* Pledge/Buy Section */}
                      <div className="mt-6 p-5 bg-emerald-900 text-white border border-emerald-800 rounded-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-overlay filter blur-3xl opacity-10 -mr-16 -mt-16"></div>

                          <div className="flex justify-between items-start mb-6">
                              <div>
                                  <p className="text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">Current Stock Price</p>
                                  <h3 className="text-4xl font-extrabold flex items-baseline">
                                      ${(feature.current_price || 1.00).toFixed(2)}
                                      <span className={`text-sm ml-2 font-mono ${(feature.day_change || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                          {(feature.day_change || 0) >= 0 ? '+' : ''}{(feature.day_change || 0)}%
                                      </span>
                                  </h3>
                              </div>
                              <div className="text-right">
                                  <p className="text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">Market Cap</p>
                                  <p className="text-xl font-bold font-mono">${(feature.pledged_amount || 0).toLocaleString()}</p>
                              </div>
                          </div>

                          <form onSubmit={(e) => {
                              const shares = parseFloat(pledgeAmount) / (feature.current_price || 1);
                              addToPortfolio(id, shares, feature.current_price || 1);
                              showToast(`🚀 Bought ${shares.toFixed(2)} Shares!`);
                              handlePledge(e); // Let the backend pledge logic run too
                          }} className="flex gap-3 items-end">
                              <div className="relative flex-1">
                                  <label className="block text-xs font-bold text-emerald-300 uppercase mb-1">Investment Amount</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={pledgeAmount}
                                        onChange={(e) => setPledgeAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="pl-7 pr-4 py-3 bg-emerald-950/50 border border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 w-full outline-none text-white font-mono text-lg"
                                    />
                                  </div>
                              </div>
                              <button
                                  type="submit"
                                  disabled={isPledging || !pledgeAmount}
                                  className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-900/50 flex-shrink-0"
                              >
                                  {isPledging ? 'Buying...' : 'Buy Shares'}
                              </button>
                          </form>
                          {pledgeAmount && !isNaN(parseFloat(pledgeAmount)) && (
                              <p className="text-xs text-emerald-400 mt-2 text-right">
                                  ≈ {(parseFloat(pledgeAmount) / (feature.current_price || 1)).toFixed(2)} Shares
                              </p>
                          )}
                      </div>

                      {/* Developer Actions (Claim) */}
                      {(feature.status === 'under_review' || feature.status === 'planned') && (
                          <div className="mt-6 p-5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                              <div>
                                  <h3 className="text-gray-900 font-bold flex items-center">
                                      <Briefcase className="w-5 h-5 mr-2 text-gray-500" />
                                      Developer Zone
                                  </h3>
                                  <p className="text-gray-500 text-sm mt-1">Ready to build this? Claim the bounty to start.</p>
                              </div>
                              <button
                                onClick={handleClaim}
                                className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-colors shadow-sm"
                              >
                                  Claim Bounty
                              </button>
                          </div>
                      )}

                      <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                          <div className="text-sm text-gray-400">
                              {feature.category} &bull; Posted on {feature.created_at ? format(new Date(feature.created_at), 'MMM d, yyyy') : 'Recently'}
                          </div>
                          <button onClick={() => setIsAdmin(!isAdmin)} className="text-xs text-gray-300 hover:text-gray-500">
                              {isAdmin ? 'Exit Admin' : 'Admin'}
                          </button>
                      </div>

                      {isAdmin && (
                          <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Admin: Update Status</span>
                              <div className="flex gap-2">
                                  {['under_review', 'planned', 'in_progress', 'live'].map(s => (
                                      <button
                                        key={s}
                                        onClick={() => handleStatusChange(s)}
                                        className={`px-3 py-1 rounded text-xs font-medium border ${
                                            feature.status === s ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                        }`}
                                      >
                                          {s.replace('_', ' ')}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>

      {showShareModal && <ShareBountyModal feature={feature} onClose={() => setShowShareModal(false)} />}

      {/* Business Plan Modal */}
      {showBusinessPlan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-emerald-100">
                <div className="bg-emerald-900 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Generated Business Plan
                    </h3>
                    <button onClick={() => setShowBusinessPlan(false)} className="hover:bg-emerald-800 p-1 rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Executive Summary</h4>
                        <p className="text-gray-800 font-medium">{feature.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                            <h4 className="text-xs font-bold text-emerald-700 uppercase mb-1">Revenue Model</h4>
                            <p className="text-sm font-bold text-emerald-900">
                                {["SaaS Subscription", "Freemium", "Enterprise License", "Ads & Data"][feature.title.length % 4]}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <h4 className="text-xs font-bold text-blue-700 uppercase mb-1">Est. ARR</h4>
                            <p className="text-sm font-bold text-blue-900">
                                ${(feature.pledged_amount * 120 + 5000).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Go-to-Market Strategy</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            <li>Launch MVP on CodeStreet Exchange.</li>
                            <li>Target early adopters in {feature.category} sector.</li>
                            <li>Leverage viral growth via referral incentives.</li>
                        </ul>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <button
                            onClick={() => {
                                alert("Business Plan exported to Clipboard!");
                                setShowBusinessPlan(false);
                            }}
                            className="w-full py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-colors"
                        >
                            Export to PDF (Premium)
                        </button>
                    </div>
                </div>
             </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="max-w-2xl mx-auto">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-gray-400" />
              Comments ({comments.length})
          </h3>

          <div className="mb-8">
              <form onSubmit={handleCommentSubmit} className="relative">
                  <textarea
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-4 border pr-12"
                    rows={3}
                    placeholder="Ask questions or discuss implementation..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute bottom-2 right-2 p-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                    disabled={!newComment.trim()}
                  >
                      <Send className="w-4 h-4" />
                  </button>
              </form>
          </div>

          <div className="space-y-6">
              {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                          ?
                      </div>
                      <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <p className="text-gray-800 text-sm mb-2">{comment.content}</p>
                          <div className="text-xs text-gray-400">
                              {comment.created_at ? format(new Date(comment.created_at), 'MMM d, h:mm a') : 'Just now'}
                          </div>
                      </div>
                  </div>
              ))}
              {comments.length === 0 && (
                  <p className="text-center text-gray-400 text-sm">No comments yet. Be the first!</p>
              )}
          </div>
      </div>
    </div>
  );
};

export default FeatureDetail;
