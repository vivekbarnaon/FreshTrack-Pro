import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { getCartItems, processCheckout } from '../services/api';
import { CheckCircle, AlertCircle, ShoppingBag, Loader2 } from 'lucide-react';

/**
 * Cart Page - Shopping cart management
 * Features: Add/remove items, quantity control, checkout
 */
const CartPage = ({ onNavigate, onCartChange }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getCartItems(user.id);
        setCartItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError(err.message || 'Failed to load cart items.');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [user]);

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter((item) => item.id !== id));
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price || item.discountedPrice || 0) * item.quantity, 0);
  };

  const calculateSavings = () => {
    return cartItems.reduce(
      (sum, item) => sum + ((item.basePrice || item.price || 0) - (item.price || item.discountedPrice || 0)) * item.quantity,
      0
    );
  };

  const subtotal = calculateSubtotal();
  const savings = calculateSavings();
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setCheckingOut(true);
    setCheckoutError(null);
    try {
      const itemsPayload = cartItems.map(item => ({
        userId: user.id,
        productId: item.productId || item.product_id || item.id,
        quantity: item.quantity,
        price: item.price || item.discountedPrice || 0
      }));

      const orderPayload = {
        userId: user.id,
        totalAmount: total,
        items: itemsPayload
      };

      await processCheckout(orderPayload);
      
      setCheckoutSuccess(true);
      setCartItems([]);
      if (onCartChange) {
        onCartChange();
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      setCheckoutError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (user?.role !== 'CUSTOMER') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full border border-gray-100 animate-fadeIn">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Only customers are authorized to access the shopping cart workspace.
          </p>
        </div>
      </div>
    );
  }

  if (checkoutSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6 animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100 text-center transform scale-100 transition-all duration-300">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
            <CheckCircle className="w-10 h-10 text-emerald-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">Order Placed Successfully!</h2>
          <p className="text-emerald-700 font-semibold mb-4 bg-emerald-50 py-1.5 px-4 rounded-full inline-block text-xs border border-emerald-100">
            Transaction Complete
          </p>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Your payment was processed successfully. The inventory has been updated and the items will be dispatched soon.
          </p>
          
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 text-left animate-fadeIn">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200/50">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Status</span>
              <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">PAID</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Paid</span>
              <span className="text-sm font-bold text-gray-800">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onNavigate && onNavigate('home')}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" /> Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4 animate-spin">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your shopping cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full border border-gray-100 animate-fadeIn">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-500 mb-6 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-4xl">🛒</span>
            Shopping Cart
          </h1>
          <p className="text-gray-600 mt-1">{cartItems.length} items in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 flex gap-4"
                  >
                    {/* Item Image */}
                    <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.imageUrl || item.image || 'https://via.placeholder.com/100?text=Product'}
                        alt={item.productName || item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100?text=Product';
                        }}
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">{item.productName || item.name}</h3>
                      {item.category && <p className="text-sm text-gray-500">{item.category}</p>}

                      {/* Pricing */}
                      <div className="flex items-center gap-3 mt-2">
                        {item.basePrice && item.basePrice > (item.price || item.discountedPrice) && (
                          <span className="text-sm line-through text-gray-400">
                            ₹{item.basePrice.toFixed(2)}
                          </span>
                        )}
                        <span className="text-lg font-bold text-green-600">
                          ₹{(item.price || item.discountedPrice || 0).toFixed(2)}
                        </span>
                        {item.basePrice && item.basePrice > (item.price || item.discountedPrice) && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Save ₹{(item.basePrice - (item.price || item.discountedPrice)).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex flex-col items-end justify-between">
                      {/* Quantity Control */}
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-gray-200 transition-colors"
                        >
                          −
                        </button>
                        <span className="px-3 font-bold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-gray-200 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Total & Delete */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">
                          ₹{((item.price || item.discountedPrice || 0) * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-semibold mt-2"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center animate-fadeIn">
                <div className="text-5xl mb-4">🛍️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6 text-sm">Add some fresh products from the catalog to get started.</p>
                <button
                  onClick={() => onNavigate && onNavigate('home')}
                  className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/10 hover:shadow-lg"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {cartItems.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>

                {/* Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Smart Savings 💚</span>
                      <span className="font-bold">-₹{savings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (5%)</span>
                    <span className="font-semibold">₹{tax.toFixed(2)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between mb-6 text-xl">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="font-bold text-green-600">₹{total.toFixed(2)}</span>
                </div>

                {/* Error Banner */}
                {checkoutError && (
                  <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3.5 rounded-lg flex items-start gap-2.5 animate-pulse">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="text-xs text-red-800 font-bold mb-0.5">Checkout Error</p>
                      <p className="text-[11px] text-red-700 leading-normal">{checkoutError}</p>
                    </div>
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut || cartItems.length === 0}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-shadow mb-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  {checkingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Processing Checkout...
                    </>
                  ) : (
                    <>
                      💳 Proceed to Checkout
                    </>
                  )}
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={() => onNavigate && onNavigate('home')}
                  className="w-full bg-gray-200 text-gray-800 font-bold py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  ← Continue Shopping
                </button>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                  <p className="text-sm text-blue-800 font-semibold mb-1">✨ Fresh Promise</p>
                  <p className="text-xs text-blue-700">
                    All products guaranteed fresh. Free delivery on orders above ₹500.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

CartPage.propTypes = {
  onNavigate: PropTypes.func,
  onCartChange: PropTypes.func,
};

export default CartPage;
