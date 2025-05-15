// src/pages/referral/Referral.js

import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import './Referral.css';

const Referral = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    const fetchUserAndReferrals = async () => {
      try {
        if (currentUser) {
          // Fetch user data
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
            
            // Fetch referrals
            const referralsRef = collection(db, 'users');
            const q = query(
              referralsRef,
              where('referredBy', '==', currentUser.uid)
            );
            
            const querySnapshot = await getDocs(q);
            const referralsList = [];
            
            querySnapshot.forEach((doc) => {
              referralsList.push({
                id: doc.id,
                ...doc.data()
              });
            });
            
            setReferrals(referralsList);
          } else {
            setError('User data not found');
          }
        }
      } catch (err) {
        console.error('Error fetching user data and referrals:', err);
        setError('Failed to load referral data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndReferrals();
  }, [currentUser]);
  
  const copyReferralLink = () => {
    if (userData?.referralLink) {
      navigator.clipboard.writeText(userData.referralLink)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        })
        .catch((err) => {
          console.error('Failed to copy text', err);
        });
    }
  };
  
  const shareOnWhatsApp = () => {
    if (userData?.referralLink) {
      const message = `Join me on PaidTasks and earn money by completing simple online tasks! Use my referral link: ${userData.referralLink}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };
  
  const shareOnFacebook = () => {
    if (userData?.referralLink) {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(userData.referralLink)}`;
      window.open(facebookUrl, '_blank');
    }
  };
  
  const shareOnTwitter = () => {
    if (userData?.referralLink) {
      const message = `Join me on PaidTasks and earn money by completing simple online tasks! Use my referral link: ${userData.referralLink}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
      window.open(twitterUrl, '_blank');
    }
  };
  
  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading referral data...</p>
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
      <div className="referral-header">
        <h1>Refer Friends, Earn Money</h1>
        <p>Earn KSh 200 for each friend who joins and activates their account!</p>
      </div>
      
      <div className="referral-stats-container">
        <div className="referral-stat-card">
          <div className="referral-stat-icon">👥</div>
          <div className="referral-stat-content">
            <h3>Total Referrals</h3>
            <p className="referral-stat-value">{userData?.referralStats?.totalReferrals || 0}</p>
          </div>
        </div>
        
        <div className="referral-stat-card">
          <div className="referral-stat-icon">✅</div>
          <div className="referral-stat-content">
            <h3>Activated Referrals</h3>
            <p className="referral-stat-value">{userData?.referralStats?.activatedReferrals || 0}</p>
          </div>
        </div>
        
        <div className="referral-stat-card">
          <div className="referral-stat-icon">💰</div>
          <div className="referral-stat-content">
            <h3>Earnings from Referrals</h3>
            <p className="referral-stat-value">KSh {(userData?.referralStats?.activatedReferrals || 0) * 200}</p>
          </div>
        </div>
      </div>
      
      <div className="referral-link-section">
        <h2>Your Referral Link</h2>
        <div className="referral-link-container">
          <input 
            type="text" 
            value={userData?.referralLink || ''} 
            className="referral-link-input" 
            readOnly 
          />
          <button 
            className={`btn ${copied ? 'btn-success' : 'btn-primary'}`} 
            onClick={copyReferralLink}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
        
        <div className="referral-code">
          <p>Or share your referral code: <strong>{userData?.referralCode}</strong></p>
        </div>
      </div>
      
      <div className="share-section">
        <h2>Share with Friends</h2>
        <div className="share-buttons">
          <button className="btn btn-whatsapp" onClick={shareOnWhatsApp}>
            <i className="fab fa-whatsapp"></i> WhatsApp
          </button>
          <button className="btn btn-facebook" onClick={shareOnFacebook}>
            <i className="fab fa-facebook"></i> Facebook
          </button>
          <button className="btn btn-twitter" onClick={shareOnTwitter}>
            <i className="fab fa-twitter"></i> Twitter
          </button>
        </div>
      </div>
      
      {referrals.length > 0 ? (
        <div className="referrals-list-section">
          <h2>Your Referrals</h2>
          <div className="referrals-list">
            <div className="referrals-header">
              <div className="referral-name">Name</div>
              <div className="referral-date">Joined On</div>
              <div className="referral-status">Status</div>
              <div className="referral-reward">Reward</div>
            </div>
            
            {referrals.map((referral) => {
              const joinDate = referral.createdAt ? new Date(referral.createdAt.seconds * 1000) : null;
              const formattedDate = joinDate ? joinDate.toLocaleDateString() : 'Unknown';
              const isActivated = referral.isAccountActivated;
              
              return (
                <div key={referral.id} className="referral-item">
                  <div className="referral-name">{referral.displayName}</div>
                  <div className="referral-date">{formattedDate}</div>
                  <div className="referral-status">
                    <span className={`status-badge ${isActivated ? 'active' : 'pending'}`}>
                      {isActivated ? 'Activated' : 'Pending'}
                    </span>
                  </div>
                  <div className="referral-reward">
                    {isActivated ? 'KSh 200' : '-'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="no-referrals">
          <h2>No Referrals Yet</h2>
          <p>Share your referral link to start earning!</p>
        </div>
      )}
      
      <div className="referral-note">
        <h3>How Referrals Work</h3>
        <ul>
          <li>Share your unique referral link with friends</li>
          <li>When they sign up using your link, they become your referral</li>
          <li>You earn KSh 200 when they activate their account (complete their first task)</li>
          <li>Your referral also gets a signup bonus!</li>
        </ul>
      </div>
    </div>
  );
};

export default Referral;