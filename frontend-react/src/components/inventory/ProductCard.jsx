import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Enhanced ProductCard Component - Premium grocery app style
 * Features: Smart pricing, animations, expiry indicators, quick actions
 */
const ProductCard = ({ product, onAddCart, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const {
    name,
    category,
    basePrice,
    discountedPrice,
    expiryDate,
    stockQuantity = 0,
    image = 'https://via.placeholder.com/200',
  } = product;

  // Calculate discount percentage
  const discountPercentage = Math.round(
    ((basePrice - discountedPrice) / basePrice) * 100
  );

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = () => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
  };

  const daysUntilExpiry = getDaysUntilExpiry();
  const isExpired = daysUntilExpiry < 0;
  const isExpiringSoon = daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
  const isOutOfStock = stockQuantity === 0;

  // Status badge styling
  const getStatusBadge = () => {
    if (isExpired) {
      return { bgColor: 'bg-red-600', textColor: 'text-white', label: 'EXPIRED' };
    }
    if (isExpiringSoon) {
      return { bgColor: 'bg-orange-500', textColor: 'text-white', label: 'EXPIRING SOON' };
    }
    if (isOutOfStock) {
      return { bgColor: 'bg-gray-600', textColor: 'text-white', label: 'OUT OF STOCK' };
    }
    return null;
  };

  const statusBadge = getStatusBadge();
  const hasSavings = discountedPrice < basePrice;

  return (
    <div
      className={`relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 h-full flex flex-col group ${
        isHovered ? 'shadow-2xl scale-105' : ''
      } ${isExpired || isOutOfStock ? 'opacity-75' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Overlay */}
      <div className="relative w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        <img
          src={image}
          alt={name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/200?text=Product';
          }}
        />

        {/* Discount Badge */}
        {hasSavings && !isExpired && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
            Save {discountPercentage}%
          </div>
        )}

        {/* Status Badge */}
        {statusBadge && (
          <div
            className={`absolute top-3 left-3 ${statusBadge.bgColor} ${statusBadge.textColor} px-3 py-1 rounded-full text-xs font-bold shadow-lg`}
          >
            {statusBadge.label}
          </div>
        )}

        {/* Stock Indicator */}
        {!isOutOfStock && (
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-semibold">
            📦 {stockQuantity} in stock
          </div>
        )}

        {/* Hover Overlay with Quick Actions */}
        {isHovered && !isExpired && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center gap-2 animate-fadeIn">
            <button
              onClick={() => setShowQuickView(!showQuickView)}
              className="bg-white text-gray-800 px-3 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
              title="Quick view"
            >
              👁️ View
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(product)}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                title="Edit product"
              >
                ✏️ Edit
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
            {category}
          </span>
          {hasSavings && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
              Smart Price
            </span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
          {name}
        </h3>

        {/* Pricing Section */}
        <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="flex items-baseline gap-3">
            {/* Smart Price */}
            {hasSavings ? (
              <>
                <div className="flex flex-col">
                  <p className="text-xs text-gray-600 font-semibold">Original</p>
                  <p className="text-sm font-bold line-through text-gray-500">
                    ₹{basePrice.toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col border-l-2 border-green-400 pl-3">
                  <p className="text-xs text-green-600 font-bold">NOW</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{discountedPrice.toFixed(2)}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-2xl font-bold text-gray-800">₹{discountedPrice.toFixed(2)}</p>
            )}
          </div>
        </div>

        {/* Expiry Date Info */}
        <div
          className={`p-2 rounded-lg text-sm font-semibold text-center mb-3 transition-colors ${
            isExpired
              ? 'bg-red-100 text-red-700 border border-red-300'
              : isExpiringSoon
              ? 'bg-orange-100 text-orange-700 border border-orange-300'
              : 'bg-green-100 text-green-700 border border-green-300'
          }`}
        >
          {isExpired ? '❌ Expired' : isExpiringSoon ? '⏰ Expires soon' : '✅ Fresh'}
          <div className="text-xs font-normal mt-1 opacity-80">
            {formatDate(expiryDate)} ({daysUntilExpiry} days)
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <button
            disabled={isExpired || isOutOfStock}
            onClick={() => onAddCart && onAddCart(product)}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all duration-300 text-sm ${
              isExpired || isOutOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105 active:scale-95'
            }`}
          >
            {isOutOfStock ? '❌ Out' : isExpired ? '🚫 Expired' : '🛒 Add'}
          </button>

          {onDelete && (
            <button
              onClick={() => onDelete(product.id)}
              className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-semibold text-sm"
              title="Delete product"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Quick View Panel */}
      {showQuickView && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-blue-600 p-3 rounded-t-lg shadow-lg animate-slideUp">
          <p className="text-xs text-gray-600 mb-2">
            <strong>Category:</strong> {category}
          </p>
          <p className="text-xs text-gray-600 mb-2">
            <strong>Stock:</strong> {stockQuantity} units
          </p>
          <p className="text-xs text-gray-600">
            <strong>Savings:</strong> ₹{(basePrice - discountedPrice).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    basePrice: PropTypes.number.isRequired,
    discountedPrice: PropTypes.number.isRequired,
    expiryDate: PropTypes.string.isRequired,
    stockQuantity: PropTypes.number,
    image: PropTypes.string,
  }).isRequired,
  onAddCart: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default ProductCard;
