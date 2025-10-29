import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';

const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const [imageError, setImageError] = useState(true); // Default to true (show icon) until image loads
  const [imageLoaded, setImageLoaded] = useState(false);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-12 h-12',
      icon: 24,
      text: 'text-sm',
      logoImg: 'w-12 h-12'
    },
    md: {
      container: 'w-16 h-16 lg:w-20 lg:h-20',
      icon: 32,
      text: 'text-base lg:text-lg',
      logoImg: 'w-16 h-16 lg:w-20 lg:h-20'
    },
    lg: {
      container: 'w-20 h-20 lg:w-24 lg:h-24',
      icon: 48,
      text: 'text-lg lg:text-xl',
      logoImg: 'w-20 h-20 lg:w-24 lg:h-24'
    },
    xl: {
      container: 'w-24 h-24 lg:w-32 lg:h-32',
      icon: 64,
      text: 'text-xl lg:text-2xl',
      logoImg: 'w-24 h-24 lg:w-32 lg:h-32'
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  // Try to load the logo image
  const logoPath = '/logo.png'; // Can also try '/logo.svg'

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Logo Image or Fallback Icon */}
      <div className="flex justify-center mb-2 lg:mb-3">
        {imageLoaded && !imageError ? (
          <img
            src={logoPath}
            alt="Kandara Technical Logo"
            className={`${config.logoImg} object-contain`}
            onLoad={() => {
              setImageLoaded(true);
              setImageError(false);
            }}
            onError={() => {
              setImageError(true);
              setImageLoaded(false);
            }}
          />
        ) : (
          <div className={`bg-gradient-to-br from-blue-500 to-blue-700 ${config.container} rounded-full flex items-center justify-center shadow-lg`}>
            <GraduationCap size={config.icon} className="text-white" />
          </div>
        )}
        {/* Hidden image to test if logo exists */}
        {!imageLoaded && (
          <img
            src={logoPath}
            alt=""
            className="hidden"
            onLoad={() => {
              setImageLoaded(true);
              setImageError(false);
            }}
            onError={() => {
              setImageError(true);
              setImageLoaded(false);
            }}
          />
        )}
      </div>

      {/* School Name */}
      {showText && (
        <div className="text-center">
          <h1 className={`font-bold ${config.text} leading-tight`}>
            Kandara Technical
          </h1>
          <p className="text-xs lg:text-sm opacity-80 mt-1">
            KTVC
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;
