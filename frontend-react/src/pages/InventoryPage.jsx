import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

/**
 * Inventory Management Page
 * Features: Table view, add/edit/delete products, bulk actions
 */
const InventoryPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Dairy',
    basePrice: '',
    discountedPrice: '',
    expiryDate: '',
    stockQuantity: '',
    imageUrl: '',
  });
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch products on mount
  useEffect(() => {
    fetchProductsData();
  }, []);

  const fetchProductsData = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        discountedPrice: parseFloat(formData.discountedPrice),
        stockQuantity: parseInt(formData.stockQuantity),
      };

      if (editingId) {
        await updateProduct(editingId, payload);
        alert('✅ Product updated successfully!');
      } else {
        await createProduct(payload);
        alert('✅ Product added successfully!');
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        category: 'Dairy',
        basePrice: '',
        discountedPrice: '',
        expiryDate: '',
        stockQuantity: '',
        imageUrl: '',
      });
      fetchProductsData();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('❌ Failed to save product');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // 1. Upload the image to product-images bucket
      const { data, error } = await supabase
        .storage
        .from('product-images')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      if (data) {
        // 2. Get the public URL of the uploaded image
        const { data: urlData } = supabase
          .storage
          .from('product-images')
          .getPublicUrl(data.path);

        const publicUrl = urlData.publicUrl;
        console.log("Uploaded successfully. Public URL:", publicUrl);

        // 3. Save publicUrl to formData
        setFormData((prev) => ({
          ...prev,
          imageUrl: publicUrl,
        }));
        alert("✅ Image uploaded successfully!");
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("❌ Image upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      basePrice: product.basePrice,
      discountedPrice: product.discountedPrice,
      expiryDate: product.expiryDate,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        alert('✅ Product deleted successfully!');
        fetchProductsData();
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('❌ Failed to delete product');
      }
    }
  };

  // Get unique categories
  const categories = ['All', ...new Set(products.map((p) => p.category))];

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchCategory = filterCategory === 'All' || p.category === filterCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full border border-gray-100 animate-fadeIn">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Only administrators are authorized to access the inventory management workspace.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-4xl">📦</span>
              Inventory Management
            </h1>
            <p className="text-gray-600 mt-1">Manage all your products in one place</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({
                name: '',
                category: 'Dairy',
                basePrice: '',
                discountedPrice: '',
                expiryDate: '',
                stockQuantity: '',
                imageUrl: '',
              });
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
          >
            + Add Product
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-blue-600 animate-slideDown">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingId ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option>Dairy</option>
                <option>Vegetables</option>
                <option>Fruits</option>
                <option>Bakery</option>
                <option>Beverages</option>
                <option>Other</option>
              </select>
              <input
                type="number"
                name="basePrice"
                placeholder="Base Price"
                value={formData.basePrice}
                onChange={handleInputChange}
                step="0.01"
                required
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <input
                type="number"
                name="discountedPrice"
                placeholder="Smart Price"
                value={formData.discountedPrice}
                onChange={handleInputChange}
                step="0.01"
                required
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <input
                type="number"
                name="stockQuantity"
                placeholder="Stock Quantity"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <div className="md:col-span-2 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center hover:border-blue-500 transition-colors">
                <label className="text-gray-700 font-semibold mb-2 cursor-pointer flex flex-col items-center">
                  <span className="text-xl">📷</span>
                  <span className="mt-1 text-sm text-blue-600 hover:text-blue-800 font-medium">Click to upload product image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                {uploading && (
                  <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                    <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                    Uploading image...
                  </div>
                )}
                {formData.imageUrl && !uploading && (
                  <div className="mt-2 text-center">
                    <p className="text-green-600 text-xs font-semibold">✓ Image uploaded successfully!</p>
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="h-20 w-20 object-cover mt-2 mx-auto rounded border border-gray-200 shadow-sm"
                    />
                  </div>
                )}
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingId ? '💾 Update' : '➕ Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="flex-1 bg-gray-400 text-white font-bold py-2 rounded-lg hover:bg-gray-500 transition-colors"
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        {filteredProducts.length > 0 ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold">Product</th>
                    <th className="px-6 py-3 text-left text-sm font-bold">Category</th>
                    <th className="px-6 py-3 text-right text-sm font-bold">Base Price</th>
                    <th className="px-6 py-3 text-right text-sm font-bold">Smart Price</th>
                    <th className="px-6 py-3 text-center text-sm font-bold">Stock</th>
                    <th className="px-6 py-3 text-left text-sm font-bold">Expires</th>
                    <th className="px-6 py-3 text-center text-sm font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, idx) => (
                    <tr
                      key={product.id}
                      className={`border-t hover:bg-gray-50 transition-colors ${
                        idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-gray-800">{product.name}</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="line-through text-gray-500">
                          ₹{product.basePrice.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">
                        ₹{product.discountedPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`font-bold px-2 py-1 rounded ${
                            product.stockQuantity > 10
                              ? 'bg-green-100 text-green-700'
                              : product.stockQuantity > 0
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(product.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:bg-blue-100 px-2 py-1 rounded"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:bg-red-100 px-2 py-1 rounded"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">📭 No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
