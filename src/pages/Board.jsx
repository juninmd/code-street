import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronUp, MessageSquare, Plus, DollarSign } from 'lucide-react';

const CATEGORIES = ['All', 'Feature', 'Bug', 'Enhancement'];

const Board = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('votes'); // 'votes' or 'value'
  const [showForm, setShowForm] = useState(false);
  const [newFeature, setNewFeature] = useState({ title: '', description: '', category: 'Feature' });
  const [submitting, setSubmitting] = useState(false);

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
  }, [selectedCategory]);

  const handleVote = async (e, id) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    // Optimistic UI
    setFeatures(features.map(f => f.id === id ? { ...f, votes: f.votes + 1 } : f));

    try {
      await fetch(`/api/features/${id}/vote`, { method: 'POST' });
    } catch (err) {
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
        body: JSON.stringify({ ...newFeature, category: newFeature.category.toLowerCase() }),
      });
      const json = await res.json();
      // If the current view matches the new feature's category, prepend it
      if (selectedCategory === 'All' || selectedCategory.toLowerCase() === json.data.category) {
          setFeatures([json.data, ...features]);
      }
      setNewFeature({ title: '', description: '', category: 'Feature' });
      setShowForm(false);
    } catch (err) {
      alert('Error creating feature');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature Requests</h1>
          <p className="text-gray-500">Vote on existing ideas or suggest a new one.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          <Plus className="w-4 h-4 mr-2" />
          Suggest Feature
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 border-b border-gray-200 pb-1">
          {/* Category Tabs */}
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {CATEGORIES.map((cat) => (
                <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`${
                    selectedCategory === cat
                    ? 'border-indigo-500 text-indigo-600'
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
                  <option value="votes">Most Voted</option>
                  <option value="value">Highest Value ($)</option>
              </select>
          </div>
      </div>

      {/* Suggestion Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 animate-fade-in-down">
          <h3 className="text-lg font-medium text-gray-900 mb-4">New Suggestion</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="Short, descriptive title"
                value={newFeature.title}
                onChange={e => setNewFeature({...newFeature, title: e.target.value})}
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    value={newFeature.category}
                    onChange={e => setNewFeature({...newFeature, category: e.target.value})}
                >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                rows={3}
                placeholder="Details..."
                value={newFeature.description}
                onChange={e => setNewFeature({...newFeature, description: e.target.value})}
              />
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
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                    {submitting ? 'Submitting...' : 'Submit'}
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
                <p className="text-gray-500">No features found in this category.</p>
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
              className="block bg-white hover:bg-gray-50 transition-shadow shadow-sm hover:shadow rounded-lg p-6 border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={(e) => handleVote(e, feature.id)}
                  className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-14 bg-gray-50 rounded border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                >
                  <ChevronUp className="w-5 h-5" />
                  <span className="text-sm font-bold">{feature.votes}</span>
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
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
                    </div>
                  <p className="text-gray-500 line-clamp-2">{feature.description}</p>
                </div>
                <div className="hidden sm:flex items-center text-gray-400">
                    <MessageSquare className="w-5 h-5 mr-1" />
                    {/* We could show comment count here if API returned it, skipping for now */}
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
