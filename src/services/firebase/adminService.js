// src/services/firebase/adminService.js

import { 
    doc, 
    collection, 
    getDocs, 
    getDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    updateDoc,
    deleteDoc,
    setDoc,
    writeBatch,
    serverTimestamp,
    increment
  } from 'firebase/firestore';
  import { db } from '../../config/firebase';
  
  // Log Firestore operations in development
  const logFirestoreOperation = (operation, path, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Firestore ${operation}:`, path, data ? data : '');
    }
  };
  
  /**
   * Get all referral codes, with optional filtering and pagination
   * @param {Object} options - Query options
   * @param {Boolean} options.activeOnly - Only return active referral codes
   * @param {Number} options.limitCount - Maximum number of records to return
   * @param {String} options.lastDocId - Last document ID for pagination
   * @returns {Promise<Array>} List of referral codes
   */
  export const getReferralCodes = async (options = {}) => {
    try {
      const { activeOnly = true, limitCount = 50, lastDocId = null } = options;
      
      // Start building the query
      let referralCodesRef = collection(db, 'referralCodes');
      let constraints = [];
      
      // Add filter for active only
      if (activeOnly) {
        constraints.push(where('isActive', '==', true));
      }
      
      // Add ordering
      constraints.push(orderBy('createdAt', 'desc'));
      
      // Add limit
      constraints.push(limit(limitCount));
      
      // Create and execute the query
      logFirestoreOperation('READ (query)', 'referralCodes collection', constraints);
      
      const q = query(referralCodesRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      // Map the results
      const referralCodes = [];
      querySnapshot.forEach((doc) => {
        referralCodes.push({
          code: doc.id,
          ...doc.data()
        });
      });
      
      return referralCodes;
    } catch (error) {
      console.error("Error getting referral codes:", error);
      return [];
    }
  };
  
  /**
   * Get details about a specific referral code
   * @param {String} code - The referral code to look up
   * @returns {Promise<Object|null>} Referral code data or null if not found
   */
  export const getReferralCodeDetails = async (code) => {
    try {
      logFirestoreOperation('READ', `referralCodes/${code}`);
      
      const referralCodeDoc = await getDoc(doc(db, 'referralCodes', code));
      
      if (!referralCodeDoc.exists()) {
        return null;
      }
      
      const referralData = referralCodeDoc.data();
      
      // Get referrer info
      let referrerData = null;
      if (referralData.referrerUid) {
        logFirestoreOperation('READ', `users/${referralData.referrerUid}`);
        
        const referrerDoc = await getDoc(doc(db, 'users', referralData.referrerUid));
        if (referrerDoc.exists()) {
          const userData = referrerDoc.data();
          referrerData = {
            uid: referralData.referrerUid,
            displayName: userData.displayName,
            email: userData.email
          };
        }
      }
      
      // Get count of users who used this code
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referredBy', '==', referralData.referrerUid));
      
      logFirestoreOperation('READ (query)', 'users collection', `where referredBy == ${referralData.referrerUid}`);
      
      const usersSnapshot = await getDocs(q);
      const userCount = usersSnapshot.size;
      
      return {
        code,
        ...referralData,
        referrer: referrerData,
        usedCount: userCount
      };
    } catch (error) {
      console.error("Error getting referral code details:", error);
      return null;
    }
  };
  
  /**
   * Deactivate a referral code
   * @param {String} code - The referral code to deactivate
   * @returns {Promise<Boolean>} Success status
   */
  export const deactivateReferralCode = async (code) => {
    try {
      logFirestoreOperation('UPDATE', `referralCodes/${code}`, {
        isActive: false,
        updatedAt: serverTimestamp()
      });
      
      await updateDoc(doc(db, 'referralCodes', code), {
        isActive: false,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error("Error deactivating referral code:", error);
      return false;
    }
  };
  
  /**
   * Create a new manual referral code for a user
   * @param {String} userId - The user ID to create a code for
   * @param {String} customCode - Optional custom code (defaults to auto-generated)
   * @returns {Promise<Object|null>} The new referral code or null on failure
   */
  export const createManualReferralCode = async (userId, customCode = null) => {
    try {
      // Verify user exists
      logFirestoreOperation('READ', `users/${userId}`);
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error("User not found");
      }
      
      const userData = userDoc.data();
      
      // Generate or use custom code
      const referralCode = customCode || `${userData.displayName.substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // Check if code already exists
      logFirestoreOperation('READ', `referralCodes/${referralCode}`);
      
      const existingCodeDoc = await getDoc(doc(db, 'referralCodes', referralCode));
      if (existingCodeDoc.exists()) {
        throw new Error("Referral code already exists");
      }
      
      // Store the new code
      const referralData = {
        referrerUid: userId,
        createdAt: serverTimestamp(),
        isActive: true,
        userEmail: userData.email,
        isManuallyCreated: true
      };
      
      logFirestoreOperation('WRITE', `referralCodes/${referralCode}`, referralData);
      
      await setDoc(doc(db, 'referralCodes', referralCode), referralData);
      
      return {
        code: referralCode,
        ...referralData
      };
    } catch (error) {
      console.error("Error creating manual referral code:", error);
      return null;
    }
  };
  
  /**
   * Clean up unused referral codes older than a certain date
   * This is an admin-only function that should be used carefully
   * @param {Number} daysOld - Delete codes older than this many days
   * @returns {Promise<Number>} Number of deleted codes
   */
  export const cleanupOldReferralCodes = async (daysOld = 180) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      // Get old unused codes
      const referralCodesRef = collection(db, 'referralCodes');
      const q = query(
        referralCodesRef,
        where('createdAt', '<', cutoffDate),
        where('usedCount', '==', 0),
        limit(500) // Process in batches for safety
      );
      
      logFirestoreOperation('READ (query)', 'referralCodes collection', `for cleanup (${daysOld} days old)`);
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return 0;
      }
      
      // Batch delete the old codes
      const batch = writeBatch(db);
      let count = 0;
      
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
        count++;
      });
      
      logFirestoreOperation('BATCH DELETE', `${count} old referral codes`);
      
      await batch.commit();
      
      return count;
    } catch (error) {
      console.error("Error cleaning up old referral codes:", error);
      return 0;
    }
  };
  
  export default {
    getReferralCodes,
    getReferralCodeDetails,
    deactivateReferralCode,
    createManualReferralCode,
    cleanupOldReferralCodes
  };