import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import networkService from '../../services/networkService';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(networkService.checkConnection());
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const unsubscribe = networkService.subscribe((status) => {
      const online = status === 'online';
      setIsOnline(online);
      setShowBanner(true);

      // Auto-hide banner after 5 seconds if online
      if (online) {
        setTimeout(() => setShowBanner(false), 5000);
      }
    });

    return () => unsubscribe();
  }, []);

  // Don't show banner if online and not transitioning
  if (isOnline && !showBanner) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-white font-medium transition-transform duration-300 ${
        showBanner ? 'translate-y-0' : '-translate-y-full'
      } ${isOnline ? 'bg-green-600' : 'bg-red-600'}`}
    >
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <Wifi size={20} />
            <span>Back Online - Connection Restored</span>
          </>
        ) : (
          <>
            <WifiOff size={20} />
            <span>No Internet Connection - Please check your network</span>
          </>
        )}
      </div>
    </div>
  );
};

export default NetworkStatus;
