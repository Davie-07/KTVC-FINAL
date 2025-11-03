import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from '../services/axios';
import { ShieldCheck, X, AlertCircle, CheckCircle, XCircle, Clock, LogOut, Database, Download, Lock } from 'lucide-react';

const GateDashboard = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('verify');
  const [formData, setFormData] = useState({
    admissionNumber: '',
    course: '',
    verificationCode: ''
  });
  const [verifying, setVerifying] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const [requiresCode, setRequiresCode] = useState(false);
  const [error, setError] = useState('');
  const [todayVerifications, setTodayVerifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isDataUnlocked, setIsDataUnlocked] = useState(false);
  const [timeStatus, setTimeStatus] = useState({ isOpen: true, message: '', countdown: '' });

  // Check if gate is open (Monday-Friday, 6am-5:20pm)
  React.useEffect(() => {
    const checkTimeStatus = () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentMinutes = hours * 60 + minutes;
      
      // Operating hours: 6:00 AM (360 mins) to 5:20 PM (1040 mins)
      const openTime = 6 * 60; // 6:00 AM
      const closeTime = 17 * 60 + 20; // 5:20 PM
      
      // Check if it's Monday-Friday (1-5) and within operating hours
      const isWeekday = day >= 1 && day <= 5;
      const isDuringHours = currentMinutes >= openTime && currentMinutes < closeTime;
      const isOpen = isWeekday && isDuringHours;
      
      let message = '';
      let countdown = '';
      
      if (!isWeekday) {
        message = 'Gate verification is only available Monday to Friday';
        const daysUntilMonday = day === 0 ? 1 : (8 - day); // Days until next Monday
        countdown = `Opens in ${daysUntilMonday} day${daysUntilMonday > 1 ? 's' : ''} (Monday 6:00 AM)`;
      } else if (currentMinutes < openTime) {
        const minsUntilOpen = openTime - currentMinutes;
        const hoursLeft = Math.floor(minsUntilOpen / 60);
        const minsLeft = minsUntilOpen % 60;
        message = 'Gate verification opens at 6:00 AM';
        countdown = `Opens in ${hoursLeft}h ${minsLeft}m`;
      } else if (currentMinutes >= closeTime) {
        message = 'Gate verification closed for today';
        countdown = 'Opens tomorrow at 6:00 AM';
      }
      
      setTimeStatus({ isOpen, message, countdown });
    };
    
    checkTimeStatus();
    const interval = setInterval(checkTimeStatus, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (user && (user.role === 'gate' || user.role === 'gateverification')) {
      fetchTodayVerifications();
      fetchStats();
    }
  }, [user]);

  const fetchTodayVerifications = async () => {
    try {
      const response = await axios.get('/api/gate/verifications/today');
      // Ensure response.data is an array
      setTodayVerifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      setTodayVerifications([]); // Set to empty array on error
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/gate/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setError('');
    setShowPopup(false);

    try {
      const response = await axios.post('/api/gate/verify', formData);

      if (response.data.success) {
        // Valid gate pass
        setPopupData({
          type: 'success',
          student: response.data.student,
          expiryDate: response.data.expiryDate,
          verificationTime: response.data.verificationTime,
          message: response.data.message,
          warning: response.data.warning, // 2nd verification warning
          verificationsToday: response.data.verificationsToday
        });
        setShowPopup(true);

        // Auto-close after 5 seconds (more time if there's a warning)
        setTimeout(() => {
          setShowPopup(false);
          setFormData({ admissionNumber: '', course: '', verificationCode: '' });
          setRequiresCode(false);
          fetchTodayVerifications();
          fetchStats();
        }, response.data.warning ? 6000 : 4000);

      } else if (response.data.isExpired) {
        // Expired gate pass
        setPopupData({
          type: 'expired',
          student: response.data.student,
          expiryDate: response.data.expiryDate,
          message: response.data.message
        });
        setShowPopup(true);

        setTimeout(() => {
          setShowPopup(false);
          setFormData({ admissionNumber: '', course: '', verificationCode: '' });
        }, 4000);
      }

      setVerifying(false);
    } catch (error) {
      setVerifying(false);

      if (error.response?.data) {
        const errorData = error.response.data;

        if (errorData.requiresCode) {
          // Need 6-digit code (3rd+ verification)
          setRequiresCode(true);
          setError(errorData.message);
          console.log('Verification code required. Code sent to student dashboard.');
        } else {
          setError(errorData.message || 'Verification failed');
          setTimeout(() => {
            setError('');
            // Reset form on non-code-required errors
            if (!errorData.requiresCode) {
              setFormData({ admissionNumber: '', course: '', verificationCode: '' });
            }
          }, 5000);
        }
      } else {
        setError('Network error. Please try again.');
        setTimeout(() => setError(''), 5000);
      }
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleDataTabClick = () => {
    if (!isDataUnlocked) {
      setShowPasswordModal(true);
    } else {
      setActiveTab('data');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    
    try {
      // Verify password by attempting login
      const response = await axios.post('/api/auth/login', {
        identifier: user.accountId,
        password: passwordInput
      });
      
      if (response.data) {
        setIsDataUnlocked(true);
        setShowPasswordModal(false);
        setPasswordInput('');
        setActiveTab('data');
      }
    } catch (error) {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const handleDownloadData = async () => {
    try {
      const response = await axios.get('/api/gate/download-verifications', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `gate-verifications-${date}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Error downloading data: ' + (error.response?.data?.message || error.message));
    }
  };

  console.log('Gate Dashboard Render - Loading:', loading, 'User:', user);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-xl text-gray-700">Loading Gate Dashboard...</div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (user.role !== 'gate' && user.role !== 'gateverification') {
    console.log('User role is not gate:', user.role, 'redirecting to login');
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <ShieldCheck size={40} className="mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Gate Verification System</h1>
              <p className="text-green-100">Verify student gate passes</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-green-200">Gate Officer</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition flex items-center"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <p className="text-gray-600 text-sm mb-1">Today's Verifications</p>
              <p className="text-4xl font-bold text-green-600">{stats.todayVerifications}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <p className="text-gray-600 text-sm mb-1">Valid Today</p>
              <p className="text-4xl font-bold text-blue-600">{stats.validToday}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <p className="text-gray-600 text-sm mb-1">Expired Today</p>
              <p className="text-4xl font-bold text-red-600">{stats.expiredToday}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <p className="text-gray-600 text-sm mb-1">Total Students</p>
              <p className="text-4xl font-bold text-purple-600">{stats.totalStudents}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-t-xl shadow-md mb-0">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('verify')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'verify'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShieldCheck className="inline mr-2" size={20} />
              Verify Student
            </button>
            <button
              onClick={handleDataTabClick}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'data'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Database className="inline mr-2" size={20} />
              Verified Data {!isDataUnlocked && <Lock className="inline ml-1" size={16} />}
            </button>
          </div>
        </div>

        {/* Verification Form Tab */}
        {activeTab === 'verify' && (
          <>
            {/* Time Restriction Notice */}
            {!timeStatus.isOpen && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-b-xl p-6 mb-6 shadow-md">
                <div className="flex items-start">
                  <Clock className="text-red-600 mr-3 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="text-lg font-bold text-red-800 mb-2">{timeStatus.message}</h3>
                    <p className="text-red-700 font-semibold">{timeStatus.countdown}</p>
                    <p className="text-sm text-red-600 mt-2">
                      Operating Hours: Monday - Friday, 6:00 AM - 5:20 PM
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <ShieldCheck className="mr-3 text-green-600" size={28} />
            Student Verification
          </h2>

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admission Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.admissionNumber}
                onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="e.g., KTVC/25J/1234"
                disabled={!timeStatus.isOpen}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="e.g., DIT or Diploma in Information Technology"
                disabled={!timeStatus.isOpen}
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                Enter course code (DIT) or full course name
              </p>
            </div>

            {requiresCode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start mb-3">
                  <AlertCircle className="text-yellow-600 mr-2 flex-shrink-0" size={20} />
                  <p className="text-sm text-yellow-800">
                    <strong>Security Check Required:</strong> This admission has been verified twice today already. For security, a 6-digit verification code has been sent to the student's dashboard. The code is valid for 2 hours. Please ask the student for the code to confirm their identity.
                  </p>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.verificationCode}
                  onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-lg font-mono"
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required={requiresCode}
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <XCircle className="text-red-600 mr-2 flex-shrink-0" size={20} />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={verifying || !timeStatus.isOpen}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
            >
              {verifying ? (
                <>
                  <Clock className="animate-spin mr-2" size={24} />
                  Verifying...
                </>
              ) : !timeStatus.isOpen ? (
                <>
                  <Clock className="mr-2" size={24} />
                  Closed
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2" size={24} />
                  Verify Student
                </>
              )}
            </button>
          </form>
        </div>
          </>
        )}

        {/* Data Tab */}
        {activeTab === 'data' && isDataUnlocked && (
          <div className="bg-white rounded-b-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Verified Students Data</h3>
              <button
                onClick={handleDownloadData}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center transition"
              >
                <Download size={20} className="mr-2" />
                Download Excel
              </button>
            </div>
            
            {todayVerifications.length > 0 ? (
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Admission No.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Course</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Expiry Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(Array.isArray(todayVerifications) ? todayVerifications : []).map((verification) => (
                    <tr key={verification._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{verification.verificationTime}</td>
                      <td className="px-4 py-3 text-sm font-medium">{verification.admissionNumber}</td>
                      <td className="px-4 py-3 text-sm">{verification.student?.name}</td>
                      <td className="px-4 py-3 text-sm">{verification.student?.course}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          verification.status === 'Valid' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {verification.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {verification.expiryDate 
                          ? new Date(verification.expiryDate).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No verifications today</p>
          )}
          </div>
        )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex items-center mb-4">
              <Lock className="text-green-600 mr-3" size={32} />
              <h3 className="text-2xl font-bold text-gray-800">Password Required</h3>
            </div>
            <p className="text-gray-600 mb-6">Enter your login password to access verified data.</p>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Enter password"
                required
              />
              
              {passwordError && (
                <p className="text-red-600 text-sm">{passwordError}</p>
              )}
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
                >
                  Unlock
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordInput('');
                    setPasswordError('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>

      {/* Popup Modal */}
      {showPopup && popupData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full p-8 ${
            popupData.type === 'success' 
              ? 'bg-green-50 border-4 border-green-500'
              : 'bg-red-50 border-4 border-red-500'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {popupData.type === 'success' ? (
                  <CheckCircle className="text-green-600 mr-3" size={40} />
                ) : (
                  <XCircle className="text-red-600 mr-3" size={40} />
                )}
                <h3 className={`text-2xl font-bold ${
                  popupData.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {popupData.type === 'success' ? 'VALID GATE PASS' : 'GATE PASS EXPIRED'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowPopup(false);
                  setFormData({ admissionNumber: '', course: '', verificationCode: '' });
                  setRequiresCode(false);
                }}
                className="bg-white/50 hover:bg-white/70 p-2 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Student Name</p>
                <p className="text-xl font-bold text-gray-800">{popupData.student.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Admission Number</p>
                <p className="text-lg font-semibold text-gray-800">{popupData.student.admissionNumber}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Course</p>
                <p className="text-md text-gray-700">{popupData.student.course}</p>
              </div>

              <div className="border-t pt-3 mt-3">
                <p className="text-sm text-gray-600">
                  {popupData.type === 'success' ? 'Valid Until' : 'Expired On'}
                </p>
                <p className={`text-xl font-bold ${
                  popupData.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {new Date(popupData.expiryDate).toLocaleDateString()}
                </p>
              </div>

              {popupData.verificationTime && (
                <div>
                  <p className="text-sm text-gray-600">Verified At</p>
                  <p className="text-md font-semibold text-gray-700">{popupData.verificationTime}</p>
                </div>
              )}

              {/* Warning message for 2nd verification */}
              {popupData.warning && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mt-4">
                  <div className="flex items-start">
                    <AlertCircle className="text-yellow-600 mr-2 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-yellow-800 mb-1">Security Warning</p>
                      <p className="text-xs text-yellow-700">{popupData.warning}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p className={`mt-6 text-center text-sm ${
              popupData.type === 'success' ? 'text-green-700' : 'text-red-700'
            }`}>
              This popup will close in {popupData.warning ? '6' : '4'} seconds
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GateDashboard;
