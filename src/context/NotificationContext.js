// src/context/NotificationContext.js

import React, { createContext, useState, useContext } from 'react';
import Notification from '../components/common/Notification';

// Create context
export const NotificationContext = createContext();

// Generate unique IDs for notifications
let notificationId = 0;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add a notification
  const addNotification = ({ type, message, duration = 5000 }) => {
    const id = notificationId++;
    
    setNotifications(prev => [
      ...prev,
      { id, type, message, duration }
    ]);
    
    return id;
  };

  // Remove a notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Helper methods for specific notification types
  const showSuccess = (message, duration) => {
    return addNotification({ type: 'success', message, duration });
  };

  const showError = (message, duration) => {
    return addNotification({ type: 'error', message, duration });
  };

  const showInfo = (message, duration) => {
    return addNotification({ type: 'info', message, duration });
  };

  const showWarning = (message, duration) => {
    return addNotification({ type: 'warning', message, duration });
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications,
        addNotification,
        removeNotification,
        showSuccess,
        showError,
        showInfo,
        showWarning
      }}
    >
      {children}
      <div className="notification-container">
        {notifications.map(({ id, type, message, duration }) => (
          <Notification
            key={id}
            type={type}
            message={message}
            duration={duration}
            onClose={() => removeNotification(id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Custom hook for easy access to notification context
export const useNotification = () => {
  return useContext(NotificationContext);
};