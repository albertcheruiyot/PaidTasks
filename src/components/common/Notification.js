// src/components/common/Notification.js

import React, { useState, useEffect } from 'react';
import './Notification.css';

/**
 * Notification component for displaying alerts and messages
 * @param {Object} props
 * @param {String} props.type - Notification type ('success', 'error', 'info', 'warning')
 * @param {String} props.message - Message to display
 * @param {Number} props.duration - Time in ms before notification auto-dismisses (0 = never)
 * @param {Function} props.onClose - Function to call when notification is closed
 * @param {Boolean} props.show - Whether to show the notification
 */
const Notification = ({ 
  type = 'info',
  message = '',
  duration = 5000,
  onClose = () => {},
  show = true
}) => {
  const [visible, setVisible] = useState(show);
  
  // Close notification
  const handleClose = () => {
    setVisible(false);
    onClose();
  };
  
  // Auto-close after duration
  useEffect(() => {
    setVisible(show);
    
    let timer;
    if (show && duration > 0) {
      timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, duration);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [show, duration, onClose]);
  
  // If not visible, don't render anything
  if (!visible) return null;
  
  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };
  
  return (
    <div className={`notification notification-${type} ${visible ? 'notification-show' : ''}`}>
      <div className="notification-icon">{getIcon()}</div>
      <div className="notification-content">{message}</div>
      <button className="notification-close" onClick={handleClose}>✕</button>
    </div>
  );
};

export default Notification;