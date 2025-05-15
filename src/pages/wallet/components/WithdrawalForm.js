// src/pages/wallet/components/WithdrawalForm.js

import React, { useState } from 'react';
import { 
  doc, 
  addDoc, 
  updateDoc, 
  collection, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../context/AuthContext';

const WithdrawalForm = ({ 
  availableBalance, 
  minWithdrawalAmount, 
  minTransactionAmount,
  onSuccess, 
  userId,
  logFirestoreOperation
}) => {
  const { showNotification } = useAuth();
  
  const [amount, setAmount] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [mpesaName, setMpesaName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Formatter for currency display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', { 
      style: 'currency', 
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const validateForm = () => {
    // Reset error state
    setError(null);
    
    // Check if all fields are filled
    if (!amount || !mpesaNumber || !mpesaName) {
      setError('Please fill in all fields');
      return false;
    }
    
    // Validate amount
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    
    // Check min transaction amount (per transaction)
    if (amountValue < minTransactionAmount) {
      setError(`Minimum withdrawal amount is KSh ${minTransactionAmount} per transaction`);
      return false;
    }
    
    // Check available balance meets the minimum requirement
    if (availableBalance < minWithdrawalAmount) {
      setError(`You need a minimum balance of ${formatCurrency(minWithdrawalAmount)} to withdraw`);
      return false;
    }
    
    // Check requested amount doesn't exceed available balance
    if (amountValue > availableBalance) {
      setError('Withdrawal amount exceeds your available balance');
      return false;
    }
    
    // Validate M-Pesa number (simple Kenyan format check)
    const mpesaRegex = /^(?:254|\+254|0)([7-9][0-9]{8})$/;
    if (!mpesaRegex.test(mpesaNumber)) {
      setError('Please enter a valid M-Pesa number format (e.g., 0712345678)');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const amountValue = parseFloat(amount);
      
      // Format M-Pesa number for consistency (remove +254 or 0 prefix)
      let formattedMpesaNumber = mpesaNumber;
      if (formattedMpesaNumber.startsWith('+254')) {
        formattedMpesaNumber = '0' + formattedMpesaNumber.slice(4);
      } else if (formattedMpesaNumber.startsWith('254')) {
        formattedMpesaNumber = '0' + formattedMpesaNumber.slice(3);
      }
      
      // 1. Add withdrawal request to user's withdrawals subcollection
      const withdrawalData = {
        amount: amountValue,
        mpesaNumber: formattedMpesaNumber,
        mpesaName,
        status: 'pending',
        createdAt: serverTimestamp(),
        processedAt: null
      };
      
      // Log the operation
      logFirestoreOperation('WRITE', `users/${userId}/withdrawals/[new-doc]`, withdrawalData);
      
      const withdrawalsRef = collection(db, `users/${userId}/withdrawals`);
      await addDoc(withdrawalsRef, withdrawalData);
      
      // 2. Update user's balance (deduct the withdrawal amount)
      const userDocRef = doc(db, 'users', userId);
      
      // Log the operation
      logFirestoreOperation('UPDATE', `users/${userId}`, {
        availableBalance: availableBalance - amountValue,
        totalWithdrawn: availableBalance
      });
      
      await updateDoc(userDocRef, {
        availableBalance: availableBalance - amountValue,
        totalWithdrawn: availableBalance
      });
      
      // 3. Update local state
      setSuccess(true);
      showNotification({
        type: 'success',
        message: 'Withdrawal request submitted successfully!'
      });
      
      // 4. Reset form
      setAmount('');
      setMpesaNumber('');
      setMpesaName('');
      
      // 5. Notify parent component to refresh data
      if (onSuccess) onSuccess();
      
      // 6. Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
      
    } catch (err) {
      console.error('Error processing withdrawal:', err);
      setError('Failed to process withdrawal. Please try again.');
      showNotification({
        type: 'error',
        message: 'Failed to process withdrawal'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="withdrawal-form">
      {success && (
        <div className="success-message">
          <div className="success-icon">✓</div>
          <div className="success-content">
            <h4>Withdrawal Request Submitted!</h4>
            <p>We'll process your payment within 24 hours.</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <div className="error-icon">⚠</div>
          <div className="error-content">{error}</div>
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="amount" className="form-label">Amount (KSh)</label>
        <input
          type="number"
          id="amount"
          className="form-control"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Enter amount (min. KSh ${minTransactionAmount})`}
          min={minTransactionAmount}
          max={availableBalance}
          disabled={loading}
          required
        />
        <small className="form-helper-text">
          Available: {formatCurrency(availableBalance)}
        </small>
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
          disabled={loading}
          required
        />
        <small className="form-helper-text">
          Enter your M-Pesa registered phone number
        </small>
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
          disabled={loading}
          required
        />
        <small className="form-helper-text">
          The name must match your M-Pesa account exactly
        </small>
      </div>
      
      <div className="withdrawal-terms">
        <p>
          By submitting this request, you confirm that the information provided is 
          correct and that you have met all withdrawal requirements.
        </p>
      </div>
      
      <button 
        type="submit" 
        className="btn btn-primary w-full" 
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-sm"></span>
            Processing...
          </>
        ) : (
          'Submit Withdrawal Request'
        )}
      </button>
    </form>
  );
};

export default WithdrawalForm;