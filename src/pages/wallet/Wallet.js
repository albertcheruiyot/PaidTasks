// src/pages/wallet/Wallet.js

import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import AccountActivationModal from './components/AccountActivationModal';
import ReferralShareModal from './components/ReferralShareModal';
import MinimumBalanceModal from './components/MinimumBalanceModal';
import WithdrawalForm from './components/WithdrawalForm';
import WithdrawalHistory from './components/WithdrawalHistory';
import './Wallet.css';

import { 
  AdsteraBanner, 
  AdsteraNativeBanner, 
  AdsteraSocial, 
  AdsteraPopunder 
} from '../../components/ads';

// Helper to log Firestore operations
const logFirestoreOperation = (operation, path, data = null) => {
  console.log(`Firestore ${operation}:`, path, data ? data : '');
};

const Wallet = () => {
  const { currentUser, userData, refreshUserData, showNotification } = useAuth();
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showMinBalanceModal, setShowMinBalanceModal] = useState(false);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  
  // Withdrawal thresholds
  const MIN_TRANSACTION_AMOUNT = 50; // Minimum per transaction
  const MIN_WITHDRAWAL_AMOUNT = 10000; // Minimum balance required (hidden requirement)
  const REQUIRED_REFERRALS = 10; // Required number of activated referrals
  
  // Track if we've already fetched history to prevent redundant Firestore reads
  const historyFetchedRef = useRef(false);
  
  // Load wallet data - optimized to minimize reads
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        if (!currentUser || !userData) {
          setLoading(false);
          return;
        }
        
        // Only fetch withdrawal history if we haven't already and we have a small withdrawal history
        if (!historyFetchedRef.current && withdrawalHistory.length === 0) {
          // Query only last 10 withdrawals to reduce data transfer
          const withdrawalsRef = collection(db, `users/${currentUser.uid}/withdrawals`);
          
          logFirestoreOperation('READ (query)', `users/${currentUser.uid}/withdrawals`, 'Fetching last 10 withdrawals');
          
          const q = query(
            withdrawalsRef,
            orderBy('createdAt', 'desc'),
            limit(10)
          );
          
          const querySnapshot = await getDocs(q);
          const history = [];
          
          querySnapshot.forEach((doc) => {
            history.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          setWithdrawalHistory(history);
          historyFetchedRef.current = true;
        }
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        setError('Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWalletData();
  }, [currentUser, userData]);
  
  // Handle withdrawal button click - cloud function handles the actual activation now
  const handleWithdrawalClick = () => {
    // Step 1: Check account activation
    if (!userData.isAccountActivated) {
      setShowActivationModal(true);
      return;
    }
    
    // Step 2: Check if user has enough activated referrals
    if (userData?.referralStats?.activatedReferrals < REQUIRED_REFERRALS) {
      setShowReferralModal(true);
      return;
    }
    
    // Step 3 (Hidden until now): Check for minimum balance
    if (userData?.availableBalance < MIN_WITHDRAWAL_AMOUNT) {
      setShowMinBalanceModal(true);
      return;
    }
    
    // All requirements met, show withdrawal form
    setShowWithdrawalForm(true);
  };
  
  // Formatter for currency display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', { 
      style: 'currency', 
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading wallet data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container">
      {/* Wallet header and stats */}
      <div className="wallet-header">
        <h1>Wallet</h1>
        <p>Manage your earnings and withdrawals</p>
      </div>
      
      {/* Wallet stats cards */}
      <div className="wallet-stats-container">
        <div className="wallet-stat-card">
          <div className="wallet-stat-icon">💰</div>
          <div className="wallet-stat-content">
            <h3>Available Balance</h3>
            <p className="wallet-stat-value">{formatCurrency(userData?.availableBalance || 0)}</p>
          </div>
        </div>
        
        <div className="wallet-stat-card">
          <div className="wallet-stat-icon">📊</div>
          <div className="wallet-stat-content">
            <h3>Total Earnings</h3>
            <p className="wallet-stat-value">{formatCurrency(userData?.totalEarnings || 0)}</p>
          </div>
        </div>
        
        <div className="wallet-stat-card">
          <div className="wallet-stat-icon">💸</div>
          <div className="wallet-stat-content">
            <h3>Total Withdrawn</h3>
            <p className="wallet-stat-value">{formatCurrency(userData?.totalWithdrawn || 0)}</p>
          </div>
        </div>
      </div>
      
      {/* Withdrawal section */}
      {userData?.availableBalance > 0 ? (
        <div className="withdrawal-section">
          <h2>Request Withdrawal</h2>
          
          {/* Only show form if all requirements are met and user clicks through */}
          {showWithdrawalForm ? (
            <WithdrawalForm 
              availableBalance={userData?.availableBalance} 
              minWithdrawalAmount={MIN_WITHDRAWAL_AMOUNT}
              minTransactionAmount={MIN_TRANSACTION_AMOUNT}
              onSuccess={() => refreshUserData()}
              userId={currentUser?.uid}
              logFirestoreOperation={logFirestoreOperation}
            />
          ) : (
            <button 
              className="btn btn-primary w-full" 
              onClick={handleWithdrawalClick}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Request Withdrawal'}
            </button>
          )}
        </div>
      ) : (
        <div className="no-balance">
          <h2>Insufficient Balance</h2>
          <p>Complete tasks to earn money and withdraw.</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/tasks/videos'}
          >
            Find Tasks
          </button>
        </div>
      )}
      
      {/* Withdrawal history section */}
      <WithdrawalHistory history={withdrawalHistory} />
      
      {/* IntaSend Trust Badge for Wallet page */}
      <div className="intasend-trust-badge wallet-trust-badge">
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
      
      {/* Modals */}
      {showActivationModal && (
        <AccountActivationModal 
          onClose={() => {
            setShowActivationModal(false);
            refreshUserData(); // Refresh user data when modal is closed
          }}
          loading={loading}
        />
      )}
      
      {showReferralModal && (
        <ReferralShareModal 
          referralLink={userData?.referralLink}
          referralCode={userData?.referralCode}
          activatedReferrals={userData?.referralStats?.activatedReferrals || 0}
          requiredReferrals={REQUIRED_REFERRALS}
          onClose={() => setShowReferralModal(false)}
        />
      )}
      
      {showMinBalanceModal && (
        <MinimumBalanceModal
          currentBalance={userData?.availableBalance || 0}
          minAmount={MIN_WITHDRAWAL_AMOUNT}
          onClose={() => setShowMinBalanceModal(false)}
        />
      )}
      
      {/* Info section - progressively reveals requirements */}
      <div className="wallet-note">
        <h3>Withdrawal Information</h3>
        <ul>
          <li>Minimum withdrawal transaction: KSh {MIN_TRANSACTION_AMOUNT}</li>
          <li>One-time freelance merchant account activation fee: KSh 300</li>
          {!userData?.isAccountActivated ? null : (
            <li>{REQUIRED_REFERRALS} activated referrals required for withdrawals</li>
          )}
          {(!userData?.isAccountActivated || userData?.referralStats?.activatedReferrals < REQUIRED_REFERRALS) ? null : (
            <li>Minimum balance of {formatCurrency(MIN_WITHDRAWAL_AMOUNT)} required for withdrawals</li>
          )}
          <li>Withdrawals processed within 24 hours</li>
          <li>Funds are sent directly to your M-Pesa account</li>
        </ul>
      </div>
      <AdsteraBanner />
      <AdsteraNativeBanner />
      <AdsteraSocial />
      <AdsteraPopunder />
    </div>
  );
};

export default Wallet;