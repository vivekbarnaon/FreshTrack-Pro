import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';
import CartPage from './pages/CartPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import Header from './components/common/Header';
import AuthPage from './pages/AuthPage';
import { useAuth } from './context/AuthContext';
import { getCartItems } from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [cartCount, setCartCount] = useState(0);
  const { user, loading } = useAuth();

  // Fetch cart count from backend
  const fetchCartCount = useCallback(async () => {
    if (user?.id && user.role === 'CUSTOMER') {
      try {
        const data = await getCartItems(user.id);
        if (Array.isArray(data)) {
          const totalQty = data.reduce((sum, item) => sum + (item.quantity || 1), 0);
          setCartCount(totalQty);
        }
      } catch (err) {
        console.error('Error fetching cart items:', err);
      }
    } else {
      setCartCount(0);
    }
  }, [user]);

  // Fetch count when user logs in or switches page
  useEffect(() => {
    fetchCartCount();
  }, [user, currentPage, fetchCartCount]);

  // Redirect if unauthorized page navigation occurs
  useEffect(() => {
    if (user) {
      if (user.role === 'CUSTOMER' && (currentPage === 'inventory' || currentPage === 'analytics' || currentPage === 'settings')) {
        setCurrentPage('home');
      } else if (user.role === 'ADMIN' && currentPage === 'cart') {
        setCurrentPage('home');
      }
    }
  }, [user, currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-extrabold text-indigo-600 tracking-tight">FreshTrack</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'inventory':
        return user.role === 'ADMIN' ? <InventoryPage /> : <Dashboard onNavigate={setCurrentPage} onCartChange={fetchCartCount} />;
      case 'cart':
        return user.role === 'CUSTOMER' ? <CartPage onNavigate={setCurrentPage} onCartChange={fetchCartCount} /> : <Dashboard onNavigate={setCurrentPage} onCartChange={fetchCartCount} />;
      case 'analytics':
        return user.role === 'ADMIN' ? <AnalyticsPage /> : <Dashboard onNavigate={setCurrentPage} onCartChange={fetchCartCount} />;
      case 'settings':
        return user.role === 'ADMIN' ? <SettingsPage /> : <Dashboard onNavigate={setCurrentPage} onCartChange={fetchCartCount} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} onCartChange={fetchCartCount} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      <Header cartCount={cartCount} onNavigate={setCurrentPage} onSearch={(query) => console.log('Search:', query)} />
      {renderPage()}
    </div>
  );
}

export default App;