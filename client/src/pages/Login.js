import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../services/axios';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Shield } from 'lucide-react';
import Logo from '../components/common/Logo';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [course, setCourse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [userId, setUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    admissionNumber: '',
    course: '',
    email: ''
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  // Get login type helper text
  const getLoginHelper = () => {
    if (!identifier) return 'Enter your ID or Admission Number';
    
    if (/^KTVC\//.test(identifier)) return 'Student Login - Enter course code (e.g., DIT) or full name';
    if (identifier.length === 6 && /^\d+$/.test(identifier)) return 'Teacher Login (6-digit code)';
    if (identifier.length === 5 && /^\d+$/.test(identifier)) return 'Gate Verification Login (5-digit ID)';
    if (identifier.length === 7 && /^\d+$/.test(identifier)) return 'Finance Login (7-digit ID)';
    if (identifier.length === 4 && /^\d+$/.test(identifier)) return 'Enrollment Login (4-digit ID)';
    if (identifier.includes('@')) return 'Admin Login (Email + Password)';
    
    return 'Enter your ID or Admission Number';
  };

  // Check password strength
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*]/.test(pwd)) strength++;
    
    const levels = [
      { strength: 1, text: 'Weak', color: 'red' },
      { strength: 2, text: 'Fair', color: 'orange' },
      { strength: 3, text: 'Good', color: 'yellow' },
      { strength: 4, text: 'Strong', color: 'green' }
    ];
    
    return levels.find(l => l.strength === strength) || levels[0];
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // For students, check if they need password setup first
      if (/^KTVC\//.test(identifier) && course) {
        const checkResponse = await axios.post('/api/auth/check-student', {
          admissionNumber: identifier,
          course
        });

        if (checkResponse.data.needsPasswordSetup) {
          // Show password setup form
          setUserId(checkResponse.data.studentId);
          setShowPasswordSetup(true);
          setLoading(false);
          return;
        }
      }

      const response = await axios.post('/api/auth/login', {
        identifier,
        password: password || undefined,
        course: course || undefined
      });

      // Store user data and token
      const userData = response.data;
      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('token', userData.token);
      login(userData);

      // Configure axios defaults after successful login
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;

      // Update navigation paths
      switch (userData.role) {
        case 'student':
          navigate('/student/home');
          break;
        case 'teacher':
          navigate('/teacher/home');
          break;
        case 'admin':
          navigate('/admin/dashboards'); // Update admin path
          break;
        case 'finance':
          navigate('/finance/home');
          break;
        case 'gateverification':
          navigate('/gate'); // Update gate verification path
          break;
        case 'gate':
          navigate('/gate'); // Alternative gate role name
          break;
        case 'enrollment':
          navigate('/enrollment/home');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSetup = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/auth/set-password', {
        userId,
        password: newPassword
      });

      alert('Password set successfully! Please login with your new password.');
      
      // Reset form and go back to login
      setShowPasswordSetup(false);
      setNewPassword('');
      setConfirmPassword('');
      setPassword('');
      setLoading(false);

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to set password');
      setLoading(false);
    }
  };

  // Handle forgot password verification
  const handleForgotPasswordVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password-verify', forgotPasswordData);

      if (response.data.exists) {
        setUserId(response.data.userId);
        setShowForgotPassword(false);
        setShowPasswordSetup(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Account not found with provided details');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Modal
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-purple-100 p-4 rounded-full">
                <Shield className="w-12 h-12 text-purple-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password</h2>
            <p className="text-gray-600">Enter your account details to reset password</p>
          </div>

          <form onSubmit={handleForgotPasswordVerify} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admission Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={forgotPasswordData.admissionNumber}
                onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, admissionNumber: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Enter admission number (e.g., KTVC/25J/1234)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={forgotPasswordData.course}
                onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, course: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Enter course code (e.g., DIT) or full name"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                You can use course code or full course name
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={forgotPasswordData.email}
                onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Enter email address"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Account'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setError('');
                setForgotPasswordData({ admissionNumber: '', course: '', email: '' });
              }}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition duration-200"
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Password setup modal/form
  if (showPasswordSetup) {
    const passwordStrength = getPasswordStrength(newPassword);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-green-600 to-teal-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full">
                <Lock className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Set Your Password</h2>
            <p className="text-gray-600">Create a secure password for your account</p>
          </div>

          <form onSubmit={handlePasswordSetup} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-11 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {newPassword && (
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Password Strength:</span>
                  <span className={`text-sm font-semibold text-${passwordStrength.color}-600`}>
                    {passwordStrength.text}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-${passwordStrength.color}-500 h-2 rounded-full transition-all`}
                    style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use at least 8 characters with uppercase, lowercase, numbers, and symbols
                </p>
              </div>
            )}

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-11 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {newPassword && confirmPassword && (
              <div className={`text-sm ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Setting Password...' : 'Set Password & Continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main login form
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3b3c36] to-[#002147] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Logo size="lg" showText={true} />
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2 mt-4">Welcome Back</h2>
          <p className="text-sm lg:text-base text-gray-600">Unified Login Portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID / Admission Number
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter ID or Admission Number"
              required
            />
            <p className="text-xs text-blue-600 mt-1 flex items-center">
              <Shield size={14} className="mr-1" />
              {getLoginHelper()}
            </p>
          </div>

          {/* Show course field for student login */}
          {/^KTVC\//.test(identifier) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter course code (e.g., DIT) or full name"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                You can use course code (DIT) or full course name (Diploma in Information Technology)
              </p>
            </div>
          )}

          {/* Show password field for all users */}
          {identifier && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-11 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        </form>        
      </div>
    </div>
  );
};

export default Login;
