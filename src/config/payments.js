// src/config/payments.js

// Always use production for IntaSend to avoid sandbox 500 errors
const INTASEND_PUBLIC_KEY = "ISPubKey_live_d4a72af2-73d6-40c2-92e8-083cf04c87c6"; // Replace with your actual production key
const INTASEND_LIVE_MODE = true; // Always true for production

export {
  INTASEND_PUBLIC_KEY,
  INTASEND_LIVE_MODE
};