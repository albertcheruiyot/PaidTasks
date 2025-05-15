// src/context/AuthContext.js - Fixed version to prevent excessive Firestore reads

import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { 
  onAuthStateChanged,
  getAdditionalUserInfo
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { 
  registerWithEmail, 
  signInWithGoogle,
  loginWithEmail,
  resetPassword,
  logout as firebaseLogout,
  getUserData as firebaseGetUserData,
  activateUserAccount,
  getUserReferrals
} from '../services/firebase/authService';

// Create Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Simple notification state - we'll use this instead of NotificationContext
  // to avoid circular dependencies
  const [notification, setNotification] = useState(null);
  
  // Add a timestamp to track when userData was last refreshed to prevent excessive reads
  const lastUserDataRefresh = useRef(0);
  // Add a flag to prevent recursive calls
  const isRefreshingUserData = useRef(false);

  // Register a new user with email and password
  const register = async (email, password, fullName, referralCode = null) => {
    setAuthLoading(true);
    setError(null);
    
    try {
      const result = await registerWithEmail({
        email,
        password,
        fullName,
        referralCode: referralCode || null
      });
      
      showNotification({ type: 'success', message: 'Account created successfully!' });
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      showNotification({ type: 'error', message: errorMessage });
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    setAuthLoading(true);
    setError(null);
    
    try {
      const result = await loginWithEmail(email, password);
      showNotification({ type: 'success', message: 'Logged in successfully!' });
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      showNotification({ type: 'error', message: errorMessage });
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign in with Google
  const googleSignIn = async (referralCode = null) => {
    setAuthLoading(true);
    setError(null);
    
    try {
      const result = await signInWithGoogle(referralCode);
      
      if (result.isNewUser) {
        showNotification({ type: 'success', message: 'Account created with Google successfully!' });
      } else {
        showNotification({ type: 'success', message: 'Logged in with Google successfully!' });
      }
      
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      showNotification({ type: 'error', message: errorMessage });
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Reset password
  const passwordReset = async (email) => {
    setAuthLoading(true);
    setError(null);
    
    try {
      await resetPassword(email);
      showNotification({ type: 'success', message: 'Password reset email sent. Check your inbox.' });
    } catch (err) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      showNotification({ type: 'error', message: errorMessage });
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    setAuthLoading(true);
    setError(null);
    
    try {
      await firebaseLogout();
      setUserData(null);
      showNotification({ type: 'success', message: 'Logged out successfully.' });
    } catch (err) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      showNotification({ type: 'error', message: errorMessage });
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Show notification
  const showNotification = (notif) => {
    setNotification(notif);
    
    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Get user referrals
  const getReferrals = async () => {
    try {
      if (!currentUser) return [];
      
      const referrals = await getUserReferrals(currentUser.uid);
      return referrals;
    } catch (err) {
      console.error("Error getting referrals:", err);
      return [];
    }
  };

  // Activate account after completing first task
  const activateAccount = async () => {
    try {
      if (!currentUser) return false;
      
      const success = await activateUserAccount(currentUser.uid);
      
      if (success) {
        // Update local user data
        await refreshUserData();
        
        showNotification({ type: 'success', message: 'Your account has been activated!' });
      }
      
      return success;
    } catch (err) {
      console.error("Error activating account:", err);
      return false;
    }
  };

  // Update last active timestamp
  const updateLastActive = async () => {
    try {
      if (currentUser) {
        await setDoc(
          doc(db, 'users', currentUser.uid), 
          { lastActive: serverTimestamp() }, 
          { merge: true }
        );
      }
    } catch (err) {
      console.error("Error updating last active:", err);
    }
  };

  // Helper function to get user-friendly error messages
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please log in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
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
        return 'An error occurred. Please try again.';
    }
  };

  // Modified refreshUserData to prevent excessive Firestore reads
  const refreshUserData = async () => {
    // Only proceed if we have a current user and we're not already refreshing
    if (!currentUser || isRefreshingUserData.current) return userData;
    
    // Check if we refreshed recently (within the last 2 seconds)
    const now = Date.now();
    if (now - lastUserDataRefresh.current < 2000) {
      return userData; // Return current data if we refreshed recently
    }
    
    try {
      isRefreshingUserData.current = true;
      
      // Only make one Firestore call
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const freshUserData = userDoc.data();
        setUserData(freshUserData);
        lastUserDataRefresh.current = now;
        return freshUserData;
      }
      return null;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return null;
    } finally {
      isRefreshingUserData.current = false;
    }
  };

  // Listen for auth state changes and fetch user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Make a single call to get initial user data
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data());
            lastUserDataRefresh.current = Date.now();
          }
          
          // Update last active timestamp
          updateLastActive();
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        // Reset user data when logged out
        setUserData(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Context value
  const value = {
    currentUser,
    userData,
    loading,
    authLoading,
    error,
    notification,
    register,
    login,
    googleSignIn,
    passwordReset,
    logout,
    refreshUserData,
    getReferrals,
    activateAccount,
    showNotification,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access to auth context
export const useAuth = () => {
  return useContext(AuthContext);
};