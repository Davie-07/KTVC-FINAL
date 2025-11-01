import React, { useState, useEffect, useContext } from 'react';
import axios from '../../services/axios';
import { AuthContext } from '../../context/AuthContext';
import { Shield, CheckCircle, XCircle, Loader, FileText, AlertCircle } from 'lucide-react';

const KRAServices = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    identificationNumber: '',
    dateOfBirth: '',
    mobileNumber: '',
    emailAddress: user?.email || '',
    isPinWithNoOblig: 'Yes'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/kra/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching KRA requests:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await axios.post('/api/kra/generate-pin', formData);

      if (response.data.success) {
        setResult({
          success: true,
          pin: response.data.pin,
          message: response.data.message
        });
        setShowForm(false);
        fetchRequests();
        
        // Reset form
        setFormData({
          identificationNumber: '',
          dateOfBirth: '',
          mobileNumber: '',
          emailAddress: user?.email || '',
          isPinWithNoOblig: 'Yes'
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate KRA PIN');
      setResult({
        success: false,
        message: error.response?.data?.message,
        errorCode: error.response?.data?.errorCode
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      success: { color: 'bg-green-100 text-green-700', icon: CheckCircle, text: 'Success' },
      failed: { color: 'bg-red-100 text-red-700', icon: XCircle, text: 'Failed' },
      processing: { color: 'bg-yellow-100 text-yellow-700', icon: Loader, text: 'Processing' },
      pending: { color: 'bg-gray-100 text-gray-700', icon: Loader, text: 'Pending' }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center ${badge.color}`}>
        <Icon size={14} className="mr-1" />
        {badge.text}
      </span>
    );
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 lg:p-8 mb-6 shadow-lg">
        <div className="flex items-center mb-3">
          <Shield className="mr-3" size={32} />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">KRA Services</h1>
            <p className="text-green-100">Government KRA PIN Registration</p>
          </div>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className={`mb-6 p-6 rounded-xl shadow-md ${
          result.success ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
        }`}>
          <div className="flex items-start">
            {result.success ? (
              <CheckCircle className="text-green-600 mr-3 flex-shrink-0" size={24} />
            ) : (
              <XCircle className="text-red-600 mr-3 flex-shrink-0" size={24} />
            )}
            <div className="flex-1">
              <h3 className={`text-lg font-bold mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? 'KRA PIN Generated Successfully!' : 'PIN Generation Failed'}
              </h3>
              {result.success && result.pin && (
                <div className="bg-white p-4 rounded-lg mb-3">
                  <p className="text-sm text-gray-600 mb-1">Your KRA PIN:</p>
                  <p className="text-2xl font-mono font-bold text-green-600">{result.pin}</p>
                </div>
              )}
              <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.message}
              </p>
              {result.errorCode && (
                <p className="text-xs text-red-600 mt-2">Error Code: {result.errorCode}</p>
              )}
              <button
                onClick={() => setResult(null)}
                className="mt-3 text-sm underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
        <div className="flex items-start">
          <AlertCircle className="text-blue-600 mr-3 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm text-blue-800">
              <strong>KRA PIN Registration:</strong> This service allows you to register for a KRA Personal 
              Identification Number (PIN) directly from the school system. The PIN is required for tax purposes 
              and employment in Kenya.
            </p>
          </div>
        </div>
      </div>

      {/* Generate PIN Button / Form */}
      {!showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Generate New KRA PIN</h2>
          <p className="text-gray-600 mb-4">
            Click the button below to start the KRA PIN registration process.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center"
          >
            <FileText size={20} className="mr-2" />
            Start PIN Registration
          </button>
        </div>
      )}

      {/* Registration Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">KRA PIN Registration Form</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  National ID Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.identificationNumber}
                  onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="Enter National ID Number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="DD/MM/YYYY (e.g., 01/01/1990)"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">Format: DD/MM/YYYY</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="0700000000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Register PIN with Tax Obligations?
              </label>
              <select
                value={formData.isPinWithNoOblig}
                onChange={(e) => setFormData({ ...formData, isPinWithNoOblig: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                <option value="Yes">No - Without Tax Obligations (Recommended)</option>
                <option value="No">Yes - With Tax Obligations</option>
              </select>
              <p className="text-xs text-gray-600 mt-1">
                Most students should select "Without Tax Obligations"
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin mr-2" size={20} />
                    Generating PIN...
                  </>
                ) : (
                  <>
                    <Shield size={20} className="mr-2" />
                    Generate KRA PIN
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError('');
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Previous Requests */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your KRA PIN Requests</h2>
        
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600">No KRA PIN requests yet</p>
            <p className="text-sm text-gray-500 mt-2">Your registration history will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID Number</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">KRA PIN</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-700">
                      {request.identificationNumber}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {request.pin ? (
                        <span className="font-mono font-bold text-green-600">{request.pin}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {request.responseMessage || request.errorMessage || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default KRAServices;
