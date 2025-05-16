// First, I'll create a new component for the confirmation dialog
// src/components/layout/ConfirmationDialog.js

import React from 'react';
import '../common/Notification.css';

const ConfirmationDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <h2>Confirm Action</h2>
          <p>{message}</p>
          <div className="modal-actions">
            <button 
              className="btn btn-secondary" 
              onClick={onCancel}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={onConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;