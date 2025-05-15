// src/components/common/Loader.js

import React from 'react';
import './Loader.css';

/**
 * Loader component for displaying loading state
 * @param {Object} props
 * @param {String} props.size - Size of the loader ('small', 'medium', 'large')
 * @param {String} props.color - Color of the loader
 * @param {String} props.text - Text to display below the loader
 * @param {Boolean} props.fullScreen - Whether to show the loader in full screen mode
 */
const Loader = ({ 
  size = 'medium', 
  color = 'primary', 
  text = 'Loading...', 
  fullScreen = false 
}) => {
  const sizeClass = `loader-${size}`;
  const colorClass = `loader-${color}`;
  
  const loader = (
    <div className="loader-container">
      <div className={`loader ${sizeClass} ${colorClass}`}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        {loader}
      </div>
    );
  }
  
  return loader;
};

export default Loader;