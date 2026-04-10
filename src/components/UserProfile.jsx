import React, { useState, useEffect } from 'react';
import { DollarSign, Shield, TrendingUp, Wallet, Star, Gift, Zap, Share2, Link as LinkIcon, Users } from 'lucide-react';
import { getPortfolio, addToPortfolio } from '../utils/portfolio';
import { triggerHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';

const UserProfile = () => {
    const [portfolio, setPortfolio] = useState([]);
    const [cashBalance, setCashBalance] = useState(0);
    const [netWorth, setNetWorth] = useState(0);
    const [badges, setBadges] = useState([]);
    const [mining, setMining] = useState(false);
        const [username, setUsername] = useState('Trader');
    const [openingCrate, setOpeningCrate] = useState(false);
    const [features, setFeatures] = useState([]);

    // Referral state
    const [referrals, setReferrals] = useState(0);
    const [referralEarnings, setReferralEarnings] = useState(0);
    const [sharingLink, setSharingLink] = useState(false);

    useEffect(() => {
        // Load Portfolio & Balance
        const storedPortfolio = getPortfolio();
        const storedCash = parseFloat(localStorage.getItem('cash_balance') || '0');
        const storedUsername = localStorage.getItem('username') || 'Trader';
        setUsername(storedUsername);

        // Calculate Holdings Value (Simulated prices for now)
        let holdingsValue = 0;
        storedPortfolio.forEach(item => {
            // In a real app, we'd fetch live prices. Here we assume price = avgPrice for simplicity
            // or fetch from API if we want accuracy. For profile view, let's just use cost basis.
            holdingsValue += (item.shares * item.avgPrice);
        });

        const total = storedCash + holdingsValue;
        setPortfolio(storedPortfolio);
        setCashBalance(storedCash);
        setNetWorth(total);

        // Determine Badges
        const newBadges = [];
        if (total > 1000) newBadges.push({ name: 'Whale', icon: <DollarSign className="w-4 h-4 text-yellow-500" />, color: 'bg-yellow-100 text-yellow-800' });
        if (storedPortfolio.length > 5) newBadges.push({ name: 'Diversified', icon: <Shield className="w-4 h-4 text-blue-500" />, color: 'bg-blue-100 text-blue-800' });
        if (storedPortfolio.some(p => p.shares > 100)) newBadges.push({ name: 'Diamond Hands', icon: <Star className="w-4 h-4 text-purple-500" />, color: 'bg-purple-100 text-purple-800' });
                if (newBadges.length === 0) newBadges.push({ name: 'Rookie', icon: <Wallet className="w-4 h-4 text-gray-500" />, color: 'bg-gray-100 text-gray-800' });

        setBadges(newBadges);

        // Fetch features for lootbox
        fetch('/api/features').then(res => res.json()).then(data => setFeatures(data.data || []));
    }, []);

    const handleMine = () => {
        if (mining) return;
        setMining(true);
        triggerHaptic('heavy');

        setTimeout(() => {
            const reward = 0.50; // $0.50 per click
            const newBalance = cashBalance + reward;
            setCashBalance(newBalance);
            setNetWorth(netWorth + reward);
            localStorage.setItem('cash_balance', newBalance.toString());
            setMining(false);

            confetti({
                particleCount: 30,
                spread: 50,
                origin: { y: 0.7 },
                colors: ['#10B981', '#34D399']
            });
        }, 800);
    };


    const handleSimulateSharing = () => {
        if (sharingLink) return;
        setSharingLink(true);
        triggerHaptic('light');

        // Fake delay to simulate people clicking
        setTimeout(() => {
            const newSignups = Math.floor(Math.random() * 3); // 0 to 2 new signups
            if (newSignups > 0) {
                const bonus = newSignups * 5.00; // $5 per referral

                const currentBalance = parseFloat(localStorage.getItem('cash_balance') || '0');
                const nextBalance = currentBalance + bonus;

                const nextReferrals = referrals + newSignups;
                const nextEarnings = referralEarnings + bonus;

                localStorage.setItem('cash_balance', nextBalance.toFixed(2));
                localStorage.setItem('referrals_count', nextReferrals.toString());
                localStorage.setItem('referral_earnings', nextEarnings.toFixed(2));

                setCashBalance(nextBalance);
                setReferrals(nextReferrals);
                setReferralEarnings(nextEarnings);

                triggerHaptic('success');
                alert(`Viral! You got ${newSignups} new referral(s) and earned $${bonus.toFixed(2)} in affiliate commissions!`);
            } else {
                alert("Link shared, but nobody signed up yet. Try again!");
            }
            setSharingLink(false);
        }, 1500);
    };

    const handleOpenCrate = () => {
        const CRATE_COST = 10;
        if (cashBalance < CRATE_COST) {
            alert("Not enough Liquid Cash! Mine more or wait for dividends.");
            triggerHaptic('error');
            return;
        }
        if (openingCrate) return;

        setOpeningCrate(true);
        triggerHaptic('heavy');

        // Deduct cost
        const newBalance = cashBalance - CRATE_COST;
        setCashBalance(newBalance);
        localStorage.setItem('cash_balance', newBalance.toString());

        setTimeout(() => {
            const roll = Math.random();
            let prizeMessage = "";

            if (roll < 0.60 && features.length > 0) {
                // 60% chance: Common Share (1-5 shares)
                const feature = features[Math.floor(Math.random() * features.length)];
                const shares = Math.floor(Math.random() * 5) + 1;
                const currentPrice = feature.current_price || 1;
                addToPortfolio(feature.id.toString(), shares, currentPrice);
                prizeMessage = `You found ${shares} shares of ${feature.title}!`;
            } else if (roll < 0.90) {
                // 30% chance: Cash Prize ($2 - $15)
                const cashPrize = Math.floor(Math.random() * 14) + 2;
                const updatedBalance = newBalance + cashPrize;
                setCashBalance(updatedBalance);
                localStorage.setItem('cash_balance', updatedBalance.toString());
                prizeMessage = `You found ${cashPrize.toFixed(2)} in Cash!`;
            } else if (roll < 0.99 && features.length > 0) {
                // 9% chance: Rare Share (10-20 shares)
                const feature = features[Math.floor(Math.random() * features.length)];
                const shares = Math.floor(Math.random() * 11) + 10;
                const currentPrice = feature.current_price || 1;
                addToPortfolio(feature.id.toString(), shares, currentPrice);
                prizeMessage = `RARE DROP! ${shares} shares of ${feature.title}!`;
            } else {
                // 1% chance: WHALE JACKPOT ($100 cash)
                const cashPrize = 100;
                const updatedBalance = newBalance + cashPrize;
                setCashBalance(updatedBalance);
                localStorage.setItem('cash_balance', updatedBalance.toString());
                prizeMessage = `WHALE JACKPOT! You found ${cashPrize.toFixed(2)} in Cash!`;
            }

            // Update UI State
            const updatedPortfolio = getPortfolio();
            let holdingsValue = 0;
            updatedPortfolio.forEach(item => {
                holdingsValue += (item.shares * item.avgPrice);
            });
            setPortfolio(updatedPortfolio);
            setNetWorth(parseFloat(localStorage.getItem('cash_balance') || '0') + holdingsValue);

            setOpeningCrate(false);

            triggerHaptic('success');
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#10B981', '#FFD700', '#F59E0B']
            });

            alert(prizeMessage);
        }, 1500);
    };

    const handleSaveName = (e) => {
        e.preventDefault();
        localStorage.setItem('username', username);
        alert('Profile Updated!');
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 animate-fade-in-up">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-emerald-600 h-32 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="w-24 h-24 bg-white rounded-full p-1 border-4 border-white shadow-lg">
                            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-3xl">
                                🧑‍💻
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-16 px-8 pb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <form onSubmit={handleSaveName} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="text-2xl font-bold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-emerald-500 focus:outline-none bg-transparent"
                                />
                                <button type="submit" className="text-xs text-emerald-600 hover:text-emerald-700 font-bold">SAVE</button>
                            </form>
                            <p className="text-gray-500 text-sm">Level 1 Investor</p>
                        </div>
                        <div className="flex gap-2">
                            {badges.map((b, i) => (
                                <span key={i} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${b.color} border border-black/5`}>
                                    {b.icon}
                                    <span className="ml-1.5">{b.name}</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Net Worth</p>
                            <p className="text-2xl font-bold text-gray-900">${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Liquid Cash</p>
                            <p className="text-2xl font-bold text-emerald-600">${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Portfolio Assets</p>
                            <p className="text-2xl font-bold text-blue-600">{portfolio.length}</p>
                        </div>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-gray-400" />
                                Faucet (Mining Simulator)
                            </h3>
                            <div className="bg-gray-900 rounded-xl p-6 text-center text-white relative overflow-hidden group h-48 flex flex-col justify-center">
                                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                 <p className="relative z-10 text-gray-400 text-sm mb-4">Click to simulate proof-of-work mining and earn cash.</p>
                                 <button
                                    onClick={handleMine}
                                    disabled={mining}
                                    className={`relative z-10 w-full md:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg shadow-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto`}
                                 >
                                     {mining ? (
                                         <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            Mining Block...
                                         </>
                                     ) : (
                                         <>
                                            <Wallet className="w-5 h-5" />
                                            Mine $0.50
                                         </>
                                     )}
                                 </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Gift className="w-5 h-5 text-amber-500" />
                                Mystery Crates
                            </h3>
                            <div className="bg-gradient-to-br from-amber-900 to-amber-700 rounded-xl p-6 text-center text-white relative overflow-hidden group h-48 flex flex-col justify-center border border-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                 <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                 <p className="relative z-10 text-amber-200 text-sm mb-4 font-medium">Cost: <span className="text-white font-bold">$10.00</span>. Win Shares or Cash Jackpots!</p>
                                 <button
                                    onClick={handleOpenCrate}
                                    disabled={openingCrate || cashBalance < 10}
                                    className={`relative z-10 w-full md:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-extrabold rounded-lg shadow-xl transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto border-b-4 border-amber-600`}
                                 >
                                     {openingCrate ? (
                                         <>
                                            <Zap className="w-5 h-5 animate-bounce" />
                                            Opening...
                                         </>
                                     ) : (
                                         <>
                                            <Gift className="w-5 h-5" />
                                            Buy Mystery Crate
                                         </>
                                     )}
                                 </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserProfile;
