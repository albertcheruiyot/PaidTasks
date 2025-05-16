// src/pages/tasks/video/components/VideoTaskCard.js

import React from 'react';
import './VideoTaskCard.css';

const VideoTaskCard = ({ video, onWatch, watched }) => {
  // Format duration as MM:SS
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className={`video-card ${watched ? 'video-watched' : ''}`}>
      <div className="video-thumbnail">
        <img 
          src={video.thumbnailUrl || 'https://via.placeholder.com/320x180?text=Video+Task'} 
          alt={video.title} 
          loading="lazy"
        />
        <div className="video-duration">{formatDuration(video.duration)}</div>
        
        {watched && (
          <div className="watched-badge">
            <span className="watched-icon">✓</span>
            Completed
          </div>
        )}
      </div>
      
      <div className="video-content">
        <h3 className="video-title">{video.title}</h3>
        <p className="video-description">{video.description}</p>
        
        <div className="video-meta">
          <div className="video-source">
            <span className="source-icon">
              {video.url.includes('youtube') ? '📹' : 
               video.url.includes('vimeo') ? '🎬' : '🎥'}
            </span>
            {video.url.includes('youtube') ? 'YouTube' : 
             video.url.includes('vimeo') ? 'Vimeo' : 'Video'}
          </div>
          
          <div className="video-category">{video.category}</div>
        </div>
      </div>
      
      <div className="video-action">
        <div className="video-reward">
          <span className="reward-label">Reward</span>
          <span className="reward-amount">KSh {video.reward}</span>
        </div>
        
        <button 
          className={`btn-watch ${watched ? 'btn-watched' : ''}`}
          onClick={onWatch}
          disabled={watched}
        >
          {watched ? (
            <>
              <span className="btn-icon">✓</span>
              Completed
            </>
          ) : (
            <>
              <span className="btn-icon">▶</span>
              Watch & Earn
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default VideoTaskCard;