import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { DollarSign, Activity } from 'lucide-react';

const WhaleAlert = () => {
    const [alert, setAlert] = useState(null);
    const lastPledgeIdRef = useRef(0);

    // Initial fetch to set baseline
    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const res = await fetch('/api/pledges/recent');
                const json = await res.json();
                if (json.data && json.data.length > 0) {
                    lastPledgeIdRef.current = json.data[0].id;
                }
            } catch (err) {
                console.error("Initial pledge fetch failed", err);
            }
        };
        fetchInitial();
    }, []);

    // Polling
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/pledges/recent');
                const json = await res.json();
                const pledges = json.data || [];

                if (pledges.length === 0) return;

                const newPledges = pledges.filter(p => p.id > lastPledgeIdRef.current);
                if (newPledges.length > 0) {
                    // Update baseline to the newest one
                    lastPledgeIdRef.current = newPledges[0].id;

                    // Find the most significant whale in this batch
                    const whale = newPledges.find(p => p.amount >= 50);
                    if (whale) {
                        setAlert(whale);
                        triggerConfetti();

                        // Auto dismiss
                        setTimeout(() => setAlert(null), 8000);
                    }
                }
            } catch (err) {
                console.error("Polling failed", err);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const triggerConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    };

    if (!alert) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom duration-500">
            <div className="bg-emerald-900 border-2 border-emerald-500 text-white p-4 rounded-xl shadow-2xl flex items-center gap-4 max-w-sm">
                <div className="bg-emerald-500/20 p-3 rounded-full animate-pulse">
                    <DollarSign className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                    <h4 className="font-extrabold text-lg text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                        Whale Alert! <Activity className="w-4 h-4" />
                    </h4>
                    <p className="text-sm font-medium">
                        Someone just dropped <span className="text-emerald-400 font-bold">${alert.amount}</span> on "{alert.title}"!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WhaleAlert;
