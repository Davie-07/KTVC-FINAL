// Network Connectivity Service
class NetworkService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = [];
    
    // Listen to online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  handleOnline() {
    this.isOnline = true;
    this.notifyListeners('online');
  }

  handleOffline() {
    this.isOnline = false;
    this.notifyListeners('offline');
  }

  // Check if online
  checkConnection() {
    return this.isOnline;
  }

  // Subscribe to network changes
  subscribe(callback) {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners
  notifyListeners(status) {
    this.listeners.forEach(callback => callback(status));
  }

  // Check if backend is reachable
  async checkBackendConnection(url = '/api/student/dashboard') {
    if (!this.isOnline) {
      return false;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

const networkService = new NetworkService();
export default networkService;
