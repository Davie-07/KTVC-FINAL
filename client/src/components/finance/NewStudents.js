import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { Users, DollarSign, CheckCircle, X } from 'lucide-react';

const NewStudents = () => {
  const [newStudents, setNewStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [feeForm, setFeeForm] = useState({
    totalAmount: '',
    amountPaid: '',
    semester: 'Semester 1',
    academicYear: '2024/2025',
    gatepassExpiryDate: ''
  });

  useEffect(() => {
    fetchNewStudents();
  }, []);

  const fetchNewStudents = async () => {
    try {
      const response = await axios.get('/api/finance/new-students');
      setNewStudents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching new students:', error);
      setLoading(false);
    }
  };

  const handleApprove = (student) => {
    setSelectedStudent(student);
    setShowApprovalForm(true);
    // Set default gatepass expiry to 1 year from now
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    setFeeForm({
      ...feeForm,
      gatepassExpiryDate: oneYearLater.toISOString().split('T')[0]
    });
  };

  const handleSubmitApproval = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/finance/approve-student/${selectedStudent._id}`, feeForm);
      alert('Student approved and forwarded to Teacher department!');
      setShowApprovalForm(false);
      setSelectedStudent(null);
      setFeeForm({
        totalAmount: '',
        amountPaid: '',
        semester: 'Semester 1',
        academicYear: '2024/2025',
        gatepassExpiryDate: ''
      });
      fetchNewStudents();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const calculateBalance = () => {
    const total = parseFloat(feeForm.totalAmount) || 0;
    const paid = parseFloat(feeForm.amountPaid) || 0;
    return total - paid;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading new students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6 lg:p-8 mb-6 shadow-lg">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          New Student Registrations
        </h1>
        <p className="text-blue-100">Students pending finance approval from enrollment</p>
      </div>

      {/* Students Count */}
      <div className="bg-white rounded-xl p-6 shadow-md mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm mb-1">Pending Finance Approval</p>
            <p className="text-4xl font-bold text-blue-600">{newStudents.length}</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-full">
            <Users className="text-blue-600" size={32} />
          </div>
        </div>
      </div>

      {/* Approval Form Modal */}
      {showApprovalForm && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Process Fee Payment</h2>
                <button
                  onClick={() => {
                    setShowApprovalForm(false);
                    setSelectedStudent(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Student Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Student Details</p>
                <p className="font-bold text-lg">{selectedStudent.name}</p>
                <p className="text-sm text-gray-700">Admission: {selectedStudent.admissionNumber}</p>
                <p className="text-sm text-gray-700">Course: {selectedStudent.course?.name}</p>
                <p className="text-sm text-gray-700">Level: {selectedStudent.level}</p>
              </div>

              <form onSubmit={handleSubmitApproval} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Fee Amount (KES) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={feeForm.totalAmount}
                      onChange={(e) => setFeeForm({ ...feeForm, totalAmount: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter total amount"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount Paid (KES) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={feeForm.amountPaid}
                      onChange={(e) => setFeeForm({ ...feeForm, amountPaid: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount paid"
                      required
                    />
                  </div>
                </div>

                {/* Balance Display */}
                {feeForm.totalAmount && feeForm.amountPaid && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Balance:</strong> KES {calculateBalance().toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                    <select
                      value={feeForm.semester}
                      onChange={(e) => setFeeForm({ ...feeForm, semester: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Semester 1</option>
                      <option>Semester 2</option>
                      <option>Semester 3</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                    <select
                      value={feeForm.academicYear}
                      onChange={(e) => setFeeForm({ ...feeForm, academicYear: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option>2024/2025</option>
                      <option>2025/2026</option>
                      <option>2026/2027</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gatepass Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={feeForm.gatepassExpiryDate}
                    onChange={(e) => setFeeForm({ ...feeForm, gatepassExpiryDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center"
                  >
                    <CheckCircle size={20} className="mr-2" />
                    Approve & Forward to Teacher
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowApprovalForm(false);
                      setSelectedStudent(null);
                    }}
                    className="px-6 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Students Table */}
      {newStudents.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Students Awaiting Finance Processing</h2>
            <p className="text-sm text-gray-600">Click "Process" to add fee details and approve</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Admission No.</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Course</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Level</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Registered By</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {newStudents.map((student) => (
                  <tr key={student._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{student.admissionNumber}</td>
                    <td className="px-6 py-4 text-sm font-medium">{student.name}</td>
                    <td className="px-6 py-4 text-sm">{student.email}</td>
                    <td className="px-6 py-4 text-sm">{student.course?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">{student.level}</td>
                    <td className="px-6 py-4 text-sm">{student.createdBy?.name || 'System'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleApprove(student)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center transition"
                      >
                        <DollarSign size={16} className="mr-1" />
                        Process
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-gray-400" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Pending Students</h3>
          <p className="text-gray-600">All students have been processed. New enrollments will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default NewStudents;
