import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../services/axios';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, LogOut, User } from 'lucide-react';
import Logo from '../components/common/Logo';

const QuickLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [savedUser, setSavedUser] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a saved user in localStorage
    const lastUser = localStorage.getItem('lastLoggedInUser');
    if (lastUser) {
      try {
        const userData = JSON.parse(lastUser);
        setSavedUser(userData);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('lastLoggedInUser');
        navigate('/login');
      }
    } else {
      // No saved user, redirect to full login
      navigate('/login');
    }
  }, [navigate]);

  const handleQuickLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        identifier: savedUser.identifier,
        password,
        course: savedUser.course || undefined
      });

      const userData = response.data;
      
      // Store user data and token
      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('token', userData.token);
      
      // Update last logged in user
      localStorage.setItem('lastLoggedInUser', JSON.stringify({
        name: userData.name,
        identifier: savedUser.identifier,
        course: savedUser.course,
        role: userData.role
      }));
      
      login(userData);

      // Configure axios defaults
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;

      // Navigate to appropriate dashboard
      switch (userData.role) {
        case 'student':
          navigate('/student/home');
          break;
        case 'teacher':
          navigate('/teacher/home');
          break;
        case 'admin':
          navigate('/admin/dashboards');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please check your password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAndSwitch = () => {
    localStorage.removeItem('lastLoggedInUser');
    navigate('/login');
  };

  if (!savedUser) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="lg" showText={true} />
        </div>

        {/* Welcome Back */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
          <p className="text-gray-600">{savedUser.name}</p>
          <p className="text-sm text-gray-500">
            {savedUser.role === 'student' ? savedUser.identifier : savedUser.role}
          </p>
        </div>

        {/* Quick Login Form */}
        <form onSubmit={handleQuickLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Password Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Continue'}
          </button>
        </form>

        {/* Switch Account */}
        <div className="mt-6 text-center">
          <button
            onClick={handleLogoutAndSwitch}
            className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium mx-auto"
          >
            <LogOut size={18} />
            <span>Switch Account or Login Afresh</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Developed by <span className="font-semibold text-blue-600">DeeDev Astro Labs</span></p>
        </div>
      </div>
    </div>
  );
};

export default QuickLogin;
