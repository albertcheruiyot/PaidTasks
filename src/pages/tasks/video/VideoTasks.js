// src/pages/tasks/video/VideoTasks.js

import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  arrayUnion, 
  increment, 
  serverTimestamp,
  doc,
  addDoc
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../context/AuthContext';
import ReactPlayer from 'react-player';
import VideoTaskCard from './components/VideoTaskCard';
import VideoPlayerModal from './components/VideoPlayerModal';
import SuccessModal from './components/SuccessModal';
import AddVideoForm from './components/AddVideoForm';
import './VideoTasks.css';

const VideoTasks = () => {
  const { currentUser, userData, refreshUserData, showNotification } = useAuth();
  const [videoTasks, setVideoTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [earnedAmount, setEarnedAmount] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [videoFinished, setVideoFinished] = useState(false);
  
  // Track if user is trying to cheat by switching tabs
  const playerRef = useRef(null);
  const tabVisibleRef = useRef(true);
  
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // Log the Firestore read operation
        console.log('Firestore READ: videos collection');
        
        // Create a query for active videos
        const videosRef = collection(db, 'videos');
        const q = query(videosRef, where('active', '==', true));
        
        // Get the videos
        const querySnapshot = await getDocs(q);
        const videos = [];
        
        querySnapshot.forEach((doc) => {
          videos.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Sort by reward amount, highest first
        videos.sort((a, b) => b.reward - a.reward);
        
        // Show all videos, including watched ones
        setVideoTasks(videos);
        
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load video tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideos();
    
    // Add visibility change event listener to detect tab switching
    const handleVisibilityChange = () => {
      tabVisibleRef.current = document.visibilityState === 'visible';
      
      // If video is playing and user switches tabs, reset progress
      if (!tabVisibleRef.current && activeVideo && showPlayer) {
        setWatchProgress(0);
        showNotification({
          type: 'warning',
          message: 'Please keep this tab open while watching the video!'
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userData, currentUser]);
  
  const handleWatchVideo = (video) => {
    // Check if user has already watched this video
    if (userData?.watchedVideos?.includes(video.id)) {
      showNotification({
        type: 'info',
        message: 'You have already completed this video task.'
      });
      return;
    }
    
    setActiveVideo(video);
    setShowPlayer(true);
    setWatchProgress(0);
    setVideoFinished(false);
  };
  
  const handleClosePlayer = () => {
    setShowPlayer(false);
    setActiveVideo(null);
    setWatchProgress(0);
    setVideoFinished(false);
  };
  
  const handleVideoProgress = (progress) => {
    // Only update if tab is visible to prevent cheating
    if (tabVisibleRef.current) {
      setWatchProgress(progress.played);
      
      // Mark as finished if watched at least 95% (to account for video duration inaccuracies)
      if (progress.played >= 0.95 && !videoFinished) {
        setVideoFinished(true);
      }
    }
  };
  
  const handleVideoEnded = async () => {
    try {
      if (!activeVideo || !currentUser) return;
      
      // Close the player
      setShowPlayer(false);
      
      // Update user document
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Log the Firestore write operation
      console.log('Firestore WRITE:', `users/${currentUser.uid}`, {
        'watchedVideos': arrayUnion(activeVideo.id),
        'availableBalance': increment(activeVideo.reward),
        'totalEarnings': increment(activeVideo.reward),
        'completedTasks': increment(1),
        'lastActive': serverTimestamp()
      });
      
      await updateDoc(userRef, {
        // Add only the ID to watched videos array
        watchedVideos: arrayUnion(activeVideo.id),
        // Add reward to balance
        availableBalance: increment(activeVideo.reward),
        // Add to total earnings
        totalEarnings: increment(activeVideo.reward),
        // Increment completed tasks
        completedTasks: increment(1),
        // Update last active timestamp
        lastActive: serverTimestamp()
      });
      
      // Add to video views subcollection for analytics
      const viewsRef = collection(db, 'videos', activeVideo.id, 'views');
      
      // Log the Firestore write operation
      console.log('Firestore WRITE:', `videos/${activeVideo.id}/views/[new-doc]`, {
        userId: currentUser.uid,
        timestamp: serverTimestamp(),
        rewardPaid: activeVideo.reward
      });
      
      await addDoc(viewsRef, {
        userId: currentUser.uid,
        timestamp: serverTimestamp(),
        rewardPaid: activeVideo.reward
      });
      
      // Set earned amount for success modal
      setEarnedAmount(activeVideo.reward);
      
      // Show success animation
      setShowSuccessModal(true);
      
      // Refresh user data
      await refreshUserData();
      
      // Show notification
      showNotification({
        type: 'success',
        message: `You earned KSh ${activeVideo.reward} for watching the video!`
      });
      
      // Reset progress
      setWatchProgress(0);
      setVideoFinished(false);
      
      // Hide success modal after delay
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3500);
      
    } catch (err) {
      console.error('Error rewarding user:', err);
      showNotification({
        type: 'error',
        message: 'An error occurred. Please try again.'
      });
    }
  };
  
  const handleSubmitVideo = async (videoData) => {
    try {
      // Log the Firestore write operation
      console.log('Firestore WRITE: videos collection', videoData);
      
      const videosRef = collection(db, 'videos');
      await addDoc(videosRef, {
        ...videoData,
        active: true,
        createdAt: serverTimestamp(),
        views: 0
      });
      
      // Show success message
      showNotification({
        type: 'success',
        message: 'Video submitted successfully!'
      });
      
      // Refresh videos list
      setLoading(true);
      // Use the existing videosRef variable instead of redeclaring it
      const q = query(videosRef, where('active', '==', true));
      
      // Log the Firestore read operation
      console.log('Firestore READ: videos collection');
      
      const querySnapshot = await getDocs(q);
      const videos = [];
      
      querySnapshot.forEach((doc) => {
        videos.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort by reward amount, highest first
      videos.sort((a, b) => b.reward - a.reward);
      
      // Show all videos
      setVideoTasks(videos);
      
      setLoading(false);
      setShowAddForm(false);
    } catch (err) {
      console.error('Error submitting video:', err);
      showNotification({
        type: 'error',
        message: 'Failed to submit video. Please try again.'
      });
    }
  };
  
  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading video tasks...</p>
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
      <div className="video-header">
        <div className="video-header-content">
          <h1>Video Tasks <span role="img" aria-label="video">🎬</span></h1>
          <p>Watch videos to earn rewards. Each video can only be watched once.</p>
        </div>
        
        <div className="video-stats">
          <div className="video-stat-item">
            <div className="stat-value">{videoTasks.length}</div>
            <div className="stat-label">Available Videos</div>
          </div>
          
          <div className="video-stat-item">
            <div className="stat-value">
              {userData?.watchedVideos?.length || 0}
            </div>
            <div className="stat-label">Completed</div>
          </div>
          
          <div className="video-stat-item">
            <div className="stat-value">
              {videoTasks.reduce((sum, task) => 
                userData?.watchedVideos?.includes(task.id) ? sum + task.reward : sum, 0)}
              <span className="currency">KSh</span>
            </div>
            <div className="stat-label">Earned</div>
          </div>
        </div>
      </div>
      
      {videoTasks.length === 0 ? (
        <div className="no-videos">
          <div className="no-videos-icon">📺</div>
          <h2>No Videos Available</h2>
          <p>There are currently no video tasks available. Please check back later.</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="video-grid">
          {videoTasks.map(video => (
            <VideoTaskCard
              key={video.id}
              video={video}
              onWatch={() => handleWatchVideo(video)}
              watched={userData?.watchedVideos?.includes(video.id)}
            />
          ))}
        </div>
      )}
      
      {/* Video task info section */}
      <div className="video-info-section">
        <h3>How Video Tasks Work</h3>
        <div className="info-content">
          <div className="info-item">
            <div className="info-icon">👀</div>
            <div className="info-text">
              <h4>Watch the Full Video</h4>
              <p>You must watch the entire video without switching tabs to earn your reward.</p>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-icon">🎯</div>
            <div className="info-text">
              <h4>One-Time Rewards</h4>
              <p>Each video can only be watched and rewarded once. New videos are added regularly.</p>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-icon">💰</div>
            <div className="info-text">
              <h4>Instant Earnings</h4>
              <p>Rewards are automatically added to your account balance upon completion.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add video form toggle button */}
      <div className="add-video-section">
        <button 
          className="btn-add-video"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Submit New Video'}
        </button>
        
        {showAddForm && (
          <div className="add-video-form-container">
            <h3>Submit a New Video</h3>
            <AddVideoForm onSubmit={handleSubmitVideo} />
          </div>
        )}
      </div>
      
      {/* Video player modal */}
      {showPlayer && activeVideo && (
        <VideoPlayerModal
          video={activeVideo}
          onClose={handleClosePlayer}
          onEnded={handleVideoEnded}
          onProgress={handleVideoProgress}
          progress={watchProgress}
          isFinished={videoFinished}
          playerRef={playerRef}
        />
      )}
      
      {/* Success modal */}
      {showSuccessModal && (
        <SuccessModal
          amount={earnedAmount}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default VideoTasks;