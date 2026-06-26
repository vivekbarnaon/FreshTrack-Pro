import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Header Component - Navigation and branding
 * Features: Search, cart counter, user menu, notifications
 */
const Header = ({ cartCount = 0, onSearch, onNavigate }) => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(2);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch && onSearch(searchQuery);
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onNavigate && onNavigate('home')}
          >
            <div className="text-3xl">🥬</div>
            <div>
              <h1 className="text-xl font-bold">FreshTrack</h1>
              <p className="text-xs text-blue-100">Smart Inventory</p>
            </div>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center bg-white bg-opacity-20 rounded-full px-4 py-2 focus-within:bg-opacity-30 transition-all flex-1 mx-6 max-w-sm"
          >
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder-blue-100 outline-none flex-1 text-sm"
            />
            <button type="submit" className="text-blue-100 hover:text-white ml-2">
              🔍
            </button>
          </form>

          {/* Right Side Menu */}
          <div className="flex items-center gap-4">
            {/* Notifications (Admin Only) */}
            {user?.role === 'ADMIN' && (
              <div className="relative cursor-pointer group">
                <div className="text-2xl hover:scale-110 transition-transform">🔔</div>
                {notifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
                <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity p-3 text-sm">
                  <p className="font-semibold mb-2">Notifications</p>
                  <p className="text-gray-600 mb-1">• 2 products expiring soon</p>
                  <p className="text-gray-600">• Update your inventory</p>
                </div>
              </div>
            )}

            {/* Cart Icon (Customer Only) */}
            {user?.role === 'CUSTOMER' && (
              <div
                className="relative cursor-pointer hover:scale-110 transition-transform"
                onClick={() => onNavigate && onNavigate('cart')}
              >
                <div className="text-2xl">🛒</div>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                    {cartCount}
                  </span>
                )}
              </div>
            )}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-lg transition-all"
              >
                <div className="text-2xl">👤</div>
                {user && (
                  <div className="hidden sm:flex flex-col items-start text-left text-xs">
                    <span className="font-semibold text-white leading-none">{user.username}</span>
                    <span className="text-[10px] text-blue-100 mt-0.5">{user.role}</span>
                  </div>
                )}
                <svg
                  className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>

              {/* User Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl overflow-hidden animate-fadeIn">
                  {user && (
                    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user.username}</p>
                      <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded-full mt-1 ${
                        user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  )}
                  {user?.role === 'ADMIN' && (
                    <>
                      <button
                        onClick={() => {
                          onNavigate && onNavigate('inventory');
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm font-semibold"
                      >
                        📦 Inventory
                      </button>
                      <button
                        onClick={() => {
                          onNavigate && onNavigate('analytics');
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm font-semibold"
                      >
                        📊 Analytics
                      </button>
                    </>
                  )}
                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => {
                        onNavigate && onNavigate('settings');
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm font-semibold"
                    >
                      ⚙️ Settings
                    </button>
                  )}
                  <hr className="my-2" />
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-100 transition-colors text-sm font-semibold text-red-600"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
