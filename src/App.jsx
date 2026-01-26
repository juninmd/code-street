import React, { useState, useEffect } from 'react';

function App() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newFeature, setNewFeature] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  // Simple "admin" toggle for demo purposes
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/features');
      if (!res.ok) throw new Error('Failed to fetch features');
      const json = await res.json();
      setFeatures(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleVote = async (id) => {
    // Optimistic update
    setFeatures(features.map(f => f.id === id ? { ...f, votes: f.votes + 1 } : f));

    try {
      const res = await fetch(`/api/features/${id}/vote`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to vote');
      // Ideally re-fetch to ensure consistency or rely on optimistic
    } catch (err) {
      console.error(err);
      // Revert on error
      setFeatures(features.map(f => f.id === id ? { ...f, votes: f.votes - 1 } : f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newFeature.title.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeature),
      });
      if (!res.ok) throw new Error('Failed to create feature');
      const json = await res.json();
      setFeatures([json.data, ...features]); // Prepend
      setNewFeature({ title: '', description: '' });
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
      // Optimistic
      setFeatures(features.map(f => f.id === id ? { ...f, status: newStatus } : f));
      try {
          const res = await fetch(`/api/features/${id}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
          });
          if (!res.ok) throw new Error('Failed to update status');
      } catch(err) {
          console.error(err);
          // Revert logic would be complex here without prev state tracking, skipping for MVP
      }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'live': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
        case 'under_review': return 'Under Review';
        case 'planned': return 'Planned';
        case 'in_progress': return 'In Progress';
        case 'live': return 'Live';
        default: return status;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">FeedbackLoop</h1>
            <button
                onClick={() => setIsAdmin(!isAdmin)}
                className="text-sm text-gray-500 hover:text-gray-900 underline"
            >
                {isAdmin ? 'Exit Admin' : 'Admin Login'}
            </button>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Suggest a Feature</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                id="title"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="e.g. Dark Mode"
                value={newFeature.title}
                onChange={(e) => setNewFeature({...newFeature, title: e.target.value})}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="Explain why this is useful..."
                value={newFeature.description}
                onChange={(e) => setNewFeature({...newFeature, description: e.target.value})}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Suggestion'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-500">Loading features...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : features.length === 0 ? (
            <p className="text-center text-gray-500">No features suggested yet. Be the first!</p>
          ) : (
            features.map((feature) => (
              <div key={feature.id} className="bg-white shadow rounded-lg p-6 flex items-start space-x-4">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <button
                    onClick={() => handleVote(feature.id)}
                    className="flex flex-col items-center p-2 rounded hover:bg-gray-100 group transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    <span className="font-bold text-gray-700 group-hover:text-indigo-600">{feature.votes}</span>
                  </button>
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                            {getStatusLabel(feature.status)}
                        </span>
                    </div>
                  <p className="mt-1 text-gray-500">{feature.description}</p>

                  {isAdmin && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                          <span className="text-xs text-gray-400 uppercase font-bold self-center">Admin: Set Status</span>
                          {['under_review', 'planned', 'in_progress', 'live'].map(s => (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(feature.id, s)}
                                className={`text-xs px-2 py-1 rounded border ${feature.status === s ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                              >
                                {getStatusLabel(s)}
                              </button>
                          ))}
                      </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
