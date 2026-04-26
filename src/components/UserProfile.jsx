import React, { useState, useEffect } from 'react';
import { DollarSign, Shield, TrendingUp, Wallet, Star, Gift, Zap, Share2, Link as LinkIcon, Users, Target, CheckCircle, Bot, Crown, Watch, Home, Plane } from 'lucide-react';
import { getPortfolio, addToPortfolio } from '../utils/portfolio';
import { triggerHaptic } from '../utils/haptics';
import { addXP, getLevelData } from '../utils/leveling';
import confetti from 'canvas-confetti';

const UserProfile = () => {
    const [portfolio, setPortfolio] = useState([]);
    const [cashBalance, setCashBalance] = useState(0);
    const [netWorth, setNetWorth] = useState(0);
    const [levelData, setLevelData] = useState(getLevelData());
    const [badges, setBadges] = useState([]);
    const [mining, setMining] = useState(false);
        const [username, setUsername] = useState('Trader');

    const [openingCrate, setOpeningCrate] = useState(false);

    // AI Auto-Trader State
    const [autoTraderActive, setAutoTraderActive] = useState(false);
    const [autoTraderStats, setAutoTraderStats] = useState({ profit: 0, trades: 0 });

    const [luxuryItems, setLuxuryItems] = useState([]);

    // Weekly Challenges State
    const [challenges, setChallenges] = useState([
        { id: 'c1', title: 'Vote on 3 features', reward: 5, progress: 0, goal: 3, claimed: false },
        { id: 'c2', title: 'Mine $5.00 cash', reward: 10, progress: 0, goal: 1, claimed: false },
        { id: 'c3', title: 'Buy 1 Call Option', reward: 15, progress: 0, goal: 1, claimed: false }
    ]);

    useEffect(() => {
        const savedChallenges = localStorage.getItem('challenges_state');
        if (savedChallenges) {
            setChallenges(JSON.parse(savedChallenges));
        }

        // Load luxury items
        const ownedItems = JSON.parse(localStorage.getItem('luxury_assets') || '[]');
        setLuxuryItems(ownedItems);
    }, []);

    const getVIPStatus = () => {
        if (netWorth >= 10000000) return { name: 'Black Card (Trillionaire)', color: 'from-gray-900 to-black', border: 'border-gray-700', text: 'text-gray-300', icon: <Crown className="w-5 h-5 text-gray-400" /> };
        if (netWorth >= 1500000) return { name: 'Diamond Tier', color: 'from-blue-600 to-blue-900', border: 'border-blue-400', text: 'text-blue-200', icon: <Crown className="w-5 h-5 text-blue-300" /> };
        if (netWorth >= 250000) return { name: 'Platinum Tier', color: 'from-purple-600 to-purple-900', border: 'border-purple-400', text: 'text-purple-200', icon: <Crown className="w-5 h-5 text-purple-300" /> };
        if (netWorth >= 50000) return { name: 'Gold Tier', color: 'from-yellow-600 to-yellow-900', border: 'border-yellow-400', text: 'text-yellow-200', icon: <Crown className="w-5 h-5 text-yellow-300" /> };
        if (netWorth >= 10000) return { name: 'Silver Tier', color: 'from-gray-400 to-gray-600', border: 'border-gray-300', text: 'text-gray-100', icon: <Star className="w-5 h-5 text-gray-200" /> };
        return { name: 'Standard Member', color: 'from-slate-700 to-slate-800', border: 'border-slate-600', text: 'text-slate-300', icon: <Shield className="w-5 h-5 text-slate-400" /> };
    };

    const vip = getVIPStatus();

    useEffect(() => {
        let interval;
        if (autoTraderActive) {
            interval = setInterval(async () => {
                try {
                    const response = await fetch('/api/features');
                    const features = await response.json();

                    if (features && features.length > 0) {
                        const randomFeature = features[Math.floor(Math.random() * features.length)];

                        // Check cash balance
                        const currentCashStr = localStorage.getItem('cash_balance') || '0';
                        let currentCash = parseFloat(currentCashStr);

                        const tradeAmount = 10; // Auto-invest up to $10 target

                        // Calculate actual shares and cost first
                        const sharesToBuy = Math.floor(tradeAmount / Math.max(1, randomFeature.current_price));
                        const actualCost = sharesToBuy * randomFeature.current_price;

                        if (sharesToBuy > 0 && currentCash >= actualCost) {
                            // Deduct exact cash ONCE
                            currentCash -= actualCost;
                            localStorage.setItem('cash_balance', currentCash.toString());
                            setCashBalance(currentCash);

                            // Add to portfolio
                            addToPortfolio({
                                id: randomFeature.id,
                                title: randomFeature.title,
                                shares: sharesToBuy,
                                avgPrice: randomFeature.current_price,
                                type: 'long'
                            });

                            setPortfolio(getPortfolio());

                            // Simulate random profit/loss for the stats
                            const fakeProfit = (Math.random() * 5) - 1.5; // Random between -1.5 and 3.5

                            setAutoTraderStats(prev => ({
                                profit: prev.profit + fakeProfit,
                                trades: prev.trades + 1
                            }));

                            // Optionally give XP
                            const newLevel = addXP(5);
                            setLevelData(newLevel);
                        } else if (currentCash < tradeAmount) {
                            // Not enough cash, turn off
                            setAutoTraderActive(false);
                        }
                    }
                } catch (error) {
                    console.error("Auto-Trader Error:", error);
                }
            }, 5000); // Run every 5 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoTraderActive]);

    const saveChallenges = (newChallenges) => {
        setChallenges(newChallenges);
        localStorage.setItem('challenges_state', JSON.stringify(newChallenges));
    };

    const handleSimulateChallengeProgress = (id) => {
        const newChallenges = challenges.map(c => {
            if (c.id === id && !c.claimed && c.progress < c.goal) {
                return { ...c, progress: c.goal };
            }
            return c;
        });
        saveChallenges(newChallenges);
    };

    const handleClaimChallenge = (id, reward) => {
        const challenge = challenges.find(c => c.id === id);
        if (!challenge || challenge.claimed || challenge.progress < challenge.goal) return;

        const newChallenges = challenges.map(c => {
            if (c.id === id) {
                return { ...c, claimed: true };
            }
            return c;
        });
        saveChallenges(newChallenges);

        const updatedBalance = cashBalance + reward;
        setCashBalance(updatedBalance);
        localStorage.setItem('cash_balance', updatedBalance.toFixed(2));
        setNetWorth(prev => prev + reward);

        triggerHaptic('success');
        handleXP(50); // 50 XP for challenge
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10B981', '#3B82F6']
        });
    };

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


    const showLevelUp = (level) => {
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#FFD700', '#FFA500', '#FF8C00']
        });
        alert(`🎉 LEVEL UP! You reached Level ${level}! 🎉`);
    };

    const handleXP = (amount) => {
        const { leveledUp, newLevel } = addXP(amount);
        setLevelData(getLevelData());
        if (leveledUp) {
            showLevelUp(newLevel);
        }
    };

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
            handleXP(5); // 5 XP for mining

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
            handleXP(15); // 15 XP for crate
            setTimeout(() => alert(prizeMessage), 100);
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
                <div className="bg-emerald-600 h-32 relative overflow-hidden">
                    {/* VIP Background Layer */}
                    <div className={`absolute inset-0 bg-gradient-to-r opacity-90 ${vip.color}`}></div>
                    <div className="absolute -bottom-12 left-8 z-10">
                        <div className="w-24 h-24 bg-white rounded-full p-1 border-4 border-white shadow-lg">
                            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-3xl">
                                🧑‍💻
                            </div>
                        </div>
                    </div>
                    {/* VIP Label */}
                    <div className="absolute top-4 right-4 z-10">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold uppercase tracking-widest shadow-lg border ${vip.border} ${vip.text} bg-black/40 backdrop-blur-sm`}>
                            {vip.icon} {vip.name}
                        </span>
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


                    {/* Level System */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-8 mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-500" />
                                Rep Level {levelData.level}
                            </h3>
                            <span className="text-sm text-gray-500 font-bold">{levelData.xp} XP</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all duration-500" style={{ width: `${levelData.progressPercent}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-400 text-right mt-1">{levelData.nextLevelXp - levelData.xp} XP to Level {levelData.level + 1}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">

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

                    {/* AI Auto-Trader */}
                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Bot className="w-5 h-5 text-indigo-500" />
                            AI Auto-Trader
                        </h3>
                        <div className="bg-gray-900 rounded-xl p-6 text-white relative overflow-hidden border border-gray-800 shadow-xl">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h4 className="text-xl font-bold text-indigo-400 mb-1">Quantum Investment Bot</h4>
                                    <p className="text-sm text-gray-400 max-w-md">
                                        Activate the AI Auto-Trader to automatically scan the market and invest your cash in high-potential features. It buys $10.00 of random assets every 5 seconds.
                                    </p>
                                </div>

                                <div className="flex flex-col items-center gap-3">
                                    <button
                                        onClick={() => setAutoTraderActive(!autoTraderActive)}
                                        className={`px-8 py-3 rounded-lg font-bold text-lg shadow-lg transform transition-all active:scale-95 flex items-center gap-2 ${
                                            autoTraderActive
                                                ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/30'
                                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                                        }`}
                                    >
                                        <Bot className={`w-5 h-5 ${autoTraderActive ? 'animate-pulse' : ''}`} />
                                        {autoTraderActive ? 'HALT TRADING' : 'ACTIVATE AI'}
                                    </button>
                                </div>
                            </div>

                            <div className="relative z-10 grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-800">
                                <div className="bg-gray-800 p-4 rounded-lg text-center">
                                    <p className="text-gray-400 text-xs font-bold uppercase mb-1">Trades Executed</p>
                                    <p className="text-2xl font-black text-white">{autoTraderStats.trades}</p>
                                </div>
                                <div className="bg-gray-800 p-4 rounded-lg text-center">
                                    <p className="text-gray-400 text-xs font-bold uppercase mb-1">Est. Daily Profit</p>
                                    <p className={`text-2xl font-black ${autoTraderStats.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        ${autoTraderStats.profit.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Challenges */}
                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-indigo-500" />
                            Weekly Challenges
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            {challenges.map(challenge => (
                                <div key={challenge.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow transition-shadow">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">{challenge.title}</h4>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${challenge.claimed ? 'bg-indigo-400' : 'bg-indigo-600'} transition-all duration-500`}
                                                    style={{ width: `${(challenge.progress / challenge.goal) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-500 w-12 text-right">
                                                {challenge.progress} / {challenge.goal}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ml-6 flex items-center gap-3">
                                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                            +${challenge.reward.toFixed(2)}
                                        </span>
                                        {!challenge.claimed && challenge.progress >= challenge.goal && (
                                            <button
                                                onClick={() => handleClaimChallenge(challenge.id, challenge.reward)}
                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg shadow transition-colors"
                                            >
                                                Claim
                                            </button>
                                        )}
                                        {!challenge.claimed && challenge.progress < challenge.goal && (
                                            <button
                                                onClick={() => handleSimulateChallengeProgress(challenge.id)}
                                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded transition-colors"
                                            >
                                                Simulate
                                            </button>
                                        )}
                                        {challenge.claimed && (
                                            <span className="flex items-center text-gray-400 text-sm font-bold">
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Done
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserProfile;
