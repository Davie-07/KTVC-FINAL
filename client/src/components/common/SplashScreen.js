import React, { useState, useEffect } from 'react';
import { Loader2, WifiOff } from 'lucide-react';
import Logo from './Logo';
import networkService from '../../services/networkService';

const SplashScreen = ({ onComplete }) => {
  const [isOnline, setIsOnline] = useState(networkService.checkConnection());
  const [checkingNetwork, setCheckingNetwork] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading with progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Check network connectivity
    const checkNetwork = async () => {
      const online = networkService.checkConnection();
      setIsOnline(online);
      setCheckingNetwork(false);

      if (online && onComplete) {
        // Wait for progress to complete
        setTimeout(() => {
          if (progress >= 100) {
            onComplete();
          }
        }, 2000);
      }
    };

    setTimeout(checkNetwork, 1500);

    return () => clearInterval(progressInterval);
  }, [onComplete, progress]);

  const handleRetry = () => {
    setCheckingNetwork(true);
    setProgress(0);
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex flex-col items-center justify-center z-50">
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1">
        {/* Logo */}
        <div className="mb-8 animate-pulse">
          <Logo size="xl" showText={true} className="text-white" />
        </div>

        {/* Loading or Error State */}
        {checkingNetwork ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
            <p className="text-white text-lg font-medium">Checking network...</p>
            {/* Progress Bar */}
            <div className="w-64 h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : isOnline ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
            <p className="text-white text-lg font-medium">Loading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <WifiOff className="w-16 h-16 text-red-300 animate-bounce" />
            <p className="text-white text-xl font-bold">No Internet Connection</p>
            <p className="text-blue-200 text-sm">Please check your network and try again</p>
            <button
              onClick={handleRetry}
              className="mt-4 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>

      {/* DeeDev Signature at Bottom */}
      <div className="pb-8 text-center">
        <p className="text-white/80 text-sm font-medium tracking-wide">
          Developed by{' '}
          <span className="font-bold text-white">DeeDev Astro Labs</span>
        </p>
        <div className="mt-2 flex items-center justify-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
