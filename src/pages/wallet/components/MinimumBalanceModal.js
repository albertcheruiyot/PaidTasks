// src/pages/wallet/components/MinimumBalanceModal.js

import React from 'react';
import '../ModalStyles.css';

const MinimumBalanceModal = ({ currentBalance, minAmount, onClose }) => {
  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', { 
      style: 'currency', 
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate how much more is needed
  const amountNeeded = minAmount - currentBalance;
  const percentComplete = Math.min(Math.round((currentBalance / minAmount) * 100), 100);
  
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content balance-modal">
          <div className="modal-close" onClick={onClose}>×</div>
          
          <div className="modal-icon">💵</div>
          <h2>One More Step!</h2>
          <p>
            To make a withdrawal, you need a minimum balance of {formatCurrency(minAmount)}.
            You're getting closer!
          </p>
          
          <div className="balance-progress">
            <div className="progress-text">
              <span>Current balance: {formatCurrency(currentBalance)}</span>
              <span>{percentComplete}% complete</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${percentComplete}%` }}
              ></div>
            </div>
            <div className="amount-needed">
              <span>You need {formatCurrency(amountNeeded)} more</span>
            </div>
          </div>
          
          <div className="earning-options">
            <h3>Ways to earn more:</h3>
            <div className="earning-option">
              <div className="earning-icon">🎬</div>
              <div className="earning-details">
                <h4>Watch Videos</h4>
                <p>Earn KSh 10-50 per video</p>
              </div>
              <a href="/tasks/videos" className="btn btn-sm btn-secondary">Go</a>
            </div>
            
            <div className="earning-option">
              <div className="earning-icon">📝</div>
              <div className="earning-details">
                <h4>Complete Surveys</h4>
                <p>Earn KSh 50-200 per survey</p>
              </div>
              <a href="/tasks/surveys" className="btn btn-sm btn-secondary">Go</a>
            </div>
            
            <div className="earning-option">
              <div className="earning-icon">👥</div>
              <div className="earning-details">
                <h4>Refer More Friends</h4>
                <p>Earn KSh 200 per activated referral</p>
              </div>
              <a href="/referrals" className="btn btn-sm btn-secondary">Go</a>
            </div>
          </div>
          
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            {/* Removed the "Continue Anyway" button to enforce minimum balance requirement */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimumBalanceModal;