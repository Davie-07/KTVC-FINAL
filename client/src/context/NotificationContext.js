import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../services/axios';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const updatePWABadge = (count) => {
    // Update PWA badge on mobile devices
    if ('navigator' in window && 'setAppBadge' in navigator) {
      if (count > 0) {
        navigator.setAppBadge(count).catch(err => console.log('Badge API not supported:', err));
      } else {
        navigator.clearAppBadge().catch(err => console.log('Badge API not supported:', err));
      }
    }
    
    // Send message to service worker for additional badge support
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'UPDATE_BADGE',
        count: count
      });
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      let endpoint = '';
      
      switch (user.role) {
        case 'student':
          endpoint = '/api/student/notifications/unread-count';
          break;
        case 'teacher':
          endpoint = '/api/teacher/notifications/unread-count';
          break;
        case 'admin':
          endpoint = '/api/admin/notifications/unread-count';
          break;
        default:
          return;
      }
      
      const response = await axios.get(endpoint);
      const count = response.data.count || 0;
      setUnreadCount(count);
      updatePWABadge(count); // Update PWA badge
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
      updatePWABadge(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Refresh count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const refreshCount = () => {
    fetchUnreadCount();
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshCount, loading }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
