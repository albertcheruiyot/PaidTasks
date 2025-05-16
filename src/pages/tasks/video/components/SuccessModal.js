// src/pages/tasks/video/components/SuccessModal.js

import React from 'react';
import './SuccessModal.css';

const SuccessModal = ({ amount, onClose }) => {
  return (
    <div className="success-modal-overlay">
      <div className="success-modal-content">
        <div className="success-icon">✓</div>
        <h2>Video Completed!</h2>
        <div className="reward-animation">
          <span className="reward-text">+KSh {amount}</span>
        </div>
        <p>Your reward has been added to your balance</p>
        
        <button className="btn-success-close" onClick={onClose}>
          Continue
        </button>
      </div>
      
      <div className="floating-coins">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i} 
            className="floating-coin"
            style={{
              left: `${Math.random() * 90}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 2 + 2}s`
            }}
          >
            {['💰', '💵', '💸', '🪙'][Math.floor(Math.random() * 4)]}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuccessModal;