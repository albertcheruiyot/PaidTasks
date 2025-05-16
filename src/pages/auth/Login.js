// src/pages/auth/Login.js - FULL UPDATED CODE

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginWithEmail, signInWithGoogle } from '../../services/firebase/authService';
import { useAuth } from '../../context/AuthContext';
import FloatingCoins from '../../components/animations/FloatingCoins';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, showNotification } = useAuth();
  
  // Check if there's a referral code in the URL
  const queryParams = new URLSearchParams(location.search);
  const referralCode = queryParams.get('ref');
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  
  // Save referral code to localStorage if available
  useEffect(() => {
    if (referralCode) {
      localStorage.setItem('referralCode', referralCode);
    }
    
    // Auto-focus email input
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.focus();
    }
  }, [referralCode]);
  
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Call Firebase login
      const { user } = await loginWithEmail(email, password);
      
      if (rememberMe) {
        localStorage.setItem('authEmail', email);
      } else {
        localStorage.removeItem('authEmail');
      }
      
      showNotification({ type: 'success', message: 'Login successful!' });
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(getErrorMessage(err.code));
      showNotification({ type: 'error', message: getErrorMessage(err.code) });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get stored referral code if available
      const storedReferralCode = localStorage.getItem('referralCode');
      
      // Call Firebase Google login
      const { user, isNewUser } = await signInWithGoogle(storedReferralCode);
      
      if (isNewUser) {
        showNotification({ type: 'success', message: 'Account created successfully!' });
      } else {
        showNotification({ type: 'success', message: 'Login successful!' });
      }
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Google login error:', err);
      setError(getErrorMessage(err.code));
      showNotification({ type: 'error', message: getErrorMessage(err.code) });
    } finally {
      setLoading(false);
    }
  };
  
  const validateForm = () => {
    // Check if all required fields are filled
    if (!email || !password) {
      setError('Please enter both email and password');
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Helper function to get user-friendly error messages
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      case 'auth/popup-closed-by-user':
        return 'Login popup was closed. Please try again';
      case 'invalid-referral-code':
        return 'The referral code you entered is invalid or has been deactivated';
      default:
        return 'An error occurred during login. Please try again';
    }
  };
  
  const handleInputFocus = (inputName) => {
    setFocusedInput(inputName);
  };
  
  const handleInputBlur = () => {
    setFocusedInput(null);
  };
  
  // Check for stored email on component mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('authEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    }
  }, []);
  
  return (
    <div className="auth-container">
      {/* Background floating coins */}
      <FloatingCoins count={8} />
      
      <div className="auth-card">
        {/* Decorative elements */}
        <div className="auth-decoration auth-decoration-1">💸</div>
        <div className="auth-decoration auth-decoration-2">💰</div>
        
        <div className="auth-header">
          <span className="auth-logo">💸</span>
          <h1 className="auth-title">Welcome Back!</h1>
          <p className="auth-subtitle">Sign in to continue earning with PaidTasks</p>
        </div>
        
        <div className="auth-form-container">
          {error && (
            <div className="auth-message auth-error">
              <span className="auth-message-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          <form className="auth-form" onSubmit={handleEmailLogin}>
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
                disabled={loading}
                required
              />
            </div>
            
            <div className={`auth-input-group ${focusedInput === 'password' ? 'focused' : ''}`}>
              <label htmlFor="password" className="auth-label">Password</label>
              <span className="auth-input-icon">🔒</span>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => handleInputFocus('password')}
                  onBlur={handleInputBlur}
                  placeholder="Enter your password"
                  disabled={loading}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle-btn" 
                  onClick={togglePasswordVisibility}
                  tabIndex="-1"
                >
                  {showPassword ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
            </div>
            
            <div className="auth-extra">
              <div className="auth-checkbox-container">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="auth-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="rememberMe">Remember me</label>
              </div>
              
              <Link to="/forgot-password" className="auth-forgot-password">
                Forgot Password?
              </Link>
            </div>
            
            <button 
              type="submit" 
              className="auth-submit-btn" 
              disabled={loading}
            >
              {loading && <div className="spinner"></div>}
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div className="auth-divider">or</div>
          
          <div className="auth-social-btns">
            <button 
              type="button" 
              className="auth-social-btn" 
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="auth-social-icon auth-google-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
          </div>
          
          <div className="auth-footer">
            Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;