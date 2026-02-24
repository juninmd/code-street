import React, { useState, useEffect } from 'react';

const NEWS_ITEMS = [
  "BREAKING: 'Dark Mode' IPO Oversubscribed by 500%",
  "ANALYST ALERT: 'Mobile App' target price raised to $1,000",
  "RUMOR: Admin planning 20% dividend payout next week",
  "MARKET UPDATE: Frontend Sector leads the rally (+12%)",
  "WHALE ALERT: Unknown entity just pledged $500 to 'AI Chatbot'",
  "INSIDER: 'Bug Fixes' yield curve inverts, signaling stability",
  "TECH: New framework detected in 'Backend' sector",
  "IPO: 'SaaS Platform' files for listing on CodeStreet",
  "EARNINGS: 'Dev Tools' reports record engagement metrics"
];

const NewsTicker = () => {
  return (
    <div className="bg-emerald-950 border-b border-emerald-900 text-emerald-400 text-xs font-mono py-1 overflow-hidden whitespace-nowrap relative z-50">
      <div className="inline-block animate-marquee">
        {NEWS_ITEMS.map((item, i) => (
          <span key={i} className="mx-8 inline-flex items-center">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            {item}
          </span>
        ))}
        {/* Duplicate for seamless loop */}
        {NEWS_ITEMS.map((item, i) => (
          <span key={`dup-${i}`} className="mx-8 inline-flex items-center">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 60s linear infinite;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default NewsTicker;
