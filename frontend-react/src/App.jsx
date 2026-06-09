import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';
import CartPage from './pages/CartPage';
import Header from './components/common/Header';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [cartCount, setCartCount] = useState(0);

  const renderPage = () => {
    switch (currentPage) {
      case 'inventory':
        return <InventoryPage />;
      case 'cart':
        return <CartPage />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={cartCount} onNavigate={setCurrentPage} onSearch={(query) => console.log('Search:', query)} />
      {renderPage()}
    </div>
  );
}

export default App;