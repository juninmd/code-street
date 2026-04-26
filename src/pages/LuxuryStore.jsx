import React, { useState, useEffect } from 'react';
import { Gem, Plane, Home, Watch, Crown, CheckCircle } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

const LUXURY_ITEMS = [
    {
        id: 'rolex_daytona',
        name: 'Virtual Rolex Daytona',
        description: 'Flex on the haters. Increases your daily dividend by 0.1%.',
        price: 50000,
        icon: <Watch className="w-12 h-12 text-yellow-400" />,
        tier: 'gold',
        bgColor: 'bg-yellow-900/20',
        borderColor: 'border-yellow-500/50'
    },
    {
        id: 'silicon_penthouse',
        name: 'Silicon Valley Penthouse',
        description: 'A place to crash after a long day of market manipulation.',
        price: 250000,
        icon: <Home className="w-12 h-12 text-purple-400" />,
        tier: 'platinum',
        bgColor: 'bg-purple-900/20',
        borderColor: 'border-purple-500/50'
    },
    {
        id: 'private_jet',
        name: 'Gulfstream G650ER',
        description: 'Why fly commercial when you are the market maker?',
        price: 1500000,
        icon: <Plane className="w-12 h-12 text-blue-400" />,
        tier: 'diamond',
        bgColor: 'bg-blue-900/20',
        borderColor: 'border-blue-500/50'
    },
    {
        id: 'private_island',
        name: 'Uncharted Island',
        description: 'Complete tax evasion. The ultimate flex.',
        price: 10000000,
        icon: <Crown className="w-12 h-12 text-emerald-400" />,
        tier: 'exclusive',
        bgColor: 'bg-emerald-900/20',
        borderColor: 'border-emerald-500/50'
    }
];

const LuxuryStore = () => {
    const [cash, setCash] = useState(0);
    const [ownedItems, setOwnedItems] = useState([]);

    useEffect(() => {
        const currentCash = parseFloat(localStorage.getItem('cash_balance') || '1000.00');
        setCash(currentCash);

        const loadedItems = JSON.parse(localStorage.getItem('luxury_assets') || '[]');
        setOwnedItems(loadedItems);
    }, []);

    const handlePurchase = (item) => {
        if (cash < item.price) {
            triggerHaptic('error');
            alert(`Insufficient funds! You need $${(item.price - cash).toLocaleString()} more.`);
            return;
        }

        if (ownedItems.includes(item.id)) {
            alert('You already own this item!');
            return;
        }

        const newCash = cash - item.price;
        setCash(newCash);
        localStorage.setItem('cash_balance', newCash.toFixed(2));

        const newOwned = [...ownedItems, item.id];
        setOwnedItems(newOwned);
        localStorage.setItem('luxury_assets', JSON.stringify(newOwned));

        triggerHaptic('success');

        // Add XP for large purchases
        let currentXp = parseInt(localStorage.getItem('user_xp') || '0', 10);
        const xpReward = Math.floor(item.price / 100);
        localStorage.setItem('user_xp', (currentXp + xpReward).toString());
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/30 border border-amber-500/50 text-amber-400 text-sm font-semibold mb-6">
                    <Gem className="w-4 h-4" />
                    Exclusive VIP Access
                </div>
                <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl mb-4">
                    The Luxury Store
                </h1>
                <p className="max-w-xl mt-5 mx-auto text-xl text-gray-400">
                    You've manipulated the market. You've shorted the startups. Now, it's time to enjoy the spoils of war.
                </p>
                <div className="mt-8 inline-block bg-gray-800 rounded-2xl border border-gray-700 p-4 shadow-xl">
                    <p className="text-sm text-gray-400 mb-1">Available Capital</p>
                    <p className="text-3xl font-black text-emerald-400 font-mono">${cash.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                {LUXURY_ITEMS.map((item) => {
                    const isOwned = ownedItems.includes(item.id);
                    const canAfford = cash >= item.price;

                    return (
                        <div
                            key={item.id}
                            className={`relative rounded-3xl overflow-hidden border-2 transition-all duration-500 ${
                                isOwned
                                    ? 'bg-gray-800 border-gray-600 opacity-80'
                                    : `${item.bgColor} ${item.borderColor} hover:scale-105 hover:shadow-2xl hover:shadow-${item.tier}-500/20`
                            }`}
                        >
                            {isOwned && (
                                <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/50 flex items-center gap-1 backdrop-blur-sm">
                                    <CheckCircle className="w-3 h-3" />
                                    OWNED
                                </div>
                            )}

                            <div className="p-8 flex flex-col items-center text-center h-full">
                                <div className={`p-6 rounded-full bg-gray-900 border-2 border-gray-800 mb-6 shadow-inner ${isOwned ? 'grayscale' : ''}`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                                <p className="text-sm text-gray-400 mb-8 flex-grow">{item.description}</p>

                                <div className="w-full mt-auto">
                                    <div className="text-2xl font-black text-white font-mono mb-4">
                                        ${item.price.toLocaleString()}
                                    </div>
                                    <button
                                        onClick={() => handlePurchase(item)}
                                        disabled={isOwned || !canAfford}
                                        className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                            isOwned
                                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                : canAfford
                                                    ? 'bg-white text-gray-900 hover:bg-gray-200 hover:shadow-lg hover:-translate-y-1'
                                                    : 'bg-red-900/50 text-red-400 border border-red-500/50 cursor-not-allowed'
                                        }`}
                                    >
                                        {isOwned ? (
                                            'Already in Vault'
                                        ) : canAfford ? (
                                            <>
                                                <Gem className="w-4 h-4" /> Acquire Asset
                                            </>
                                        ) : (
                                            'Insufficient Funds'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {ownedItems.length > 0 && (
                <div className="mt-24 text-center">
                     <p className="text-gray-500 text-sm">Your assets are secured on the blockchain.</p>
                </div>
            )}
        </div>
    );
};

export default LuxuryStore;