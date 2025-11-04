import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={24} className="text-green-600" />,
    error: <XCircle size={24} className="text-red-600" />,
    warning: <AlertCircle size={24} className="text-yellow-600" />,
    info: <Info size={24} className="text-blue-600" />
  };

  const colors = {
    success: 'bg-green-50 border-green-500',
    error: 'bg-red-50 border-red-500',
    warning: 'bg-yellow-50 border-yellow-500',
    info: 'bg-blue-50 border-blue-500'
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 animate-slide-in-right`}>
      <div className={`${colors[type]} border-l-4 rounded-lg shadow-lg p-4 flex items-start max-w-md`}>
        <div className="flex-shrink-0 mr-3">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className={`${textColors[type]} font-medium`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
