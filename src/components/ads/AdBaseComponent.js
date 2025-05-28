// src/components/ads/AdBaseComponent.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { safeLoadScript, shouldShowAds } from './AdUtils';
import './AdsteraAds.css';

/**
 * Higher-order component for creating ad components
 * @param {Object} config - Ad configuration
 * @returns {React.Component} - Ad component
 */
export const createAdComponent = (config) => {
  const { 
    scriptSrc, 
    componentName = 'AdComponent', 
    minReferrals = 10,
    scriptOptions = {},
    renderContent = () => null
  } = config;

  return function AdComponent() {
    const { userData } = useAuth();
    const [adLoaded, setAdLoaded] = useState(false);
    const [adError, setAdError] = useState(false);

    useEffect(() => {
      // Check if ads should be shown based on referral count
      const canShowAds = shouldShowAds(userData, minReferrals);

      // Load script if conditions are met
      const loadAdScript = async () => {
        if (!canShowAds) return;

        try {
          const success = await safeLoadScript(scriptSrc, scriptOptions);
          setAdLoaded(success);
          setAdError(!success);
        } catch (error) {
          console.error(`${componentName} script load failed:`, error);
          setAdError(true);
          setAdLoaded(false);
        }
      };

      loadAdScript();
    }, [userData]);

    // Don't render anything if user doesn't meet referral requirement or ad failed to load
    if (!shouldShowAds(userData, minReferrals) || adError) {
      return null;
    }

    return (
      <div className={`adstera-${componentName.toLowerCase()}-container`}>
        {adLoaded && renderContent()}
      </div>
    );
  };
}