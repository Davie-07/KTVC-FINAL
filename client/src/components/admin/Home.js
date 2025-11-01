import React, { useState, useEffect, useContext } from 'react';
import axios from '../../services/axios';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, Plus, Edit, Trash2, Users, CheckCircle, XCircle, Save, X, Download } from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [quote, setQuote] = useState(null);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    description: '',
    duration: '',
    level: 'Level 4'
  });

  useEffect(() => {
    fetchQuote();
    fetchCourses();
    fetchStats();
  }, []);

  const fetchQuote = async () => {
    try {
      const dayOfWeek = new Date().getDay();
      const response = await axios.get(`/api/student/quote/${dayOfWeek}`);
      setQuote(response.data);
    } catch (error) {
      console.error('Error fetching quote:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/admin/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCourse) {
        await axios.put(`/api/admin/course/${editingCourse._id}`, courseForm);
        alert('Course updated successfully!');
      } else {
        await axios.post('/api/admin/course', courseForm);
        alert('Course created successfully!');
      }

      setCourseForm({ name: '', code: '', description: '', duration: '', level: 'Level 4' });
      setShowCourseForm(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (error) {
      alert('Error: ' + error.response?.data?.message);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name,
      code: course.code,
      description: course.description || '',
      duration: course.duration || '',
      level: course.level || 'Level 4'
    });
    setShowCourseForm(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      await axios.delete(`/api/admin/course/${courseId}`);
      alert('Course deleted successfully!');
      fetchCourses();
    } catch (error) {
      alert('Error: ' + error.response?.data?.message);
    }
  };

  const handleToggleCourseStatus = async (course) => {
    try {
      await axios.put(`/api/admin/course/${course._id}`, {
        ...course,
        isActive: !course.isActive
      });
      fetchCourses();
    } catch (error) {
      alert('Error: ' + error.response?.data?.message);
    }
  };

  const handleDownloadTeachers = async () => {
    try {
      const response = await axios.get('/api/downloads/admin/teachers', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Teachers_Data_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Error downloading teachers data: ' + error.message);
    }
  };

  const handleDownloadStaff = async () => {
    try {
      const response = await axios.get('/api/downloads/admin/staff', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Staff_Data_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Error downloading staff data: ' + error.message);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl p-6 lg:p-8 mb-6 shadow-lg">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          Welcome, {user?.name}! 👋
        </h1>
        <p className="text-red-100 text-lg">
          Admin Dashboard - Manage system accounts, courses, and configurations
        </p>
      </div>

      {/* Dynamic Quote */}
      {quote && (
        <div className="bg-white rounded-xl p-6 mb-6 shadow-md border-l-4 border-red-500">
          <p className="text-gray-700 text-lg italic mb-2">"{quote.text}"</p>
          <p className="text-gray-600 text-sm">— {quote.author}</p>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <p className="text-gray-600 text-sm mb-1">Total Users</p>
            <p className="text-4xl font-bold text-red-600">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <p className="text-gray-600 text-sm mb-1">Total Students</p>
            <p className="text-4xl font-bold text-blue-600">{stats.totalStudents}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <p className="text-gray-600 text-sm mb-1">Total Teachers</p>
            <p className="text-4xl font-bold text-green-600">{stats.totalTeachers}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <p className="text-gray-600 text-sm mb-1">Total Courses</p>
            <p className="text-4xl font-bold text-purple-600">{stats.totalCourses}</p>
          </div>
        </div>
      )}

      {/* Download Data Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center mb-6">
          <Download className="text-red-600 mr-3" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Download Data</h2>
            <p className="text-sm text-gray-600">Export data to Excel format</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleDownloadTeachers}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg flex items-center justify-center transition"
          >
            <Download size={20} className="mr-2" />
            Download All Teachers Data
          </button>
          
          <button
            onClick={handleDownloadStaff}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg flex items-center justify-center transition"
          >
            <Download size={20} className="mr-2" />
            Download All Staff Data
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          📊 Excel files include: Names, Emails, Account Codes/IDs, Status, and Date Joined
        </p>
      </div>

      {/* Course Management Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <BookOpen className="text-red-600 mr-3" size={28} />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Course Management</h2>
              <p className="text-sm text-gray-600">Create and manage courses available for enrollment</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowCourseForm(!showCourseForm);
              setEditingCourse(null);
              setCourseForm({ name: '', code: '', description: '', duration: '', level: 'Level 4' });
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Course
          </button>
        </div>

        {/* Course Form */}
        {showCourseForm && (
          <form onSubmit={handleCourseSubmit} className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Diploma in Information Technology"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., DIT"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={courseForm.duration}
                  onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., 2 years"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <select
                  value={courseForm.level}
                  onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="Level 4">Level 4</option>
                  <option value="Level 5">Level 5</option>
                  <option value="Level 6">Level 6</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                rows="3"
                placeholder="Enter course description..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center"
              >
                <Save size={20} className="mr-2" />
                {editingCourse ? 'Update Course' : 'Create Course'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCourseForm(false);
                  setEditingCourse(null);
                  setCourseForm({ name: '', code: '', description: '', duration: '', level: 'Level 4' });
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center"
              >
                <X size={20} className="mr-2" />
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Courses List */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Course Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Level</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{course.name}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-700">{course.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{course.level || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{course.duration || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleToggleCourseStatus(course)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center ${
                          course.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {course.isActive ? (
                          <><CheckCircle size={14} className="mr-1" /> Active</>
                        ) : (
                          <><XCircle size={14} className="mr-1" /> Inactive</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <BookOpen className="mx-auto text-gray-400 mb-3" size={48} />
                    <p className="text-gray-600 text-lg font-semibold mb-2">No Courses Yet</p>
                    <p className="text-gray-500 text-sm mb-4">
                      Get started by adding your first course to the system
                    </p>
                    <button
                      onClick={() => {
                        setShowCourseForm(true);
                        setEditingCourse(null);
                        setCourseForm({ name: '', code: '', description: '', duration: '', level: 'Level 4' });
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
                    >
                      <Plus size={20} className="mr-2" />
                      Add Your First Course
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Home;
