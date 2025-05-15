// src/context/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear any errors when a new auth operation starts
  const clearError = () => setError(null);

  // Generate a unique referral code based on user ID
  const generateReferralCode = (userId) => {
    // Take first 6 characters of the uid and add a random suffix
    const prefix = userId.substring(0, 6);
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${randomSuffix}`;
  };

  // Generate a referral link
  const generateReferralLink = (referralCode) => {
    return `${window.location.origin}?ref=${referralCode}`;
  };

  // Register a new user with email and password
  const registerWithEmailAndPassword = async (email, password, fullName, referrerCode = null) => {
    clearError();
    try {
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Generate a new referral code for the user
      const newReferralCode = generateReferralCode(user.uid);
      const referralLink = generateReferralLink(newReferralCode);
      
      // Get referrer UID if a referral code was provided
      let referrerUid = null;
      if (referrerCode) {
        // Logic to find the referrer UID by their referral code
        // This is a simplified example - you would need to query your database
        // const referrerDoc = await queryReferralCode(referrerCode);
        // if (referrerDoc.exists()) {
        //   referrerUid = referrerDoc.data().uid;
        // }
      }
      
      // Complete initial user data with all required fields
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: fullName,
        profilePicture: user.photoURL || '',
        createdAt: serverTimestamp(),
        totalEarnings: 0, // Earned from the time a user signs up
        completedTasks: 0, // Total from the time a user signs up
        availableBalance: 0, // Available. This reduces after withdrawal
        totalWithdrawn: 0, // Total amount withdrawn forever
        referralCode: newReferralCode,
        referralLink: referralLink,
        isAccountActivated: false,
        accountActivatedAt: null,
        isVip: false,
        referralStats: {
          totalReferrals: 0, // total referrals
          activatedReferrals: 0 // total referrals who have activated their account
        },
        lastActive: serverTimestamp(),
        referredBy: referrerUid // Store the referrer's UID if available
      };
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), userData);
      
      // Create empty subcollections for withdrawals and referrals
      // Note: In Firestore, collections are created implicitly when documents are added
      
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Login with email and password
  const loginWithEmailAndPassword = async (email, password) => {
    clearError();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last active timestamp
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        lastActive: serverTimestamp()
      }, { merge: true });
      
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (referrerCode = null) => {
    clearError();
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Check if user document exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      // Get referrer UID if a referral code was provided
      let referrerUid = null;
      if (referrerCode) {
        // Logic to find the referrer UID by their referral code
        // This is a simplified example - you would need to query your database
        // const referrerDoc = await queryReferralCode(referrerCode);
        // if (referrerDoc.exists()) {
        //   referrerUid = referrerDoc.data().uid;
        // }
      }
      
      // If user doc doesn't exist, create it with default values
      if (!userDoc.exists()) {
        // Generate a new referral code for the user
        const newReferralCode = generateReferralCode(user.uid);
        const referralLink = generateReferralLink(newReferralCode);
        
        // Complete initial user data with all required fields
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          profilePicture: user.photoURL || '',
          createdAt: serverTimestamp(),
          totalEarnings: 0,
          completedTasks: 0,
          availableBalance: 0,
          totalWithdrawn: 0,
          referralCode: newReferralCode,
          referralLink: referralLink,
          isAccountActivated: false,
          accountActivatedAt: null,
          isVip: false,
          referralStats: {
            totalReferrals: 0,
            activatedReferrals: 0
          },
          lastActive: serverTimestamp(),
          referredBy: referrerUid
        };
        
        await setDoc(userDocRef, userData);
      } else {
        // Update last active timestamp
        await setDoc(userDocRef, {
          lastActive: serverTimestamp()
        }, { merge: true });
      }
      
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Send password reset email
  const resetPassword = async (email) => {
    clearError();
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout user
  const logout = async () => {
    clearError();
    try {
      // Update last active timestamp before logging out
      if (currentUser) {
        await setDoc(doc(db, 'users', currentUser.uid), {
          lastActive: serverTimestamp()
        }, { merge: true });
      }
      
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Update the last active timestamp whenever auth state changes to logged in
        await setDoc(doc(db, 'users', user.uid), {
          lastActive: serverTimestamp()
        }, { merge: true });
      }
      
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    registerWithEmailAndPassword,
    loginWithEmailAndPassword,
    signInWithGoogle,
    resetPassword,
    logout
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