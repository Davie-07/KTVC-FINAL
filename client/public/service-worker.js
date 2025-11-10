// Service Worker for PWA with Badge API Support
const CACHE_NAME = 'ktvc-portal-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/bundle.js',
  '/logo.png'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Handle messages from client (for badge updates)
self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'UPDATE_BADGE') {
    const count = event.data.count;
    
    // Update app badge (Safari iOS 15+, Android Chrome)
    if ('setAppBadge' in navigator) {
      try {
        if (count > 0) {
          await navigator.setAppBadge(count);
        } else {
          await navigator.clearAppBadge();
        }
      } catch (error) {
        console.log('Badge API not supported or permission denied:', error);
      }
    }
    
    // Alternative: Update notification badge for older browsers (only if permission granted)
    if (count > 0 && 'showNotification' in self.registration) {
      try {
        // Check notification permission before attempting to show
        const permission = await self.registration.permissions?.query({ name: 'notifications' });
        if (permission?.state === 'granted' || Notification.permission === 'granted') {
          await self.registration.showNotification('KTVC Portal', {
            body: `You have ${count} unread notification${count > 1 ? 's' : ''}`,
            badge: '/logo.png',
            icon: '/logo.png',
            tag: 'notification-badge',
            data: { count },
            silent: true
          });
        }
      } catch (error) {
        // Silently fail if permission not granted or notifications not supported
        console.log('Notification permission not granted:', error);
      }
    }
  }
});

// Push notification support
self.addEventListener('push', async (event) => {
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/logo.png',
      badge: '/logo.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    // Check permission before showing notification
    if (Notification.permission === 'granted') {
      event.waitUntil(
        self.registration.showNotification(data.title, options)
      );
    }
  } catch (error) {
    console.log('Push notification error:', error);
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
