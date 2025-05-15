// src/components/GlobalNotification.js

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Notification.css';

/**
 * Global notification component that displays messages from the auth context
 */
const GlobalNotification = () => {
  const { notification } = useAuth();
  
  // Classes based on notification type
  const getNotificationClass = () => {
    if (!notification) return '';
    
    switch (notification.type) {
      case 'success':
        return 'notification-success';
      case 'error':
        return 'notification-error';
      case 'warning':
        return 'notification-warning';
      case 'info':
      default:
        return 'notification-info';
    }
  };
  
  // Icon based on notification type
  const getIcon = () => {
    if (!notification) return '';
    
    switch (notification.type) {
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
  
  return notification ? (
    <div className={`notification notification-show ${getNotificationClass()}`}>
      <div className="notification-icon">{getIcon()}</div>
      <div className="notification-content">{notification.message}</div>
    </div>
  ) : null;
};

export default GlobalNotification;