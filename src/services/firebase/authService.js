// src/services/firebase/authService.js

import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    updateProfile,
    signOut
  } from 'firebase/auth';
  import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    increment,
    collection, 
    query, 
    where, 
    getDocs,
    orderBy,
    limit,
    serverTimestamp, 
    runTransaction,
    writeBatch
  } from 'firebase/firestore';
  import { auth, db } from '../../config/firebase';
  
  // Log Firestore operations in development
  const logFirestoreOperation = (operation, path, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Firestore ${operation}:`, path, data ? data : '');
    }
  };
  
  /**
   * Generate a unique referral code based on user ID
   * @param {string} userId - Firebase user ID
   * @returns {string} Referral code
   */
  const generateReferralCode = (userId) => {
    // Take first 5 characters of the uid and add a random suffix
    const prefix = userId.substring(0, 5);
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${randomSuffix}`.toUpperCase();
  };
  
  /**
   * Generate a referral link 
   * @param {string} referralCode - User's referral code
   * @returns {string} Referral link
   */
  const generateReferralLink = (referralCode) => {
    return `${window.location.origin}/register?ref=${referralCode}`;
  };
  
  /**
   * Store a new referral code in the dedicated referralCodes collection
   * @param {string} referralCode - The generated referral code
   * @param {string} referrerUid - User ID of the referrer
   * @returns {Promise<boolean>} Success status
   */
  const storeReferralCode = async (referralCode, referrerUid) => {
    try {
      // Create referral code document in referralCodes collection
      const referralData = {
        referrerUid,
        createdAt: serverTimestamp(),
        isActive: true
      };
      
      logFirestoreOperation('WRITE', `referralCodes/${referralCode}`, referralData);
      
      await setDoc(doc(db, 'referralCodes', referralCode), referralData);
      return true;
    } catch (error) {
      console.error("Error storing referral code:", error);
      return false;
    }
  };
  
  /**
   * Validate referral code exists
   * @param {string} referralCode - Referral code to validate
   * @returns {Promise<string|null>} Referrer user ID or null if not found
   */
  const validateReferralCode = async (referralCode) => {
    try {
      if (!referralCode) return null;
      
      // Direct document lookup - more efficient than a query
      logFirestoreOperation('READ', `referralCodes/${referralCode}`);
      
      const referralDocRef = doc(db, 'referralCodes', referralCode);
      const referralDoc = await getDoc(referralDocRef);
      
      if (!referralDoc.exists()) return null;
      
      // Check if the referral code is active
      const referralData = referralDoc.data();
      if (!referralData.isActive) return null;
      
      // Return the referrer's user ID
      return referralData.referrerUid;
    } catch (error) {
      console.error("Error validating referral code:", error);
      return null;
    }
  };
  
  /**
   * Register a new user with email/password
   * @param {Object} userData - User data for registration
   * @returns {Promise<Object>} Firebase user object
   */
  export const registerWithEmail = async (userData) => {
    const { email, password, fullName, referralCode } = userData;
    
    try {
      // Validate referral code if provided
      let referrerUid = null;
      if (referralCode) {
        referrerUid = await validateReferralCode(referralCode);
        if (!referrerUid && referralCode) {
          // If a referral code was provided but is invalid, throw an error
          throw { code: 'invalid-referral-code' };
        }
      }
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update displayName in Auth profile
      await updateProfile(user, {
        displayName: fullName
      });
      
      // Generate unique referral code for the new user
      const newReferralCode = generateReferralCode(user.uid);
      const referralLink = generateReferralLink(newReferralCode);
      
      // Create user document in Firestore
      const userDocData = {
        uid: user.uid,
        email: user.email,
        displayName: fullName,
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
      
      // Start batch operation for consistency
      const batch = writeBatch(db);
      
      // Log the write operation for user document
      logFirestoreOperation('BATCH WRITE', `users/${user.uid}`, userDocData);
      
      // Add user document to batch
      batch.set(doc(db, 'users', user.uid), userDocData);
      
      // Store referral code in the dedicated referralCodes collection
      const referralCodeData = {
        referrerUid: user.uid,
        createdAt: serverTimestamp(),
        isActive: true,
        userEmail: user.email, // Add email for admin reference/lookup
        usedCount: 0 // Track how many times this code has been used
      };
      
      logFirestoreOperation('BATCH WRITE', `referralCodes/${newReferralCode}`, referralCodeData);
      
      batch.set(doc(db, 'referralCodes', newReferralCode), referralCodeData);
      
      // Update referrer's stats if applicable
      if (referrerUid) {
        logFirestoreOperation('BATCH UPDATE', `users/${referrerUid}`, {
          'referralStats.totalReferrals': increment(1)
        });
        
        batch.update(doc(db, 'users', referrerUid), {
          'referralStats.totalReferrals': increment(1)
        });
        
        // Add to referrer's referrals subcollection (for listing purposes)
        const referralData = {
          userId: user.uid,
          email: user.email,
          displayName: fullName,
          joinedAt: serverTimestamp(),
          activated: false
        };
        
        logFirestoreOperation('BATCH WRITE', `users/${referrerUid}/referrals/${user.uid}`, referralData);
        
        batch.set(doc(db, 'users', referrerUid, 'referrals', user.uid), referralData);
        
        // Increment the usedCount on the referral code
        const referralCodeRef = doc(db, 'referralCodes', referralCode);
        logFirestoreOperation('BATCH UPDATE', `referralCodes/${referralCode}`, {
          usedCount: increment(1),
          lastUsedAt: serverTimestamp()
        });
        
        batch.update(referralCodeRef, {
          usedCount: increment(1),
          lastUsedAt: serverTimestamp()
        });
      }
      
      // Commit all operations in a single batch
      await batch.commit();
      
      return { user, isNewUser: true };
    } catch (error) {
      console.error("Error in registration:", error);
      throw error;
    }
  };
  
  /**
   * Sign in with Google provider
   * @param {string} referralCode - Optional referral code
   * @returns {Promise<Object>} Firebase user and isNewUser flag
   */
  export const signInWithGoogle = async (referralCode = null) => {
    try {
      // Validate referral code if provided
      let referrerUid = null;
      if (referralCode) {
        referrerUid = await validateReferralCode(referralCode);
        if (!referrerUid && referralCode) {
          // If a referral code was provided but is invalid, throw an error
          throw { code: 'invalid-referral-code' };
        }
      }
      
      // Create Google provider
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      const isNewUser = userCredential.additionalUserInfo?.isNewUser || false;
      
      // Check if user document exists
      logFirestoreOperation('READ', `users/${user.uid}`);
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      // If new user, validate referral and create document
      if (!userDoc.exists()) {
        // Generate unique referral code
        const newReferralCode = generateReferralCode(user.uid);
        const referralLink = generateReferralLink(newReferralCode);
        
        // Start batch write for consistency
        const batch = writeBatch(db);
        
        // Create user document
        const userDocData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'User',
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
        
        logFirestoreOperation('BATCH WRITE', `users/${user.uid}`, userDocData);
        batch.set(userDocRef, userDocData);
        
        // Store referral code in the dedicated referralCodes collection
        const referralCodeData = {
          referrerUid: user.uid,
          createdAt: serverTimestamp(),
          isActive: true,
          userEmail: user.email, // Add email for admin reference/lookup
          usedCount: 0 // Track how many times this code has been used
        };
        
        logFirestoreOperation('BATCH WRITE', `referralCodes/${newReferralCode}`, referralCodeData);
        batch.set(doc(db, 'referralCodes', newReferralCode), referralCodeData);
        
        // Update referrer's stats if applicable
        if (referrerUid) {
          logFirestoreOperation('BATCH UPDATE', `users/${referrerUid}`, {
            'referralStats.totalReferrals': increment(1)
          });
          
          batch.update(doc(db, 'users', referrerUid), {
            'referralStats.totalReferrals': increment(1)
          });
          
          // Add to referrer's referrals subcollection
          const referralData = {
            userId: user.uid,
            email: user.email,
            displayName: user.displayName || 'User',
            joinedAt: serverTimestamp(),
            activated: false
          };
          
          logFirestoreOperation('BATCH WRITE', `users/${referrerUid}/referrals/${user.uid}`, referralData);
          batch.set(doc(db, 'users', referrerUid, 'referrals', user.uid), referralData);
          
          // Increment the usedCount on the referral code
          const referralCodeRef = doc(db, 'referralCodes', referralCode);
          logFirestoreOperation('BATCH UPDATE', `referralCodes/${referralCode}`, {
            usedCount: increment(1),
            lastUsedAt: serverTimestamp()
          });
          
          batch.update(referralCodeRef, {
            usedCount: increment(1),
            lastUsedAt: serverTimestamp()
          });
        }
        
        // Commit all the batch operations
        await batch.commit();
        
        return { user, isNewUser: true };
      } else {
        // Existing user, just update lastActive timestamp
        logFirestoreOperation('UPDATE', `users/${user.uid}`, { lastActive: serverTimestamp() });
        
        await updateDoc(userDocRef, {
          lastActive: serverTimestamp()
        });
        
        return { user, isNewUser: false };
      }
    } catch (error) {
      console.error("Error in Google sign in:", error);
      throw error;
    }
  };
  
  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Firebase user object
   */
  export const loginWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update last active timestamp
      logFirestoreOperation('UPDATE', `users/${user.uid}`, { lastActive: serverTimestamp() });
      
      await updateDoc(doc(db, 'users', user.uid), {
        lastActive: serverTimestamp()
      });
      
      return { user };
    } catch (error) {
      console.error("Error in email login:", error);
      throw error;
    }
  };
  
  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  export const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  };
  
  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  export const logout = async () => {
    try {
      const user = auth.currentUser;
      
      // Update last active timestamp before logout
      if (user) {
        logFirestoreOperation('UPDATE', `users/${user.uid}`, { lastActive: serverTimestamp() });
        
        await updateDoc(doc(db, 'users', user.uid), {
          lastActive: serverTimestamp()
        });
      }
      
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };
  
  /**
   * Get user data from Firestore
   * @param {string} uid - User ID
   * @returns {Promise<Object|null>} User data or null if not found
   */
  export const getUserData = async (uid) => {
    try {
      logFirestoreOperation('READ', `users/${uid}`);
      
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return userDoc.data();
      }
      
      return null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  };
  
  /**
   * Update user's account activation status and reward referrer
   * @param {string} uid - User ID to activate
   * @returns {Promise<boolean>} Success flag
   */
  export const activateUserAccount = async (uid) => {
    try {
      // Get user document
      logFirestoreOperation('READ', `users/${uid}`);
      
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) return false;
      
      const userData = userDoc.data();
      
      // Check if already activated
      if (userData.isAccountActivated) return true;
      
      // Use a batch for multiple updates
      const batch = writeBatch(db);
      
      // Update user document
      logFirestoreOperation('BATCH UPDATE', `users/${uid}`, {
        isAccountActivated: true,
        accountActivatedAt: serverTimestamp()
      });
      
      batch.update(userDocRef, {
        isAccountActivated: true,
        accountActivatedAt: serverTimestamp()
      });
      
      // If user was referred, reward the referrer
      if (userData.referredBy) {
        const referrerUid = userData.referredBy;
        const referralReward = 200; // KSh 200 reward
        
        // Update referrer document
        logFirestoreOperation('BATCH UPDATE', `users/${referrerUid}`, {
          'referralStats.activatedReferrals': increment(1),
          availableBalance: increment(referralReward),
          totalEarnings: increment(referralReward)
        });
        
        const referrerDocRef = doc(db, 'users', referrerUid);
        batch.update(referrerDocRef, {
          'referralStats.activatedReferrals': increment(1),
          availableBalance: increment(referralReward),
          totalEarnings: increment(referralReward)
        });
        
        // Update referral status in subcollection
        logFirestoreOperation('BATCH UPDATE', `users/${referrerUid}/referrals/${uid}`, {
          activated: true,
          activatedAt: serverTimestamp(),
          reward: referralReward
        });
        
        const referralDocRef = doc(db, 'users', referrerUid, 'referrals', uid);
        batch.update(referralDocRef, {
          activated: true,
          activatedAt: serverTimestamp(),
          reward: referralReward
        });
        
        // Add transaction record
        const transactionData = {
          type: 'referral_reward',
          amount: referralReward,
          timestamp: serverTimestamp(),
          description: `Referral reward for ${userData.displayName || 'a user'}`,
          status: 'completed',
          referredUserId: uid
        };
        
        // Use a consistent ID for the transaction document - prevents duplicates
        const transactionId = `ref_reward_${uid}`;
        
        logFirestoreOperation('BATCH WRITE', `users/${referrerUid}/transactions/${transactionId}`, transactionData);
        
        const transactionDocRef = doc(db, 'users', referrerUid, 'transactions', transactionId);
        batch.set(transactionDocRef, transactionData);
        
        // Add metrics to a denormalized rewards collection for efficient querying
        // This helps avoid expensive queries across all user documents
        const rewardMetricData = {
          referrerId: referrerUid,
          referredId: uid,
          amount: referralReward,
          timestamp: serverTimestamp(),
          type: 'referral'
        };
        
        logFirestoreOperation('BATCH WRITE', `rewards/${transactionId}`, rewardMetricData);
        
        const rewardMetricDocRef = doc(db, 'rewards', transactionId);
        batch.set(rewardMetricDocRef, rewardMetricData);
      }
      
      // Commit all changes
      await batch.commit();
      
      return true;
    } catch (error) {
      console.error("Error activating user account:", error);
      return false;
    }
  };
  
  /**
   * Get user's referrals
   * @param {string} uid - User ID
   * @returns {Promise<Array>} List of referrals
   */
  export const getUserReferrals = async (uid) => {
    try {
      logFirestoreOperation('READ (collection)', `users/${uid}/referrals`);
      
      const referralsRef = collection(db, 'users', uid, 'referrals');
      const q = query(referralsRef, orderBy('joinedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const referrals = [];
      querySnapshot.forEach((doc) => {
        referrals.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return referrals;
    } catch (error) {
      console.error("Error getting user referrals:", error);
      return [];
    }
  };