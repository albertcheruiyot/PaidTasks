// src/pages/auth/ForgotPassword.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FloatingCoins from '../../components/animations/FloatingCoins';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const { passwordReset, authLoading, error, showNotification } = useAuth();
  
  useEffect(() => {
    // Auto-focus email input
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.focus();
    }
    
    // Check for stored email to prefill
    const storedEmail = localStorage.getItem('authEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await passwordReset(email);
      setEmailSent(true);
      showNotification({ type: 'success', message: 'Password reset email sent!' });
    } catch (err) {
      // Error is already handled by the context
      console.error('Password reset error:', err);
    }
  };
  
  const validateForm = () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification({ type: 'error', message: 'Please enter a valid email address' });
      return false;
    }
    
    return true;
  };
  
  const handleInputFocus = (inputName) => {
    setFocusedInput(inputName);
  };
  
  const handleInputBlur = () => {
    setFocusedInput(null);
  };
  
  return (
    <div className="auth-container">
      {/* Background floating coins */}
      <FloatingCoins count={6} direction="up" />
      
      <div className="auth-card">
        {/* Decorative elements */}
        <div className="auth-decoration auth-decoration-1">💸</div>
        <div className="auth-decoration auth-decoration-2">💰</div>
        
        <div className="auth-header">
          <span className="auth-logo">🔑</span>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter your email to receive a password reset link</p>
        </div>
        
        <div className="auth-form-container">
          {error && (
            <div className="auth-message auth-error">
              <span className="auth-message-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          {emailSent ? (
            <div className="auth-message auth-success">
              <span className="auth-message-icon">✅</span>
              <span>Password reset link sent! Check your email inbox (and spam folder) for instructions.</span>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className={`auth-input-group ${focusedInput === 'email' ? 'focused' : ''}`}>
                <label htmlFor="email" className="auth-label">Email Address</label>
                <span className="auth-input-icon">✉️</span>
                <input
                  type="email"
                  id="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => handleInputFocus('email')}
                  onBlur={handleInputBlur}
                  placeholder="Enter your email"
                  disabled={authLoading}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="auth-submit-btn" 
                disabled={authLoading}
              >
                {authLoading && <div className="spinner"></div>}
                {authLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
          
          <div className="auth-footer">
            <p>Remember your password? <Link to="/login" className="auth-link">Sign In</Link></p>
            <p>Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;