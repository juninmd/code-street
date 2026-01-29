import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { MessageSquare, Map, PartyPopper, PlusCircle, Briefcase } from 'lucide-react';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Desktop Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-emerald-600 tracking-tight">CodeBounty</span>
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
        <span className="text-lg font-bold text-emerald-600 tracking-tight">CodeBounty</span>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 sm:hidden pb-safe">
        <div className="grid grid-cols-4 h-16">
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
          <p className="text-center text-sm text-gray-400">&copy; {new Date().getFullYear()} CodeBounty. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
