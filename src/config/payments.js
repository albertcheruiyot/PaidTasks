// src/config/payments.js

// Load the API key from environment variables
const INTASEND_PUBLIC_KEY = process.env.REACT_APP_INTASEND_PUBLIC_KEY;
const INTASEND_LIVE_MODE = process.env.REACT_APP_ENV === 'production';

export {
  INTASEND_PUBLIC_KEY,
  INTASEND_LIVE_MODE
};