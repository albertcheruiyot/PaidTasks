// src/components/common/AppLogo.js

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * App logo component
 * @param {Object} props
 * @param {String} props.size - Size variant ('small', 'medium', 'large')
 * @param {Boolean} props.linkToHome - Whether to wrap logo in Link to home
 */
const AppLogo = ({ size = 'medium', linkToHome = true }) => {
  // Determine logo size based on prop
  const getSizeClass = () => {
    switch(size) {
      case 'small':
        return { 
          container: 'text-xl',
          icon: 'text-2xl mr-1'
        };
      case 'large':
        return { 
          container: 'text-3xl',
          icon: 'text-4xl mr-2'
        };
      case 'medium':
      default:
        return { 
          container: 'text-2xl',
          icon: 'text-3xl mr-2'
        };
    }
  };
  
  const sizeClass = getSizeClass();
  
  const LogoContent = () => (
    <div className={`flex items-center font-bold ${sizeClass.container}`}>
      <span className={`${sizeClass.icon}`}>💸</span>
      <span>PaidTasks</span>
    </div>
  );
  
  if (linkToHome) {
    return (
      <Link to="/" className="text-inherit no-underline">
        <LogoContent />
      </Link>
    );
  }
  
  return <LogoContent />;
};

export default AppLogo;