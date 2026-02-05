import React from 'react';
import { X, Copy, TrendingUp, Check } from 'lucide-react';

const ShareBountyModal = ({ feature, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!feature) return null;

  const ticker = feature.title ? feature.title.substring(0, 4).toUpperCase() : 'FEAT';
  const price = (feature.pledged_amount || 0).toLocaleString();
  const volume = feature.votes || 0;
  const shareUrl = `https://codebounty.app/feature/${feature.id}`; // Simulated URL

  const handleCopy = () => {
    const text = `🚀 I just backed $${ticker} on CodeBounty!\n\nAsset: ${feature.title}\nIPO Price: $${price}\nVolume: ${volume} Votes\n\nInvest in this feature here: ${shareUrl} #CodeBounty #FeatureFi`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-emerald-500/50 shadow-2xl relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-gray-800 relative z-10">
          <h3 className="text-emerald-400 font-mono text-sm tracking-widest uppercase">Asset Certificate</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Content */}
        <div className="p-6 relative z-10">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6 shadow-inner relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>

            <div className="flex justify-between items-start mb-4">
               <div>
                  <span className="bg-emerald-900/50 text-emerald-400 text-xs font-bold px-2 py-1 rounded border border-emerald-500/30">
                    ${ticker}
                  </span>
                  <h2 className="text-white text-xl font-bold mt-2 leading-tight">{feature.title}</h2>
               </div>
               <TrendingUp className="w-8 h-8 text-emerald-500/50" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">Current Pledge</p>
                    <p className="text-white text-2xl font-mono font-bold">${price}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">Backers Vol</p>
                    <p className="text-white text-2xl font-mono font-bold">{volume}</p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center justify-between">
                <span className="text-emerald-400 text-xs font-medium">● Market Status: LIVE</span>
                <span className="text-gray-600 text-xs font-mono">ID: {feature.id.toString().padStart(6, '0')}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
             <button
                onClick={handleCopy}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center justify-center transition-all shadow-lg hover:shadow-emerald-500/20"
             >
                {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                {copied ? 'Copied to Clipboard!' : 'Copy "IPO" Announcement'}
             </button>
             <p className="text-center text-gray-500 text-xs">
                Share this asset card to attract more investors to this feature.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareBountyModal;
