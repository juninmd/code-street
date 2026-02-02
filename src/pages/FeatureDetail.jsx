import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronUp, ArrowLeft, MessageSquare, Send, DollarSign, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

const FeatureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feature, setFeature] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [isPledging, setIsPledging] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Simple client-side toggle for demo

  useEffect(() => {
    // Parallel fetch feature and comments
    const fetchData = async () => {
      try {
        setLoading(true);
        const [featRes, commRes] = await Promise.all([
          fetch('/api/features'),
          fetch(`/api/features/${id}/comments`)
        ]);

        const featJson = await featRes.json();
        const commJson = await commRes.json();

        const found = featJson.data.find(f => f.id === parseInt(id));
        if (found) {
            setFeature(found);
        } else {
            // Handle 404
        }
        setComments(commJson.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleVote = async () => {
    if (!feature) return;
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
              setPledgeAmount('');
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
                      <div className="flex items-center gap-3 mb-2">
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
                      <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>

                      {/* Pledge Section */}
                      <div className="mt-6 p-5 bg-emerald-50 border border-emerald-100 rounded-xl">
                          <h3 className="text-emerald-900 font-bold flex items-center mb-2">
                              <DollarSign className="w-5 h-5 mr-1" />
                              Total Bounty: <span className="text-2xl ml-2">${(feature.pledged_amount || 0).toLocaleString()}</span>
                          </h3>
                          <p className="text-emerald-700 text-sm mb-4">Add to this bounty to attract top developers.</p>
                          <form onSubmit={handlePledge} className="flex gap-3">
                              <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                  <input
                                      type="number"
                                      min="1"
                                      step="1"
                                      value={pledgeAmount}
                                      onChange={(e) => setPledgeAmount(e.target.value)}
                                      placeholder="Amount"
                                      className="pl-7 pr-4 py-2 border border-emerald-200 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-32 outline-none"
                                  />
                              </div>
                              <button
                                  type="submit"
                                  disabled={isPledging || !pledgeAmount}
                                  className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                              >
                                  {isPledging ? 'Processing...' : 'Add to Bounty'}
                              </button>
                          </form>
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
