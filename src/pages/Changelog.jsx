import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { PartyPopper } from 'lucide-react';

const Changelog = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeatures = async () => {
    try {
      const res = await fetch('/api/features');
      const json = await res.json();
      // Filter for live features and sort by "newest" (using ID as proxy for release order if created_at is suggestion time, but good enough)
      const live = json.data.filter(f => f.status === 'live').sort((a, b) => b.id - a.id);
      setFeatures(live);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  if (loading) return <div className="text-center py-10 text-gray-500">Loading changelog...</div>;

  return (
    <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Changelog</h1>
            <p className="text-gray-500">New updates and improvements.</p>
        </div>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {features.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300 relative z-10">
                    <p className="text-gray-500">No updates released yet.</p>
                </div>
            )}
            {features.map((feature) => (
                <div key={feature.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-50 group-[.is-active]:bg-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                         <PartyPopper className="w-5 h-5 text-indigo-600 group-[.is-active]:text-white" />
                    </div>

                    {/* Card */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                             <span className="font-bold text-gray-900 text-lg">{feature.title}</span>
                             <span className="text-xs text-gray-400 font-mono">
                                 {feature.created_at ? format(new Date(feature.created_at), 'MMM d, yyyy') : 'Recently'}
                             </span>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            {feature.description}
                        </p>
                        <div className="mt-3">
                             <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                {feature.category}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default Changelog;
