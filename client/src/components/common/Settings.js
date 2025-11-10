import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { User, Moon, Sun, Key, Mail, Calendar, BookOpen, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import axios from '../../services/axios';
import { useToast } from '../../context/ToastContext';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('account');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      await axios.put('/api/auth/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      
      showToast('Password changed successfully', 'success');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'student': return <BookOpen className="text-blue-500" size={24} />;
      case 'teacher': return <User className="text-green-500" size={24} />;
      case 'admin': return <Shield className="text-red-500" size={24} />;
      default: return <User className="text-gray-500" size={24} />;
    }
  };

  const getRoleBadge = () => {
    const colors = {
      student: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      teacher: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      finance: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      enrollment: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[user?.role] || colors.student}`}>
        {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-800 text-white rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex items-center">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-full mr-4">
            {getRoleIcon()}
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Settings</h1>
            <p className="text-blue-100 dark:text-purple-200">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('account')}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === 'account'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <User className="inline mr-2" size={18} />
              Account Details
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === 'appearance'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {theme === 'dark' ? <Moon className="inline mr-2" size={18} /> : <Sun className="inline mr-2" size={18} />}
              Appearance
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Key className="inline mr-2" size={18} />
              Security
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Account Details Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">{user?.name || 'N/A'}</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Mail size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">{user?.email || 'N/A'}</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Shield size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                    </div>
                    {getRoleBadge()}
                  </div>

                  {user?.admissionNumber && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <BookOpen size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Admission Number</p>
                      </div>
                      <p className="text-lg font-semibold text-gray-800 dark:text-white">{user.admissionNumber}</p>
                    </div>
                  )}

                  {user?.accountCode && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Key size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Account Code</p>
                      </div>
                      <p className="text-lg font-semibold text-gray-800 dark:text-white">{user.accountCode}</p>
                    </div>
                  )}

                  {user?.accountId && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Key size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Account ID</p>
                      </div>
                      <p className="text-lg font-semibold text-gray-800 dark:text-white">{user.accountId}</p>
                    </div>
                  )}

                  {user?.phone && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <User size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      </div>
                      <p className="text-lg font-semibold text-gray-800 dark:text-white">{user.phone}</p>
                    </div>
                  )}

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Calendar size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      {user?.enrollmentDate ? new Date(user.enrollmentDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Theme Preferences</h2>
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {theme === 'dark' ? (
                        <div className="bg-blue-500 p-3 rounded-full">
                          <Moon className="text-white" size={24} />
                        </div>
                      ) : (
                        <div className="bg-yellow-500 p-3 rounded-full">
                          <Sun className="text-white" size={24} />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {theme === 'dark' ? 'Easy on the eyes in low-light conditions' : 'Bright and clear interface'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Lock className="inline mr-2" size={16} />
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                      >
                        {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Key className="inline mr-2" size={16} />
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Key className="inline mr-2" size={16} />
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Changing Password...' : 'Change Password'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
