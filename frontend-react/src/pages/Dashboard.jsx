import React, { useState, useEffect } from 'react';
import { getProducts, deleteProduct } from '../services/api';
import ProductCard from '../components/inventory/ProductCard';
import { useAuth } from '../context/AuthContext';

/**
 * Dashboard Page - Main inventory display
 * Fetches products from backend and displays them in a grid
 */
const Dashboard = ({ onNavigate, onCartChange }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch products on component mount
  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsData();
  }, []);

  const handleAddToCart = (product) => {
    if (onCartChange) {
      onCartChange();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        alert('✅ Product deleted successfully!');
        // Refresh products list
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('❌ Failed to delete product');
      }
    }
  };

  // Loading Spinner Component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-blue-600">Loading</span>
        </div>
      </div>
    </div>
  );

  // Error Display Component
  const ErrorDisplay = ({ message }) => (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">❌ Error Loading Products</h2>
          <p className="text-base">{message}</p>
          <p className="text-sm mt-4 text-red-600">
            Please check if the backend server is running on http://localhost:8000
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          No Products Available
        </h2>
        <p className="text-gray-600 mb-6">
          {user?.role === 'ADMIN' 
            ? 'The inventory is currently empty. Please add products to get started.' 
            : 'There are currently no fresh products available. Please check back later.'}
        </p>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => onNavigate && onNavigate('inventory')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add First Product
          </button>
        )}
      </div>
    </div>
  );

  // Main render
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;

  // Filter products based on user role: Customers only see fresh products, Admins see all.
  const displayedProducts = products.filter((p) => {
    if (user?.role === 'CUSTOMER') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiry = new Date(p.expiryDate);
      expiry.setHours(0, 0, 0, 0);
      return expiry >= today;
    }
    return true;
  });

  if (displayedProducts.length === 0) return <EmptyState />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      {/* Header Section */}
      <header className={`bg-white shadow-md border-b-4 ${user?.role === 'ADMIN' ? 'border-blue-600' : 'border-emerald-600'}`}>
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-4xl">🥬</span>
                {user?.role === 'ADMIN' ? 'FreshTrack Pro Inventory' : 'Fresh Produce Marketplace'}
              </h1>
              <p className="text-gray-600 mt-1">
                {user?.role === 'ADMIN' ? 'Manage your fresh produce with smart pricing' : 'Shop fresh organic produce with smart dynamic discounts'}
              </p>
            </div>
            {user?.role === 'ADMIN' && (
              <div className="hidden sm:block">
                <div className="bg-blue-100 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {displayedProducts.length}
                  </p>
                  <p className="text-sm text-gray-600">Total Products</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Welcome Banner (Customer Only) */}
      {user?.role === 'CUSTOMER' && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-emerald-100">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-800">Welcome back, {user.username}! 👋</h2>
            <p className="text-sm text-gray-600 mt-1">Enjoy smart pricing and dynamic discounts based on product shelf-life. Help us reduce food waste!</p>
          </div>
        </div>
      )}

      {/* Stats Bar (Admin Only) */}
      {user?.role === 'ADMIN' && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center border-l-4 border-blue-600">
                <p className="text-2xl font-bold text-blue-600">
                  {displayedProducts.length}
                </p>
                <p className="text-xs text-gray-600">Total Items</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center border-l-4 border-green-600">
                <p className="text-2xl font-bold text-green-600">
                  {displayedProducts.filter((p) => p.discountedPrice < p.basePrice).length}
                </p>
                <p className="text-xs text-gray-600">Smart Prices</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center border-l-4 border-yellow-600">
                <p className="text-2xl font-bold text-yellow-600">
                  {
                    displayedProducts.filter((p) => {
                      const today = new Date();
                      const expiry = new Date(p.expiryDate);
                      const daysUntilExpiry = Math.floor(
                        (expiry - today) / (1000 * 60 * 60 * 24)
                      );
                      return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
                    }).length
                  }
                </p>
                <p className="text-xs text-gray-600">Expiring Soon</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center border-l-4 border-red-600">
                <p className="text-2xl font-bold text-red-600">
                  {
                    displayedProducts.filter((p) => {
                      const today = new Date();
                      const expiry = new Date(p.expiryDate);
                      return expiry < today;
                    }).length
                  }
                </p>
                <p className="text-xs text-gray-600">Expired</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id || product.productId}
              product={product}
              onAddCart={user?.role === 'CUSTOMER' ? handleAddToCart : null}
              onEdit={user?.role === 'ADMIN' ? () => onNavigate && onNavigate('inventory') : null}
              onDelete={user?.role === 'ADMIN' ? handleDelete : null}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-700 pt-8">
            <p className="text-center text-sm">
              © 2026 FreshTrack Pro. All rights reserved. | Powered by React +
              Vite
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
