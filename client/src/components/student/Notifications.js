import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../services/axios';
import { Bell, CheckCircle, AlertCircle, Clock, DollarSign, FileText, BookOpen, Megaphone, Calendar, X, ExternalLink } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axios.get('/api/student/notifications');
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await axios.get('/api/student/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchAnnouncements();
  }, [fetchNotifications, fetchAnnouncements]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/student/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    // Open modal
    setSelectedNotification(notification);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedNotification(null), 300);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'exam':
        return <BookOpen className="text-blue-600" size={24} />;
      case 'fee':
        return <DollarSign className="text-green-600" size={24} />;
      case 'assignment':
        return <FileText className="text-orange-600" size={24} />;
      case 'performance':
        return <AlertCircle className="text-purple-600" size={24} />;
      case 'gatepass':
        return <CheckCircle className="text-indigo-600" size={24} />;
      default:
        return <Bell className="text-gray-600" size={24} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      case 'low':
        return 'border-l-4 border-green-500';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  const getAnnouncementPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    };
    return colors[priority] || colors.medium;
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white flex items-center">
            <Bell className="mr-2 sm:mr-3 text-blue-600" size={28} />
            Notifications
          </h1>
          <div className="bg-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold text-sm sm:text-base">
            {unreadCount} Unread
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {['all', 'exam', 'fee', 'assignment', 'performance', 'gatepass', 'general'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <Megaphone className="mr-2 text-blue-500" size={24} />
            Announcements
          </h2>
          <div className="space-y-3">
            {announcements.map(announcement => (
              <div
                key={announcement._id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow hover:shadow-lg transition border-l-4 border-blue-500"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-800 dark:text-white">{announcement.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getAnnouncementPriorityBadge(announcement.priority)}`}>
                    {announcement.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 whitespace-pre-wrap">{announcement.message}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    Expires: {new Date(announcement.validUntil).toLocaleDateString()}
                  </div>
                  {announcement.createdBy && (
                    <span>
                      By: {announcement.createdBy.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          <>
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition cursor-pointer ${
                  getPriorityColor(notification.priority)
                } ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3 sm:mr-4">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white truncate">
                          {notification.title}
                        </h3>
                        {notification.sender && (
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                            From: {notification.sender.name} ({notification.sender.role})
                          </p>
                        )}
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">{notification.message}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock size={14} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{new Date(notification.createdAt).toLocaleString()}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 sm:px-3 py-1 rounded-full whitespace-nowrap ${
                          notification.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {notification.priority.toUpperCase()}
                        </span>
                        <ExternalLink size={16} className="text-blue-500 flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-md">
            <Bell className="mx-auto mb-4 text-gray-300" size={64} />
            <p className="text-xl text-gray-500">No notifications found</p>
            <p className="text-gray-400 mt-2">You're all caught up!</p>
          </div>
        )}
      </div>

      {/* Notification Modal */}
      {showModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 sm:p-6 flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(selectedNotification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    {selectedNotification.title}
                  </h2>
                  {selectedNotification.sender && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      From: {selectedNotification.sender.name} ({selectedNotification.sender.role})
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={closeModal}
                className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6">
              <div className="mb-4">
                <span className={`inline-block text-xs px-3 py-1 rounded-full ${
                  selectedNotification.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                  selectedNotification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                  'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                }`}>
                  {selectedNotification.priority.toUpperCase()} PRIORITY
                </span>
              </div>
              
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Clock size={16} className="mr-2" />
                  {new Date(selectedNotification.createdAt).toLocaleString()}
                </div>
                <div className="flex items-center">
                  {selectedNotification.isRead ? (
                    <span className="text-green-600 dark:text-green-400 flex items-center">
                      <CheckCircle size={16} className="mr-1" />
                      Read
                    </span>
                  ) : (
                    <span className="text-blue-600 dark:text-blue-400">Unread</span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t dark:border-gray-700 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={closeModal}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 sm:py-3 rounded-lg font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
