import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle, X } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

const PaymentModal = ({ amount, onConfirm, onClose }) => {
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Input, 2: Success

  const fee = amount * 0.05;
  const total = amount + fee;

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate API delay
    setTimeout(() => {
        setProcessing(false);
        setStep(2);
        triggerHaptic('heavy');

        // Auto-close after success
        setTimeout(() => {
            onConfirm(); // Trigger the actual pledge logic
        }, 1500);
    }, 2000);
  };

  if (step === 2) {
      return (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform scale-100 transition-all">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful</h3>
                  <p className="text-gray-500 text-sm">Your investment has been recorded on the blockchain.</p>
              </div>
          </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                Secure Checkout
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Amount Summary */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-sm text-gray-500">Investment Amount</p>
                    <p className="text-lg font-bold text-gray-900">${amount.toFixed(2)}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Platform Fee (5%)</p>
                    <p className="text-lg font-bold text-gray-900">${fee.toFixed(2)}</p>
                </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 mb-4 flex justify-between items-center">
                <span className="text-emerald-800 font-bold text-sm">Total Due</span>
                <span className="text-emerald-800 font-mono font-bold text-xl">${total.toFixed(2)}</span>
            </div>

            {/* Card Details */}
            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Card Number</label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            className="pl-9 w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm py-2.5 border"
                            required
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Expiry</label>
                        <input
                            type="text"
                            placeholder="MM / YY"
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm py-2.5 border px-3"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">CVC</label>
                        <input
                            type="text"
                            placeholder="123"
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm py-2.5 border px-3"
                            required
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={processing}
                className="w-full mt-4 bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {processing ? 'Processing Transaction...' : `Pay $${total.toFixed(2)}`}
            </button>

            <p className="text-xs text-center text-gray-400 mt-2">
                Powered by CodeStreet Payments. Encrypted & Secure.
            </p>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
