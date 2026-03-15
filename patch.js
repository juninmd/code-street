const fs = require('fs');
let file = fs.readFileSync('src/components/UserProfile.jsx', 'utf8');

const importReplacement = `import { DollarSign, Shield, TrendingUp, Wallet, Star, Gift, Zap } from 'lucide-react';
import { getPortfolio, addToPortfolio } from '../utils/portfolio';`;

file = file.replace(
  "import { DollarSign, Shield, TrendingUp, Wallet, Star } from 'lucide-react';\nimport { getPortfolio } from '../utils/portfolio';",
  importReplacement
);

const stateReplacement = `    const [username, setUsername] = useState('Trader');
    const [openingCrate, setOpeningCrate] = useState(false);
    const [features, setFeatures] = useState([]);`;

file = file.replace(
    "const [username, setUsername] = useState('Trader');",
    stateReplacement
);

const fetchFeaturesReplacement = `        if (newBadges.length === 0) newBadges.push({ name: 'Rookie', icon: <Wallet className="w-4 h-4 text-gray-500" />, color: 'bg-gray-100 text-gray-800' });

        setBadges(newBadges);

        // Fetch features for lootbox
        fetch('/api/features').then(res => res.json()).then(data => setFeatures(data.data || []));`;

file = file.replace(
    "if (newBadges.length === 0) newBadges.push({ name: 'Rookie', icon: <Wallet className=\"w-4 h-4 text-gray-500\" />, color: 'bg-gray-100 text-gray-800' });\n\n        setBadges(newBadges);",
    fetchFeaturesReplacement
);

const handleOpenCrate = `
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
                prizeMessage = \`You found \${shares} shares of \${feature.title}!\`;
            } else if (roll < 0.90) {
                // 30% chance: Cash Prize ($2 - $15)
                const cashPrize = Math.floor(Math.random() * 14) + 2;
                const updatedBalance = newBalance + cashPrize;
                setCashBalance(updatedBalance);
                localStorage.setItem('cash_balance', updatedBalance.toString());
                prizeMessage = \`You found $\${cashPrize.toFixed(2)} in Cash!\`;
            } else if (roll < 0.99 && features.length > 0) {
                // 9% chance: Rare Share (10-20 shares)
                const feature = features[Math.floor(Math.random() * features.length)];
                const shares = Math.floor(Math.random() * 11) + 10;
                const currentPrice = feature.current_price || 1;
                addToPortfolio(feature.id.toString(), shares, currentPrice);
                prizeMessage = \`RARE DROP! \${shares} shares of \${feature.title}!\`;
            } else {
                // 1% chance: WHALE JACKPOT ($100 cash)
                const cashPrize = 100;
                const updatedBalance = newBalance + cashPrize;
                setCashBalance(updatedBalance);
                localStorage.setItem('cash_balance', updatedBalance.toString());
                prizeMessage = \`WHALE JACKPOT! You found $\${cashPrize.toFixed(2)} in Cash!\`;
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
`;

file = file.replace(
    "const handleSaveName = (e) => {",
    handleOpenCrate + "\n    const handleSaveName = (e) => {"
);

const crateUI = `
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
                                    className={\`relative z-10 w-full md:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg shadow-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto\`}
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
                                    className={\`relative z-10 w-full md:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-extrabold rounded-lg shadow-xl transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto border-b-4 border-amber-600\`}
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
`;

file = file.replace(
    `<div className="mt-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-gray-400" />
                            Faucet (Mining Simulator)
                        </h3>
                        <div className="bg-gray-900 rounded-xl p-6 text-center text-white relative overflow-hidden group">
                             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                             <p className="relative z-10 text-gray-400 text-sm mb-4">Click to simulate proof-of-work mining and earn cash.</p>
                             <button
                                onClick={handleMine}
                                disabled={mining}
                                className={\`relative z-10 w-full md:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg shadow-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto\`}
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
                </div>`,
    crateUI
);

fs.writeFileSync('src/components/UserProfile.jsx', file);
