// Notification Service for PWA with Sound Support
class NotificationService {
  constructor() {
    this.permission = Notification.permission;
    this.notificationSound = new Audio('/notification-sound.mp3');
  }

  // Request notification permission
  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === 'granted';
  }

  // Play notification sound
  playSound() {
    try {
      this.notificationSound.currentTime = 0;
      this.notificationSound.play().catch(err => {
        console.log('Could not play notification sound:', err);
      });
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }

  // Show browser notification with sound
  async showNotification(title, options = {}) {
    const hasPermission = await this.requestPermission();
    
    if (!hasPermission) {
      console.log('Notification permission denied');
      return;
    }

    // Play sound
    this.playSound();

    // Default options
    const defaultOptions = {
      icon: '/logo.png',
      badge: '/logo.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      ...options
    };

    // Check if service worker is available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Show notification via service worker (better for PWA)
      const registration = await navigator.serviceWorker.ready;
      return registration.showNotification(title, defaultOptions);
    } else {
      // Fallback to regular notification
      return new Notification(title, defaultOptions);
    }
  }

  // Show notification for new system notification
  async notifyNewNotification(notification) {
    const title = notification.type === 'announcement' 
      ? '📢 New Announcement' 
      : '🔔 New Notification';
    
    const body = notification.message || notification.title;
    
    await this.showNotification(title, {
      body: body.substring(0, 100) + (body.length > 100 ? '...' : ''),
      tag: notification._id,
      data: { 
        url: '/student/notifications',
        notificationId: notification._id 
      }
    });
  }

  // Show notification for new assignment
  async notifyNewAssignment(assignment) {
    await this.showNotification('📚 New Assignment', {
      body: `${assignment.title} - Due: ${new Date(assignment.deadline).toLocaleDateString()}`,
      tag: assignment._id,
      data: { 
        url: '/student/home',
        assignmentId: assignment._id 
      }
    });
  }
}

// Export singleton instance
export default new NotificationService();
