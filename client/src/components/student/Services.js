import React, { useState } from 'react';
import { ExternalLink, Search, FileText, AlertCircle } from 'lucide-react';

const Services = () => {
  const [kraPin, setKraPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleKraSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    // Note: This is a placeholder. In production, you would integrate with actual KRA API
    // You'll need to register with KRA and get API credentials
    
    setTimeout(() => {
      setLoading(false);
      setResult({
        pin: kraPin,
        name: 'Sample Name',
        status: 'Active',
        registrationDate: '2020-01-15',
        message: 'This is a demo response. Connect to real KRA API for actual data.'
      });
    }, 2000);
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 lg:p-8 mb-6 shadow-lg">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Services</h1>
        <p className="text-green-100">Access external services and integrations</p>
      </div>

      {/* KRA Services */}
      <div className="bg-white rounded-xl p-6 shadow-md mb-6">
        <div className="flex items-center mb-4">
          <FileText className="text-green-600 mr-3" size={32} />
          <div>
            <h2 className="text-xl font-bold text-gray-800">KRA PIN Verification</h2>
            <p className="text-sm text-gray-600">Verify KRA PIN status and details</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="text-yellow-600 mr-2 flex-shrink-0" size={20} />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Important Notice:</p>
              <p>This is a demo interface. To use real KRA API services, you need to:</p>
              <ul className="list-disc ml-5 mt-2">
                <li>Register with KRA iTax portal</li>
                <li>Apply for API access credentials</li>
                <li>Configure API keys in the system</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleKraSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={kraPin}
              onChange={(e) => setKraPin(e.target.value.toUpperCase())}
              placeholder="Enter KRA PIN (e.g., A001234567B)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              pattern="[A-Z][0-9]{9}[A-Z]"
              title="KRA PIN format: A001234567B"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition duration-200 disabled:opacity-50 flex items-center"
            >
              <Search className="mr-2" size={20} />
              {loading ? 'Searching...' : 'Verify'}
            </button>
          </div>
        </form>

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Verification Result</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">KRA PIN</p>
                <p className="font-semibold text-gray-800">{result.pin}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-800">{result.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-green-600">{result.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registration Date</p>
                <p className="font-semibold text-gray-800">{result.registrationDate}</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
              <strong>Note:</strong> {result.message}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Additional Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">KRA iTax Portal</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Access the official KRA iTax portal for tax-related services
          </p>
          <a
            href="https://itax.kra.go.ke"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            Visit Portal
            <ExternalLink className="ml-2" size={16} />
          </a>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">NSSF Services</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Check NSSF contribution statements and services
          </p>
          <a
            href="https://www.nssf.or.ke"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            Visit Portal
            <ExternalLink className="ml-2" size={16} />
          </a>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">NHIF Services</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Access NHIF member portal and check contributions
          </p>
          <a
            href="https://www.nhif.or.ke"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            Visit Portal
            <ExternalLink className="ml-2" size={16} />
          </a>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">eCitizen</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Access government services through eCitizen platform
          </p>
          <a
            href="https://www.ecitizen.go.ke"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            Visit Portal
            <ExternalLink className="ml-2" size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Services;
