// src/pages/tasks/video/VideoTasks.js

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../context/AuthContext';
import './VideoTasks.css';

const VideoTasks = () => {
  const { currentUser } = useAuth();
  const [videoTasks, setVideoTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchVideoTasks = async () => {
      try {
        // Create a query against the 'tasks/videos' collection
        const videosRef = collection(db, 'tasks/videos/items');
        const q = query(
          videosRef,
          // Filter for active tasks only
          where('active', '==', true),
          // Sort by reward amount, highest first
          orderBy('reward', 'desc'),
          // Limit to 10 results
          limit(10)
        );
        
        // Get the documents
        const querySnapshot = await getDocs(q);
        const tasks = [];
        
        querySnapshot.forEach((doc) => {
          tasks.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setVideoTasks(tasks);
      } catch (err) {
        console.error('Error fetching video tasks:', err);
        setError('Failed to load video tasks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideoTasks();
  }, []);
  
  // This would be a real implementation for watching a video and earning rewards
  const handleWatchVideo = (taskId) => {
    // In a real app, this would navigate to a video player page
    // and handle reward verification after watching
    console.log(`Watching video task: ${taskId}`);
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
      <div className="tasks-header">
        <h1>Video Tasks</h1>
        <p>Watch videos and earn rewards. Each video can only be watched once.</p>
      </div>
      
      {videoTasks.length === 0 ? (
        <div className="no-tasks">
          <h2>No Video Tasks Available</h2>
          <p>Check back later for new video tasks!</p>
        </div>
      ) : (
        <div className="video-tasks-container">
          {videoTasks.map((task) => (
            <div key={task.id} className="video-task-card">
              <div className="video-task-thumbnail">
                <img 
                  src={task.thumbnailUrl || '/default-thumbnail.jpg'} 
                  alt={task.title} 
                />
                <div className="video-duration">{task.duration}s</div>
              </div>
              <div className="video-task-content">
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <div className="video-task-details">
                  <div className="video-reward">
                    <span className="reward-label">Reward:</span>
                    <span className="reward-amount">KSh {task.reward}</span>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleWatchVideo(task.id)}
                  >
                    Watch Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="task-note">
        <h3>How Video Tasks Work</h3>
        <ul>
          <li>Watch the entire video to earn your reward</li>
          <li>You must keep the tab active during the video</li>
          <li>Each video can only be watched once</li>
          <li>Rewards are automatically credited to your account</li>
        </ul>
      </div>
    </div>
  );
};

export default VideoTasks;