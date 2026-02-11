import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Shield, Target } from 'lucide-react';

const AnalystRating = ({ title, description, currentPrice = 0 }) => {
  if (!title || !description) return null;

  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  const seed = simpleHash(title + description);

  const RATINGS = ['STRONG BUY', 'BUY', 'HOLD', 'SELL', 'STRONG SELL'];
  const RISKS = ['Low', 'Medium', 'High', 'Extreme'];
  const SENTIMENTS = ['Bullish', 'Bearish', 'Neutral'];

  const ratingIndex = seed % RATINGS.length;
  const riskIndex = (seed >> 2) % RISKS.length;
  const sentimentIndex = (seed >> 4) % SENTIMENTS.length;

  // Ensure "Strong Buy" is more likely if description is long (effort factor)
  const adjustedRatingIndex = description.length > 200 && ratingIndex > 1 ? ratingIndex - 1 : ratingIndex;

  const rating = RATINGS[adjustedRatingIndex];
  const risk = RISKS[riskIndex];
  const sentiment = SENTIMENTS[sentimentIndex];

  // Target Price
  const multiplier = 1 + ((seed % 50) / 10); // 1.0x to 6.0x
  const targetPrice = (currentPrice * multiplier).toFixed(2);

  // Generate "Analyst Note"
  const POSITIVE_NOTES = [
    "Market fit appears strong due to current sector trends.",
    "Technical implementation seems feasible with high ROI potential.",
    "Strong community interest could drive early adoption.",
    "Disruptive potential in the current ecosystem.",
    "Solid fundamentals based on the feature scope."
  ];

  const NEGATIVE_NOTES = [
    "Market saturation is a concern; differentiation is key.",
    "Execution risk is high given the complexity.",
    "Monetization strategy remains unclear.",
    "Competitors already dominate this niche.",
    "Requires significant capital to scale effectively."
  ];

  const noteList = (rating === 'BUY' || rating === 'STRONG BUY') ? POSITIVE_NOTES :
                   (rating === 'SELL' || rating === 'STRONG SELL') ? NEGATIVE_NOTES :
                   [...POSITIVE_NOTES, ...NEGATIVE_NOTES];

  const note = noteList[seed % noteList.length];

  const color =
    rating.includes('BUY') ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
    rating.includes('SELL') ? 'text-red-600 bg-red-50 border-red-200' :
    'text-yellow-600 bg-yellow-50 border-yellow-200';

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mt-6">
      <h3 className="text-gray-900 font-bold flex items-center mb-4">
        <TrendingUp className="w-5 h-5 mr-2 text-gray-500" />
        Wall St. Analyst Report
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className={`p-4 rounded-lg border flex flex-col items-center justify-center text-center ${color}`}>
            <span className="text-xs font-bold uppercase tracking-wider opacity-75">Rating</span>
            <span className="text-2xl font-black">{rating}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
             <div className="p-3 bg-gray-50 rounded border border-gray-100 flex flex-col justify-center">
                <span className="text-xs text-gray-400 uppercase flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Risk Profile
                </span>
                <span className={`font-bold ${risk === 'High' || risk === 'Extreme' ? 'text-red-500' : 'text-gray-700'}`}>
                    {risk}
                </span>
             </div>
             <div className="p-3 bg-gray-50 rounded border border-gray-100 flex flex-col justify-center">
                <span className="text-xs text-gray-400 uppercase flex items-center gap-1">
                    <Target className="w-3 h-3" /> Target Price
                </span>
                <span className="font-bold text-emerald-600">
                    ${parseFloat(targetPrice).toLocaleString()}
                </span>
             </div>
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded border border-blue-100 text-sm text-blue-800 flex gap-3">
          <div className="flex-shrink-0 pt-0.5">
            <AlertTriangle className="w-4 h-4 text-blue-500" />
          </div>
          <div>
              <span className="font-bold block text-xs uppercase tracking-wide text-blue-500 mb-0.5">Analyst Note</span>
              "{note}"
          </div>
      </div>
    </div>
  );
};

export default AnalystRating;
