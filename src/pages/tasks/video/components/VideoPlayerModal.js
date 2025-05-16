// src/pages/tasks/video/components/VideoPlayerModal.js

import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import './VideoPlayerModal.css';

const VideoPlayerModal = ({ 
  video, 
  onClose, 
  onEnded, 
  onProgress, 
  progress,
  isFinished,
  playerRef
}) => {
  const [canClose, setCanClose] = useState(false);
  
  useEffect(() => {
    // Prevent accidental closing unless finished or enough time passed
    const timer = setTimeout(() => {
      setCanClose(true);
    }, Math.min(10000, video.duration * 1000 * 0.3)); // 30% of video duration or 10 seconds
    
    return () => clearTimeout(timer);
  }, [video.duration]);
  
  const handleProgress = (state) => {
    onProgress(state);
  };
  
  const handleEnded = () => {
    onEnded();
  };
  
  const handleClose = () => {
    if (canClose || isFinished) {
      onClose();
    } else {
      alert('Please watch the video before closing. This ensures you receive your reward.');
    }
  };
  
  // Calculate remaining time in seconds
  const remainingTime = Math.max(0, Math.round(video.duration * (1 - progress)));
  
  // Format to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="player-modal-overlay">
      <div className="player-modal-container">
        <div className="player-modal-header">
          <h3>{video.title}</h3>
          <button 
            className="btn-close-modal" 
            onClick={handleClose}
            disabled={!canClose && !isFinished}
          >
            ✕
          </button>
        </div>
        
        <div className="player-container">
          <ReactPlayer
            ref={playerRef}
            url={video.url}
            width="100%"
            height="100%"
            playing={true}
            controls={false}
            onProgress={handleProgress}
            onEnded={handleEnded}
            progressInterval={1000}
            config={{
              youtube: {
                playerVars: { 
                  modestbranding: 1,
                  controls: 0,
                  disablekb: 1,
                  rel: 0
                }
              },
              vimeo: {
                playerOptions: {
                  controls: false,
                  keyboard: false
                }
              }
            }}
          />
        </div>
        
        <div className="player-progress">
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progress * 100}%` }}
            ></div>
          </div>
          
          <div className="progress-info">
            <div className="watch-percentage">
              {Math.round(progress * 100)}% complete
            </div>
            <div className="remaining-time">
              {isFinished ? 'Video complete!' : `${formatTime(remainingTime)} remaining`}
            </div>
          </div>
          
          <div className="player-instruction">
            <div className="instruction-icon">ℹ️</div>
            <div className="instruction-text">
              Please watch the entire video without switching tabs to earn 
              <span className="reward-highlight"> KSh {video.reward}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerModal;