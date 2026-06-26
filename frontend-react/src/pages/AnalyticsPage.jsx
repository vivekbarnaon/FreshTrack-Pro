import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminAnalytics } from '../services/api';
import { IndianRupee, Layers, AlertTriangle, AlertOctagon, TrendingUp, BarChart3, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || user.role !== 'ADMIN') {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getAdminAnalytics();
        setStats(data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError('Failed to fetch statistical dashboard reports.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full border border-gray-100 animate-fadeIn">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Only administrators are authorized to access the system analytics dashboard.
          </p>
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
            <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600 font-medium">Aggregating system reports...</p>
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
            className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prepping chart data
  const chartData = stats?.categoryStats || [];
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto animate-fadeIn">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Analytics Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Real-time business insights, stock alert levels, and inventory distribution breakdown.</p>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Total Revenue */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100/80 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-125 transition-transform duration-500 opacity-60"></div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Total Revenue</span>
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100">
                <IndianRupee className="w-4 h-4 text-emerald-600 animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-gray-900">₹{(stats?.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
            <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% sales increase
            </p>
          </div>

          {/* Card 2: Total Items */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100/80 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-125 transition-transform duration-500 opacity-60"></div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Total Products</span>
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                <Layers className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-gray-900">{stats?.totalProducts || 0}</h2>
            <p className="text-xs font-semibold text-gray-400 mt-2">Active catalog inventory items</p>
          </div>

          {/* Card 3: Expiring Soon */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100/80 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-125 transition-transform duration-500 opacity-60"></div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Expiring Soon</span>
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
                <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-gray-900">{stats?.expiringSoon || 0}</h2>
            <p className="text-xs font-bold text-amber-600 mt-2">Nearing product shelf-life dates</p>
          </div>

          {/* Card 4: Out of Stock */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100/80 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-50 rounded-full group-hover:scale-125 transition-transform duration-500 opacity-60"></div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Out of Stock</span>
              <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center border border-rose-100">
                <AlertOctagon className="w-4 h-4 text-rose-600 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
            <h2 className="text-2xl font-black text-gray-900">{stats?.outOfStock || 0}</h2>
            <p className="text-xs font-bold text-rose-600 mt-2">Requires replenishment order</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4 border-gray-100">
            <BarChart3 className="w-5 h-5 text-indigo-600" /> Category Product Distribution
          </h2>

          {chartData.length > 0 ? (
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis 
                    dataKey="category" 
                    stroke="#9ca3af" 
                    fontSize={12} 
                    fontWeight={600}
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={12} 
                    fontWeight={600}
                    tickLine={false} 
                    axisLine={false} 
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      borderRadius: '16px', 
                      border: '1px solid #f1f5f9', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                      padding: '12px' 
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}
                    itemStyle={{ color: '#4f46e5', fontWeight: 'bold', fontSize: '13px' }}
                  />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]} maxBarSize={50}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 font-medium text-sm">
              No products found in inventory. Add some products to visualize categories.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
