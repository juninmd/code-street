import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { MessageSquare, Map, PartyPopper, PlusCircle, Briefcase, Download, X, PieChart, AlertCircle, User, Activity, Brain, Building2, Crown } from 'lucide-react';
import LiveTicker from './components/LiveTicker';
import IPOAlert from './components/IPOAlert';

const Layout = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [marketAlert, setMarketAlert] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    setShowInstallBanner(false);
  };

  // Market Volatility Simulator
  useEffect(() => {
    const triggerEvent = () => {
         const events = [
            { type: 'bull', message: "🚀 BULL RUN! Institutional investors are buying in.", color: "bg-emerald-600" },
            { type: 'bear', message: "🐻 CORRECTION! Prices dip as servers overheat.", color: "bg-red-600" },
            { type: 'news', message: "📢 NEWS: TechCrunch just mentioned CodeStreet!", color: "bg-blue-600" },
            { type: 'whale', message: "🐳 WHALE ALERT: Massive pledge detected.", color: "bg-purple-600" },
            { type: 'ipo', message: "🔔 IPO ALERT: New feature filing expected soon.", color: "bg-yellow-600" }
        ];

        // 10% chance of an event happening when scheduled
        if (Math.random() > 0.3) {
             const event = events[Math.floor(Math.random() * events.length)];
             setMarketAlert(event);
             setTimeout(() => setMarketAlert(null), 6000);
        }
    };

    const interval = setInterval(() => {
        triggerEvent();
    }, 45000); // Check every 45s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <LiveTicker />
      <IPOAlert />

      {/* Market Event Toast */}
      {marketAlert && (
          <div className={`fixed top-14 left-1/2 transform -translate-x-1/2 z-[100] ${marketAlert.color} text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center gap-3 animate-in slide-in-from-top-4 duration-500 font-bold border-2 border-white/20`}>
              <AlertCircle className="w-5 h-5 animate-pulse" />
              <span className="drop-shadow-md text-sm sm:text-base whitespace-nowrap">{marketAlert.message}</span>
          </div>
      )}

      {/* Desktop Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-emerald-600 tracking-tight">CodeStreet</span>
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800">
                    <Activity className="w-3 h-3 mr-1" />
                    MARKET: OPEN
                </span>
              </div>
              <div className="ml-6 flex space-x-8">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-emerald-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                  end
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Exchange
                </NavLink>
                <NavLink
                  to="/portfolio"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-emerald-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  <PieChart className="w-4 h-4 mr-2" />
                  Portfolio
                </NavLink>
                <NavLink
                  to="/hunter"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-emerald-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Talent
                </NavLink>
                <NavLink
                  to="/roadmap"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-emerald-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  <Map className="w-4 h-4 mr-2" />
                  Futures
                </NavLink>
                <NavLink
                  to="/changelog"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-emerald-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  <PartyPopper className="w-4 h-4 mr-2" />
                  IPO History
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-emerald-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </NavLink>
                <NavLink
                  to="/luxury"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-amber-500 text-amber-900'
                        : 'border-transparent text-amber-600 hover:border-amber-300 hover:text-amber-800'
                    }`
                  }
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Luxury
                </NavLink>
                <NavLink
                  to="/foundry"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-purple-500 text-purple-900'
                        : 'border-transparent text-purple-600 hover:border-purple-300 hover:text-purple-800'
                    }`
                  }
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Foundry
                </NavLink>
                <NavLink
                  to="/pricing"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-blue-900'
                        : 'border-transparent text-blue-600 hover:border-blue-300 hover:text-blue-800'
                    }`
                  }
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  B2B SaaS
                </NavLink>
                <NavLink
                  to="/agency"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-indigo-500 text-indigo-900'
                        : 'border-transparent text-indigo-600 hover:border-indigo-300 hover:text-indigo-800'
                    }`
                  }
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  AI Agency
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 sm:hidden flex items-center justify-between px-4 h-14">
        <span className="text-lg font-bold text-emerald-600 tracking-tight">CodeStreet</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
             <Activity className="w-3 h-3 mr-1" />
             OPEN
        </span>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <Outlet />
      </main>

      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-20 left-4 right-4 z-50 bg-emerald-900 rounded-lg p-4 shadow-2xl flex items-center justify-between border border-emerald-700 sm:bottom-4 sm:left-auto sm:right-4 sm:w-96 animate-fade-in-up">
          <div className="flex items-center text-white">
            <div className="bg-emerald-700 p-2 rounded-full mr-3">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Install Android App</p>
              <p className="text-emerald-200 text-xs">Add to home screen for quick access</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleInstallClick}
              className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold py-2 px-3 rounded transition-colors"
            >
              Install
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="text-emerald-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 sm:hidden pb-safe">
        <div className="grid grid-cols-6 h-16 overflow-x-auto">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center space-y-1 ${
                isActive ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'
              }`
            }
            end
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs font-medium">Exchange</span>
          </NavLink>
          <NavLink
            to="/portfolio"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center space-y-1 ${
                isActive ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <PieChart className="w-6 h-6" />
            <span className="text-xs font-medium">Portfolio</span>
          </NavLink>
          <NavLink
            to="/hunter"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center space-y-1 ${
                isActive ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <Briefcase className="w-6 h-6" />
            <span className="text-xs font-medium">Talent</span>
          </NavLink>
          <NavLink
            to="/profile"
             className={({ isActive }) =>
              `flex flex-col items-center justify-center space-y-1 ${
                isActive ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </NavLink>
          <NavLink
            to="/roadmap"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center space-y-1 ${
                isActive ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <Map className="w-6 h-6" />
            <span className="text-xs font-medium">Futures</span>
          </NavLink>
          <NavLink
            to="/luxury"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center space-y-1 ${
                isActive ? 'text-amber-600' : 'text-gray-500 hover:text-amber-700'
              }`
            }
          >
            <Crown className="w-6 h-6" />
            <span className="text-xs font-medium">Luxury</span>
          </NavLink>
          <NavLink
            to="/foundry"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center space-y-1 ${
                isActive ? 'text-purple-600' : 'text-gray-500 hover:text-purple-700'
              }`
            }
          >
            <Brain className="w-6 h-6" />
            <span className="text-xs font-medium">Foundry</span>
          </NavLink>
          <NavLink
            to="/pricing"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center space-y-1 ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-700'
              }`
            }
          >
            <Building2 className="w-6 h-6" />
            <span className="text-xs font-medium">SaaS</span>
          </NavLink>
          <NavLink
            to="/agency"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center space-y-1 ${
                isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-700'
              }`
            }
          >
            <Briefcase className="w-6 h-6" />
            <span className="text-xs font-medium">Agency</span>
          </NavLink>
        </div>
      </nav>

      {/* Desktop Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto hidden sm:block">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">&copy; {new Date().getFullYear()} CodeStreet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
