const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();
const REFERRAL_REWARD = 200; // KSh for referral rewards

/**
 * Firebase Cloud Function that handles IntaSend payment webhooks
 * This gets triggered when IntaSend sends a payment callback
 */
exports.handleIntaSendPayment = functions.https.onRequest((req, res) => {
  // Use CORS middleware
  return cors(req, res, async () => {
    try {
      // Log the full request for debugging
      console.log("Received webhook from IntaSend:", {
        body: req.body,
        headers: req.headers,
        method: req.method,
      });

      // Validate IntaSend challenge key from BODY
      const intaSendChallenge = req.body.challenge;
      const expectedChallenge = "12345678";

      if (intaSendChallenge !== expectedChallenge) {
        console.error("Invalid IntaSend challenge key", {
          received: intaSendChallenge,
          expected: expectedChallenge,
        });
        return res.status(401).send("Unauthorized");
      }

      const paymentData = req.body;

      // Log detailed payment data
      console.log("Processing payment data:", {
        invoice_id: paymentData.invoice_id,
        state: paymentData.state,
        api_ref: paymentData.api_ref,
        metadata: paymentData.metadata,
      });

      // Handle different payment states
      if (paymentData.state === "COMPLETE") {
        // Extract user ID - Try multiple approaches
        let userId = null;

        // Approach 1: Try to parse metadata if it exists as a string
        if (paymentData.metadata) {
          try {
            // Check if metadata is a string that needs parsing
            if (typeof paymentData.metadata === "string") {
              const parsedMetadata = JSON.parse(paymentData.metadata);
              if (parsedMetadata.userId) {
                userId = parsedMetadata.userId;
                console.log(`Found user ID in parsed metadata: ${userId}`);
              }
            }
            // Check if metadata is already an object
            else if (typeof paymentData.metadata === "object" && paymentData.metadata.userId) {
              userId = paymentData.metadata.userId;
              console.log(`Found user ID in metadata object: ${userId}`);
            }
          } catch (err) {
            console.error("Error parsing metadata:", err);
          }
        }

        // Approach 2: Extract from api_ref if it has the format account_activation_USER_ID
        if (!userId && paymentData.api_ref && paymentData.api_ref.startsWith("account_activation_")) {
          const parts = paymentData.api_ref.split("_");
          if (parts.length >= 3) {
            userId = parts[2];
            console.log(`Extracted user ID from api_ref: ${userId}`);
          }
        }

        // Approach 3: Try to use customer_id directly
        if (!userId && paymentData.customer_id) {
          userId = paymentData.customer_id;
          console.log(`Found user ID in customer_id: ${userId}`);
        }

        // Approach 4: Look for user with matching transaction ID in pending_activations collection
        if (!userId && paymentData.invoice_id) {
          try {
            // Query pending_activations collection for this transaction
            const pendingActivationsRef = db.collection("pending_activations");
            const snapshot = await pendingActivationsRef
              .doc(paymentData.invoice_id)
              .get();

            if (snapshot.exists) {
              userId = snapshot.data().userId;
              console.log(`Found user ID in pending_activations: ${userId}`);
            }
          } catch (err) {
            console.error("Error checking pending activations:", err);
          }
        }

        if (!userId) {
          console.error("User ID not found in payment data");
          console.error("Full payment data:", paymentData);
          return res.status(200).send("Webhook received, but couldn't determine user ID");
        }

        console.log(`Attempting to activate account for user ID: ${userId}`);

        // Process the account activation
        const success = await activateUserAccount(userId, paymentData);

        if (success) {
          // Clean up pending activation
          if (paymentData.invoice_id) {
            try {
              const pendingRef = db.collection("pending_activations").doc(paymentData.invoice_id);
              const pendingDoc = await pendingRef.get();
              if (pendingDoc.exists) {
                await pendingRef.delete();
                console.log(`Deleted pending activation for ${paymentData.invoice_id}`);
              }
            } catch (err) {
              console.error("Error cleaning up pending activation:", err);
            }
          }

          console.log(`Successfully activated account for user ${userId}`);
          return res.status(200).send("Account activation successful");
        } else {
          console.error(`Failed to activate account for user ${userId}`);
          return res.status(200).send("Failed to activate account, but received webhook");
        }
      }
      else if (paymentData.state === "FAILED" || paymentData.state === "CANCELLED") {
        console.log(`Payment ${paymentData.state}:`, paymentData);

        // Log failed payment for analysis
        try {
          await db.collection("failed_payments").doc(paymentData.invoice_id || `failed_${Date.now()}`).set({
            paymentData: paymentData,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            webhookReceived: true,
          });
          console.log(`Logged failed payment for analysis: ${paymentData.invoice_id}`);
        } catch (err) {
          console.error("Error logging failed payment:", err);
        }

        // Clean up any pending activation
        if (paymentData.invoice_id) {
          try {
            const pendingRef = db.collection("pending_activations").doc(paymentData.invoice_id);
            const pendingDoc = await pendingRef.get();
            if (pendingDoc.exists) {
              await pendingRef.delete();
              console.log(`Cleaned up pending activation for ${paymentData.state} payment ${paymentData.invoice_id}`);
            }
          } catch (err) {
            console.error(`Error cleaning up pending activation for ${paymentData.state} payment:`, err);
          }
        }

        return res.status(200).send(`Payment ${paymentData.state.toLowerCase()} webhook received`);
      }
      else if (paymentData.state === "PENDING" || paymentData.state === "PROCESSING") {
        // For states that might still succeed, just acknowledge
        console.log(`Payment in ${paymentData.state} state, waiting for completion`);
        return res.status(200).send(`Payment ${paymentData.state.toLowerCase()} webhook received`);
      }
      else {
        // For unknown states, log and acknowledge
        console.log(`Unknown payment state: ${paymentData.state}`);
        return res.status(200).send("Webhook received for unknown payment state");
      }
    } catch (error) {
      console.error("Error processing IntaSend webhook:", error);
      return res.status(200).send("Error processed");
    }
  });
});

/**
 * Activate a user account and handle referral rewards
 * @param {string} userId - The user's Firebase UID
 * @param {Object} paymentData - Payment details from IntaSend
 * @return {Promise<boolean>} Success status
 */
async function activateUserAccount(userId, paymentData) {
  console.log(`Starting account activation for ${userId}...`);
  const userRef = db.collection("users").doc(userId);

  try {
    // First check if user exists
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      console.error(`User document not found: ${userId}`);
      return false;
    }

    const userData = userDoc.data();
    console.log(`Found user data for ${userId}: ${userData.displayName || "Unknown"}`);

    // Skip if already activated
    if (userData.isAccountActivated) {
      console.log(`User ${userId} already activated`);
      return true;
    }

    // Save referral data outside the transaction
    const referrerId = userData.referredBy;
    let referrerDoc = null;
    let referralDoc = null;

    // Perform all reads BEFORE starting the transaction
    if (referrerId) {
      console.log(`Checking referrer data for ${referrerId}`);
      const referrerRef = db.collection("users").doc(referrerId);
      referrerDoc = await referrerRef.get();

      if (referrerDoc.exists) {
        const referralRef = db.collection("users").doc(referrerId)
          .collection("referrals").doc(userId);
        referralDoc = await referralRef.get();
      }
    }

    // Use a transaction to ensure data consistency
    return await db.runTransaction(async (transaction) => {
      // Update user's activation status
      transaction.update(userRef, {
        "isAccountActivated": true,
        "accountActivatedAt": admin.firestore.FieldValue.serverTimestamp(),
        "activationPayment": {
          "paymentId": paymentData.invoice_id,
          "paymentAmount": paymentData.value || "300",
          "paymentMethod": paymentData.provider || "M-PESA",
          "paymentStatus": "completed",
          "paymentTimestamp": admin.firestore.FieldValue.serverTimestamp(),
        },
      });

      console.log(`User ${userId} activation status updated`);

      // Record the transaction
      const transactionId = paymentData.invoice_id || `activation_${Date.now()}`;
      const transactionRef = db.collection("users").doc(userId)
        .collection("transactions").doc(transactionId);

      transaction.set(transactionRef, {
        "type": "account_activation",
        "amount": parseFloat(paymentData.value || "300"),
        "timestamp": admin.firestore.FieldValue.serverTimestamp(),
        "status": "completed",
        "method": paymentData.provider || "M-PESA",
        "description": "Freelance merchant account activation payment",
      });

      console.log(`Transaction record created for ${userId}`);

      // Process referral reward if user was referred and we have valid referrer data
      if (referrerId && referrerDoc && referrerDoc.exists) {
        console.log(`Processing referral reward for referrer ${referrerId}`);

        const referrerRef = db.collection("users").doc(referrerId);

        // Update referrer document
        transaction.update(referrerRef, {
          "referralStats.activatedReferrals": admin.firestore.FieldValue.increment(1),
          "availableBalance": admin.firestore.FieldValue.increment(REFERRAL_REWARD),
          "totalEarnings": admin.firestore.FieldValue.increment(REFERRAL_REWARD),
        });

        console.log(`Referrer ${referrerId} stats updated`);

        // Update referral record in subcollection if it exists
        if (referralDoc && referralDoc.exists) {
          const referralRef = db.collection("users").doc(referrerId)
            .collection("referrals").doc(userId);

          transaction.update(referralRef, {
            "activated": true,
            "activatedAt": admin.firestore.FieldValue.serverTimestamp(),
            "reward": REFERRAL_REWARD,
          });

          console.log(`Referral record updated for ${userId} in referrer ${referrerId}`);

          // Add reward transaction record
          const rewardTransactionId = `ref_reward_${userId}`;
          const rewardTransactionRef = db.collection("users").doc(referrerId)
            .collection("transactions").doc(rewardTransactionId);

          transaction.set(rewardTransactionRef, {
            "type": "referral_reward",
            "amount": REFERRAL_REWARD,
            "timestamp": admin.firestore.FieldValue.serverTimestamp(),
            "description": `Referral reward for ${userData.displayName || "a user"}`,
            "status": "completed",
            "referredUserId": userId,
          });

          console.log(`Referral reward transaction created for ${referrerId}`);
        } else {
          console.log(`Referral record not found for ${userId} in referrer ${referrerId}`);
        }
      } else if (referrerId) {
        console.log(`Referrer ${referrerId} not found or invalid`);
      } else {
        console.log(`User ${userId} was not referred by anyone`);
      }

      console.log(`Successfully completed account activation transaction for user ${userId}`);
      return true;
    });
  } catch (error) {
    console.error(`Error in activation for user ${userId}:`, error);
    return false;
  }
}

/**
 * Cloud Function to clean up stale pending activations
 * Runs daily to remove any pending activations that are older than 1 hour
 */
exports.cleanupStalePendingActivations = functions.scheduler.onSchedule({
  schedule: "every 24 hours",
  timeZone: "Africa/Nairobi", // Adjust to your preferred timezone
}, async (_context) => {
  try {
    console.log("Starting cleanup of stale pending activations");

    // Get pending activations older than 1 hour
    const cutoffTime = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - (60 * 60 * 1000)), // 1 hour ago
    );

    const pendingRef = db.collection("pending_activations");
    const snapshot = await pendingRef
      .where("timestamp", "<", cutoffTime)
      .get();

    if (snapshot.empty) {
      console.log("No stale pending activations found");
      return null;
    }

    // Delete stale records in batches to optimize Firestore operations
    const batchSize = 500; // Firestore batch limit is 500
    const batches = [];
    let currentBatch = db.batch();
    let operationCount = 0;

    snapshot.forEach(doc => {
      currentBatch.delete(doc.ref);
      operationCount++;

      if (operationCount >= batchSize) {
        batches.push(currentBatch);
        currentBatch = db.batch();
        operationCount = 0;
      }
    });

    // Push the last batch if it has operations
    if (operationCount > 0) {
      batches.push(currentBatch);
    }

    // Commit all batches
    const results = await Promise.all(batches.map(batch => batch.commit()));
    console.log(`Cleaned up ${snapshot.size} stale pending activations in ${results.length} batches`);

    return null;
  } catch (error) {
    console.error("Error cleaning up stale pending activations:", error);
    return null;
  }
});

/**
 * Function to clean up old failed payment records
 * Keeps only the last 1000 records to optimize storage costs
 */
exports.cleanupOldFailedPayments = functions.scheduler.onSchedule({
  schedule: "every 168 hours",
  timeZone: "Africa/Nairobi", // Adjust to your preferred timezone
}, async (_context) => {
  try {
    console.log("Starting cleanup of old failed payment records");

    const failedPaymentsRef = db.collection("failed_payments");
    const snapshot = await failedPaymentsRef
      .orderBy("timestamp", "desc")
      .limit(1001)
      .get();

    if (snapshot.size <= 1000) {
      console.log("Less than 1000 failed payment records, no cleanup needed");
      return null;
    }

    // Get the records to delete (skip the first 1000)
    const records = snapshot.docs.slice(1000);

    // Delete old records in batches
    const batchSize = 500;
    const batches = [];
    let currentBatch = db.batch();
    let operationCount = 0;

    records.forEach(doc => {
      currentBatch.delete(doc.ref);
      operationCount++;

      if (operationCount >= batchSize) {
        batches.push(currentBatch);
        currentBatch = db.batch();
        operationCount = 0;
      }
    });

    // Push the last batch if it has operations
    if (operationCount > 0) {
      batches.push(currentBatch);
    }

    // Commit all batches
    await Promise.all(batches.map(batch => batch.commit()));
    console.log(`Cleaned up ${records.length} old failed payment records`);

    return null;
  } catch (error) {
    console.error("Error cleaning up old failed payment records:", error);
    return null;
  }
});
