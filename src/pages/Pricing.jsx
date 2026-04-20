import React, { useState } from 'react';
import { Check, Zap, Building2, Server, ArrowRight, Activity, Shield, Code } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { triggerHaptic } from '../utils/haptics';

// Use a placeholder public key for the simulation.
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const Pricing = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubscribe = async (tier) => {
        setLoading(true);
        setError(null);
        triggerHaptic('medium');

        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tier }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Network error');
            }

            const session = await response.json();

            // In a real app with valid keys, we would redirect:
            // const stripe = await stripePromise;
            // await stripe.redirectToCheckout({ sessionId: session.id });

            // For this functional mockup without real Stripe keys:
            triggerHaptic('success');
            alert(`Redirecting to Stripe Checkout for session: ${session.id}`);

        } catch (err) {
            console.error('Subscription error:', err);
            setError(err.message);
            triggerHaptic('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-sm font-semibold mb-6">
                    <Building2 className="w-4 h-4" />
                    B2B SaaS Multitenancy
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl mb-4">
                    Scale Your Feature Economy
                </h1>
                <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
                    Transform your internal backlog into a high-fidelity market. Deploy a dedicated CodeStreet Workspace for your product team.
                </p>
            </div>

            {error && (
                <div className="mb-8 max-w-2xl mx-auto bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Startup Tier */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <Activity className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Startup</h3>
                        <p className="text-gray-500 mb-6 min-h-[48px]">Perfect for small teams validating their MVP backlog.</p>
                        <div className="mb-8">
                            <span className="text-5xl font-extrabold text-gray-900">Free</span>
                            <span className="text-gray-500 text-lg font-medium">/forever</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-gray-600">Up to 10 active feature IPOs</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-gray-600">Standard 5% Platform Vig (Fee)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-gray-600">Basic market analytics</span>
                            </li>
                        </ul>

                        <button
                            className="w-full bg-gray-100 text-gray-900 font-bold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Get Started Free
                        </button>
                    </div>
                </div>

                {/* Enterprise Tier */}
                <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-8 transform md:-translate-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Shield className="w-32 h-32 text-indigo-400" />
                    </div>
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-2xl font-bold text-white">Enterprise Workspace</h3>
                            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-500/30">
                                Recommended
                            </span>
                        </div>
                        <p className="text-gray-400 mb-6 min-h-[48px]">For scale-ups routing their Vig directly to their ARR.</p>
                        <div className="mb-8 flex items-baseline gap-2">
                            <span className="text-5xl font-extrabold text-white">$499</span>
                            <span className="text-gray-400 text-lg font-medium">/month</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                <span className="text-gray-300">Unlimited feature IPOs</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                <span className="text-white font-bold">Zero Transaction Fees (0% Vig)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                <span className="text-gray-300">Custom Workspace Branding (White-label)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                <span className="text-gray-300">API Access (Jira / GitHub integration)</span>
                            </li>
                        </ul>

                        <button
                            onClick={() => handleSubscribe('enterprise')}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-4 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:from-indigo-600 disabled:hover:to-purple-600"
                        >
                            {loading ? (
                                'Initializing Checkout...'
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    Subscribe to Enterprise
                                    <ArrowRight className="w-5 h-5 ml-1" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-20 border-t border-gray-200 pt-10">
                <div className="max-w-3xl mx-auto text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Powered by CodeStreet Infrastructure</h4>
                    <p className="text-gray-500 text-sm">
                        Enterprise subscriptions are processed securely via Stripe. Upon successful payment, a dedicated <code>workspace_id</code> is provisioned automatically, isolating your market data, users, and features.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
