import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { DollarSign, Users, Search, Edit, Save, X, Calendar, AlertCircle } from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showFeeForm, setShowFeeForm] = useState(false);
  const [stats, setStats] = useState(null);

  const [feeForm, setFeeForm] = useState({
    totalAmount: '',
    amountPaid: '',
    balance: '',
    semester: 'Semester 1',
    academicYear: '2024/2025',
    gatepassExpiryDate: '',
    lastUnpaidBalance: '',
    unpaidBalanceSemester: '',
    unpaidBalanceYear: '',
    status: 'Unpaid',
    paymentAmount: '',
    paymentMethod: 'Cash',
    receiptNumber: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/finance/students');
      setStudents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/finance/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    setShowFeeForm(true);

    // Pre-fill form if student has existing fee data
    if (student.currentFee) {
      setFeeForm({
        totalAmount: student.currentFee.totalAmount || '',
        amountPaid: student.currentFee.amountPaid || '',
        balance: student.currentFee.balance || '',
        semester: student.currentFee.semester || 'Semester 1',
        academicYear: student.currentFee.academicYear || '2024/2025',
        gatepassExpiryDate: student.currentFee.gatepassExpiryDate 
          ? new Date(student.currentFee.gatepassExpiryDate).toISOString().split('T')[0]
          : '',
        lastUnpaidBalance: student.currentFee.lastUnpaidBalance || '',
        unpaidBalanceSemester: student.currentFee.unpaidBalanceSemester || '',
        unpaidBalanceYear: student.currentFee.unpaidBalanceYear || '',
        status: student.currentFee.status || 'Unpaid',
        paymentAmount: '',
        paymentMethod: 'Cash',
        receiptNumber: ''
      });
    } else {
      // Reset form for new student
      setFeeForm({
        totalAmount: '',
        amountPaid: '',
        balance: '',
        semester: 'Semester 1',
        academicYear: '2024/2025',
        gatepassExpiryDate: '',
        lastUnpaidBalance: '',
        unpaidBalanceSemester: '',
        unpaidBalanceYear: '',
        status: 'Unpaid',
        paymentAmount: '',
        paymentMethod: 'Cash',
        receiptNumber: ''
      });
    }
  };

  const handleSubmitFee = async (e) => {
    e.preventDefault();

    try {
      await axios.post('/api/finance/fee', {
        studentId: selectedStudent._id,
        ...feeForm,
        gatepassExpiryDate: feeForm.gatepassExpiryDate ? new Date(feeForm.gatepassExpiryDate) : null
      });

      alert('Fee record updated successfully!');
      setShowFeeForm(false);
      setSelectedStudent(null);
      fetchStudents();
      fetchStats();
    } catch (error) {
      alert('Error updating fee: ' + error.response?.data?.message);
    }
  };

  const calculateBalance = () => {
    const total = parseFloat(feeForm.totalAmount) || 0;
    const paid = parseFloat(feeForm.amountPaid) || 0;
    const unpaid = parseFloat(feeForm.lastUnpaidBalance) || 0;
    return total + unpaid - paid;
  };

  const handleAutoCalculate = () => {
    const balance = calculateBalance();
    setFeeForm({ ...feeForm, balance: balance.toFixed(2) });

    // Auto-set status
    if (balance <= 0) {
      setFeeForm(prev => ({ ...prev, status: 'Paid', balance: balance.toFixed(2) }));
    } else if (balance > 0 && (parseFloat(feeForm.amountPaid) || 0) > 0) {
      setFeeForm(prev => ({ ...prev, status: 'Partial', balance: balance.toFixed(2) }));
    } else {
      setFeeForm(prev => ({ ...prev, status: 'Unpaid', balance: balance.toFixed(2) }));
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-6 lg:p-8 mb-6 shadow-lg">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          Welcome, {user?.name}! 💰
        </h1>
        <p className="text-blue-100 text-lg">
          Finance Dashboard - Manage student fee payments and gate pass validity
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Students</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Expected</p>
                <p className="text-2xl font-bold text-purple-600">
                  KES {stats.totalExpected.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <DollarSign className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Collected</p>
                <p className="text-2xl font-bold text-green-600">
                  KES {stats.totalCollected.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Pending</p>
                <p className="text-2xl font-bold text-red-600">
                  KES {stats.totalPending.toLocaleString()}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <DollarSign className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, admission number, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">All Students - Fee Management</h2>
          <p className="text-sm text-gray-600">Click on any student to update their fee information</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Admission No.</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Course</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Level</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Year of Study</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Semester</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Balance</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{student.admissionNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.course?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.level || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.yearOfStudy}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.currentFee?.semester || 'Not Set'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {student.currentFee ? (
                        <span className={`font-semibold ${
                          student.currentFee.balance > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          KES {student.currentFee.balance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">No Data</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {student.currentFee ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          student.currentFee.status === 'Paid' ? 'bg-green-100 text-green-700' :
                          student.currentFee.status === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {student.currentFee.status}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleStudentClick(student)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
                      >
                        <Edit size={16} className="mr-1" />
                        Update Fee
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fee Update Modal */}
      {showFeeForm && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Update Fee Data</h2>
                  <p className="text-blue-100 mt-1">
                    {selectedStudent.name} ({selectedStudent.admissionNumber})
                  </p>
                  <p className="text-sm text-blue-200">
                    {selectedStudent.course?.name} - {selectedStudent.level}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowFeeForm(false);
                    setSelectedStudent(null);
                  }}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitFee} className="p-6">
              {/* Current Fee Info */}
              {selectedStudent.currentFee && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="text-blue-600 mr-2 flex-shrink-0" size={20} />
                    <div className="text-sm">
                      <p className="font-semibold text-blue-800 mb-1">Last Payment Information:</p>
                      <p className="text-blue-700">
                        Amount Paid: KES {selectedStudent.currentFee.amountPaid?.toLocaleString() || 0}
                      </p>
                      {selectedStudent.currentFee.payments && selectedStudent.currentFee.payments.length > 0 && (
                        <p className="text-blue-700">
                          Last Payment: KES {selectedStudent.currentFee.payments[selectedStudent.currentFee.payments.length - 1].amount} 
                          on {new Date(selectedStudent.currentFee.payments[selectedStudent.currentFee.payments.length - 1].date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Fee Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={feeForm.totalAmount}
                    onChange={(e) => setFeeForm({ ...feeForm, totalAmount: e.target.value })}
                    onBlur={handleAutoCalculate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 45000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Paid <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={feeForm.amountPaid}
                    onChange={(e) => setFeeForm({ ...feeForm, amountPaid: e.target.value })}
                    onBlur={handleAutoCalculate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 30000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Unpaid Balance
                  </label>
                  <input
                    type="number"
                    value={feeForm.lastUnpaidBalance}
                    onChange={(e) => setFeeForm({ ...feeForm, lastUnpaidBalance: e.target.value })}
                    onBlur={handleAutoCalculate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 5000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unpaid Balance Semester
                  </label>
                  <select
                    value={feeForm.unpaidBalanceSemester}
                    onChange={(e) => setFeeForm({ ...feeForm, unpaidBalanceSemester: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Semester</option>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unpaid Balance Year
                  </label>
                  <input
                    type="text"
                    value={feeForm.unpaidBalanceYear}
                    onChange={(e) => setFeeForm({ ...feeForm, unpaidBalanceYear: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2023/2024"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Balance (Auto-calculated)
                  </label>
                  <input
                    type="number"
                    value={feeForm.balance}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    placeholder="Will be calculated"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={feeForm.status}
                    onChange={(e) => setFeeForm({ ...feeForm, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={feeForm.semester}
                    onChange={(e) => setFeeForm({ ...feeForm, semester: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={feeForm.academicYear}
                    onChange={(e) => setFeeForm({ ...feeForm, academicYear: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2024/2025"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="mr-2" size={18} />
                  Gate Pass Expiry Date <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="date"
                  value={feeForm.gatepassExpiryDate}
                  onChange={(e) => setFeeForm({ ...feeForm, gatepassExpiryDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">
                  This date determines when the student's gate pass expires. Required for gate verification.
                </p>
              </div>

              <div className="border-t pt-4 mb-4">
                <h3 className="font-semibold text-gray-700 mb-3">Add New Payment (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Amount
                    </label>
                    <input
                      type="number"
                      value={feeForm.paymentAmount}
                      onChange={(e) => setFeeForm({ ...feeForm, paymentAmount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 10000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={feeForm.paymentMethod}
                      onChange={(e) => setFeeForm({ ...feeForm, paymentMethod: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Cash">Cash</option>
                      <option value="M-Pesa">M-Pesa</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Receipt Number
                    </label>
                    <input
                      type="text"
                      value={feeForm.receiptNumber}
                      onChange={(e) => setFeeForm({ ...feeForm, receiptNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowFeeForm(false);
                    setSelectedStudent(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center"
                >
                  <X size={20} className="mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center"
                >
                  <Save size={20} className="mr-2" />
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
