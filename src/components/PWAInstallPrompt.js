import React, { useState, useEffect } from 'react';
import './PWAInstallPrompt.css';

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAndroid, setIsAndroid] = useState(false);
  const [installAttempted, setInstallAttempted] = useState(false);

  useEffect(() => {
    // Comprehensive device and installation detection
    const checkInstallEligibility = () => {
      // Detailed Android detection
      const isAndroidDevice = /Android/i.test(navigator.userAgent);
      
      // Standalone check
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      
      // Check if app is already installed
      const appInstalled = localStorage.getItem('app-installed') === 'true';
      
      // Comprehensive eligibility check
      return (
        isAndroidDevice && 
        !isStandalone && 
        !appInstalled
      );
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      
      // Check eligibility and show prompt
      if (checkInstallEligibility()) {
        // Small delay to ensure smooth rendering
        setTimeout(() => {
          setShowPrompt(true);
        }, 500);
      }
    };

    // Add event listener
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Initial check
    setIsAndroid(checkInstallEligibility());

    // Clean up event listener
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Effect to periodically check and show prompt if not installed
  useEffect(() => {
    const checkAndShowPrompt = () => {
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      
      const appInstalled = localStorage.getItem('app-installed') === 'true';
      
      if (!isStandalone && !appInstalled && isAndroid) {
        setShowPrompt(true);
      }
    };

    // Check every 5 minutes
    const intervalId = setInterval(checkAndShowPrompt, 5 * 60 * 1000);

    // Initial check
    checkAndShowPrompt();

    return () => clearInterval(intervalId);
  }, [isAndroid]);

  const handleInstall = async () => {
    setInstallAttempted(true);

    if (deferredPrompt) {
      try {
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          // Mark as installed
          localStorage.setItem('app-installed', 'true');
          
          // Trigger app-wide notification
          const event = new CustomEvent('app-install-success');
          window.dispatchEvent(event);

          // Hide prompt
          setShowPrompt(false);
        } else {
          // If not accepted, keep the prompt visible
          console.log('User dismissed the install prompt');
        }
      } catch (error) {
        console.error('Installation failed', error);
      }
    }
  };

  // Create a method to manually trigger the prompt
  const retryInstall = () => {
    if (deferredPrompt) {
      handleInstall();
    } else {
      // If prompt is lost, reload to trigger beforeinstallprompt
      window.location.reload();
    }
  };

  // Don't render if not applicable
  if (!isAndroid || !showPrompt) return null;

  return (
    <div className="pwa-install-overlay">
      <div className="pwa-install-modal">
        <div className="pwa-install-content">
          <div className="pwa-install-icon">💰</div>
          <h2>Install PaidTasks</h2>
          <p>Install to start making money online instantly!</p>
          
          {installAttempted ? (
            <div className="install-retry">
              <p>Installation not completed. Did you miss the prompt?</p>
              <button 
                className="pwa-retry-btn" 
                onClick={retryInstall}
              >
                Try Installing Again
              </button>
            </div>
          ) : (
            <button 
              className="pwa-install-btn" 
              onClick={handleInstall}
            >
              Install Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;