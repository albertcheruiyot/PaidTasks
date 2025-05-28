// src/pages/profile/Profile.js

import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

import { 
  AdsteraBanner, 
  AdsteraNativeBanner, 
  AdsteraSocial, 
  AdsteraPopunder 
} from '../../components/ads';

const Profile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states
  const [displayName, setDisplayName] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserData(data);
            setDisplayName(data.displayName || '');
          } else {
            setError('User data not found');
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser]);
  
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setUpdateError('Name cannot be empty');
      return;
    }
    
    try {
      setUpdateLoading(true);
      setUpdateError(null);
      setUpdateSuccess(false);
      
      // Update Firestore user document
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: displayName.trim()
      });
      
      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: displayName.trim()
      });
      
      // Update local state
      setUserData({
        ...userData,
        displayName: displayName.trim()
      });
      
      setUpdateSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setUpdateError('Failed to update profile. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading profile data...</p>
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
      <div className="profile-header">
        <h1>Profile</h1>
        <p>Manage your account details</p>
      </div>
      
      <div className="profile-content">
        <div className="profile-section">
          <div className="profile-info">
            <div className="profile-avatar">
              {userData?.profilePicture ? (
                <img 
                  src={userData.profilePicture} 
                  alt={userData.displayName || 'User'} 
                />
              ) : (
                <div className="avatar-placeholder">
                  {(userData?.displayName || '?')[0].toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="profile-details">
              <h2>{userData?.displayName}</h2>
              <p className="profile-email">{userData?.email}</p>
              <p className="profile-joined">
                Joined: {userData?.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
          
          <div className="profile-edit">
            <h3>Edit Profile</h3>
            
            {updateSuccess && (
              <div className="success-message">
                Profile updated successfully!
              </div>
            )}
            
            {updateError && (
              <div className="error-message">
                {updateError}
              </div>
            )}
            
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-group">
                <label htmlFor="displayName" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="displayName"
                  className="form-control"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your full name"
                  disabled={updateLoading}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={userData?.email || ''}
                  readOnly
                  disabled
                />
                <small className="text-gray-500">Email cannot be changed</small>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={updateLoading}
              >
                {updateLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>
        
        <div className="profile-section">
          <h3>Account Status</h3>
          <div className="account-status">
            <div className="status-item">
              <div className="status-label">Account Type:</div>
              <div className="status-value">
                <span className={`status-badge ${userData?.isVip ? 'status-vip' : 'status-standard'}`}>
                  {userData?.isVip ? 'VIP' : 'Standard'}
                </span>
              </div>
            </div>
            
            <div className="status-item">
              <div className="status-label">Activation Status:</div>
              <div className="status-value">
                <span className={`status-badge ${userData?.isAccountActivated ? 'status-active' : 'status-pending'}`}>
                  {userData?.isAccountActivated ? 'Activated' : 'Not Activated'}
                </span>
              </div>
            </div>
            
            {!userData?.isAccountActivated && (
              <div className="activation-note">
                Complete your first task to activate your account and start earning real money!
              </div>
            )}
          </div>
        </div>
        
        <div className="profile-section">
          <h3>Referral Information</h3>
          <div className="referral-info">
            <div className="info-item">
              <div className="info-label">Your Referral Code:</div>
              <div className="info-value">{userData?.referralCode}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Total Referrals:</div>
              <div className="info-value">{userData?.referralStats?.totalReferrals || 0}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Activated Referrals:</div>
              <div className="info-value">{userData?.referralStats?.activatedReferrals || 0}</div>
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/referrals'}
            >
              Manage Referrals
            </button>
          </div>
        </div>
        
        <div className="profile-section">
          <h3>Account Security</h3>
          <div className="security-options">
            <button className="btn btn-secondary">Change Password</button>
            <button className="btn btn-danger">Delete Account</button>
          </div>
        </div>
      </div>
      <AdsteraBanner />
      <AdsteraNativeBanner />
      <AdsteraSocial />
      <AdsteraPopunder />
    </div>
  );
};

export default Profile;