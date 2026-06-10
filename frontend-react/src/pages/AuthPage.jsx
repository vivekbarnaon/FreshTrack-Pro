import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User as UserIcon, 
  UserPlus, 
  LogIn, 
  AlertCircle, 
  CheckCircle2, 
  Shield, 
  ShoppingBag,
  Leaf
} from 'lucide-react';

const AuthPage = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER'); // 'CUSTOMER' or 'ADMIN'
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation
  const validateForm = () => {
    setError('');
    
    if (!email) {
      setError('Email is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (!password) {
      setError('Password is required.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }

    if (!isLogin) {
      if (!username.trim()) {
        setError('Username is required for registration.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        await login(email, password);
        setSuccess('Logged in successfully!');
      } else {
        await register(username, email, password, role);
        setSuccess('Account created and logged in successfully!');
      }
    } catch (err) {
      // Backend error could be a string or object.
      const errorMsg = err.message || 'An unexpected error occurred. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setPassword('');
    setUsername('');
    setShowPassword(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50/50 p-4 py-12 sm:px-6 lg:px-8">
      {/* Container */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px] border border-gray-100 animate-fadeIn">
        
        {/* Left Branding Side (Only visible on MD/LG screens) */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-emerald-950 p-10 flex-col justify-between text-white relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

          {/* Logo & Brand */}
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight">FreshTrack <span className="text-emerald-400">Pro</span></span>
              <p className="text-[10px] text-indigo-200 tracking-wider uppercase font-semibold">Smart Inventory Management</p>
            </div>
          </div>

          {/* Features Illustration / Quotes */}
          <div className="relative my-auto space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Optimize Expiry. <br />
              <span className="text-emerald-400">Maximize Margins.</span>
            </h2>
            <p className="text-indigo-200 text-sm">
              Discover a premium MNC-grade platform to monitor freshness, regulate smart dynamic discounts, and reduce food waste efficiently.
            </p>
            
            <div className="space-y-4 pt-4 border-t border-indigo-800/60">
              <div className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5 text-emerald-400 font-bold">✓</div>
                <div>
                  <h4 className="font-semibold text-white">Smart discount algorithms</h4>
                  <p className="text-indigo-200/80 text-xs">Automated price reductions based on product shelf-life.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5 text-emerald-400 font-bold">✓</div>
                <div>
                  <h4 className="font-semibold text-white">Role-based workspaces</h4>
                  <p className="text-indigo-200/80 text-xs">Tailored dashboards for customers and managers alike.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="relative text-xs text-indigo-300">
            &copy; 2026 FreshTrack Pro. All rights reserved.
          </div>
        </div>

        {/* Right Form Side */}
        <div className="col-span-1 md:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white relative">
          
          {/* Top Toggle buttons (MNC minimalist tabs) */}
          <div className="flex justify-end absolute top-6 right-8">
            <button 
              onClick={handleToggleMode}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-full hover:bg-indigo-50"
            >
              {isLogin ? (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  Need an account? Sign up
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  Already a member? Sign in
                </>
              )}
            </button>
          </div>

          <div key={isLogin ? 'login' : 'register'} className="w-full max-w-md mx-auto animate-fadeIn">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                {isLogin 
                  ? 'Access your inventory dashboard and smart analytics.' 
                  : 'Start monitoring product freshness and discounts today.'
                }
              </p>
            </div>

            {/* Error & Success Alert Banner */}
            {error && (
              <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 animate-slideDown">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Authentication issue</span>
                  <p className="text-red-600/90 mt-0.5">{error}</p>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-6 flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700 animate-slideDown">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Success</span>
                  <p className="text-emerald-600/90 mt-0.5">{success}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Username Field (Register only) */}
              {!isLogin && (
                <div>
                  <label htmlFor="username" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <UserIcon className="h-4.5 w-4.5 text-gray-400" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all text-sm"
                      placeholder="e.g. johndoe"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4.5 w-4.5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all text-sm"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Password
                  </label>
                  {isLogin && (
                    <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                      Forgot?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4.5 w-4.5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all text-sm"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Role Selection (Register only - Stylized radio cards) */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2.5">
                    Choose Your Role
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* CUSTOMER CARD */}
                    <div
                      onClick={() => setRole('CUSTOMER')}
                      className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col justify-between h-28 transition-all hover:shadow-md ${
                        role === 'CUSTOMER'
                          ? 'border-emerald-600 bg-emerald-50/30'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className={`p-1.5 rounded-lg ${role === 'CUSTOMER' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        {role === 'CUSTOMER' && (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-gray-900">Customer</h4>
                        <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Browse items & smart discounts</p>
                      </div>
                    </div>

                    {/* ADMIN CARD */}
                    <div
                      onClick={() => setRole('ADMIN')}
                      className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col justify-between h-28 transition-all hover:shadow-md ${
                        role === 'ADMIN'
                          ? 'border-indigo-600 bg-indigo-50/30'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className={`p-1.5 rounded-lg ${role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                          <Shield className="w-4 h-4" />
                        </div>
                        {role === 'ADMIN' && (
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-gray-900">Admin</h4>
                        <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Manage stock & smart pricing</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isLogin 
                      ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 shadow-indigo-600/10' 
                      : role === 'ADMIN' 
                        ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 shadow-indigo-600/10'
                        : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 shadow-emerald-600/10'
                  } disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isLogin ? 'Authenticating...' : 'Registering...'}
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Sign In to Dashboard' : 'Register Account'}
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Bottom Toggle Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                {isLogin ? (
                  <>
                    New to FreshTrack Pro?{' '}
                    <button
                      type="button"
                      onClick={handleToggleMode}
                      className="font-semibold text-emerald-600 hover:text-emerald-500"
                    >
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={handleToggleMode}
                      className="font-semibold text-indigo-600 hover:text-indigo-500"
                    >
                      Sign in instead
                    </button>
                  </>
                )}
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
