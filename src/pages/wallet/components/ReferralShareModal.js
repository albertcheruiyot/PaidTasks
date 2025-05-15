// src/pages/wallet/components/ReferralShareModal.js

import React, { useState } from 'react';
import '../ModalStyles.css';

const ReferralShareModal = ({ 
  referralLink, 
  referralCode, 
  activatedReferrals,
  requiredReferrals = 10, // Default to 10 if not specified
  onClose
  // Removed onProceed prop to prevent bypassing the referral requirement
}) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const shareOnWhatsApp = () => {
    const message = `Join me on PaidTasks and earn money by completing simple online tasks! Use my referral link: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };
  
  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
  };
  
  const shareOnTwitter = () => {
    const message = `Join me on PaidTasks and earn money by completing simple online tasks! Use my referral link: ${referralLink}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, '_blank');
  };
  
  // Calculate percentage complete
  const percentage = Math.min(Math.round((activatedReferrals / requiredReferrals) * 100), 100);
  
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content referral-modal">
          <div className="modal-close" onClick={onClose}>×</div>
          
          <div className="modal-icon">👥</div>
          <h2>Almost There!</h2>
          <p>You need {requiredReferrals} activated referrals to withdraw. Share your link to invite more friends!</p>
          
          <div className="referral-progress">
            <div className="progress-text">
              <span>{activatedReferrals}/{requiredReferrals} activated referrals</span>
              <span>{percentage}% complete</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="referrals-needed">
              <span>You need {requiredReferrals - activatedReferrals} more activated referrals</span>
            </div>
          </div>
          
          <div className="referral-link-container">
            <input 
              type="text" 
              readOnly 
              value={referralLink} 
              className="referral-link-input" 
            />
            <button 
              className={`btn ${copied ? 'btn-success' : 'btn-primary'}`} 
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          
          <div className="referral-code">
            <span>Referral Code: </span>
            <strong>{referralCode}</strong>
          </div>
          
          <div className="share-buttons">
            <button 
              className="btn share-btn whatsapp-btn" 
              onClick={shareOnWhatsApp}
            >
              <span className="share-icon">💬</span>
              WhatsApp
            </button>
            <button 
              className="btn share-btn facebook-btn" 
              onClick={shareOnFacebook}
            >
              <span className="share-icon">📱</span>
              Facebook
            </button>
            <button 
              className="btn share-btn twitter-btn" 
              onClick={shareOnTwitter}
            >
              <span className="share-icon">🐦</span>
              Twitter
            </button>
          </div>
          
          <div className="referral-tips">
            <h4>Tips to get more referrals:</h4>
            <ul>
              <li>Share your link on social media and WhatsApp groups</li>
              <li>Tell friends about the tasks and earnings</li>
              <li>Remind referrals to complete their first task</li>
            </ul>
          </div>
          
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            {/* Removed the "Continue Anyway" button to enforce referral requirement */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralShareModal;