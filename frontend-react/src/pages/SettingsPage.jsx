import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminSettings, updateAdminSettings, updateAdminProfile } from '../services/api';
import { User, Mail, Settings, ShieldAlert, Loader2, Save, CheckCircle } from 'lucide-react';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  
  // Profile state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  
  // Discount settings state
  const [earlyDiscountDays, setEarlyDiscountDays] = useState(5);
  const [criticalDiscountDays, setCriticalDiscountDays] = useState(2);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user || user.role !== 'ADMIN') {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setUsername(user.username || '');
        setEmail(user.email || '');
        
        const settings = await getAdminSettings();
        setEarlyDiscountDays(settings.earlyDiscountDays || 5);
        setCriticalDiscountDays(settings.criticalDiscountDays || 2);
      } catch (err) {
        console.error('Failed to load settings:', err);
        setErrorMsg('Failed to load configurations.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    // Validation checks
    if (!username.trim() || !email.trim()) {
      setErrorMsg('Username and email cannot be empty.');
      setSaving(false);
      return;
    }

    if (earlyDiscountDays <= 0 || criticalDiscountDays <= 0) {
      setErrorMsg('Discount days must be positive integers.');
      setSaving(false);
      return;
    }

    if (earlyDiscountDays <= criticalDiscountDays) {
      setErrorMsg('Early Discount Days must be greater than Critical Discount Days.');
      setSaving(false);
      return;
    }

    try {
      // 1. Update Profile on backend
      await updateAdminProfile(user.id, { username, email });
      // 2. Synchronize user in Auth Context
      updateUser({ username, email });

      // 3. Update Pricing Rules
      await updateAdminSettings({ earlyDiscountDays, criticalDiscountDays });

      setSuccessMsg('Configurations and profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setErrorMsg(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full border border-gray-100 animate-fadeIn">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Only system administrators are authorized to access the system configurations control panel.
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
          <p className="text-gray-600 font-medium">Loading system configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-3xl mx-auto animate-fadeIn">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Settings</h1>
            <p className="text-gray-500 text-sm mt-0.5">Configure administrator profile details and dynamic pricing shelf-life discount rules.</p>
          </div>
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl flex items-start gap-3 animate-slideIn">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-emerald-800">{successMsg}</p>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3 animate-shake">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-red-800">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSaveChanges} className="space-y-8">
          {/* Profile Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4 border-gray-100">
              <User className="w-5 h-5 text-indigo-600" /> Admin Profile Info
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-gray-400" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Admin Username"
                    className="w-full bg-gray-50 border border-gray-200/80 rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full bg-gray-50 border border-gray-200/80 rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Rules Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4 border-gray-100">
              <Settings className="w-5 h-5 text-indigo-600" /> Dynamic Pricing Configuration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Early Discount Days (20% Off)</label>
                <div className="flex rounded-xl bg-gray-50 border border-gray-200/80 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-600 focus-within:bg-white transition-all">
                  <input
                    type="number"
                    min="1"
                    value={earlyDiscountDays}
                    onChange={(e) => setEarlyDiscountDays(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent px-4 py-3 text-sm font-semibold outline-none border-none text-gray-800"
                  />
                  <span className="bg-gray-100 text-gray-500 text-xs font-extrabold tracking-wide uppercase px-4 py-3 flex items-center border-l select-none shrink-0">Days</span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium mt-2">Days left until expiry where a smart discount of 20% is applied to accelerate inventory sales.</p>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Critical Discount Days (50% Off)</label>
                <div className="flex rounded-xl bg-gray-50 border border-gray-200/80 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-600 focus-within:bg-white transition-all">
                  <input
                    type="number"
                    min="1"
                    value={criticalDiscountDays}
                    onChange={(e) => setCriticalDiscountDays(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent px-4 py-3 text-sm font-semibold outline-none border-none text-gray-800"
                  />
                  <span className="bg-gray-100 text-gray-500 text-xs font-extrabold tracking-wide uppercase px-4 py-3 flex items-center border-l select-none shrink-0">Days</span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium mt-2">Days left until expiry where pricing is dropped by 50% for quick clearance of fresh organic stock.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:scale-[1.02] flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
