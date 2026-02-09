import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { MessageSquare, Map, PartyPopper, PlusCircle, Briefcase, Download, X, PieChart } from 'lucide-react';
import LiveTicker from './components/LiveTicker';

const Layout = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <LiveTicker />
      {/* Desktop Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-emerald-600 tracking-tight">CodeStreet</span>
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
                  Bounties
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
                  Hunter
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
                  Roadmap
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
                  Delivered
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 sm:hidden flex items-center justify-center h-14">
        <span className="text-lg font-bold text-emerald-600 tracking-tight">CodeStreet</span>
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
              <p className="font-bold text-sm">Install CodeStreet</p>
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
        <div className="grid grid-cols-5 h-16">
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
            <span className="text-xs font-medium">Bounties</span>
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
            <span className="text-xs font-medium">Hunter</span>
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
            <span className="text-xs font-medium">Roadmap</span>
          </NavLink>
          <NavLink
            to="/changelog"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center space-y-1 ${
                isActive ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <PartyPopper className="w-6 h-6" />
            <span className="text-xs font-medium">Delivered</span>
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
