import React, { useEffect, useState } from 'react';
import { Rocket, Share2, CheckCircle, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const IPOLaunch = ({ feature, onClose }) => {
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    // Initial Explosion
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10B981', '#FFD700']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10B981', '#FFD700']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      } else {
        setShowShare(true);
      }
    };
    frame();
  }, []);

  const handleShare = () => {
    const text = `I just launched ${feature.title} on CodeStreet! Invest now before the price spikes. #CodeStreetIPO`;
    if (navigator.share) {
      navigator.share({
        title: 'New IPO on CodeStreet',
        text: text,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="relative w-full max-w-lg mx-4 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Content */}
        <div className="space-y-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/20 border-4 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.5)] animate-bounce">
            <Rocket className="w-12 h-12 text-emerald-400" />
          </div>

          <div className="space-y-2 animate-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
              IPO Successful!
            </h2>
            <p className="text-emerald-400 font-mono text-lg">
              {feature.ticker || feature.title.substring(0, 3).toUpperCase()} is now live.
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 backdrop-blur-md max-w-sm mx-auto animate-in zoom-in duration-500 delay-300">
            <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
              <span className="text-gray-400 text-xs font-mono uppercase">Initial Price</span>
              <span className="text-emerald-400 font-mono font-bold text-xl">$1.00</span>
            </div>
            <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
              <span className="text-gray-400 text-xs font-mono uppercase">Est. Market Cap</span>
              <span className="text-white font-mono font-bold text-lg">
                ${((feature.pledged_amount || 0) * 100).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 text-yellow-500 text-xs font-bold uppercase tracking-wider">
               <CheckCircle className="w-4 h-4" />
               SEC Form 424B4 Filed
            </div>
          </div>

          <button
            onClick={handleShare}
            className={`bg-white text-black font-bold py-4 px-8 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-3 mx-auto ${showShare ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} duration-500`}
          >
            <Share2 className="w-5 h-5" />
            Share Prospectus
          </button>
        </div>
      </div>
    </div>
  );
};

export default IPOLaunch;
