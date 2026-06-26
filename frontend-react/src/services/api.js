import axios from 'axios';


let BASE_URL = import.meta.env.VITE_API_URL || 'https://freshtrack-pro.onrender.com/api';

// Defensive check to ensure URL always ends with /api
if (!BASE_URL.endsWith('/api') && !BASE_URL.endsWith('/api/')) {
  BASE_URL = BASE_URL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ------------------------

// Request interceptor for adding auth tokens or custom headers
api.interceptors.request.use(
  (config) => {
    // Add authorization token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('No response received:', error.request);
    } else {
      // Error in request setup
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Fetch all products from the backend
 * @returns {Promise} Array of products
 */
export const getProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch products:', error.message);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
};

/**
 * Fetch a single product by ID
 * @param {number} productId - Product ID
 * @returns {Promise} Product object
 */
export const getProductById = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error.message);
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
};

/**
 * Create a new product
 * @param {Object} productData - Product data
 * @returns {Promise} Created product object
 */
export const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Failed to create product:', error.message);
    throw new Error(`Failed to create product: ${error.message}`);
  }
};

/**
 * Update an existing product
 * @param {number} productId - Product ID
 * @param {Object} productData - Updated product data
 * @returns {Promise} Updated product object
 */
export const updateProduct = async (productId, productData) => {
  try {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update product ${productId}:`, error.message);
    throw new Error(`Failed to update product: ${error.message}`);
  }
};

/**
 * Delete a product
 * @param {number} productId - Product ID
 * @returns {Promise} Response from server
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete product ${productId}:`, error.message);
    throw new Error(`Failed to delete product: ${error.message}`);
  }
};

// Helper to extract clean error message
const getErrorMessage = (error) => {
  if (error.response?.data) {
    if (typeof error.response.data === 'object') {
      return error.response.data.message || JSON.stringify(error.response.data);
    }
    return error.response.data;
  }
  return error.message;
};

// Register call
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Failed to register user:', message);
    throw new Error(message);
  }
};

// Login call
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/login', credentials);
    return response.data; // Includes user details and role
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Failed to login:', message);
    throw new Error(message);
  }
};

/**
 * Add product to cart
 * @param {Object} cartData - { userId, productId }
 * @returns {Promise}
 */
export const addToCart = async (cartData) => {
  try {
    const response = await api.post('/cart', cartData);
    return response.data;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Failed to add to cart:', message);
    throw new Error(message);
  }
};

/**
 * Get all cart items for user
 * @param {number} userId
 * @returns {Promise} List of cart items
 */
export const getCartItems = async (userId) => {
  try {
    const response = await api.get(`/cart/${userId}`);
    return response.data;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error(`Failed to get cart items for user ${userId}:`, message);
    throw new Error(message);
  }
};

/**
 * Process order checkout
 * @param {Object} orderData - { userId, totalAmount, items }
 * @returns {Promise} Response from server
 */
export const processCheckout = async (orderData) => {
  try {
    const response = await api.post('/checkout', orderData);
    return response.data;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Checkout failed:', message);
    throw new Error(message);
  }
};

/**
 * Create a Razorpay Order on the backend
 * @param {number} amount - Amount in INR
 * @returns {Promise} { id, keyId, mock }
 */
export const createRazorpayOrder = async (amount) => {
  try {
    const response = await api.post('/create-order', { amount });
    return response.data;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Failed to create Razorpay Order:', message);
    throw new Error(message);
  }
};

/**
 * Verify Razorpay payment and place the order
 * @param {Object} verificationData - { orderId, paymentId, signature, order }
 * @returns {Promise} Response string/data
 */
export const verifyRazorpayPayment = async (verificationData) => {
  try {
    const response = await api.post('/verify-payment', verificationData);
    return response.data;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Payment verification failed:', message);
    throw new Error(message);
  }
};

/**
 * Fetch Admin Analytics Stats
 * @returns {Promise} Analytics stats { totalRevenue, totalProducts, expiringSoon, outOfStock, categoryStats }
 */
export const getAdminAnalytics = async () => {
  try {
    const response = await api.get('/admin/analytics');
    return response.data;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Failed to fetch admin analytics:', message);
    throw new Error(message);
  }
};

/**
 * Fetch Admin Settings
 * @returns {Promise} Settings { earlyDiscountDays, criticalDiscountDays }
 */
export const getAdminSettings = async () => {
  try {
    const response = await api.get('/admin/settings');
    return response.data;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Failed to fetch settings:', message);
    throw new Error(message);
  }
};

/**
 * Update Admin Settings
 * @param {Object} settingsData - { earlyDiscountDays, criticalDiscountDays }
 * @returns {Promise}
 */
export const updateAdminSettings = async (settingsData) => {
  try {
    const response = await api.post('/admin/settings', settingsData);
    return response.data;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Failed to save settings:', message);
    throw new Error(message);
  }
};

/**
 * Update User/Admin Profile
 * @param {number} userId
 * @param {Object} profileData - { username, email }
 * @returns {Promise}
 */
export const updateAdminProfile = async (userId, profileData) => {
  try {
    const response = await api.put(`/admin/profile/${userId}`, profileData);
    return response.data;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error(`Failed to update profile for user ${userId}:`, message);
    throw new Error(message);
  }
};

export default api;

