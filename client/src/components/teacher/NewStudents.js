import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { Users, CheckCircle, X, AlertCircle } from 'lucide-react';

const NewStudents = () => {
  const [newStudents, setNewStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchNewStudents();
  }, []);

  const fetchNewStudents = async () => {
    try {
      const response = await axios.get('/api/teacher/new-students');
      setNewStudents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching new students:', error);
      setLoading(false);
    }
  };

  const handleActivate = (student) => {
    setSelectedStudent(student);
    setShowConfirmModal(true);
  };

  const handleConfirmActivation = async () => {
    try {
      await axios.post(`/api/teacher/approve-student/${selectedStudent._id}`);
      alert('Student account activated successfully!');
      setShowConfirmModal(false);
      setSelectedStudent(null);
      fetchNewStudents();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading new students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 lg:p-8 mb-6 shadow-lg">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          New Student Activations
        </h1>
        <p className="text-green-100">Students pending final activation from finance approval</p>
      </div>

      {/* Students Count */}
      <div className="bg-white rounded-xl p-6 shadow-md mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm mb-1">Pending Teacher Activation</p>
            <p className="text-4xl font-bold text-green-600">{newStudents.length}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-full">
            <Users className="text-green-600" size={32} />
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="text-green-600" size={40} />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
                Activate Student Account?
              </h2>

              {/* Student Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="font-bold text-lg mb-2">{selectedStudent.name}</p>
                <p className="text-sm text-gray-700">Admission: {selectedStudent.admissionNumber}</p>
                <p className="text-sm text-gray-700">Course: {selectedStudent.course?.name}</p>
                <p className="text-sm text-gray-700">Level: {selectedStudent.level}</p>
                <p className="text-sm text-gray-700">Email: {selectedStudent.email}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <AlertCircle size={16} className="inline mr-1" />
                  This will activate the student account and send them a welcome notification. They will be able to login and access all system features.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleConfirmActivation}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center"
                >
                  <CheckCircle size={20} className="mr-2" />
                  Activate Account
                </button>
                
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedStudent(null);
                  }}
                  className="px-6 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students Table */}
      {newStudents.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Students Awaiting Activation</h2>
            <p className="text-sm text-gray-600">These students have completed finance processing and are ready for activation</p>
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
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
                    <td className="px-6 py-4 text-sm">{student.phoneNumber || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleActivate(student)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center transition"
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Activate
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
          <p className="text-gray-600">All students have been activated. New finance-approved students will appear here.</p>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
        <h3 className="font-bold text-blue-900 mb-2">Registration Workflow:</h3>
        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
          <li><strong>Enrollment:</strong> Student details entered by enrollment office</li>
          <li><strong>Finance:</strong> Fee amount set and payment processed</li>
          <li><strong>Teacher (You):</strong> Final activation - student account becomes active</li>
          <li><strong>Student:</strong> Can now login and access the system</li>
        </ol>
      </div>
    </div>
  );
};

export default NewStudents;
