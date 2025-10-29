import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { ShieldCheck, X, AlertCircle, CheckCircle, XCircle, Clock, LogOut } from 'lucide-react';

const GateDashboard = () => {
  const { user, loading, logout } = useContext(AuthContext);
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

  React.useEffect(() => {
    if (user && user.role === 'gate') {
      fetchTodayVerifications();
      fetchStats();
    }
  }, [user]);

  const fetchTodayVerifications = async () => {
    try {
      const response = await axios.get('/api/gate/verifications/today');
      setTodayVerifications(response.data);
    } catch (error) {
      console.error('Error fetching verifications:', error);
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
          message: response.data.message
        });
        setShowPopup(true);

        // Auto-close after 4 seconds
        setTimeout(() => {
          setShowPopup(false);
          setFormData({ admissionNumber: '', course: '', verificationCode: '' });
          setRequiresCode(false);
          fetchTodayVerifications();
          fetchStats();
        }, 4000);

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

        if (errorData.alreadyVerified) {
          // Student already verified today
          setError(errorData.message);
          setTimeout(() => setError(''), 5000);
        } else if (errorData.requiresCode) {
          // Need 6-digit code
          setRequiresCode(true);
          setError(errorData.message);
        } else {
          setError(errorData.message || 'Verification failed');
          setTimeout(() => setError(''), 5000);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'gate') {
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-lg"
                placeholder="e.g., STD001"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-lg"
                placeholder="e.g., Diploma in Information Technology"
                required
              />
            </div>

            {requiresCode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start mb-3">
                  <AlertCircle className="text-yellow-600 mr-2 flex-shrink-0" size={20} />
                  <p className="text-sm text-yellow-800">
                    This student has been verified 3 times today. A 6-digit verification code has been sent to their dashboard. Please ask the student for the code.
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
              disabled={verifying}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition duration-200 disabled:opacity-50 flex items-center justify-center text-lg"
            >
              {verifying ? (
                <>
                  <Clock className="animate-spin mr-2" size={24} />
                  Verifying...
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

        {/* Today's Verifications */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Today's Verifications</h3>
          
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
                  {todayVerifications.map((verification) => (
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
            </div>

            <p className={`mt-6 text-center text-sm ${
              popupData.type === 'success' ? 'text-green-700' : 'text-red-700'
            }`}>
              This popup will close in 4 seconds
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GateDashboard;
