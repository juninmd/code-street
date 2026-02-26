import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import confetti from 'canvas-confetti';

const IPOAlert = () => {
    const [lastTimestamp, setLastTimestamp] = useState(Date.now());
    const [alert, setAlert] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch('/api/market/status');
                const json = await res.json();

                if (json.latest_ipo_timestamp > lastTimestamp) {
                    setLastTimestamp(json.latest_ipo_timestamp);
                    setAlert(true);
                    triggerNotification();
                    setTimeout(() => setAlert(false), 5000);
                }
            } catch (err) {
                // Ignore errors
            }
        };

        const interval = setInterval(checkStatus, 10000); // Check every 10s
        return () => clearInterval(interval);
    }, [lastTimestamp]);

    const triggerNotification = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }

        // Small confetti burst
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { x: 0.5, y: 0.1 },
            colors: ['#FFD700', '#FDB931'] // Gold
        });
    };

    if (!alert) return null;

    return (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in">
            <div className="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full font-bold shadow-lg border-2 border-yellow-200 flex items-center gap-2">
                <Bell className="w-5 h-5 animate-swing" />
                <span>NEW IPO JUST LISTED!</span>
            </div>
        </div>
    );
};

export default IPOAlert;
