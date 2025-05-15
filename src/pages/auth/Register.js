// src/pages/auth/Register.js

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { registerWithEmail, signInWithGoogle } from '../../services/firebase/authService';
import { useAuth } from '../../context/AuthContext';
import FloatingCoins from '../../components/animations/FloatingCoins';
import StaggeredReveal from '../../components/animations/StaggeredReveal';
import './Auth.css';

// Password strength checker
const checkPasswordStrength = (password) => {
  // Initialize score
  let score = 0;
  
  // Check if empty
  if (!password) return { score: 0, strength: '' };
  
  // Award points for length
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Award points for complexity
  if (/[A-Z]/.test(password)) score += 1; // Has uppercase
  if (/[a-z]/.test(password)) score += 1; // Has lowercase
  if (/[0-9]/.test(password)) score += 1; // Has number
  if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has special char
  
  // Convert score to strength label
  let strength = '';
  if (score < 3) strength = 'weak';
  else if (score < 5) strength = 'fair';
  else if (score < 7) strength = 'good';
  else strength = 'strong';
  
  return { score, strength };
};

// Password requirements checker
const checkPasswordRequirements = (password) => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };
};

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralCodeFromUrl, setReferralCodeFromUrl] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, strength: '' });
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  
  const [focusedInput, setFocusedInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useAuth();
  
  const fullNameInputRef = useRef(null);
  
  // Check URL for referral code
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    
    if (refCode) {
      setReferralCode(refCode);
      setReferralCodeFromUrl(true);
      // Also store in localStorage as a backup
      localStorage.setItem('referralCode', refCode);
    } else {
      // Check localStorage in case they arrived from a link but refreshed the page
      const storedRefCode = localStorage.getItem('referralCode');
      if (storedRefCode) {
        setReferralCode(storedRefCode);
        setReferralCodeFromUrl(true);
      }
    }
    
    // Focus the name input on component mount
    if (fullNameInputRef.current) {
      fullNameInputRef.current.focus();
    }
  }, [location]);
  
  // Check password strength whenever password changes
  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password));
    setPasswordRequirements(checkPasswordRequirements(password));
  }, [password]);
  
  const validateForm = () => {
    // Check if all fields are filled
    if (!fullName || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }
    
    // Validate name
    if (fullName.trim().length < 3) {
      setError('Name must be at least 3 characters');
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    // Check password strength
    if (passwordStrength.strength === 'weak') {
      setError('Please use a stronger password');
      return false;
    }
    
    // Check terms agreement
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service');
      return false;
    }
    
    return true;
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Register with Firebase - using a cleaned referral code
      await registerWithEmail({
        email,
        password,
        fullName,
        referralCode: referralCode.trim() || null
      });
      
      showNotification({ type: 'success', message: 'Account created successfully!' });
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(getErrorMessage(err.code));
      showNotification({ type: 'error', message: getErrorMessage(err.code) });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Sign in with Google - using stored referral code
      const storedRefCode = referralCode || localStorage.getItem('referralCode') || null;
      const { user, isNewUser } = await signInWithGoogle(storedRefCode);
      
      if (isNewUser) {
        showNotification({ type: 'success', message: 'Account created with Google successfully!' });
      } else {
        showNotification({ type: 'success', message: 'Signed in with Google successfully!' });
      }
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Google sign-up error:', err);
      setError(getErrorMessage(err.code));
      showNotification({ type: 'error', message: getErrorMessage(err.code) });
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to get user-friendly error messages
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please log in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Your password is too weak. Please choose a stronger password.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed before completing. Please try again.';
      case 'invalid-referral-code':
        return 'The referral code you entered is invalid or has been deactivated.';
      default:
        return 'An error occurred during registration. Please try again.';
    }
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
      <FloatingCoins count={12} />
      
      <div className="auth-card">
        {/* Decorative elements */}
        <div className="auth-decoration auth-decoration-1">💸</div>
        <div className="auth-decoration auth-decoration-2">💰</div>
        
        <div className="auth-header">
          <span className="auth-logo">💸</span>
          <h1 className="auth-title">Create Your Account</h1>
          <p className="auth-subtitle">Start earning by completing simple tasks</p>
        </div>
        
        <div className="auth-form-container">
          {error && (
            <div className="auth-message auth-error">
              <span className="auth-message-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          <form className="auth-form" onSubmit={handleRegister}>
            <StaggeredReveal staggerDelay={0.1}>
              <div className={`auth-input-group ${focusedInput === 'fullName' ? 'focused' : ''}`}>
                <label htmlFor="fullName" className="auth-label">Full Name</label>
                <span className="auth-input-icon">👤</span>
                <input
                  type="text"
                  id="fullName"
                  className="auth-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => handleInputFocus('fullName')}
                  onBlur={handleInputBlur}
                  placeholder="Enter your full name"
                  ref={fullNameInputRef}
                  disabled={loading}
                  required
                />
              </div>
              
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
                <input
                  type="password"
                  id="password"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => handleInputFocus('password')}
                  onBlur={handleInputBlur}
                  placeholder="Create a strong password"
                  disabled={loading}
                  required
                />
                
                {password && (
                  <>
                    <div className="password-strength">
                      <div 
                        className={`password-strength-bar strength-${passwordStrength.strength}`}
                      ></div>
                    </div>
                    <div className="password-strength-text">
                      <span>Strength:</span>
                      <span>{passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}</span>
                    </div>
                    <div className="password-requirements">
                      <div className={`password-requirement ${passwordRequirements.length ? 'requirement-met' : 'requirement-unmet'}`}>
                        <span className="requirement-icon">{passwordRequirements.length ? '✓' : '○'}</span>
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`password-requirement ${passwordRequirements.uppercase ? 'requirement-met' : 'requirement-unmet'}`}>
                        <span className="requirement-icon">{passwordRequirements.uppercase ? '✓' : '○'}</span>
                        <span>At least 1 uppercase letter</span>
                      </div>
                      <div className={`password-requirement ${passwordRequirements.lowercase ? 'requirement-met' : 'requirement-unmet'}`}>
                        <span className="requirement-icon">{passwordRequirements.lowercase ? '✓' : '○'}</span>
                        <span>At least 1 lowercase letter</span>
                      </div>
                      <div className={`password-requirement ${passwordRequirements.number ? 'requirement-met' : 'requirement-unmet'}`}>
                        <span className="requirement-icon">{passwordRequirements.number ? '✓' : '○'}</span>
                        <span>At least 1 number</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className={`auth-input-group ${focusedInput === 'confirmPassword' ? 'focused' : ''}`}>
                <label htmlFor="confirmPassword" className="auth-label">Confirm Password</label>
                <span className="auth-input-icon">🔒</span>
                <input
                  type="password"
                  id="confirmPassword"
                  className="auth-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => handleInputFocus('confirmPassword')}
                  onBlur={handleInputBlur}
                  placeholder="Confirm your password"
                  disabled={loading}
                  required
                />
              </div>
              
              {/* Referral code field - auto-populated if from link */}
              <div className={`auth-input-group ${focusedInput === 'referralCode' ? 'focused' : ''}`}>
                <label htmlFor="referralCode" className="auth-label">
                  Referral Code <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>{!referralCodeFromUrl && "(Optional)"}</span>
                </label>
                <span className="auth-input-icon">👥</span>
                <input
                  type="text"
                  id="referralCode"
                  className="auth-input"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  onFocus={() => handleInputFocus('referralCode')}
                  onBlur={handleInputBlur}
                  placeholder="Enter referral code if you have one"
                  disabled={loading || referralCodeFromUrl}
                />
                {referralCodeFromUrl && (
                  <small className="input-helper-text" style={{color: 'var(--color-success)', marginTop: '8px', display: 'block'}}>
                    ✓ Referral code applied! You'll both earn rewards.
                  </small>
                )}
              </div>
              
              <div className="auth-checkbox-container">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  className="auth-checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  disabled={loading}
                  required
                />
                <label htmlFor="agreeTerms">
                  I agree to the <Link to="/terms" className="auth-link">Terms of Service</Link> and <Link to="/privacy" className="auth-link">Privacy Policy</Link>
                </label>
              </div>
              
              <button 
                type="submit" 
                className="auth-submit-btn" 
                disabled={loading}
              >
                {loading && <div className="spinner"></div>}
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </StaggeredReveal>
          </form>
          
          <div className="auth-divider">or</div>
          
          <div className="auth-social-btns">
            <button 
              type="button" 
              className="auth-social-btn" 
              onClick={handleGoogleSignUp}
              disabled={loading}
            >
              <svg className="auth-social-icon auth-google-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </button>
          </div>
          
          {referralCodeFromUrl && (
            <div className="referral-section">
              <div className="referral-title">
                <span className="referral-icon">👋</span>
                Welcome! You were referred by a friend
              </div>
              <div className="referral-badge">Referral Code: {referralCode}</div>
              <p className="referral-info">
                Both you and your friend will earn rewards when you complete your first task!
              </p>
            </div>
          )}
          
          <div className="auth-footer">
            Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;