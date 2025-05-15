// src/pages/wallet/components/AccountActivationModal.js

import React from 'react';
import '../ModalStyles.css';

const AccountActivationModal = ({ onActivate, onClose, loading }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content activation-modal">
          <div className="modal-icon">🚀</div>
          <h2>Activate Your Account</h2>
          <p>You need to activate your account before making withdrawals. This is a one-time process.</p>
          
          <div className="activation-benefits">
            <div className="benefit-item">
              <span className="benefit-icon">✅</span>
              <span className="benefit-text">Unlock withdrawal feature</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💰</span>
              <span className="benefit-text">Earn from referrals</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🔒</span>
              <span className="benefit-text">Secure your earnings</span>
            </div>
          </div>
          
          <div className="modal-actions">
            <button 
              className="btn btn-primary btn-activation" 
              onClick={onActivate}
              disabled={loading}
            >
              {loading ? 'Activating...' : 'Activate Now'}
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountActivationModal;