import React, { useState } from 'react';

/**
 * Cart Page - Shopping cart management
 * Features: Add/remove items, quantity control, checkout
 */
const CartPage = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Amul Gold Milk 1L',
      category: 'Dairy',
      basePrice: 66,
      discountedPrice: 52.8,
      quantity: 2,
      image: 'https://via.placeholder.com/100',
    },
  ]);

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
    return cartItems.reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0);
  };

  const calculateSavings = () => {
    return cartItems.reduce(
      (sum, item) => sum + (item.basePrice - item.discountedPrice) * item.quantity,
      0
    );
  };

  const subtotal = calculateSubtotal();
  const savings = calculateSavings();
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

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
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100?text=Product';
                        }}
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.category}</p>

                      {/* Pricing */}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm line-through text-gray-400">
                          ₹{item.basePrice.toFixed(2)}
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          ₹{item.discountedPrice.toFixed(2)}
                        </span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Save ₹{(item.basePrice - item.discountedPrice).toFixed(2)}
                        </span>
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
                          ₹{(item.discountedPrice * item.quantity).toFixed(2)}
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
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-5xl mb-4">🛍️</div>
                <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
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
                  <div className="flex justify-between text-green-600">
                    <span>Smart Savings 💚</span>
                    <span className="font-bold">-₹{savings.toFixed(2)}</span>
                  </div>
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

                {/* Checkout Button */}
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-shadow mb-3">
                  💳 Proceed to Checkout
                </button>

                {/* Continue Shopping */}
                <button className="w-full bg-gray-200 text-gray-800 font-bold py-2 rounded-lg hover:bg-gray-300 transition-colors">
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

export default CartPage;
