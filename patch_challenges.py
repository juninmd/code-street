import re

with open('src/components/UserProfile.jsx', 'r') as f:
    content = f.read()

# Add icons
content = content.replace("import { Trophy, Zap, Wallet, TrendingUp, Gift } from 'lucide-react';", "import { Trophy, Zap, Wallet, TrendingUp, Gift, CheckCircle, Target } from 'lucide-react';")

# Add state
state_block = """
    const [openingCrate, setOpeningCrate] = useState(false);

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
    }, []);

    const saveChallenges = (newChallenges) => {
        setChallenges(newChallenges);
        localStorage.setItem('challenges_state', JSON.stringify(newChallenges));
    };

    const handleSimulateChallengeProgress = (id) => {
        const newChallenges = challenges.map(c => {
            if (c.id === id && c.progress < c.goal) {
                return { ...c, progress: c.goal };
            }
            return c;
        });
        saveChallenges(newChallenges);
    };

    const handleClaimChallenge = (id, reward) => {
        const newChallenges = challenges.map(c => {
            if (c.id === id) {
                return { ...c, claimed: true };
            }
            return c;
        });
        saveChallenges(newChallenges);

        const currentBalance = parseFloat(localStorage.getItem('cash_balance') || '0');
        const updatedBalance = currentBalance + reward;
        setCashBalance(updatedBalance);
        localStorage.setItem('cash_balance', updatedBalance.toString());
        setNetWorth(prev => prev + reward);

        triggerHaptic('success');
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10B981', '#3B82F6']
        });
    };
"""
content = content.replace("const [openingCrate, setOpeningCrate] = useState(false);", state_block)

# Add UI
ui_block = """
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
"""

content = content.replace("</div>\n\n            </div>\n        </div>\n    );\n};\n\nexport default UserProfile;", ui_block + "        </div>\n    );\n};\n\nexport default UserProfile;")

with open('src/components/UserProfile.jsx', 'w') as f:
    f.write(content)
