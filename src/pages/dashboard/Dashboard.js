// src/pages/dashboard/Dashboard.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
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
        <h1>Welcome, {userData?.displayName}!</h1>
        <p>Here's your earning summary and available tasks.</p>
      </div>
      
      {!userData?.isAccountActivated && (
        <div className="activation-notice">
          <h3>Activate Your Account</h3>
          <p>Complete your first task to activate your account and start earning real money!</p>
          <Link to="/tasks/videos" className="btn btn-primary">Start with Video Tasks</Link>
        </div>
      )}
      
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Available Balance</h3>
            <p className="stat-value">KSh {userData?.availableBalance || 0}</p>
            <Link to="/wallet" className="stat-link">Withdraw</Link>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Earnings</h3>
            <p className="stat-value">KSh {userData?.totalEarnings || 0}</p>
            <span className="stat-description">Lifetime earnings</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Completed Tasks</h3>
            <p className="stat-value">{userData?.completedTasks || 0}</p>
            <span className="stat-description">Tasks completed</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Referrals</h3>
            <p className="stat-value">{userData?.referralStats?.totalReferrals || 0}</p>
            <Link to="/referrals" className="stat-link">Invite Friends</Link>
          </div>
        </div>
      </div>
      
      <div className="tasks-section">
        <h2>Available Tasks</h2>
        <div className="tasks-grid">
          <div className="task-card">
            <div className="task-icon">🎥</div>
            <h3>Watch Videos</h3>
            <p>Earn by watching short videos and ads</p>
            <Link to="/tasks/videos" className="btn btn-primary">Start Task</Link>
          </div>
          
          <div className="task-card">
            <div className="task-icon">📝</div>
            <h3>Complete Surveys</h3>
            <p>Share your opinion and get rewarded</p>
            <Link to="/tasks/surveys" className="btn btn-primary">Start Task</Link>
          </div>
          
          <div className="task-card">
            <div className="task-icon">👥</div>
            <h3>Refer Friends</h3>
            <p>Earn KSh 200 for each activated referral</p>
            <Link to="/referrals" className="btn btn-primary">Invite Now</Link>
          </div>
        </div>
      </div>
      
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {/* This would be populated with real activity data from Firestore */}
        <div className="activity-empty">
          <p>No recent activity to show</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;