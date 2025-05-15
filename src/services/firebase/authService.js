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
    setDoc, a
    updateDoc, 
    increment,
    collection, 
    query, 
    where, 
    getDocs,
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
   * Validate referral code exists
   * @param {string} referralCode - Referral code to validate
   * @returns {Promise<string|null>} Referrer user ID or null if not found
   */
  const validateReferralCode = async (referralCode) => {
    try {
      if (!referralCode) return null;
      
      // Log the read operation
      logFirestoreOperation('READ (query)', 'users collection', `where referralCode == ${referralCode}`);
      
      // Query users by referral code
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', referralCode));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;
      
      // Return the referrer's user ID
      return querySnapshot.docs[0].id;
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
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update displayName in Auth profile
      await updateProfile(user, {
        displayName: fullName
      });
      
      // Validate referral code if provided
      let referrerUid = null;
      if (referralCode) {
        referrerUid = await validateReferralCode(referralCode);
      }
      
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
      
      // Log the write operation
      logFirestoreOperation('WRITE', `users/${user.uid}`, userDocData);
      
      // Save user document
      await setDoc(doc(db, 'users', user.uid), userDocData);
      
      // Update referrer's stats if applicable
      if (referrerUid) {
        // Use transaction to update referrer's stats to ensure consistency
        logFirestoreOperation('TRANSACTION', `users/${referrerUid}`, 'Update referral stats');
        
        await runTransaction(db, async (transaction) => {
          const referrerDocRef = doc(db, 'users', referrerUid);
          const referrerDoc = await transaction.get(referrerDocRef);
          
          if (!referrerDoc.exists()) {
            throw new Error("Referrer document does not exist!");
          }
          
          // Increment total referrals counter
          transaction.update(referrerDocRef, {
            'referralStats.totalReferrals': increment(1)
          });
        });
        
        // Add to referrer's referrals subcollection (for listing purposes)
        const referralData = {
          userId: user.uid,
          email: user.email,
          displayName: fullName,
          joinedAt: serverTimestamp(),
          activated: false
        };
        
        logFirestoreOperation('WRITE', `users/${referrerUid}/referrals/${user.uid}`, referralData);
        
        await setDoc(
          doc(db, 'users', referrerUid, 'referrals', user.uid),
          referralData
        );
      }
      
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
      // Create Google provider
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Check if user document exists
      logFirestoreOperation('READ', `users/${user.uid}`);
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      // If new user, validate referral and create document
      if (!userDoc.exists()) {
        // Validate referral code if provided
        let referrerUid = null;
        if (referralCode) {
          referrerUid = await validateReferralCode(referralCode);
        }
        
        // Generate unique referral code
        const newReferralCode = generateReferralCode(user.uid);
        const referralLink = generateReferralLink(newReferralCode);
        
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
        
        logFirestoreOperation('WRITE', `users/${user.uid}`, userDocData);
        
        await setDoc(userDocRef, userDocData);
        
        // Update referrer's stats if applicable
        if (referrerUid) {
          logFirestoreOperation('TRANSACTION', `users/${referrerUid}`, 'Update referral stats');
          
          await runTransaction(db, async (transaction) => {
            const referrerDocRef = doc(db, 'users', referrerUid);
            const referrerDoc = await transaction.get(referrerDocRef);
            
            if (!referrerDoc.exists()) {
              throw new Error("Referrer document does not exist!");
            }
            
            // Increment total referrals counter
            transaction.update(referrerDocRef, {
              'referralStats.totalReferrals': increment(1)
            });
          });
          
          // Add to referrer's referrals subcollection
          const referralData = {
            userId: user.uid,
            email: user.email,
            displayName: user.displayName || 'User',
            joinedAt: serverTimestamp(),
            activated: false
          };
          
          logFirestoreOperation('WRITE', `users/${referrerUid}/referrals/${user.uid}`, referralData);
          
          await setDoc(
            doc(db, 'users', referrerUid, 'referrals', user.uid),
            referralData
          );
        }
        
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
        
        logFirestoreOperation('BATCH WRITE', `users/${referrerUid}/transactions/${uid}`, transactionData);
        
        const transactionDocRef = doc(db, 'users', referrerUid, 'transactions', uid);
        batch.set(transactionDocRef, transactionData);
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