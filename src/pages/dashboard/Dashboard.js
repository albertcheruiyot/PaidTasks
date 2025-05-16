// src/pages/dashboard/Dashboard.js

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Wheel } from 'react-custom-roulette';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  increment, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, userData, refreshUserData, showNotification } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [timeUntilNextSpin, setTimeUntilNextSpin] = useState(null);
  const [recentSpins, setRecentSpins] = useState([]);
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Wheel component states
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  
  // Refs
  const timerRef = useRef(null);
  const referralLinkRef = useRef(null);
  const spinDataRef = useRef(null);
  const unsubscribeRefs = useRef({});
  
  // Wheel configuration
  const spinValues = [10, 50, 100, 250, 500, 750, 1000, 1500, 2000];
  const wheelData = spinValues.map(value => ({ option: value.toString() }));
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (currentUser) {
          // Set up real-time listener for spin wheel data - only one listener
          const spinDocRef = doc(db, `users/${currentUser.uid}/stats/spinWheel`);
          
          // Reuse existing data if we have it
          if (!spinDataRef.current) {
            // Initial fetch to avoid waiting for listener
            try {
              const spinDoc = await getDoc(spinDocRef);
              if (spinDoc.exists()) {
                processSpinData(spinDoc.data());
              }
            } catch (err) {
              console.error("Error in initial spin data fetch:", err);
            }
          }
          
          // Set up listener if not already active
          if (!unsubscribeRefs.current.spinListener) {
            unsubscribeRefs.current.spinListener = onSnapshot(spinDocRef, (docSnapshot) => {
              if (docSnapshot.exists()) {
                const spinData = docSnapshot.data();
                spinDataRef.current = spinData;
                processSpinData(spinData);
              }
              
              setLoading(false);
            }, (error) => {
              console.error("Error in spin wheel data listener:", error);
              setLoading(false);
            });
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please refresh the page.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Clean up all listeners and timers on unmount
    return () => {
      Object.values(unsubscribeRefs.current).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentUser]);
  
  // Process spin data (extracted to reduce duplication)
  const processSpinData = (spinData) => {
    if (!spinData) return;
    
    // Check if user has already claimed today's spin
    if (spinData.lastSpin) {
      const lastSpinDate = spinData.lastSpin.toDate();
      const now = new Date();
      
      // Reset time to start of day for comparison
      const lastSpinDay = new Date(
        lastSpinDate.getFullYear(),
        lastSpinDate.getMonth(),
        lastSpinDate.getDate()
      ).getTime();
      
      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ).getTime();
      
      // If last spin was today, calculate time until tomorrow
      if (lastSpinDay === today) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const timeLeft = tomorrow.getTime() - now.getTime();
        setTimeUntilNextSpin(timeLeft);
        
        // Start timer
        startCountdownTimer(timeLeft);
      } else {
        // Reset timer if it's a new day
        setTimeUntilNextSpin(null);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    }
    
    // Get recent spins
    if (spinData.recentSpins) {
      setRecentSpins(spinData.recentSpins);
    }
  };
  
  // Start countdown timer
  const startCountdownTimer = (timeLeft) => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Set initial time
    setTimeUntilNextSpin(timeLeft);
    
    // Start interval
    timerRef.current = setInterval(() => {
      setTimeUntilNextSpin((prevTime) => {
        // Decrease by 1 second
        const newTime = prevTime - 1000;
        
        // Clear interval if time is up
        if (newTime <= 0) {
          clearInterval(timerRef.current);
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
  };
  
  // Format time for display
  const formatTimeLeft = (ms) => {
    if (!ms) return '00:00:00';
    
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Handle spin wheel
  const handleSpin = () => {
    if (spinning) return;
    
    setSpinning(true);
    
    // Determine if this is first spin (for new users)
    const isFirstSpin = !userData.firstSpinCompleted;
    
    // For first-time users, ensure a high reward (1000, 1500, or 2000)
    let winningIndex;
    
    if (isFirstSpin) {
      // Get indices of high values
      const highValueIndices = spinValues
        .map((value, index) => ({ value, index }))
        .filter(item => [1000, 1500, 2000].includes(item.value))
        .map(item => item.index);
      
      // Randomly select one high value index
      winningIndex = highValueIndices[Math.floor(Math.random() * highValueIndices.length)];
    } else {
      // Truly random for returning users
      winningIndex = Math.floor(Math.random() * spinValues.length);
    }
    
    // Set the prize number and start spinning
    setPrizeNumber(winningIndex);
    setMustSpin(true);
  };
  
  // Handle when the wheel stops spinning
  const handleSpinStop = async () => {
    try {
      // Get the winning value
      const winningValue = spinValues[prizeNumber];
      
      // Show result
      setSpinResult({
        amount: winningValue,
        timestamp: new Date()
      });
      
      // Update user's balance and spin data in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      const spinRef = doc(db, `users/${currentUser.uid}/stats/spinWheel`);
      
      // Get current date formatted as string for recent spins log
      const now = new Date();
      const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
      
      // Create new spin record
      const newSpin = {
        amount: winningValue,
        date: formattedDate,
        timestamp: now
      };
      
      // Update user data
      await updateDoc(userRef, {
        availableBalance: increment(winningValue),
        totalEarnings: increment(winningValue),
        firstSpinCompleted: true
      });
      
      // Get current spin data (using our cached copy to reduce reads)
      const existingSpinData = spinDataRef.current;
      
      let recentSpinsList = [];
      
      if (existingSpinData) {
        // Get existing recent spins
        recentSpinsList = existingSpinData.recentSpins || [];
        
        // Add new spin to the beginning of the array
        recentSpinsList.unshift(newSpin);
        
        // Keep only the last 5 spins to save storage
        if (recentSpinsList.length > 5) {
          recentSpinsList = recentSpinsList.slice(0, 5);
        }
        
        // Update spin document
        await updateDoc(spinRef, {
          lastSpin: serverTimestamp(),
          recentSpins: recentSpinsList,
          totalSpins: increment(1)
        });
      } else {
        // Create new spin document
        await setDoc(spinRef, {
          lastSpin: serverTimestamp(),
          recentSpins: [newSpin],
          totalSpins: 1
        });
        
        recentSpinsList = [newSpin];
      }
      
      // Explicitly refresh user data after win (only once)
      await refreshUserData();
      
      // FIX: Manually update spin data in local state to lock out further spins immediately
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const timeLeft = tomorrow.getTime() - now.getTime();
      
      // Update the local state to reflect that a spin was just used
      setTimeUntilNextSpin(timeLeft);
      setRecentSpins(recentSpinsList);
      
      // Update spinDataRef to include latest spin
      if (spinDataRef.current) {
        spinDataRef.current = {
          ...spinDataRef.current,
          lastSpin: { seconds: Math.floor(now.getTime() / 1000), toDate: () => now },
          recentSpins: recentSpinsList,
          totalSpins: (spinDataRef.current.totalSpins || 0) + 1
        };
      } else {
        spinDataRef.current = {
          lastSpin: { seconds: Math.floor(now.getTime() / 1000), toDate: () => now },
          recentSpins: recentSpinsList,
          totalSpins: 1
        };
      }
      
      // Also restart the countdown timer
      startCountdownTimer(timeLeft);
      
      // Show notification
      showNotification({
        type: 'success',
        message: `Congratulations! You won KSh ${winningValue}!`
      });
      
      // Reset spinning state
      setSpinning(false);
      setMustSpin(false);
      
    } catch (err) {
      console.error('Error processing spin:', err);
      setSpinning(false);
      setMustSpin(false);
      setError('Failed to process your spin. Please try again.');
    }
  };
  
  // Handle copying referral link
  const handleCopyClick = () => {
    if (!userData?.referralLink) return;
    
    const linkToCopy = userData.referralLink;
    
    // Use Clipboard API
    navigator.clipboard.writeText(linkToCopy)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        
        // Fallback selection method
        if (referralLinkRef.current) {
          referralLinkRef.current.select();
          document.execCommand('copy');
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 3000);
        }
      });
  };
  
  // Handle sharing on social media
  const handleShareClick = (platform) => {
    if (!userData?.referralLink) return;
    
    const shareMessage = `Join me on PaidTasks and earn money by completing simple online tasks! Use my referral link: ${userData.referralLink}`;
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(userData.referralLink)}&quote=${encodeURIComponent("Join me on PaidTasks!")}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
        break;
      default:
        return;
    }
    
    // Open share window
    window.open(shareUrl, '_blank', 'width=600,height=450');
  };
  
  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Welcome, {userData?.displayName || 'User'}</h1>
        <p>Your earning dashboard</p>
      </div>
      
      {/* Main Balance Card */}
      <div className="balance-card">
        <div className="balance-card-content">
          <span className="balance-label">Available Balance</span>
          <h2 className="balance-amount">KSh {userData?.availableBalance || 0}</h2>
          <Link to="/wallet" className="balance-link">View wallet details →</Link>
        </div>
        <div className="balance-icon">💰</div>
      </div>
      
      {/* Daily Spin Wheel */}
      <div className="spin-wheel-container">
        
        
        {timeUntilNextSpin && timeUntilNextSpin > 0 ? (
          <div className="next-spin-timer">
            <h2>Daily Spin Wheel</h2>
            <p className="spin-instructions">Spin the wheel once daily to win KSh 10 - KSh 2,000!</p>
            <h3>Next spin available in</h3>
            <div className="countdown-timer">{formatTimeLeft(timeUntilNextSpin)}</div>
            
            {recentSpins.length > 0 && (
              <div className="recent-spins">
                <h4>Recent Wins</h4>
                <div className="recent-spins-list">
                  {recentSpins.map((spin, index) => (
                    <div className="recent-spin-item" key={index}>
                      <span className="recent-spin-date">{spin.date}</span>
                      <span className="recent-spin-amount">KSh {spin.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="spin-wheel-section">
            <h2>Daily Spin Wheel</h2>
            <p className="spin-instructions">Spin the wheel once daily to win KSh 10 - KSh 2,000!</p>
            <div className="wheel-container">
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={wheelData}
                onStopSpinning={handleSpinStop}
                backgroundColors={['#2563EB', '#7C3AED']}
                textColors={['#ffffff']}
                fontSize={24}
                fontWeight={700}
                outerBorderColor={'#f9fafb'}
                outerBorderWidth={5}
                innerBorderColor={'#f1f5f9'}
                innerBorderWidth={15}
                radiusLineColor={'rgba(255,255,255,0.2)'}
                radiusLineWidth={2}
                perpendicularText={false}
                textDistance={75}
              />
              <div className="wheel-pointer"></div>
            </div>
            
            <button 
              className="btn btn-spin" 
              onClick={handleSpin}
              disabled={spinning}
            >
              {spinning ? 'Spinning...' : 'SPIN NOW'}
            </button>
            
            {spinResult && (
              <div className="spin-result">
                <h3>You Won!</h3>
                <div className="winning-amount">KSh {spinResult.amount}</div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Task Cards */}
      <div className="task-cards-container fade-in-up">
        <h2>Start Earning Now</h2>
        <div className="task-cards">
          <Link to="/tasks/videos" className="task-card video-tasks">
            <div className="task-card-icon">🎥</div>
            <div className="task-card-content">
              <h3>Video Tasks</h3>
              <p>Watch videos and earn up to KSh 50 per video</p>
              <div className="task-card-footer">
                <span className="task-action">Start Watching →</span>
              </div>
            </div>
          </Link>
          
          <Link to="/tasks/surveys" className="task-card survey-tasks">
            <div className="task-card-icon">📝</div>
            <div className="task-card-content">
              <h3>Survey Tasks</h3>
              <p>Complete surveys and earn up to KSh 200 per survey</p>
              <div className="task-card-footer">
                <span className="task-action">Start Surveys →</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Referral Banner */}
      <div className="referral-banner fade-in-up">
        <div className="referral-banner-content">
          <div className="referral-icon">👥</div>
          <div className="referral-info">
            <h3>Invite Friends & Earn More</h3>
            <p className="referral-tagline">Earn KSh 200 for each friend who joins!</p>
            
            <div className="referral-actions">
              <div className="referral-link-container">
                <input 
                  type="text" 
                  readOnly 
                  value={userData?.referralLink || ''}
                  className="referral-link-input"
                  ref={referralLinkRef}
                  onClick={handleCopyClick}
                />
                <button 
                  className={`referral-copy-btn ${linkCopied ? 'copied' : ''}`}
                  onClick={handleCopyClick}
                >
                  {linkCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              
              <div className="referral-social">
                <button className="social-share-btn whatsapp" onClick={() => handleShareClick('whatsapp')}>
                  Share to WhatsApp
                </button>
                <button className="social-share-btn facebook" onClick={() => handleShareClick('facebook')}>
                  Share to Facebook
                </button>
                <button className="social-share-btn twitter" onClick={() => handleShareClick('twitter')}>
                  Share to Twitter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;