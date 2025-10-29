import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCircle, AlertCircle, Clock, DollarSign, FileText, BookOpen } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/student/notifications');
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

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
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center">
            <Bell className="mr-3 text-blue-600" size={32} />
            Notifications
          </h1>
          <div className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
            {unreadCount} Unread
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
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

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition ${
                getPriorityColor(notification.priority)
              } ${!notification.isRead ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {notification.title}
                      </h3>
                      {notification.sender && (
                        <p className="text-sm text-gray-600">
                          From: {notification.sender.name} ({notification.sender.role})
                        </p>
                      )}
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 mb-3">{notification.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock size={14} className="mr-1" />
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                      notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {notification.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-md">
            <Bell className="mx-auto mb-4 text-gray-300" size={64} />
            <p className="text-xl text-gray-500">No notifications found</p>
            <p className="text-gray-400 mt-2">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
