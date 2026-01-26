import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Roadmap = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeatures = async () => {
    try {
      const res = await fetch('/api/features');
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
  }, []);

  const getFeaturesByStatus = (status) => features.filter(f => f.status === status);

  const StatusColumn = ({ title, status, colorClass }) => {
      const items = getFeaturesByStatus(status);
      return (
        <div className="flex-1 min-w-[300px] bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${colorClass}`}>
                <span className={`w-3 h-3 rounded-full ${colorClass.replace('text', 'bg').replace('700', '400')}`}></span>
                {title} <span className="text-gray-400 text-sm font-normal">({items.length})</span>
            </h3>
            <div className="space-y-4">
                {items.length === 0 && <p className="text-sm text-gray-400 italic">No items yet.</p>}
                {items.map(feature => (
                    <Link to={`/feature/${feature.id}`} key={feature.id} className="block bg-white p-4 rounded border border-gray-200 shadow-sm hover:shadow transition-shadow">
                        <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{feature.description}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">{feature.category}</span>
                            <span className="text-xs text-gray-400 font-medium">▲ {feature.votes}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
      );
  }

  if (loading) return <div className="text-center py-10 text-gray-500">Loading roadmap...</div>;

  return (
    <div>
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Roadmap</h1>
            <p className="text-gray-500">See what we are working on.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4">
            <StatusColumn title="Planned" status="planned" colorClass="text-blue-700" />
            <StatusColumn title="In Progress" status="in_progress" colorClass="text-yellow-700" />
            <StatusColumn title="Live" status="live" colorClass="text-green-700" />
        </div>
    </div>
  );
};

export default Roadmap;
