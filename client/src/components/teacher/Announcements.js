import React, { useState, useEffect, useContext } from 'react';
import axios from '../../services/axios';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Megaphone, Plus, Trash2, Calendar, Users, AlertCircle, 
  Clock, Target, TrendingUp, Loader 
} from 'lucide-react';

const Announcements = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetAudience: 'all',
    targetCourse: '',
    priority: 'medium',
    validFrom: new Date().toISOString().slice(0, 16),
    validUntil: ''
  });

  useEffect(() => {
    fetchAnnouncements();
    if (user?.role === 'teacher') {
      fetchCourses();
    } else if (user?.role === 'admin') {
      fetchAllCourses();
    }
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const endpoint = user?.role === 'admin' 
        ? '/api/admin/announcements'
        : '/api/teacher/announcements';
      const response = await axios.get(endpoint);
      setAnnouncements(response.data);
    } catch (error) {
      showToast('Failed to load announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/teacher/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to load courses');
    }
  };

  const fetchAllCourses = async () => {
    try {
      const response = await axios.get('/api/admin/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to load courses');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.validUntil) {
      showToast('Please set an expiry date', 'error');
      return;
    }

    setCreating(true);
    try {
      const endpoint = user?.role === 'admin'
        ? '/api/admin/announcements'
        : '/api/teacher/announcements';
      
      const response = await axios.post(endpoint, formData);
      
      showToast(`Announcement sent to ${response.data.recipientCount} users`, 'success');
      setAnnouncements([response.data.announcement, ...announcements]);
      setShowForm(false);
      setFormData({
        title: '',
        message: '',
        targetAudience: 'all',
        targetCourse: '',
        priority: 'medium',
        validFrom: new Date().toISOString().slice(0, 16),
        validUntil: ''
      });
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create announcement', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    
    setDeletingId(id);
    try {
      const endpoint = user?.role === 'admin'
        ? `/api/admin/announcements/${id}`
        : `/api/teacher/announcements/${id}`;
      
      await axios.delete(endpoint);
      setAnnouncements(announcements.filter(a => a._id !== id));
      showToast('Announcement deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete announcement', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    };
    return colors[priority] || colors.medium;
  };

  const getTargetAudienceLabel = (audience) => {
    const labels = {
      all: 'All Users',
      students: 'Students Only',
      teachers: 'Teachers Only',
      'specific-course': 'Specific Course'
    };
    return labels[audience] || audience;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-800 text-white rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-full mr-4">
              <Megaphone className="text-blue-600 dark:text-blue-400" size={32} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Announcements</h1>
              <p className="text-blue-100 dark:text-purple-200">Create and manage announcements</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-gray-700 transition flex items-center"
          >
            <Plus size={20} className="mr-2" />
            New Announcement
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Create Announcement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Target size={16} className="inline mr-2" />
                  Target Audience *
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="all">All Users</option>
                  <option value="students">Students Only</option>
                  {user?.role === 'admin' && <option value="teachers">Teachers Only</option>}
                  <option value="specific-course">Specific Course</option>
                </select>
              </div>

              {formData.targetAudience === 'specific-course' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Course *
                  </label>
                  <select
                    value={formData.targetCourse}
                    onChange={(e) => setFormData({...formData, targetCourse: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.name} ({course.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TrendingUp size={16} className="inline mr-2" />
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Valid From
                </label>
                <input
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock size={16} className="inline mr-2" />
                  Expires On *
                </label>
                <input
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 flex items-center justify-center"
              >
                {creating ? (
                  <>
                    <Loader className="animate-spin mr-2" size={20} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Megaphone className="mr-2" size={20} />
                    Create Announcement
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition dark:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <Megaphone className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Announcements Yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Create your first announcement to notify students</p>
          </div>
        ) : (
          announcements.map(announcement => (
            <div key={announcement._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{announcement.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{announcement.message}</p>
                </div>
                <button
                  onClick={() => handleDelete(announcement._id)}
                  disabled={deletingId === announcement._id}
                  className="ml-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
                >
                  {deletingId === announcement._id ? (
                    <Loader className="animate-spin" size={20} />
                  ) : (
                    <Trash2 size={20} />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Users size={16} className="mr-2" />
                  <span>{getTargetAudienceLabel(announcement.targetAudience)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar size={16} className="mr-2" />
                  <span>Expires: {new Date(announcement.validUntil).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <AlertCircle size={16} className="mr-2" />
                  <span>{announcement.readBy?.length || 0} read</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;
