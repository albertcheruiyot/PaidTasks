// src/pages/wallet/components/AccountActivationModal.js

import React, { useEffect, useState, useRef } from 'react';
import '../ModalStyles.css';
import 'intasend-inlinejs-sdk';

const AccountActivationModal = ({ onActivate, onClose, loading }) => {
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const paymentButtonRef = useRef(null);

  // Create a function to handle button click and set loading state immediately
  const handlePaymentButtonClick = () => {
    setPaymentProcessing(true);
    // The actual payment processing will happen through IntaSend
    // when the button is clicked due to the intaSendPayButton class
  };

  // Initialize IntaSend payment when component mounts
  useEffect(() => {
    // Initialize the IntaSend payment
    if (!paymentInitialized && !loading) {
      try {
        const intaSend = new window.IntaSend({
          // Your live production API key from IntaSend dashboard
          publicAPIKey: "YOUR_LIVE_PUBLIC_KEY", 
          live: true // Using live production environment
        });

        // Handle payment events
        intaSend
          .on("COMPLETE", (results) => {
            console.log("Payment successful:", results);
            // Store transaction ID for reference
            if (results && results.tracking_id) {
              setTransactionId(results.tracking_id);
            }
            // Keep payment processing true until activation completes
            // onActivate will set loading to true, which signals the main process
            onActivate(results);
          })
          .on("FAILED", (results) => {
            console.error("Payment failed:", results);
            setPaymentProcessing(false);
            setPaymentError("Payment failed: " + (results.message || "Please try again"));
          })
          .on("IN-PROGRESS", (results) => {
            console.log("Payment in progress:", results);
            setPaymentProcessing(true);
            setPaymentError(null);
          });

        setPaymentInitialized(true);
      } catch (error) {
        console.error("Error initializing IntaSend:", error);
        setPaymentError("Could not initialize payment system. Please try again later.");
      }
    }
  }, [paymentInitialized, loading, onActivate]);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className={`modal-content activation-modal ${paymentProcessing ? 'is-processing' : ''}`}>
          <div className="modal-icon">🚀</div>
          <h2>Activate Your Freelance Merchant Account</h2>
          <p>You need to activate your freelance merchant account before making withdrawals. This requires a one-time activation fee of 300 KES.</p>
          
          <div className="activation-benefits">
            <div className="benefit-item">
              <span className="benefit-icon">✅</span>
              <span className="benefit-text">Unlock withdrawal features</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💰</span>
              <span className="benefit-text">Earn commissions from referrals</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🔒</span>
              <span className="benefit-text">Access freelance merchant benefits</span>
            </div>
          </div>
          
          {paymentError && (
            <div className="error-message">
              <div className="error-icon">⚠</div>
              <div className="error-content">{paymentError}</div>
            </div>
          )}
          
          {transactionId && (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <div className="success-content">
                <h4>Payment Successful!</h4>
                <p>Transaction ID: {transactionId}</p>
              </div>
            </div>
          )}
          
          <div className="modal-actions">
            {/* IntaSend Payment Button */}
            <button 
              ref={paymentButtonRef}
              className="btn btn-primary btn-activation intaSendPayButton" 
              data-amount="300" 
              data-currency="KES"
              data-api_ref="account_activation"
              onClick={handlePaymentButtonClick}
              disabled={loading || paymentProcessing || transactionId}
            >
              {paymentProcessing ? (
                <>
                  <span className="spinner-sm"></span>
                  Processing Payment...
                </>
              ) : transactionId ? (
                'Activating Merchant Account...'
              ) : (
                'Pay 300 KES & Activate Merchant Account'
              )}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={paymentProcessing}
            >
              Cancel
            </button>
          </div>
          
          {/* IntaSend Trust Badge */}
          <div className="intasend-trust-badge">
            <a 
              href="https://intasend.com/security" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <img 
                src="https://intasend-prod-static.s3.amazonaws.com/img/trust-badges/intasend-trust-badge-with-mpesa-hr-light.png" 
                alt="IntaSend Secure Payments (PCI-DSS Compliant)" 
              />
            </a>
            <a 
              className="intasend-security-link" 
              href="https://intasend.com/security" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Secured by IntaSend Payments
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountActivationModal;