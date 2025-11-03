import React, { useState, useEffect, useContext } from 'react';
import axios from '../../services/axios';
import { AuthContext } from '../../context/AuthContext';
import { Receipt, CheckCircle, XCircle, Clock, GraduationCap } from 'lucide-react';

const GateReceipt = () => {
  const { user } = useContext(AuthContext);
  const [gatepass, setGatepass] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.admissionNumber) {
      fetchGatepass();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.admissionNumber]);

  const fetchGatepass = async () => {
    try {
      // Fetch verification receipts from the gate API
      // URL encode the admission number to handle slashes in KTVC/25J/1600 format
      const response = await axios.get(`/api/gate/student/${encodeURIComponent(user.admissionNumber)}/receipts`);
      
      if (response.data && response.data.length > 0) {
        // Get the most recent receipt
        const receipt = response.data[0];
        setGatepass({
          admissionNumber: user.admissionNumber,
          verificationCode: receipt.verificationCode,
          date: receipt.generatedDate,
          validUntil: receipt.expiresAt,
          isValid: !receipt.isUsed && new Date(receipt.expiresAt) >= new Date(),
          verificationCount: 3 // Since receipt is generated after 3 verifications
        });
      } else {
        setGatepass(null);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching gatepass:', error);
      setGatepass(null);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const isValid = gatepass && gatepass.isValid && new Date(gatepass.validUntil) >= new Date();

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6 lg:p-8 mb-6 shadow-lg">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center">
          <Receipt className="mr-3" size={32} />
          Gate Pass Receipt
        </h1>
        <p className="text-indigo-100">Temporary verification receipt for gate access</p>
      </div>

      {isValid ? (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-green-500">
          {/* Receipt Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-white p-3 rounded-full">
                <GraduationCap className="text-green-600" size={48} />
              </div>
            </div>
            <h2 className="text-2xl font-bold">School Management System</h2>
            <p className="text-green-100 mt-1">Official Gate Pass Receipt</p>
          </div>

          {/* Receipt Body */}
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center bg-green-100 text-green-800 px-4 py-2 rounded-full mb-4">
                <CheckCircle className="mr-2" size={20} />
                <span className="font-semibold">VALID</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-600 mb-1">Student Name</p>
                  <p className="text-lg font-semibold text-gray-800">{user?.name}</p>
                </div>
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-600 mb-1">Admission Number</p>
                  <p className="text-lg font-semibold text-gray-800">{gatepass.admissionNumber}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Verification Code</p>
                <p className="text-4xl font-bold text-indigo-600 tracking-wider">{gatepass.verificationCode}</p>
                <p className="text-xs text-gray-500 mt-2">Present this code at the gate</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-600 mb-1">Date Issued</p>
                  <p className="font-medium text-gray-800">
                    {new Date(gatepass.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(gatepass.date).toLocaleTimeString()}
                  </p>
                </div>
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-600 mb-1">Valid Until</p>
                  <p className="font-medium text-gray-800">
                    {new Date(gatepass.validUntil).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(gatepass.validUntil).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-3">
                <p className="text-sm text-gray-600 mb-1">Verification Count</p>
                <p className="font-medium text-gray-800">{gatepass.verificationCount} time(s)</p>
              </div>
            </div>

            {/* Important Notice */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> This gate pass is valid only for today. 
                Please present this code to the gate verification officer for re-entry.
              </p>
            </div>
          </div>

          {/* Receipt Footer */}
          <div className="bg-gray-50 p-4 text-center border-t">
            <p className="text-xs text-gray-500">
              This is a computer-generated receipt. No signature required.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Generated on {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="inline-flex items-center justify-center bg-gray-100 p-4 rounded-full mb-6">
            <XCircle className="text-gray-400" size={64} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No Active Gate Pass</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You don't have an active gate pass at the moment. A gate pass will be generated 
            automatically when the gate verification officer verifies your admission number 
            3 times in a day.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-start">
              <Clock className="text-yellow-600 mr-2 flex-shrink-0 mt-1" size={20} />
              <div className="text-left text-sm text-yellow-800">
                <p className="font-semibold mb-1">How it works:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Visit the gate verification desk</li>
                  <li>Present your admission number for verification</li>
                  <li>After 3 verifications, a 6-digit code will be generated</li>
                  <li>Use this code for subsequent entries on the same day</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GateReceipt;
