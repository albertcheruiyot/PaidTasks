// src/pages/wallet/Wallet.js

import React, { useState, useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import './Wallet.css';

const Wallet = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states
  const [amount, setAmount] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [mpesaName, setMpesaName] = useState('');
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState(null);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  
  useEffect(() => {
    const fetchUserAndWithdrawals = async () => {
      try {
        if (currentUser) {
          // Fetch user data
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
            
            // Fetch withdrawal history from subcollection
            const withdrawalsRef = collection(db, `users/${currentUser.uid}/withdrawals`);
            const q = query(
              withdrawalsRef,
              orderBy('createdAt', 'desc')
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
          } else {
            setError('User data not found');
          }
        }
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        setError('Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndWithdrawals();
  }, [currentUser]);
  
  const validateWithdrawalForm = () => {
    // Reset errors first
    setWithdrawalError(null);
    
    // Check if all fields are filled
    if (!amount || !mpesaNumber || !mpesaName) {
      setWithdrawalError('Please fill in all fields');
      return false;
    }
    
    // Validate amount
    const amountValue = parseFloat(amount);
    
    if (isNaN(amountValue) || amountValue <= 0) {
      setWithdrawalError('Please enter a valid amount');
      return false;
    }
    
    // Check if amount is greater than available balance
    if (amountValue > userData.availableBalance) {
      setWithdrawalError('Withdrawal amount exceeds your available balance');
      return false;
    }
    
    // Check minimum withdrawal amount (50 KSh)
    if (amountValue < 50) {
      setWithdrawalError('Minimum withdrawal amount is KSh 50');
      return false;
    }
    
    // Validate M-Pesa number (simple Kenyan format check)
    const mpesaRegex = /^(?:254|\+254|0)([7-9][0-9]{8})$/;
    if (!mpesaRegex.test(mpesaNumber)) {
      setWithdrawalError('Please enter a valid M-Pesa number format (e.g., 0712345678)');
      return false;
    }
    
    return true;
  };
  
  const handleWithdrawal = async (e) => {
    e.preventDefault();
    
    if (!validateWithdrawalForm()) {
      return;
    }
    
    try {
      setWithdrawalLoading(true);
      setWithdrawalError(null);
      setWithdrawalSuccess(false);
      
      const amountValue = parseFloat(amount);
      
      // 1. Add withdrawal request to user's withdrawals subcollection
      const withdrawalData = {
        amount: amountValue,
        mpesaNumber,
        mpesaName,
        status: 'pending',
        createdAt: serverTimestamp(),
        processedAt: null
      };
      
      const withdrawalsRef = collection(db, `users/${currentUser.uid}/withdrawals`);
      await addDoc(withdrawalsRef, withdrawalData);
      
      // 2. Update user's balance
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        availableBalance: userData.availableBalance - amountValue,
        totalWithdrawn: userData.totalWithdrawn + amountValue
      });
      
      // 3. Update local state
      setUserData({
        ...userData,
        availableBalance: userData.availableBalance - amountValue,
        totalWithdrawn: userData.totalWithdrawn + amountValue
      });
      
      // Add to local withdrawal history
      setWithdrawalHistory([
        {
          id: 'temp-id',
          ...withdrawalData,
          createdAt: { seconds: Date.now() / 1000 } // Temporary timestamp format
        },
        ...withdrawalHistory
      ]);
      
      // Reset form
      setAmount('');
      setMpesaNumber('');
      setMpesaName('');
      setWithdrawalSuccess(true);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setWithdrawalSuccess(false);
      }, 5000);
      
    } catch (err) {
      console.error('Error processing withdrawal:', err);
      setWithdrawalError('Failed to process withdrawal. Please try again.');
    } finally {
      setWithdrawalLoading(false);
    }
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
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
      <div className="wallet-header">
        <h1>Wallet</h1>
        <p>Manage your earnings and withdrawals</p>
      </div>
      
      <div className="wallet-stats-container">
        <div className="wallet-stat-card">
          <div className="wallet-stat-icon">💰</div>
          <div className="wallet-stat-content">
            <h3>Available Balance</h3>
            <p className="wallet-stat-value">KSh {userData?.availableBalance || 0}</p>
          </div>
        </div>
        
        <div className="wallet-stat-card">
          <div className="wallet-stat-icon">📊</div>
          <div className="wallet-stat-content">
            <h3>Total Earnings</h3>
            <p className="wallet-stat-value">KSh {userData?.totalEarnings || 0}</p>
          </div>
        </div>
        
        <div className="wallet-stat-card">
          <div className="wallet-stat-icon">💸</div>
          <div className="wallet-stat-content">
            <h3>Total Withdrawn</h3>
            <p className="wallet-stat-value">KSh {userData?.totalWithdrawn || 0}</p>
          </div>
        </div>
      </div>
      
      {userData?.availableBalance > 0 ? (
        <div className="withdrawal-section">
          <h2>Request Withdrawal</h2>
          
          {withdrawalSuccess && (
            <div className="success-message">
              Withdrawal request submitted successfully! We'll process it within 24 hours.
            </div>
          )}
          
          {withdrawalError && (
            <div className="error-message">
              {withdrawalError}
            </div>
          )}
          
          <form onSubmit={handleWithdrawal} className="withdrawal-form">
            <div className="form-group">
              <label htmlFor="amount" className="form-label">Amount (KSh)</label>
              <input
                type="number"
                id="amount"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (min. KSh 50)"
                min="50"
                max={userData?.availableBalance}
                disabled={withdrawalLoading}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="mpesaNumber" className="form-label">M-Pesa Number</label>
              <input
                type="text"
                id="mpesaNumber"
                className="form-control"
                value={mpesaNumber}
                onChange={(e) => setMpesaNumber(e.target.value)}
                placeholder="e.g., 0712345678"
                disabled={withdrawalLoading}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="mpesaName" className="form-label">M-Pesa Account Name</label>
              <input
                type="text"
                id="mpesaName"
                className="form-control"
                value={mpesaName}
                onChange={(e) => setMpesaName(e.target.value)}
                placeholder="Enter the name on your M-Pesa account"
                disabled={withdrawalLoading}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-full" 
              disabled={withdrawalLoading}
            >
              {withdrawalLoading ? 'Processing...' : 'Request Withdrawal'}
            </button>
          </form>
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
      
      <div className="withdrawal-history">
        <h2>Withdrawal History</h2>
        
        {withdrawalHistory.length === 0 ? (
          <div className="no-history">
            <p>No withdrawal history yet.</p>
          </div>
        ) : (
          <div className="history-list">
            <div className="history-header">
              <div className="history-date">Date</div>
              <div className="history-amount">Amount</div>
              <div className="history-method">M-Pesa</div>
              <div className="history-status">Status</div>
            </div>
            
            {withdrawalHistory.map((withdrawal) => {
              const date = withdrawal.createdAt ? new Date(withdrawal.createdAt.seconds * 1000) : new Date();
              const formattedDate = date.toLocaleDateString();
              
              return (
                <div key={withdrawal.id} className="history-item">
                  <div className="history-date">{formattedDate}</div>
                  <div className="history-amount">KSh {withdrawal.amount}</div>
                  <div className="history-method">{withdrawal.mpesaNumber}</div>
                  <div className="history-status">
                    <span className={`status-badge ${getStatusClass(withdrawal.status)}`}>
                      {withdrawal.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="wallet-note">
        <h3>Withdrawal Information</h3>
        <ul>
          <li>Minimum withdrawal amount: KSh 50</li>
          <li>Withdrawals are processed within 24 hours</li>
          <li>Make sure your M-Pesa number and name are correct</li>
          <li>For any issues, contact support</li>
        </ul>
      </div>
    </div>
  );
};

export default Wallet;