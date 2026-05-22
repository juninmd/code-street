import React, { useState, useEffect } from 'react';
import { Building2, Server, Globe, Cpu, Zap, DollarSign, ArrowUpCircle } from 'lucide-react';
import { getCashBalance, updateCashBalance, formatCurrency } from '../utils/portfolio';
import { triggerHaptic } from '../utils/haptics';

const ASSET_TYPES = [
  { id: 'shared_hosting', name: 'Shared Hosting', icon: Globe, baseCost: 100, baseIncome: 1, description: 'Basic hosting for small sites.' },
  { id: 'vps', name: 'VPS', icon: Server, baseCost: 500, baseIncome: 6, description: 'Virtual Private Server.' },
  { id: 'dedicated_server', name: 'Dedicated Server', icon: Building2, baseCost: 2000, baseIncome: 30, description: 'Your own physical hardware.' },
  { id: 'ai_data_center', name: 'AI Data Center', icon: Cpu, baseCost: 10000, baseIncome: 180, description: 'GPUs goes brrr.' },
  { id: 'quantum_network', name: 'Quantum Network', icon: Zap, baseCost: 50000, baseIncome: 1000, description: 'The future of computing.' },
];

const Empire = () => {
  const [cash, setCash] = useState(getCashBalance());
  const [assets, setAssets] = useState({});
  const [totalIncome, setTotalIncome] = useState(0);

  // Load state
  useEffect(() => {
    const handleCashUpdate = () => setCash(getCashBalance());
    window.addEventListener('cash_balance_updated', handleCashUpdate);

    const storedAssets = localStorage.getItem('empire_assets');
    let loadedAssets = {};
    if (storedAssets) {
      try {
        loadedAssets = JSON.parse(storedAssets);
      } catch (e) {
        console.error("Failed to parse empire_assets", e);
      }
    }
    setAssets(loadedAssets);

    return () => window.removeEventListener('cash_balance_updated', handleCashUpdate);
  }, []);

  // Calculate total income and set up interval
  useEffect(() => {
    let incomePerSecond = 0;
    ASSET_TYPES.forEach(asset => {
      const count = assets[asset.id] || 0;
      incomePerSecond += count * asset.baseIncome;
    });
    setTotalIncome(incomePerSecond);

    if (incomePerSecond > 0) {
      const interval = setInterval(() => {
        // Add income per second (divided by 10 for 100ms updates to make it smooth, or just update every second)
        // Let's do every 1 second to not spam localStorage too much, or every 500ms
        updateCashBalance(incomePerSecond / 2);
        setCash(getCashBalance());
      }, 500);

      return () => clearInterval(interval);
    }
  }, [assets]);

  const getAssetCost = (assetId, baseCost) => {
    const count = assets[assetId] || 0;
    return baseCost * Math.pow(1.15, count);
  };

  const buyAsset = (asset) => {
    const cost = getAssetCost(asset.id, asset.baseCost);
    if (cash >= cost) {
      updateCashBalance(-cost);
      setCash(getCashBalance());

      const newAssets = {
        ...assets,
        [asset.id]: (assets[asset.id] || 0) + 1
      };
      setAssets(newAssets);
      localStorage.setItem('empire_assets', JSON.stringify(newAssets));
      triggerHaptic('success');
    } else {
      triggerHaptic('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SaaS Empire</h1>
            <p className="text-sm text-gray-500">Build your digital infrastructure and generate passive income.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Available Cash</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(cash)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-200" />
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Passive Income</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalIncome)}</p>
                <p className="text-sm font-medium text-blue-500">/ sec</p>
              </div>
            </div>
            <ArrowUpCircle className="w-8 h-8 text-blue-200 animate-pulse" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Infrastructure Assets</h2>
          <div className="grid grid-cols-1 gap-4">
            {ASSET_TYPES.map(asset => {
              const currentCost = getAssetCost(asset.id, asset.baseCost);
              const count = assets[asset.id] || 0;
              const canAfford = cash >= currentCost;
              const AssetIcon = asset.icon;

              return (
                <div key={asset.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all ${canAfford ? 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className={`p-3 rounded-lg ${count > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      <AssetIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{asset.name}</h3>
                      <p className="text-xs text-gray-500">{asset.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                          +{formatCurrency(asset.baseIncome)}/s
                        </span>
                        {count > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            Owned: {count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => buyAsset(asset)}
                    disabled={!canAfford}
                    className={`w-full sm:w-auto px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      canAfford
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow active:scale-95'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Buy Asset
                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                      {formatCurrency(currentCost)}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Empire;
