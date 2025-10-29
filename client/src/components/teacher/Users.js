import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users as UsersIcon, Edit, Save, X, Search } from 'lucide-react';

const Users = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editForm, setEditForm] = useState({
    course: '',
    level: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/teacher/students');
      setStudents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/teacher/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student._id);
    setEditForm({
      course: student.course?._id || '',
      level: student.level || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setEditForm({ course: '', level: '' });
  };

  const handleSave = async (studentId) => {
    try {
      await axios.put(`/api/teacher/student/${studentId}`, editForm);
      alert('Student information updated successfully!');
      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      alert('Error updating student: ' + error.response?.data?.message);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 lg:p-8 mb-6 shadow-lg">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center">
          <UsersIcon className="mr-3" size={32} />
          Student Management
        </h1>
        <p className="text-green-100">Manage student information, courses, and levels</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, admission number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Admission No.</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Course</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Level</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{student.admissionNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                    <td className="px-6 py-4 text-sm">
                      {editingStudent === student._id ? (
                        <select
                          value={editForm.course}
                          onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
                          className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Select Course</option>
                          {courses.map(course => (
                            <option key={course._id} value={course._id}>{course.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-900">{student.course?.name || 'Not Assigned'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {editingStudent === student._id ? (
                        <select
                          value={editForm.level}
                          onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                          className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Select Level</option>
                          {['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'].map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-900">{student.level || 'Not Assigned'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {editingStudent === student._id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(student._id)}
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
                            title="Save"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(student)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No students found matching your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Students</p>
            <p className="text-3xl font-bold text-green-600">{students.length}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Courses</p>
            <p className="text-3xl font-bold text-blue-600">{courses.length}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Filtered Results</p>
            <p className="text-3xl font-bold text-purple-600">{filteredStudents.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
