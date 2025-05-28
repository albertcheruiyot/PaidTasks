// src/components/ads/AdUtils.js

/**
 * Safe script loader with comprehensive error handling
 * @param {string} src - Script source URL
 * @param {Object} options - Additional script options
 * @returns {Promise<boolean>} - Resolves to true if script loaded successfully
 */
export const safeLoadScript = (src, options = {}) => {
    return new Promise((resolve, reject) => {
      // Prevent multiple script loads
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve(true);
        return;
      }
  
      try {
        const script = document.createElement('script');
        script.src = src;
        script.async = options.async ?? true;
        
        // Set additional attributes if provided
        if (options.attrs) {
          Object.entries(options.attrs).forEach(([key, value]) => {
            script.setAttribute(key, value);
          });
        }
  
        // Success handler
        script.onload = () => {
          console.log(`Script loaded successfully: ${src}`);
          resolve(true);
        };
  
        // Error handler
        script.onerror = (error) => {
          console.error(`Failed to load script: ${src}`, error);
          reject(false);
        };
  
        // Timeout handler
        const timeout = setTimeout(() => {
          console.warn(`Script load timed out: ${src}`);
          script.remove();
          reject(false);
        }, options.timeout || 10000);
  
        // Clear timeout on load/error
        script.addEventListener('load', () => clearTimeout(timeout));
        script.addEventListener('error', () => clearTimeout(timeout));
  
        // Add script to document
        document.body.appendChild(script);
      } catch (error) {
        console.error('Error in safeLoadScript:', error);
        reject(false);
      }
    });
  };
  
  /**
   * Safely execute a function with error handling
   * @param {Function} fn - Function to execute
   * @param {string} errorMessage - Custom error message
   * @returns {*} - Result of the function or null
   */
  export const safeExecute = (fn, errorMessage = 'Execution failed') => {
    try {
      return fn();
    } catch (error) {
      console.error(errorMessage, error);
      return null;
    }
  };
  
  /**
   * Check if ads should be displayed based on referral count
   * @param {Object} userData - User data object
   * @param {number} minReferrals - Minimum required referrals
   * @returns {boolean} - Whether ads should be shown
   */
  export const shouldShowAds = (userData, minReferrals = 10) => {
    try {
      return userData?.referralStats?.activatedReferrals >= minReferrals;
    } catch (error) {
      console.error('Error checking ad visibility:', error);
      return false;
    }
  };