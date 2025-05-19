// src/pages/wallet/components/AccountActivationModal.js

import React, { useEffect, useState, useRef } from 'react';
import { 
  doc, 
  getDoc, 
  onSnapshot, 
  updateDoc, 
  setDoc, 
  deleteDoc,
  serverTimestamp, 
  increment 
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../context/AuthContext';
import '../ModalStyles.css';
import 'intasend-inlinejs-sdk';

// IntaSend LIVE Public Key - Store in a config file or environment variable in production
const INTASEND_PUBLIC_KEY = "ISPubKey_live_d4a72af2-73d6-40c2-92e8-083cf04c87c6";

const AccountActivationModal = ({ onClose, loading }) => {
  const { currentUser, refreshUserData, showNotification } = useAuth();
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [activationComplete, setActivationComplete] = useState(false);
  
  // Refs to track timeouts for cleanup
  const activationTimeoutRef = useRef(null);
  const abandonmentTimeoutRef = useRef(null);
  
  // Handle payment button click
  const handlePaymentButtonClick = () => {
    setPaymentProcessing(true);
  };

  // Record pending activation to help with webhook identification
  const recordPendingActivation = async (transactionId) => {
    try {
      console.log(`Recording pending activation for transaction ${transactionId}`);
      
      // Create a document in pending_activations collection to track this transaction
      const pendingRef = doc(db, 'pending_activations', transactionId);
      await setDoc(pendingRef, {
        userId: currentUser.uid,
        transactionId: transactionId,
        timestamp: serverTimestamp(),
        status: 'pending',
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
      });
      
      console.log(`Recorded pending activation for transaction ${transactionId}`);
    } catch (error) {
      console.error("Failed to record pending activation:", error);
    }
  };

  // Cleanup pending activation record
  const cleanupPendingActivation = async (transactionId) => {
    try {
      console.log(`Cleaning up pending activation for transaction ${transactionId}`);
      
      // Delete the pending activation record
      const pendingRef = doc(db, 'pending_activations', transactionId);
      const pendingDoc = await getDoc(pendingRef);
      
      if (pendingDoc.exists()) {
        await deleteDoc(pendingRef);
        console.log(`Cleaned up pending activation for transaction ${transactionId}`);
      }
    } catch (error) {
      console.error("Error cleaning up pending activation:", error);
    }
  };

  // Listen for activation status changes
  useEffect(() => {
    let unsubscribe = null;
    
    if (transactionId && !activationComplete) {
      console.log("Setting up Firestore listener for activation status");
      
      const userDocRef = doc(db, 'users', currentUser.uid);
      unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          if (userData.isAccountActivated) {
            console.log("Account activation detected in Firestore");
            setActivationComplete(true);
            
            // Cleanup pending activation and timeouts
            cleanupPendingActivation(transactionId);
            if (activationTimeoutRef.current) {
              clearTimeout(activationTimeoutRef.current);
            }
            
            refreshUserData();
            showNotification({
              type: 'success',
              message: 'Your account has been activated successfully!'
            });
            
            // Close modal after a short delay
            setTimeout(() => {
              onClose();
            }, 2000);
          }
        }
      }, (error) => {
        console.error('Error monitoring activation status:', error);
      });
    }
    
    // Clean up listener when component unmounts or activation completes
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [transactionId, activationComplete, currentUser, onClose, refreshUserData, showNotification]);

  // Set up timeout for abandoned payments
  useEffect(() => {
    // Clear any existing timeout
    if (abandonmentTimeoutRef.current) {
      clearTimeout(abandonmentTimeoutRef.current);
    }
    
    if (paymentProcessing && !transactionId) {
      // Set a 5-minute timeout for abandoned payments
      abandonmentTimeoutRef.current = setTimeout(() => {
        if (paymentProcessing && !transactionId) {
          setPaymentProcessing(false);
          setPaymentError("Payment process timed out. Please try again.");
          showNotification({
            type: 'warning',
            message: "Payment process timed out. Please try again."
          });
        }
      }, 5 * 60 * 1000); // 5 minutes
    }
    
    return () => {
      if (abandonmentTimeoutRef.current) {
        clearTimeout(abandonmentTimeoutRef.current);
      }
    };
  }, [paymentProcessing, transactionId, showNotification]);

  // Initialize IntaSend payment
  useEffect(() => {
    if (!paymentInitialized && !loading) {
      try {
        console.log("Initializing IntaSend with LIVE mode");
        const intaSend = new window.IntaSend({
          publicAPIKey: INTASEND_PUBLIC_KEY,
          live: true
        });

        // Handle payment events
        intaSend
          .on("COMPLETE", (results) => {
            console.log("Payment successful:", results);
            
            // Clear the abandonment timeout
            if (abandonmentTimeoutRef.current) {
              clearTimeout(abandonmentTimeoutRef.current);
            }
            
            // Store transaction ID and record pending activation
            if (results && results.tracking_id) {
              setTransactionId(results.tracking_id);
              recordPendingActivation(results.tracking_id);
              
              // Set up a fallback manual activation that runs if webhook doesn't activate in 30 seconds
              activationTimeoutRef.current = setTimeout(async () => {
                if (!activationComplete) {
                  // Check if account is still not activated
                  const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                  if (userDoc.exists() && !userDoc.data().isAccountActivated) {
                    console.log("Webhook activation failed - attempting manual activation");
                    manuallyActivateAccount(results.tracking_id);
                  }
                }
              }, 30000); // 30 seconds
            }
            
            showNotification({
              type: 'success',
              message: 'Payment successful! Account activation in progress...'
            });
          })
          .on("FAILED", (results) => {
            console.error("Payment failed:", results);
            setPaymentProcessing(false);
            
            // Clear the abandonment timeout
            if (abandonmentTimeoutRef.current) {
              clearTimeout(abandonmentTimeoutRef.current);
            }
            
            // Add detailed error handling
            let errorMessage = "Payment failed. Please try again.";
            
            if (results && results.message) {
              errorMessage = `Payment failed: ${results.message}`;
            }
            
            if (results && results.tracking_id) {
              // Clean up any pending activation records for this failed payment
              cleanupPendingActivation(results.tracking_id);
              
              // Log failed payment for analysis
              const failedPaymentsRef = doc(db, 'failed_payments', results.tracking_id);
              setDoc(failedPaymentsRef, {
                paymentData: results,
                timestamp: serverTimestamp(),
                userId: currentUser.uid,
                frontendError: true
              }).catch(err => console.error("Error logging failed payment:", err));
            }
            
            setPaymentError(errorMessage);
            
            showNotification({
              type: 'error',
              message: errorMessage
            });
          })
          .on("CANCELLED", (results) => {
            console.log("Payment cancelled:", results);
            setPaymentProcessing(false);
            
            // Clear the abandonment timeout
            if (abandonmentTimeoutRef.current) {
              clearTimeout(abandonmentTimeoutRef.current);
            }
            
            if (results && results.tracking_id) {
              cleanupPendingActivation(results.tracking_id);
            }
            
            setPaymentError("Payment was cancelled. Please try again if you wish to activate your account.");
            
            showNotification({
              type: 'warning',
              message: "Payment was cancelled."
            });
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
  }, [paymentInitialized, loading, showNotification, activationComplete, currentUser]);

  // Manual account activation function (fallback)
  const manuallyActivateAccount = async (paymentId) => {
    try {
      console.log(`Manually activating account for user ${currentUser.uid} with payment ${paymentId}`);
      
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Update user document to activate account
      await updateDoc(userRef, {
        isAccountActivated: true,
        accountActivatedAt: serverTimestamp(),
        activationPayment: {
          paymentId: paymentId,
          paymentAmount: 300,
          paymentMethod: "M-PESA",
          paymentStatus: "completed",
          paymentTimestamp: serverTimestamp(),
        }
      });
      
      // Add transaction record
      const transactionRef = doc(db, `users/${currentUser.uid}/transactions`, paymentId);
      await setDoc(transactionRef, {
        type: "account_activation",
        amount: 300,
        timestamp: serverTimestamp(),
        status: "completed",
        method: "M-PESA",
        description: "Freelance merchant account activation payment",
      });
      
      console.log("Manual activation successful");
      
      // Check if user was referred and process referral reward
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.referredBy) {
          processReferralReward(userData.referredBy, currentUser.uid, userData.displayName);
        }
      }
      
      // Clean up pending activation
      await cleanupPendingActivation(paymentId);
      
      // Manually update state to show success
      setActivationComplete(true);
      refreshUserData();
      
      showNotification({
        type: 'success',
        message: 'Your account has been activated successfully!'
      });
      
      // Close modal after successful activation
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Manual activation failed:", error);
      showNotification({
        type: 'error',
        message: 'Activation error. Please contact support with transaction ID: ' + paymentId
      });
    }
  };
  
  // Process referral reward
  const processReferralReward = async (referrerId, userId, displayName) => {
    try {
      console.log(`Processing referral reward for referrer ${referrerId}`);
      
      const REFERRAL_REWARD = 200; // KSh
      const referrerRef = doc(db, 'users', referrerId);
      
      // Update referrer's stats and balance
      await updateDoc(referrerRef, {
        'referralStats.activatedReferrals': increment(1),
        availableBalance: increment(REFERRAL_REWARD),
        totalEarnings: increment(REFERRAL_REWARD),
      });
      
      // Update referral record
      const referralRef = doc(db, `users/${referrerId}/referrals`, userId);
      await updateDoc(referralRef, {
        activated: true,
        activatedAt: serverTimestamp(),
        reward: REFERRAL_REWARD,
      });
      
      // Create reward transaction record
      const rewardTransactionId = `ref_reward_${userId}`;
      const rewardTransactionRef = doc(db, `users/${referrerId}/transactions`, rewardTransactionId);
      
      await setDoc(rewardTransactionRef, {
        type: "referral_reward",
        amount: REFERRAL_REWARD,
        timestamp: serverTimestamp(),
        description: `Referral reward for ${displayName || "a user"}`,
        status: "completed",
        referredUserId: userId,
      });
      
      console.log("Referral reward processed successfully");
    } catch (error) {
      console.error("Failed to process referral reward:", error);
    }
  };

  // Clear timeouts on component unmount
  useEffect(() => {
    return () => {
      if (activationTimeoutRef.current) {
        clearTimeout(activationTimeoutRef.current);
      }
      if (abandonmentTimeoutRef.current) {
        clearTimeout(abandonmentTimeoutRef.current);
      }
    };
  }, []);

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
              <div className="error-content">
                <p>{paymentError}</p>
                <div className="payment-help-tips">
                  <p>Common reasons for payment failures:</p>
                  <ul>
                    <li>Insufficient funds in your M-Pesa account</li>
                    <li>Incorrect M-Pesa PIN entered</li>
                    <li>Transaction timeout (took too long to complete)</li>
                    <li>Daily transaction limits reached</li>
                  </ul>
                  <p>Please try again or contact support if the problem persists.</p>
                </div>
              </div>
            </div>
          )}
          
          {transactionId && (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <div className="success-content">
                <h4>Payment Successful!</h4>
                <p>{activationComplete 
                  ? 'Your account has been activated!' 
                  : 'Activating your account...'}
                </p>
                <p>Transaction ID: {transactionId}</p>
              </div>
            </div>
          )}
          
          <div className="modal-actions">
            {/* IntaSend Payment Button with improved user ID passing */}
            <button 
              className="btn btn-primary btn-activation intaSendPayButton" 
              data-amount="300" 
              data-currency="KES"
              data-api_ref={`account_activation_${currentUser?.uid}`}
              data-customer_id={currentUser?.uid}
              data-metadata={JSON.stringify({userId: currentUser?.uid})}
              data-public_key={INTASEND_PUBLIC_KEY}
              onClick={handlePaymentButtonClick}
              disabled={loading || paymentProcessing || transactionId}
            >
              {paymentProcessing ? (
                <>
                  <span className="spinner-sm"></span>
                  Processing Payment...
                </>
              ) : transactionId ? (
                activationComplete ? 'Account Activated Successfully!' : 'Activating Merchant Account...'
              ) : (
                'Pay 300 KES & Activate Merchant Account'
              )}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={paymentProcessing && !activationComplete}
            >
              {activationComplete ? 'Close' : 'Cancel'}
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