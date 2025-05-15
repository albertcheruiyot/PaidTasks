// src/components/layout/PwaInstallModal.js

import React from 'react';
import './PwaInstallModal.css';

const PwaInstallModal = ({ onClose }) => {
  // Detect the user's device
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);
  
  return (
    <div className="modal-overlay">
      <div className="modal-container pwa-modal">
        <div className="modal-content">
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
          
          <div className="modal-header">
            <div className="pwa-icon">📱</div>
            <h2>Install PaidTasks App</h2>
            <p>Get the best experience by installing our app on your device.</p>
          </div>
          
          <div className="installation-instructions">
            {isIOS && (
              <div className="device-instructions">
                <h3>Install on iOS:</h3>
                <ol>
                  <li>Tap the <strong>Share</strong> button <span className="ios-share-icon">􀈂</span> at the bottom of the screen</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                  <li>Tap <strong>"Add"</strong> in the top right corner</li>
                </ol>
                <div className="instruction-image ios-image"></div>
              </div>
            )}
            
            {isAndroid && (
              <div className="device-instructions">
                <h3>Install on Android:</h3>
                <ol>
                  <li>Tap the menu button <span className="android-menu-icon">⋮</span> in the top right</li>
                  <li>Tap <strong>"Add to Home screen"</strong></li>
                  <li>Tap <strong>"Add"</strong> on the popup</li>
                </ol>
                <div className="instruction-image android-image"></div>
              </div>
            )}
            
            {!isIOS && !isAndroid && (
              <div className="device-instructions">
                <h3>Install on your device:</h3>
                <ol>
                  <li>On Chrome, click the menu button <span className="chrome-menu-icon">⋮</span> in the top right</li>
                  <li>Select <strong>"Install PaidTasks..."</strong> or <strong>"Install app..."</strong></li>
                  <li>Follow the on-screen instructions</li>
                </ol>
                <div className="instruction-image desktop-image"></div>
              </div>
            )}
          </div>
          
          <div className="pwa-benefits">
            <h3>Benefits of the App:</h3>
            <ul>
              <li>Faster loading times</li>
              <li>Works offline</li>
              <li>Looks and feels like a native app</li>
              <li>Task notifications</li>
              <li>No App Store download needed!</li>
            </ul>
          </div>
          
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={onClose}>Got it!</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PwaInstallModal;